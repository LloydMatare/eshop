import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  part: text("part").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  brand: text("brand").notNull(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("0"),
  numReviews: integer("num_reviews").notNull().default(0),
  countInStock: integer("count_in_stock").notNull().default(0),
  description: text("description").notNull(),
  isFeatured: boolean("is_featured").default(false),
  banner: text("banner"),
  colors: jsonb("colors").$type<string[]>(),
  sizes: jsonb("sizes").$type<string[]>(),
  tracking: jsonb("tracking")
    .$type<
      { status: string; timestamp: string; message?: string }[]
    >()
    .default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  items: jsonb("items")
    .$type<
      {
        product: string;
        name: string;
        slug: string;
        qty: number;
        image: string;
        price: number;
        color?: string;
        size?: string;
      }[]
    >()
    .notNull(),
  shippingAddress: jsonb("shipping_address")
    .$type<{
      fullName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    }>()
    .notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentResult: jsonb("payment_result").$type<{
    id?: string;
    status?: string;
    update_time?: string;
    email_address?: string;
  }>(),
  itemsPrice: decimal("items_price", { precision: 10, scale: 2 }).notNull(),
  shippingPrice: decimal("shipping_price", { precision: 10, scale: 2 }).notNull(),
  taxPrice: decimal("tax_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  isDelivered: boolean("is_delivered").notNull().default(false),
  paidAt: timestamp("paid_at"),
  deliveredAt: timestamp("delivered_at"),
  estimatedDeliveryAt: timestamp("estimated_delivery_at"),
  paymentPollUrl: text("payment_poll_url"),
  tracking: jsonb("tracking")
    .$type<
      {
        product?: string;
        status: string;
        message?: string;
        timestamp: string;
      }[]
    >()
    .default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const banners = pgTable("banners", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
