"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  XCircle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Order {
  id: string;
  user: string;
  items: {
    product: string;
    name: string;
    slug: string;
    qty: number;
    image: string;
    price: number;
  }[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: string;
  shippingPrice: string;
  taxPrice: string;
  totalPrice: string;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt: string;
  createdAt: string;
  tracking: { status: string; message: string; timestamp: string }[];
}

export default function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <XCircle className="w-24 h-24 mx-auto mb-6 text-base-content/30" />
          <h1 className="text-3xl font-bold text-base-content mb-4">
            Order not found
          </h1>
          <p className="text-base-content/60 mb-8">
            We could not find an order with that ID.
          </p>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-success to-success/80 text-white">
        <div className="container mx-auto px-4 lg:px-8 py-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">
            {order.isPaid ? "Payment Successful!" : "Order Placed!"}
          </h1>
          <p className="text-lg text-white/80">
            Thank you for your order. Your order number is{" "}
            <span className="font-mono font-bold text-white">
              #{order.id}
            </span>
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-base-content mb-4">
                    Shipping Address
                  </h2>
                  <div className="space-y-1">
                    <p className="font-semibold text-base-content">
                      {order.shippingAddress.fullName}
                    </p>
                    <p className="text-base-content/70">
                      {order.shippingAddress.address}
                    </p>
                    <p className="text-base-content/70">
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-base-content/70">
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-base-content mb-4">
                    Payment Method
                  </h2>
                  <p className="text-lg font-semibold text-base-content">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
              {order.isPaid ? (
                <div className="flex items-center gap-2 mt-4 p-3 bg-success/10 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-success font-semibold">
                    Paid on{" "}
                    {order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : "N/A"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4 p-3 bg-warning/10 rounded-xl">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className="text-warning font-semibold">
                    Payment Pending
                  </span>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-xl">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-base-content">
                  Order Items
                </h2>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex gap-4 p-4 bg-base-100 rounded-xl border border-base-300"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-20 h-20 bg-base-200 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-semibold text-base-content hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-base-content/70">
                          Qty: {item.qty}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          ${item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-base-200 rounded-2xl p-6 border border-base-300 sticky top-24">
              <h2 className="text-2xl font-bold text-base-content mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base-content/70">
                  <span>Items</span>
                  <span className="font-semibold">
                    ${Number(order.itemsPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base-content/70">
                  <span>Tax</span>
                  <span className="font-semibold">
                    ${Number(order.taxPrice).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base-content/70">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    ${Number(order.shippingPrice).toFixed(2)}
                  </span>
                </div>
                <div className="divider my-2" />
                <div className="flex justify-between text-2xl font-bold text-base-content">
                  <span>Total</span>
                  <span className="text-primary">
                    ${Number(order.totalPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {order.isPaid && (
                <div className="flex items-center gap-2 justify-center p-3 bg-success/10 rounded-xl mb-4">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-success font-semibold">Paid</span>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push(`/order/${order.id}`)}
                  className="w-full gap-2"
                >
                  <Truck className="w-4 h-4" />
                  View Order Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/order-history")}
                  className="w-full gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Order History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
