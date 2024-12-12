import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import EventEmitter from 'events';
import { observable } from '@trpc/server/observable';

import { SubmissionStatus, Language } from "@prisma/client";

const ee = new EventEmitter();

const DEFAULT_CONFIG = {
  number_of_runs: "1",
  cpu_time_limit: "5",
  cpu_extra_time: "1",
  wall_time_limit: "10",
  memory_limit: "128000",
  stack_limit: "64000",
  max_processes_and_or_threads: "",
  enable_per_process_and_thread_time_limit: false,
  enable_per_process_and_thread_memory_limit: false,
  max_file_size: "",
  enable_network: false
};

const languageMap: Record<Language, number> = {
  C: 50,
  CPP: 54,
  JAVA: 62,
  PYTHON: 71,
  RUST: 74,
  GO: 60,
  JAVASCRIPT: 63,
  TYPESCRIPT: 75,
  CSHARP: 51,
  RUBY: 73,
  HASKELL: 61,
  LUA: 64,
  PASCAL: 67,
  KOTLIN: 78,
  SWIFT: 83,
  PHP: 68,
  PERL: 85,
  BASH: 46,
  SCALA: 81,
  D: 55,
  FSHARP: 59,
  ERLANG: 58,
  ELIXIR: 57,
  OCAML: 65,
  R: 80,
  NIM: 69,
  SQL: 82,
  COBOL: 77,
  FORTH: 66,
  FORTAN: 56,
  LISP: 70,
  NONE: 0
};

const SubmissionSchema = z.object({
  language: z.nativeEnum(Language),
  code: z.string(),
  problemSlug: z.string()
});

interface Judge0Response {
  token: string;
  stderr: string;
  compile_output: string;
  message: string;
  status: {
    id: number;
    description: string;
  };
}

interface SubmissionResult {
  submissionId: string;
  testCaseIndex: number;
  totalTestCases: number;
  result: Judge0Response;
}

function mapJudge0StatusToSubmissionStatus(judge0Status: number): SubmissionStatus {
  switch (judge0Status) {
    case 3: return SubmissionStatus.ACCEPTED;
    case 4: return SubmissionStatus.WRONG_ANSWER;
    case 5: return SubmissionStatus.TIME_LIMIT_EXCEEDED;
    case 6: return SubmissionStatus.COMPILATION_ERROR;
    case 7: return SubmissionStatus.RUNTIME_ERROR;
    case 8: return SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
    default: return SubmissionStatus.PENDING;
  }
}

export const judgeRouter = createTRPCRouter({
  submit: publicProcedure
    .input(SubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const problem = await ctx.db.problem.findUnique({
        where: { slug: input.problemSlug },
        include: { testCases: true }
      });

      if (!problem) throw new TRPCError({ code: "NOT_FOUND", message: "Problem not found" });
      if (!problem.testCases.length) throw new TRPCError({ code: "NOT_FOUND", message: "No test cases found" });

      const submission = await ctx.db.submission.create({
        data: {
          code: input.code,
          language: input.language,
          status: SubmissionStatus.PENDING,
          problemId: problem.id,
          userId: ctx.session?.user.id ?? "",
          testCases: {
            create: problem.testCases.map(testCase => ({
              testCaseId: testCase.id,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput ?? "",
              actualOutput: "",
              status: SubmissionStatus.PENDING
            }))
          }
        },
        include: { testCases: true }
      });

      problem.testCases.forEach((testCase, idx) => {
        void (async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_JUDGE0_URL}/submissions?wait=true`, {
              method: "POST",
              headers: {
                "accept": "*/*",
                "content-type": "application/json",
              },
              body: JSON.stringify({
                stdin: testCase.input,
                expected_output: testCase.expectedOutput,
                language_id: languageMap[input.language],
                source_code: input.code,
                ...DEFAULT_CONFIG
              })
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json() as Judge0Response;
            console.log("Result:", result);            

            if (submission.testCases[idx]) {
              await ctx.db.submissionTestCase.update({
                where: { id: submission.testCases[idx].id },
                data: {
                  status: mapJudge0StatusToSubmissionStatus(result.status.id),
                  actualOutput: result.message ?? "",
                  runtime: parseFloat(result.message),
                  memory: parseFloat(result.message)
                }
              });
            }

            ee.emit('submission-update', {
              submissionId: submission.id,
              testCaseIndex: idx,
              totalTestCases: problem.testCases.length,
              result
            });
            
          } catch (error) {
            console.log("Submit Error:",error)

            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            ee.emit('submission-update', {
              submissionId: submission.id,
              testCaseIndex: idx,
              totalTestCases: problem.testCases.length,
              result: {
                token: "",
                stderr: errorMessage,
                compile_output: "",
                message: errorMessage,
                status: { id: -1, description: "Error" }
              }
            });
          }
        })();
      });

      return { submissionId: submission.id, totalTestCases: problem.testCases.length };
    }),

    onSubmissionUpdate: publicProcedure
    .input(z.object({
      submissionId: z.string(),
      lastEventId: z.string().nullish(),
    }))
    .subscription(({ input, ctx }) => {
      return observable<SubmissionResult>((emit) => {
        const onSubmissionUpdate = (data: SubmissionResult) => {
          if (data.submissionId === input.submissionId) {
            emit.next(data); 
          }
        };
   
        ee.on('submission-update', onSubmissionUpdate);
   
        return () => {
          ee.off('submission-update', onSubmissionUpdate);
        };
      });
    }),
});