/**
 * NobilForm GPT API Client
 * Calls /api/chat Vercel serverless function
 * Falls back to local ragEngine if GPT is unavailable
 */

import { generateResponse } from "./ragEngine";

let gptAvailable: boolean | null = null;

export async function fetchGptReply(
  lang: "ru" | "ro",
  message: string,
  history: string[] = [],
): Promise<string> {
  // Try GPT API first
  if (gptAvailable !== false) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.slice(0, 2000),
          lang,
          history: history.slice(-10).map((content, i) => ({
            role: i % 2 === 0 ? "user" : "assistant",
            content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          gptAvailable = true;
          return data.reply;
        }
      }

      // GPT returned error or empty — mark as unavailable
      gptAvailable = false;
    } catch {
      // Network error or timeout
      gptAvailable = false;
    }
  }

  // Fallback to local RAG engine
  return generateResponse(lang, message, history);
}

export function isGptAvailable(): boolean {
  return gptAvailable === true;
}

export function resetGptAvailability() {
  gptAvailable = null;
}
