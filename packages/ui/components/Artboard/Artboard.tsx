import type { ReactNode } from "react";

export type ArtboardSize = "phone-1" | "phone-2" | "phone-3" | "phone-4" | "phone-5" | "phone-6";

export interface ArtboardProps {
  children: ReactNode;
  size?: ArtboardSize;
  demo?: boolean;
  horizontal?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function Artboard({
  children,
  size,
  demo = false,
  horizontal = false,
  className,
  "data-testid": testId,
}: ArtboardProps) {
  const classes = [
    "artboard",
    size,
    demo ? "artboard-demo" : undefined,
    horizontal ? "artboard-horizontal" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-testid={testId}>
      {children}
    </div>
  );
}
