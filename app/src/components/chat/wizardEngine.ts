// ===== STRUCTURED WIZARD — collects all params step by step =====
// Works for ALL products: шкафы, кухни, гардеробные, ТВ-зоны, стены

export interface WizardState {
  product: string;       // "шкаф", "кухня", "гардеробная", "ТВ-зона", "стена"
  sizeWidth: string;
  sizeHeight: string;
  sizeDepth: string;
  color: string;
  material: string;      // "ДСП", "МДФ", "AGT ламинат", "МДФ крашенный мат", etc.
  doorType: string;      // "распашные", "раздвижные", etc.
  extras: string[];
}

export function createEmptyWizard(): WizardState {
  return {
    product: "", sizeWidth: "", sizeHeight: "", sizeDepth: "",
    color: "", material: "", doorType: "", extras: [],
  };
}

// ===== SIZE PARSER =====
// Handles: "ширина 2,75 высота 2,68", "3м ширина 2,5 высота", "2.5х1.8х0.6"
export function parseSizes(msg: string): { width: string; height: string; depth: string } {
  const lower = msg.toLowerCase().replace(/,/g, ".");
  let width = "", height = "", depth = "";

  // ширина/width X
  const wMatch = lower.match(/(?:ширина|width|latime)\s*(\d+\.?\d*)/i);
  if (wMatch) width = wMatch[1];

  // высота/height Y
  const hMatch = lower.match(/(?:высота|height|inaltime)\s*(\d+\.?\d*)/i);
  if (hMatch) height = hMatch[1];

  // глубина/depth Z
  const dMatch = lower.match(/(?:глубина|depth|adancime)\s*(\d+\.?\d*)/i);
  if (dMatch) depth = dMatch[1];

  // Fallback: "3.5" without label → assume width
  if (!width && !height) {
    const numbers = lower.match(/(\d+\.?\d*)\s*(м|m|метр|metri)?/gi);
    if (numbers) {
      const vals = numbers.map(n => n.match(/(\d+\.?\d*)/)?.[1]).filter(Boolean) as string[];
      if (vals.length >= 1) width = vals[0];
      if (vals.length >= 2) height = vals[1];
      if (vals.length >= 3) depth = vals[2];
    }
  }

  return { width, height, depth };
}

// ===== COLOR PARSER =====
// Full color list — all spellings, all languages
export function parseColor(msg: string): string {
  const lower = msg.toLowerCase();

  // Simple substring matching — no regex needed
  const colorMap: [string, string][] = [
    // Белый / Alb
    ["белый", "белый"], ["белая", "белый"], ["белое", "белый"], ["alb", "белый"], ["alba", "белый"], ["алб", "белый"],
    // Чёрный / Negru
    ["чёрный", "чёрный"], ["черный", "чёрный"], ["чёрная", "чёрный"], ["черная", "чёрный"], ["negru", "чёрный"], ["негру", "чёрный"],
    // Серый / Gri
    ["серый", "серый"], ["серая", "серый"], ["серое", "серый"], ["gri", "серый"], ["гри", "серый"],
    // Тёмный
    ["тёмный", "тёмный"], ["темный", "тёмный"], ["тёмная", "тёмный"], ["темная", "тёмный"],
    // Золотой / Auriu
    ["золотой", "золотой"], ["золота", "золотой"], ["золото", "золотой"], ["auriu", "золотой"], ["ауриу", "золотой"],
    // Коричневый / Maro
    ["коричневый", "коричневый"], ["коричневая", "коричневый"], ["maro", "коричневый"], ["маро", "коричневый"],
    // Бежевый / Bej
    ["бежевый", "бежевый"], ["беж", "бежевый"], ["бежовый", "бежевый"], ["bej", "бежевый"], ["беж", "бежевый"],
    // Синий / Albastru
    ["синий", "синий"], ["синяя", "синий"], ["albastru", "синий"], ["албастру", "синий"],
    // Зелёный / Verde — ALL spellings
    ["зелёный", "зелёный"], ["зеленый", "зелёный"], ["зеленный", "зелёный"], ["зелёная", "зелёный"], ["зеленая", "зелёный"], ["verde", "зелёный"], ["верде", "зелёный"],
    // Красный / Roșu
    ["красный", "красный"], ["красная", "красный"], ["roșu", "красный"], ["rosu", "красный"], ["рошу", "красный"],
    // Жёлтый / Galben
    ["жёлтый", "жёлтый"], ["желтый", "жёлтый"], ["жёлтая", "жёлтый"], ["желтая", "жёлтый"], ["galben", "жёлтый"], ["галбен", "жёлтый"],
    // Оранжевый / Portocaliu
    ["оранжевый", "оранжевый"], ["оранжевая", "оранжевый"], ["portocaliu", "оранжевый"],
    // Фиолетовый / Violet
    ["фиолетовый", "фиолетовый"], ["фиолетовая", "фиолетовый"], ["violet", "фиолетовый"],
    // Розовый / Roz
    ["розовый", "розовый"], ["розовая", "розовый"], ["roz", "розовый"],
    // Бордовый / Bordo
    ["бордовый", "бордовый"], ["бордо", "бордовый"], ["bordo", "бордовый"],
    // Сливовый
    ["сливовый", "сливовый"], ["сливовая", "сливовый"],
    // Бирюзовый
    ["бирюзовый", "бирюзовый"], ["бирюзовая", "бирюзовый"], ["turquoise", "бирюзовый"],
    // Пудровый
    ["пудровый", "пудровый"], ["пудровая", "пудровый"], ["pudra", "пудровый"],
    // Графит
    ["графит", "графит"], ["графитовый", "графит"],
    // Антрацит
    ["антрацит", "антрацит"], ["антрацитовый", "антрацит"],
    // Слоновая кость / Ivory
    ["слоновая кость", "слоновая кость"], ["ivory", "слоновая кость"],
    // Молочный
    ["молочный", "молочный"], ["молочная", "молочный"],
    // Кремовый / Crem
    ["кремовый", "кремовый"], ["кремовая", "кремовый"], ["crem", "кремовый"],
    // Венге
    ["венге", "венге"],
    // Дуб
    ["дуб", "дуб"], ["дубовый", "дуб"], ["stejar", "дуб"],
    // Орех
    ["орех", "орех"], ["ореховый", "орех"], ["nuc", "орех"],
  ];

  for (const [keyword, label] of colorMap) {
    if (lower.includes(keyword)) return label;
  }

  // Check for "цвет XXX" or "culoare XXX" pattern
  const colorMatch = lower.match(/(?:цвет|culoare)\s+(.{2,20})/i);
  if (colorMatch) return colorMatch[1].trim();

  return "";
}

