import type { ReactNode } from "react";

export type DockSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface DockItemProps {
  icon: ReactNode;
  label?: string;
  active?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

export interface DockProps {
  items: DockItemProps[];
  size?: DockSize;
  className?: string;
}

export function Dock({ items, size, className }: DockProps) {
  const classes = ["dock", size ? `dock-${size}` : undefined, className].filter(Boolean).join(" ");

  return (
    <nav className={classes}>
      {items.map((item, index) => (
        <button
          // biome-ignore lint/suspicious/noArrayIndexKey: dock items are positional
          key={index}
          type="button"
          className={item.active ? "dock-active" : undefined}
          onClick={item.onClick}
          aria-label={item["aria-label"]}
          aria-current={item.active ? "page" : undefined}
        >
          {item.icon}
          {item.label && <span className="dock-label">{item.label}</span>}
        </button>
      ))}
    </nav>
  );
}
