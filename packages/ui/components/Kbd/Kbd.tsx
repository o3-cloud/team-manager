import type { ReactNode } from "react";

export type KbdSize = "xs" | "sm" | "md" | "lg";

export interface KbdProps {
  children: ReactNode;
  size?: KbdSize;
}

export function Kbd({ children, size }: KbdProps) {
  const classes = ["kbd", size ? `kbd-${size}` : undefined].filter(Boolean).join(" ");

  return <kbd className={classes}>{children}</kbd>;
}
