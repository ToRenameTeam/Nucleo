import { Response } from 'express';

type SuccessResponse<T> = { success: true; data: T };
type ErrorResponse = { success: false; message: string };

export const success = <T>(res: Response, data: T, statusCode = 200): Response<SuccessResponse<T>> => 
    res.status(statusCode).json({ success: true, data });

export const error = (res: Response, message: string, statusCode = 500): Response<ErrorResponse> => 
    res.status(statusCode).json({ success: false, message });
