import { type HTMLAttributes } from "react";
import { cn } from "./lib/utils";

export type SectionBackground = "default" | "muted" | "dark";

const backgroundClasses: Record<SectionBackground, string> = {
  default: "ui:bg-transparent",
  muted: "ui:bg-slate-50",
  dark: "ui:bg-slate-900 ui:text-white",
};

export type SectionProps = HTMLAttributes<HTMLElement> & {
  background?: SectionBackground;
};

export function Section({
  background = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("ui:py-12", backgroundClasses[background], className)}
      {...props}
    >
      {children}
    </section>
  );
}
