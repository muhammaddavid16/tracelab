import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { UserTable } from "./auth.schema";
import { OrganizationRoleEnum } from "./enums";
import { relations } from "drizzle-orm";
import { ProjectTable } from "./project.schema";

export const OrganizationTable = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const OrganizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    members: many(OrganizationMemberTable),
    projects: many(ProjectTable)
  })
);

export const OrganizationMemberTable = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => OrganizationTable.id, {
        onDelete: "cascade"
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, {
        onDelete: "cascade"
      }),
    role: OrganizationRoleEnum("role").notNull().default("MEMBER"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (t) => [unique().on(t.organizationId, t.userId)]
);

export const OrganizationMemberRelations = relations(
  OrganizationMemberTable,
  ({ one }) => ({
    organization: one(OrganizationTable, {
      fields: [OrganizationMemberTable.organizationId],
      references: [OrganizationTable.id]
    }),
    user: one(UserTable, {
      fields: [OrganizationMemberTable.userId],
      references: [UserTable.id]
    })
  })
);
