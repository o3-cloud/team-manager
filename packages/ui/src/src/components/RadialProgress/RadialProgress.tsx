import type { CSSProperties, ReactNode } from "react";

type RadialProgressStyle = CSSProperties & {
  "--value"?: number;
  "--size"?: string;
  "--thickness"?: string;
};

export interface RadialProgressProps {
  value: number;
  size?: string;
  thickness?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export function RadialProgress({
  value,
  size,
  thickness,
  children,
  "aria-label": ariaLabel,
}: RadialProgressProps) {
  const style: RadialProgressStyle = { "--value": value };
  if (size) style["--size"] = size;
  if (thickness) style["--thickness"] = thickness;

  return (
    <div
      className="radial-progress"
      style={style}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
