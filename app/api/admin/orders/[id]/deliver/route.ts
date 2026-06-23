import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, (await params).id))
      .limit(1)
      .then((r) => r[0]);

    if (order) {
      if (!order.isPaid)
        return NextResponse.json(
          { message: "Order is not paid" },
          { status: 400 }
        );

      const updatedOrder = await db
        .update(orders)
        .set({
          isPaid: true,
          isDelivered: true,
          deliveredAt: new Date(),
        })
        .where(eq(orders.id, (await params).id))
        .returning()
        .then((r) => r[0]);

      return NextResponse.json(updatedOrder);
    } else {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
