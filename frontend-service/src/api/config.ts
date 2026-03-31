// Keep requests same-origin by default so the browser calls the NGINX gateway host serving the frontend.
function getDefaultGatewayUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const { protocol, hostname, port } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isLocalFrontendPort = port === '3000' || port === '4173' || port === '5173';

  if (isLocalHost && isLocalFrontendPort) {
    return `${protocol}//${hostname}:8088`;
  }

  return '';
}

// Prefer explicit env configuration, then fall back to a smart local default.
const rawGatewayUrl = import.meta.env.VITE_API_GATEWAY_URL?.trim() ?? getDefaultGatewayUrl();

function normalizeGatewayUrl(url: string): string {
  if (!url) {
    return '';
  }

  return url.replace(/\/+$/, '');
}

export const API_GATEWAY_URL = normalizeGatewayUrl(rawGatewayUrl);

// Kept for backward compatibility with existing API modules.
// TODO: should refactor these modules to use API_GATEWAY_URL directly and remove these constants.
export const APPOINTMENTS_API_URL = API_GATEWAY_URL;
export const MASTER_DATA_API_URL = API_GATEWAY_URL;
export const USERS_API_URL = API_GATEWAY_URL;
export const DELEGATIONS_API_URL = API_GATEWAY_URL;
export const DOCUMENTS_API_URL = API_GATEWAY_URL;

export const API_ENDPOINTS = {
  // Appointments Service
  APPOINTMENTS: '/api/appointments',
  AVAILABILITIES: '/api/availabilities',

  // Master Data Service
  SERVICE_CATALOG: '/api/service-catalog',
  FACILITIES: '/api/facilities',

  // Users Service
  USERS: '/api/users',
  AUTH: '/api/auth',

  // Delegations Service
  DELEGATIONS: '/api/delegations',

  // Documents Service
  DOCUMENTS: '/api/documents',
} as const;

interface ApiErrorPayload {
  message?: string;
  code?: string;
  [key: string]: unknown;
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiErrorPayload = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    const error = new Error(errorData.message || 'Request failed') as Error & {
      code?: string;
      details?: ApiErrorPayload;
    };
    error.code = errorData.code;
    error.details = errorData;
    throw error;
  }

  const data = await response.json();
  return data.data || data;
}

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}
