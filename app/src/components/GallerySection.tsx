import GalleryItem from "./GalleryItem";

export interface GalleryItemData {
  titleRu: string;
  titleRo: string;
  subtitleRu: string;
  subtitleRo: string;
  image: string;
}

interface GallerySectionProps {
  id: string;
  label: string;
  title: string;
  description: string;
  items: GalleryItemData[];
  onItemClick: (item: GalleryItemData) => void;
  dark?: boolean;
  lang: "ru" | "ro";
}

export default function GallerySection({
  id, label, title, description, items, onItemClick, dark = false, lang,
}: GallerySectionProps) {
  return (
    <section
      id={id}
      className="py-24 px-6 sm:px-12"
      style={{
        maxWidth: "1600px",
        margin: "0 auto",
        background: dark ? "rgba(26,26,26,0.3)" : "transparent",
      }}
    >
      <div className="text-center mb-16">
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>
          {label}
        </p>
        <h2 className="font-light mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h2>
        <p className="text-base font-light max-w-[600px] mx-auto leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          {description}
        </p>
      </div>
      <div className="grid gap-6 sm:gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>
        {items.map((item, index) => (
          <GalleryItem
            key={index}
            title={lang === "ro" ? item.titleRo : item.titleRu}
            subtitle={lang === "ro" ? item.subtitleRo : item.subtitleRu}
            image={item.image}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </section>
  );
}
