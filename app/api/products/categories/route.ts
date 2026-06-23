import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db
    .selectDistinct({ category: products.category })
    .from(products);
  const categories = result.map((r) => r.category);
  return NextResponse.json(categories);
}
