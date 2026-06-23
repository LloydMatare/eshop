import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isPaid } = await req.json();

    const updatedOrder = await db
      .update(orders)
      .set({ isPaid })
      .where(eq(orders.id, id))
      .returning();

    if (!updatedOrder.length)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating order", error },
      { status: 500 }
    );
  }
}
