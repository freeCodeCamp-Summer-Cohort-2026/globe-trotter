import { z } from "zod";

type ApiError = {
  statusCode: number;
  message: string;
  timestamp: string;
};

type Session = {
  user: {
    id: string;
    name: string;
    role: "learner" | "author";
  };
} | null;

const sessionSchema = z.union([
  z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      role: z.union([
        z.literal("learner"),
        z.literal("author")
      ]),
    }),
  }),
  z.null(),
]);

export type {
  ApiError,
  Session
};

export { sessionSchema };
