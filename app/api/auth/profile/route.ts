import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await req.json();

  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      firstName: name?.split(" ")[0] || name,
      lastName: name?.split(" ").slice(1).join(" ") || "",
    });

    await db
      .update(users)
      .set({ name, email })
      .where(eq(users.id, userId));

    return NextResponse.json({ message: "Profile has been updated" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
