import type { ReactNode } from "react";

export interface DrawerProps {
  children: ReactNode;
  side: ReactNode;
  open?: boolean;
  onClose?: () => void;
  end?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function Drawer({
  children,
  side,
  open = false,
  onClose,
  end = false,
  className,
  "data-testid": testId,
}: DrawerProps) {
  const classes = ["drawer", end ? "drawer-end" : undefined, className].filter(Boolean).join(" ");

  return (
    <div className={classes} data-testid={testId}>
      <input
        id="drawer-toggle"
        type="checkbox"
        className="drawer-toggle"
        checked={open}
        readOnly
        tabIndex={-1}
        aria-label="Toggle navigation drawer"
      />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label
          htmlFor="drawer-toggle"
          aria-label="close sidebar"
          className="drawer-overlay"
          onClick={onClose}
          onKeyDown={undefined}
        />
        {side}
      </div>
    </div>
  );
}
