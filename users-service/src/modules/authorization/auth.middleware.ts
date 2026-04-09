import type { NextFunction, Request, Response } from 'express';
import { error } from '../../api/utils/response.js';
import { verifyAccessToken } from './jwt.js';
import type { JwtClaims } from './types.js';

export interface AuthenticatedRequest extends Request {
  auth?: JwtClaims;
}

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token.trim();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.header('authorization'));

  if (!token) {
    error(res, 'Unauthorized', 401);
    return;
  }

  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    error(res, 'Unauthorized', 401);
  }
}
