"use client"

import { Button } from "@repo/ui";
import { authClient } from "../../../src/lib/auth-client";

type OAuthButtonProps = {
  callbackURL: string | null;
  disabled?: boolean;
  className?: string;
}

export default function OAuthButton({ callbackURL, disabled = false, className }: OAuthButtonProps) {
  const handleClick = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackURL ?? `${window.location.origin}/modules`
    });

    if (error) console.error(`[oauth] OAuth sign-in failed: ${error}`);
  }
  
  return (
    <Button
      type="button"
      disabled={disabled}
      variant="outline"
      className={className ?? "w-full"}
      onClick={handleClick}
    >
      Continue with Google
    </Button>
  )
}