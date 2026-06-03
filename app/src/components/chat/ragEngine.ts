import type { RAGDocument } from "./types";
import { extractEntities, smartFollowUp, buildPersonalizedResponse } from "./entityExtractor";
import { looksLikeSize, extractSize } from "./calculatorEngine";

// ===== RAG KNOWLEDGE BASE — NO DUPS (strict answers handle: timeline, payment, delivery, warranty, order, services, contacts) =====
const DOCUMENTS: RAGDocument[] = [
  // === STYLES (7) ===
  {
    id: "style_modern_minimal",
    content: "Modern Minimal — linii curate, tonuri neutre, fără decor. Fațade mate sau lucioase fără mânere. Pentru apartamente urbane.",
    contentRo: "Modern Minimal — linii curate, tonuri neutre, fără decor. Fațade mate sau lucioase fără mânere. Pentru apartamente urbane.",
    category: "styles",
    keywords: ["modern minimal"],
  },
  {
    id: "style_japandi",
    content: "Japandi — wabi-sabi japonez + hygge scandinav. PAL-premium și MDF cu laminare sub lemn, mobilier jos, mânere ascunse. Pentru iubitorii liniștii.",
    contentRo: "Japandi — wabi-sabi japonez + hygge scandinav. PAL-premium și MDF cu laminare sub lemn, mobilier jos, mânere ascunse. Pentru iubitorii liniștii.",
    category: "styles",
    keywords: ["japandi"],
  },
  {
    id: "style_warm_minimal",
    content: "Warm Minimalism — minimalism cozy. PAL-premium și MDF cu laminare sub lemn, textile moi, tonuri calde estompate. Confort fără exces.",
    contentRo: "Warm Minimalism — minimalism cozy. PAL-premium și MDF cu laminare sub lemn, textile moi, tonuri calde estompate. Confort fără exces.",
    category: "styles",
    keywords: ["warm minimal"],
  },
  {
    id: "style_soft_luxury",
    content: "Soft Luxury — lux moale. Fațade catifelate, feronerie alamă, blaturi marmură. Pentru bucătării spațioase.",
    contentRo: "Soft Luxury — lux moale. Fațade catifelate, feronerie alamă, blaturi marmură. Pentru bucătării spațioase.",
    category: "styles",
    keywords: ["soft luxury"],
  },
  {
    id: "style_dark_premium",
    content: "Dark Premium — tonuri profunde: grafit, antracit, PAL negru sub stejar. Feronerie aurie pentru contrast. Pentru bucătării spațioase.",
    contentRo: "Dark Premium — tonuri profunde: grafit, antracit, PAL negru sub stejar. Feronerie aurie pentru contrast. Pentru bucătării spațioase.",
    category: "styles",
    keywords: ["dark premium"],
  },
  {
    id: "style_natural_wood",
    content: "Natural Wood — PAL-premium și MDF cu laminare sub lemn: stejar, nuc, frasin. Desen unic de furnir, ecologic.",
    contentRo: "Natural Wood — PAL-premium și MDF cu laminare sub lemn: stejar, nuc, frasin. Desen unic de furnir, ecologic.",
    category: "styles",
    keywords: ["natural wood"],
  },
  {
    id: "style_contemporary",
    content: "Contemporary — clasică modernă. Fațade albe + efect sub insulă de lemn. Alegere universală.",
    contentRo: "Contemporary — clasică modernă. Fațade albe + efect sub insulă de lemn. Alegere universală.",
    category: "styles",
    keywords: ["contemporary"],
  },
  // === MATERIALS (5) ===
  {
    id: "mat_egger",
    content: "PAL EGGER — placă laminată, 200+ decoruri. Rezistentă la umiditate, variantă accesibilă.",
    contentRo: "PAL EGGER — placă laminată, 200+ decoruri. Rezistentă la umiditate, variantă accesibilă.",
    category: "materials",
    keywords: ["egger", "pal", "лдсп"],
  },
  {
    id: "mat_agt",
    content: "AGT MDF laminat — 500+ culori, anti-amprentă. Pentru familii cu copii.",
    contentRo: "AGT MDF laminat — 500+ culori, anti-amprentă. Pentru familii cu copii.",
    category: "materials",
    keywords: ["agt", "агт"],
  },
  {
    id: "mat_matte_mdf",
    content: "MDF mat — ultramat soft-touch, 50+ culori RAL. Cea mai populară alegere.",
    contentRo: "MDF mat — ultramat soft-touch, 50+ culori RAL. Cea mai populară alegere.",
    category: "materials",
    keywords: ["матовый", "mat"],
  },
  {
    id: "mat_glossy_mdf",
    content: "MDF lucios — luciu oglindă, mărește vizual spațiul.",
    contentRo: "MDF lucios — luciu oglindă, mărește vizual spațiul.",
    category: "materials",
    keywords: ["глянец", "lucios"],
  },
  {
    id: "mat_veneer",
    content: "MDF furniruit — furnir natural: stejar, nuc, frasin. Fiecare fațadă este unică.",
    contentRo: "MDF furniruit — furnir natural: stejar, nuc, frasin. Fiecare fațadă este unică.",
    category: "materials",
    keywords: ["шпон", "furnir"],
  },
  // === ISLAND ===
  {
    id: "island",
    content: "Insula de bucătărie — suprafață suplimentară + loc pentru micul dejun. Necesari 2,5m spațiu liber. Pentru bucătării de la 15 m².",
    contentRo: "Insula de bucătărie — suprafață suplimentară + loc pentru micul dejun. Necesari 2,5m spațiu liber. Pentru bucătării de la 15 m².",
    category: "features",
    keywords: ["остров", "island", "insula"],
  },
  // === CONFIGURATIONS (3) ===
  {
    id: "config_linear",
    content: "Configurație liniară — toate dulapurile într-o linie. Cea mai economică. Pentru bucătării 2,5-6 m.l.",
    contentRo: "Configurație liniară — toate dulapurile într-o linie. Cea mai economică. Pentru bucătării 2,5-6 m.l.",
    category: "config",
    keywords: ["прямая", "линейная", "linear", "liniara"],
  },
  {
    id: "config_corner",
    content: "Configurație unghiulară (în G) — două rânduri perpendiculare. Pentru bucătării 6-12 m.l.",
    contentRo: "Configurație unghiulară (în G) — două rânduri perpendiculare. Pentru bucătării 6-12 m.l.",
    category: "config",
    keywords: ["угловая", "г-образная", "corner", "unghiulară"],
  },
  {
    id: "config_ushape",
    content: "Configurație în U — trei pereți utilizați, suprafață maximă. Pentru bucătării de la 12 m.l.",
    contentRo: "Configurație în U — trei pereți utilizați, suprafață maximă. Pentru bucătării de la 12 m.l.",
    category: "config",
    keywords: ["п-образная", "u-образная", "în u"],
  },
  // === HARDWARE ===
  {
    id: "hardware",
    content: "Feronerie: Blum / Hettich — garanție 3 ani. Blum Legrabox — închidere lină. Kessebohmer — organizare depozitare.",
    contentRo: "Feronerie: Blum / Hettich — garanție 3 ani. Blum Legrabox — închidere lină. Kessebohmer — organizare depozitare.",
    category: "hardware",
    keywords: ["фурнитура", "feronerie", "blum", "hettich"],
  },
  // === COUNTERTOPS ===
  {
    id: "countertop",
    content: "Blaturi: PAL Egger — de bază, HPL Fundermax — compact-laminat, Cuarț — premium, Marmură — elitist.",
    contentRo: "Blaturi: PAL Egger — de bază, HPL Fundermax — compact-laminat, Cuarț — premium, Marmură — elitist.",
    category: "countertops",
    keywords: ["столешница", "blat", "countertop", "кварц", "мрамор"],
  },
  // === LIGHTING ===
  {
    id: "lighting",
    content: "Iluminat: LED zonă de lucru, LED premium sub dulapuri, Smart-lighting cu control de pe telefon.",
    contentRo: "Iluminat: LED zonă de lucru, LED premium sub dulapuri, Smart-lighting cu control de pe telefon.",
    category: "lighting",
    keywords: ["подсветка", "свет", "iluminat", "led"],
  },
  // === WARDROBES (2) ===
  {
    id: "wardrobe",
    content: "Dressing-uri NobilForm — sisteme depozitare la comandă. Secții deschise și închise, coșuri glisante, pantofari. De la 2 m².",
    contentRo: "Dressing-uri NobilForm — sisteme depozitare la comandă. Secții deschise și închise, coșuri glisante, pantofari. De la 2 m².",
    category: "wardrobes",
    keywords: ["гардеробн", "dressing"],
  },
  {
    id: "wardrobe_design",
    content: "Dressing: umerașe, coșuri lenjerie, pantofari 12-24 perechi, oglinzi, iluminat LED. Producție 3-5 săptămâni.",
    contentRo: "Dressing: umerașe, coșuri lenjerie, pantofari 12-24 perechi, oglinzi, iluminat LED. Producție 3-5 săptămâni.",
    category: "wardrobes",
    keywords: ["система хранения", "хранение", "depozitare"],
  },
  // === CLOSETS ===
  {
    id: "closet",
    content: "Dulapuri NobilForm: încorporabile și corp. Uși batante și glisante. Materiale: PAL, MDF, furnir, oglindă, sticlă.",
    contentRo: "Dulapuri NobilForm: încorporabile și corp. Uși batante și glisante. Materiale: PAL, MDF, furnir, oglindă, sticlă.",
    category: "closets",
    keywords: ["прихож", "шкаф", "dulap", "hol"],
  },
  // === TV ZONES ===
  {
    id: "tv_zone",
    content: "Zone TV NobilForm — panouri perete cu integrare TV. MDF furnir, marmură, metal, iluminat LED.",
    contentRo: "Zone TV NobilForm — panouri perete cu integrare TV. MDF furnir, marmură, metal, iluminat LED.",
    category: "tv_zones",
    keywords: ["тв-зон", "тв зон", "телевизор", "televizor", "media"],
  },
  // === DECORATIVE WALLS ===
  {
    id: "decorative_wall",
    content: "Pereți decorativi: panouri 3D, panouri cu lamele, tăblie de pat. PAL, AGT-MDF, metal.",
    contentRo: "Pereți decorativi: panouri 3D, panouri cu lamele, tăblie de pat. PAL, AGT-MDF, metal.",
    category: "walls",
    keywords: ["декоративн", "3d панел", "стенов", "изголовье", "perete"],
  },
  // === COMPLEX PROJECTS ===
  {
    id: "complex",
    content: "Mobilare complexă: bucătărie + dressing + zonă TV + hol în stil unitar. Reducere până la 10%.",
    contentRo: "Mobilare complexă: bucătărie + dressing + zonă TV + hol în stil unitar. Reducere până la 10%.",
    category: "services",
    keywords: ["комплекс", "complex", "квартира", "apartament"],
  },
  // === ABOUT ===
  {
    id: "about",
    content: "NobilForm by KVDesign — studio boutique în Chișinău. Designer Carabanov Ruslan. 50+ proiecte din 2018.",
    contentRo: "NobilForm by KVDesign — studio boutique în Chișinău. Designer Carabanov Ruslan. 50+ proiecte din 2018.",
    category: "about",
    keywords: ["кто вы", "о вас", "cine sunteți", "despre voi", "kvdesign"],
  },
];

