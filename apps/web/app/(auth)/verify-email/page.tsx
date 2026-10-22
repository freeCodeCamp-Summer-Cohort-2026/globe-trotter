import getSession from "../../../src/lib/getSession";
import { Button, Card, EmptyState } from "@repo/ui";
import { Mail, Whistle } from "lucide-react";
import { redirect } from "next/navigation";

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
          icon={<Whistle className="size-8 text-green-600" aria-hidden="true" />}
          title="Verification failed"
          description={(
            <>
              This link may have expired or already been used.
              You can request a new one from the sign-in page.
            </>
          )}
          action={(
            <>
              <Button variant="primary" onClick={() => redirect("/login")}>
                Back to sign in
              </Button>
              <Button variant="secondary" onClick={() => redirect("/login?unverified=true")}>
                Resend verification email
              </Button>
            </>
          )}
        />
      </Card>
    );
  }

  // Only bother fetching the session if there is no error
  const session = getSession();
  const existingSession: boolean = session !== null;

  const emailVerifiedButtons = [
    <Button variant={existingSession ? "primary" : "secondary"} onClick={() => redirect("/modules")}>{"Already signed in?"}</Button>,
    <Button variant={existingSession ? "secondary" : "primary"} onClick={() => redirect("/login?verified=true")}>{"Sign in"}</Button>,
  ];

  return (
    <Card padding="lg">
      <EmptyState
          icon={<Mail className="size-8 text-green-600" aria-hidden="true" />}
          title="Email verified"
          description="Your email address is confirmed. You can now sign in."
          action={(
            <>
              {existingSession ? emailVerifiedButtons : emailVerifiedButtons.reverse()}
            </>
          )}
        />
    </Card>
  );
}
