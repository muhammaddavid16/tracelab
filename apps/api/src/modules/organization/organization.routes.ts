import { Hono } from "hono";
import { validator } from "hono/validator";
import { authMiddleware, type AuthEnv } from "@/middlewares/auth.middleware";
import { organizationRepository } from "./organization.repository";
import {
  createOrganizationSchema,
  createProjectSchema,
  updateOrganizationSchema,
  updateProjectSchema
} from "./organization.types";
import { validationError } from "@/shared/utils/validation";

const app = new Hono<AuthEnv>();

app.use(authMiddleware);

app.post(
  "/",
  validator("json", (value, c) => {
    const parsed = createOrganizationSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(validationError(parsed.error));
    }
    return parsed.data;
  }),
  async (c) => {
    const user = c.get("user");
    const { name } = c.req.valid("json");

    const organization = await organizationRepository.createOrganization({
      name
    });

    await organizationRepository.addMember(user.id, organization.id, "OWNER");

    return c.json(
      {
        message: "Organization created successfully",
        data: organization
      },
      201
    );
  }
);

app.get("/", async (c) => {
  const user = c.get("user");

  const organizations = await organizationRepository.getOrganizationsByUserId(
    user.id
  );

  return c.json({
    message: "Organizations retrieved successfully",
    data: organizations
  });
});

app.get("/:slug", async (c) => {
  const { slug } = c.req.param();
  const user = c.get("user");

  const organization = await organizationRepository.getOrganizationBySlug(slug);
  if (organization == null) {
    return c.json(
      {
        message: "Organization not found",
        error: {
          code: "ORGANIZATION_NOT_FOUND"
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
        message: "You are not a member of this organization",
        error: {
          code: "FORBIDDEN"
        }
      },
      403
    );
  }

  return c.json({
    message: "Organization retrieved successfully",
    data: organization
  });
});

app.patch(
  "/:slug",
  validator("json", (value, c) => {
    const parsed = updateOrganizationSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(validationError(parsed.error));
    }
    return parsed.data;
  }),
  async (c) => {
    const { slug } = c.req.param();
    const user = c.get("user");
    const { name } = c.req.valid("json");

    const existing = await organizationRepository.getOrganizationBySlug(slug);
    if (existing == null) {
      return c.json(
        {
          message: "Organization not found",
          error: {
            code: "ORGANIZATION_NOT_FOUND"
          }
        },
        404
      );
    }

    const isMember = await organizationRepository.isMember(
      user.id,
      existing.id
    );
    if (isMember == null) {
      return c.json(
        {
          message: "You are not a member of this organization",
          error: {
            code: "FORBIDDEN"
          }
        },
        403
      );
    }

    const organization = await organizationRepository.updateOrganizationBySlug(
      existing.slug,
      { name }
    );

    return c.json({
      message: "Organization updated successfully",
      data: organization
    });
  }
);

// Members
app.get("/:slug/members", async (c) => {
  const { slug } = c.req.param();
  const user = c.get("user");

  const organization = await organizationRepository.getOrganizationBySlug(slug);
  if (organization == null) {
    return c.json(
      {
        message: "Organization not found",
        error: {
          code: "ORGANIZATION_NOT_FOUND"
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
        message: "You are not a member of this organization",
        error: {
          code: "FORBIDDEN"
        }
      },
      403
    );
  }

  const members = await organizationRepository.getMembersByOrgId(
    organization.id
  );

  return c.json({
    message: "Members retrieved successfully",
    data: members
  });
});

// Projects
app.post(
  "/:slug/projects",
  validator("json", (value, c) => {
    const parsed = createProjectSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(validationError(parsed.error));
    }
    return parsed.data;
  }),
  async (c) => {
    const { slug } = c.req.param();
    const user = c.get("user");
    const { name, description } = c.req.valid("json");

    const existing = await organizationRepository.getOrganizationBySlug(slug);
    if (existing == null) {
      return c.json(
        {
          message: "Organization not found",
          error: {
            code: "ORGANIZATION_NOT_FOUND"
          }
        },
        404
      );
    }

    const isMember = await organizationRepository.isMember(
      user.id,
      existing.id
    );
    if (isMember == null) {
      return c.json(
        {
          message: "You are not a member of this organization",
          error: {
            code: "FORBIDDEN"
          }
        },
        403
      );
    }

    const project = await organizationRepository.createProject(
      existing.id,
      user.id,
      { name, description }
    );

    return c.json(
      {
        message: "Project created successfully",
        data: project
      },
      201
    );
  }
);

app.get("/:slug/projects", async (c) => {
  const { slug } = c.req.param();
  const user = c.get("user");

  const organization = await organizationRepository.getOrganizationBySlug(slug);
  if (organization == null) {
    return c.json(
      {
        message: "Organization not found",
        error: {
          code: "ORGANIZATION_NOT_FOUND"
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
        message: "You are not a member of this organization",
        error: {
          code: "FORBIDDEN"
        }
      },
      403
    );
  }

  const projects = await organizationRepository.getProjectsByOrgId(
    organization.id
  );

  return c.json({
    message: "Projects retrieved successfully",
    data: projects
  });
});

app.get("/:slug/projects/:projectKey", async (c) => {
  const { slug, projectKey } = c.req.param();
  const user = c.get("user");

  const organization = await organizationRepository.getOrganizationBySlug(slug);
  if (organization == null) {
    return c.json(
      {
        message: "Organization not found",
        error: {
          code: "ORGANIZATION_NOT_FOUND"
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
        message: "You are not a member of this organization",
        error: {
          code: "FORBIDDEN"
        }
      },
      403
    );
  }

  const project =
    await organizationRepository.getProjectByProjectKey(projectKey);
  if (!project) {
    return c.json({
      message: "Project not found",
      error: {
        code: "PROJECT_NOT_FOUND"
      }
    });
  }

  return c.json({
    message: "Project retrieved successfully",
    data: project
  });
});

app.patch(
  "/:slug/projects/:projectKey",
  validator("json", (value, c) => {
    const parsed = updateProjectSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(validationError(parsed.error));
    }
    return parsed.data;
  }),
  async (c) => {
    const { slug, projectKey } = c.req.param();
    const user = c.get("user");
    const { name, description } = c.req.valid("json");

    const organization =
      await organizationRepository.getOrganizationBySlug(slug);
    if (organization == null) {
      return c.json(
        {
          message: "Organization not found",
          error: {
            code: "ORGANIZATION_NOT_FOUND"
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
          message: "You are not a member of this organization",
          error: {
            code: "FORBIDDEN"
          }
        },
        403
      );
    }

    const existing =
      await organizationRepository.getProjectByProjectKey(projectKey);
    if (!existing) {
      return c.json({
        message: "Project not found",
        error: {
          code: "PROJECT_NOT_FOUND"
        }
      });
    }

    const project = await organizationRepository.updateProjectByProjectKey(
      projectKey,
      {
        name,
        description
      }
    );

    return c.json({
      message: "Project updated successfully",
      data: project
    });
  }
);

export default app;
