import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, (await params).id))
    .limit(1)
    .then((r) => r[0]);

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(user);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, email, isAdmin: newIsAdmin } = await req.json();

  try {
    const updatedUser = await db
      .update(users)
      .set({ name, email, isAdmin: Boolean(newIsAdmin) })
      .where(eq(users.id, (await params).id))
      .returning()
      .then((r) => r[0]);

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.isAdmin === true;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, (await params).id))
      .limit(1)
      .then((r) => r[0]);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { message: "User is admin" },
        { status: 400 }
      );
    }

    await db.delete(users).where(eq(users.id, (await params).id));
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
