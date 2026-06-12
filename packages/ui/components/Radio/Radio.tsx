export type RadioVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type RadioSize = "xs" | "sm" | "md" | "lg";

export interface RadioProps {
  id?: string;
  name: string;
  value: string;
  label?: string;
  variant?: RadioVariant;
  size?: RadioSize;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Radio({
  id,
  name,
  value,
  label,
  variant,
  size = "md",
  disabled = false,
  checked,
  onChange,
}: RadioProps) {
  const variantClass = variant ? `radio-${variant}` : "";
  const sizeClass = `radio-${size}`;

  const input = (
    <input
      id={id}
      type="radio"
      name={name}
      value={value}
      className={`radio ${variantClass} ${sizeClass}`.trim().replace(/\s+/g, " ")}
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
