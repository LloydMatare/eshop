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

  const { id } = await params;

  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!order || !order.paymentPollUrl) {
      return NextResponse.json(
        { message: "Order not found or paymentPollUrl missing" },
        { status: 404 }
      );
    }

    const paymentStatus = await paynow.capturePayNowOrder(order.paymentPollUrl);

    if (paymentStatus.success) {
      const updatedOrder = await db
        .update(orders)
        .set({
          isPaid: true,
          paidAt: new Date(),
          paymentResult: {
            id: paymentStatus.id,
          },
        })
        .where(eq(orders.id, id))
        .returning()
        .then((r) => r[0]);

      return NextResponse.json(updatedOrder, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
