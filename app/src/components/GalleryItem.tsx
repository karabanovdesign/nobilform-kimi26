interface GalleryItemProps {
  title: string;
  subtitle: string;
  image: string;
  onClick: () => void;
}

export default function GalleryItem({ title, subtitle, image, onClick }: GalleryItemProps) {
  return (
    <div
      className="group relative overflow-hidden rounded cursor-pointer"
      style={{ transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="w-full h-[250px] sm:h-[300px] lg:h-[350px] object-cover block"
        style={{ transition: "transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />
      <div
        className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8"
        style={{ background: "linear-gradient(to top, rgba(13,13,13,0.9) 0%, transparent 100%)" }}
      >
        <h3
          className="text-lg sm:text-xl lg:text-2xl font-normal mb-1"
          style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h3>
        <p
          className="text-[10px] sm:text-xs font-light tracking-[2px] uppercase"
          style={{ color: "#b8945a" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
