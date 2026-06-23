import { cache } from "react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { desc, eq, like, gte, lte, asc, and, sql } from "drizzle-orm";
import type { Product } from "@/lib/types";

const PAGE_SIZE = 3;

const getLatest = cache(async () => {
  const result = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(6);
  return result as unknown as Product[];
});

const getAll = cache(async () => {
  const result = await db.select().from(products);
  return result as unknown as Product[];
});

const getFeatured = cache(async () => {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.isFeatured, true))
    .limit(3);
  return result as unknown as Product[];
});

const getProductsByCategory = cache(async (category: string) => {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.category, category));
  return result as unknown as Product[];
});

const getBySlug = cache(async (slug: string) => {
  const result = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return result[0] as unknown as Product | undefined;
});

const getByQuery = cache(
  async ({
    q = "",
    category = "",
    sort = "",
    price = "",
    rating = "",
    page = "1",
    limit,
  }: {
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
    limit?: number;
  } = {}) => {
    const pageSize = limit || PAGE_SIZE;
    const conditions = [];

    if (q && q !== "all") {
      conditions.push(like(products.name, `%${q}%`));
    }
    if (category && category !== "all") {
      conditions.push(eq(products.category, category));
    }
    if (rating && rating !== "all") {
      conditions.push(gte(products.rating, rating));
    }
    if (price && price !== "all") {
      const [min, max] = price.split("-").map(Number);
      conditions.push(gte(products.price, String(min)));
      if (max) conditions.push(lte(products.price, String(max)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    switch (sort) {
      case "lowest":
        orderBy = asc(products.price);
        break;
      case "highest":
        orderBy = desc(products.price);
        break;
      case "toprated":
        orderBy = desc(products.rating);
        break;
      default:
        orderBy = desc(products.createdAt);
    }

    const result = await db
      .select()
      .from(products)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(pageSize * (Number(page) - 1));

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where);

    const countProducts = Number(countResult[0]?.count) || 0;

    return {
      products: result as unknown as Product[],
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    };
  }
);

const getCategories = cache(async () => {
  const result = await db
    .select({ category: products.category })
    .from(products)
    .groupBy(products.category);
  return result.map((r) => r.category);
});

const productService = {
  getLatest,
  getFeatured,
  getBySlug,
  getByQuery,
  getCategories,
  getAll,
  getProductsByCategory,
};

export default productService;