// ===== MATERIAL PARSER =====
export function parseMaterial(msg: string): string {
  const lower = msg.toLowerCase();
  if (/(стекло|стекл|sticla)/i.test(lower)) return "стекло";
  if (/(зеркало|зеркал|oglinda)/i.test(lower)) return "зеркало";
  if (/(шпон|furnir)/i.test(lower)) return "МДФ шпон";
  if (/(дерев|дуб|lemn)/i.test(lower)) return "дерево";
  if (/(агт|agt)/i.test(lower)) return "AGT ламинат";
  if (/(дсп|dsp|egger|пал|pal)/i.test(lower)) return "ДСП";
  if (/(мдф.*мат|mdf.*mat|крашенный мат|vopsit mat)/i.test(lower)) return "МДФ крашенный мат";
  if (/(мдф.*глянец|mdf.*lucios|крашенный глянец|vopsit lucios)/i.test(lower)) return "МДФ крашенный глянец";
  if (/(мдф|mdf)/i.test(lower)) return "МДФ";
  return "";
}

// ===== DOOR TYPE PARSER =====
export function parseDoorType(msg: string): string {
  const lower = msg.toLowerCase();
  if (/(распашн|batante)/i.test(lower)) return "распашные";
  if (/(раздвижн|купе|купэ|glisante|cupe)/i.test(lower)) return "раздвижные";
  if (/(открыт|deschise)/i.test(lower)) return "открытые";
  return "";
}

// ===== MISSING PARAMS =====
function getMissing(state: WizardState): string[] {
  const m: string[] = [];
  if (!state.sizeWidth && !state.sizeHeight) m.push("размер");
  if (!state.color) m.push("цвет");
  if (!state.material) m.push("материал");
  if (!state.doorType) m.push("тип дверей");
  return m;
}

// ===== WIZARD STEP-BY-STEP =====
export type WizardStep = "width" | "height" | "color" | "material" | "doorType" | "done";

export function getWizardStep(state: WizardState): WizardStep {
  if (!state.sizeWidth) return "width";
  if (!state.sizeHeight) return "height";
  if (!state.color) return "color";
  if (!state.material) return "material";
  if (!state.doorType) return "doorType";
  return "done";
}

