import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonType = "button" | "submit" | "reset";

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: ButtonType;
  onClick?: () => void;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
}: ButtonProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      onClick?.();
    }
  }

  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
}
