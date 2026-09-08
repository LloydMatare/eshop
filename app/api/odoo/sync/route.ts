import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { OdooError } from "@/lib/odoo/client";
import { syncFromOdoo } from "@/lib/odoo/sync";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let authorized = false;

  try {
    await requireAdmin(req);
    authorized = true;
  } catch {
    const isCron = req.headers.get("x-vercel-cron") === "1";
    const secret = req.headers.get("x-cron-secret");
    if (
      isCron ||
      (secret && process.env.CRON_SECRET && secret === process.env.CRON_SECRET)
    ) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncFromOdoo();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    const message =
      err instanceof OdooError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Odoo sync failed.";
    return NextResponse.json({ success: false, message }, { status: 502 });
  }
}