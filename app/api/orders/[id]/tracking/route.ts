import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const validStatuses = [
  "Order Received",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Collected",
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order.length) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ tracking: order[0].tracking });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, message } = await req.json();

  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order.length) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const currentTracking = order[0].tracking || [];
    const updatedTracking = [
      ...currentTracking,
      { status, message, timestamp: new Date().toISOString() },
    ];

    await db
      .update(orders)
      .set({ tracking: updatedTracking })
      .where(eq(orders.id, id));

    return NextResponse.json({
      message: "Tracking updated successfully",
      tracking: updatedTracking,
    });
  } catch (error) {
    console.error("Error updating tracking data:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
