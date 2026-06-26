"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import { fetcher } from "@/lib/services/fetcher";
import { formatId } from "@/lib/utils";
import AdminLoading from "@/components/admin/AdminLoading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  X,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

type OrderData = {
  id: string;
  isPaid: boolean;
  isDelivered: boolean;
  totalPrice: number;
  paidAt: string;
  deliveredAt: string;
  createdAt: string;
};

export default function MyOrders() {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = user?.publicMetadata?.isAdmin === true;

  const { data: orders, error } = useSWR(
    isLoaded && user
      ? isAdmin
        ? "/api/orders/admin"
        : "/api/orders/mine"
      : null,
    fetcher
  );

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order: OrderData) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "delivered" && order.isDelivered) ||
        (statusFilter === "pending" && !order.isDelivered) ||
        (statusFilter === "paid" && order.isPaid) ||
        (statusFilter === "unpaid" && !order.isPaid);

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  if (!isLoaded) return <></>;
  if (error) return <div className="container mx-auto px-4 py-16 text-center text-error">Failed to load orders: {error.message}</div>;
  if (!orders) return <AdminLoading />;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-base-content mb-2">
          Order History
        </h1>
        <p className="text-base-content/60">
          Track and manage all your orders
        </p>
      </div>

      <div className="bg-card rounded-2xl p-5 mb-6 border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SlidersHorizontal className="size-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="pending">Pending Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-base-200 rounded-2xl p-16 text-center border border-base-300">
          <Package className="w-24 h-24 mx-auto mb-6 text-base-content/30" />
          <h3 className="text-2xl font-bold text-base-content mb-4">
            No orders found
          </h3>
          <p className="text-base-content/60 mb-6">
            Start shopping to create your first order
          </p>
          <Link href="/" className="btn btn-primary rounded-full">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: OrderData) => (
            <div
              key={order.id}
              className="bg-base-200 rounded-2xl p-6 border border-base-300 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-base-content">
                        Order #{formatId(order.id)}
                      </p>
                      <p className="text-sm text-base-content/60">
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-base-content/50" />
                      <span className="text-sm text-base-content/70">
                        Total:{" "}
                        <span className="font-semibold text-primary">
                          ${Number(order.totalPrice).toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.isPaid ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-success">
                            Paid on{" "}
                            {new Date(order.paidAt).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-error" />
                          <span className="text-sm text-error">Not paid</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {order.isDelivered ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-sm text-success">
                            Delivered on{" "}
                            {new Date(
                              order.deliveredAt
                            ).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-warning" />
                          <span className="text-sm text-warning">
                            In transit
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild size="sm" className="rounded-full gap-2">
                    <Link href={`/order/${order.id}`}>
                      <Eye className="size-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-base-300">
                {order.isPaid && (
                  <span className="badge badge-success gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Paid
                  </span>
                )}
                {order.isDelivered && (
                  <span className="badge badge-success gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Delivered
                  </span>
                )}
                {!order.isDelivered && (
                  <span className="badge badge-warning gap-1">
                    <Clock className="w-3 h-3" />
                    Processing
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredOrders.length > 0 && (
        <div className="text-center mt-6 text-base-content/60">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      )}
    </div>
  );
}
