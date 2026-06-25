import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch {
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
