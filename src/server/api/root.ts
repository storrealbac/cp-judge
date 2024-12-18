import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { profileRouter } from "~/server/api/routers/profile";
import { generalRouter } from "~/server/api/routers/general";
import { problemRouter } from "~/server/api/routers/problem";
import { judgeRouter } from "~/server/api/routers/judge";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  profile: profileRouter,
  general: generalRouter,
  problem: problemRouter,
  judge: judgeRouter, 
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
