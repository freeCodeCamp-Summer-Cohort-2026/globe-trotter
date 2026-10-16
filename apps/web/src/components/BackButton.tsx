"use client";
import { Button } from '@repo/ui'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'

export default function GoBackButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      className="bg-white min-w-24 text-black border-1 border-black font-normal"
    >
      <Image
        src="/illustrations/arrow-left.svg"
        alt="refresh now"
        width={50}
        height={50}
        className="w-7 h-7"
      />{" "}
      Go Back
    </Button>
  );
}