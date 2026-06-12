import type { CSSProperties } from "react";

type TextRotateStyle = CSSProperties & { "--duration"?: string };

export interface TextRotateProps {
  items: string[];
  duration?: string;
  className?: string;
}

export function TextRotate({ items, duration, className }: TextRotateProps) {
  const style: TextRotateStyle = {};
  if (duration) style["--duration"] = duration;

  const classes = ["text-rotate", className].filter(Boolean).join(" ");

  return (
    <span className={classes} style={Object.keys(style).length > 0 ? style : undefined}>
      <span>
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </span>
    </span>
  );
}
