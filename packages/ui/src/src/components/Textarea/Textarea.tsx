export type TextareaVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type TextareaSize = "xs" | "sm" | "md" | "lg";

export interface TextareaProps {
  id?: string;
  label?: string;
  error?: string;
  variant?: TextareaVariant;
  size?: TextareaSize;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  "aria-label"?: string;
}

export function Textarea({
  id,
  label,
  error,
  variant,
  size = "md",
  disabled = false,
  placeholder,
  value,
  rows,
  onChange,
  "aria-label": ariaLabel,
}: TextareaProps) {
  const variantClass = error ? "textarea-error" : variant ? `textarea-${variant}` : "";
  const sizeClass = `textarea-${size}`;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={id}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <textarea
        id={id}
        className={`textarea textarea-bordered ${variantClass} ${sizeClass}`
          .trim()
          .replace(/\s+/g, " ")}
        disabled={disabled}
        aria-label={!label ? ariaLabel : undefined}
        placeholder={placeholder}
        value={value}
        rows={rows}
        onChange={onChange}
      />
      {error && <p className="label label-text-alt text-error mt-1">{error}</p>}
    </div>
  );
}
