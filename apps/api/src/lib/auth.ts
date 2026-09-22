import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@repo/database";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "learner", input: false },
    },
  },
  // Can add app URL here once deployed
  trustedOrigins: ["http://localhost:3000"]
});
