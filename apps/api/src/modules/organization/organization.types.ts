import z from "zod";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export const createOrganizationSchema = z.object({
  name: z.string().min(1).nonempty()
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional()
});

export type CreateOrganization = z.infer<typeof createOrganizationSchema>;

export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1).nonempty(),
  description: z.string().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
});

export type CreateProject = z.infer<typeof createProjectSchema>;

export type UpdateProject = z.infer<typeof updateProjectSchema>;
