import type { ReactNode } from "react";

export interface JoinProps {
  children: ReactNode;
  vertical?: boolean;
  horizontal?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function Join({
  children,
  vertical = false,
  horizontal = false,
  className,
  "data-testid": testId,
}: JoinProps) {
  const classes = [
    "join",
    vertical ? "join-vertical" : undefined,
    horizontal ? "join-horizontal" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-testid={testId}>
      {children}
    </div>
  );
}
