"use client";

import ActionLink from "@/components/ActionLink";
import BackButton from "@/components/BackButton";
import ErrorState from "@/components/ErrorState";
import RefreshButton from "@/components/RefreshButton";
import { logError } from "@/lib/log-error";
import Image from "next/image";
import { useEffect } from "react";

export default function GlobalError({
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
      <html>
        <body>
          <ErrorState
            title="Can't reach the server !"
            description="Check your connection and try again."
            digest={error.digest}
            heroGraphic={
              <div className="flex w-full flex-col items-center justify-center gap-6 text-center">
                <h1 className="font-[Avenir] text-[clamp(1rem,5vw,2.5rem)] font-extrabold tracking-wide ">
                  Oops! <br />{" "}
                  <span className="font-[Newsreader] font-normal text-red-800">
                    Network Error!
                  </span>
                </h1>
                <Image
                  src="/illustrations/network-error.svg"
                  alt="Network Error"
                  width={400}
                  height={400}
                  className="size-3/4 object-contain"
                  priority
                />
              </div>
            }
            primaryAction={
              <>
                <RefreshButton reset={reset}/>
                <BackButton />
              </>
            }
            secondaryAction={<ActionLink />}
          />
        </body>
      </html>
  );
}
