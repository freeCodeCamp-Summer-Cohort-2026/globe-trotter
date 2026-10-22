import getSession from "../../../src/lib/getSession";
import { buttonVariants, EmptyState } from "@repo/ui";
import { AlertCircle, Mail } from "lucide-react";
import Link from "next/link";
import AuthCard from "../_components/AuthCard";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  //TODO: Card w/ padding lg will appear on other auth pages - might be worth extracting into a component later on

  if (error) {
    return (
      <AuthCard>
        <EmptyState
          icon={<AlertCircle className="size-8 text-orange-600" aria-hidden="true" />}
          title="Verification failed"
          description={(
            <>
              This link may have expired or already been used.
              You can request a new one from the sign-in page.
            </>
          )}
          action={(
            <>
              <Link href="/login" className={buttonVariants({ variant: "primary" })}>
                Back to sign in
              </Link>
              <Link href="/login?unverified=true" className={buttonVariants({ variant: "secondary" })}>
                Resend verification email
              </Link>
            </>
          )}
        />
      </AuthCard>
    );
  }

  // Only bother fetching the session if there is no error
  const session = await getSession();
  const existingSession: boolean = session !== null;

  return (
    <AuthCard>
      <EmptyState
          icon={<Mail className="size-8 text-green-600" aria-hidden="true" />}
          title="Email verified"
          description="Your email address is confirmed. You can now sign in."
          action={existingSession ? (
            <>
              <Link href="/modules" className={buttonVariants({ variant: "primary" })}>
                Already signed in?
              </Link>
              <Link href="/login?verified=true" className={buttonVariants({ variant: "secondary" })}>
                Sign in
              </Link>
            </>
          ) : (
            <>
              <Link href="/login?verified=true" className={buttonVariants({ variant: "primary" })}>
                Sign in
              </Link>
              <Link href="/modules" className={buttonVariants({ variant: "secondary" })}>
                Already signed in?
              </Link>
            </>
          )}
        />
    </AuthCard>
  );
}
