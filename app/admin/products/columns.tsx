"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Pen, Trash2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { formatId } from "@/lib/utils"

export type ProductRow = {
  _id: string
  part: string
  name: string
  price: number
  category: string
  countInStock: number
  rating: number
  description?: string
}

export function createProductColumns(
  onDelete: (id: string) => void
): ColumnDef<ProductRow>[] {
  return [
    {
      accessorKey: "_id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatId(row.getValue("_id"))}
        </span>
      ),
    },
    {
      accessorKey: "part",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Part" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("part")}</span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="max-w-xs truncate block">
          {row.getValue("name")}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"))
        return (
          <span className="font-semibold text-primary">
            ${price.toFixed(2)}
          </span>
        )
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "countInStock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => {
        const stock = row.getValue("countInStock") as number
        return (
          <Badge variant={stock > 0 ? "secondary" : "destructive"}>
            {stock}
          </Badge>
        )
      },
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rating" />
      ),
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number
        return (
          <div className="flex items-center gap-1">
            <span className="text-amber-500">⭐</span>
            <span className="font-medium">{rating}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/products/${product._id}`}>
                <Pen />
                Edit
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(product._id)}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        )
      },
    },
  ]
}
