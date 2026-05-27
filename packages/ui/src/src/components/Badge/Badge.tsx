import type { ReactNode } from "react";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "info"
  | "success"
  | "warning"
  | "error";
export type BadgeSize = "xs" | "sm" | "md" | "lg";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outline?: boolean;
}

export function Badge({ children, variant = "primary", size = "md", outline = false }: BadgeProps) {
  const outlineClass = outline ? "badge-outline" : "";
  return (
    <span
      className={`badge badge-${variant} badge-${size} ${outlineClass}`.trim().replace(/\s+/g, " ")}
    >
      {children}
    </span>
  );
}
