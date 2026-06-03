import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { processIncomingMessage, VERIFY_TOKEN } from "./routers/whatsapp.js";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ===== WHATSAPP WEBHOOK (Meta Cloud API) =====
// GET for webhook verification
app.get("/api/webhook/whatsapp", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verified successfully");
    return c.text(challenge || "OK");
  }
  return c.json({ error: "Verification failed" }, 403);
});

// POST for incoming messages
app.post("/api/webhook/whatsapp", async (c) => {
  try {
    const body = await c.req.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === "text") {
      const from = message.from; // Phone number
      const text = message.text.body;

      console.log(`[WhatsApp Webhook] ${from}: ${text}`);

      // Process via OpenAI + send response
      processIncomingMessage(from, text).catch((err) => {
        console.error("[WhatsApp] Processing error:", err);
      });
    }

    return c.json({ status: "received" });
  } catch (err) {
    console.error("[WhatsApp Webhook] Error:", err);
    return c.json({ status: "error" }, 500);
  }
});

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
