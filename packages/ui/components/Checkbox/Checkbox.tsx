export type CheckboxVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type CheckboxSize = "xs" | "sm" | "md" | "lg";

export interface CheckboxProps {
  id?: string;
  label?: string;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox({
  id,
  label,
  variant,
  size = "md",
  disabled = false,
  checked,
  onChange,
}: CheckboxProps) {
  const variantClass = variant ? `checkbox-${variant}` : "";
  const sizeClass = `checkbox-${size}`;

  const input = (
    <input
      id={id}
      type="checkbox"
      className={`checkbox ${variantClass} ${sizeClass}`.trim().replace(/\s+/g, " ")}
      disabled={disabled}
      checked={checked}
      onChange={onChange}
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
