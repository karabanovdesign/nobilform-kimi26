import type { CalculatorState } from "./types";

// ===== CONFIG: same formula as main page calculator =====
const AI_CONFIG = {
  basePrice: 650, // € per linear meter at height 2.74m
  standardHeight: 2.74, // meters

  // Height coefficients
  heightCoefLower: 0.91,  // for height < 2.74m
  heightCoefHigher: 1.097, // for height > 2.74m

  material: {
    egger:  1.00,
    agt:    1.15,
    matte:  1.35,
    glossy: 1.45,
    veneer: 1.70,
  },

  countertop: {
    egger:  120,
    hpl:    240,
    quartz: 650,
    marble: 850,
  },

  hardware: {
    basic:   1.00,
    premium: 1.15,
    luxury:  1.30,
  },

  lighting: {
    none:    0,
    basic:   150,
    premium: 350,
  },

  config: {
    linear:       1.00,
    corner:       1.15,
    uShape:       1.30,
    cShape:       1.40,
    cornerIsland: 1.55,
  },

  level: {
    "1":    1.00,
    "1.1":  1.10,
    "1.2":  1.20,
    "1.35": 1.35,
  },

  rangeMin: 0.95,
  rangeMax: 1.05,
} as const;

const MATERIAL_LABELS_RU: Record<string, string> = {
  egger: "ЛДСП премиум",
  agt: "AGT MDF",
  matte: "МДФ эмаль мат",
  glossy: "МДФ эмаль глянец",
  veneer: "Шпон",
};

const MATERIAL_LABELS_RO: Record<string, string> = {
  egger: "PAL premium",
  agt: "AGT MDF",
  matte: "MDF email mat",
  glossy: "MDF email lucios",
  veneer: "Furnir",
};

const COUNTERTOP_LABELS_RU: Record<string, string> = {
  egger: "ДСП Egger",
  hpl: "HPL Fundermax",
  quartz: "Dekton / Silestone",
  marble: "Мрамор",
};

const COUNTERTOP_LABELS_RO: Record<string, string> = {
  egger: "PAL Egger",
  hpl: "HPL Fundermax",
  quartz: "Dekton / Silestone",
  marble: "Marmură",
};

const EXTRAS_LABELS_RU: Record<string, string> = {
  island: "Кухонный остров",
  led_premium: "LED премиум",
  legrabox: "Фурнитура Blum Legrabox",
  glass_facade: "Стеклянные фасады",
  appliance_integration: "Интеграция техники",
};

const EXTRAS_LABELS_RO: Record<string, string> = {
  island: "Insulă de bucătărie",
  led_premium: "LED premium",
  legrabox: "Feronerie Blum Legrabox",
  glass_facade: "Fațade de sticlă",
  appliance_integration: "Integrare tehnică",
};

// ===== Height coefficient calculator =====
function getHeightCoef(heightStr: string): number {
  if (!heightStr) return 1.0; // default 2.74m
  const h = parseFloat(heightStr.replace(",", "."));
  if (isNaN(h)) return 1.0;
  if (h < AI_CONFIG.standardHeight) return AI_CONFIG.heightCoefLower;  // 0.91
  if (h > AI_CONFIG.standardHeight) return AI_CONFIG.heightCoefHigher; // 1.097
  return 1.0; // exactly 2.74m
}

// ===== CALCULATE =====
export function calculateKitchen(state: CalculatorState): {
  totalMin: number;
  totalMax: number;
} {
  const L = state.size;

  // Height coefficient
  const heightCoef = getHeightCoef(state.height);

  // Material
  let matMul = AI_CONFIG.material[state.material as keyof typeof AI_CONFIG.material] ?? 1.0;
  if (state.extras.includes("glass_facade")) matMul = 1.90;

  // Countertop
  const ctPrice = AI_CONFIG.countertop[state.countertop as keyof typeof AI_CONFIG.countertop] ?? 120;

  // Hardware
  let hwMul = AI_CONFIG.hardware.basic;
  if (state.extras.includes("legrabox")) hwMul = AI_CONFIG.hardware.premium;

  // Lighting
  let lightPrice = AI_CONFIG.lighting.none;
  if (state.extras.includes("led_premium")) lightPrice = AI_CONFIG.lighting.premium;

  // Config
  let cfgMul = AI_CONFIG.config.linear;
  if (state.extras.includes("island")) cfgMul = AI_CONFIG.config.cornerIsland;

  // Level
  const lvlMul = AI_CONFIG.level["1"];

  // Formula: (basePrice × heightCoef) × length × config × material × hardware × level
  //          + countertop × length
  //          + lighting
  const effectiveBasePrice = AI_CONFIG.basePrice * heightCoef;
  const base = effectiveBasePrice * L * cfgMul * matMul * hwMul * lvlMul;
  const countertopTotal = ctPrice * L;
  const total = base + countertopTotal + lightPrice;

  return {
    totalMin: Math.round(total * AI_CONFIG.rangeMin),
    totalMax: Math.round(total * AI_CONFIG.rangeMax),
  };
}

