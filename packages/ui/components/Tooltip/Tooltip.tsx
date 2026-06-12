import type { ReactNode } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";
export type TooltipColor =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface TooltipProps {
  tip: string;
  children: ReactNode;
  position?: TooltipPosition;
  color?: TooltipColor;
  open?: boolean;
  className?: string;
}

export function Tooltip({ tip, children, position, color, open = false, className }: TooltipProps) {
  const classes = [
    "tooltip",
    position ? `tooltip-${position}` : undefined,
    color ? `tooltip-${color}` : undefined,
    open ? "tooltip-open" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-tip={tip}>
      {children}
    </div>
  );
}
