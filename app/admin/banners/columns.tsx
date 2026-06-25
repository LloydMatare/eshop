"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Trash, Pen } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { formatId } from "@/lib/utils"

export type BannerRow = {
  _id: string
  name: string
}

export function createBannerColumns(
  onDelete: (id: string) => void
): ColumnDef<BannerRow>[] {
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const banner = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/banners/${banner._id}`}>
                <Pen />
                Edit
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(banner._id)}
            >
              <Trash />
              Delete
            </Button>
          </div>
        )
      },
    },
  ]
}
