"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { syncUserProfile } from "@/features/users/actions";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/firebase/client";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
  });

  const handleEmailSignUp = async (values: SignUpValues) => {
    setSubmitting(true);
    try {
      // 1. Create firebase user credentials
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      // 2. Update display name in Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: values.name,
      });

      // Sync session cookie to server explicitly first to allow syncUserProfile requireAuth to pass
      const token = await userCredential.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      // 3. Sync to Firestore public & private profiles
      await syncUserProfile({
        uid: userCredential.user.uid,
        email: values.email,
        displayName: values.name,
        photoURL: null,
      });

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();

      const currentUser = auth.currentUser;
      if (currentUser) {
        // Sync session cookie to server explicitly first
        const token = await currentUser.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        await syncUserProfile({
          uid: currentUser.uid,
          email: currentUser.email!,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
      }

      toast.success("Account logged in via Google!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Google Authentication failed.",
      );
    } finally {
      setGoogleSubmitting(false);
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
          Create your free account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 border border-border/80 shadow-md rounded-lg sm:px-10">
          <form
            onSubmit={handleSubmit(handleEmailSignUp)}
            className="space-y-5 font-sans"
          >
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-foreground"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="block w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

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

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-foreground"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="block w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-foreground"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="block w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting || googleSubmitting}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 h-11 text-sm transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Signup */}
            <div className="mt-6">
              <button
                onClick={handleGoogleSignUp}
                disabled={submitting || googleSubmitting}
                className="w-full inline-flex items-center justify-center rounded-md border border-border bg-card hover:bg-muted text-sm font-semibold text-foreground h-11 transition-colors disabled:opacity-50 gap-2"
              >
                {googleSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>

          {/* Login link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
