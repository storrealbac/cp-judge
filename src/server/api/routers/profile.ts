import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: { username: input.username },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().max(32),
      email: z.string().max(32).email(),
      biography: z.string().max(255).optional(),
      country: z.string().max(32).optional(),
      institution: z.string().max(32).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission to update this profile
      const profile = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!profile || profile.id !== ctx.session.user.id) {
        throw new Error("Not authorized to update this profile");
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          biography: input.biography,
          country: input.country,
          institution: input.institution,
        },
      });
    }),

  getLastFollowers: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
      });
      if (!user) return [];

      return ctx.db.user.findMany({
        where: {
          following: {
            some: {
              followingId: user.id
            }
          }
        },
        include: {
          following: {
            where: {
              followingId: user.id
            },
            select: {
              createdAt: true
            }
          }
        },
        orderBy: {
          following: {
            _count: 'desc'
          }
        },
        take: 3
      });
    }),

  getLastFollowings: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
      });
      if (!user) return [];

      return ctx.db.user.findMany({
        where: {
          followers: {
            some: {
              followerId: user.id
            }
          }
        },
        include: {
          followers: {
            where: {
              followerId: user.id
            },
            select: {
              createdAt: true
            }
          }
        },
        orderBy: {
          followers: {
            _count: 'desc'
          }
        },
        take: 3
      });
    }),

    followUser: protectedProcedure
        .input(z.object({ targetUserId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if target user exists
            const targetUser = await ctx.db.user.findUnique({
                where: { id: input.targetUserId },
            });

            if (!targetUser) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Target user not found',
                });
            }

            // Prevent self-following
            if (targetUser.id === ctx.session.user.id) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot follow yourself',
                });
            }

            // Check if already following
            const existingFollow = await ctx.db.follows.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: ctx.session.user.id,
                        followingId: input.targetUserId,
                    },
                },
            });

            if (existingFollow) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Already following this user',
                });
            }

            // Create follow relationship
            return ctx.db.follows.create({
                data: {
                    followerId: ctx.session.user.id,
                    followingId: input.targetUserId,
                },
            });
        }),

    unfollowUser: protectedProcedure
        .input(z.object({ targetUserId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if follow relationship exists
            const existingFollow = await ctx.db.follows.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: ctx.session.user.id,
                        followingId: input.targetUserId,
                    },
                },
            });

            if (!existingFollow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Not following this user',
                });
            }

            // Delete follow relationship
            return ctx.db.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: ctx.session.user.id,
                        followingId: input.targetUserId,
                    },
                },
            });
        }),

});