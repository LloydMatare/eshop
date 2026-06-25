"use client";

import AdminLoading from "@/components/admin/AdminLoading";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createUserColumns, type UserRow } from "./columns";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export default function Users() {
  const { data: users, error } = useSWR(`/api/admin/users`, fetcher);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { trigger: deleteUser } = useSWRMutation(
    `/api/admin/users`,
    async (url, { arg }: { arg: { userId: string } }) => {
      const toastId = toast.loading("Deleting user...");
      const res = await fetch(`${url}/${arg.userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      res.ok
        ? toast.success("User deleted successfully", { id: toastId })
        : toast.error(data.message, { id: toastId });
    }
  );

  const handleDeleteClick = (user: UserRow) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteUser({ userId: selectedUser.id });
    }
    setIsDialogOpen(false);
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user: UserRow) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && user.isAdmin) ||
        (roleFilter === "user" && !user.isAdmin);

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  if (error) return "An error has occurred.";
  if (!users) return <AdminLoading />;

  const columns = createUserColumns(handleDeleteClick);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-base-content/60 mt-2">
            {filteredUsers.length} of {users?.length || 0} users
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        toolbar={
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-base-100 text-base-content border-base-300">
          <DialogHeader>
            <DialogTitle className="text-base-content">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-base-content/70">
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              className="text-base-content border-base-300"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