// ===== TF-IDF VECTORIZATION =====
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sа-яёa-zăâîșț]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2);
}

function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  const total = tokens.length;
  for (const [k, v] of tf) tf.set(k, v / total);
  return tf;
}

function computeIDF(docs: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const N = docs.length;
  for (const d of docs) {
    for (const t of new Set(d)) idf.set(t, (idf.get(t) || 0) + 1);
  }
  for (const [k, v] of idf) idf.set(k, Math.log(N / v) + 1);
  return idf;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [k, v] of a) { normA += v * v; if (b.has(k)) dot += v * b.get(k)!; }
  for (const [, v] of b) normB += v * v;
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const docTokens = DOCUMENTS.map(d => tokenize(d.content + " " + d.keywords.join(" ")));
const queryIdf = computeIDF(docTokens);

function vectorizeQuery(query: string): Map<string, number> {
  const tokens = tokenize(query);
  const tf = computeTF(tokens);
  const vec = new Map<string, number>();
  for (const [k, v] of tf) vec.set(k, v * (queryIdf.get(k) || 1));
  return vec;
}

function vectorizeDoc(tokens: string[]): Map<string, number> {
  const tf = computeTF(tokens);
  const vec = new Map<string, number>();
  for (const [k, v] of tf) vec.set(k, v * (queryIdf.get(k) || 1));
  return vec;
}

