import { type HTMLAttributes } from "react";
import { cn } from "./lib/utils";

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;
export type GridGap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

const columnClasses: Record<GridColumns, string> = {
  1: "md:ui:grid-cols-1",
  2: "md:ui:grid-cols-2",
  3: "md:ui:grid-cols-3",
  4: "md:ui:grid-cols-4",
  5: "md:ui:grid-cols-5",
  6: "md:ui:grid-cols-6",
};

const gapClasses: Record<GridGap, string> = {
  0: "ui:gap-0",
  1: "ui:gap-1",
  2: "ui:gap-2",
  3: "ui:gap-3",
  4: "ui:gap-4",
  5: "ui:gap-5",
  6: "ui:gap-6",
  8: "ui:gap-8",
  10: "ui:gap-10",
  12: "ui:gap-12",
};

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  cols?: GridColumns;
  gap?: GridGap;
};

export function Grid({
  cols = 3,
  gap = 6,
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        "ui:grid ui:grid-cols-1",
        columnClasses[cols],
        gapClasses[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
