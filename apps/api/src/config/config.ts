import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid env: ${parsed.error.message}`);
}

export const config = parsed.data;
