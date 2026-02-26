import { Response } from 'express';

type SuccessResponse<T> = { success: true; data: T };
type ErrorResponse = { success: false; message: string };

export function success<T>(res: Response, data: T, statusCode = 200): Response<SuccessResponse<T>> {
    return res.status(statusCode).json({ success: true, data });
}

export function error(res: Response, message: string, statusCode = 500): Response<ErrorResponse> {
    return res.status(statusCode).json({ success: false, message });
}
