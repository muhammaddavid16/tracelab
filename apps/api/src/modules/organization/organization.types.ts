import z from "zod";

export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export const createOrganizationSchema = z.object({
  name: z.string().min(1).nonempty()
});

export type CreateOrganization = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional()
});

export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
