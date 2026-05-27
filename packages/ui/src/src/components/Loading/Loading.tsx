export type LoadingVariant = "spinner" | "dots" | "ring" | "ball" | "bars" | "infinity";
export type LoadingSize = "xs" | "sm" | "md" | "lg";

export interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
}

export function Loading({ variant = "spinner", size = "md" }: LoadingProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`loading loading-${variant} loading-${size}`}
    />
  );
}
