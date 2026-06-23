"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  User,
  Home,
  Building2,
  Mailbox,
  Globe,
  ArrowRight,
  Loader2,
  Lock,
  Truck,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

import CheckoutSteps from "@/components/CheckoutSteps";
import useCartService from "@/lib/hooks/useCartStore";
import { ShippingAddress } from "@/lib/types";
import { round2 } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FieldConfig = {
  id: Extract<keyof ShippingAddress, string>;
  label: string;
  placeholder: string;
  icon: React.ElementType;
  autoComplete: string;
  full?: boolean;
};

const fields: FieldConfig[] = [
  {
    id: "fullName",
    label: "Full name",
    placeholder: "Jane Doe",
    icon: User,
    autoComplete: "name",
    full: true,
  },
  {
    id: "address",
    label: "Street address",
    placeholder: "123 Main Street",
    icon: Home,
    autoComplete: "street-address",
    full: true,
  },
  {
    id: "city",
    label: "City",
    placeholder: "Harare",
    icon: Building2,
    autoComplete: "address-level2",
  },
  {
    id: "postalCode",
    label: "Postal code",
    placeholder: "00263",
    icon: Mailbox,
    autoComplete: "postal-code",
  },
  {
    id: "country",
    label: "Country",
    placeholder: "Zimbabwe",
    icon: Globe,
    autoComplete: "country-name",
    full: true,
  },
];

const assurances = [
  { icon: Lock, title: "Secure checkout", desc: "256-bit SSL encryption" },
  { icon: Truck, title: "Fast delivery", desc: "Free over $100 · 2–5 days" },
  { icon: PackageCheck, title: "Easy returns", desc: "30-day return policy" },
];

// Returns false on the server and during hydration, then true on the client —
// avoids hydration mismatches for the persisted cart store.
const emptySubscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

const Form = () => {
  const router = useRouter();
  const {
    saveShippingAddress,
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = useCartService();
  const { isLoaded, isSignedIn } = useUser();

  const hydrated = useHydrated();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddress>({
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push(`/signin?callbackUrl=/shipping`);
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    setValue("fullName", shippingAddress.fullName);
    setValue("address", shippingAddress.address);
    setValue("city", shippingAddress.city);
    setValue("postalCode", shippingAddress.postalCode);
    setValue("country", shippingAddress.country);
  }, [setValue, shippingAddress]);

  const formSubmit: SubmitHandler<ShippingAddress> = async (form) => {
    saveShippingAddress(form);
    router.push("/payment");
  };

  const itemCount = items.reduce((acc, item) => acc + (item?.qty ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <CheckoutSteps current={1} />

        <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* Address form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Shipping address
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(formSubmit)}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                {fields.map(
                  ({ id, label, placeholder, icon: Icon, autoComplete, full }) => (
                    <div
                      key={id}
                      className={cn("space-y-2", full && "sm:col-span-2")}
                    >
                      <Label htmlFor={id}>{label}</Label>
                      <div className="relative">
                        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id={id}
                          placeholder={placeholder}
                          autoComplete={autoComplete}
                          aria-invalid={Boolean(errors[id])}
                          className="h-11 pl-10"
                          {...register(id, {
                            required: `${label} is required`,
                          })}
                        />
                      </div>
                      {errors[id]?.message && (
                        <p className="text-sm text-destructive">
                          {errors[id]?.message}
                        </p>
                      )}
                    </div>
                  )
                )}

                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 w-full gap-2 text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue to payment
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Assurances */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {assurances.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <Icon className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Order summary
                </h2>
              </div>

              {!hydrated ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-4 w-full animate-pulse rounded bg-muted"
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Your cart is empty.
                </p>
              ) : (
                <>
                  <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
{items
                       .filter(item => item !== null && item !== undefined)
                       .map((item) => (
                         <li key={item.slug} className="flex items-center gap-3">
                           <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img
                               src={item.image}
                               alt={item.name}
                               className="size-full object-contain p-1"
                             />
                             <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                               {item.qty}
                             </span>
                           </div>
                           <div className="min-w-0 flex-1">
                             <p className="truncate text-sm font-medium text-foreground">
                               {item.name}
                             </p>
                             <p className="text-xs text-muted-foreground">
                               ${item.price}
                             </p>
                           </div>
                         </li>
                       ))}
                  </ul>

                  <div className="my-4 h-px bg-border" />

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                      </dt>
                      <dd className="font-medium text-foreground">
                        ${itemsPrice}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Shipping</dt>
                      <dd className="font-medium text-foreground">
                        {shippingPrice === 0 ? (
                          <span className="text-primary">Free</span>
                        ) : (
                          `$${shippingPrice}`
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Estimated tax</dt>
                      <dd className="font-medium text-foreground">${taxPrice}</dd>
                    </div>
                  </dl>

                  <div className="my-4 h-px bg-border" />

                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ${totalPrice}
                    </span>
                  </div>

                  {shippingPrice > 0 && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="size-3.5 shrink-0 text-primary" />
                      Add ${round2(100 - itemsPrice)} more to unlock free shipping
                    </p>
                  )}
                </>
              )}

              <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" />
                Secure, encrypted checkout
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Form;
