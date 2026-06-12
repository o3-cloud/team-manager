import type { ReactNode } from "react";

export type IndicatorPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "middle-right"
  | "middle-left"
  | "middle-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface IndicatorProps {
  children: ReactNode;
  badge: ReactNode;
  position?: IndicatorPosition;
  className?: string;
  "data-testid"?: string;
}

function positionClasses(position: IndicatorPosition): string {
  const map: Record<IndicatorPosition, string> = {
    "top-right": "indicator-top indicator-end",
    "top-left": "indicator-top indicator-start",
    "top-center": "indicator-top indicator-center",
    "middle-right": "indicator-middle indicator-end",
    "middle-left": "indicator-middle indicator-start",
    "middle-center": "indicator-middle indicator-center",
    "bottom-right": "indicator-bottom indicator-end",
    "bottom-left": "indicator-bottom indicator-start",
    "bottom-center": "indicator-bottom indicator-center",
  };
  return map[position];
}

export function Indicator({
  children,
  badge,
  position = "top-right",
  className,
  "data-testid": testId,
}: IndicatorProps) {
  const wrapperClasses = ["indicator", className].filter(Boolean).join(" ");
  const itemClasses = ["indicator-item", positionClasses(position)].filter(Boolean).join(" ");

  return (
    <div className={wrapperClasses} data-testid={testId}>
      <span className={itemClasses}>{badge}</span>
      {children}
    </div>
  );
}
