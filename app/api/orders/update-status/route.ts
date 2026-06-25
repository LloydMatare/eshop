import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { orderId, status } = await req.json();

  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .then((r) => r[0]);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const newStatus = {
      status,
      timestamp: new Date().toISOString(),
    };

    const tracking = [...(order.tracking || []), newStatus];

    const updateData: Record<string, any> = { tracking };
    if (status === "Delivered") {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    } else if (status === "Paid") {
      updateData.isPaid = true;
      updateData.paidAt = new Date();
    }

    const updatedOrder = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning()
      .then((r) => r[0]);

    return NextResponse.json(
      { message: "Order status updated", order: updatedOrder },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
