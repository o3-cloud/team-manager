import type { ReactNode } from "react";

export type DropdownPosition = "top" | "bottom" | "left" | "right";
export type DropdownAlign = "start" | "end";

export interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  position?: DropdownPosition;
  align?: DropdownAlign;
  hover?: boolean;
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  position,
  align,
  hover = false,
  className,
}: DropdownProps) {
  const classes = [
    "dropdown",
    position ? `dropdown-${position}` : undefined,
    align === "end" ? "dropdown-end" : undefined,
    hover ? "dropdown-hover" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {trigger}
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: daisyUI requires tabIndex on dropdown-content for CSS-only keyboard-accessible dropdowns */}
      <div tabIndex={0} className="dropdown-content z-10 rounded-box shadow-sm">
        {children}
      </div>
    </div>
  );
}
