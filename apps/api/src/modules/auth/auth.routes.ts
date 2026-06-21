import { Hono } from "hono";
import { auth } from "@/lib/auth";
import type { AuthEnv } from "@/middlewares/auth.middleware";

const app = new Hono<AuthEnv>();

app.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

export default app;
