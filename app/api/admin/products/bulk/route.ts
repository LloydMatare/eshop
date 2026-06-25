import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  part: z.string().min(1, "Part is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  image: z.string().optional().default("/images/laptop.png"),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  countInStock: z
    .number()
    .int()
    .nonnegative("Count in stock must be non-negative"),
  description: z.string().min(1, "Description is required"),
});

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") +
  "-" +
  Date.now();

const generateTrackingData = () => [
  {
    status: "Order Received",
    timestamp: new Date().toISOString(),
    message: "Your order has been received and is being processed.",
  },
];

export async function GET(req: Request) {
  try {
    await requireAdmin(req);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: "Failed to fetch products",
        error: err.message,
      },
      { status: 500 }
    );
  }
}

// POST handler is kept commented out as per original — uncomment and adapt when needed
