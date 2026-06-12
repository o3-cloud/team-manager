import type { ReactNode } from "react";

export interface FooterProps {
  children: ReactNode;
  center?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function Footer({
  children,
  center = false,
  className,
  "data-testid": testId,
}: FooterProps) {
  const classes = ["footer", center ? "footer-center" : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={classes} data-testid={testId}>
      {children}
    </footer>
  );
}
