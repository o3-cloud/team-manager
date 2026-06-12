export type StepVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "info"
  | "error"
  | "neutral";

export interface StepItem {
  label: string;
  variant?: StepVariant;
  content?: string;
}

export interface StepsProps {
  items: StepItem[];
  vertical?: boolean;
  className?: string;
}

export function Steps({ items, vertical = false, className }: StepsProps) {
  const classes = ["steps", vertical ? "steps-vertical" : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <ul className={classes}>
      {items.map((item) => (
        <li
          key={item.label}
          className={["step", item.variant ? `step-${item.variant}` : undefined]
            .filter(Boolean)
            .join(" ")}
          data-content={item.content}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
