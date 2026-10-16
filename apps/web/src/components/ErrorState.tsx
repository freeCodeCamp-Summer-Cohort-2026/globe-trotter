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
      <div className="h-screen flex flex-col w-full">
        <Header />
        <main className="h-[calc(100svh-148px)] flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center ">
          {/* Hero Section */}
          <div className="w-full h-6/12 flex justify-center mb-8">
            {heroGraphic}
          </div>
          {/* Typography Section */}
          <div className="flex flex-col gap-4 font-inter w-full ">
            <h1 className="text-3xl md:text-4xl font-inter font-normal text-gray-900 ">
              {title}
            </h1>
            {description && (
              <p className="text-base md:text-lg text-gray-600 max-w-lg mx-auto ">
                {description}
              </p>
            )}
          </div>
          {/* Action Section */}
          <div className="w-full flex flex-col items-center gap-6 font-inter">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
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
