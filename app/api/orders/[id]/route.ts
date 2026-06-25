import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, (await params).id))
    .limit(1)
    .then((r) => r[0]);
  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isPaid } = await req.json();

    const updatedOrder = await db
      .update(orders)
      .set({ isPaid })
      .where(eq(orders.id, (await params).id))
      .returning()
      .then((r) => r[0]);

    if (!updatedOrder)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating order", error },
      { status: 500 }
    );
  }
}
