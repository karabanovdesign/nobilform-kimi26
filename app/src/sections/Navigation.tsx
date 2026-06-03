import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";
import { useLocation } from "react-router";

const NAV_LINKS = [
  { href: "#about", key: "nav.studio" },
  { href: "#ourworks", key: "nav.portfolio" },
  { href: "#calculator", key: "nav.process" },
  { href: "#contact", key: "nav.contacts" },
];

const SEO_LINKS = [
  { href: "/kuhni-na-zakaz", label: "Кухни" },
  { href: "/garderobnye", label: "Гардеробные" },
  { href: "/faq", label: "FAQ" },
];

export default function Navigation() {
  const { lang, toggleLang } = useLang();
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/ru" || location.pathname === "/ro";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const target = document.querySelector(href);
    target?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4"
      style={{
        background: "rgba(13, 13, 13, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(184, 148, 90, 0.12)",
      }}
    >
      {/* Logo — larger on mobile */}
      <a
        href={`/${lang}`}
        className="text-base sm:text-lg md:text-xl font-medium shrink-0"
        style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif", textDecoration: "none" }}
      >
        NobilForm <span style={{ color: "#b8945a" }}>by KVDesign</span>
      </a>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-8">
        {/* Desktop Nav Links */}
        <ul className="hidden md:flex gap-6 lg:gap-8 list-none">
          {isHome
            ? NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="text-xs font-normal tracking-[2px] uppercase transition-colors hover:text-[#b8945a]"
                    style={{ color: "rgba(245, 243, 239, 0.7)", textDecoration: "none" }}
                  >
                    {t(lang, link.key)}
                  </a>
                </li>
              ))
            : SEO_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs font-normal tracking-[2px] uppercase transition-colors hover:text-[#b8945a]"
                    style={{ color: "rgba(245, 243, 239, 0.7)", textDecoration: "none" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
        </ul>

        {/* Language Switcher — premium style */}
        <div
          className="flex items-center rounded-full overflow-hidden"
          style={{
            border: "1.5px solid rgba(184, 148, 90, 0.35)",
            background: "rgba(184, 148, 90, 0.06)",
          }}
        >
          <button
            onClick={() => lang !== "ru" && toggleLang()}
            className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 rounded-full"
            style={{
              background: lang === "ru" ? "#b8945a" : "transparent",
              color: lang === "ru" ? "#0d0d0d" : "rgba(245, 243, 239, 0.45)",
              margin: "2px",
              minWidth: "32px",
            }}
          >
            RU
          </button>
          <button
            onClick={() => lang !== "ro" && toggleLang()}
            className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 rounded-full"
            style={{
              background: lang === "ro" ? "#b8945a" : "transparent",
              color: lang === "ro" ? "#0d0d0d" : "rgba(245, 243, 239, 0.45)",
              margin: "2px",
              minWidth: "32px",
            }}
          >
            RO
          </button>
        </div>
      </div>
    </nav>
  );
}
