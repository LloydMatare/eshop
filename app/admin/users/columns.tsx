"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Shield, User as UserIcon, Trash2, Pen } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { formatId } from "@/lib/utils"

export type UserRow = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  createdAt?: string
}

function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function createUserColumns(
  onDelete: (user: UserRow) => void
): ColumnDef<UserRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-content text-sm font-medium">
              {getUserInitials(user.name)}
            </div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {formatId(user.id)}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "isAdmin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const isAdmin = row.getValue("isAdmin") as boolean
        return isAdmin ? (
          <Badge variant="default" className="gap-1">
            <Shield className="w-3 h-3" />
            Admin
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <UserIcon className="w-3 h-3" />
            User
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/users/${user.id}`}>
                <Pen />
                Edit
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(user)}
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