const docVectors = docTokens.map(vectorizeDoc);

export function searchRAG(query: string, topK = 3): { doc: RAGDocument; score: number }[] {
  const qVec = vectorizeQuery(query);
  const results = DOCUMENTS.map((doc, i) => ({ doc, score: cosineSimilarity(qVec, docVectors[i]) }));
  results.sort((a, b) => b.score - a.score);
  return results.filter(r => r.score > 0.05).slice(0, topK);
}

// ===== KEYWORD MAP =====
const KEYWORD_MAP: { keywords: string[]; docId: string }[] = [
  { keywords: ["привет", "приветствую", "здравствуй", "здравствуйте", "salut", "bună", "hello", "добрый"], docId: "greeting" },
  { keywords: ["спасибо", "благодарю", "mulțumesc", "mersi", "благодарность"], docId: "thanks" },
  { keywords: ["пока", "до свидания", "la revedere", "pa", "bye", "до встречи"], docId: "bye" },
  { keywords: ["whatsapp", "ватсап", "whats app"], docId: "whatsapp" },
];

// ===== FALLBACKS =====
const FALLBACKS_RU = [
  "Для уточнения этих деталей свяжитесь с дизайнером:\n📱 +373 60 599 907\n📧 nobilaform@gmail.com",
];
const FALLBACKS_RO = [
  "Pentru detalii contactați designerul:\n📱 +373 60 599 907\n📧 nobilaform@gmail.com",
];

// ===== EXACT MATCHES =====
const EXACT_MATCHES: { keywords: string[]; docIds: string[] }[] = [
  { keywords: ["шкаф", "шкафы", "dulap", "dulapuri", "cupe", "купе"], docIds: ["closet", "wardrobe"] },
  { keywords: ["гардеробная", "гардеробные", "dressing", "dressing-uri"], docIds: ["wardrobe", "wardrobe_design"] },
  { keywords: ["тв", "tv", "телевизор", "televizor", "медиа-стен", "media"], docIds: ["tv_zone"] },
  { keywords: ["стена", "стены", "perete", "pereți", "панел", "panou", "3d", "изголовье"], docIds: ["decorative_wall"] },
  { keywords: ["прихожая", "прихожие", "hol"], docIds: ["closet"] },
  // price requests handled separately in generateResponse
];

function findByExactKeyword(query: string): RAGDocument | null {
  const lower = query.toLowerCase().trim();
  for (const em of EXACT_MATCHES) {
    if (em.keywords.some(k => lower.includes(k.toLowerCase()))) {
      for (const id of em.docIds) {
        const doc = DOCUMENTS.find(d => d.id === id);
        if (doc) return doc;
      }
    }
  }
  return null;
}

