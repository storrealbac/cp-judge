import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const generalRouter = createTRPCRouter({
  health: publicProcedure
    .query(async () => {
      return { status: "ok" };
    }),
});