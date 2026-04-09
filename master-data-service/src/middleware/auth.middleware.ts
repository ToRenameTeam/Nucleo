import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';

const JWT_ISSUER = 'nucleo-users-service';

interface JwtClaims {
  userId: string;
  fiscalCode: string;
  activeProfile: 'PATIENT' | 'DOCTOR';
  iat: number;
  exp: number;
  iss: string;
}

function sendUnauthorized(res: Response): void {
  res.status(401).json({
    success: false,
    error: 'Unauthorized',
  });
}

function base64UrlDecode(input: string): string {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function signHmacSha256(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

function timingSafeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
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

function verifyAccessToken(token: string): JwtClaims {
  const [encodedHeader, encodedPayload, providedSignature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !providedSignature) {
    throw new Error('Invalid token format');
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string; typ?: string };
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Unsupported token algorithm');
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('Missing required environment variable JWT_SECRET');
  }

  const expectedSignature = signHmacSha256(signingInput, secret);

  if (!timingSafeEqual(providedSignature, expectedSignature)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtClaims;
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== JWT_ISSUER || payload.exp <= now) {
    throw new Error('Token expired');
  }

  return payload;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.header('authorization'));

  if (!token) {
    sendUnauthorized(res);
    return;
  }

  try {
    verifyAccessToken(token);
    next();
  } catch {
    sendUnauthorized(res);
  }
}
