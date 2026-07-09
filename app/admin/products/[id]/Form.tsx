"use client";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { toast } from "sonner";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { formatId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { fetcher } from "@/lib/services/fetcher";
import AdminLoading from "@/components/admin/AdminLoading";
import { Product } from "@/lib/types";
import { upload } from "@vercel/blob/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  FileText,
  Tag,
  Hash,
  Image,
  DollarSign,
  FolderTree,
  Building2,
  Warehouse,
  ArrowLeft,
  Save,
  Upload,
} from "lucide-react";

export default function ProductEditForm({ productId }: { productId: string }) {
  const isNew = productId === "new";

  const {
    data: product,
    error,
    isLoading,
  } = useSWR(isNew ? null : `/api/admin/products/${productId}`, fetcher);
  const router = useRouter();

  const { trigger: updateProduct, isMutating: isUpdating } = useSWRMutation(
    `/api/admin/products/${productId}`,
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(arg),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Product updated successfully");
      router.push("/admin/products");
    }
  );

  const { trigger: createProduct, isMutating: isCreating } = useSWRMutation(
    `/api/admin/products`,
    async (url, { arg }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(arg),
      });
      const data = await res.json();
      if (!res.ok) return toast.error(data.message);

      toast.success("Product created successfully");
      router.push("/admin/products");
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Product>();

  useEffect(() => {
    if (isNew) {
      setValue("name", "");
      setValue("slug", "");
      setValue("part", "");
      setValue("price", 0 as any);
      setValue("image", "");
      setValue("category", "");
      setValue("brand", "");
      setValue("countInStock", 0 as any);
      setValue("description", "");
      return;
    }
    if (!product) return;
    setValue("name", product.name);
    setValue("slug", product.slug);
    setValue("part", product.part);
    setValue("price", product.price);
    setValue("image", product.image);
    setValue("category", product.category);
    setValue("brand", product.brand);
    setValue("countInStock", product.countInStock);
    setValue("description", product.description);
  }, [product, setValue, isNew]);

  const formSubmit = async (formData: any) => {
    if (isNew) {
      await createProduct(formData);
    } else {
      await updateProduct(formData);
    }
  };

  if (!isNew) {
    if (error) return error.message;
    if (!product) return <AdminLoading />;
  }

  const uploadHandler = async (e: any) => {
    const toastId = toast.loading("Uploading image...");
    try {
      const file = e.target.files[0];
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setValue("image", blob.url);
      toast.success("File uploaded successfully", {
        id: toastId,
      });
    } catch (err: any) {
      toast.error(err.message, {
        id: toastId,
      });
    }
  };

  const isMutating = isNew ? isCreating : isUpdating;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? "Create Product" : `Edit Product ${formatId(productId)}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isNew
              ? "Add a new product to your catalog"
              : "Update product details"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(formSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  The core details that identify your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="name"
                        placeholder="Wireless Bluetooth Headphones"
                        className="pl-9"
                        {...register("name", {
                          required: "Name is required",
                        })}
                        aria-invalid={!!errors.name}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="slug"
                        placeholder="wireless-bluetooth-headphones"
                        className="pl-9"
                        {...register("slug", {
                          required: "Slug is required",
                        })}
                        aria-invalid={!!errors.slug}
                      />
                    </div>
                    {errors.slug && (
                      <p className="text-xs text-destructive">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="part">
                      Part Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="part"
                        placeholder="PART-1001"
                        className="pl-9"
                        {...register("part", {
                          required: "Part number is required",
                        })}
                        aria-invalid={!!errors.part}
                      />
                    </div>
                    {errors.part && (
                      <p className="text-xs text-destructive">
                        {errors.part.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <FolderTree className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="category"
                        placeholder="Electronics"
                        className="pl-9"
                        {...register("category", {
                          required: "Category is required",
                        })}
                        aria-invalid={!!errors.category}
                      />
                    </div>
                    {errors.category && (
                      <p className="text-xs text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="brand">
                      Brand <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="brand"
                        placeholder="Sony"
                        className="pl-9"
                        {...register("brand", {
                          required: "Brand is required",
                        })}
                        aria-invalid={!!errors.brand}
                      />
                    </div>
                    {errors.brand && (
                      <p className="text-xs text-destructive">
                        {errors.brand.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="countInStock">
                      Count In Stock <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                      <Input
                        id="countInStock"
                        type="number"
                        placeholder="0"
                        className="pl-9"
                        {...register("countInStock", {
                          required: "Count in stock is required",
                        })}
                        aria-invalid={!!errors.countInStock}
                      />
                    </div>
                    {errors.countInStock && (
                      <p className="text-xs text-destructive">
                        {errors.countInStock.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail..."
                    className="min-h-28"
                    {...register("description", {
                      required: "Description is required",
                    })}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="size-4 text-primary" />
                  Pricing
                </CardTitle>
                <CardDescription>Set the product price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      {...register("price", {
                        required: "Price is required",
                      })}
                      aria-invalid={!!errors.price}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-xs text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="size-4 text-primary" />
                  Image
                </CardTitle>
                <CardDescription>Product photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">
                    Image URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="image"
                    placeholder="https://..."
                    {...register("image", {
                      required: "Image is required",
                    })}
                    aria-invalid={!!errors.image}
                  />
                  {errors.image && (
                    <p className="text-xs text-destructive">
                      {errors.image.message}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="imageFile">Upload from device</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="relative"
                      onClick={() =>
                        document.getElementById("imageFile")?.click()
                      }
                    >
                      <Upload className="size-4" />
                      Choose File
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, WebP up to 2MB
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="imageFile"
                    onChange={uploadHandler}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button variant="outline" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="size-4" />
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isMutating}>
            {isMutating ? (
              <Spinner />
            ) : (
              <Save className="size-4" />
            )}
            {isNew ? "Create Product" : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
