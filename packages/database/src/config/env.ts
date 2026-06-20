import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).nonempty()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid env: ${parsed.error.message}`);
}

export const env = parsed.data;
