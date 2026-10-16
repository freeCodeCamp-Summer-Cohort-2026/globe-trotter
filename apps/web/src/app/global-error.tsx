"use client";

import ActionLink from "@/components/ActionLink";
import GoBackButton from "@/components/BackButton";
import ErrorState from "@/components/ErrorState";
import RefreshButton from "@/components/RefreshButton";
import Image from "next/image";

export default function globalError() {
  return (
    <>
      <html>
        <body>
          <ErrorState
            title="Can't reach the server !"
            description="Check your connection and try again."
            heroGraphic={
              <div className="flex flex-col items-center justify-center w-full gap-6 text-center">
                <h1 className="text-[clamp(1rem,5vw,2.5rem)] font-extrabold font-[Avenir] tracking-wide ">
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
                  className="w-3/4 h-3/4 object-contain"
                  priority
                />
              </div>
            }
            primaryAction={
              <> 
                <RefreshButton />
                <GoBackButton />
              </>
            }
            secondaryAction={<ActionLink />}
          />
        </body>
      </html>
    </>
  );
}
