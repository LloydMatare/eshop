import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, (await params).id))
      .limit(1)
      .then((r) => r[0]);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch product." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name,
      slug,
      price,
      category,
      image,
      brand,
      countInStock,
      description,
      part,
    } = await req.json();

    const updatedProduct = await db
      .update(products)
      .set({
        name,
        slug,
        price: String(price),
        category,
        image,
        brand,
        countInStock,
        description,
        part,
      })
      .where(eq(products.id, (await params).id))
      .returning()
      .then((r) => r[0]);

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await db
      .delete(products)
      .where(eq(products.id, (await params).id))
      .returning()
      .then((r) => r[0]);

    if (!deleted) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
