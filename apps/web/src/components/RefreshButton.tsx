"use client";

import { Button } from "@repo/ui";
import Image from "next/image";

export default function RefreshButton() {
  return (
    <Button
      onClick={() => window.location.reload()}
      className="font-normal min-w-8 border border-black"
    >
      <Image
        src="/illustrations/refresher.svg"
        alt="refresh now"
        width={50}
        height={50}
        className="w-5 h-5"
      />{" "}
      Retry
    </Button>
  );
}