// ===== PRICE REQUEST HANDLER =====
function handlePriceRequest(lang: "ru" | "ro", entities: ReturnType<typeof extractEntities>): string {
  // TV zones and decorative panels/walls — individual project
  if (entities.product === "tv" || entities.product === "perete") {
    if (lang === "ro") {
      return `Acest produs se calculează ca proiect individual și complex, care necesită atenția maximă a designerului!\n\nDescrieți mai jos preferințele dvs. pentru produs — lățimea, înălțimea, caracterul decorativ, locul amplasării, elementele dorite (consolă suspendată pentru TV, noptieră, masă de lucru/birou).\n\nSau atașați o imagine în WhatsApp cu descrierea. De asemenea, puteți avea încredere în ideea designerului — vă vor ajuta cu alegerea!`;
    }
    return `Данное изделие рассчитывается как индивидуальный и сложный проект, который требует к себе максимального внимания дизайнера!\n\nОпишите ниже ваши предпочтения к изделию — ширину, высоту, декоративный характер, место расположения, желаемые элементы (подвесная консоль для ТВ, прикроватная тумба, стол рабочий/письменный).\n\nИли прикрепите изображение в WhatsApp с описанием. Также вы можете довериться идее самого дизайнера — в любом случае вам помогут с выбором!`;
  }

  if (lang === "ro") {
    let text = "Pentru un calcul personalizat am nevoie de câteva detalii:\n";
    if (!entities.size) text += "• dimensiunea (în metri liniari)\n";
    if (entities.product === "none") text += "• tipul produsului (bucătărie, dressing, dulap etc.)\n";
    if (entities.material === "none") text += "• materialul preferat\n";
    text += "\nLăsați numărul — designerul pregătește calculul exact.";
    return text;
  }
  let text = "Для персонального расчёта мне нужно несколько деталей:\n";
  if (!entities.size) text += "• размер (в погонных метрах)\n";
  if (entities.product === "none") text += "• тип изделия (кухня, гардеробная, шкаф и т.д.)\n";
  if (entities.material === "none") text += "• предпочтительный материал\n";
  text += "\nОставьте номер — дизайнер подготовит точный расчёт.";
  return text;
}

// ===== CONTEXT-AWARE PATTERN MATCHING =====
// Uses entities to avoid asking about already-known details
function matchPattern(lang: "ru" | "ro", query: string, entities: ExtractedEntities): string | null {
  const lower = query.toLowerCase().trim();

  // --- BUDGET requests ---
  if (/(nu foarte scump|ieftin|budget|бюджет|недорог|дешев|econom|эконом)/i.test(lower)) {
    let text = lang === "ro"
      ? "Pentru un buget accesibil recomand PAL EGGER sau AGT MDF laminat."
      : "Для доступного бюджета рекомендую ЛДСП EGGER или AGT МДФ - ламинат.";
    return text + "\n\n" + smartFollowUp(lang, entities);
  }

  // --- MATERIAL requests ---
  if (/(material|materialul|материал|din ce se face|din ce este)/i.test(lower)) {
    let text = lang === "ro"
      ? "5 variante: PAL EGGER, AGT MDF - laminat, MDF mat, MDF lucios, MDF furnir."
      : "5 вариантов: ЛДСП EGGER, AGT МДФ - ламинат, МДФ мат, МДФ глянец, МДФ шпон.";
    return text + "\n\n" + smartFollowUp(lang, entities);
  }

  // --- STYLE requests ---
  if (/(stil|стиль|ce stil|какой стиль|tip|тип)/i.test(lower)) {
    let text = lang === "ro"
      ? "7 stiluri: Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary."
      : "7 стилей: Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary.";
    return text + "\n\n" + smartFollowUp(lang, entities);
  }

  return null;
}

