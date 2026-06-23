import Link from "next/link";
import {
  Cpu,
  Phone,
  Mail,
  MapPin,
  Truck,
  Headset,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

import NewsletterForm from "./NewsletterForm";

const shopLinks = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/search" },
  { label: "Cart", href: "/cart" },
];

const accountLinks = [
  { label: "Sign In", href: "/signin" },
  { label: "Profile", href: "/profile" },
  { label: "Order History", href: "/order-history" },
  { label: "Track Orders", href: "/order-tracking" },
];

const categories = [
  "Laptops & Computers",
  "Servers & Storage",
  "Networking",
  "Software",
  "Accessories",
];

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over $500" },
  { icon: Headset, title: "24/7 Support", desc: "Always here to help" },
  { icon: ShieldCheck, title: "1 Year Warranty", desc: "On all products" },
  { icon: CreditCard, title: "Secure Payments", desc: "Encrypted checkout" },
];

// lucide brand icons are unavailable in this version, so use inline SVG paths.
const socials = [
  {
    label: "Facebook",
    href: "#",
    path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
  },
  {
    label: "X",
    href: "#",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "Instagram",
    href: "#",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
];

const payments = ["visa", "mastercard", "paypal", "amex"] as const;

function PaymentMark({ name }: { name: (typeof payments)[number] }) {
  switch (name) {
    case "visa":
      return (
        <span className="text-[11px] font-bold tracking-tight text-[#1434CB] italic">
          VISA
        </span>
      );
    case "mastercard":
      return (
        <span className="flex items-center" aria-hidden="true">
          <span className="size-3 rounded-full bg-[#EB001B]" />
          <span className="-ml-1 size-3 rounded-full bg-[#F79E1B]" />
        </span>
      );
    case "paypal":
      return (
        <span className="text-[11px] font-bold italic">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#0070E0]">Pal</span>
        </span>
      );
    case "amex":
      return (
        <span className="rounded-[3px] bg-[#1F72CF] px-1 py-px text-[8px] font-bold tracking-wide text-white">
          AMEX
        </span>
      );
  }
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold text-foreground">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card text-card-foreground">
      {/* Newsletter */}
      <div className="border-b border-border bg-primary/5">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-md">
            <h3 className="text-xl font-bold tracking-tight text-foreground lg:text-2xl">
              Get exclusive deals &amp; tech updates
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Subscribe for new arrivals, special offers, and IT insights —
              straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-b border-border">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-8 lg:grid-cols-4 lg:px-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand + contact */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Cpu className="size-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Compulink
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  IT Solutions
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your trusted partner for enterprise IT solutions — quality
              hardware, software, and services since 2010.
            </p>

            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-primary" />
                <a
                  href="tel:+263000000000"
                  className="transition-colors hover:text-primary"
                >
                  +263 (0) 000 000 000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0 text-primary" />
                <a
                  href="mailto:support@compulink.co"
                  className="transition-colors hover:text-primary"
                >
                  support@compulink.co
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="size-4 shrink-0 text-primary" />
                Harare, Zimbabwe
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterLinks title="Shop" links={shopLinks} />
          <FooterLinks title="Account" links={accountLinks} />

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row lg:px-8">
          <p className="order-2 text-sm text-muted-foreground sm:order-1">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">Compulink</span>.
            All rights reserved.
          </p>
          <div className="order-1 flex items-center gap-2 sm:order-2">
            <span className="mr-1 text-xs text-muted-foreground">We accept</span>
            {payments.map((payment) => (
              <span
                key={payment}
                className="flex h-7 w-11 items-center justify-center rounded-md border border-border bg-white shadow-sm"
              >
                <PaymentMark name={payment} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
