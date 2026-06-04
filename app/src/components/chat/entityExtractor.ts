// ===== ENTITY EXTRACTION =====
// Extracts specific details from user queries
// NOTE: \b word boundary does NOT work with Cyrillic in JavaScript.
// We use (^|[^a-zA-Zа-яё]) and ($|[^a-zA-Zа-яё]) instead.

export interface ExtractedEntities {
  doorType: "glisante" | "batante" | "none";
  buildType: "incorporat" | "corp" | "none";
  material: "sticla" | "oglinda" | "lemn" | "mdf" | "shpon" | "dsp" | "none";
  product: "dulap" | "dressing" | "tv" | "bucatarie" | "perete" | "none";
  size: string;
  color: string;
  led: boolean;
  island: boolean;
  kitchenForm: "linear" | "corner" | "ushape" | "none"; // formă bucătărie: liniară / în G / în U
  appliances: boolean; // tehnică încorporabilă
}

// Word boundary that works for both Latin and Cyrillic
const WB = (s: string) => `(^|[^a-zA-Zа-яё])${s}($|[^a-zA-Zа-яё])`;

// Extract product from previous messages (context memory)
function extractProductFromHistory(history: string[]): ExtractedEntities["product"] {
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i].toLowerCase();
    if (new RegExp(WB("(dressing|гардеробн)"), "i").test(h)) return "dressing";
    if (new RegExp(WB("(dulap|шкаф)"), "i").test(h)) return "dulap";
    if (new RegExp(WB("(tv|тв|televizor|телевизор)"), "i").test(h)) return "tv";
    if (new RegExp(WB("(bucatarie|bucătărie|кухн|kitchen)"), "i").test(h)) return "bucatarie";
    if (new RegExp(WB("(perete decorativ|panou 3d|изголовье|pereți|тăblie|стенов|панел)"), "i").test(h)) return "perete";
  }
  return "none";
}

