import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { paypal } from "@/lib/paypal";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const order = await db
    .select()
    .from(orders)
    .where(eq(orders.id, (await params).id))
    .limit(1)
    .then((r) => r[0]);

  if (order) {
    try {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));
      return NextResponse.json(paypalOrder);
    } catch (err: any) {
      return NextResponse.json(
        { message: err.message },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Order not found" },
      { status: 404 }
    );
  }
}
