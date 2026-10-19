"use client";
import ErrorState from "@/components/ErrorState";
import BackButton from "@/components/BackButton";
import Image from "next/image";
import ActionLink from "@/components/ActionLink";
import HomeButton from "@/components/HomeButton";

export default function NotFound() {
  return (
      <ErrorState
        title="Page not found !"
        description="We couldn't find the page you were looking for. It may have moved or no longer exists."
        heroGraphic={
          <div className="flex w-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-2/6 flex-col justify-center align-middle">
              <h1 className="font-[Avenir] text-2xl font-extrabold tracking-wide md:text-4xl lg:text-4xl">
                404 <br /> Oops!
              </h1>
            </div>
            <div className="h-4/6">
              <Image
                src="/illustrations/404-guy.svg"
                alt="404 - Page Not Found"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>
          </div>
        }
        primaryAction={
          <>
            <HomeButton />
            <BackButton />
          </>
        }
        secondaryAction={<ActionLink />}
      />
  );
}
