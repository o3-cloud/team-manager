import type { ReactNode } from "react";

export type SwapEffect = "rotate" | "flip";

export interface SwapProps {
  onContent: ReactNode;
  offContent: ReactNode;
  active?: boolean;
  effect?: SwapEffect;
  onChange?: (active: boolean) => void;
  className?: string;
  "aria-label"?: string;
}

export function Swap({
  onContent,
  offContent,
  active = false,
  effect,
  onChange,
  className,
  "aria-label": ariaLabel,
}: SwapProps) {
  const classes = ["swap", effect ? `swap-${effect}` : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange?.(e.target.checked)}
        aria-label={ariaLabel}
      />
      <div className="swap-on">{onContent}</div>
      <div className="swap-off">{offContent}</div>
    </label>
  );
}
