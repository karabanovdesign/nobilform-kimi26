import { useRef, useState, useEffect, useCallback } from "react";
import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";

// ===== Lightbox Image with drag/swipe navigation =====
const SWIPE_THRESHOLD = 60;

function LightboxImage({
  openItem,
  onClose,
  onPrev,
  onNext,
}: {
  openItem: WorkItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const dragStartX = useRef(0);
  const isDragging = useRef(false);
  const didSwipe = useRef(false);

  if (!openItem) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    isDragging.current = true;
    didSwipe.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = dragStartX.current - e.clientX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      didSwipe.current = true;
      isDragging.current = false;
      if (dx > 0) onNext();
      else onPrev();
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        maxWidth: "90vw",
        maxHeight: "88vh",
        touchAction: "none",
        userSelect: "none",
        cursor: isDragging.current ? "grabbing" : "grab",
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <img
        src={openItem.image}
        alt="Portfolio"
        draggable={false}
        loading="eager"
        decoding="async"
        style={{
          maxWidth: "90vw",
          maxHeight: "82vh",
          objectFit: "contain",
          borderRadius: 8,
          pointerEvents: "none",
          willChange: "transform",
        }}
      />
    </div>
  );
}

interface WorkItem {
  image: string;
  titleRu: string;
  titleRo: string;
  descRu: string;
  descRo: string;
  link: string;
}

