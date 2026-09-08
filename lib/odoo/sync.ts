import { eq, like } from "drizzle-orm";
import { db } from "../db";
import { products } from "../db/schema";
import { odooSearchReadAll, odooServerVersion } from "./client";
import { mapTemplate, type OdooProductTemplate } from "./mapper";
import { imageFingerprint, uploadProductImage } from "./images";

const ODOO_ID_PREFIX = "odoo-";
const UPLOAD_CONCURRENCY = 8;

export type SyncResult = {
  odooVersion?: string;
  odooSerie?: string;
  templates: number;
  created: number;
  updated: number;
  imageErrors: number;
  outOfStock: number;
  total: number;
};

const TEMPLATE_FIELDS = [
  "id",
  "name",
  "default_code",
  "list_price",
  "categ_id",
  "description_sale",
  "description",
  "sale_ok",
  "active",
  "image_1920",
] as const;

type OdooVariant = { id: number; product_tmpl_id: [number, string] };
type OdooQuant = {
  product_id: [number, string] | number;
  quantity: number | string;
  reserved_quantity: number | string;
};

async function fetchStockByTemplate(): Promise<Map<number, number>> {
  const variants = await odooSearchReadAll<OdooVariant>(
    "product.product",
    [["active", "=", true]],
    ["id", "product_tmpl_id"]
  );
  const templateOfVariant = new Map<number, number>();
  for (const variant of variants) {
    if (Array.isArray(variant.product_tmpl_id)) {
      templateOfVariant.set(variant.id, variant.product_tmpl_id[0]);
    }
  }

  const quants = await odooSearchReadAll<OdooQuant>(
    "stock.quant",
    [["location_id.usage", "=", "internal"]],
    ["product_id", "quantity", "reserved_quantity"]
  );

  const stockByTemplate = new Map<number, number>();
  for (const quant of quants) {
    const variantId = Array.isArray(quant.product_id)
      ? quant.product_id[0]
      : quant.product_id;
    const templateId = templateOfVariant.get(variantId);
    if (templateId === undefined) continue;
    const freeQty =
      Number(quant.quantity || 0) - Number(quant.reserved_quantity || 0);
    stockByTemplate.set(
      templateId,
      (stockByTemplate.get(templateId) || 0) + freeQty
    );
  }
  return stockByTemplate;
}

type ImageJob = {
  id: string;
  odooId: number;
  slug: string;
  base64: string;
};

async function runWithConcurrency<T>(
  jobs: T[],
  worker: (job: T, index: number) => Promise<void>,
  concurrency = UPLOAD_CONCURRENCY
): Promise<void> {
  let next = 0;
  const total = jobs.length;
  const runOne = async () => {
    while (next < total) {
      const index = next++;
      await worker(jobs[index], index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, total) }, () => runOne())
  );
}

export async function syncFromOdoo(): Promise<SyncResult> {
  const version = await odooServerVersion();
  console.log(`[sync] connected (${version?.server_version || "?"})`);

  const templates = await odooSearchReadAll<OdooProductTemplate>(
    "product.template",
    [
      ["sale_ok", "=", true],
      ["active", "=", true],
    ],
    [...TEMPLATE_FIELDS]
  );
  console.log(`[sync] fetched ${templates.length} templates`);

  const stockByTemplate = await fetchStockByTemplate();
  console.log("[sync] fetched stock.quant data");

  const existing = await db
    .select({ id: products.id, image: products.image })
    .from(products)
    .where(like(products.id, `${ODOO_ID_PREFIX}%`));
  const existingById = new Map(existing.map((row) => [row.id, row]));
  console.log(`[sync] existing odoo products: ${existing.length}`);

  const seenSlugs = new Map<string, number>();
  const syncedIds = new Set<string>();
  const imageJobs: ImageJob[] = [];
  const mapped = new Map<string, ReturnType<typeof mapTemplate>>();

  for (const template of templates) {
    const item = mapTemplate(template, seenSlugs, {
      stock: stockByTemplate.get(template.id) ?? 0,
    });
    const id = `${ODOO_ID_PREFIX}${template.id}`;
    syncedIds.add(id);
    mapped.set(id, item);

    const existingRow = existingById.get(id);
    if (item.imageBase64) {
      const fingerprint = imageFingerprint(item.imageBase64);
      const unchanged =
        fingerprint !== null &&
        existingRow?.image?.includes(`-${fingerprint.hash}.${fingerprint.ext}`);
      if (!unchanged) {
        imageJobs.push({
          id,
          odooId: template.id,
          slug: item.slug,
          base64: item.imageBase64,
        });
      }
    }
  }
  console.log(`[sync] ${imageJobs.length} images need uploading`);

  const uploadedUrl = new Map<string, string>();
  let imageErrors = 0;

  if (imageJobs.length > 0) {
    const start = Date.now();
    await runWithConcurrency(imageJobs, async (job, index) => {
      const url = await uploadProductImage({
        odooId: job.odooId,
        slug: job.slug,
        base64: job.base64,
      });
      if (url) {
        uploadedUrl.set(job.id, url);
      } else {
        imageErrors += 1;
      }
      if ((index + 1) % 100 === 0 || index + 1 === imageJobs.length) {
        console.log(
          `[sync] images uploaded ${index + 1}/${imageJobs.length} (${Math.round(
            (Date.now() - start) / 1000
          )}s)`
        );
      }
    });
    console.log("[sync] image upload pass complete");
  }

  let created = 0;
  let updated = 0;
  for (const template of templates) {
    const id = `${ODOO_ID_PREFIX}${template.id}`;
    const item = mapped.get(id)!;
    const existingRow = existingById.get(id);

    let image = "/images/box.png";
    const newUrl = uploadedUrl.get(id);
    if (newUrl) {
      image = newUrl;
    } else if (item.imageBase64) {
      if (existingRow?.image) {
        const fingerprint = imageFingerprint(item.imageBase64);
        const unchanged =
          fingerprint !== null &&
          existingRow.image.includes(`-${fingerprint.hash}.${fingerprint.ext}`);
        image = unchanged ? existingRow.image : image;
      }
    } else if (existingRow?.image) {
      image = existingRow.image;
    }

    const values = {
      id,
      part: item.part || `ODOO-${template.id}`,
      name: item.name,
      slug: item.slug,
      category: item.category,
      image,
      price: item.price.toFixed(2),
      brand: item.brand,
      countInStock: item.countInStock,
      description: item.description,
      rating: "0",
      numReviews: 0,
      isFeatured: false,
    };

    await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({
        target: products.id,
        set: {
          part: values.part,
          name: values.name,
          slug: values.slug,
          category: values.category,
          image: values.image,
          price: values.price,
          brand: values.brand,
          countInStock: values.countInStock,
          description: values.description,
          updatedAt: new Date(),
        },
      });

    if (existingRow) {
      updated += 1;
    } else {
      created += 1;
    }
  }
  console.log(`[sync] upserted ${created} new + ${updated} updated`);

  let outOfStock = 0;
  for (const id of existingById.keys()) {
    if (!syncedIds.has(id)) {
      await db
        .update(products)
        .set({ countInStock: 0, updatedAt: new Date() })
        .where(eq(products.id, id));
      outOfStock += 1;
    }
  }

  return {
    odooVersion: version?.server_version,
    odooSerie: version?.server_serie,
    templates: templates.length,
    created,
    updated,
    imageErrors,
    outOfStock,
    total: templates.length,
  };
}