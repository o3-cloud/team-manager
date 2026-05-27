export interface ThemeControllerProps {
  theme: string;
  type?: "checkbox" | "radio";
  defaultChecked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  "aria-label"?: string;
  name?: string;
  id?: string;
}

export function ThemeController({
  theme,
  type = "checkbox",
  defaultChecked,
  onChange,
  className,
  "aria-label": ariaLabel,
  name,
  id,
}: ThemeControllerProps) {
  const classes = ["theme-controller", className].filter(Boolean).join(" ");

  return (
    <input
      type={type}
      value={theme}
      className={classes}
      defaultChecked={defaultChecked}
      onChange={onChange}
      aria-label={ariaLabel}
      name={name}
      id={id}
    />
  );
}
