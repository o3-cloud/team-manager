import type { ReactNode } from "react";

export interface StatItemProps {
  title: string;
  value: string | number;
  description?: string;
  figure?: ReactNode;
}

export interface StatProps {
  items: StatItemProps[];
  horizontal?: boolean;
}

export function Stat({ items, horizontal = false }: StatProps) {
  const classes = ["stats", "shadow", horizontal ? "stats-horizontal" : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {items.map((item) => (
        <div key={item.title} className="stat">
          {item.figure !== undefined && (
            <div className="stat-figure text-primary">{item.figure}</div>
          )}
          <div className="stat-title">{item.title}</div>
          <div className="stat-value">{item.value}</div>
          {item.description !== undefined && <div className="stat-desc">{item.description}</div>}
        </div>
      ))}
    </div>
  );
}
