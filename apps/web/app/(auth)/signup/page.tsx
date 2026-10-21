"use client"

import { signupSchema, SignupValues } from "@repo/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "../../../src/lib/auth-client";
import { Button, Card, EmptyState, FormError, FormField, Input } from "@repo/ui";
import { Mail } from "lucide-react";
import Link from "next/link";

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
      ...values,
      callbackURL: "/verify-email"
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
      <Card padding="lg">
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
      </Card>
    )
  }

  //TODO: Card w/ padding lg, heading block and Google button w/ divider will appear on other auth forms - might be worth extracting into components later on

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-slate-400">
            Start learning geography the interactive way!
          </p>
        </div>

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

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })}
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  )
}
