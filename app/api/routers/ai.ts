import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";

// ===== SYSTEM PROMPTS =====
const SYSTEM_PROMPT_RU = `Ты AI-консультант компании NobilForm.
Компания занимается изготовлением кухонь и мебели премиум-класса на заказ.
Отвечай кратко, профессионально и дружелюбно.
Помогай клиенту выбрать кухню, материалы и получить расчет стоимости.
Стиль: уверенный, современный, экспертный, без канцелярита.
Если клиент спрашивает цену — давай диапазон: МДФ мат ~13,200 MDL/пог.м.
Материалы: ДСП EGGER, AGT ламинат, МДФ мат, МДФ глянец, МДФ шпон.
Стили: Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary.
Всегда завершай ответ действием: предложи расчет, покажи примеры или обсуди проект.
Контакты: +373 60 599 907.`;

const SYSTEM_PROMPT_RO = `Ești consultant AI al companiei NobilForm.
Compania produce bucătării și mobilă premium la comandă.
Răspunde scurt, profesional și prietenos.
Ajuți clientul să aleagă bucătăria, materialele și să obțină calculul costului.
Stil: încrezător, modern, expert, fără birocratism.
Dacă clientul întreabă prețul — oferă gamă: MDF mat ~13,200 MDL/ml.
Materiale: PAL EGGER, AGT laminat, MDF mat, MDF lucios, MDF furnir.
Stiluri: Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary.
Întotdeauna încheie răspunsul cu o acțiune: propune calcul, arată exemple sau discută proiectul.
Contacte: +373 60 599 907.`;

// ===== FALLBACK KNOWLEDGE BASE (без API) =====
const KNOWLEDGE: { keywords: string[]; responseRu: string; responseRo: string }[] = [
  {
    keywords: ["привет", "здравствуй", "salut", "bună", "hello", "hi"],
    responseRu: "Здравствуйте! Я AI-консультант NobilForm. Помогу подобрать кухню, рассчитать стоимость и ответить на вопросы. Какой размер кухни и какой стиль вы рассматриваете?",
    responseRo: "Bună ziua! Sunt consultantul AI NobilForm. Vă voi ajuta să alegeți bucătăria, să calculăm costul și să răspundem la întrebări. Ce dimensiune are bucătăria și ce stil căutați?",
  },
  {
    keywords: ["цена", "стоимость", "сколько", "pret", "preț", "cat costa"],
    responseRu: "Стоимость зависит от размеров, материалов и комплектации. База: МДФ мат ~13,200 MDL/пог.м. Для точного расчёта — отправьте размеры, и подготовим предложение.",
    responseRo: "Costul depinde de dimensiuni, materiale și compartimentare. Baza: MDF mat ~13,200 MDL/ml. Pentru calcul exact — trimiteți dimensiunile și pregătim oferta.",
  },
  {
    keywords: ["материал", "фасад", "мдф", "дсп", "agt", "шпон", "material", "fațade"],
    responseRu: "5 вариантов: ДСП EGGER (-25%), AGT ламинат (-10%), МДФ мат (база), МДФ глянец (+15%), МДФ шпон (+45%). Какой ближе по бюджету и ощущениям?",
    responseRo: "5 variante: PAL EGGER (-25%), AGT laminat (-10%), MDF mat (bază), MDF lucios (+15%), MDF furnir (+45%). Care vă este mai aproape de buget și senzații?",
  },
  {
    keywords: ["стиль", "кухн", "modern", "minimal", "japandi", "stil", "bucătărie"],
    responseRu: "7 стилей: Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary. Какой интерьер вам ближе по настроению?",
    responseRo: "7 stiluri: Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary. Ce interior vă reprezintă cel mai bine?",
  },
];

function fallbackResponse(lang: "ru" | "ro", message: string): string {
  const lower = message.toLowerCase();
  for (const item of KNOWLEDGE) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return lang === "ro" ? item.responseRo : item.responseRu;
    }
  }
  return lang === "ro"
    ? "Înțeleg. Pentru o recomandare potrivită — ce dimensiuni are bucătăria și ce stil preferați?"
    : "Понимаю. Чтобы дать точную рекомендацию — какие размеры кухни и какой стиль вам ближе?";
}

// ===== IMAGE GENERATION =====
async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-your-key") return null;

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Premium kitchen interior design, photorealistic, architectural visualization: ${prompt}. High-end materials, soft natural lighting, professional photography style.`,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (!response.ok) {
      console.error("[OpenAI Image] Error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (err) {
    console.error("[OpenAI Image] Exception:", err);
    return null;
  }
}

export const aiRouter = createRouter({
  chat: publicQuery
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
      lang: z.enum(["ru", "ro"]).optional().default("ru"),
    }))
    .mutation(async ({ input }) => {
      const lastMessage = input.messages.filter((m) => m.role === "user").pop()?.content || "";

      // ===== OpenAI API =====
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && apiKey !== "sk-your-key") {
        try {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4.1-mini",
              messages: [
                { role: "system", content: input.lang === "ro" ? SYSTEM_PROMPT_RO : SYSTEM_PROMPT_RU },
                ...input.messages,
              ],
              temperature: 0.8,
              max_tokens: 500,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (content) return { response: content };
          }
        } catch {
          // Fallback при ошибке API
        }
      }

      // ===== Fallback: локальная база знаний =====
      return { response: fallbackResponse(input.lang, lastMessage) };
    }),

  generateImage: publicQuery
    .input(z.object({
      prompt: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      const imageUrl = await generateImage(input.prompt);
      if (imageUrl) {
        return { success: true as const, imageUrl };
      }
      return { success: false as const, error: "Failed to generate image" };
    }),
});
