import { type ReactElement, cloneElement } from "react";

export interface ValidatorProps {
  hint?: string;
  children: ReactElement<{ className?: string }>;
  className?: string;
}

export function Validator({ hint, children, className }: ValidatorProps) {
  const validatedChild = cloneElement(children, {
    className: ["validator", children.props.className].filter(Boolean).join(" "),
  });

  return (
    <div className={className}>
      {validatedChild}
      {hint && <p className="validator-hint">{hint}</p>}
    </div>
  );
}
