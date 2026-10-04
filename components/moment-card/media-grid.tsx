import Image from "next/image";

export function gridClassForCount(count: number): string {
  if (count <= 0) return '';
  if (count === 1) return 'md:grid-cols-1';
  if (count === 2) return 'md:grid-cols-2';
  if (count === 3) return 'md:grid-cols-3';
  return 'md:grid-cols-4';
}

export function ImagePreview({ images, label, alt }: { images: string[]; label: string; alt: string }) {
  if (images.length === 0) return null;
  const displayImages = images.slice(0, 6);

  return (
    <div
      className={`flex flex-col md:grid ${gridClassForCount(displayImages.length)} gap-2 mt-2`}
      role="list"
      aria-label={label}
    >
      {displayImages.map((image, i) => (
        <div
          key={i}
          role="listitem"
          className="relative w-full h-36 overflow-hidden"
        >
          <Image
            src={image}
            alt={alt}
            fill
            quality={75}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-[calc(var(--radius-md)*1.5)] object-cover"
          />
        </div>
      ))}
    </div>
  )
}
