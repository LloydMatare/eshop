"use client";
import * as XLSX from "xlsx";
import { formatId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  Plus,
  Upload,
  Trash2,
  Search,
  X,
} from "lucide-react";
import DataError from "@/components/admin/DataError";
import { fetcher } from "@/lib/services/fetcher";
import AdminLoading from "@/components/admin/AdminLoading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProductColumns, type ProductRow } from "./columns";

interface UploadedProduct {
  part: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
  brand: string;
  countInStock: number;
  description: string;
}

export default function Products() {
  const {
    data: products,
    error,
    isLoading,
    mutate,
  } = useSWR(`/api/admin/products`, fetcher);
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const router = useRouter();

  const { trigger: deleteProduct } = useSWRMutation(
    `/api/admin/products`,
    async (url, { arg }: { arg: { productId: string } }) => {
      const toastId = toast.loading("Deleting product...");
      const res = await fetch(`${url}/${arg.productId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Product deleted successfully", { id: toastId });
        mutate();
      } else {
        toast.error(data.message, { id: toastId });
      }
    }
  );

  const { trigger: createProduct, isMutating: isCreating } = useSWRMutation(
    `/api/admin/products`,
    async (url) => {
      const toastId = toast.loading("Creating product...");
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to create product", {
            id: toastId,
          });
          return;
        }

        toast.success("Product created successfully", { id: toastId });
        mutate();
        router.push(`/admin/products/${data.product._id}`);
      } catch (error) {
        console.error("Error creating product:", error);
        toast.error("Failed to create product", { id: toastId });
      }
    }
  );

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product: ProductRow) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.part?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in-stock" && product.countInStock > 0) ||
        (stockFilter === "out-of-stock" && product.countInStock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p: ProductRow) => p.category)));
  }, [products]);

  const handleFilterChange = () => {};

  const handleDeleteConfirm = () => {
    if (deleteProductId) {
      deleteProduct({ productId: deleteProductId });
      setDeleteProductId(null);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<UploadedProduct>(sheet);

      setUploadedData(jsonData);
      for (const product of jsonData) {
        try {
          const response = await fetch(`/api/admin/products/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
          });
          if (!response.ok) {
            const errorData = await response.json();
            toast.error(`Failed to add product: ${errorData.message}`);
          } else {
            toast.success(`Product ${product.name || ""} added successfully`);
          }
        } catch (err) {
          console.error("Error uploading product:", err);
          toast.error(`Error uploading product: ${product.name || ""}`);
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (error) return <div>An error has occurred: {error.message}</div>;
  if (isLoading) return <AdminLoading />;
  if (!products || products.length === 0) return <DataError name="products" />;

  const columns = createProductColumns((id) => setDeleteProductId(id));

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-base-content/60 mt-2">
            {filteredProducts.length} of {products?.length || 0} products
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            disabled={isCreating}
            onClick={() => createProduct()}
          >
            {isCreating ? <Spinner /> : <Plus />}
            Create Product
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            id="file-upload"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button asChild variant="secondary">
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload />
              Upload Excel
            </label>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        toolbar={
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    handleFilterChange();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={stockFilter}
              onValueChange={(value) => {
                setStockFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog
        open={!!deleteProductId}
        onOpenChange={() => setDeleteProductId(null)}
      >
        <DialogContent className="bg-base-100 text-base-content border-base-300">
          <DialogHeader>
            <DialogTitle className="text-base-content">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-base-content/70">
            Are you sure you want to delete this product? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-base-content border-base-300"
              onClick={() => setDeleteProductId(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
