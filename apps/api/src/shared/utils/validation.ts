import type { ZodError } from "zod";

export function validationError(error: ZodError) {
  return {
    message: "Validation failed",
    error: {
      code: "VALIDATION_ERROR",
      details: error.flatten().fieldErrors
    }
  };
}
