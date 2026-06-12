export interface HoverGalleryImage {
  src: string;
  alt?: string;
}

export interface HoverGalleryProps {
  images: HoverGalleryImage[];
  maxWidth?: string;
  className?: string;
  as?: "figure" | "div";
}

export function HoverGallery({
  images,
  maxWidth = "max-w-60",
  className,
  as: Tag = "figure",
}: HoverGalleryProps) {
  const limitedImages = images.slice(0, 10);

  const classes = ["hover-gallery", maxWidth, className].filter(Boolean).join(" ");

  return (
    <Tag className={classes}>
      {limitedImages.map((image, index) => (
        <img
          // biome-ignore lint/suspicious/noArrayIndexKey: images have no stable id
          key={index}
          src={image.src}
          alt={image.alt ?? ""}
        />
      ))}
    </Tag>
  );
}
