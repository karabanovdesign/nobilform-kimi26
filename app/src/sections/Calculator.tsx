import { useState, useEffect, useRef } from "react";
import { useLang } from "@/providers/LangProvider";
import { t } from "@/lib/i18n";

// ===== CONFIG: all prices & multipliers in one place =====
const CONFIG = {
  basePrice: 650, // € per linear meter

  config: {
    linear:        1.00, // Прямая
    corner:        1.15, // Угловая Г-образная
    uShape:        1.30, // П-образная
    cShape:        1.40, // С-образная с барной стойкой
    cornerIsland:  1.55, // Угловая с островом
  },

  material: {
    laminate: 1.00, // ЛДСП премиум
    agt:      1.15, // AGT MDF
    matte:    1.35, // МДФ эмаль мат
    glossy:   1.45, // МДФ эмаль глянец
    veneer:   1.70, // Шпон
    glass:    1.90, // Стекло / алюминий
  },

  countertop: {
    quartz: 120,  // ДСП Egger — €/м
    hpl:    240,  // HPL Fundermax — €/м
    dekton: 650,  // Dekton/Silestone — €/м
    marble: 850,  // Мрамор — €/м
  },

  hardware: {
    basic:   1.00, // Blum / Hettich стандарт
    premium: 1.15, // Blum Legrabox / Aventos
    luxury:  1.30, // Kessebohmer
  },

  lighting: {
    none:    0,   // Без подсветки
    basic:   150, // LED базовая — фикс €
    premium: 350, // LED премиум — фикс €
  },

  level: {
    "1":    1.00, // Стандарт
    "1.1":  1.10, // Premium
    "1.2":  1.20, // Luxury
    "1.35": 1.35, // Bespoke
  },

  // Range multipliers for display
  rangeMin: 0.95,
  rangeMax: 1.05,
} as const;

