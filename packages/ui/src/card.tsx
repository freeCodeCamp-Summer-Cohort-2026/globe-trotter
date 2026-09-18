import { type HTMLAttributes } from "react";
import { cn } from "./lib/utils";

export type CardPadding = "none" | "sm" | "md" | "lg";

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "ui:p-3",
  md: "ui:p-5",
  lg: "ui:p-6",
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: CardPadding;
};

type CardPartProps = HTMLAttributes<HTMLDivElement> & {
  padding?: CardPadding;
  border?: boolean;
};

export function Card({
  padding = "none",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "ui:rounded-2xl ui:border ui:border-slate-200 ui:bg-white ui:shadow-sm",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  padding = "md",
  border = false,
  className,
  children,
  ...props
}: CardPartProps) {
  return (
    <div
      className={cn(
        paddingClasses[padding],
        border && "ui:border-b ui:border-slate-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  padding = "md",
  className,
  children,
  ...props
}: CardPartProps) {
  return (
    <div className={cn(paddingClasses[padding], className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  padding = "md",
  border = false,
  className,
  children,
  ...props
}: CardPartProps) {
  return (
    <div
      className={cn(
        paddingClasses[padding],
        border && "ui:border-t ui:border-slate-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type { CardProps, CardPartProps };

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
