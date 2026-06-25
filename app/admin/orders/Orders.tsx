"use client";
import AdminLoading from "@/components/admin/AdminLoading";
import DataError from "@/components/admin/DataError";
import { fetcher } from "@/lib/services/fetcher";
import useSWR from "swr";
import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { columns, type OrderRow } from "./columns";

export default function Orders() {
  const {
    data: orders,
    error,
    isLoading,
  } = useSWR(`/api/admin/orders`, fetcher);

  const [searchQuery, setSearchQuery] = useState("");
  const [paidFilter, setPaidFilter] = useState("all");
  const [deliveredFilter, setDeliveredFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order: OrderRow) => {
      const matchesSearch =
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPaid =
        paidFilter === "all" ||
        (paidFilter === "paid" && order.isPaid) ||
        (paidFilter === "unpaid" && !order.isPaid);

      const matchesDelivered =
        deliveredFilter === "all" ||
        (deliveredFilter === "delivered" && order.isDelivered) ||
        (deliveredFilter === "pending" && !order.isDelivered);

      return matchesSearch && matchesPaid && matchesDelivered;
    });
  }, [orders, searchQuery, paidFilter, deliveredFilter]);

  if (error) return <div>An error has occurred: {error.message}</div>;
  if (isLoading) return <AdminLoading />;
  if (!orders || orders.length === 0) return <DataError name="orders" />;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-base-content/60 mt-2">
            {filteredOrders.length} of {orders?.length || 0} orders
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        toolbar={
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Select value={paidFilter} onValueChange={setPaidFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deliveredFilter} onValueChange={setDeliveredFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Delivery Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delivery Status</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