const ORIGINAL: WorkItem[] = [
  { image: "/images/our_works/work01.jpg", titleRu: "Кухонный гарнитур премиум", titleRo: "Bucătărie premium", descRu: "Авторский проект кухни в современном стиле.", descRo: "Proiect de bucătărie autor în stil modern.", link: "#kitchens" },
  { image: "/images/our_works/work02.png", titleRu: "Кухня Soft Luxury", titleRo: "Bucătărie Soft Luxury", descRu: "Элегантная кухня с мраморной столешницей.", descRo: "Bucătărie elegantă cu blat de marmură.", link: "#kitchens" },
  { image: "/images/our_works/work03.png", titleRu: "Минималистичная кухня", titleRo: "Bucătărie minimalistă", descRu: "Строгие линии и функциональность.", descRo: "Linii stricte și funcționalitate.", link: "#kitchens" },
  { image: "/images/our_works/work04.png", titleRu: "Кухня Dark Premium", titleRo: "Bucătărie Dark Premium", descRu: "Тёмная кухня с премиум фурнитурой.", descRo: "Bucătărie întunecată cu feronerie premium.", link: "#kitchens" },
  { image: "/images/our_works/work05.png", titleRu: "Кухня с островом", titleRo: "Bucătărie cu insulă", descRu: "Просторная кухня с центральным островом.", descRo: "Bucătărie spațioasă cu insulă centrală.", link: "#kitchens" },
  { image: "/images/our_works/work06.png", titleRu: "Гардеробная система", titleRo: "Sistem dressing", descRu: "Встроенная гардеробная с LED-подсветкой.", descRo: "Dressing încorporat cu iluminat LED.", link: "#wardrobes" },
  { image: "/images/our_works/work07.png", titleRu: "Шкаф-купе премиум", titleRo: "Dulap premium", descRu: "Шкаф с зеркальными фасадами и золотом.", descRo: "Dulap cu fațade oglinzite și aur.", link: "#wardrobes" },
  { image: "/images/our_works/work08.png", titleRu: "Гардеробная комната", titleRo: "Camera dressing", descRu: "Индивидуальная гардеробная с витринами.", descRo: "Dressing individual cu vitrine.", link: "#wardrobes" },
  { image: "/images/our_works/work09.png", titleRu: "Шкаф в спальню", titleRo: "Dulap dormitor", descRu: "Белый шкаф с латунными элементами.", descRo: "Dulap alb cu elemente de alamă.", link: "#wardrobes" },
  { image: "/images/our_works/work10.png", titleRu: "Система хранения", titleRo: "Sistem depozitare", descRu: "Модульная система с подсветкой.", descRo: "Sistem modular cu iluminat.", link: "#closets" },
  { image: "/images/our_works/work11.png", titleRu: "Встроенный шкаф", titleRo: "Dulap încorporat", descRu: "Шкаф с реечными фасадами.", descRo: "Dulap cu fațade din șipcă.", link: "#closets" },
  { image: "/images/our_works/work12.png", titleRu: "Гардероб Premium", titleRo: "Dressing Premium", descRu: "Тёмный гардероб с органайзерами.", descRo: "Dressing întunecat cu organizatoare.", link: "#closets" },
  { image: "/images/our_works/work13.png", titleRu: "Выдвижные ящики", titleRo: "Sertare extensibile", descRu: "Premium-система хранения аксессуаров.", descRo: "Sistem premium de depozitare accesorii.", link: "#closets" },
  { image: "/images/our_works/work14.png", titleRu: "Мебельная стенка", titleRo: "Perete mobilier", descRu: "Стеновая панель с консолью.", descRo: "Panou de perete cu consolă.", link: "#tvzones" },
  { image: "/images/our_works/work15.png", titleRu: "ТВ-зона", titleRo: "Zonă TV", descRu: "Декоративная панель с LED-лентой.", descRo: "Panou decorativ cu bandă LED.", link: "#tvzones" },
  { image: "/images/our_works/work16.png", titleRu: "Гостиная премиум", titleRo: "Living premium", descRu: "Мебельная композиция для гостиной.", descRo: "Compoziție mobilier pentru living.", link: "#tvzones" },
  { image: "/images/our_works/work17.png", titleRu: "Декоративная стена", titleRo: "Perete decorativ", descRu: "3D-панель с подсветкой.", descRo: "Panou 3D cu iluminat.", link: "#tvzones" },
  { image: "/images/our_works/work18.png", titleRu: "Кухня Japandi", titleRo: "Bucătărie Japandi", descRu: "Сочетание японского и скандинавского стиля.", descRo: "Combinație de stil japonez și scandinav.", link: "#kitchens" },
  { image: "/images/our_works/work19.png", titleRu: "Кухня Contemporary", titleRo: "Bucătărie Contemporary", descRu: "Современный дизайн с интеграцией техники.", descRo: "Design modern cu integrare tehnică.", link: "#kitchens" },
  { image: "/images/our_works/work20.png", titleRu: "Кухня Natural Wood", titleRo: "Bucătărie Natural Wood", descRu: "Тёплая кухня из натурального дерева.", descRo: "Bucătărie caldă din lemn natural.", link: "#kitchens" },
  { image: "/images/our_works/work21.png", titleRu: "Прихожая", titleRo: "Hol", descRu: "Встроенная система для прихожей.", descRo: "Sistem încorporat pentru hol.", link: "#closets" },
  { image: "/images/our_works/work22.png", titleRu: "Кухонный остров", titleRo: "Insulă bucătărie", descRu: "Барная стойка с интегрированной техникой.", descRo: "Bară cu tehnică integrată.", link: "#kitchens" },
  { image: "/images/our_works/work23.png", titleRu: "Шкаф с витриной", titleRo: "Dulap cu vitrină", descRu: "Стеклянные фасады с подсветкой.", descRo: "Fațade de sticlă cu iluminat.", link: "#wardrobes" },
  { image: "/images/our_works/work24.png", titleRu: "Спальня на заказ", titleRo: "Dormitor la comandă", descRu: "Мебельный комплект для спальни.", descRo: "Set mobilier pentru dormitor.", link: "#walls" },
  { image: "/images/our_works/work25.png", titleRu: "ТВ-консоль", titleRo: "Consolă TV", descRu: "Длинная консоль под телевизор.", descRo: "Consolă lungă pentru televizor.", link: "#tvzones" },
  { image: "/images/our_works/work26.png", titleRu: "Шкаф в прихожую", titleRo: "Dulap hol", descRu: "Белый шкаф с зеркалами и золотом.", descRo: "Dulap alb cu oglinzi și aur.", link: "#closets" },
  { image: "/images/our_works/work27.png", titleRu: "Кухня Warm Minimal", titleRo: "Bucătărie Warm Minimal", descRu: "Тёплый минимализм с деревом.", descRo: "Minimalism cald cu lemn.", link: "#kitchens" },
  { image: "/images/our_works/work28.png", titleRu: "Гардероб с островом", titleRo: "Dressing cu insulă", descRu: "Центральный остров для аксессуаров.", descRo: "Insulă centrală pentru accesorii.", link: "#wardrobes" },
];

const ALL = [...ORIGINAL, ...ORIGINAL, ...ORIGINAL];
const CARD_W = 420;
const GAP = 24;
const SPEED = 0.6;
const DRAG_THRESHOLD = 6; // px — above this = drag, below = click

