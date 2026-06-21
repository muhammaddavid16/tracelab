import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as database from "@tracelab/database";

const { db, PLAN_LIMITS, ...schema } = database;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
  },
  user: {
    modelName: "UserTable",
    additionalFields: {
      role: {
        type: ["ADMIN", "USER"],
        required: false,
        defaultValue: "USER",
        input: false
      }
    }
  },
  account: {
    modelName: "AccountTable"
  },
  session: {
    modelName: "SessionTable",
    cookieCache: {
      enabled: true,
      maxAge: 60
    }
  },
  verification: {
    modelName: "VerificationTable"
  }
});
