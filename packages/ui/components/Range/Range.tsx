export type RangeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type RangeSize = "xs" | "sm" | "md" | "lg";

export interface RangeProps {
  variant?: RangeVariant;
  size?: RangeSize;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
}

export function Range({
  variant,
  size = "md",
  min,
  max,
  step,
  value,
  disabled = false,
  onChange,
  "aria-label": ariaLabel,
}: RangeProps) {
  const variantClass = variant ? `range-${variant}` : "";
  const sizeClass = `range-${size}`;

  return (
    <input
      type="range"
      className={`range ${variantClass} ${sizeClass}`.trim().replace(/\s+/g, " ")}
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
  );
}
