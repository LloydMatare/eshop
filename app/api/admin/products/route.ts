import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = crypto.randomUUID();
  const randomId = Math.floor(Math.random() * 10000);
  const product = {
    id,
    part: `PART-${randomId}`,
    name: "Sample Product",
    slug: "sample-product-" + Math.random(),
    image: "/images/shirt1.jpg",
    price: "0",
    category: "Sample Category",
    brand: "Sample Brand",
    countInStock: 0,
    description: "Sample description",
    rating: "0",
    numReviews: 0,
  };

  try {
    await db.insert(products).values(product);
    const created = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .then((r) => r[0]);
    return NextResponse.json(
      { message: "Product created successfully", product: created },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch product." },
      { status: 500 }
    );
  }
}
