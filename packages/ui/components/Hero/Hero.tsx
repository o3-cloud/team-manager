import type { ReactNode } from "react";

export interface HeroProps {
  children: ReactNode;
  overlay?: boolean;
  backgroundImage?: string;
  className?: string;
  "data-testid"?: string;
}

export function Hero({
  children,
  overlay = false,
  backgroundImage,
  className,
  "data-testid": testId,
}: HeroProps) {
  const classes = ["hero", className].filter(Boolean).join(" ");

  const style = backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined;

  return (
    <div className={classes} data-testid={testId} style={style}>
      {overlay && <div className="hero-overlay bg-opacity-60" />}
      <div className="hero-content">{children}</div>
    </div>
  );
}
