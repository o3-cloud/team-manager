export type ToggleVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type ToggleSize = "xs" | "sm" | "md" | "lg";

export interface ToggleProps {
  id?: string;
  label?: string;
  variant?: ToggleVariant;
  size?: ToggleSize;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
}

export function Toggle({
  id,
  label,
  variant,
  size = "md",
  disabled = false,
  checked,
  onChange,
  "aria-label": ariaLabel,
}: ToggleProps) {
  const variantClass = variant ? `toggle-${variant}` : "";
  const sizeClass = `toggle-${size}`;

  const input = (
    <input
      id={id}
      type="checkbox"
      className={`toggle ${variantClass} ${sizeClass}`.trim().replace(/\s+/g, " ")}
      disabled={disabled}
      checked={checked}
      onChange={onChange}
      aria-label={!label ? ariaLabel : undefined}
    />
  );

  if (!label) return input;

  return (
    <div className="form-control">
      <label className="label cursor-pointer gap-2" htmlFor={id}>
        {input}
        <span className="label-text">{label}</span>
      </label>
    </div>
  );
}
