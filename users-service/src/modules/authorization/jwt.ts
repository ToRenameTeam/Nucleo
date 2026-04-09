import crypto from 'node:crypto';
import type { ActiveProfile } from '../../services/authenticated-user.factory.js';
import type { JwtClaims } from './types.js';

const DEFAULT_JWT_EXPIRY = '1h';
const JWT_ISSUER = 'nucleo-users-service';

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function base64UrlDecode(input: string): string {
  const normalized = input.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function parseExpiryToSeconds(expiry: string): number {
  const normalized = expiry.trim().toLowerCase();
  const match = normalized.match(/^(\d+)([smhd])?$/);

  if (!match) {
    throw new Error(`Invalid JWT expiry format: ${expiry}`);
  }

  const value = Number(match[1]);
  const unit = match[2] ?? 's';

  if (unit === 's') return value;
  if (unit === 'm') return value * 60;
  if (unit === 'h') return value * 60 * 60;
  if (unit === 'd') return value * 60 * 60 * 24;

  throw new Error(`Unsupported JWT expiry unit: ${unit}`);
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('Missing required environment variable JWT_SECRET');
  }

  return secret;
}

function getJwtExpirySeconds(): number {
  return parseExpiryToSeconds(process.env.JWT_EXPIRY?.trim() || DEFAULT_JWT_EXPIRY);
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

export function createAccessToken(payload: {
  userId: string;
  fiscalCode: string;
  activeProfile: ActiveProfile;
}): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + getJwtExpirySeconds();
  const header = { alg: 'HS256', typ: 'JWT' };
  const tokenPayload = {
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
    iss: JWT_ISSUER,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = signHmacSha256(signingInput, getJwtSecret());

  return `${signingInput}.${signature}`;
}

export function verifyAccessToken(token: string): JwtClaims {
  const [encodedHeader, encodedPayload, providedSignature] = token.split('.');

  if (!encodedHeader || !encodedPayload || !providedSignature) {
    throw new Error('Invalid token format');
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string; typ?: string };

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Unsupported token algorithm');
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signHmacSha256(signingInput, getJwtSecret());

  if (!timingSafeEqual(providedSignature, expectedSignature)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtClaims;
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== JWT_ISSUER) {
    throw new Error('Invalid token issuer');
  }

  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    throw new Error('Token expired');
  }

  if (typeof payload.userId !== 'string' || typeof payload.fiscalCode !== 'string') {
    throw new Error('Invalid token payload');
  }

  if (payload.activeProfile !== 'PATIENT' && payload.activeProfile !== 'DOCTOR') {
    throw new Error('Invalid token profile');
  }

  return payload;
}
