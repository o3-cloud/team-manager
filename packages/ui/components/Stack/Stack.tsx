import type { ReactNode } from "react";

export interface StackProps {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function Stack({ children, className, "data-testid": testId }: StackProps) {
  const classes = ["stack", className].filter(Boolean).join(" ");

  return (
    <div className={classes} data-testid={testId}>
      {children}
    </div>
  );
}
