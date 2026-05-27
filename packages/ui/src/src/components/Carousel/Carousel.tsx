import type { ReactNode } from "react";

export type CarouselDirection = "horizontal" | "vertical";

export interface CarouselItemProps {
  children: ReactNode;
  id?: string;
}

export interface CarouselProps {
  items: CarouselItemProps[];
  direction?: CarouselDirection;
  snap?: boolean;
}

export function Carousel({ items, direction = "horizontal", snap = false }: CarouselProps) {
  const classes = [
    "carousel",
    direction === "vertical" ? "carousel-vertical" : undefined,
    snap ? "carousel-center" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {items.map((item, index) => (
        <div key={item.id ?? index} id={item.id} className="carousel-item">
          {item.children}
        </div>
      ))}
    </div>
  );
}