export function extractEntities(query: string, history: string[] = []): ExtractedEntities {
  const lower = query.toLowerCase().trim();

  // Door type
  let doorType: ExtractedEntities["doorType"] = "none";
  if (/(glisante|glisant|culisante|раздвижн|купе|купэ|cupe|glis)/i.test(lower)) doorType = "glisante";
  else if (/(batante|batant|распашн|clasic)/i.test(lower)) doorType = "batante";

  // Build type
  let buildType: ExtractedEntities["buildType"] = "none";
  if (/(incorporat|incorporabil|встроен|встраиваем)/i.test(lower)) buildType = "incorporat";
  else if (/(corp|корпусн|mobil)/i.test(lower)) buildType = "corp";

  // Material
  let material: ExtractedEntities["material"] = "none";
  if (/(стекло|стекл|sticla|sticlă|steklo)/i.test(lower)) material = "sticla";
  else if (/(зеркало|зеркал|oglinda|oglindă|oglinzi)/i.test(lower)) material = "oglinda";
  else if (/(дерев|дуб|stejar|орех|frasin|ясень|lemn)/i.test(lower)) material = "lemn";
  else if (/(шпон|furnir)/i.test(lower)) material = "shpon";
  else if (/(дсп|dsp|egger|пал|pal)/i.test(lower)) material = "dsp";
  else if (/(мдф|mdf|мат|mat|глянец|lucios)/i.test(lower)) material = "mdf";

  // Product — current query first, then fallback to history
  let product: ExtractedEntities["product"] = "none";
  if (/(dressing|гардеробн)/i.test(lower)) product = "dressing";
  else if (/(dulap|шкаф)/i.test(lower)) product = "dulap";
  else if (/(tv|тв|televizor|телевизор|media)/i.test(lower)) product = "tv";
  else if (/(bucatarie|bucătărie|кухн|kitchen)/i.test(lower)) product = "bucatarie";
  else if (/(perete decorativ|panou 3d|изголовье|pereți|тăblie|стенов|панел|перегородк)/i.test(lower)) product = "perete";
  // Fallback: inherit product from previous messages
  if (product === "none" && history.length > 0) {
    product = extractProductFromHistory(history);
  }

  // Size — search in query first, then in history
  let size = "";
  const sizeMatch = lower.match(/(\d+[.,]?\d*)\s*(м|m|metri|metr|ml|мл)/);
  if (sizeMatch) size = sizeMatch[0];
  if (!size && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const hMatch = history[i].match(/(\d+[.,]?\d*)\s*(м|m|metri|metr|ml|мл)/i);
      if (hMatch) { size = hMatch[0]; break; }
    }
  }

  // Material — search in history too
  if (material === "none" && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i].toLowerCase();
      if (/(стекло|стекл|sticla|sticlă|steklo)/i.test(h)) { material = "sticla"; break; }
      if (/(зеркало|зеркал|oglinda|oglindă|oglinzi)/i.test(h)) { material = "oglinda"; break; }
      if (/(дерев|дуб|stejar|орех|frasin|ясень|lemn)/i.test(h)) { material = "lemn"; break; }
      if (/(шпон|furnir)/i.test(h)) { material = "shpon"; break; }
      if (/(дсп|dsp|egger|пал|pal)/i.test(h)) { material = "dsp"; break; }
      if (/(мдф|mdf|мат|mat|глянец|lucios)/i.test(h)) { material = "mdf"; break; }
    }
  }

  // Color — search in query first, then in history
  let color = "";
  const colors = [
    "alb", "alba", "albă", "белый", "белая", "белое", "бел", "negru", "чёрный", "черный", "ч[её]рн", "gri", "серый", "серый", "сер", "maro", "коричневый", "коричн",
    "crem", "кремовый", "крем", "bej", "бежевый", "беж", "albastru", "синий", "син", "verde", "зелёный", "зеленый", "зел[её]н", "ro[șs]u", "красный", "красн",
    "темный", "т[ёе]мн", "золотой", "золотой", "auriu", "золотой", "золота",
  ];
  for (const c of colors) {
    if (new RegExp(WB(c), "i").test(lower)) { color = c; break; }
  }
  if (!color && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const h = history[i].toLowerCase();
      for (const c of colors) {
        if (new RegExp(WB(c), "i").test(h)) { color = c; break; }
      }
      if (color) break;
    }
  }

  // LED
  const led = /(led|подсветк|iluminat|lumina|lumini)/i.test(lower);

  // Island
  const island = /(insula|insulă|остров)/i.test(lower);

  // Kitchen form: linear / corner / U-shape
  let kitchenForm: ExtractedEntities["kitchenForm"] = "none";
  if (/(прямая|линейная|liniar|liniara|liniară)/i.test(lower)) kitchenForm = "linear";
  else if (/(угловая|г-образная|corner|unghiular|unghiulară|în g)/i.test(lower)) kitchenForm = "corner";
  else if (/(п-образная|u-образная|в п-образн|în u|u shape)/i.test(lower)) kitchenForm = "ushape";

  // Built-in appliances
  const appliances = /(встроенная техника|техник|встраиваем|техника|electrocasnice|încorpor)/i.test(lower);

  return { doorType, buildType, material, product, size, color, led, island, kitchenForm, appliances };
}

// ===== SMART FOLLOW-UP =====
// Generates follow-up only about MISSING information
// Product-specific: kitchen asks for form & appliances; closet asks for door type
export function smartFollowUp(lang: "ru" | "ro", entities: ExtractedEntities): string {
  const missing: string[] = [];

  // === KITCHEN-specific follow-up ===
  if (entities.product === "bucatarie") {
    if (!entities.size) missing.push(lang === "ro" ? "dimensiunea (în metri liniari)" : "размер (в погонных метрах)");
    if (entities.kitchenForm === "none") missing.push(lang === "ro" ? "forma (liniară, în G sau în U)" : "форма (прямая, угловая или П-образная)");
    if (entities.material === "none") missing.push(lang === "ro" ? "materialul fațadelor" : "материал фасадов");
    if (!entities.color) missing.push(lang === "ro" ? "culoarea" : "цвет");
    if (!entities.appliances) missing.push(lang === "ro" ? "tehnică încorporabilă (da/nu)" : "встроенная техника (да/нет)");

    if (missing.length === 0) {
      return lang === "ro"
        ? "Am toate detaliile pentru bucătărie. Doriți să programați o consultare cu designerul?"
        : "У меня есть все детали по кухне. Хотите записаться на консультацию с дизайнером?";
    }
    return buildMissingQuestion(lang, missing);
  }

  // === CLOSET / WARDROBE-specific follow-up ===
  if (entities.product === "dulap" || entities.product === "dressing") {
    if (!entities.size) missing.push(lang === "ro" ? "dimensiunea (lățime × înălțime)" : "размеры (ширина × высота)");
    if (entities.doorType === "none") missing.push(lang === "ro" ? "tipul ușilor (glisante sau batante)" : "тип дверей (купе или распашные)");
    if (entities.material === "none") missing.push(lang === "ro" ? "materialul" : "материал");
    if (!entities.color) missing.push(lang === "ro" ? "culoarea" : "цвет");

    if (missing.length === 0) {
      return lang === "ro"
        ? "Am toate detaliile pentru dulap. Doriți să programați o consultare cu designerul?"
        : "У меня есть все детали по шкафу. Хотите записаться на консультацию с дизайнером?";
    }
    return buildMissingQuestion(lang, missing);
  }

  // === GENERIC follow-up ===
  if (!entities.size) missing.push(lang === "ro" ? "dimensiunea" : "размер");
  if (entities.material === "none") missing.push(lang === "ro" ? "materialul" : "материал");

  if (missing.length === 0) {
    return lang === "ro"
      ? "Doriți să programați o consultare cu designerul?"
      : "Хотите записаться на консультацию с дизайнером?";
  }

  return buildMissingQuestion(lang, missing);
}

