import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Role, Prisma } from "@prisma/client";

const createProblemSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1),
  statement: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  difficulty: z.number().min(1).max(10),
  tags: z.array(z.string()), // Tag names
});

const listProblemsSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'difficulty', 'category', 'submissions', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const testCaseSchema = z.object({
  id: z.string().optional(), // Optional for new test cases
  input: z.string().min(1, "Input is required"),
  expectedOutput: z.string().min(1, "Expected output is required"),
});

const updateProblemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  slug: z.string().min(1),
  statement: z.string().min(1),
  inputDescription: z.string().min(1),
  outputDescription: z.string().min(1),
  difficulty: z.number().min(1).max(10),
  tags: z.array(z.string()),
  testCases: z.array(testCaseSchema),
});


export const problemRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProblemSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user has admin role
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (user?.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can create problems",
        });
      }

      // Verify if the slug is unique
      const existingProblem = await ctx.db.problem.findUnique({
        where: { slug: input.slug },
      });

      if (existingProblem) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A problem with this slug already exists",
        });
      }

      // Process tags - create them if they don't exist
      const tagPromises = input.tags.map(async (tagName) => {
        return await ctx.db.tag.upsert({
          where: { name: tagName },
          update: {}, // No updates needed
          create: { name: tagName },
        });
      });

      const tags = await Promise.all(tagPromises);

      // Create the problem with tags
      return await ctx.db.problem.create({
        data: {
          title: input.title,
          slug: input.slug,
          statement: input.statement,
          inputDescription: input.inputDescription,
          outputDescription: input.outputDescription,
          difficulty: input.difficulty,
          authorId: ctx.session.user.id,
          tags: {
            create: tags.map((tag) => ({
              tag: {
                connect: {
                  id: tag.id,
                },
              },
            })),
          },
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    }),

  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string().min(1, "Slug is required")
    }))
    .query(async ({ ctx, input }) => {
      try {
        const problem = await ctx.db.problem.findUnique({
          where: {
            slug: input.slug
          },
          include: {
            author: {
              select: {
                name: true,
                username: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            testCases: {
              take: 1,
              select: {
                id: true,
                problemId: true,
                createdAt: true,
                input: true,
                expectedOutput: true,
              },
            },
          },
        });

        if (!problem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Problem with slug "${input.slug}" not found`,
          });
        }

        return problem;
      } catch (error) {
        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database error occurred",
            cause: error,
          });
        }

        // If it's already a TRPCError, rethrow it
        if (error instanceof TRPCError) {
          throw error;
        }

        // For any other errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  getBySlugs: publicProcedure
    .input(
      z.object({
        slugs: z.array(z.string().min(1)).min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const problems = await ctx.db.problem.findMany({
          where: {
            slug: {
              in: input.slugs,
            },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              }
            },
            _count: {
              select: {
                submissions: {
                  where: {
                    status: "ACCEPTED"
                  }
                }
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        if (problems.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No problems found with the provided slugs",
          });
        }

        return problems.map(problem => ({
          id: problem.id,
          name: problem.title,
          slug: problem.slug,
          tags: problem.tags, // Keep the original structure
          solved: problem._count.submissions,
        }));

      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database error occurred",
            cause: error,
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),
  adminList: protectedProcedure
    .input(listProblemsSchema)
    .query(async ({ ctx, input }) => {
      // Check if user has admin role
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (user?.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can access this resource",
        });
      }

      try {
        // Calculate pagination
        const skip = (input.page - 1) * input.perPage;

        // Build the where clause for search
        const whereClause = input.search
          ? {
            OR: [
              {
                title: {
                  contains: input.search,
                  mode: 'insensitive' as const, // Add type assertion
                },
              },
              {
                tags: {
                  some: {
                    tag: {
                      name: {
                        contains: input.search,
                        mode: 'insensitive' as const, // Add type assertion
                      },
                    },
                  },
                },
              },
            ],
          }
          : {};

        // Fetch problems with pagination and filtering
        const [problems, totalCount] = await Promise.all([
          ctx.db.problem.findMany({
            where: whereClause,
            select: {
              id: true,
              title: true,
              slug: true,
              difficulty: true,
              createdAt: true,
              author: {
                select: {
                  name: true,
                  username: true,
                },
              },
              tags: {
                select: {
                  tag: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  submissions: true,
                },
              },
            },
            orderBy: {
              [input.sortBy]: input.sortOrder,
            },
            skip,
            take: input.perPage,
          }),
          ctx.db.problem.count({ where: whereClause }),
        ]);

        // Transform the data for frontend
        const transformedProblems = problems.map((problem) => ({
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          slug: problem.slug,
          submissions: problem._count.submissions,
          createdAt: problem.createdAt.toISOString(),
          author: problem.author.name ?? problem.author.username ?? "Unknown",
          tags: problem.tags.map((t) => t.tag.name),
        }));

        return {
          problems: transformedProblems,
          pagination: {
            total: totalCount,
            pageCount: Math.ceil(totalCount / input.perPage),
            page: input.page,
            perPage: input.perPage,
          },
        };

      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database error occurred",
            cause: error,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

    update: protectedProcedure
    .input(updateProblemSchema)
    .mutation(async ({ ctx, input }) => {
      // Check admin role (keeping existing authorization check)
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });
  
      if (user?.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can update problems",
        });
      }
  
      try {
        // Check if problem exists
        const existingProblem = await ctx.db.problem.findUnique({
          where: { id: input.id },
        });
  
        if (!existingProblem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Problem not found",
          });
        }
  
        // Check slug uniqueness
        if (input.slug !== existingProblem.slug) {
          const slugExists = await ctx.db.problem.findUnique({
            where: { slug: input.slug },
          });
  
          if (slugExists) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "A problem with this slug already exists",
            });
          }
        }
  
        // Handle all updates in a transaction
        return await ctx.db.$transaction(async (tx) => {
          // 1. Delete all existing test cases
          await tx.testCase.deleteMany({
            where: { problemId: input.id },
          });
  
          // 2. Process tags
          const tagPromises = input.tags.map(async (tagName) => {
            return await tx.tag.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
          });
          const tags = await Promise.all(tagPromises);
  
          // 3. Remove existing tag relationships
          await tx.tagOnProblem.deleteMany({
            where: { problemId: input.id },
          });
  
          // 4. Create new test cases
          const testCases = input.testCases.map((testCase) => ({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
          }));
  
          // 5. Update problem with new data, relationships and test cases
          return await tx.problem.update({
            where: { id: input.id },
            data: {
              title: input.title,
              slug: input.slug,
              statement: input.statement,
              inputDescription: input.inputDescription,
              outputDescription: input.outputDescription,
              difficulty: input.difficulty,
              tags: {
                create: tags.map((tag) => ({
                  tag: {
                    connect: {
                      id: tag.id,
                    },
                  },
                })),
              },
              testCases: {
                create: testCases,
              },
            },
            include: {
              tags: {
                include: {
                  tag: true,
                },
              },
              testCases: true,
              author: {
                select: {
                  name: true,
                  username: true,
                },
              },
            },
          });
        });
  
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database error occurred",
            cause: error,
          });
        }
  
        if (error instanceof TRPCError) {
          throw error;
        }
  
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),


  // Add a method to get test cases for a problem
  getTestCases: protectedProcedure
    .input(z.object({
      problemId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (user?.role !== Role.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can view all test cases",
        });
      }

      return await ctx.db.testCase.findMany({
        where: {
          problemId: input.problemId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }),

});