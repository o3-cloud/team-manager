export type RatingSize = "xs" | "sm" | "md" | "lg";

export interface RatingProps {
  name: string;
  max?: number;
  value?: number;
  size?: RatingSize;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Rating({ name, max = 5, value, size = "md", onChange }: RatingProps) {
  const sizeClass = size !== "md" ? `rating-${size}` : "";

  return (
    <fieldset className={`rating ${sizeClass}`.trim().replace(/\s+/g, " ")}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <input
          key={star}
          type="radio"
          name={name}
          value={star}
          aria-label={`${String(star)} star${star !== 1 ? "s" : ""}`}
          className="mask mask-star"
          {...(value !== undefined
            ? { checked: value === star, onChange: onChange ?? (() => undefined) }
            : { onChange })}
        />
      ))}
    </fieldset>
  );
}
