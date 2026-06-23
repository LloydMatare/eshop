import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { paynow } from "@/lib/paynow";
import { NextResponse } from "next/server";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;
const PAYNOW_TIMEOUT = 10000;

async function checkPaymentStatusWithRetry(
  pollUrl: string,
  retries: number = MAX_RETRIES
) {
  let attempt = 0;
  let paymentStatus;

  while (attempt < retries) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PAYNOW_TIMEOUT);

      paymentStatus = await paynow.capturePayNowOrder(pollUrl);

      clearTimeout(timeout);

      if (
        paymentStatus.success &&
        paymentStatus.paymentDetails?.status === "paid"
      ) {
        return paymentStatus;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
    attempt++;
  }

  return paymentStatus;
}

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

  if (!order.paymentPollUrl) {
    return NextResponse.json(
      { message: "Poll URL not found" },
      { status: 400 }
    );
  }

  try {
    const paymentStatus = await checkPaymentStatusWithRetry(
      order.paymentPollUrl
    );

    const paymentDetails = paymentStatus?.paymentDetails;
    if (!paymentDetails || !paymentDetails.status) {
      return NextResponse.json(
        { message: "Payment status unavailable" },
        { status: 500 }
      );
    }

    switch (paymentDetails.status) {
      case "paid":
        await db
          .update(orders)
          .set({
            isPaid: true,
            paidAt: new Date(),
            paymentResult: paymentDetails,
          })
          .where(eq(orders.id, (await params).id));
        return NextResponse.json({ message: "Payment verified", isPaid: true });

      case "created":
      case "pending":
        return NextResponse.json({
          message: "Payment pending, try again later",
          isPaid: false,
        });

      default:
        return NextResponse.json({
          message: `Unexpected status: ${paymentDetails.status}`,
          isPaid: false,
        });
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
