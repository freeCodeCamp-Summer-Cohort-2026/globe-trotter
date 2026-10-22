import { Card } from "@repo/ui";
import { HTMLAttributes } from "react";

type AuthCardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
}

export default function AuthCard({ children, className }: AuthCardProps) {
  return (
    <Card padding="lg" className={className}>
      {children}
    </Card>
  )
}
