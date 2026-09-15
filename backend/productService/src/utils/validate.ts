import { ZodError, type ZodSchema } from "zod";
import { AppError, HttpStatus } from "../common/AppError.js";


export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues
        .map((issue) => {
          const field = issue.path.join(".");
          return field ? `${field}: ${issue.message}` : issue.message;
        })
        .join("; ");
      throw new AppError(HttpStatus.BAD_REQUEST, message || "Validation failed");
    }
    throw error;
  }
}
