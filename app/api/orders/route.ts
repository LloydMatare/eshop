import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { products, orders } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { round2 } from "@/lib/utils";
import { NextResponse } from "next/server";
import { OrderItem } from "@/lib/types";

const calcPrices = (orderItems: OrderItem[]) => {
  const itemsPrice = round2(
    orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  const taxPrice = round2(Number((0.15 * itemsPrice).toFixed(2)));
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();

    const productIds = payload.items.map((x: { _id: string }) => x._id);
    const dbProductPrices = await db
      .select({ id: products.id, price: products.price })
      .from(products)
      .where(inArray(products.id, productIds));

    const dbOrderItems: OrderItem[] = payload.items.map(
      (item: { _id: string }) => {
        const product = dbProductPrices.find(
          (prod) => prod.id === item._id
        );
        if (product) {
          return {
            ...item,
            product: item._id,
            price: Number(product.price),
          };
        }
      }
    );

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const id = crypto.randomUUID();
    await db.insert(orders).values({
      id,
      userId,
      items: dbOrderItems,
      itemsPrice: String(itemsPrice),
      taxPrice: String(taxPrice),
      shippingPrice: String(shippingPrice),
      totalPrice: String(totalPrice),
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod,
    });

    const createdOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)
      .then((r) => r[0]);

    return NextResponse.json(
      { message: "Order has been created", order: createdOrder },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}
