import type { ReactNode } from "react";

export interface TimelineItemProps {
  start?: ReactNode;
  middle?: ReactNode;
  end?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItemProps[];
  horizontal?: boolean;
  snap?: boolean;
}

export function Timeline({ items, horizontal = false, snap = false }: TimelineProps) {
  const classes = [
    "timeline",
    horizontal ? "timeline-horizontal" : undefined,
    snap ? "timeline-snap-icon" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul className={classes}>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: timeline items may not have unique ids
        <li key={index}>
          {index > 0 && <hr />}
          {item.start !== undefined && <div className="timeline-start">{item.start}</div>}
          {item.middle !== undefined && <div className="timeline-middle">{item.middle}</div>}
          {item.end !== undefined && <div className="timeline-end timeline-box">{item.end}</div>}
          {index < items.length - 1 && <hr />}
        </li>
      ))}
    </ul>
  );
}
