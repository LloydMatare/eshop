"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Package, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { formatId } from "@/lib/utils"

export type OrderRow = {
  _id: string
  id: string
  user?: { name: string; email: string }
  createdAt: string
  totalPrice: number
  isPaid: boolean
  paidAt?: string
  isDelivered: boolean
  deliveredAt?: string
}

export const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatId(row.getValue("_id"))}
      </span>
    ),
  },
  {
    accessorKey: "user.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer" />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <span className="font-medium">{user?.name || "Deleted user"}</span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      return (
        <span className="text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("totalPrice"))
      return (
        <span className="font-semibold text-primary">
          ${price.toFixed(2)}
        </span>
      )
    },
  },
  {
    accessorKey: "isPaid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payment" />
    ),
    cell: ({ row }) => {
      const paid = row.getValue("isPaid") as boolean
      const paidAt = row.original.paidAt
      return paid ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Paid
          </Badge>
          <span className="text-xs text-muted-foreground">
            {paidAt ? new Date(paidAt).toLocaleDateString() : ""}
          </span>
        </div>
      ) : (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Unpaid
        </Badge>
      )
    },
  },
  {
    accessorKey: "isDelivered",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Delivery" />
    ),
    cell: ({ row }) => {
      const delivered = row.getValue("isDelivered") as boolean
      const deliveredAt = row.original.deliveredAt
      return delivered ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Delivered
          </Badge>
          <span className="text-xs text-muted-foreground">
            {deliveredAt ? new Date(deliveredAt).toLocaleDateString() : ""}
          </span>
        </div>
      ) : (
        <Badge variant="outline" className="gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="flex items-center justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/order/${order.id}`}>
              <Package />
              View Details
            </Link>
          </Button>
        </div>
      )
    },
  },
]
