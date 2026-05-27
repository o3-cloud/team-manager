import type { ReactNode } from "react";

export interface MockupBrowserProps {
  children: ReactNode;
  url?: string;
  className?: string;
}

export function MockupBrowser({ children, url, className }: MockupBrowserProps) {
  const classes = ["mockup-browser", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="mockup-browser-toolbar">
        {url ? <div className="input">{url}</div> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}
