import type { ReactNode } from "react";

export interface NavbarProps {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  className?: string;
}

export function Navbar({ start, center, end, className }: NavbarProps) {
  const classes = ["navbar", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="navbar-start">{start}</div>
      <div className="navbar-center">{center}</div>
      <div className="navbar-end">{end}</div>
    </div>
  );
}
