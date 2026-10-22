"use client"

import { loginSchema, LoginValues } from "@repo/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "../../../../src/lib/auth-client";
import { Button, Card, EmptyState, FormError, FormField, Input } from "@repo/ui";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") ?? "/modules";
  const justBeenVerified = searchParams.get("verified") === "true";

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setUnverifiedEmail(null);

    const { error } = await authClient.signIn.email({
      ...values,
      callbackURL: redirectUrl
    });

    if (!error) return;

    if (error.code === "EMAIL_NOT_VERIFIED") {
      setUnverifiedEmail(values.email);
      return;
    }

    // INVALID_EMAIL_OR_PASSWORD should be swallowed into the server error here
    setServerError("Invalid email or password. Please try again.");
  }

  if (unverifiedEmail) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={<AlertCircle className="size-8 text-orange-600" aria-hidden="true" />}
          title="Your email isn't verified yet."
          description={`We've sent a new verification link to ${unverifiedEmail}. Check your inbox and click the link to activate your account.`}
          action={
            <Button variant="outline" onClick={() => setUnverifiedEmail(null)}>
              Back to sign in
            </Button>
          }
        />
      </Card>
    )
  }

  //TODO: Card w/ padding lg, heading block and Google button w/ divider will appear on other auth pages - might be worth extracting into components later on

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Sign in to your account</h1>
          <p className="text-sm text-slate-600">
            Continue learning geography the interactive way!
          </p>
        </div>

        {justBeenVerified && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Email verified. Sign in to continue.
          </div>
        )}

        {serverError && <FormError>{serverError}</FormError>}

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="Enter the password you registered with"
          required
        >
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        </FormField>

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
          Sign in
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => authClient.signIn.social({
            provider: "google",
            callbackURL: redirectUrl
          })}
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </Card>
  )
}
