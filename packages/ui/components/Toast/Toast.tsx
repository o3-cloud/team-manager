import type { ReactNode } from "react";

export type ToastVertical = "top" | "middle" | "bottom";
export type ToastHorizontal = "start" | "center" | "end";

export interface ToastProps {
  children: ReactNode;
  vertical?: ToastVertical;
  horizontal?: ToastHorizontal;
}

export function Toast({ children, vertical = "bottom", horizontal = "end" }: ToastProps) {
  return <div className={`toast toast-${vertical} toast-${horizontal}`}>{children}</div>;
}
