import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";

export default function Footer() {
  const { lang } = useLang();

  return (
    <footer id="contact" style={{ borderTop: "1px solid rgba(184, 148, 90, 0.1)", background: "rgba(13, 13, 13, 0.5)" }}>
      <div className="py-20 px-6 text-center">
        <h2 className="font-light mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
          {t(lang, "footer.ctaTitle")}
        </h2>
        <p className="text-base font-light max-w-[500px] mx-auto mb-8 leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>
          {t(lang, "footer.ctaDesc")}
        </p>
        <a href="whatsapp://send?phone=37360599907" className="inline-block px-8 py-3.5 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "#b8945a", color: "#0d0d0d" }}>
          {t(lang, "footer.ctaButton")}
        </a>
      </div>

      <div className="py-10 sm:py-12 px-6 flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-12 lg:gap-20" style={{ borderTop: "1px solid rgba(184, 148, 90, 0.1)", borderBottom: "1px solid rgba(184, 148, 90, 0.1)" }}>
        <div className="text-center">
          <div className="text-xs tracking-[3px] uppercase mb-2" style={{ color: "rgba(245, 243, 239, 0.4)" }}>{t(lang, "footer.phoneLabel")}</div>
          <a href="tel:+37360599907" className="text-base sm:text-lg font-light transition-colors hover:text-[#b8945a]" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>+373 60 599 907</a>
        </div>
        <div className="text-center">
          <div className="text-xs tracking-[3px] uppercase mb-2" style={{ color: "rgba(245, 243, 239, 0.4)" }}>{t(lang, "footer.emailLabel")}</div>
          <a href="mailto:nobilaform@gmail.com" className="text-base sm:text-lg font-light transition-colors hover:text-[#b8945a]" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>nobilaform@gmail.com</a>
        </div>
        <div className="text-center">
          <div className="text-xs tracking-[3px] uppercase mb-2" style={{ color: "rgba(245, 243, 239, 0.4)" }}>{t(lang, "footer.locationLabel")}</div>
          <p className="text-base sm:text-lg font-light" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>{t(lang, "footer.location")}</p>
        </div>
      </div>

      <div className="py-8 px-6 text-center">
        <div className="text-xl font-light mb-2" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>
          NobilForm <span style={{ color: "#b8945a" }}>by KVDesign</span>
        </div>
        <p className="text-xs tracking-[2px] mb-4" style={{ color: "rgba(245, 243, 239, 0.4)" }}>{t(lang, "footer.tagline")}</p>
        <p className="text-xs" style={{ color: "rgba(245, 243, 239, 0.2)" }}>
          &copy; 2026 {t(lang, "footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
