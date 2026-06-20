export const PLAN_LIMITS = {
  FREE: {
    members: 3,
    projects: 1,
    executions: 1000,
    storageBytes: 1 * 1024 * 1024 * 1024
  },

  STARTER: {
    members: 10,
    projects: 10,
    executions: 50000,
    storageBytes: 20 * 1024 * 1024 * 1024
  },

  TEAM: {
    members: 50,
    projects: 100,
    executions: 500000,
    storageBytes: 200 * 1024 * 1024 * 1024
  },

  ENTERPRISE: {
    members: Number.MAX_SAFE_INTEGER,
    projects: Number.MAX_SAFE_INTEGER,
    executions: Number.MAX_SAFE_INTEGER,
    storageBytes: Number.MAX_SAFE_INTEGER
  }
} as const;
