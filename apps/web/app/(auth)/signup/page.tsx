"use client"

import { signupSchema, SignupValues } from "@repo/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "../../../src/lib/auth-client";
import { Button, EmptyState, FormError, FormField, Input } from "@repo/ui";
import { Mail } from "lucide-react";
import Link from "next/link";
import AuthCard from "../_components/AuthCard";
import AuthHeading from "../_components/AuthHeading";
import OAuthButton from "../_components/OAuthButton";
import OrDivider from "../_components/OrDivider";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema)
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const onSubmit = async (values: SignupValues) => {
    setServerError(null);

    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: new URL("/verify-email", window.location.origin).toString()
    });

    if (error) {
      if (error.code === "USER_ALREADY_EXISTS") {
        setServerError("An account with this email already exists. Try signing in instead.");
      } else {
        setServerError(error.message ?? "Something went wrong. Please try again.");
      }
      return;
    }

    setSuccessEmail(values.email);
  }

  if (successEmail) {
    return (
      <AuthCard>
        <EmptyState
          icon={<Mail className="size-8 text-green-600" aria-hidden="true" />}
          title="Check your email"
          description={(
            <>
              We've sent a verification link to {successEmail}. Click on it to activate your account.
              If you don't see it, check your spam folder.
            </>
          )}
          action={
            <Button variant="outline" onClick={() => setSuccessEmail(null)}>
              Try a different email
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
          title="Create your account"
          description="Start learning geography the interactive way!"
        />

        {serverError && <FormError>{serverError}</FormError>}

        <FormField label="Name" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" autoComplete="name" {...register("name")} />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters, with at least one uppercase character, one lowercase character and one number"
          required
        >
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
        </FormField>

        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </FormField>

        <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
          Create account
        </Button>

        <OrDivider />

        <OAuthButton
          callbackURL={new URL("/modules", window.location.origin).toString()}
        />

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
