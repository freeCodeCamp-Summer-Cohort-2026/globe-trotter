"use client";

import ActionLink from "@/components/ActionLink";
import GoBackButton from "@/components/BackButton";
import ErrorState from "@/components/ErrorState";
import RefreshButton from "@/components/RefreshButton";
import { logError } from "@/lib/log-error";
import Image from "next/image";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError(error);
  }, [error]);
  return (
      <ErrorState
        title="Something went wrong !"
        description="An unexpected error occurred on our end. We're looking into it."
        digest={error.digest}
        heroGraphic={
          <div className="flex flex-col items-center justify-center w-full text-center">
            <Image
              src="/illustrations/500.svg"
              alt="500 - Internal Server Error"
              width={400}
              height={400}
              className="size-4/5 object-contain"
              priority
            />
          </div>
        }
        primaryAction={
          <>
            <RefreshButton reset={reset} />
            <GoBackButton />
          </>
        }
        secondaryAction={<ActionLink />}
      />
  );
}
