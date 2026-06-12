import type { ReactNode } from "react";

export type AccordionVariant = "arrow" | "plus" | "none";

export interface AccordionItemProps {
  title: string;
  children: ReactNode;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  variant?: AccordionVariant;
}

export function Accordion({ items, variant = "arrow" }: AccordionProps) {
  const variantClass = variant !== "none" ? `collapse-${variant}` : undefined;

  return (
    <div>
      {items.map((item, index) => {
        const classes = ["collapse", variantClass].filter(Boolean).join(" ");
        return (
          <div key={item.title} className={classes}>
            <input
              type="radio"
              name="accordion-group"
              defaultChecked={index === 0}
              aria-label={item.title}
            />
            <div className="collapse-title">{item.title}</div>
            <div className="collapse-content">{item.children}</div>
          </div>
        );
      })}
    </div>
  );
}
