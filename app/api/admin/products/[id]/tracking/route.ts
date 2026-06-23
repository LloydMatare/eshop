import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const product = await db
      .select({ tracking: products.tracking })
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

    return NextResponse.json({ tracking: product.tracking });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching tracking data" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, message } = await req.json();

    const product = await db
      .select({ tracking: products.tracking })
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

    const newEntry = {
      status,
      message,
      timestamp: new Date().toISOString(),
    };

    const tracking = [...(product.tracking || []), newEntry];

    const updated = await db
      .update(products)
      .set({ tracking })
      .where(eq(products.id, (await params).id))
      .returning({ tracking: products.tracking })
      .then((r) => r[0]);

    return NextResponse.json({ tracking: updated.tracking });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating tracking data" },
      { status: 500 }
    );
  }
}
