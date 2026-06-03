import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";

export default function Philosophy() {
  const { lang } = useLang();

  const cards = [
    { title: t(lang, "philosophy.card1title"), desc: t(lang, "philosophy.card1desc") },
    { title: t(lang, "philosophy.card2title"), desc: t(lang, "philosophy.card2desc") },
    { title: t(lang, "philosophy.card3title"), desc: t(lang, "philosophy.card3desc") },
    { title: t(lang, "philosophy.card4title"), desc: t(lang, "philosophy.card4desc") },
  ];

  return (
    <section className="py-24 px-6 sm:px-12" style={{ background: "rgba(26, 26, 26, 0.5)", borderTop: "1px solid rgba(184, 148, 90, 0.1)", borderBottom: "1px solid rgba(184, 148, 90, 0.1)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="text-center mb-16">
          <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>
            {t(lang, "philosophy.label")}
          </p>
          <h2 className="font-light leading-tight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
            {t(lang, "philosophy.title1")}
            <br />
            {t(lang, "philosophy.title2")}
          </h2>
          <p className="text-base font-light max-w-[650px] mx-auto mt-4 leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
            {t(lang, "philosophy.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((item) => (
            <div key={item.title} className="p-6 rounded" style={{ background: "rgba(245, 243, 239, 0.03)", border: "1px solid rgba(184, 148, 90, 0.1)" }}>
              <h3 className="text-lg font-normal mb-3" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
                {item.title}
              </h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="text-4xl sm:text-5xl font-light leading-none mb-4 sm:mb-6" style={{ color: "#b8945a", fontFamily: "'Playfair Display', serif", opacity: 0.3 }}>
            &ldquo;
          </div>
          <p className="text-xl sm:text-2xl font-light leading-relaxed max-w-[700px] mx-auto mb-4" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
            {t(lang, "philosophy.quote1")}
            <br />
            <span style={{ color: "#c9b99a" }}>{t(lang, "philosophy.quote2")}</span>
          </p>
          <p className="text-xs mt-4 tracking-[3px] uppercase" style={{ color: "#b8945a" }}>
            {t(lang, "philosophy.author")}
          </p>
        </div>
      </div>
    </section>
  );
}
