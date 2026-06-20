import { pgEnum } from "drizzle-orm/pg-core";

export const OrganizationRoleEnum = pgEnum("organization_role", [
  "OWNER",
  "ADMIN",
  "MEMBER"
]);

export const ExecutionStatusEnum = pgEnum("execution_status", [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED"
]);

export const ExecutionSourceEnum = pgEnum("execution_source", [
  "AUTOMATION",
  "MANUAL"
]);

export const TestingTypeEnum = pgEnum("testing_type", [
  "REGRESSION",
  "SMOKE",
  "SANITY",
  "INTEGRATION",
  "E2E",
  "PERFORMANCE",
  "OTHER"
]);

export const ResultStatusEnum = pgEnum("result_status", [
  "PASSED",
  "FAILED",
  "DONE"
]);

export const AttachmentTypeEnum = pgEnum("attachment_type", [
  "IMAGE",
  "TEXT",
  "VIDEO"
]);

export const ReportTypeEnum = pgEnum("report_type", ["PDF"]);

export const ReportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED"
]);
