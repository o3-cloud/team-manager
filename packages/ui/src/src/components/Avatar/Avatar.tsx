export type AvatarSize = "xs" | "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square";

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  online?: boolean;
  offline?: boolean;
}

const sizeMap: Record<AvatarSize, string> = {
  xs: "w-8",
  sm: "w-12",
  md: "w-16",
  lg: "w-24",
};

export function Avatar({
  src,
  alt = "",
  initials,
  size = "md",
  shape = "circle",
  online = false,
  offline = false,
}: AvatarProps) {
  const outerClasses = ["avatar", online ? "online" : undefined, offline ? "offline" : undefined]
    .filter(Boolean)
    .join(" ");

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded";
  const sizeClass = sizeMap[size];
  const innerClasses = [sizeClass, shapeClass].join(" ");

  return (
    <div className={outerClasses}>
      <div className={innerClasses}>
        {src ? (
          <img src={src} alt={alt} />
        ) : (
          <div className="bg-neutral text-neutral-content flex items-center justify-center w-full h-full">
            <span>{initials}</span>
          </div>
        )}
      </div>
    </div>
  );
}
