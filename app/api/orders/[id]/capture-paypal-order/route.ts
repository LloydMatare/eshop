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
      const { orderID } = await req.json();
      const captureData = await paypal.capturePayment(orderID);
      const updatedOrder = await db
        .update(orders)
        .set({
          isPaid: true,
          paidAt: new Date(),
          paymentResult: {
            id: captureData.id,
            status: captureData.status,
            email_address: captureData.payer.email_address,
          },
        })
        .where(eq(orders.id, (await params).id))
        .returning()
        .then((r) => r[0]);
      return NextResponse.json(updatedOrder);
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
