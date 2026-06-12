import type { ReactNode } from "react";

export interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({ children, htmlFor, className }: LabelProps) {
  const classes = ["label", className].filter(Boolean).join(" ");
  return (
    <label className={classes} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

export interface FloatingLabelProps {
  children: ReactNode;
  className?: string;
}

export function FloatingLabel({ children, className }: FloatingLabelProps) {
  const classes = ["floating-label", className].filter(Boolean).join(" ");
  // biome-ignore lint/a11y/noLabelWithoutControl: floating-label wraps an input child by composition
  return <label className={classes}>{children}</label>;
}
