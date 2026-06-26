import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { paynow } from "@/lib/paynow";
import { NextResponse } from "next/server";

const COMPLETED_STATUSES = ["paid", "awaiting delivery"];

function isCompleted(status: string): boolean {
  return COMPLETED_STATUSES.includes(status.toLowerCase());
}

export async function POST(
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

  if (!order.paymentPollUrl) {
    return NextResponse.json(
      { message: "Poll URL not found" },
      { status: 400 }
    );
  }

  try {
    const paymentStatus = await paynow.capturePayNowOrder(
      order.paymentPollUrl
    );

    if (!paymentStatus.success) {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }

    const paymentDetails = paymentStatus.paymentDetails;
    const status = paymentDetails?.status;

    if (!status || !isCompleted(status)) {
      return NextResponse.json(
        { message: `Unexpected status: ${status}` },
        { status: 400 }
      );
    }

    await db
      .update(orders)
      .set({
        isPaid: true,
        paidAt: new Date(),
        paymentResult: paymentDetails,
      })
      .where(eq(orders.id, (await params).id));

    return NextResponse.json({ message: "Payment verified", isPaid: true });
  } catch (err) {
    console.error("verify-paynow error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
