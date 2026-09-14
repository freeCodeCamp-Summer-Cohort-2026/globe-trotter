import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";

const skeleton = cva("ui:animate-pulse ui:bg-slate-200", {
  variants: {
    variant: {
      text: "ui:rounded ui:h-4 ui:w-full",
      rectangle: "ui:rounded-md",
      circle: "ui:rounded-full",
    },
  },
  defaultVariants: {
    variant: "rectangle",
  },
});

export type SkeletonProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "width" | "height"
> &
  VariantProps<typeof skeleton> & {
    width?: number | string;
    height?: number | string;
  };

export const Skeleton = ({
  variant,
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(skeleton({ variant }), className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};

Skeleton.displayName = "Skeleton";
