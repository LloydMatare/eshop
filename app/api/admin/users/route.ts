import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users." },
      { status: 500 }
    );
  }
}
