import { and, eq } from "drizzle-orm";
import {
  db,
  OrganizationMemberTable,
  OrganizationTable,
  ProjectTable
} from "@tracelab/database";
import { generateUniqueSlug } from "@/shared/services/slug.service";
import type {
  OrganizationRole,
  CreateOrganization,
  UpdateOrganization,
  CreateProject,
  UpdateProject
} from "./organization.types";

export const organizationRepository = {
  async createOrganization(data: CreateOrganization) {
    const slug = await generateUniqueSlug(data.name, {
      table: OrganizationTable,
      column: OrganizationTable.slug
    });

    const [organization] = await db
      .insert(OrganizationTable)
      .values({ name: data.name, slug })
      .returning();

    return organization;
  },

  async getOrganizationsByUserId(userId: string) {
    return db
      .select({
        id: OrganizationTable.id,
        name: OrganizationTable.name,
        slug: OrganizationTable.slug,
        createdAt: OrganizationTable.createdAt,
        updatedAt: OrganizationTable.updatedAt
      })
      .from(OrganizationTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.organizationId, OrganizationTable.id)
      )
      .where(eq(OrganizationMemberTable.userId, userId));
  },

  async getOrganizationBySlug(slug: string) {
    return db.query.OrganizationTable.findFirst({
      where: eq(OrganizationTable.slug, slug)
    });
  },

  async isMember(userId: string, organizationId: string) {
    return db.query.OrganizationMemberTable.findFirst({
      where: and(
        eq(OrganizationMemberTable.userId, userId),
        eq(OrganizationMemberTable.organizationId, organizationId)
      )
    });
  },

  async updateOrganizationBySlug(slug: string, data: UpdateOrganization) {
    const updateData: Partial<typeof data & { slug: string }> = {};

    if (data.name != null) {
      updateData.name = data.name;
      updateData.slug = await generateUniqueSlug(data.name, {
        table: OrganizationTable,
        column: OrganizationTable.slug
      });
    }

    if (updateData.name == null) {
      return this.getOrganizationBySlug(slug);
    }

    const [organization] = await db
      .update(OrganizationTable)
      .set(updateData)
      .where(eq(OrganizationTable.slug, slug))
      .returning();

    return organization;
  },

  // Members
  async addMember(
    userId: string,
    organizationId: string,
    role: OrganizationRole
  ) {
    const [member] = await db
      .insert(OrganizationMemberTable)
      .values({
        organizationId,
        userId,
        role
      })
      .returning();

    return member;
  },

  async getMembersByOrgId(organizationId: string) {
    return db
      .select({
        id: OrganizationMemberTable.id,
        organizationId: OrganizationMemberTable.organizationId,
        userId: OrganizationMemberTable.userId,
        role: OrganizationMemberTable.role,
        createdAt: OrganizationMemberTable.createdAt
      })
      .from(OrganizationMemberTable)
      .innerJoin(
        OrganizationTable,
        eq(OrganizationTable.id, OrganizationMemberTable.organizationId)
      )
      .where(eq(OrganizationTable.id, organizationId));
  },

  // Projects
  async createProject(
    organizationId: string,
    userId: string,
    data: CreateProject
  ) {
    const projectKey = await generateUniqueSlug(data.name, {
      table: ProjectTable,
      column: ProjectTable.projectKey
    });

    const [project] = await db
      .insert(ProjectTable)
      .values({
        organizationId,
        name: data.name,
        projectKey,
        description: data.description,
        createdByUserId: userId
      })
      .returning();

    return project;
  },

  async getProjectsByOrgId(organizationId: string) {
    return db.query.ProjectTable.findMany({
      where: eq(ProjectTable.organizationId, organizationId)
    });
  },

  async getProjectByProjectKey(projectKey: string) {
    return db.query.ProjectTable.findFirst({
      where: eq(ProjectTable.projectKey, projectKey)
    });
  },

  async updateProjectByProjectKey(projectKey: string, data: UpdateProject) {
    const updateData: Partial<typeof data & { projectKey: string }> = {};

    if (data.name != null) {
      updateData.name = data.name;
      updateData.projectKey = await generateUniqueSlug(data.name, {
        table: ProjectTable,
        column: ProjectTable.projectKey
      });
    }

    if (data.description != null) {
      updateData.description = data.description;
    }

    if (updateData.name == null && updateData.description == null) {
      return this.getProjectByProjectKey(projectKey);
    }

    const [project] = await db
      .update(ProjectTable)
      .set(updateData)
      .where(eq(ProjectTable.projectKey, projectKey))
      .returning();

    return project;
  }
};
