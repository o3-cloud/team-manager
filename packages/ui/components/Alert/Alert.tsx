import type { ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  onDismiss?: () => void;
}

export function Alert({ children, variant = "info", onDismiss }: AlertProps) {
  return (
    <div role="alert" className={`alert alert-${variant}`}>
      <span>{children}</span>
      {onDismiss && (
        <button type="button" aria-label="Dismiss" onClick={onDismiss}>
          ✕
        </button>
      )}
    </div>
  );
}
