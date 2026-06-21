import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "@/config/config";
import apiRoutes from "@/routes/api";

const app = new Hono();

app.route("/api", apiRoutes);

serve(
  {
    fetch: app.fetch,
    port: config.PORT
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
