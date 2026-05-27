export interface MockupCodeLine {
  prefix?: string;
  code: string;
  highlight?: boolean;
}

export interface MockupCodeProps {
  lines: MockupCodeLine[];
  className?: string;
}

export function MockupCode({ lines, className }: MockupCodeProps) {
  const classes = ["mockup-code", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {lines.map((line, i) => (
        <pre
          // biome-ignore lint/suspicious/noArrayIndexKey: code lines are static display items with no natural key
          key={i}
          data-prefix={line.prefix}
          className={line.highlight ? "bg-warning text-warning-content" : undefined}
        >
          <code>{line.code}</code>
        </pre>
      ))}
    </div>
  );
}
