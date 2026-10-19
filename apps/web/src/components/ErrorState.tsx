import { Footer, Header } from "@repo/ui";

interface ErrorStateProps {
  heroGraphic?: React.ReactNode;
  title: string;
  description?: string;
  digest?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export default function ErrorState({
  title,
  description,
  digest,
  primaryAction,
  secondaryAction,
  heroGraphic,
}: ErrorStateProps) {
  return (
    <>
      <div className="flex h-screen w-full flex-col">
        <Header />
        <main className="mx-auto flex h-svh w-full max-w-3xl flex-1 flex-col text-center">
          {/* Hero Section */}
          <div className="mb-4 flex max-h-80 w-full justify-center">
            {heroGraphic}
          </div>
          {/* Typography Section */}
          <div className="flex w-full flex-col gap-4 font-inter">
            <h1 className="font-inter text-3xl font-normal text-gray-900 md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mx-auto max-w-lg text-base text-gray-600 md:text-lg">
                {description}
              </p>
            )}
            {digest && (
              <p className="text-xs text-gray-400">Error ID: {digest}</p>
            )}
          </div>
          {/* Action Section */}
          <div className="flex w-full flex-col items-center gap-6 font-inter">
            <div className="flex w-full flex-col items-center justify-center gap-8 sm:flex-row">
              {primaryAction}
            </div>
            {secondaryAction}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
