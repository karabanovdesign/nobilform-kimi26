import { useEffect } from "react";
import { HelmetSeo } from "@/components/HelmetSeo";

const ARTICLES = [
  {
    title: "Как выбрать кухню на заказ: полное руководство 2026",
    excerpt: "Всё о материалах фасадов, столешницах, фурнитуре и конфигурациях. Сколько стоит, сколько длится, на что обратить внимание при заказе кухни в Кишиневе.",
    date: "2026-05-15",
    readTime: "12 мин",
    tags: ["кухни", "гид", "2026"],
  },
  {
    title: "МДФ или ДСП: что лучше для кухонных фасадов",
    excerpt: "Подробное сравнение материалов: плотность, устойчивость к влаге, возможности покраски, срок службы, цена. Рекомендации по стилям интерьера.",
    date: "2026-05-08",
    readTime: "8 мин",
    tags: ["материалы", "МДФ", "ДСП"],
  },
  {
    title: "Кварцевая столешница: плюсы, минусы и уход",
    excerpt: "Почему кварц Silestone и Dekton — лучший выбор для кухни. Сравнение с мрамором, гранитом и искусственным камнем. Правила ухода и чистки.",
    date: "2026-04-22",
    readTime: "7 мин",
    tags: ["столешница", "кварц", "уход"],
  },
  {
    title: "7 стилей кухонь, которые будут актуальны в 2026",
    excerpt: "Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary. Описание, референсы, материалы для каждого стиля.",
    date: "2026-04-10",
    readTime: "10 мин",
    tags: ["тренды", "стили", "дизайн"],
  },
  {
    title: "Кухня с островом: планировка и ошибки",
    excerpt: "Минимальная площадь, расстояния, инженерия (вода, электричество), типы островов, барные стулья. Что нельзя делать при проектировании кухни с островом.",
    date: "2026-03-28",
    readTime: "9 мин",
    tags: ["остров", "планировка", "ошибки"],
  },
  {
    title: "Фурнитура Blum: какая система подойдёт вашей кухне",
    excerpt: "Сравнение Legrabox, Tandembox, Aventos, Servo-Drive. Грузоподъёмность, срок службы, цена. Почему не стоит экономить на фурнитуре.",
    date: "2026-03-15",
    readTime: "6 мин",
    tags: ["фурнитура", "Blum", "Legrabox"],
  },
  {
    title: "Гардеробная мечты: как спланировать идеальное хранение",
    excerpt: "Зоны хранения, высота полок, штанги, выдвижные системы. Минимальные размеры гардеробной. Сколько стоит гардеробная на заказ в Кишиневе.",
    date: "2026-02-20",
    readTime: "8 мин",
    tags: ["гардеробная", "хранение", "планировка"],
  },
  {
    title: "LED-подсветка для кухни: виды и стоимость",
    excerpt: "Подсветка под шкафы, внутри шкафов, под столешницу, остров. Базовая и премиум LED. Управление через приложение, диммеры, цветовые температуры.",
    date: "2026-02-05",
    readTime: "5 мин",
    tags: ["подсветка", "LED", "освещение"],
  },
  {
    title: "Шкафы-купе: зеркало, стекло или ДСП",
    excerpt: "Как выбрать фасады для шкафа-купе. Сравнение материалов, системы раздвижения TopLine vs InLine. Наполнение: штанги, полки, ящики.",
    date: "2026-01-18",
    readTime: "7 мин",
    tags: ["шкаф-купе", "фасады", "зеркало"],
  },
  {
    title: "Сколько стоит кухня на заказ в Кишиневе в 2026",
    excerpt: "Разбор цен: бюджетный сегмент (650–1000 €/м), средний (1000–1500 €/м), премиум (1500–2500 €/м). Что входит в стоимость, на чем можно сэкономить.",
    date: "2026-01-05",
    readTime: "10 мин",
    tags: ["цены", "бюджет", "2026"],
  },
];

export default function SeoBlogPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "#f5f3ef" }}>
      <HelmetSeo
        title="Блог о мебели и дизайне интерьера | NobilForm Кишинев"
        description="Полезные статьи о кухнях на заказ, материалах, трендах дизайна, уходе за мебелью. Экспертные советы от студии NobilForm в Кишиневе."
        canonical="https://nobilform.md/blog"
      />

      <div className="py-20 px-6 text-center" style={{ borderBottom: "1px solid rgba(184,148,90,0.1)" }}>
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>Блог NobilForm</p>
        <h1 className="font-light mb-6" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>
          Полезные статьи о мебели и дизайне
        </h1>
        <p className="text-sm font-light max-w-[600px] mx-auto" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          Экспертные советы, тренды, гиды по выбору материалов и планировке от студии NobilForm в Кишиневе
        </p>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-16">
        {ARTICLES.map((article, idx) => (
          <article
            key={idx}
            className="mb-6 p-6 rounded-lg transition-all hover:-translate-y-1"
            style={{ background: "rgba(245, 243, 239, 0.03)", border: "1px solid rgba(184, 148, 90, 0.08)", cursor: "pointer" }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-[10px] tracking-[2px] uppercase" style={{ color: "#b8945a" }}>
                {article.date}
              </span>
              <span style={{ color: "rgba(245, 243, 239, 0.2)" }}>|</span>
              <span className="text-[10px]" style={{ color: "rgba(245, 243, 239, 0.4)" }}>
                {article.readTime}
              </span>
            </div>
            <h2 className="text-lg font-medium mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "#f5f3ef" }}>
              {article.title}
            </h2>
            <p className="text-sm mb-4" style={{ color: "rgba(245, 243, 239, 0.55)" }}>
              {article.excerpt}
            </p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="text-[10px] tracking-[1px] uppercase px-2 py-1 rounded-full"
                  style={{ background: "rgba(184,148,90,0.08)", color: "#b8945a" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Schema BlogPosting */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Блог NobilForm — мебель и дизайн интерьера",
          "url": "https://nobilform.md/blog",
          "description": "Полезные статьи о кухнях на заказ, материалах, трендах дизайна",
          "publisher": { "@id": "https://nobilform.md/#organization" },
          "blogPost": ARTICLES.slice(0, 5).map((a) => ({
            "@type": "BlogPosting",
            "headline": a.title,
            "description": a.excerpt,
            "datePublished": a.date,
            "author": { "@type": "Organization", "name": "NobilForm" },
            "publisher": { "@id": "https://nobilform.md/#organization" },
          })),
        })}
      </script>
    </div>
  );
}
