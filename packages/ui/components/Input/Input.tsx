import { useId } from "react";

export type InputVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type InputSize = "xs" | "sm" | "md" | "lg";

export interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  variant?: InputVariant;
  size?: InputSize;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
}

export function Input({
  id: idProp,
  name,
  label,
  error,
  variant,
  size = "md",
  disabled = false,
  readOnly = false,
  placeholder,
  value,
  defaultValue,
  onChange,
  "aria-label": ariaLabel,
}: InputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = error ? `${id}-error` : undefined;

  const variantClass = error ? "input-error" : variant ? `input-${variant}` : "";
  const sizeClass = `input-${size}`;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={id}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        id={id}
        name={name}
        type="text"
        className={`input input-bordered ${variantClass} ${sizeClass}`.trim().replace(/\s+/g, " ")}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-label={!label ? ariaLabel : undefined}
        aria-describedby={errorId}
        aria-invalid={error ? true : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
      />
      {error && (
        <p id={errorId} className="label label-text-alt text-error mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
