import crypto from "node:crypto";
import { db } from "../client";
import { UserTable } from "../schemas/auth.schema";
import {
  OrganizationTable,
  OrganizationMemberTable
} from "../schemas/organization.schema";
import {
  ProjectTable,
  ModuleTable,
  ScenarioTable,
  TestCaseTable,
  ApiTokenTable
} from "../schemas/project.schema";
import {
  ExecutionRunTable,
  ScenarioResultTable,
  TestResultTable,
  StepResultTable,
  AttachmentTable
} from "../schemas/execution.schema";

async function main() {
  console.log("=================================");
  console.log("TRACE LAB SEED");
  console.log("=================================");

  //
  // PAYLOAD SIMULATION
  //
  const payload = {
    title: "Orange HRM",
    subtitle: "Percobaan Login",
    testingType: "Regression Test",
    author: "Automation Team",
    tool: "Katalon Studio",
    module: "Example",
    scenarioId: "SIT_EXAMPLE_SCN_001",

    testCases: [
      {
        id: "SIT_EXAMPLE_SCN_001_TC_001",
        steps: [
          {
            title: "Coba 1",
            description: "",
            status: "PASSED",
            attachments: [
              {
                type: "IMAGE",
                value:
                  "C:/Users/HP ELITEBOOK/OneDrive/Documents/Automation/Katalon Studio/katalon-starter-kit/Screenshots/step_20260517_140021.jpg"
              }
            ]
          },
          {
            title: "Coba 2",
            description: "",
            status: "PASSED",
            attachments: [
              {
                type: "TEXT",
                value:
                  "aspodaspodksaopdkpoaskpdokaspdokqwpeokqwpoekqwpoekpqwoekpqowkepoqwkepoqwkepoqwkepoqwkepokaspodkpaosdkpokzxpockpokqwepoqkwopekqwpoekqwopekpqwoekpoqwkepoqwkepoqwkepoqwkepoqwkepoqkwepoqwkepokqew"
              }
            ]
          }
        ]
      },

      {
        id: "SIT_EXAMPLE_SCN_001_TC_002",
        steps: [
          {
            title: "Coba 3",
            description: "",
            status: "PASSED",
            attachments: [
              {
                type: "TEXT",
                value: `<?xml version="1.0" encoding="UTF-8"?>
<Saa:DataPDU>
  <Saa:Header>
    <Saa:Message>
      <Saa:MessageIdentifier>
        pacs.008.001.08
      </Saa:MessageIdentifier>
    </Saa:Message>
  </Saa:Header>
</Saa:DataPDU>`
              }
            ]
          }
        ]
      }
    ]
  };

  //
  // USER
  //
  const [user] = await db
    .insert(UserTable)
    .values({
      name: "David",
      email: "david@test.com"
    })
    .returning();

  console.log("✓ User");

  //
  // ORGANIZATION
  //
  const [organization] = await db
    .insert(OrganizationTable)
    .values({
      name: "TraceLab Team",
      slug: "tracelab-team"
    })
    .returning();

  console.log("✓ Organization");

  //
  // MEMBER
  //
  await db.insert(OrganizationMemberTable).values({
    organizationId: organization.id,
    userId: user.id,
    role: "OWNER"
  });

  console.log("✓ Organization Member");

  //
  // PROJECT
  //
  const [project] = await db
    .insert(ProjectTable)
    .values({
      organizationId: organization.id,
      name: payload.title,
      projectKey: "orange-hrm"
    })
    .returning();

  console.log("✓ Project");

  //
  // API TOKEN
  //
  const plainToken = "trc_sk_test_123456";

  const tokenHash = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");

  const [apiToken] = await db
    .insert(ApiTokenTable)
    .values({
      projectId: project.id,
      name: "Orange HRM",
      tokenHash,
      isActive: true
    })
    .returning();

  console.log("✓ Api Token");

  //
  // MODULE
  //
  const [module] = await db
    .insert(ModuleTable)
    .values({
      projectId: project.id,
      name: payload.module,
      slug: payload.module.toLowerCase().split(" ").join("-")
    })
    .returning();

  console.log("✓ Module");

  //
  // SCENARIO
  //
  const [scenario] = await db
    .insert(ScenarioTable)
    .values({
      moduleId: module.id,
      scenarioKey: payload.scenarioId,
      title: payload.subtitle
    })
    .returning();

  console.log("✓ Scenario");

  //
  // TEST CASE MASTER
  //
  const testCaseMap = new Map<string, string>();

  for (const tc of payload.testCases) {
    const [testCase] = await db
      .insert(TestCaseTable)
      .values({
        scenarioId: scenario.id,
        testCaseKey: tc.id,
        title: tc.id
      })
      .returning();

    testCaseMap.set(tc.id, testCase.id);
  }

  console.log("✓ Test Cases");

  //
  // EXECUTION RUN
  //
  const [executionRun] = await db
    .insert(ExecutionRunTable)
    .values({
      projectId: project.id,
      apiTokenId: apiToken.id,
      title: payload.title,
      subtitle: payload.subtitle,
      author: payload.author,
      tool: payload.tool,
      status: "COMPLETED",
      module: payload.module,
      rawPayload: JSON.stringify(payload),
      durationMs: 154653,
      totalSteps: 3,
      passedSteps: 3,
      failedSteps: 0,
      doneSteps: 0,
      source: "AUTOMATION",
      environment: "SIT",
      startedAt: new Date(),
      finishedAt: new Date()
    })
    .returning();

  console.log("✓ Execution Run");

  //
  // SCENARIO RESULT
  //
  const [scenarioResult] = await db
    .insert(ScenarioResultTable)
    .values({
      executionRunId: executionRun.id,
      scenarioId: scenario.id
    })
    .returning();

  console.log("✓ Scenario Result");

  //
  // TEST RESULTS
  //
  for (const tc of payload.testCases) {
    const testCaseId = testCaseMap.get(tc.id)!;

    const [testResult] = await db
      .insert(TestResultTable)
      .values({
        scenarioResultId: scenarioResult.id,
        testCaseId
      })
      .returning();

    let stepNumber = 1;

    //
    // STEP RESULTS
    //
    for (const step of tc.steps) {
      const [stepResult] = await db
        .insert(StepResultTable)
        .values({
          testResultId: testResult.id,
          stepNumber,
          title: step.title,
          description: step.description,
          status: step.status as "PASSED"
        })
        .returning();

      //
      // ATTACHMENTS
      //
      for (const attachment of step.attachments) {
        await db.insert(AttachmentTable).values({
          stepResultId: stepResult.id,
          type: attachment.type as "IMAGE" | "TEXT" | "VIDEO",
          value: attachment.value
        });
      }

      stepNumber++;
    }
  }

  console.log("✓ Test Results");
  console.log("✓ Step Results");
  console.log("✓ Attachments");

  console.log("");
  console.log("=================================");
  console.log("SEED COMPLETED");
  console.log("=================================");

  console.log(`
Organization
└── TraceLab Team

Project
└── Orange HRM

Module
└── Example

Scenario
└── SIT_EXAMPLE_SCN_001

Test Cases
├── SIT_EXAMPLE_SCN_001_TC_001
└── SIT_EXAMPLE_SCN_001_TC_002

Execution Run
└── Percobaan Login

Steps
├── Coba 1
├── Coba 2
└── Coba 3

Attachments
├── IMAGE
└── TEXT
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
