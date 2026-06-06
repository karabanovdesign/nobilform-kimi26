import { useLang } from "@/providers/LangProvider";
import { useNavigate } from "react-router";

export default function NotFoundPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  const t = {
    title: lang === "ro" ? "Pagina nu a fost găsită" : "Страница не найдена",
    subtitle: lang === "ro" ? "404" : "404",
    text:
      lang === "ro"
        ? "Este posibil ca linkul să fie expirat sau pagina a fost eliminată."
        : "Возможно, ссылка устарела или страница была удалена.",
    cta: lang === "ro" ? "Înapoi la pagina principală" : "Вернуться на главную",
  };

  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        padding: "24px",
      }}
    >
      <p
        className="text-xs font-normal tracking-[5px] uppercase mb-6"
        style={{ color: "#b8945a" }}
      >
        {t.subtitle}
      </p>

      <h1
        className="font-light leading-tight mb-6"
        style={{
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          color: "#f5f3ef",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {t.title}
      </h1>

      <p
        className="font-light leading-relaxed mb-10 max-w-md"
        style={{
          fontSize: "1rem",
          color: "rgba(245, 243, 239, 0.6)",
          lineHeight: 1.7,
        }}
      >
        {t.text}
      </p>

      <button
        onClick={() => navigate(`/${lang}`)}
        className="inline-flex items-center gap-3 text-sm font-medium tracking-[1px] uppercase transition-all duration-300 hover:gap-4"
        style={{
          color: "#0d0d0d",
          background: "#b8945a",
          padding: "14px 36px",
          borderRadius: "2px",
          cursor: "pointer",
          letterSpacing: "1.5px",
        }}
      >
        {t.cta}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
