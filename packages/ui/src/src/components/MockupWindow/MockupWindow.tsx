import type { ReactNode } from "react";

export interface MockupWindowProps {
  children: ReactNode;
  className?: string;
}

export function MockupWindow({ children, className }: MockupWindowProps) {
  const classes = ["mockup-window", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div>{children}</div>
    </div>
  );
}
