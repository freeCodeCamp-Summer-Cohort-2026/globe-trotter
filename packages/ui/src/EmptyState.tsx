import * as React from "react";

import { cn } from "./lib/utils";

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
};

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "ui:flex ui:flex-col ui:items-center ui:justify-center ui:gap-2 ui:px-6 ui:py-10 ui:text-center",
        className,
      )}
      {...props}
    >
      {icon && <div className="ui:mb-1 ui:text-slate-700">{icon}</div>}

      <h3 className="ui:text-base ui:font-semibold ui:text-slate-950">
        {title}
      </h3>

      {description && (
        <p className="ui:max-w-sm ui:text-sm ui:text-slate-900">
          {description}
        </p>
      )}

      {action && <div className="ui:mt-3">{action}</div>}
    </div>
  );
};

EmptyState.displayName = "EmptyState";
