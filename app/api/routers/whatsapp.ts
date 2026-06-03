import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";

// ===== WHATSAPP CLOUD API CONFIG =====
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "nobilform_verify_2024";

// ===== OPENAI SYSTEM PROMPT =====
const SYSTEM_PROMPT = `Ты AI-консультант NobilForm by KVDesign — студии премиум-мебели в Кишинёве.

ПРОДУКТЫ:
- Кухни на заказ (7 стилей)
- Гардеробные и шкафы
- ТВ-зоны и медиа-стены
- Декоративные стени и 3D-панели
- Прихожие

МАТЕРИАЛЫ: ДСП EGGER, AGT ламинат, МДФ мат, МДФ глянец, МДФ шпон.
СТИЛИ: Modern Minimal, Japandi, Warm Minimalism, Soft Luxury, Dark Premium, Natural Wood, Contemporary.

ПРАВИЛА:
- Отвечай КРАТКО (2-3 предложения)
- Цену НЕ называй, пока клиент не попросит
- Задавай 1 конкретный вопрос за раз
- Если не знаешь ответ — предложи связаться с дизайнером +373 60 599 907
- Отвечай на языке клиента (RU или RO)`;

// ===== SEND MESSAGE VIA WHATSAPP CLOUD API =====
export async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error("[WhatsApp] Missing credentials");
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { body: text },
        }),
      }
    );

    if (!res.ok) {
      console.error("[WhatsApp] Send error:", res.status, await res.text());
      return false;
    }

    console.log(`[WhatsApp] Sent to ${to}: ${text.substring(0, 50)}...`);
    return true;
  } catch (err) {
    console.error("[WhatsApp] Exception:", err);
    return false;
  }
}

// ===== PROCESS INCOMING MESSAGE =====
export async function processIncomingMessage(
  from: string,
  text: string,
): Promise<string> {
  console.log(`[WhatsApp] From ${from}: ${text}`);

  // Detect language
  const lang = /[а-яё]/i.test(text) ? "ru" : "ro";

  // Call OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== "sk-your-key") {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: text },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          // Send response back via WhatsApp
          await sendWhatsAppMessage(from, reply);
          return reply;
        }
      }
    } catch (err) {
      console.error("[OpenAI] Error:", err);
    }
  }

  // Fallback
  const fallback = lang === "ro"
    ? `Bună! Sunt consultantul AI NobilForm. Pentru detalii personalizate, contactați designerul: +373 60 599 907`
    : `Здравствуйте! Я AI-консультант NobilForm. Для персональной консультации свяжитесь с дизайнером: +373 60 599 907`;

  await sendWhatsAppMessage(from, fallback);
  return fallback;
}

// ===== tRPC ROUTER =====
export const whatsappRouter = createRouter({
  // Webhook verification (for Meta setup)
  verify: publicQuery
    .input(z.object({
      mode: z.string().optional(),
      verify_token: z.string().optional(),
      challenge: z.string().optional(),
    }))
    .query(({ input }) => {
      if (input.mode === "subscribe" && input.verify_token === VERIFY_TOKEN) {
        console.log("[WhatsApp] Webhook verified");
        return { challenge: input.challenge };
      }
      return { error: "Verification failed" };
    }),

  // Send message via WhatsApp API
  sendMessage: publicQuery
    .input(z.object({
      to: z.string(),
      text: z.string(),
    }))
    .mutation(async ({ input }) => {
      const success = await sendWhatsAppMessage(input.to, input.text);
      return { success };
    }),
});

export { VERIFY_TOKEN };