export function formatResult(
  lang: "ru" | "ro",
  state: CalculatorState,
  calc: ReturnType<typeof calculateKitchen>,
): string {
  const matLabel = lang === "ro" ? MATERIAL_LABELS_RO[state.material] : MATERIAL_LABELS_RU[state.material];
  const ctLabel = lang === "ro" ? COUNTERTOP_LABELS_RO[state.countertop] : COUNTERTOP_LABELS_RU[state.countertop];
  const extrasLabels = state.extras.map(
    e => lang === "ro" ? EXTRAS_LABELS_RO[e] : EXTRAS_LABELS_RU[e],
  );

  if (lang === "ro") {
    let text = `📊 Calcul estimativ bucătărie ${state.size}m\n\n`;
    text += `• Înălțime: ${state.height || "2.74m (standard)"}\n`;
    text += `• Material: ${matLabel}\n`;
    text += `• Blat: ${ctLabel}\n`;
    if (extrasLabels.length) text += `• Extra: ${extrasLabels.join(", ")}\n`;
    if (state.notes) text += `\n📝 Comentarii:\n${state.notes}\n`;
    text += `\n💰 Interval preț:\n`;
    text += `${calc.totalMin.toLocaleString("ro-RO")} — ${calc.totalMax.toLocaleString("ro-RO")} €\n\n`;
    text += `Doriți să trimiteți proiectul? Apăsați butoanele de mai jos (WhatsApp / Email).`;
    return text;
  }

  let text = `📊 Расчёт кухни ${state.size} м\n\n`;
  text += `• Высота: ${state.height || "2.74м (стандарт)"}\n`;
  text += `• Материал: ${matLabel}\n`;
  text += `• Столешница: ${ctLabel}\n`;
  if (extrasLabels.length) text += `• Дополнительно: ${extrasLabels.join(", ")}\n`;
  if (state.notes) text += `\n📝 Комментарии:\n${state.notes}\n`;
  text += `\n💰 Диапазон стоимости:\n`;
  text += `${calc.totalMin.toLocaleString("ru-RU")} — ${calc.totalMax.toLocaleString("ru-RU")} €\n\n`;
  text += `Хотите отправить проект? Нажмите кнопки ниже (WhatsApp / Email).`;
  return text;
}

// ===== SIZE DETECTION =====
export function looksLikeSize(msg: string): boolean {
  const lower = msg.toLowerCase().trim();
  // Single number + unit: "3.5 м", "4m", "5 metri"
  if (/^\d+[.,]?\d*\s*(м|метр|пог\.?\s*м|ml|m\b|metri|metru|dimensiune|lungime)/i.test(lower)) return true;
  // Dimension word + number: "dimensiune 3.5", "lungime 4"
  if (/\b(dimensiune|lungime|metri|metru|высота|ширина|глубина|размер|длина|height|width|depth)\b.*\d/i.test(lower)) return true;
  // Number + unit anywhere: "2.7 m"
  if (/\d+[.,]?\d*\s*(м|m\b|ml|metri|metru)/i.test(lower)) return true;
  // Two numbers separated by dimension word: "3,5 высота 2,7"
  if (/\d+[.,]?\d*\s*(высота|ширина|глубина|х|×|x|на)\s*\d+[.,]?\d*/i.test(lower)) return true;
  return false;
}

export function extractSize(msg: string): number {
  // Try first number (main dimension)
  const match = msg.match(/(\d+[.,]?\d*)/);
  if (match) return parseFloat(match[1].replace(",", "."));
  return 0;
}

export function looksLikePhone(msg: string): boolean {
  const digits = msg.replace(/\D/g, "");
  return digits.length >= 5 && digits.length <= 12;
}

export function extractPhone(msg: string): string {
  return msg.replace(/\D/g, "");
}

// ===== CLOSET CALCULATION =====
const CLOSET_BASE_PRICE_MDL = 8500; // per linear meter

const CLOSET_MATERIAL_MULTIPLIERS: Record<string, number> = {
  egger: 0.75,
  agt: 0.9,
  matte: 1.0,
  glossy: 1.15,
  veneer: 1.45,
  mirror: 1.25,
  glass: 1.35,
};

const CLOSET_MATERIAL_LABELS_RU: Record<string, string> = {
  egger: "ДСП EGGER",
  agt: "AGT МДФ ламинат",
  matte: "МДФ крашенный мат",
  glossy: "МДФ крашенный глянец",
  veneer: "МДФ шпон",
  mirror: "Зеркало",
  glass: "Стекло",
};

const CLOSET_MATERIAL_LABELS_RO: Record<string, string> = {
  egger: "PAL EGGER",
  agt: "AGT MDF laminat",
  matte: "MDF vopsit mat",
  glossy: "MDF vopsit lucios",
  veneer: "MDF furnir",
  mirror: "Oglindă",
  glass: "Sticlă",
};

