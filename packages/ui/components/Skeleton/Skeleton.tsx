export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  "aria-label"?: string;
}

export function Skeleton({
  width,
  height,
  className,
  "aria-label": ariaLabel = "Loading",
}: SkeletonProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{ width, height }}
    />
  );
}
