import {
  bigint,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";
import {
  AttachmentTypeEnum,
  ExecutionSourceEnum,
  ExecutionStatusEnum,
  ReportStatusEnum,
  ReportTypeEnum,
  ResultStatusEnum,
  TestingTypeEnum
} from "./enums";
import {
  ApiTokenTable,
  ProjectTable,
  ScenarioTable,
  TestCaseTable
} from "./project.schema";
import { relations } from "drizzle-orm";

export const ExecutionRunTable = pgTable("execution_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => ProjectTable.id),
  apiTokenId: uuid("api_token_id").references(() => ApiTokenTable.id),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  author: text("author"),
  tool: text("tool"),
  module: text("module"),
  environment: text("environment"),
  testingType: TestingTypeEnum("testing_type"),
  source: ExecutionSourceEnum("source").notNull(),
  status: ExecutionStatusEnum("status").notNull(),
  durationMs: bigint("duration_ms", { mode: "number" }),
  totalSteps: bigint("total_steps", { mode: "number" }),
  passedSteps: bigint("passed_steps", { mode: "number" }),
  failedSteps: bigint("failed_steps", { mode: "number" }),
  doneSteps: bigint("done_steps", { mode: "number" }),
  rawPayload: jsonb("raw_payload"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const ExecutionRunRelations = relations(
  ExecutionRunTable,
  ({ one, many }) => ({
    apiToken: one(ApiTokenTable, {
      fields: [ExecutionRunTable.apiTokenId],
      references: [ApiTokenTable.id]
    }),
    scenarioResults: many(ScenarioResultTable),
    reportJobs: many(ReportJobTable)
  })
);

export const ScenarioResultTable = pgTable("scenario_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionRunId: uuid("execution_run_id")
    .notNull()
    .references(() => ExecutionRunTable.id, { onDelete: "cascade" }),
  scenarioId: uuid("scenario_id").references(() => ScenarioTable.id)
});

export const ScenarioResultRelations = relations(
  ScenarioResultTable,
  ({ one, many }) => ({
    executionRun: one(ExecutionRunTable, {
      fields: [ScenarioResultTable.executionRunId],
      references: [ExecutionRunTable.id]
    }),
    scenario: one(ScenarioTable, {
      fields: [ScenarioResultTable.scenarioId],
      references: [ScenarioTable.id]
    }),

    testResults: many(TestResultTable)
  })
);

export const TestResultTable = pgTable("test_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  scenarioResultId: uuid("scenario_result_id")
    .notNull()
    .references(() => ScenarioResultTable.id, { onDelete: "cascade" }),
  testCaseId: uuid("test_case_id").references(() => TestCaseTable.id)
});

export const TestResultRelations = relations(
  TestResultTable,
  ({ one, many }) => ({
    scenarioResult: one(ScenarioResultTable, {
      fields: [TestResultTable.scenarioResultId],
      references: [ScenarioResultTable.id]
    }),
    stepResults: many(StepResultTable)
  })
);

export const StepResultTable = pgTable("step_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  testResultId: uuid("test_result_id")
    .notNull()
    .references(() => TestResultTable.id, { onDelete: "cascade" }),
  stepNumber: bigint("step_number", { mode: "number" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: ResultStatusEnum("status").notNull()
});

export const StepResultRelations = relations(
  StepResultTable,
  ({ one, many }) => ({
    testResult: one(TestResultTable, {
      fields: [StepResultTable.testResultId],
      references: [TestResultTable.id]
    }),
    attachments: many(AttachmentTable)
  })
);

export const AttachmentTable = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  stepResultId: uuid("step_result_id")
    .notNull()
    .references(() => StepResultTable.id, { onDelete: "cascade" }),
  type: AttachmentTypeEnum("type").notNull(),
  value: text("value"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const AttachmentRelations = relations(AttachmentTable, ({ one }) => ({
  stepResult: one(StepResultTable, {
    fields: [AttachmentTable.stepResultId],
    references: [StepResultTable.id]
  })
}));

export const ReportJobTable = pgTable("report_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  executionRunId: uuid("execution_run_id")
    .notNull()
    .references(() => ExecutionRunTable.id),
  type: ReportTypeEnum("type").notNull(),
  status: ReportStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true })
});

export const ReportJobRelations = relations(
  ReportJobTable,
  ({ one, many }) => ({
    executionRun: one(ExecutionRunTable, {
      fields: [ReportJobTable.executionRunId],
      references: [ExecutionRunTable.id]
    }),
    generatedReports: many(GeneratedReportTable)
  })
);

export const GeneratedReportTable = pgTable("generated_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportJobId: uuid("report_job_id")
    .notNull()
    .references(() => ReportJobTable.id),
  fileName: text("file_name").notNull(),
  storagePath: text("storage_path").notNull(),
  fileSize: bigint("file_size", { mode: "number" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull()
});

export const GeneratedReportRelations = relations(
  GeneratedReportTable,
  ({ one }) => ({
    reportJob: one(ReportJobTable, {
      fields: [GeneratedReportTable.reportJobId],
      references: [ReportJobTable.id]
    })
  })
);
