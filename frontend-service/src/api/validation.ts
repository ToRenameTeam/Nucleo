import { z } from 'zod';
import { handleApiResponse } from './config';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const nonEmptyTrimmedStringSchema = z.string().trim().min(1);
export const optionalTrimmedStringSchema = z.string().trim().min(1).optional();
export const idSchema = nonEmptyTrimmedStringSchema;
export const isoDateStringSchema = z.string().trim().regex(ISO_DATE_REGEX);

export function parseWithSchema<T>(schema: z.ZodType<T>, value: unknown, context: string): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid data for ${context}. ${details}`);
  }

  return parsed.data;
}

export async function parseApiResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  context: string
): Promise<T> {
  const data = await handleApiResponse<unknown>(response);
  return parseWithSchema(schema, data, context);
}
