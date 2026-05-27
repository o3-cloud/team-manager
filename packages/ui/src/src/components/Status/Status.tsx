export type StatusVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export type StatusSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface StatusProps {
  variant?: StatusVariant;
  size?: StatusSize;
  "aria-label"?: string;
}

export function Status({ variant = "neutral", size = "md", "aria-label": ariaLabel }: StatusProps) {
  return (
    <span
      className={`status status-${variant} status-${size}`}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    />
  );
}
