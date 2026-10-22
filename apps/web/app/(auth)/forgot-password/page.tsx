"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordValues } from "@repo/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "../../../src/lib/auth-client";
import AuthCard from "../_components/AuthCard";
import { Button, EmptyState, FormField, FormError, Input } from "@repo/ui";
import { Mail } from "lucide-react";
import AuthHeading from "../_components/AuthHeading";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const onSubmit = async (values: ForgotPasswordValues) => {
    setServerError(null);

    const { error } = await authClient.requestPasswordReset({
      ...values,
      redirectTo: "/reset-password"
    });
  
    if (error) {
      setServerError("Something went wrong. Please try again.");
      console.warn(`[auth] Password reset request failed: ${error}`);
      return;
    }

    setSubmittedEmail(values.email);
  }

  if (submittedEmail) {
    return (
      <AuthCard>
        <EmptyState
          icon={<Mail className="size-8 text-green-600" aria-hidden="true" />}
          title="Check your email"
          description={(
            <>
              {`If an email exists for ${submittedEmail}, we've sent a password reset link.`}
              Check your inbox.
            </>
          )}
          action={(
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedEmail(null);
                reset();
              }}
            >
              Try a different email
            </Button>
          )}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthHeading
          title="Reset your password"
          description="Enter your email address and we'll send you a link to reset your password."
        />

        {serverError && <FormError>{serverError}</FormError>}

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </FormField>

        <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
          Send reset link
        </Button>

        <p className="text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
