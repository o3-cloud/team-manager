import React from "react";

export type SelectVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type SelectSize = "xs" | "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  label?: string;
  error?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  disabled?: boolean;
  value?: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  "aria-label"?: string;
}

export function Select({
  id: idProp,
  label,
  error,
  variant,
  size = "md",
  disabled = false,
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
}: SelectProps) {
  const autoId = React.useId();
  const id = idProp ?? (label ? autoId : undefined);
  const variantClass = error ? "select-error" : variant ? `select-${variant}` : "";
  const sizeClass = `select-${size}`;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={id}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <select
        id={id}
        aria-label={!label ? ariaLabel : undefined}
        className={`select select-bordered ${variantClass} ${sizeClass}`
          .trim()
          .replace(/\s+/g, " ")}
        disabled={disabled}
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="label label-text-alt text-error mt-1">{error}</p>}
    </div>
  );
}
