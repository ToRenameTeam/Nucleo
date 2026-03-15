import { z } from 'zod';

export const nonEmptyTrimmedStringSchema = z.string().trim().min(1);

export const optionalNonEmptyTrimmedStringSchema = nonEmptyTrimmedStringSchema.optional();

export const delegationStatusSchema = z.enum(['Pending', 'Active', 'Declined', 'Deleted']);

export class ApiValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

export function validateWithSchema<T>(schema: z.ZodType<T>, value: unknown, context: string): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map(function (issue) {
        return `${issue.path.join('.') || 'root'}: ${issue.message}`;
      })
      .join('; ');

    throw new ApiValidationError(`Invalid ${context}. ${details}`);
  }

  return parsed.data;
}
