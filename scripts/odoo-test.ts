import {
  odooCount,
  odooSearchRead,
  odooServerVersion,
  OdooError,
} from "../lib/odoo/client";
import { mapTemplate } from "../lib/odoo/mapper";
import type { OdooProductTemplate } from "../lib/odoo/mapper";

const PAGE_SIZE = 5;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAILED: ${message}`);
  }
  console.log(`  ok - ${message}`);
}

async function main(): Promise<void> {
  const url = process.env.ODOO_URL;
  const apiKey = process.env.ODOO_API_KEY;

  console.log("Odoo test (odoo.sh test DB)");
  console.log(`  ODOO_URL: ${url || "(not set)"}`);
  console.log(`  ODOO_API_KEY: ${apiKey ? "(set)" : "(not set)"}`);

  if (!url) throw new Error("ODOO_URL is not set in .env");
  if (!apiKey) throw new Error("ODOO_API_KEY is not set in .env");

  const version = await odooServerVersion();
  console.log(
    `  server: ${version?.server_version || "unknown"} (serie ${
      version?.server_serie || "unknown"
    })`
  );
  assert(!!version, "able to reach Odoo and read server version");

  const templates = await odooSearchRead<OdooProductTemplate>(
    "product.template",
    [
      ["sale_ok", "=", true],
      ["active", "=", true],
    ],
    [
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
    ],
    { offset: 0, limit: PAGE_SIZE, order: "id" }
  );

  console.log(`  product.template (first ${PAGE_SIZE}): ${templates.length}`);
  assert(templates.length > 0, "product catalog is non-empty");

  const variantTotal = await odooCount("product.product", [
    ["active", "=", true],
  ]);
  console.log(`  product.product (active variants): ${variantTotal}`);
  assert(variantTotal > 0, "variants are readable");

  const internalQuants = await odooCount("stock.quant", [
    ["location_id.usage", "=", "internal"],
  ]);
  console.log(`  stock.quant (internal locations): ${internalQuants}`);
  assert(internalQuants > 0, "stock.quant is readable");

  const seenSlugs = new Map<string, number>();
  const slugs = new Set<string>();
  for (const template of templates) {
    const mapped = mapTemplate(template, seenSlugs, { stock: 42 });
    assert(mapped.name.length > 0, `template ${template.id} has a name`);
    assert(mapped.slug.length > 0, `template ${template.id} has a slug`);
    assert(!slugs.has(mapped.slug), `template ${template.id} slug is unique`);
    slugs.add(mapped.slug);
    assert(mapped.price >= 0, `template ${template.id} has a non-negative price`);
    assert(mapped.countInStock === 42, `template ${template.id} stock maps`);
    console.log(
      `    - [${template.id}] ${mapped.name} | ${mapped.category} | $${mapped.price}`
    );
  }

  console.log("All checks passed.");
}

main().catch((err) => {
  console.error(err instanceof OdooError ? `Odoo error: ${err.message}` : err);
  process.exit(1);
});