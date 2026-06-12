import type { ReactNode } from "react";

export interface ListProps {
  children: ReactNode;
  className?: string;
}

export function List({ children, className }: ListProps) {
  const classes = ["list", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

export interface ListRowProps {
  children: ReactNode;
  className?: string;
}

export function ListRow({ children, className }: ListRowProps) {
  const classes = ["list-row", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

export interface ListColProps {
  children: ReactNode;
  grow?: boolean;
  wrap?: boolean;
  className?: string;
}

export function ListCol({ children, grow, wrap, className }: ListColProps) {
  const classes = [
    grow ? "list-col-grow" : undefined,
    wrap ? "list-col-wrap" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <div className={classes || undefined}>{children}</div>;
}