export default function OurWorks() {
  const { lang } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const pos = useRef(0);
  const dragging = useRef(false);
  const didDrag = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const raf = useRef(0);
  const totalW = ORIGINAL.length * (CARD_W + GAP);

  // Preload all portfolio images for instant lightbox switching
  useEffect(() => {
    ORIGINAL.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, []);

  // Center scroll
  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      pos.current = totalW;
      track.scrollLeft = totalW;
    }
  }, [totalW]);

  // Auto-scroll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const loop = () => {
      if (!paused && !dragging.current) {
        pos.current += SPEED;
        if (pos.current >= totalW * 2) pos.current -= totalW;
        track.scrollLeft = pos.current;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [paused, totalW]);

  // Lightbox: lock scroll + keyboard navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((prev) => (prev !== null ? (prev + 1) % ORIGINAL.length : 0));
      if (e.key === "ArrowLeft") setLightboxIdx((prev) => (prev !== null ? (prev - 1 + ORIGINAL.length) % ORIGINAL.length : 0));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [lightboxIdx]);

  const goNext = () => setLightboxIdx((prev) => (prev !== null ? (prev + 1) % ORIGINAL.length : 0));
  const goPrev = () => setLightboxIdx((prev) => (prev !== null ? (prev - 1 + ORIGINAL.length) % ORIGINAL.length : 0));

  // ===== DRAG via window listeners (no setPointerCapture) =====
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    didDrag.current = false;
    startX.current = e.clientX;
    startScroll.current = pos.current;

    const onMove = (ev: PointerEvent) => {
      const dx = startX.current - ev.clientX;
      if (Math.abs(dx) > DRAG_THRESHOLD) didDrag.current = true;
      let np = startScroll.current + dx;
      if (np < totalW * 0.5) np += totalW;
      if (np >= totalW * 2.5) np -= totalW;
      pos.current = np;
      if (trackRef.current) trackRef.current.scrollLeft = np;
    };

    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [totalW]);

  // Click handler on individual card
  const handleCardClick = useCallback((realIdx: number) => {
    if (didDrag.current) return; // ignore if it was a drag
    setLightboxIdx(realIdx);
  }, []);

  const openItem = lightboxIdx !== null ? ORIGINAL[lightboxIdx] : null;

  return (
    <>
      <div id="ourworks" className="py-20" style={{ background: "#0d0d0d" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
          <div className="text-center mb-12">
            <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>{t(lang, "ourworks.label")}</p>
            <h2 className="font-light leading-tight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>{t(lang, "ourworks.title1")}</h2>
          </div>
        </div>

        <div
          className="relative w-full"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => { setPaused(false); dragging.current = false; }}
        >
          <div
            ref={trackRef}
            className="flex select-none"
            onPointerDown={onPointerDown}
            style={{
              gap: GAP,
              overflow: "hidden",
              cursor: "grab",
              touchAction: "none",
              overscrollBehavior: "none",
              paddingLeft: "max(24px, calc((100vw - 1400px) / 2 + 24px))",
              paddingRight: "max(24px, calc((100vw - 1400px) / 2 + 24px))",
            }}
          >
            {ALL.map((item, idx) => {
              const realIdx = idx % ORIGINAL.length;
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl shrink-0 block"
                  style={{ width: "clamp(280px, 80vw, 420px)", minWidth: "280px", aspectRatio: "3/4", cursor: "pointer" }}
                  draggable={false}
                  onClick={() => handleCardClick(realIdx)}
                >
                  <img src={item.image} alt="Portfolio" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" draggable={false} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.3) 40%, transparent 70%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 p-7 flex flex-col items-start gap-3">
                    <span className="inline-block text-[10px] font-medium tracking-[3px] uppercase px-3 py-1 rounded-full" style={{ background: "rgba(184,148,90,0.15)", color: "#b8945a", border: "1px solid rgba(184,148,90,0.25)" }}>Premium</span>
                    <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[1px] uppercase transition-all group-hover:gap-3" style={{ color: "#b8945a" }}>
                      {lang === "ro" ? "Vezi proiectul" : "Смотреть проект"}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-center mt-6 text-[10px] tracking-[2px] uppercase" style={{ color: "rgba(245, 243, 239, 0.25)" }}>
            {lang === "ro" ? "Apăsați pentru a vizualiza • Trageți pentru a derula" : "Нажмите для просмотра • Перетащите для прокрутки"}
          </p>
        </div>
      </div>

      {/* ===== LIGHTBOX — always in DOM for instant display ===== */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200"
        style={{
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(8px)",
          opacity: openItem ? 1 : 0,
          pointerEvents: openItem ? "auto" : "none",
          touchAction: "none",
          userSelect: "none",
        }}
        onClick={() => setLightboxIdx(null)}
      >
        {/* Close button */}
        <button
          className="absolute top-5 right-5 z-10 flex items-center justify-center rounded-full transition-opacity duration-200"
          style={{
            width: 44, height: 44,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            opacity: openItem ? 1 : 0,
          }}
          onClick={() => setLightboxIdx(null)}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5f3ef" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Counter */}
        {openItem && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-xs tracking-[3px] uppercase" style={{ color: "rgba(245, 243, 239, 0.5)" }}>
            {(lightboxIdx ?? 0) + 1} / {ORIGINAL.length}
          </div>
        )}

        {/* Content — swipe/drag area */}
        <LightboxImage
          openItem={openItem}
          onClose={() => setLightboxIdx(null)}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    </>
  );
}
