export type MenuSize = "xs" | "sm" | "md" | "lg";
export type MenuDirection = "vertical" | "horizontal";

export interface MenuItem {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  href?: string;
}

export interface MenuProps {
  items: MenuItem[];
  size?: MenuSize;
  direction?: MenuDirection;
  className?: string;
}

export function Menu({ items, size, direction, className }: MenuProps) {
  const classes = [
    "menu",
    size ? `menu-${size}` : undefined,
    direction === "horizontal" ? "menu-horizontal" : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul className={classes}>
      {items.map((item) => (
        <li key={item.label} className={item.disabled ? "disabled" : undefined}>
          <a
            href={item.href ?? "#"}
            className={item.active ? "active" : undefined}
            onClick={
              item.onClick
                ? (e) => {
                    if (!item.href) e.preventDefault();
                    item.onClick?.();
                  }
                : undefined
            }
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