// ===== WIZARD RESPONSE (step-by-step) =====
export function wizardResponse(lang: "ru" | "ro", state: WizardState, msg: string, currentStep?: WizardStep): { text: string; done: boolean; step: WizardStep } {
  // Parse info based on current step (passed explicitly to know which step was just answered)
  const step = currentStep || getWizardStep(state);

  // WIDTH step
  if (step === "width") {
    const wMatch = msg.match(/(\d+[.,]?\d*)/);
    if (wMatch) {
      state.sizeWidth = wMatch[1].replace(",", ".");
      return {
        text: lang === "ro" ? `Lățime ${state.sizeWidth}m înregistrată. Acum înălțimea:` : `Ширина ${state.sizeWidth}м записана. Теперь высота:`,
        done: false, step: "height",
      };
    }
    return {
      text: lang === "ro" ? `Ce lățime aveți în vedere? (în metri)` : `Какая ширина вас интересует? (в метрах)`,
      done: false, step: "width",
    };
  }

  // HEIGHT step
  if (step === "height") {
    const hMatch = msg.match(/(\d+[.,]?\d*)/);
    if (hMatch) {
      state.sizeHeight = hMatch[1].replace(",", ".");
      return {
        text: lang === "ro" ? `Înălțime ${state.sizeHeight}m înregistrată. Ce culoare preferați?` : `Высота ${state.sizeHeight}м записана. Какой цвет предпочитаете?`,
        done: false, step: "color",
      };
    }
    return {
      text: lang === "ro" ? `Ce înălțime aveți în vedere? (în metri)` : `Какая высота вас интересует? (в метрах)`,
      done: false, step: "height",
    };
  }

  // COLOR step
  if (step === "color") {
    const color = parseColor(msg);
    if (color) {
      state.color = color;
      return {
        text: lang === "ro" ? `Culoare ${color} — notat. Alegeți materialul (butoanele de mai jos):` : `Цвет ${color} — принят. Выберите материал (кнопки ниже):`,
        done: false, step: "material",
      };
    }
    return {
      text: lang === "ro" ? `Ce culoare preferați? (ex: alb, negru, gri, maro)` : `Какой цвет предпочитаете? (например: белый, чёрный, серый, коричневый)`,
      done: false, step: "color",
    };
  }

  // MATERIAL step
  if (step === "material") {
    const material = parseMaterial(msg);
    if (material) {
      state.material = material;
      return {
        text: lang === "ro" ? `Material ${material} — primit. Alegeți tipul ușilor (butoanele de mai jos):` : `Материал ${material} — принят. Выберите тип дверей (кнопки ниже):`,
        done: false, step: "doorType",
      };
    }
    return {
      text: lang === "ro" ? `Alegeți materialul (butoanele de mai jos):` : `Выберите материал (кнопки ниже):`,
      done: false, step: "material",
    };
  }

  // DOOR TYPE step
  if (step === "doorType") {
    const doorType = parseDoorType(msg);
    if (doorType) {
      state.doorType = doorType;
      // ALL DONE
      const sizeStr = `${state.sizeWidth}×${state.sizeHeight}м`;
      if (lang === "ro") {
        return {
          text: `✅ Comanda primită:\n• Produs: ${state.product}\n• Dimensiuni: ${sizeStr}\n• Culoare: ${state.color}\n• Material: ${state.material}\n• Uși: ${state.doorType}\n\nTrimitem cererea designerului. Vă contactează în cel mult o oră. Mulțumim pentru alegere!`,
          done: true, step: "done",
        };
      }
      return {
        text: `✅ Заявка принята:\n• Изделие: ${state.product}\n• Размеры: ${sizeStr}\n• Цвет: ${state.color}\n• Материал: ${state.material}\n• Двери: ${state.doorType}\n\nОтправляем запрос дизайнеру. Скоро с вами свяжутся. Спасибо за выбор нашей компании!`,
        done: true, step: "done",
      };
    }
    return {
      text: lang === "ro" ? `Alegeți tipul ușilor (butoanele de mai jos):` : `Выберите тип дверей (кнопки ниже):`,
      done: false, step: "doorType",
    };
  }

  // Already done
  return { text: "", done: true, step: "done" };
}

// ===== PRODUCT INFO =====
export function productInfo(lang: "ru" | "ro", product: string): string {
  if (lang === "ro") {
    switch (product) {
      case "шкаф": return "Dulapuri NobilForm: încorporabile și corp. Uși batante și glisante. Materiale: PAL, MDF, furnir, oglindă, sticlă.";
      case "кухня": return "Bucătării NobilForm: 7 stiluri, materiale premium, feronerie Blum.";
      case "гардеробная": return "Dressing-uri NobilForm: sisteme depozitare, rafturi, sertare, oglinzi.";
      case "ТВ-зона": return "Zone TV NobilForm: panouri perete, iluminat LED, integrare TV.";
      case "стена": return "Pereți decorativi NobilForm: panouri 3D, lamele, tăblie de pat.";
      default: return "";
    }
  }
  switch (product) {
    case "шкаф": return "Шкафы NobilForm: встроенные и корпусные. Распашные и раздвижные двери. Материалы: ДСП, МДФ, шпон, зеркало, стекло.";
    case "кухня": return "Кухни NobilForm: 7 стилей, премиальные материалы, фурнитура Blum.";
    case "гардеробная": return "Гардеробные NobilForm: системы хранения, полки, ящики, зеркала.";
    case "ТВ-зона": return "ТВ-зоны NobilForm: стеновые панели, LED-подсветка, интеграция ТВ.";
    case "стена": return "Декоративные стены NobilForm: 3D-панели, реечные панели, изголовья кроватей.";
    default: return "";
  }
}
