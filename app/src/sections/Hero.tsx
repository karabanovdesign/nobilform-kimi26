import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";

export default function Hero() {
  const { lang } = useLang();

  return (
    <section
      id="hero"
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: "100dvh", height: "100dvh" }}
    >
      {/* Background with mobile-optimized overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/images/horizontal/03_dark_kitchen.jpg')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Overlay — lighter on mobile */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.50) 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full text-center px-5 sm:px-6" style={{ maxWidth: "900px" }}>
        {/* Logo — оригинальный V201 */}
        <div className="mb-4 sm:mb-6 flex justify-center">
          <img
            src="/images/logo-full.png"
            alt="NobilForm by KVDesign"
            className="object-contain"
            style={{
              height: "clamp(220px, 40vh, 520px)",
              width: "auto",
              filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        {/* Subtitle */}
        <p
          className="text-xs sm:text-sm font-normal tracking-[5px] sm:tracking-[6px] uppercase mb-5 sm:mb-8"
          style={{ color: "#b8945a" }}
        >
          {t(lang, "hero.subtitle")}
        </p>

        {/* H1 Title — compact on mobile */}
        <h1
          className="font-light tracking-tight mb-8 sm:mb-10"
          style={{
            fontSize: "clamp(42px, 7vw, 72px)",
            lineHeight: 1.05,
            color: "#f5f3ef",
            fontFamily: "'Playfair Display', serif",
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          {t(lang, "hero.title1")}
          <br />
          <span style={{ color: "#c9b99a" }}>{t(lang, "hero.title2")}</span>
        </h1>

        {/* CTA Buttons */}
        <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
          {/* Primary CTA */}
          <a
            href="#calculator"
            className="px-7 sm:px-8 py-3 sm:py-3.5 rounded text-xs sm:text-sm font-medium tracking-[2px] uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ background: "#b8945a", color: "#0d0d0d" }}
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t(lang, "hero.cta1")}
          </a>
          {/* Portfolio CTA — enhanced border + glow */}
          <a
            href="#ourworks"
            className="group relative px-7 sm:px-8 py-3 sm:py-3.5 rounded text-xs sm:text-sm font-medium tracking-[2px] uppercase transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "transparent",
              color: "#f5f3ef",
              border: "2px solid rgba(184, 148, 90, 0.65)",
              boxShadow: "0 0 0 rgba(184,148,90,0)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(184, 148, 90, 1)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(184,148,90,0.35), inset 0 0 20px rgba(184,148,90,0.08)";
              e.currentTarget.style.background = "rgba(184, 148, 90, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(184, 148, 90, 0.65)";
              e.currentTarget.style.boxShadow = "0 0 0 rgba(184,148,90,0)";
              e.currentTarget.style.background = "transparent";
            }}
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#ourworks")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t(lang, "hero.cta2")}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] sm:text-xs tracking-[3px] uppercase" style={{ color: "#b8945a" }}>
          {t(lang, "hero.scroll")}
        </span>
        <div className="w-px h-[50px] sm:h-[60px]" style={{ background: "linear-gradient(to bottom, #b8945a, transparent)" }} />
      </div>
    </section>
  );
}
