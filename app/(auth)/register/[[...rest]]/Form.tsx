"use client";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cpu, ChevronLeft } from "lucide-react";

const Form = () => {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl">
              <Cpu className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-base-content/60">
            Join Compulink IT Solutions today
          </p>
        </div>

        <div className="bg-base-200 rounded-2xl p-8 border border-base-300 shadow-xl">
          <SignUp forceRedirectUrl={callbackUrl} />
        </div>

        <div className="text-center mt-4">
          <p className="text-base-content/70">
            Already have an account?{" "}
            <Link
              className="link link-primary font-semibold"
              href={`/signin?callbackUrl=${callbackUrl}`}
            >
              Sign In
            </Link>
          </p>
        </div>

        <div
          className="flex items-center mt-8 cursor-pointer text-slate-400 hover:text-base-content transition-colors gap-2"
          onClick={() => window.history.back()}
        >
          <ChevronLeft size={16} />
          <p className="text-sm">Back to previous page</p>
        </div>
      </div>
    </div>
  );
};

export default Form;
