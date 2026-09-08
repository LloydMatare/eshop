export type OdooProductTemplate = {
  id: number;
  name: string;
  default_code?: string | false;
  list_price?: number | string;
  categ_id?: [number, string] | false;
  description_sale?: string | false;
  description?: string | false;
  sale_ok?: boolean;
  active?: boolean;
  image_1920?: string | false;
};

export type MappedProduct = {
  part: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  description: string;
  countInStock: number;
  imageBase64?: string | false;
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function mapTemplate(
  template: OdooProductTemplate,
  seenSlugs: Map<string, number>,
  options: { stock?: number } = {}
): MappedProduct {
  const name = template.name?.trim() || `Odoo Product ${template.id}`;
  const baseSlug = slugify(name) || `product-${template.id}`;

  const seen = seenSlugs.get(baseSlug) || 0;
  const slug = seen === 0 ? baseSlug : `${baseSlug}-t${template.id}`;
  seenSlugs.set(baseSlug, seen + 1);

  return {
    part: template.default_code?.toString().trim() || "",
    name,
    slug,
    category: Array.isArray(template.categ_id)
      ? template.categ_id[1]
      : "Uncategorized",
    brand: "",
    price: Number(template.list_price) || 0,
    description:
      template.description_sale?.toString() ||
      template.description?.toString() ||
      name,
    countInStock: Math.max(0, Math.floor(options.stock ?? 0)),
    imageBase64: template.image_1920 || false,
  };
}