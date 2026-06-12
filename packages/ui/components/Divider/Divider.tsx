import type { ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  children?: ReactNode;
  orientation?: DividerOrientation;
  color?: "primary" | "secondary" | "accent" | "neutral" | "success" | "warning" | "error" | "info";
  "aria-label"?: string;
}

export function Divider({
  children,
  orientation = "horizontal",
  color,
  "aria-label": ariaLabel,
}: DividerProps) {
  const classes = [
    "divider",
    orientation === "vertical" ? "divider-horizontal" : undefined,
    color ? `divider-${color}` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: non-interactive separator — aria-valuenow only required when focusable (tabIndex present)
    // biome-ignore lint/a11y/useSemanticElements: Divider accepts text children that <hr> cannot contain
    <div role="separator" aria-label={ariaLabel} className={classes}>
      {children}
    </div>
  );
}
