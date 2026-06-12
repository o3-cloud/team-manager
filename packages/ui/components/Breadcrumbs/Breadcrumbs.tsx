import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  "aria-label"?: string;
}

export function Breadcrumbs({
  items,
  className,
  "aria-label": ariaLabel,
}: BreadcrumbsProps): ReactNode {
  const classes = ["breadcrumbs", className].filter(Boolean).join(" ");

  return (
    <nav aria-label={ariaLabel} className={classes}>
      <ul>
        {items.map((item) => (
          <li key={item.label}>{item.href ? <a href={item.href}>{item.label}</a> : item.label}</li>
        ))}
      </ul>
    </nav>
  );
}
