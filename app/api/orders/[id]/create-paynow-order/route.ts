import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { paynow } from "@/lib/paynow";
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

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  try {
    console.log("Creating PayNow order for:", { orderId: order.id, amount: Number(order.totalPrice) });
    const result = await paynow.createPayNowOrder(
      order.id,
      Number(order.totalPrice)
    );

    if (!result.pollUrl) {
      console.error("PayNow poll URL missing in response:", result);
      return NextResponse.json(
        { message: "PayNow poll URL missing" },
        { status: 500 }
      );
    }

    await db
      .update(orders)
      .set({ paymentPollUrl: result.pollUrl })
      .where(eq(orders.id, (await params).id));

    return NextResponse.json({ link: result.link });
  } catch (err: any) {
    console.error("Failed to create PayNow order:", err);
    return NextResponse.json({ message: err.message || "PayNow payment failed" }, { status: 500 });
  }
}
