import type { Message } from "./types";

// Telegram Bot config — using a dedicated bot for form submissions
// Token is embedded since this is a static deploy (no backend)
const BOT_TOKEN = "8106574066:AAF_ZT-F-YJd2o7xI-PS8pxM1Fjw-8G78pA";
const CHAT_ID = "5742130035";
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

let botInfo: { username: string } | null = null;

export async function getBotInfo(): Promise<{ username: string } | null> {
  if (botInfo) return botInfo;
  try {
    const res = await fetch(`${API_BASE}/getMe`);
    const data = await res.json();
    if (data.ok) {
      botInfo = { username: data.result.username };
      return botInfo;
    }
  } catch { /* ignore */ }
  return null;
}

export async function sendLeadToTelegram(params: {
  name?: string;
  phone: string;
  source?: string;
  messages?: Message[];
  lang?: string;
}): Promise<boolean> {
  try {
    const { name, phone, source = "Chat Widget", messages = [], lang = "ru" } = params;

    // Format conversation summary
    const conversationSummary = messages
      .slice(-10)
      .map(m => `${m.role === "user" ? "👤" : "🤖"} ${m.content.substring(0, 100)}${m.content.length > 100 ? "..." : ""}`)
      .join("\n");

    const text = `
🔔 <b>Новая заявка — NobilForm AI</b>

📞 <b>Телефон:</b> +${phone}
${name ? `👤 <b>Имя:</b> ${name}\n` : ""}
🌐 <b>Язык:</b> ${lang.toUpperCase()}
📱 <b>Источник:</b> ${source}

💬 <b>История диалога:</b>
${conversationSummary || "—"}
    `.trim();

    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function sendDesignRequestToTelegram(params: {
  phone: string;
  style: string;
  size: number;
  material: string;
  notes?: string;
  lang?: string;
}): Promise<boolean> {
  try {
    const { phone, style, size, material, notes, lang = "ru" } = params;

    const text = `
🎨 <b>Запрос на генерацию дизайна</b>

📞 <b>Телефон:</b> +${phone}
🌐 <b>Язык:</b> ${lang.toUpperCase()}
🎯 <b>Стиль:</b> ${style}
📐 <b>Размер:</b> ${size} м
🪵 <b>Материал:</b> ${material}
${notes ? `📝 <b>Примечания:</b> ${notes}\n` : ""}

⚡ Просьба связаться с клиентом для обсуждения дизайна.
    `.trim();

    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    return (await res.json()).ok === true;
  } catch {
    return false;
  }
}

// Verify bot on load
getBotInfo().then(info => {
  if (info) {
    console.log(`[Telegram] Bot @${info.username} connected`);
  } else {
    console.warn("[Telegram] Bot connection failed");
  }
});
