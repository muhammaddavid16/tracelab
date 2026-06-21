import { and, eq } from "drizzle-orm";
import {
  db,
  OrganizationMemberTable,
  OrganizationTable
} from "@tracelab/database";
import { generateUniqueSlug } from "@/shared/domain/slug/slug.service";
import type {
  OrganizationRole,
  CreateOrganization,
  UpdateOrganization
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

  async getUserOrganizations(userId: string) {
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

  async isMember(userId: string, organizationId: string) {
    return db.query.OrganizationMemberTable.findFirst({
      where: and(
        eq(OrganizationMemberTable.userId, userId),
        eq(OrganizationMemberTable.organizationId, organizationId)
      )
    });
  },

  async getOrganizationBySlug(slug: string) {
    return db.query.OrganizationTable.findFirst({
      where: eq(OrganizationTable.slug, slug)
    });
  },

  async updateOrganization(slug: string, data: UpdateOrganization) {
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

  async getMembers(slug: string) {
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
      .where(eq(OrganizationTable.slug, slug));
  }
};
