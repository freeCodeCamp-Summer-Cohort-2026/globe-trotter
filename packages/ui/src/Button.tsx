import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "./lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "right" | "left";
  loading?: boolean;
};

export const buttonVariants = cva(
  [
    "ui:relative",
    "ui:inline-flex",
    "ui:shrink-0",
    "ui:items-center",
    "ui:justify-center",
    "ui:font-medium",
    "ui:outline-none",
    "ui:rounded-lg",
    "ui:transition-all",
    "ui:duration-150",
    "ui:hover:cursor-pointer",
    "ui:disabled:opacity-50",
    "ui:disabled:cursor-not-allowed",
    "ui:disabled:pointer-events-none",
    "ui:focus-visible:ring-2",
    "ui:focus-visible:ring-primary",
    "ui:focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        primary:
          "ui:bg-primary ui:text-white ui:hover:bg-primary/90 ui:active:bg-primary/80",

        secondary:
          "ui:bg-neutral-300 ui:text-black ui:hover:bg-neutral-400 ui:active:bg-neutral-500",

        outline:
          "ui:border ui:border-primary ui:text-primary ui:hover:bg-primary/10 ui:active:bg-primary/20",

        ghost:
          "ui:text-black ui:hover:bg-slate-200 ui:active:bg-slate-300 ui:aria-expanded:bg-slate-200",

        destructive:
          "ui:bg-red-800 ui:text-white ui:hover:bg-red-900 ui:active:bg-red-950",

        link: "ui:text-blue-700 ui:underline-offset-4 ui:hover:underline",
      },

      size: {
        sm: "ui:text-sm ui:h-8 ui:px-2.5",
        md: "ui:text-base ui:h-9 ui:px-3",
        lg: "ui:text-lg ui:h-10 ui:px-3",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

const spinnerDimensions = {
  sm: 12,
  md: 16,
  lg: 20,
};

const Spinner = ({ size }: { size: ButtonProps["size"] }) => {
  const dim = spinnerDimensions[size ?? "md"];

  return (
    <svg
      aria-hidden="true"
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      className="ui:animate-spin"
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

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      iconPosition = "left",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading}
        className={cn(buttonVariants({ variant, size }), className)}
      >
        <span
          aria-hidden={loading || undefined}
          className={cn(
            loading && "ui:invisible",
            "ui:inline-flex ui:items-center ui:gap-1.5",
          )}
        >
          {iconPosition === "left" && icon}
          {children}
          {iconPosition === "right" && icon}
        </span>

        {loading && (
          <span className="ui:absolute ui:left-1/2 ui:top-1/2 ui:-translate-x-1/2 ui:-translate-y-1/2">
            <Spinner size={size} />
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
