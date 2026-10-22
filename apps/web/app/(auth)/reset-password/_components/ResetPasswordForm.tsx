"use client"

import { resetPasswordSchema, ResetPasswordValues } from "@repo/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "../../../../src/lib/auth-client";
import { Button, buttonVariants, EmptyState, FormError, FormField, Input } from "@repo/ui";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import AuthCard from "../../_components/AuthCard";
import AuthHeading from "../../_components/AuthHeading";
import OAuthButton from "../../_components/OAuthButton";
import OrDivider from "../../_components/OrDivider";
import { redirect, useSearchParams } from "next/navigation";

export default function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = async (values: ResetPasswordValues) => {
    setServerError(null);

    const { error } = await authClient.resetPassword({
      //? Non-null assertion is safe here because page renders error state and never reaches submit handler when token is null
      token: token!,
      newPassword: values.newPassword,
    });

    if (error) {
      if (
        error.code === "INVALID_TOKEN" ||
        error.code === "TOKEN_EXPIRED" ||
        error.status === 400
      ) {
        setTokenError(true);
        return;
      }
      setServerError("Something went wrong. Please try again.");
      return;
    }

    redirect("/login?reset=true");
  }

  if (!token || tokenError) {
    return (
      <AuthCard>
        <EmptyState
          icon={<AlertCircle className="size-8 text-orange-600" aria-hidden="true" />}
          title="Invalid reset link"
          description={(
            <>
              This link is missing or has expired.
              Request a new reset password email to continue.
            </>
          )}
          action={
            <Link href="/forgot-password" className={buttonVariants({ variant: "primary" })}>
              Request a new link
            </Link>
          }
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthHeading
          title="Set a new password"
          description="Choose a new password for your account."
        />

        {serverError && <FormError>{serverError}</FormError>}

        <FormField
          label="New password"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
          hint="At least 8 characters, with at least one uppercase character, one lowercase character and one number"
          required
        >
          <Input id="newPassword" type="password" autoComplete="new-password" {...register("newPassword")} />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>

        <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
          Reset password
        </Button>

        <p className="text-center text-sm text-slate-600">
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
