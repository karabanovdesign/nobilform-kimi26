import { createRouter, publicQuery } from "./middleware.js";
import { aiRouter } from "./routers/ai.js";
import { whatsappRouter } from "./routers/whatsapp.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  ai: aiRouter,
  whatsapp: whatsappRouter,
});

export type AppRouter = typeof appRouter;
