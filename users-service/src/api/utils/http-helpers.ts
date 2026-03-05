import type { Request, Response } from 'express';
import { error } from './response.js';

interface ErrorRule {
    statusCode: number;
    messageIncludes?: string;
    messageEquals?: string;
}

export function hasRequiredFields(body: Record<string, unknown>, fields: string[]) {
    return fields.every((field) => Boolean(body[field]));
}

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

export function isOneOf<T extends string>(value: unknown, allowedValues: readonly T[]): value is T {
    return typeof value === 'string' && allowedValues.includes(value as T);
}

export function getRequiredQueryString(
    req: Request,
    res: Response,
    key: string,
    message: string
): string | null {
    const value = req.query[key];
    if (!isNonEmptyString(value)) {
        error(res, message, 400);
        return null;
    }

    return value;
}

export function handleRouteError(
    res: Response,
    err: unknown,
    context: string,
    rules: ErrorRule[]
) {
    console.error(`${context}:`, err);

    if (err instanceof Error) {
        for (const rule of rules) {
            if (rule.messageEquals && err.message === rule.messageEquals) {
                return error(res, err.message, rule.statusCode);
            }

            if (rule.messageIncludes && err.message.includes(rule.messageIncludes)) {
                return error(res, err.message, rule.statusCode);
            }
        }
    }

    return error(res, 'Internal server error', 500);
}