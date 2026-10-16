"use client";

import ActionLink from "@/components/ActionLink";
import GoBackButton from "@/components/BackButton";
import ErrorState from "@/components/ErrorState";
import RefreshButton from "@/components/RefreshButton";
import Image from "next/image";

export default function error() {
  return (
    <>
      <ErrorState
        title="Something went wrong !"
        description="An unexpected error occurred on our end. We're looking into it."
        heroGraphic={
          <div className="flex flex-col items-center justify-center w-full gap text-center ">
            <Image
              src="/illustrations/500.svg"
              alt="500 - Internal Server Error"
              width={400}
              height={400}
              className="w-4/5 h-4/5 object-contain"
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
    </>
  );
}
