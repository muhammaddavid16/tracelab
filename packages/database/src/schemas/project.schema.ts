import {
  boolean,
  pgTable,
  text,
  timestamp,
  unique,
  uuid
} from "drizzle-orm/pg-core";
import { UserTable } from "./auth.schema";
import { OrganizationTable } from "./organization.schema";
import { relations } from "drizzle-orm";
import { ExecutionRunTable, ScenarioResultTable } from "./execution.schema";

export const ProjectTable = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => OrganizationTable.id, {
        onDelete: "cascade"
      }),
    projectKey: text("project_key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdByUserId: uuid("created_by_user_id").references(() => UserTable.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    unique("projects_project_key_idx").on(
      table.organizationId,
      table.projectKey
    )
  ]
);

export const ProjectRelations = relations(ProjectTable, ({ one, many }) => ({
  organization: one(OrganizationTable, {
    fields: [ProjectTable.organizationId],
    references: [OrganizationTable.id]
  }),
  apiTokens: many(ApiTokenTable),
  modules: many(ModuleTable),
  executionRuns: many(ExecutionRunTable)
}));

export const ApiTokenTable = pgTable("api_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => ProjectTable.id, {
      onDelete: "cascade"
    }),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdByUserId: uuid("created_by_user_id").references(() => UserTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const ApiTokenRelations = relations(ApiTokenTable, ({ one }) => ({
  project: one(ProjectTable, {
    fields: [ApiTokenTable.projectId],
    references: [ProjectTable.id]
  })
}));

export const ModuleTable = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => ProjectTable.id, {
        onDelete: "cascade"
      }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    unique("modules_project_slug_idx").on(table.projectId, table.slug)
  ]
);

export const ModuleRelations = relations(ModuleTable, ({ one, many }) => ({
  project: one(ProjectTable, {
    fields: [ModuleTable.projectId],
    references: [ProjectTable.id]
  }),
  scenarios: many(ScenarioTable)
}));

export const ScenarioTable = pgTable(
  "scenarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => ModuleTable.id, {
        onDelete: "cascade"
      }),
    scenarioKey: text("scenario_key").notNull(),
    title: text("title"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    unique("scenario_module_key_idx").on(table.moduleId, table.scenarioKey)
  ]
);

export const ScenarioRelations = relations(ScenarioTable, ({ one, many }) => ({
  module: one(ModuleTable, {
    fields: [ScenarioTable.moduleId],
    references: [ModuleTable.id]
  }),
  testCases: many(TestCaseTable),
  scenarioResults: many(ScenarioResultTable)
}));

export const TestCaseTable = pgTable(
  "test_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scenarioId: uuid("scenario_id")
      .notNull()
      .references(() => ScenarioTable.id, {
        onDelete: "cascade"
      }),
    testCaseKey: text("test_case_key").notNull(),
    title: text("title"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    unique("test_case_scenario_key_idx").on(table.scenarioId, table.testCaseKey)
  ]
);

export const TestCaseRelations = relations(TestCaseTable, ({ one }) => ({
  scenario: one(ScenarioTable, {
    fields: [TestCaseTable.scenarioId],
    references: [ScenarioTable.id]
  })
}));
