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
      <div className="flex flex-col w-full h-screen">
        <Header />
        <main className="flex flex-col flex-1 w-full max-w-3xl h-svh mx-auto text-center">
          {/* Hero Section */}
          <div className="flex justify-center w-full max-h-80 mb-4">
            {heroGraphic}
          </div>
          {/* Typography Section */}
          <div className="flex flex-col w-full gap-4 font-inter">
            <h1 className="font-normal font-inter text-3xl text-gray-900 md:text-4xl">
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
          <div className="flex flex-col items-center w-full gap-6 font-inter">
            <div className="flex flex-col items-center justify-center w-full gap-8 sm:flex-row">
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
