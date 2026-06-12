import type { ReactNode } from "react";

export interface Hover3DProps {
  children: ReactNode;
  className?: string;
  href?: string;
}

export function Hover3D({ children, className, href }: Hover3DProps) {
  const classes = ["hover-3d", className].filter(Boolean).join(" ");

  const zones = (
    <>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </>
  );

  if (href !== undefined) {
    return (
      <a className={classes} href={href}>
        {children}
        {zones}
      </a>
    );
  }

  return (
    <div className={classes}>
      {children}
      {zones}
    </div>
  );
}
