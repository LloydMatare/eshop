import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Sign In", "Shipping", "Payment", "Review"];

const CheckoutSteps = ({ current = 0 }: { current?: number }) => {
  return (
    <nav aria-label="Checkout progress" className="mx-auto w-full max-w-3xl">
      <ol className="flex items-center pb-2 sm:pb-8">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isCurrent = index === current;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="relative flex flex-col items-center">
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary",
                    !isComplete &&
                      !isCurrent &&
                      "border-border text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="size-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "absolute top-11 left-1/2 hidden -translate-x-1/2 text-xs font-medium whitespace-nowrap sm:block",
                    isComplete || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CheckoutSteps;
