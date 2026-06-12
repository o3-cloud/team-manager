export type MaskShape =
  | "squircle"
  | "hexagon"
  | "hexagon-2"
  | "decal"
  | "circle"
  | "heart"
  | "half-1"
  | "half-2"
  | "parallelogram"
  | "parallelogram-2"
  | "parallelogram-3"
  | "parallelogram-4"
  | "star"
  | "star-2"
  | "triangle"
  | "triangle-2"
  | "triangle-3"
  | "triangle-4";

export interface MaskProps {
  src: string;
  alt?: string;
  shape?: MaskShape;
  className?: string;
  "data-testid"?: string;
}

export function Mask({ src, alt = "", shape, className, "data-testid": testId }: MaskProps) {
  const classes = ["mask", shape ? `mask-${shape}` : undefined, className]
    .filter(Boolean)
    .join(" ");

  return <img src={src} alt={alt} className={classes} data-testid={testId} />;
}
