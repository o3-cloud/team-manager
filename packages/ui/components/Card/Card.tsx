import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  title?: string;
  image?: string;
  imageAlt?: string;
  compact?: boolean;
  bordered?: boolean;
  actions?: ReactNode;
}

export function Card({
  children,
  title,
  image,
  imageAlt = "",
  compact = false,
  bordered = false,
  actions,
}: CardProps) {
  const classes = [
    "card",
    "bg-base-100",
    "shadow-xl",
    compact ? "card-compact" : undefined,
    bordered ? "card-bordered" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {image && (
        <figure>
          <img src={image} alt={imageAlt} />
        </figure>
      )}
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {children}
        {actions && <div className="card-actions justify-end">{actions}</div>}
      </div>
    </div>
  );
}
