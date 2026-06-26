import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allBanners = await db.select().from(banners);
    return NextResponse.json(allBanners);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch banners." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = crypto.randomUUID();
  const banner = {
    id,
    name: "sample name",
    slug: "sample-name-" + Math.random(),
    image: "/images/shirt1.jpg",
    category: null,
  };

  try {
    await db.insert(banners).values(banner);
    const created = await db
      .select()
      .from(banners)
      .where(eq(banners.id, id))
      .limit(1)
      .then((r) => r[0]);
    return NextResponse.json(
      { message: "Banner created successfully", banner: created },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
