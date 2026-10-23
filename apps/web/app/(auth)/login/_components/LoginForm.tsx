"use client"

import { loginSchema, LoginValues } from "@repo/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "../../../../src/lib/auth-client";
import { Button, EmptyState, FormError, FormField, Input } from "@repo/ui";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "../../_components/AuthCard";
import AuthHeading from "../../_components/AuthHeading";
import OAuthButton from "../../_components/OAuthButton";
import OrDivider from "../../_components/OrDivider";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const safeRedirect = redirectPath && /^\/[^/]/.test(redirectPath) ? redirectPath : "/modules";
  const justBeenVerified = searchParams.get("verified") === "true";
  const justResetPassword = searchParams.get("reset") === "true";

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setUnverifiedEmail(null);

    const { error } = await authClient.signIn.email({
      ...values,
      callbackURL: `${window.location.origin}${safeRedirect}`
    });

    if (!error) return;

    if (error.code === "EMAIL_NOT_VERIFIED") {
      setUnverifiedEmail(values.email);
      return;
    }

    // INVALID_EMAIL_OR_PASSWORD should be swallowed into the server error here
    setServerError("Invalid email or password. Please try again.");
    console.warn("[auth] Failed to log user in: ", error);
  }

  if (unverifiedEmail) {
    return (
      <AuthCard>
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
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthHeading
          title="Sign in to your account"
          description="Continue learning geography the interactive way!"
        />

        {justBeenVerified && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Email verified. Sign in to continue.
          </div>
        )}

        {justResetPassword && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Password updated. Sign in with your new password to continue.
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

        <OrDivider />

        <OAuthButton
          callbackPath={safeRedirect}
          setOauthError={setOauthError}
        />

        {oauthError && <FormError>{oauthError}</FormError>}

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
