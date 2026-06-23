import { NextResponse } from "next/server";

// Registration is handled by Clerk. This route is removed.
export async function POST() {
  return NextResponse.json(
    { message: "Registration is handled by Clerk" },
    { status: 410 }
  );
}
