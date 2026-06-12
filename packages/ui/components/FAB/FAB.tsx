import type { ReactNode } from "react";

export interface FABProps {
  trigger: ReactNode;
  children?: ReactNode;
  flower?: boolean;
  className?: string;
}

export function FAB({ trigger, children, flower = false, className }: FABProps) {
  const classes = ["fab", flower ? "fab-flower" : undefined, className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: daisyUI FAB requires tabindex on the trigger wrapper for the CSS focus-within expansion mechanism */}
      <div tabIndex={0}>{trigger}</div>
      {children}
    </div>
  );
}
