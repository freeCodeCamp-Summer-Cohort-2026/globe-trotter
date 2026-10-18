import ErrorState from "@/components/ErrorState";
import GoBackButton from "@/components/BackButton";
import RefreshButton from "@/components/RefreshButton";
import Image from "next/image";
import ActionLink from "@/components/ActionLink";

export default function notFound() {
  return (
    <>
      <ErrorState
        title="Page not found !"
        description="We couldn't find the page you were looking for. It may have moved or no longer exists."
        heroGraphic={
          <div className="flex flex-col items-center justify-center w-full gap-6 text-center">
            <h1 className="text-[clamp(1rem,5vw,2.5rem)] font-extrabold font-[Avenir] tracking-wide ">
              404 <br /> Oops!
            </h1>
            <Image
              src="/illustrations/404-guy.svg"
              alt="404 - Page Not Found"
              width={400}
              height={400}
              className="w-1/2 h-1/2 object-contain"
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
