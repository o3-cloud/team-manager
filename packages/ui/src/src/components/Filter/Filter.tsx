import type { ReactNode } from "react";

export interface FilterProps {
  children: ReactNode;
  className?: string;
}

export function Filter({ children, className }: FilterProps) {
  const classes = ["filter", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

export interface FilterResetProps {
  name: string;
  "aria-label": string;
}

export function FilterReset({ name, "aria-label": ariaLabel }: FilterResetProps) {
  return <input type="radio" name={name} className="btn filter-reset" aria-label={ariaLabel} />;
}
