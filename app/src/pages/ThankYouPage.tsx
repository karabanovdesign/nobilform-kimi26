import { useEffect } from "react";
import { useLocation } from "react-router";
import type { Lang } from "@/lib/i18n";

export default function ThankYouPage() {
  const location = useLocation();
  const pathLang = location.pathname.replace(/\/$/, "").split("/").pop() as Lang;
  const lang: Lang = pathLang === "ro" ? "ro" : "ru";

  const t = {
    ru: {
      title: "Спасибо за заявку!",
      subtitle: "Наш специалист свяжется с вами в ближайшее время для расчёта стоимости кухни.",
      back: "Вернуться на главную",
      metaDescription: "Спасибо за обращение. Наш специалист свяжется с вами в ближайшее время.",
    },
    ro: {
      title: "Mulțumim pentru cerere!",
      subtitle: "Specialistul nostru vă va contacta în cel mai scurt timp pentru calculul costului bucătăriei.",
      back: "Înapoi la pagina principală",
      metaDescription: "Mulțumim pentru solicitare. Specialistul nostru vă va contacta în cel mai scurt timp.",
    },
  };

  const c = t[lang];

  useEffect(() => {
    document.title = c.title;
  }, [c.title]);

  // Google Ads Conversion Tracking — fires once on page load
  useEffect(() => {
    window.gtag?.("event", "conversion", {
      send_to: "AW-18213365373/Mu6xCPK7_bgcEP3M5-xD",
    });
  }, []);

  return (
    <>
      {/* noindex for search engines */}
      <meta name="robots" content="noindex, nofollow" />

      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ background: "#0d0d0d" }}
      >
        <div className="max-w-xl">
          {/* Decorative icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{
              background: "rgba(184,148,90,0.1)",
              border: "1px solid rgba(184,148,90,0.3)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b8945a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-light mb-6 leading-tight tracking-wide"
            style={{
              color: "#f5f3ef",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "0.02em",
            }}
          >
            {c.title}
          </h1>

          <p
            className="text-base sm:text-lg leading-relaxed mb-10"
            style={{ color: "rgba(245,243,239,0.6)", fontFamily: "'Playfair Display', serif" }}
          >
            {c.subtitle}
          </p>

          <a
            href="/"
            className="inline-block px-8 py-3.5 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
            style={{
              background: "#b8945a",
              color: "#0d0d0d",
            }}
          >
            {c.back}
          </a>

          <p className="mt-8 text-xs" style={{ color: "rgba(245,243,239,0.3)" }}>
            NobilForm by KVDesign
          </p>
        </div>
      </section>
    </>
  );
}
