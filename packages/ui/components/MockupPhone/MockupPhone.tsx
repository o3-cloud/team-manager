import type { ReactNode } from "react";

export interface MockupPhoneProps {
  children: ReactNode;
  className?: string;
}

export function MockupPhone({ children, className }: MockupPhoneProps) {
  const classes = ["mockup-phone", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="mockup-phone-camera" />
      <div className="mockup-phone-display">{children}</div>
    </div>
  );
}
