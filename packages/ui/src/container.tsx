import { type HTMLAttributes } from "react";
import { cn } from "./lib/utils";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClasses: Record<ContainerSize, string> = {
  sm: "ui:max-w-2xl",
  md: "ui:max-w-4xl",
  lg: "ui:max-w-6xl",
  xl: "ui:max-w-7xl",
  full: "ui:max-w-none",
};

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
};

export function Container({
  size = "xl",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "ui:mx-auto ui:w-full ui:px-6",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
