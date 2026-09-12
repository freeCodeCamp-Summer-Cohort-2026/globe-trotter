import { cva, type VariantProps } from "class-variance-authority";
import { type ReactNode } from "react";

const badge = cva(
  "ui:inline-flex ui:items-center ui:justify-center ui:rounded-full ui:font-medium ui:leading-none ui:whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "ui:bg-slate-200 ui:text-slate-950",
        success: "ui:bg-green-100 ui:text-green-900",
        warning: "ui:bg-orange-100 ui:text-orange-900",
        danger: "ui:bg-red-100 ui:text-red-900",
        info: "ui:bg-blue-100 ui:text-blue-900",
        outline:
          "ui:bg-transparent ui:text-slate-600 ui:border ui:border-slate-700",
      },
      size: {
        sm: "ui:px-2 ui:py-0.5 ui:text-xs",
        md: "ui:px-2.5 ui:py-1 ui:text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps extends VariantProps<typeof badge> {
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, size, className, children }: BadgeProps) {
  return (
    <span className={badge({ variant, size, className })}>{children}</span>
  );
}
