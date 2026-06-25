import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allOrders = await db.select().from(orders);
    return NextResponse.json(allOrders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
