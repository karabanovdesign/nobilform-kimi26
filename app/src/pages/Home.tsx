import { useState } from "react";
import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Philosophy from "@/sections/Philosophy";
import Advantages from "@/sections/Advantages";
import Calculator from "@/sections/Calculator";
import Footer from "@/sections/Footer";
import OurWorks from "@/sections/OurWorks";
import GallerySection from "@/components/GallerySection";
import type { GalleryItemData } from "@/components/GallerySection";
import Lightbox from "@/components/Lightbox";

const KITCHENS: GalleryItemData[] = [
  { titleRu: "Кухни премиум-класса", titleRo: "Bucătării premium", subtitleRu: "Авторские кухонные гарнитуры с интеграцией техники", subtitleRo: "Seturi de bucătărie autor cu integrare tehnică", image: "/images/horizontal/01_minimalist_kitchen.jpg" },
  { titleRu: "Кухня с островом", titleRo: "Bucătărie cu insulă", subtitleRu: "Центральный элемент • Эргономика и эстетика", subtitleRo: "Element central • Ergonomie și estetică", image: "/images/horizontal/02_kitchen_island.jpg" },
  { titleRu: "Темная кухня", titleRo: "Bucătărie întunecată", subtitleRu: "Матовый черный • Драматичный стиль", subtitleRo: "Negru mat • Stil dramatic", image: "/images/horizontal/03_dark_kitchen.jpg" },
  { titleRu: "Светлая премиум-кухня", titleRo: "Bucătărie premium deschisă", subtitleRu: "Soft matte • Нежная роскошь", subtitleRo: "Soft matte • Lux delicat", image: "/images/horizontal/04_light_premium.jpg" },
  { titleRu: "Деревянные фасады", titleRo: "Fațade din lemn", subtitleRu: "Натуральное дерево • Тепло природы", subtitleRo: "Lemn natural • Căldura naturii", image: "/images/horizontal/05_wooden_facades.jpg" },
  { titleRu: "Каменные столешницы", titleRo: "Blaturi din piatră", subtitleRu: "Природный камень • Монументальность", subtitleRo: "Piatră naturală • Monumentalitate", image: "/images/horizontal/06_stone_countertops.jpg" },
  { titleRu: "Кухня-гостиная", titleRo: "Bucătărie-living", subtitleRu: "Open space • Свобода пространства", subtitleRo: "Open space • Libertate spațială", image: "/images/horizontal/07_open_space.jpg" },
  { titleRu: "High-tech кухня", titleRo: "Bucătărie high-tech", subtitleRu: "Технологии • Инновации • Будущее", subtitleRo: "Tehnologie • Inovație • Viitor", image: "/images/horizontal/08_high_tech.jpg" },
  { titleRu: "Elegant Modern", titleRo: "Elegant Modern", subtitleRu: "Классическая элегантность • Золотые акценты", subtitleRo: "Eleganță clasică • Accente aurii", image: "/images/horizontal/09_elegant_modern.jpg" },
  { titleRu: "Warm Minimal", titleRo: "Warm Minimal", subtitleRu: "Теплый минимализм • Уют и гармония", subtitleRo: "Minimalism cald • Confort și armonie", image: "/images/horizontal/10_warm_minimal.jpg" },
];

const WARDROBES: GalleryItemData[] = [
  { titleRu: "Гардеробные системы", titleRo: "Sisteme dressing", subtitleRu: "Индивидуальные гардеробные с системой хранения", subtitleRo: "Dressing-uri individuale cu sistem de depozitare", image: "/images/wardrobes/01_wardrobe.jpg" },
  { titleRu: "Встроенный шкаф", titleRo: "Dulap încorporat", subtitleRu: "Натуральное дерево • Встроенное освещение • Зеркала", subtitleRo: "Lemn natural • Iluminat încorporat • Oglinzi", image: "/images/wardrobes/02_wardrobe.jpg" },
];

const CLOSETS: GalleryItemData[] = [
  { titleRu: "Мебельные стенки", titleRo: "Pereți mobilier", subtitleRu: "Многофункциональные стеллажные системы с техникой", subtitleRo: "Sisteme de rafturi multifuncționale cu tehnică", image: "/images/closets/01_closet.jpg" },
];

