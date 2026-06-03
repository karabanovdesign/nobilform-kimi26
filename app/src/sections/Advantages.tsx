import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";
import { Palette, Eye, Gem, Layers, Factory, Sparkles } from "lucide-react";

export default function Advantages() {
  const { lang } = useLang();

  const advantages = [
    { icon: Palette, title: t(lang, "advantages.adv1title"), desc: t(lang, "advantages.adv1desc") },
    { icon: Eye, title: t(lang, "advantages.adv2title"), desc: t(lang, "advantages.adv2desc") },
    { icon: Gem, title: t(lang, "advantages.adv3title"), desc: t(lang, "advantages.adv3desc") },
    { icon: Layers, title: t(lang, "advantages.adv4title"), desc: t(lang, "advantages.adv4desc") },
    { icon: Factory, title: t(lang, "advantages.adv5title"), desc: t(lang, "advantages.adv5desc") },
    { icon: Sparkles, title: t(lang, "advantages.adv6title"), desc: t(lang, "advantages.adv6desc") },
  ];

  return (
    <section className="py-24 px-6 sm:px-12" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div className="text-center mb-16">
        <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>
          {t(lang, "advantages.label")}
        </p>
        <h2 className="font-light mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
          {t(lang, "advantages.title")}
        </h2>
        <p className="text-base font-light max-w-[600px] mx-auto leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          {t(lang, "advantages.desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {advantages.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="p-6 rounded group transition-all hover:border-[rgba(184,148,90,0.25)]" style={{ background: "rgba(245, 243, 239, 0.02)", border: "1px solid rgba(184, 148, 90, 0.08)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(184, 148, 90, 0.15)" }}>
                <Icon className="w-5 h-5" style={{ color: "#b8945a" }} />
              </div>
              <h3 className="text-base font-normal mb-2" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
                {item.title}
              </h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.5)" }}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
