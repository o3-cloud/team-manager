import { useId } from "react";

export type FileInputVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";
export type FileInputSize = "xs" | "sm" | "md" | "lg";

export interface FileInputProps {
  id?: string;
  label?: string;
  variant?: FileInputVariant;
  size?: FileInputSize;
  disabled?: boolean;
  accept?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
}

export function FileInput({
  id: idProp,
  label,
  variant,
  size = "md",
  disabled = false,
  accept,
  onChange,
  "aria-label": ariaLabel,
}: FileInputProps) {
  const autoId = useId();
  const id = idProp ?? (label ? autoId : undefined);
  const variantClass = variant ? `file-input-${variant}` : "";
  const sizeClass = `file-input-${size}`;

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={id}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <input
        id={id}
        type="file"
        className={`file-input file-input-bordered ${variantClass} ${sizeClass}`
          .trim()
          .replace(/\s+/g, " ")}
        aria-label={!label ? ariaLabel : undefined}
        disabled={disabled}
        accept={accept}
        onChange={onChange}
      />
    </div>
  );
}
