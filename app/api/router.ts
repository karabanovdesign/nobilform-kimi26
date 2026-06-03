import { createRouter, publicQuery } from "./middleware";
import { aiRouter } from "./routers/ai";
import { whatsappRouter } from "./routers/whatsapp";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  ai: aiRouter,
  whatsapp: whatsappRouter,
});

export type AppRouter = typeof appRouter;