const CLOSET_DOOR_MULTIPLIERS: Record<string, number> = {
  "распашные": 1.0,
  "раздвижные": 1.1,
};

const CLOSET_DOOR_LABELS_RU: Record<string, string> = {
  "распашные": "Распашные",
  "раздвижные": "Раздвижные",
};

const CLOSET_DOOR_LABELS_RO: Record<string, string> = {
  "распашные": "Batante",
  "раздвижные": "Glisante",
};

const CLOSET_TYPE_LABELS_RU: Record<string, string> = {
  "встроенный": "Встроенный",
  "отдельностоящий": "Отдельностоящий",
};

const CLOSET_TYPE_LABELS_RO: Record<string, string> = {
  "встроенный": "Încorporat",
  "отдельностоящий": "Independent",
};

export function calculateCloset(state: { size: number; height: string; style: string; material: string; extras: string[]; notes: string; type: string }): {
  baseTotal: number;
  materialCost: number;
  doorCost: number;
  typeCost: number;
  totalMin: number;
  totalMax: number;
} {
  const matMul = CLOSET_MATERIAL_MULTIPLIERS[state.material] || 1;
  const doorMul = CLOSET_DOOR_MULTIPLIERS[state.extras[0] || "распашные"] || 1;
  const typeMul = state.type === "встроенный" ? 1.1 : 1.0;

  const baseTotal = Math.round(state.size * CLOSET_BASE_PRICE_MDL);
  const materialCost = Math.round(baseTotal * (matMul - 1));
  const doorCost = Math.round(baseTotal * (doorMul - 1));
  const typeCost = Math.round(baseTotal * (typeMul - 1));

  const subtotal = baseTotal + materialCost + doorCost + typeCost;
  const totalMin = Math.round(subtotal * 0.95);
  const totalMax = Math.round(subtotal * 1.15);

  return { baseTotal, materialCost, doorCost, typeCost, totalMin, totalMax };
}

export function formatClosetResult(
  lang: "ru" | "ro",
  state: { size: number; height: string; style: string; material: string; extras: string[]; notes: string; type: string },
  calc: ReturnType<typeof calculateCloset>,
): string {
  const matLabel = lang === "ro" ? CLOSET_MATERIAL_LABELS_RO[state.material] : CLOSET_MATERIAL_LABELS_RU[state.material];
  const doorLabel = lang === "ro" ? CLOSET_DOOR_LABELS_RO[state.extras[0] || ""] : CLOSET_DOOR_LABELS_RU[state.extras[0] || ""];
  const typeLabel = lang === "ro" ? CLOSET_TYPE_LABELS_RO[state.type] : CLOSET_TYPE_LABELS_RU[state.type];

  if (lang === "ro") {
    let text = `📊 Calcul estimativ dulap ${state.size}m\n\n`;
    if (typeLabel) text += `• Tip: ${typeLabel}\n`;
    if (state.height) text += `• Înălțime: ${state.height}\n`;
    if (matLabel) text += `• Material: ${matLabel}\n`;
    if (state.style) text += `• Culoare: ${state.style}\n`;
    if (doorLabel) text += `• Uși: ${doorLabel}\n`;
    if (state.notes) text += `\n📝 Comentarii:\n${state.notes}\n`;
    text += `\n💰 Interval preț:\n`;
    text += `${calc.totalMin.toLocaleString("ro-RO")} — ${calc.totalMax.toLocaleString("ro-RO")} MDL\n\n`;
    text += `Doriți să trimiteți proiectul? Apăsați butoanele de mai jos (WhatsApp / Email).`;
    return text;
  }

  let text = `📊 Расчёт шкафа ${state.size} м\n\n`;
  if (typeLabel) text += `• Тип: ${typeLabel}\n`;
  if (state.height) text += `• Высота: ${state.height}\n`;
  if (matLabel) text += `• Материал: ${matLabel}\n`;
  if (state.style) text += `• Цвет: ${state.style}\n`;
  if (doorLabel) text += `• Фасады: ${doorLabel}\n`;
  if (state.notes) text += `\n📝 Комментарии:\n${state.notes}\n`;
  text += `\n💰 Диапазон стоимости:\n`;
  text += `${calc.totalMin.toLocaleString("ru-RU")} — ${calc.totalMax.toLocaleString("ru-RU")} MDL\n\n`;
  text += `Хотите отправить проект? Нажмите кнопки ниже (WhatsApp / Email).`;
  return text;
}

// ===== CONSULTATION =====
export function isConsultationRequest(msg: string): boolean {
  const lower = msg.toLowerCase();
  const patterns = [
    "консультац", "связаться", "дизайнер", "позвонить", "перезвоните",
    "consultare", "designer", "contact", "sunati", "sunăți", "vreau sa vorbesc",
    "хочу консультацию", "as dori consultare",
  ];
  return patterns.some(p => lower.includes(p));
}
