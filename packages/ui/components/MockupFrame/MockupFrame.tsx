import type { ReactNode } from "react";

export interface MockupFrameProps {
  children: ReactNode;
  className?: string;
}

export function MockupFrame({ children, className }: MockupFrameProps) {
  const classes = ["mockup-phone", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="mockup-phone-display">{children}</div>
    </div>
  );
}
