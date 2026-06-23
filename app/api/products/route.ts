import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export async function GET() {
  const allProducts = await db.select().from(products);
  return Response.json(allProducts);
}
