"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = email.trim();
    if (!EMAIL_REGEX.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    // No newsletter backend yet — acknowledge the subscription locally.
    setTimeout(() => {
      toast.success("You're subscribed! Watch your inbox for the latest deals.");
      setEmail("");
      setSubmitting(false);
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full lg:max-w-md">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            autoComplete="email"
            className="h-11 bg-background pl-10"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="h-11 gap-2"
        >
          {submitting ? (
            "Subscribing..."
          ) : (
            <>
              Subscribe
              <Send className="size-4" />
            </>
          )}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Join 10,000+ subscribers. No spam — unsubscribe anytime.
      </p>
    </form>
  );
}
