import ErrorState from "@/components/ErrorState";
import GoBackButton from "@/components/BackButton";
import RefreshButton from "@/components/RefreshButton";
import Image from "next/image";
import ActionLink from "@/components/ActionLink";

export default function NotFound() {
  return (
    <>
      <ErrorState
        title="Page not found !"
        description="We couldn't find the page you were looking for. It may have moved or no longer exists."
        heroGraphic={
          <div className="flex flex-col items-center justify-center w-full gap-4 text-center">
            <div className=" h-2/6 flex flex-col justify-center align-middle">
              <h1 className=" text-2xl md:text-4xl lg:text-4xl font-extrabold font-[Avenir] tracking-wide ">
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
            <RefreshButton />
            <GoBackButton />
          </>
        }
        secondaryAction={<ActionLink />}
      />
    </>
  );
}
