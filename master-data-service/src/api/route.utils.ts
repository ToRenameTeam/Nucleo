import type { Response } from 'express';

export function parseBooleanQuery(value: unknown): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    return value === 'true';
}

export function sendSuccess(
    res: Response,
    data: unknown,
    statusCode = 200,
    extraFields: Record<string, unknown> = {}
): void {
    res.status(statusCode).json({
        success: true,
        ...extraFields,
        data
    });
}

export function sendError(res: Response, statusCode: number, errorMessage: string): void {
    res.status(statusCode).json({
        success: false,
        error: errorMessage
    });
}

export function sendServerError(res: Response, errorMessage: string): void {
    sendError(res, 500, errorMessage);
}