const TVZONES: GalleryItemData[] = [
  { titleRu: "ТВ-зона дерево + мрамор", titleRo: "Zonă TV lemn + marmură", subtitleRu: "Плавающие полки • LED-акценты • Минимализм", subtitleRo: "Rafturi plutitoare • Accente LED • Minimalism", image: "/images/tv_zones/01_tv_zone.jpg" },
  { titleRu: "Медиа-стена с камином", titleRo: "Perete media cu șemineu", subtitleRu: "Bookmatched marble • Биокамин • Подсветка", subtitleRo: "Bookmatched marble • Biocămin • Iluminat", image: "/images/tv_zones/02_tv_zone.jpg" },
];

const WALLS: GalleryItemData[] = [
  { titleRu: "Декоративные панели", titleRo: "Panouri decorative", subtitleRu: "Стеновые панели из дерева, камня и эксклюзивных материалов", subtitleRo: "Panouri de perete din lemn, piatră și materiale exclusive", image: "/images/decorative_walls/01_dec_wall.jpg" },
];

const ALL_ITEMS = [...KITCHENS, ...WARDROBES, ...CLOSETS, ...TVZONES, ...WALLS];

export default function Home() {
  const { lang } = useLang();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (item: GalleryItemData) => {
    const index = ALL_ITEMS.findIndex((i) => i.image === item.image);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const currentItem = ALL_ITEMS[lightboxIndex];

  return (
    <div style={{ background: "#0d0d0d" }}>
      <Hero />
      <About />
      <Philosophy />

      <section id="portfolio" className="py-24 px-6 sm:px-12" style={{ maxWidth: "1600px", margin: "0 auto" }}>
        <div className="text-center mb-16">
          <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>{t(lang, "portfolio.label")}</p>
          <h2 className="font-light leading-tight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
            {t(lang, "portfolio.title1")}<br /><span style={{ color: "#c9b99a" }}>{t(lang, "portfolio.title2")}</span>
          </h2>
        </div>
      </section>

      <GallerySection id="kitchens" label={t(lang, "kitchens.label")} title={t(lang, "kitchens.title")} description={t(lang, "kitchens.desc")} items={KITCHENS} onItemClick={openLightbox} lang={lang} />
      <OurWorks onImageClick={(img) => {
        const idx = ALL_ITEMS.findIndex((i) => i.image === img);
        if (idx >= 0) {
          setLightboxIndex(idx);
          setLightboxOpen(true);
          document.body.style.overflow = "hidden";
        }
      }} />
      <GallerySection id="wardrobes" label={t(lang, "wardrobes.label")} title={t(lang, "wardrobes.title")} description={t(lang, "wardrobes.desc")} items={WARDROBES} onItemClick={openLightbox} dark lang={lang} />
      <GallerySection id="closets" label={t(lang, "closets.label")} title={t(lang, "closets.title")} description={t(lang, "closets.desc")} items={CLOSETS} onItemClick={openLightbox} lang={lang} />
      <GallerySection id="tvzones" label={t(lang, "tvzones.label")} title={t(lang, "tvzones.title")} description={t(lang, "tvzones.desc")} items={TVZONES} onItemClick={openLightbox} dark lang={lang} />
      <GallerySection id="walls" label={t(lang, "walls.label")} title={t(lang, "walls.title")} description={t(lang, "walls.desc")} items={WALLS} onItemClick={openLightbox} lang={lang} />

      <Advantages />
      {/* Calculator temporarily hidden for AI lead test */}
      {/* <Calculator /> */}
      <Footer />

      <Lightbox
        isOpen={lightboxOpen}
        title={lang === "ro" ? currentItem?.titleRo : currentItem?.titleRu || ""}
        subtitle={lang === "ro" ? currentItem?.subtitleRo : currentItem?.subtitleRu || ""}
        image={currentItem?.image || ""}
        onClose={closeLightbox}
        onNext={() => setLightboxIndex((p) => (p + 1) % ALL_ITEMS.length)}
        onPrev={() => setLightboxIndex((p) => (p - 1 + ALL_ITEMS.length) % ALL_ITEMS.length)}
      />
    </div>
  );
}
