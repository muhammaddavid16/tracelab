import { Hono } from "hono";
import { authMiddleware, type AuthEnv } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import {
  createOrganizationSchema,
  updateOrganizationSchema
} from "./organization.types";
import { organizationRepository } from "./organization.repository";

const app = new Hono<AuthEnv>();

app.use(authMiddleware);

app.post("/", zValidator("json", createOrganizationSchema), async (c) => {
  const user = c.get("user");
  const { name } = c.req.valid("json");

  const organization = await organizationRepository.createOrganization({
    name
  });

  await organizationRepository.addMember(user.id, organization.id, "OWNER");

  return c.json({ data: organization }, 201);
});

app.get("/", async (c) => {
  const user = c.get("user");

  const organization = await organizationRepository.getUserOrganizations(
    user.id
  );

  return c.json({ data: organization });
});

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const user = c.get("user");

  const organization = await organizationRepository.getOrganizationBySlug(slug);
  if (organization == null) {
    return c.json(
      {
        error: {
          code: "ORGANIZATION_NOT_FOUND",
          message: "Organization not found"
        }
      },
      404
    );
  }

  const isMember = await organizationRepository.isMember(
    user.id,
    organization.id
  );
  if (isMember == null) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You are not a member of this organization"
        }
      },
      403
    );
  }

  return c.json({ data: organization });
});

app.patch("/:slug", zValidator("json", updateOrganizationSchema), async (c) => {
  const slug = c.req.param("slug");
  const user = c.get("user");
  const validated = c.req.valid("json");

  const existing = await organizationRepository.getOrganizationBySlug(slug);
  if (existing == null) {
    return c.json(
      {
        error: {
          code: "ORGANIZATION_NOT_FOUND",
          message: "Organization not found"
        }
      },
      404
    );
  }

  const isMember = await organizationRepository.isMember(user.id, existing.id);
  if (isMember == null) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You are not a member of this organization"
        }
      },
      403
    );
  }

  const organization = await organizationRepository.updateOrganization(
    existing.slug,
    validated
  );

  return c.json({ data: organization });
});

app.get("/:slug/members", async (c) => {
  const slug = c.req.param("slug");

  const organization = await organizationRepository.getMembers(slug);

  return c.json({ data: organization });
});

export default app;