// ===== RESPONSE GENERATOR =====
export function generateResponse(lang: "ru" | "ro", query: string, _history: string[]): string {
  const lower = query.toLowerCase().trim();
  const entities = extractEntities(query, _history);

  // === STRICT ANSWERS — highest priority, no follow-ups, no personalization ===
  const strictReplies: string[] = [];

  // 0. TIMELINE — strict answer, no extras
  if (/(срок|когда|как долго|сколько времени|время изготовления|termen|durată|cât durează|când|timp fabricație)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Termenele de fabricație depind de complexitatea proiectului și variază de la 25 la 60 de zile lucrătoare, după aprobarea proiectului, semnarea contractului și din ziua efectuării avansului."
        : "Сроки изготовления изделий зависят от сложности самого проекта, и проходят от 25 до 60 рабочих дней, после утверждения проекта, подписания контракта, и со дня внесения предоплаты."
    );
  }

  // 1. PAYMENT — strict answer, no extras
  if (/(оплат|предоплат|как платить|plată|avans|plătesc|achit)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Avansul pentru produs se achită direct în contul companiei, după semnarea contractului, prin aplicația băncii dvs. sau casa de marcat a băncii în contul companiei specificat în contract, în mărime de 65%, iar 35% cu 3 zile înainte de livrarea și montajul produsului!"
        : "Предоплата за изделие вносится непосредственно на счёт компании, после подписания контракта, через приложение вашего банка или кассу банка на счёт компании, указанный в контракте, в размере 65%, и 35% за 3 дня до доставки и монтажа изделия!"
    );
  }

  // 2. INSTALLATION — strict answer, no extras
  if (/(монтаж|установка|сборка|установить|собрать|montaj|instalare)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Montajul produsului este inclus în costul produsului, la fel și livrarea."
        : "Монтаж изделия входит в стоимость изделия, как и доставка."
    );
  }

  // 3. DELIVERY — strict answer, no extras
  if (/(доставка|доставку|привезти|доставить|livrare|livrăm)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Livrarea produsului este inclusă în costul produsului, la fel și montajul."
        : "Доставка изделия входит в стоимость изделия, как и монтаж."
    );
  }

  // 4. MATERIAL QUALITY — strict answer, no extras
  // Catches: качество, качественный, качественнее, качественным, сертифицирован, certificat, calitate, materiale, премиум, premium
  if (/(качеств|сертифицирован|certificat|calitate|materiale|премиум|premium)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Lista materialelor o puteți găsi în calculatorul nostru și pe site, fiecare dintre aceste materiale este un produs de calitate și certificat, singura diferență dintre ele este segmentul premium, pe care vi l-am oferit în ordine crescătoare, pentru ușurință înțelegerii și utilizării la alegere!\n\nVă dorim o alegere plăcută și corectă, conform dorințelor și criteriilor dvs.! Vom fi bucuroși să lucrăm la ideea dvs. sau să vă oferim ceva nou!\n\nVă așteptăm NobilForm!"
        : "Перечень материала вы можете найти в нашем калькуляторе и на сайте, каждый из этих материалов является качественным и сертифицированным продуктом, единственный их отличай друг от друга, это премиум сегмент, который мы предоставили вам в возрастающем порядке, для легкого понимания и использования при выборе!\n\nЖелаем вам приятного и правильного выбора, по вашим желаниям и критериям! Будем рады поработать над вашей идеей, или предложить вам что-то новенькое!\n\nЖдём вас NobilForm!"
    );
  }

  // 5. PRODUCTION VOLUME — strict answer
  if (/(сколько.*производ|количество.*проект|массовое|объем.*производ|câte.*produc|volum.*producție)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Avem un număr limitat de fabricații de produse, deoarece politica companiei este axată nu pe producția de masă, ci pe o abordare individuală a fiecărui client. Ce tip de produs vă interesează cel mai mult?"
        : "У нас ограниченное число изготовлений изделий, так как политика компании рассчитана не на массовое производство, а на индивидуальный подход к каждому клиенту. Какой тип изделия вас больше всего интересует?"
    );
  }

  // 6. DISCOUNT — strict answer
  if (/(скидка|скидку|скидки|reducere|reducere|discount)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Da, putem oferi o reducere, în funcție de volumul comenzii. Pentru mobilarea întregului apartament sau casă, reducerea poate ajunge până la 10%. Ce tip de comandă vă interesează cel mai mult?"
        : "Да, мы можем предоставить скидку, в зависимости от объема заказа. За мебелизацию всей квартиры или дома скидка может достигать до 10%. Какой тип заказа вас больше всего интересует?"
    );
  }

  // 7. MATERIAL SELECTION — strict answer
  if (/(подобрать.*материал|какой.*материал|как правильно.*материал|какие материалы|ales.*material|material.*bucătărie|cum.*ales.*material)/i.test(lower)) {
    if (lang === "ro") {
      strictReplies.push(
        "Alegerea materialelor pentru bucătărie depinde de buget și de zona pe care o amenajezi. Pentru carcasă și fațade, alege MDF sau PAL, iar pentru blaturi și șorț (brâu) orientează-te către suprafețe ușor de întreținut în funcție de zona specifică.\n\n" +
        "1. Fațade și MDF (vopsit): Cel mai recomandat pentru uși și fronturi. Este extrem de rezistent la umiditate și permite frezarea pentru designuri clasice sau moderne.\n" +
        "PAL melaminat: O variantă mai accesibilă și populară pentru carcasele interioare. Recomandat să aibă canturi din ABS pentru a nu permite pătrunderea apei.\n" +
        "MDF furniruit: Aspect premium, dar necesită întreținere atentă și este sensibil la variațiile de temperatură și umiditate.\n\n" +
        "2. Blatul de Lucru\n" +
        "Compozit (Acrilic / Cuarț): Soluția ideală pe termen lung; suprafață neporoasă, extrem de rezistentă la zgârieturi, pete și căldură.\n" +
        "PAL Egger / HPL: Varianta cea mai prietenoasă cu bugetul. Asigură o rezistență bună dacă nu este tăiat direct pe el și nu stă în bălți de apă.\n" +
        "Granit sau Marmură: Materiale naturale și masive, oferă o eleganță unică, dar pot necesita tratamente periodice împotriva petelor.\n\n" +
        "3. Șorțul / Brâul de Bucătărie\n" +
        "Sticlă securizată: Foarte ușor de curățat, igienică și disponibilă într-o gamă infinită de culori sau printuri.\n" +
        "Placă ceramică/Faianță: Un material clasic și versatil, foarte rezistent la căldură și murdărie.\n" +
        "Compozit în nuanța blatului: Oferă un aspect unitar, continuu și minimalist.\n\n" +
        "Pentru a face cea mai bună alegere, definește-ți de la început un buget clar și prioritizează zonele în care ai nevoie de o rezistență crescută la apă și căldură.\n" +
        "De ce tip de produs ești cel mai interesat?"
      );
    } else {
      strictReplies.push(
        "Как правило, за стандартную базу по изготовлению изделия, мы используем ЛДСП как основную часть изготовления каркаса самого изделия, остальная часть что касается фасадов, используется исходя от вашего дизайна или предпочтения.\n\n" +
        "Для бюджетных вариантов предлагаем ЛДСП Egger, что касается премиум класса, используем из серии — AGT, Clef, более премиальные, МДФ крашенный на выбор, мат, или глянец, или резьной. По просьбе, можем так же изготовить из МДФ шпонированным деревом! Какой тип изделия вас больше всего интересует?"
      );
    }
  }

  // 8. SHOWROOM / WHERE TO SEE — strict answer
  if (/(где.*увид|адрес|офис|showroom|unde.*vede|adresă)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Nu avem magazine și pavilionuri mari, ceea ce ar crește costul mobilierului prin plata chiriei. Avem un birou specializat la adresa: Dacia 53/4. Aici puteți vedea mostre de PAL, fațade, sticlă, blaturi, canturi, plastic, profile de aluminiu etc. De asemenea, în magazinul de feronerie puteți alege feroneria pentru mobilierul dvs."
        : "Мы не держим магазинов и больших павильонов, что в свою очередь увеличивало бы стоимость мебели за счёт оплаты аренды помещений, но у нас есть специализированный офис по адресу: Dacia 53/4. Здесь вы сможете увидеть образцы ЛДСП, фасадов, стекла, столешниц, кромки, пластика, алюминиевых профилей и т.д."
    );
  }

  // 9. CUSTOM vs READY-MADE — strict answer
  if (/(чем.*отличается|отличие.*заказ|отличие.*готов|мебел.*магазин|deoseb.*comand|diferen.*comand|comand.*magazin)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Spre deosebire de mobila cumpărată din magazin, unde sunteți limitat de dimensiuni, configurație și culoare, mobila fabricată la comandă este limitată doar de imaginația dvs.: puteți varia culoarea, materialul, configurația, feroneria, dimensiunea, decorul etc. De asemenea, aveți posibilitatea să consultați un designer experimentat."
        : "В отличие от мебели, приобретённой в магазине, где вы ограничены размерами, конфигурацией и цветом, мебель, изготовленная под заказ, ограничена только вашей фантазией: вы можете варьировать цвет, материал, конфигурацию, фурнитуру, размер, декор и т.д. Кроме того, вы имеете возможность проконсультироваться с опытным дизайнером или технологом-консультантом."
    );
  }

  // 10. WHY HIGHER PRICE — strict answer
  if (/(почему.*дорож|почему.*цена.*выше|de ce.*scump|de ce.*preț.*mai mare)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Mobila din magazin vine de pe bandă rulantă, fără a ține cont de dorințele individuale. Mobila la comandă include: munca designerului (vizită, proiect, acordare), munca constructorului (detaliere), munca maeștrilor de la fabrică (abordare individuală). Prețul din magazin nu include livrarea și montarea, iar asamblarea costă extra 10-15%."
        : "Мебель из магазина идёт с конвейера, при её производстве не учитываются индивидуальные пожелания каждого покупателя. Мебель под заказ — это работа дизайнера (вызов, создание проекта, согласование), работа конструктора (деталировка), работа мастеров на производстве (индивидуальный подход). Цена в магазине без доставки и заноса. Сборщики в индивидуальном заказе включены в стоимость, в магазине сборка стоит дополнительно 10-15%."
    );
  }

  // 11. HOW TO ORDER — strict answer
  if (/(как.*заказ|заказать|cum.*coman|coman.*mobil|comand.*mobil)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Sunați-ne și conveniți ora pentru vizita designerului. După întocmirea temei tehnice, selectarea materialului și configurației, se anunță prețul (se poate ajusta prin înlocuirea materialului și feroneriei). Dacă prețul convine, se semnează contractul, se achită avansul și proiectul intră în lucru."
        : "Вы звоните нам и договариваетесь о времени, когда к вам может подъехать наш дизайнер. После составления технического задания, подбора материала, конфигурации, и согласования проекта с заказчиком, озвучивается цена (цену можно корректировать путём замены материала и фурнитуры). Если цена устраивает клиента, подписывается договор, вносится предоплата, и проект идёт в работу."
    );
  }

  // 12. HARDWARE — strict answer
  if (/(какую фурнитур|какая фурнитур|feronerie|accesori|fiting|balama|șină|sertar)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Lucrăm cu firmele Hettich și Blum, companii-producătoare care s-au recomandat de mult pe piața mobilei. Feroneria noastră va dura mult, fără a necesita reparații constante. Garanție 3 ani."
        : "Мы работаем с фирмами Hettich и Blum, компаниями-производителями, давно зарекомендовавшими себя на мебельном рынке. Наша фурнитура прослужит долго, не требуя постоянного ремонта. Гарантия 3 года."
    );
  }

  // 13. ASSEMBLY TIME — strict answer
  if (/(время.*сборк|сколько.*собира|сборка.*заним|timp.*asamblare|cât.*asambl)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "În majoritatea cazurilor mobila se asamblează și se verifică la noi în atelier, apoi se livrează asamblată. Dacă gabaritele nu permit livrarea gata asamblată, asamblarea se efectuează la client acasă. În medie, asamblarea durează de la 1 la 3 zile în funcție de volumul comenzii."
        : "В большинстве случаев мебель собирается и проверяется у нас в цеху, затем доставляется в собранном виде. Если габариты не позволяют доставить готовую мебель, сборка проводится у клиента на дому. В среднем сборка занимает от 1 до 3 дней в зависимости от объёма заказа."
    );
  }

  // 14. BUILT-IN APPLIANCES — strict answer
  if (/(встроенн|встраиваем|electrocasnice|încorpor|frigider|cuptor|aragaz|hotă|chiuvet|tehnică încorporabil)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Putem proiecta și fabrica mobilă cu tehnică încorporabilă. Instalăm cuptor încorporabil, plită, hotă, cuptor cu microunde, baterie și chiuvetă. Conectarea la apă, canalizare și electricitate nu este efectuată de compania noastră."
        : "Мы можем спроектировать и изготовить мебель со встроенной техникой. Устанавливаем встроенную духовку, плиту, вытяжку, микроволновую печь, смеситель и мойку. Подключение к воде и канализации, и электричеству, наша компания не производит."
    );
  }

  // 15. DESIGNER VISIT COST — strict answer
  if (/(вызов.*дизайн|сколько.*дизайн|стоит.*дизайн|cost.*designer|preț.*designer|tax.*designer|cât.*designer)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Timpul designerului este deseori utilizat din curiozitate, de aceea suntem nevoiți să percepem o taxă pentru vizita mesterului de 300-500 lei, în funcție de locația clientului și planurile privind numărul elementelor de mobilier.\n\nDar puteți aduce în birou (sau trimite prin poștă) schița dvs. desenată manual cu dimensiunile indicate, sau fotografia produsului dorit, iar la fața locului să povestiți ce corecții ați dori.\n\nProspețarea costului este gratuită și se efectuează în aceeași zi, cel mai des chiar în prezența clientului (dacă mobila nu are un caracter complex)."
        : "Время дизайнера часто просто используют из любопытства, поэтому мы вынуждены брать плату за вызов мастера в размере 300-500 леев, в зависимости от местоположения заказчика и планов по количеству элементов мебели.\n\nНо вы всегда можете принести в офис (или переслать по почте) свой макет нарисованный от руки с указанными размерами (габаритами), можно также прислать или принести фотографию желаемого изделия, а уже на месте рассказать, какие корректировки хотели бы внести.\n\nПросчёт стоимости заказа — бесплатный и выполняется в течение дня, а чаще всего и в присутствии заказчика (если мебель не имеет сложный характер)."
    );
  }

  // 16. SELF-PICKUP + SELF-ASSEMBLY — strict answer (combined)
  if (/(самовывоз|самостоятельн.*забр|self.*pickup|самостоятельн.*сборк|собрать.*сам|ridic.*singur|singur.*ridic|asambl.*singur|singur.*asambl|ridicare.*personal|asamblare.*personal)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Politica companiei noastre nu permite acțiuni precum ridicarea comenzilor sau auto-asamblarea, deoarece ne concentrăm pe producția de proiecte individuale, nu de serie."
        : "Политика нашей компании не позволяет действия, такие как самовывоз заказов или самостоятельная сборка, поскольку мы сосредоточены на производстве индивидуальных, а не серийных проектов."
    );
  }

  // 18. SCHEDULE — strict answer
  if (/(график.*работ|когда.*работает|работаете.*выходн|program.*lucru|orar|când.*lucra|care.*program)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Lucrăm cu programare, deoarece lucrează doar designerul, întâlnirea având loc în studioul boutique la ora stabilită."
        : "Мы работаем по предварительной записи, так как работает только дизайнер. Встреча производится в бутик-студия в назначенное время."
    );
  }

  // 19. READY-MADE STOCK — strict answer
  if (/(готовая.*мебель.*склад|мебель.*налич|мебель.*склад|stock|raft|mobilă.*stoc|gata.*stoc|stoc.*mobil)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Nu, nu producem mobilă pentru linii de asamblare, deoarece ne concentrăm pe proiecte individuale!"
        : "Нет, мы не изготавливаем конвейерную мебель, так как настроены на индивидуальные проекты!"
    );
  }

  // 20. DELIVERY INCLUDED — strict answer
  if (/(доставка.*входит|заноз.*входит|входит.*доставка|livrare.*inclus|ridicare.*inclus|inclus.*preț|transport.*inclus)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Vă oferim prețul final al comenzii dumneavoastră, inclusiv livrarea, ridicarea și montajul mobilei."
        : "Мы озвучиваем окончательную стоимость заказа с учётом доставки, заноса и сборки мебели."
    );
  }

  // 21. WARRANTY — strict answer
  if (/(гарантия.*мебел|какую гаранти|гарантийн|garanție.*mobilă|fel.*garanție|garanție.*oferi)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Oferim o garanție de 1-3 ani pentru mobila noastră, în funcție de tip. Dacă sunt îndeplinite condițiile de garanție, NobilForm va repara gratuit orice defect într-o perioadă scurtă de timp, în funcție de material, dacă defectul este acoperit de garanție."
        : "На изготовленную нами мебель мы даём гарантию 1-3 года, в зависимости от вида мебели. Если условия гарантии были соблюдены, NobilForm устраняет дефекты бесплатно в течение короткого времени, в зависимости от материала, если дефект входит в гарантийный случай."
    );
  }

  // 22. OUTSIDE CHISINAU — strict answer
  if (/(за предел|област|район|село|другой город|in afara|regiune|sat|chisinau|chișinău|comand.*afara)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Operăm în toată Republica Moldova. Pentru întrebări legate de producția și livrarea de mobilă în raioane, orașe și sate, vă rugăm să ne trimiteți un e-mail la adresa nobilaform@gmail.com sau să ne trimiteți un mesaj pe WhatsApp la numărul +373 60 599 907."
        : "Мы работаем по всей территории Молдовы. Вопросы по поводу изготовления и доставки мебели в областные районы, города, сёла можно задать в письме на нашу электронную почту nobilaform@gmail.com или в WhatsApp по номеру телефона +373 60 599 907."
    );
  }

  // 23. WHAT FURNITURE WE PRODUCE — strict answer
  if (/(какую мебел|что.*производ|виды.*мебел|ce.*mobil|fel.*mobil|produc.*mobil|face.*mobil|tipuri.*mobil)/i.test(lower)) {
    strictReplies.push(
      lang === "ro"
        ? "Producăm mobilă corp (dulapuri, mobilă pentru copii, mobilă de birou, pentru baie, mobilă de bucătărie, orice proiect necesar clientului). Putem fabrica mobilă conform proiectului dvs. sau după fotografie."
        : "Мы производим корпусную мебель (шкафы, мебель для детей, офисная мебель, для ванной, кухонная мебель, любой проект, который необходим заказчику). Мы можем изготовить мебель по вашему проекту либо по фотографии."
    );
  }

  // If any strict reply matched, return all of them together
  if (strictReplies.length > 0) {
    return strictReplies.join("\n\n");
  }

  // 24. Kitchen or closet — direct to calculator quick actions (BEFORE exact match)
  if (/(кухн|bucătărie|bucatarie|kitchen)/i.test(lower) || /(шкаф|dulap|closet)/i.test(lower)) {
    return lang === "ro"
      ? "Mai jos pentru dvs. am pregătit un răspuns simplu la întrebările dvs., derulați în jos în chat și veți găsi secțiunea \"ACȚIUNI RAPIDE\", alegeți calculatorul potrivit pentru dvs. și răspundeți la întrebări, dacă printre întrebări nu găsiți un răspuns potrivit pentru dvs., puteți contacta direct designerul la numărul +373 60 599 907 sau prin WhatsApp!"
      : "Ниже для вас мы подготовили простой вариант на ответы по вашим вопросам, спуститесь ниже в чате вы найдете раздел \"БЫСТРЫЕ ДЕЙСТВИЯ\", выбирете подходящую для вас калькулятор и ответьте на вопросы, если в вопросах вы ненайдете подходящего ответа для вас вы можете связаться напрямую с дизайнером по номеру +373 60 599 907 или через WhatsApp!";
  }

  // 25. Price request — ask for details, don't give price
  if (/(сколько стоит|цена|pret|preț|cost|cat costa|цену|цене|prețul)/i.test(lower)) {
    return handlePriceRequest(lang, entities);
  }

  // 26. Size input with known product from context
  if (looksLikeSize(query) && entities.product !== "none") {
    const size = extractSize(query);
    if (lang === "ro") {
      return `Dimensiune ${size}m înregistrată.\n\n${smartFollowUp(lang, entities)}`;
    }
    return `Размер ${size}м принят.\n\n${smartFollowUp(lang, entities)}`;
  }

  // 27. Pattern matching for common descriptive questions (context-aware)
  const patternResponse = matchPattern(lang, query, entities);
  if (patternResponse) return patternResponse;

  // 28. Exact keyword match (тв, гардеробная, декоративные стены и т.д.)
  const exactDoc = findByExactKeyword(lower);
  if (exactDoc) {
    const text = lang === "ro" ? exactDoc.contentRo : exactDoc.content;
    const personalized = buildPersonalizedResponse(lang, text, entities);
    const followUp = smartFollowUp(lang, entities);
    return personalized + "\n\n" + followUp;
  }

  // 29. Keyword map (greetings, thanks, bye)
  for (const km of KEYWORD_MAP) {
    if (km.keywords.some(k => lower.includes(k))) {
      if (km.docId === "greeting") {
        return lang === "ro" ? "Bună ziua! Cu ce vă pot ajuta?" : "Здравствуйте! Чем могу помочь?";
      }
      if (km.docId === "thanks") {
        return lang === "ro" ? "Cu drag! Mai aveți întrebări?" : "С удовольствием! Ещё вопросы?";
      }
      if (km.docId === "bye") {
        return lang === "ro" ? "La revedere!" : "До свидания!";
      }
      if (km.docId === "whatsapp") {
        return "WhatsApp: +373 60 599 907";
      }
    }
  }

  // 30. RAG search
  const ragResults = searchRAG(query, 2);
  if (ragResults.length > 0 && ragResults[0].score > 0.08) {
    const best = ragResults[0];
    const text = lang === "ro" ? best.doc.contentRo : best.doc.content;
    const personalized = buildPersonalizedResponse(lang, text, entities);
    const followUp = smartFollowUp(lang, entities);
    return personalized + "\n\n" + followUp;
  }

  // 31. Smart fallback — use context product if available
  if (entities.product !== "none") {
    return smartFollowUp(lang, entities);
  }

  if (entities.material !== "none" || entities.doorType !== "none") {
    if (lang === "ro") return "Am înțeles alegerea. Pentru a continua — ce dimensiune aveți în vedere?";
    return "Понял выбор. Для продолжения — какой размер рассматриваете?";
  }

  // 32. Final fallback
  return lang === "ro"
    ? "Pentru un răspuns mai precis, contactați designerul la numărul +373 60 599 907 direct sau prin WhatsApp sau scrieți-ne un e-mail cu fișierele atașate."
    : "Для более точного ответа, свяжитесь с дизайнером по номеру +373 60 599 907 напрямую или через WhatsApp или напишите нам на почту с прикрепленными файлами";
}
