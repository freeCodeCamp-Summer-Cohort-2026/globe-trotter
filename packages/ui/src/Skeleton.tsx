import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./lib/utils";

// Each variant ships default dimensions; width/height props override via inline style.
const skeleton = cva("ui:animate-pulse ui:bg-slate-200", {
  variants: {
    variant: {
      text: "ui:rounded ui:h-4 ui:w-full",
      rectangle: "ui:rounded-md ui:h-24 ui:w-full",
      circle: "ui:rounded-full ui:h-10 ui:w-10",
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
