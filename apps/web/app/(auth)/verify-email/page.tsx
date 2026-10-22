import getSession from "../../../src/lib/getSession";
import { buttonVariants, Card, EmptyState } from "@repo/ui";
import { AlertCircle, Mail } from "lucide-react";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  if (error) {
    return (
      <Card padding="lg">
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
      </Card>
    );
  }

  // Only bother fetching the session if there is no error
  const session = await getSession();
  const existingSession: boolean = session !== null;

  return (
    <Card padding="lg">
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
    </Card>
  );
}
