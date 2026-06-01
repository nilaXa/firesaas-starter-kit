"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const handleReset = async (values: ResetValues) => {
    setSubmitting(true);
    try {
      await resetPassword(values.email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset email.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-6">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/images/firesaas-logo-wide-1024.png"
            alt="FireSaaS Logo"
            width={150}
            height={40}
            className="object-contain dark:hidden"
            style={{ width: "auto", height: "auto" }}
            priority
          />
          <Image
            src="/images/firesaas-logo-wide-light-1024.png"
            alt="FireSaaS Logo"
            width={150}
            height={40}
            className="hidden object-contain dark:block"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-marketing-heading">
          Reset your password
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Enter your email address and we will send you a link to reset your
          password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 border border-border/80 shadow-md rounded-lg sm:px-10">
          <form
            onSubmit={handleSubmit(handleReset)}
            className="space-y-6 font-sans"
          >
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-foreground"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="block w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="name@company.com"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-11 text-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </form>

          {/* Back to sign in link */}
          <div className="mt-6 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
