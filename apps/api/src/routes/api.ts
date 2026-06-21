import { Hono } from "hono";
import authRoutes from "@/modules/auth/auth.routes";
import organizationRoutes from "@/modules/organization/organization.routes";

const app = new Hono();

app.route("/auth", authRoutes);
app.route("/organizations", organizationRoutes);

export default app;
