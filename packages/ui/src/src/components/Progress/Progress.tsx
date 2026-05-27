export type ProgressVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface ProgressProps {
  variant?: ProgressVariant;
  value?: number;
  max?: number;
}

export function Progress({ variant = "primary", value, max }: ProgressProps) {
  return <progress className={`progress progress-${variant}`} value={value} max={max} />;
}
