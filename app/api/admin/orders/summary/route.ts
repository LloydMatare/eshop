import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders, products, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const ordersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    const productsCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products);
    const usersCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const ordersCount = Number(ordersCountResult[0].count);
    const productsCount = Number(productsCountResult[0].count);
    const usersCount = Number(usersCountResult[0].count);

    const ordersPriceGroup = await db
      .select({
        sales: sql<string>`sum(${orders.totalPrice})`,
      })
      .from(orders);
    const ordersPrice = ordersPriceGroup[0]?.sales
      ? Number(ordersPriceGroup[0].sales)
      : 0;

    const salesData = await db
      .select({
        _id: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
        totalOrders: sql<number>`count(*)`,
        totalSales: sql<string>`sum(${orders.totalPrice})`,
      })
      .from(orders)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`);

    const productsData = await db
      .select({
        _id: products.category,
        totalProducts: sql<number>`count(*)`,
      })
      .from(products)
      .groupBy(products.category)
      .orderBy(products.category);

    const usersData = await db
      .select({
        _id: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`,
        totalUsers: sql<number>`count(*)`,
      })
      .from(users)
      .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`);

    return NextResponse.json({
      ordersCount,
      productsCount,
      usersCount,
      ordersPrice,
      salesData,
      productsData,
      usersData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch summary." },
      { status: 500 }
    );
  }
}
