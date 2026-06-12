import type { ReactNode } from "react";

export type BottomNavSize = "xs" | "sm" | "md" | "lg";

export interface BottomNavItem {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  size?: BottomNavSize;
  className?: string;
}

export function BottomNav({ items, size, className }: BottomNavProps) {
  const classes = ["btm-nav", size ? `btm-nav-${size}` : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={item.active ? "active" : undefined}
          onClick={item.onClick}
        >
          {item.icon}
          <span className="btm-nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
