"use client"

import { Button } from "@repo/ui";
import { authClient } from "../../../src/lib/auth-client";

type OAuthButtonProps = {
  callbackPath: string | null;
  disabled?: boolean;
  className?: string;
}

export default function OAuthButton({ callbackPath, disabled = false, className }: OAuthButtonProps) {
  const handleClick = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}${callbackPath ?? "/modules"}`
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