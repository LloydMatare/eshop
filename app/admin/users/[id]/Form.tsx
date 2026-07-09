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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Shield,
  ShieldOff,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export default function UserEditForm({ userId }: { userId: string }) {
  const { data: user, error } = useSWR(
    `/api/admin/users/${userId}`,
    fetcher
  );
  const router = useRouter();

  const { trigger: updateUser, isMutating: isUpdating } = useSWRMutation(
    `/api/admin/users/${userId}`,
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

      toast.success("User updated successfully");
      router.push("/admin/users");
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<User>();

  const isAdmin = watch("isAdmin");

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name);
    setValue("email", user.email);
    setValue("isAdmin", user.isAdmin);
  }, [user, setValue]);

  const formSubmit = async (formData: any) => {
    await updateUser(formData);
  };

  if (error) return error.message;
  if (!user) return <AdminLoading />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Edit User {formatId(userId)}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage user details and permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(formSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic details about this user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="name"
                      placeholder="John Doe"
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
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-9"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      })}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">
                      {errors.email.message}
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
                  {isAdmin ? (
                    <Shield className="size-4 text-primary" />
                  ) : (
                    <ShieldOff className="size-4 text-muted-foreground" />
                  )}
                  Permissions
                </CardTitle>
                <CardDescription>
                  Control access level for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-xl border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="isAdmin" className="text-sm font-medium">
                      Administrator
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin
                        ? "Full access to all admin features"
                        : "Limited to customer features"}
                    </p>
                  </div>
                  <Switch
                    id="isAdmin"
                    size="default"
                    checked={isAdmin}
                    onCheckedChange={(checked) =>
                      setValue("isAdmin", checked)
                    }
                  />
                </div>
                <input
                  type="hidden"
                  {...register("isAdmin")}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="size-4" />
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <Spinner />
            ) : (
              <Save className="size-4" />
            )}
            Update User
          </Button>
        </div>
      </form>
    </div>
  );
}
