import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: "ru",
  setLang: () => {},
  toggleLang: () => {},
});

export function LangProvider({ children, initialLang = "ru" }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.history.pushState({}, "", `/${l}`);
  }, []);

  const toggleLang = useCallback(() => {
    const newLang = lang === "ru" ? "ro" : "ru";
    setLang(newLang);
  }, [lang, setLang]);

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