// Helper: builds a natural-language question from missing items
function buildMissingQuestion(lang: "ru" | "ro", missing: string[]): string {
  if (missing.length === 1) {
    return lang === "ro"
      ? `Ce ${missing[0]} aveți în vedere?`
      : `Какой ${missing[0]} вы рассматриваете?`;
  }

  const list = lang === "ro"
    ? missing.slice(0, -1).join(", ") + " și " + missing[missing.length - 1]
    : missing.slice(0, -1).join(", ") + " и " + missing[missing.length - 1];

  return lang === "ro"
    ? `Ce ${list} preferați?`
    : `Какой ${list} вы предпочитаете?`;
}

// ===== PERSONALIZED RESPONSE BUILDER =====
export function buildPersonalizedResponse(
  lang: "ru" | "ro",
  baseResponse: string,
  entities: ExtractedEntities,
): string {
  const e = entities;
  let personalization = "";

  const acknowledged: string[] = [];

  if (e.buildType === "incorporat") {
    acknowledged.push(lang === "ro" ? "încorporat" : "встроенный");
  } else if (e.buildType === "corp") {
    acknowledged.push(lang === "ro" ? "corp mobil" : "корпусной");
  }

  if (e.doorType === "glisante") {
    acknowledged.push(lang === "ro" ? "cu uși glisante" : "с раздвижными дверями");
  } else if (e.doorType === "batante") {
    acknowledged.push(lang === "ro" ? "cu uși batante" : "с распашными дверями");
  }

  if (e.material === "sticla") {
    acknowledged.push(lang === "ro" ? "din sticlă" : "из стекла");
  } else if (e.material === "oglinda") {
    acknowledged.push(lang === "ro" ? "cu oglindă" : "с зеркалом");
  } else if (e.material === "lemn") {
    acknowledged.push(lang === "ro" ? "din lemn natural" : "из натурального дерева");
  } else if (e.material === "dsp") {
    acknowledged.push(lang === "ro" ? "din PAL" : "из ДСП");
  } else if (e.material === "mdf") {
    acknowledged.push(lang === "ro" ? "din MDF" : "из МДФ");
  } else if (e.material === "shpon") {
    acknowledged.push(lang === "ro" ? "cu furnir" : "со шпоном");
  } else if (e.material) {
    acknowledged.push(e.material);
  }

  if (e.size) acknowledged.push(e.size);
  if (e.color) acknowledged.push(e.color);
  if (e.led) acknowledged.push(lang === "ro" ? "cu iluminat LED" : "с LED-подсветкой");

  if (acknowledged.length > 0) {
    const detail = acknowledged.join(", ");

    if (e.product === "dulap") {
      personalization = lang === "ro" ? `Excelentă alegere — dulap ${detail}.\n\n` : `Отличный выбор — шкаф ${detail}.\n\n`;
    } else if (e.product === "dressing") {
      personalization = lang === "ro" ? `Excelentă alegere — dressing ${detail}.\n\n` : `Отличный выбор — гардеробная ${detail}.\n\n`;
    } else if (e.product === "tv") {
      personalization = lang === "ro" ? `Excelentă alegere — zonă TV ${detail}.\n\n` : `Отличный выбор — ТВ-зона ${detail}.\n\n`;
    } else if (e.product === "bucatarie") {
      personalization = lang === "ro" ? `Excelentă alegere — bucătărie ${detail}.\n\n` : `Отличный выбор — кухня ${detail}.\n\n`;
    } else if (e.product !== "none") {
      personalization = lang === "ro" ? `Am înțeles — proiect ${detail}.\n\n` : `Понял — проект ${detail}.\n\n`;
    }
  }

  return personalization + baseResponse;
}
