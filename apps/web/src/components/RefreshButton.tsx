"use client";

import { Button } from "@repo/ui";
import Image from "next/image";

export default function RefreshButton({ reset }: { reset: () => void }) {
  return (
    <Button
      onClick={() => reset()}
      className="font-normal min-w-8 border border-black"
    >
      <Image
        src="/illustrations/refresher.svg"
        alt="refresh now"
        width={50}
        height={50}
        className="size-5"
      />{" "}
      Retry
    </Button>
  );
}
