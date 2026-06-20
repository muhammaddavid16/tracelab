import { db } from "../client";

import {
  AttachmentTable,
  StepResultTable,
  TestResultTable,
  ScenarioResultTable,
  ExecutionRunTable,
  GeneratedReportTable,
  ReportJobTable
} from "../schemas/execution.schema";

import {
  ApiTokenTable,
  TestCaseTable,
  ScenarioTable,
  ModuleTable,
  ProjectTable
} from "../schemas/project.schema";

import {
  OrganizationMemberTable,
  OrganizationTable
} from "../schemas/organization.schema";

import {
  AccountTable,
  SessionTable,
  VerificationTable,
  UserTable
} from "../schemas/auth.schema";

async function main() {
  console.log("Cleaning database...");

  await db.delete(GeneratedReportTable);
  await db.delete(ReportJobTable);

  await db.delete(AttachmentTable);
  await db.delete(StepResultTable);
  await db.delete(TestResultTable);
  await db.delete(ScenarioResultTable);
  await db.delete(ExecutionRunTable);

  await db.delete(ApiTokenTable);

  await db.delete(TestCaseTable);
  await db.delete(ScenarioTable);
  await db.delete(ModuleTable);
  await db.delete(ProjectTable);

  await db.delete(OrganizationMemberTable);
  await db.delete(OrganizationTable);

  await db.delete(AccountTable);
  await db.delete(SessionTable);
  await db.delete(VerificationTable);
  await db.delete(UserTable);

  console.log("Database cleaned.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
