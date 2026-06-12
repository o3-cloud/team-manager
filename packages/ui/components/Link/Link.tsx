import type { ReactNode } from "react";

export type LinkVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "info"
  | "error";

export interface LinkProps {
  children: ReactNode;
  href?: string;
  variant?: LinkVariant;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Link({
  children,
  href = "#",
  variant = "primary",
  hover = false,
  className,
  onClick,
}: LinkProps) {
  const classes = ["link", `link-${variant}`, hover ? "link-hover" : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <a href={href} className={classes} onClick={onClick}>
      {children}
    </a>
  );
}
