import type { ReactNode } from "react";

export interface FieldsetProps {
  children: ReactNode;
  legend?: string;
  className?: string;
}

export function Fieldset({ children, legend, className }: FieldsetProps) {
  const classes = ["fieldset", className].filter(Boolean).join(" ");
  return (
    <fieldset className={classes}>
      {legend && <legend className="fieldset-legend">{legend}</legend>}
      {children}
    </fieldset>
  );
}
