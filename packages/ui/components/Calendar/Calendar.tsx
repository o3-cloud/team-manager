export interface CalendarProps {
  id?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  "aria-label"?: string;
  className?: string;
}

export function Calendar({
  id,
  value,
  onChange,
  min,
  max,
  "aria-label": ariaLabel,
  className,
}: CalendarProps) {
  const classes = ["input", "input-bordered", className].filter(Boolean).join(" ");
  return (
    <input
      id={id}
      type="date"
      className={classes}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      aria-label={ariaLabel}
    />
  );
}
