import * as React from "react";

import { cn } from "./lib/utils";

export type SpinnerProps = Omit<
  React.SVGProps<SVGSVGElement>,
  "width" | "height"
> & {
  size?: "sm" | "md" | "lg";
};

const spinnerDimensions = {
  sm: 12,
  md: 16,
  lg: 20,
};

export const Spinner = ({ size = "md", className, ...props }: SpinnerProps) => {
  const dim = spinnerDimensions[size];

  return (
    <svg
      aria-hidden="true"
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("ui:animate-spin", className)}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

Spinner.displayName = "Spinner";
