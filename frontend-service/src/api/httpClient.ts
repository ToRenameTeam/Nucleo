import { ApiError, API_GATEWAY_URL } from './config';

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const CURRENT_USER_STORAGE_KEY = 'currentUser';
const CURRENT_PATIENT_PROFILE_STORAGE_KEY = 'currentPatientProfile';

interface RequestOptions extends RequestInit {
  authRequired?: boolean;
}

function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearAuthState(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    localStorage.removeItem(CURRENT_PATIENT_PROFILE_STORAGE_KEY);
  } catch {
    // Ignore storage errors during sign-out cleanup.
  }
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

export async function requestApi(input: string, options: RequestOptions = {}): Promise<Response> {
  const { authRequired = true, headers, ...requestInit } = options;
  const requestHeaders = new Headers(headers || {});

  if (authRequired) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(input, {
    ...requestInit,
    headers: requestHeaders,
  });

  if (response.status === 401 && authRequired) {
    clearAuthState();
    redirectToLogin();
    throw new ApiError(401, 'Unauthorized');
  }

  return response;
}

export function resolveGatewayUrl(path: string): string {
  return `${API_GATEWAY_URL}${path}`;
}
