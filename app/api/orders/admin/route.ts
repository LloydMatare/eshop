import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
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
