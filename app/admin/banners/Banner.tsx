"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import AdminLoading from "@/components/admin/AdminLoading";
import DataError from "@/components/admin/DataError";
import { fetcher } from "@/lib/services/fetcher";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createBannerColumns, type BannerRow } from "./columns";

export default function Banners() {
  const {
    data: banner,
    error,
    isLoading,
  } = useSWR(`/api/admin/banners`, fetcher);

  const router = useRouter();
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { trigger: deleteBanner, isMutating: isDeleting } = useSWRMutation(
    `/api/admin/banners`,
    async (url, { arg }: { arg: { bannerId: string } }) => {
      const toastId = toast.loading("Deleting banner...");
      const res = await fetch(`${url}/${arg.bannerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Banner deleted successfully", { id: toastId });
        setIsDialogOpen(false);
      } else {
        toast.error(data.message, { id: toastId });
      }
      setSelectedBannerId(null);
    }
  );

  const { trigger: createBanner, isMutating: isCreating } = useSWRMutation(
    `/api/admin/banners`,
    async (url) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Banner created successfully");
      router.push(`/admin/banners/${data.banner._id}`);
    }
  );

  const handleDeleteClick = (id: string) => {
    setSelectedBannerId(id);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedBannerId) {
      deleteBanner({ bannerId: selectedBannerId });
    }
  };

  if (error) return <div>An error has occurred: {error.message}</div>;
  if (isLoading) return <AdminLoading />;
  if (!banner || banner.length === 0) return <DataError name="banner" />;

  const columns = createBannerColumns(handleDeleteClick);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Banners
          </h1>
          <p className="text-base-content/60 mt-2">
            Manage your homepage banner slides
          </p>
        </div>
        <Button
          disabled={isCreating}
          onClick={() => createBanner()}
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          {isCreating && (
            <span className="loading loading-spinner loading-sm"></span>
          )}
          <Plus size={18} />
          Create Banner
        </Button>
      </div>

      <DataTable columns={columns} data={banner} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-base-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-base-content/70">
              Are you sure you want to delete this banner? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Delete Banner"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
