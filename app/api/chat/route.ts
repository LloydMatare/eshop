import { convertToModelMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import type { UIMessage } from "ai";

export const maxDuration = 30;

const MAX_MESSAGES = 12;
const MAX_CONTENT_LENGTH = 500;

const STORE_INFO = `You are the shopping assistant for Compulink, an enterprise IT store based in Harare, Zimbabwe.

Store facts:
- Store name: Compulink (IT Solutions)
- Location: Harare, Zimbabwe
- Contact: WhatsApp ${WHATSAPP_NUMBER}, email support@compulink.co
- Categories: Laptops & Computers, Servers & Storage, Networking, Software, Accessories
- Shipping: free shipping on orders over $100, otherwise a $10 flat rate; calculated at checkout
- Tax: 15% tax is added at checkout
- Payments: secure checkout via PayPal and Paynow
- Support: 24/7 enterprise support and a 1-year warranty on all products

Behavior:
- Answer questions about products, pricing, categories, stock, shipping, tax, payments, warranty, returns, and how to order or track orders.
- Only recommend products that appear in the provided catalog. Use the exact names and prices from the catalog.
- If no catalog products are provided, suggest the store's categories and offer to help find a product.
- If a question is unrelated to the store or the catalog, politely say you can only help with store questions and point to WhatsApp support for anything else.
- Keep answers concise, friendly, and formatted with short lines. Encourage the customer to add items to their cart.`;

function extractUserText(message: UIMessage): string {
  if (!Array.isArray(message.parts)) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join(" ")
    .trim();
}

function formatProduct(p: {
  name: string;
  brand: string;
  price: string | number;
  category: string;
  countInStock: number;
}): string {
  return `- ${p.name} (brand: ${p.brand}, category: ${p.category}, price: $${p.price}, in stock: ${p.countInStock})`;
}

export async function POST(req: Request) {
  let payload: { messages?: UIMessage[] };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = Array.isArray(payload.messages)
    ? payload.messages.slice(-MAX_MESSAGES)
    : [];
  if (messages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const query = extractUserText(lastUserMessage || messages[0]).slice(
    0,
    MAX_CONTENT_LENGTH
  );

  let catalogText = "";
  const searchTerms = query
    .toLowerCase()
    .split(/[\s,./]+/)
    .filter((word) => word.length > 1)
    .slice(0, 6);

  if (searchTerms.length > 0) {
    const matches = await db
      .select({
        name: products.name,
        brand: products.brand,
        price: products.price,
        category: products.category,
        countInStock: products.countInStock,
      })
      .from(products)
      .where(
        or(
          ...searchTerms.flatMap((term) => [
            ilike(products.name, `%${term}%`),
            ilike(products.brand, `%${term}%`),
            ilike(products.category, `%${term}%`),
          ])
        )
      )
      .limit(8);

    if (matches.length > 0) {
      catalogText = matches.map(formatProduct).join("\n");
    }
  }

  if (!catalogText) {
    const categories = await db
      .selectDistinct({ category: products.category })
      .from(products);
    catalogText = categories
      .map((c) => `- ${c.category}`)
      .join("\n") || "(Empty catalog)";
  }

  const systemPrompt = catalogText
    ? `${STORE_INFO}\n\nAvailable catalog:\n${catalogText}`
    : STORE_INFO;
  const history = await convertToModelMessages(messages);

  const result = streamText({
    model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
    system: systemPrompt,
    messages: history,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}