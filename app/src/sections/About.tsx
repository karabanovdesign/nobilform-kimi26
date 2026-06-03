import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";

export default function About() {
  const { lang } = useLang();

  return (
    <section id="about" className="py-24 px-6 sm:px-12" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div className="text-center mb-16">
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>
          {t(lang, "about.label")}
        </p>
        <h2
          className="font-light leading-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}
        >
          {t(lang, "about.title1")}
          <br />
          {t(lang, "about.title2")}
        </h2>
      </div>

      <p className="text-base font-light leading-[1.9] text-center mb-16 max-w-[800px] mx-auto" style={{ color: "rgba(245, 243, 239, 0.7)" }}>
        <span style={{ color: "#b8945a", fontWeight: 500 }}>NobilForm</span> {t(lang, "about.desc1")}
        <br /><br />
        {t(lang, "about.desc2")}
        <br /><br />
        {t(lang, "about.desc3")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        {[
          { number: t(lang, "about.stat1"), label: t(lang, "about.stat1label") },
          { number: t(lang, "about.stat2"), label: t(lang, "about.stat2label") },
          { number: t(lang, "about.stat3"), label: t(lang, "about.stat3label") },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-4xl sm:text-5xl font-light leading-none mb-2" style={{ color: "#b8945a", fontFamily: "'Playfair Display', serif" }}>
              {stat.number}
            </div>
            <div className="text-xs tracking-[2px] uppercase" style={{ color: "rgba(245, 243, 239, 0.5)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
