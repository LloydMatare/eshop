import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const banner = await db
    .select()
    .from(banners)
    .where(eq(banners.id, (await params).id))
    .limit(1)
    .then((r) => r[0]);

  if (!banner) {
    return NextResponse.json(
      { message: "Banner not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(banner);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, slug, image } = await req.json();

  try {
    const updatedBanner = await db
      .update(banners)
      .set({ name, slug, image })
      .where(eq(banners.id, (await params).id))
      .returning()
      .then((r) => r[0]);

    if (!updatedBanner) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBanner);
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
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await db
      .delete(banners)
      .where(eq(banners.id, (await params).id))
      .returning()
      .then((r) => r[0]);

    if (!deleted) {
      return NextResponse.json(
        { message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