// ===== Animated number hook =====
function useAnimatedNumber(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const raf = useRef(0);
  const startVal = useRef(target);
  const startTime = useRef(0);

  useEffect(() => {
    startVal.current = display;
    startTime.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startVal.current + (target - startVal.current) * ease;
      setDisplay(Math.round(current));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

// ===== Calculation =====
function calculate(params: {
  type: string;
  length: string;
  config: string;
  material: string;
  countertop: string;
  hardware: string;
  lighting: string;
  level: string;
}) {
  if (params.type === "complex") return null;

  const L = parseFloat(params.length) || 2.5;
  if (L < 1) return null;

  const cfgMul  = CONFIG.config[params.config as keyof typeof CONFIG.config] ?? 1;
  const matMul  = CONFIG.material[params.material as keyof typeof CONFIG.material] ?? 1;
  const hwMul   = CONFIG.hardware[params.hardware as keyof typeof CONFIG.hardware] ?? 1;
  const lvlMul  = CONFIG.level[params.level as keyof typeof CONFIG.level] ?? 1;
  const ctPrice = CONFIG.countertop[params.countertop as keyof typeof CONFIG.countertop] ?? 0;
  const light   = CONFIG.lighting[params.lighting as keyof typeof CONFIG.lighting] ?? 0;

  const base = CONFIG.basePrice * L * cfgMul * matMul * hwMul * lvlMul;
  const countertopTotal = ctPrice * L;
  const total = base + countertopTotal + light;

  return {
    total,
    min: Math.round(total * CONFIG.rangeMin),
    max: Math.round(total * CONFIG.rangeMax),
  };
}

export default function Calculator() {
  const { lang } = useLang();
  const [type, setType]       = useState("kitchen");
  const [length, setLength]   = useState("4");
  const [material, setMaterial]     = useState("laminate");
  const [config, setConfig]         = useState("linear");
  const [countertop, setCountertop] = useState("quartz");
  const [hardware, setHardware]     = useState("basic");
  const [lighting, setLighting]     = useState("none");
  const [level, setLevel]           = useState("1");

  const result = calculate({ type, length, config, material, countertop, hardware, lighting, level });

  const animatedMin = useAnimatedNumber(result?.min ?? 0);
  const animatedMax = useAnimatedNumber(result?.max ?? 0);

  const showComplex = type === "complex";

  const s = { background: "rgba(245, 243, 239, 0.05)", border: "1px solid rgba(184, 148, 90, 0.2)", color: "#f5f3ef" };
  const cls = "w-full px-4 py-3 rounded text-sm outline-none transition-colors focus:border-[#b8945a]";

  return (
    <section id="calculator" className="py-24 px-6 sm:px-12" style={{ background: "rgba(26, 26, 26, 0.3)", borderTop: "1px solid rgba(184, 148, 90, 0.1)", borderBottom: "1px solid rgba(184, 148, 90, 0.1)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div className="text-center mb-12">
          <p className="text-xs font-normal tracking-[5px] uppercase mb-4" style={{ color: "#b8945a" }}>{t(lang, "calculator.label")}</p>
          <h2 className="font-light mb-4" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>{t(lang, "calculator.title")}</h2>
          <p className="text-base font-light max-w-[600px] mx-auto leading-relaxed" style={{ color: "rgba(245, 243, 239, 0.6)" }}>{t(lang, "calculator.desc")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Тип проекта */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.typeLabel")}</label>
            <select className={cls} style={s} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="kitchen">{t(lang, "calculator.typeKitchen")}</option>
              <option value="wardrobe">{t(lang, "calculator.typeWardrobe")}</option>
              <option value="closet">{t(lang, "calculator.typeCloset")}</option>
              <option value="tvzone">{t(lang, "calculator.typeTvzone")}</option>
              <option value="wall">{t(lang, "calculator.typeWall")}</option>
              <option value="complex">{t(lang, "calculator.typeComplex")}</option>
            </select>
          </div>

          {/* Длина */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.lengthLabel")}</label>
            <input type="number" className={cls} style={s} value={length} onChange={(e) => setLength(e.target.value)} min="1" step="0.1" placeholder="4" />
          </div>

          {/* Конфигурация */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.configLabel")}</label>
            <select className={cls} style={s} value={config} onChange={(e) => setConfig(e.target.value)}>
              <option value="linear">{t(lang, "calculator.configLinear")}</option>
              <option value="corner">{t(lang, "calculator.configCorner")}</option>
              <option value="uShape">{t(lang, "calculator.configUShape")}</option>
              <option value="cShape">{t(lang, "calculator.configCShape")}</option>
              <option value="cornerIsland">{t(lang, "calculator.configCornerIsland")}</option>
            </select>
          </div>

          {/* Материал */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.materialLabel")}</label>
            <select className={cls} style={s} value={material} onChange={(e) => setMaterial(e.target.value)}>
              <option value="laminate">{t(lang, "calculator.materialLaminate")}</option>
              <option value="agt">{t(lang, "calculator.materialAgt")}</option>
              <option value="matte">{t(lang, "calculator.materialMatte")}</option>
              <option value="glossy">{t(lang, "calculator.materialGlossy")}</option>
              <option value="veneer">{t(lang, "calculator.materialVeneer")}</option>
              <option value="glass">{t(lang, "calculator.materialGlass")}</option>
            </select>
          </div>

          {/* Столешница */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.countertopLabel")}</label>
            <select className={cls} style={s} value={countertop} onChange={(e) => setCountertop(e.target.value)}>
              <option value="quartz">{t(lang, "calculator.countertopQuartz")}</option>
              <option value="hpl">{t(lang, "calculator.countertopHpl")}</option>
              <option value="dekton">{t(lang, "calculator.countertopDekton")}</option>
              <option value="marble">{t(lang, "calculator.countertopMarble")}</option>
            </select>
          </div>

          {/* Фурнитура */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.hardwareLabel")}</label>
            <select className={cls} style={s} value={hardware} onChange={(e) => setHardware(e.target.value)}>
              <option value="basic">{t(lang, "calculator.hardwareBasic")}</option>
              <option value="premium">{t(lang, "calculator.hardwarePremium")}</option>
              <option value="luxury">{t(lang, "calculator.hardwareLuxury")}</option>
            </select>
          </div>

          {/* Подсветка */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.lightingLabel")}</label>
            <select className={cls} style={s} value={lighting} onChange={(e) => setLighting(e.target.value)}>
              <option value="none">{t(lang, "calculator.lightingNone")}</option>
              <option value="basic">{t(lang, "calculator.lightingBasic")}</option>
              <option value="premium">{t(lang, "calculator.lightingPremium")}</option>
            </select>
          </div>

          {/* Сложность дизайна */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium tracking-[2px] uppercase" style={{ color: "#b8945a" }}>{t(lang, "calculator.levelLabel")}</label>
            <select className={cls} style={s} value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="1">{t(lang, "calculator.level1")}</option>
              <option value="1.1">{t(lang, "calculator.level12")}</option>
              <option value="1.2">{t(lang, "calculator.level15")}</option>
              <option value="1.35">{t(lang, "calculator.level2")}</option>
            </select>
          </div>

          {/* ===== RESULT: auto-calculated, no button ===== */}
          {!showComplex && result && (
            <div className="sm:col-span-2 text-center p-8 rounded mt-4" style={{ background: "rgba(184, 148, 90, 0.08)", border: "1px solid rgba(184, 148, 90, 0.2)" }}>
              <div className="text-xs tracking-[3px] uppercase mb-3" style={{ color: "rgba(245, 243, 239, 0.5)" }}>{t(lang, "calculator.resultLabel")}</div>
              <div className="font-light leading-none flex items-center justify-center gap-3 flex-wrap" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "rgba(245, 243, 239, 0.5)" }}>
                  {lang === "ro" ? "de la" : "от"}
                </span>
                <span style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "#b8945a" }}>
                  {animatedMin.toLocaleString(lang === "ro" ? "ro-RO" : "ru-RU")} €
                </span>
                <span style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "rgba(245, 243, 239, 0.5)" }}>
                  —
                </span>
                <span style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "#b8945a" }}>
                  {animatedMax.toLocaleString(lang === "ro" ? "ro-RO" : "ru-RU")} €
                </span>
              </div>
              <div className="text-xs mt-4 italic" style={{ color: "rgba(245, 243, 239, 0.3)" }}>{t(lang, "calculator.resultNote")}</div>
            </div>
          )}

          {/* ===== COMPLEX PROJECT ===== */}
          {showComplex && (
            <div className="sm:col-span-2 text-center p-8 rounded mt-4" style={{ background: "rgba(184, 148, 90, 0.08)", border: "1px solid rgba(184, 148, 90, 0.3)" }}>
              <div className="text-2xl font-light mb-4" style={{ color: "#f5f3ef", fontFamily: "'Playfair Display', serif" }}>{t(lang, "calculator.complexTitle")}</div>
              <p className="text-sm mb-6" style={{ color: "rgba(245, 243, 239, 0.6)" }}>{t(lang, "calculator.complexDesc")}</p>
              <div className="flex flex-wrap justify-center gap-6">
                <a href="tel:+37360599907" className="px-6 py-3 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "#b8945a", color: "#0d0d0d" }}>{t(lang, "calculator.complexCall")}</a>
                <a href="mailto:nobilaform@gmail.com" className="px-6 py-3 rounded text-sm font-medium tracking-[2px] uppercase transition-all hover:-translate-y-0.5" style={{ background: "transparent", color: "#f5f3ef", border: "1px solid rgba(184, 148, 90, 0.4)" }}>{t(lang, "calculator.complexWrite")}</a>
              </div>
              <p className="text-xs mt-6" style={{ color: "rgba(245, 243, 239, 0.3)" }}>+373 60 599 907 | nobilaform@gmail.com</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
