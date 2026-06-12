import type { ReactNode } from "react";

export type CollapseVariant = "arrow" | "plus" | "none";

export interface CollapseProps {
  title: string;
  children: ReactNode;
  variant?: CollapseVariant;
  defaultOpen?: boolean;
  className?: string;
}

export function Collapse({
  title,
  children,
  variant = "arrow",
  defaultOpen = false,
  className,
}: CollapseProps) {
  const classes = ["collapse", variant !== "none" ? `collapse-${variant}` : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <details className={classes} open={defaultOpen || undefined}>
      <summary className="collapse-title" tabIndex={0}>
        {title}
      </summary>
      <div className="collapse-content">{children}</div>
    </details>
  );
}
