import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        items: orders.items,
        shippingAddress: orders.shippingAddress,
        paymentMethod: orders.paymentMethod,
        paymentResult: orders.paymentResult,
        itemsPrice: orders.itemsPrice,
        shippingPrice: orders.shippingPrice,
        taxPrice: orders.taxPrice,
        totalPrice: orders.totalPrice,
        isPaid: orders.isPaid,
        isDelivered: orders.isDelivered,
        paidAt: orders.paidAt,
        deliveredAt: orders.deliveredAt,
        estimatedDeliveryAt: orders.estimatedDeliveryAt,
        paymentPollUrl: orders.paymentPollUrl,
        tracking: orders.tracking,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        userName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json(allOrders);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
