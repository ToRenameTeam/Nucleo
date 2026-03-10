import type {
  LoginRequest,
  LoginResponse,
  SelectPatientProfileRequest,
  SearchUserByFiscalCodeResponse,
} from '../types/auth';
import { z } from 'zod';
import { USERS_API_URL, DELEGATIONS_API_URL, API_ENDPOINTS, ApiError } from './config';
import {
  idSchema,
  nonEmptyTrimmedStringSchema,
  parseApiResponse,
  parseWithSchema,
} from './validation';

// User data type for fetching user info
export interface UserInfo {
  userId: string;
  fiscalCode: string;
  name: string;
  lastName: string;
  dateOfBirth: string;
  patient?: {
    userId: string;
    activeDelegationIds: string[];
  };
  doctor?: {
    userId: string;
    medicalLicenseNumber: string;
    specializations: string[];
  };
}

const AUTH_BASE_URL = `${USERS_API_URL}${API_ENDPOINTS.AUTH}`;
const USERS_BASE_URL = `${USERS_API_URL}${API_ENDPOINTS.USERS}`;
const DELEGATIONS_BASE_URL = `${DELEGATIONS_API_URL}${API_ENDPOINTS.DELEGATIONS}`;

const patientProfileSchema = z
  .object({
    userId: idSchema,
    activeDelegationIds: z.array(idSchema).default([]),
  })
  .passthrough();

const doctorProfileSchema = z
  .object({
    userId: idSchema,
    medicalLicenseNumber: nonEmptyTrimmedStringSchema,
    specializations: z.array(nonEmptyTrimmedStringSchema),
  })
  .passthrough();

const userInfoSchema = z
  .object({
    userId: idSchema,
    fiscalCode: nonEmptyTrimmedStringSchema,
    name: nonEmptyTrimmedStringSchema,
    lastName: nonEmptyTrimmedStringSchema,
    dateOfBirth: nonEmptyTrimmedStringSchema,
    patient: patientProfileSchema.optional(),
    doctor: doctorProfileSchema.optional(),
  })
  .passthrough();

const loginRequestSchema = z.object({
  fiscalCode: nonEmptyTrimmedStringSchema,
  password: nonEmptyTrimmedStringSchema,
});

const selectPatientProfileRequestSchema = z.object({
  userId: idSchema,
  selectedProfile: z.enum(['PATIENT', 'DOCTOR']),
});

const loginResponseSchema = userInfoSchema
  .extend({
    activeProfile: z.enum(['PATIENT', 'DOCTOR']).optional(),
    requiresProfileSelection: z.boolean().optional(),
  })
  .passthrough();

const searchUserByFiscalCodeResponseSchema = z
  .object({
    userId: idSchema,
    fiscalCode: nonEmptyTrimmedStringSchema,
    name: nonEmptyTrimmedStringSchema,
    lastName: nonEmptyTrimmedStringSchema,
    dateOfBirth: nonEmptyTrimmedStringSchema,
  })
  .passthrough();

const usersCollectionSchema = z
  .object({
    users: z.array(userInfoSchema),
  })
  .passthrough();

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('[Auth API] login called');
    const sanitizedCredentials = parseWithSchema(
      loginRequestSchema,
      credentials,
      'auth login request'
    );

    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedCredentials),
    });

    return parseApiResponse(response, loginResponseSchema, 'auth login response');
  },

  async selectPatientProfile(request: SelectPatientProfileRequest): Promise<LoginResponse> {
    console.log('[Auth API] selectPatientProfile called');
    const sanitizedRequest = parseWithSchema(
      selectPatientProfileRequestSchema,
      request,
      'select patient profile request'
    );

    const response = await fetch(`${AUTH_BASE_URL}/select-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedRequest),
    });

    return parseApiResponse(response, loginResponseSchema, 'select patient profile response');
  },

  async getActiveDelegations(userId: string) {
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'active delegations userId');
    console.log('[Auth API] getActiveDelegations called for userId:', sanitizedUserId);
    const response = await fetch(
      `${DELEGATIONS_BASE_URL}/active-for-user?userId=${encodeURIComponent(sanitizedUserId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return parseApiResponse(response, z.unknown(), 'active delegations response');
  },

  async getUserById(userId: string): Promise<LoginResponse> {
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'auth get user by id');
    console.log('[Auth API] getUserById called for userId:', sanitizedUserId);
    const response = await fetch(`${USERS_BASE_URL}/${sanitizedUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseApiResponse(response, loginResponseSchema, 'auth get user by id response');
  },
};

export const userApi = {
  /**
   * Search user by fiscal code
   */
  async searchUserByFiscalCode(fiscalCode: string): Promise<SearchUserByFiscalCodeResponse> {
    const sanitizedFiscalCode = parseWithSchema(
      nonEmptyTrimmedStringSchema,
      fiscalCode,
      'search user by fiscal code'
    );

    console.log('[User API] searchUserByFiscalCode called for:', sanitizedFiscalCode);
    const params = new URLSearchParams({ fiscalCode: sanitizedFiscalCode });

    const response = await fetch(`${USERS_BASE_URL}/search?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseApiResponse(
      response,
      searchUserByFiscalCodeResponseSchema,
      'search user by fiscal code response'
    );
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserInfo | null> {
    const sanitizedUserId = parseWithSchema(idSchema, userId, 'user id');
    console.log('[User API] getUserById called for userId:', sanitizedUserId);
    const url = `${USERS_BASE_URL}/${sanitizedUserId}`;
    console.log('[User API] Fetching from:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.warn('[User API] User not found:', userId);
        return null;
      }

      console.log('[User API] Response status:', response.status, response.statusText);
      const data = await parseApiResponse(response, userInfoSchema, 'get user by id response');
      console.log('[User API] User received:', data.name, data.lastName);
      return data;
    } catch (error) {
      console.error('[User API] Error fetching user:', error);
      return null;
    }
  },

  /**
   * Get user full name by ID
   */
  async getUserFullName(userId: string): Promise<string> {
    const user = await this.getUserById(userId);
    if (user) {
      return `${user.name} ${user.lastName}`;
    }
    return userId;
  },

  /**
   * Get all users
   */
  async getAllUsers(): Promise<UserInfo[]> {
    console.log('[User API] getAllUsers called');
    const url = `${USERS_BASE_URL}`;
    console.log('[User API] Fetching from:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[User API] Response status:', response.status, response.statusText);
      const data = await parseApiResponse(
        response,
        usersCollectionSchema,
        'get all users response'
      );
      console.log('[User API] Users received:', data.users.length);
      return data.users;
    } catch (error) {
      console.error('[User API] Error fetching users:', error);
      return [];
    }
  },
};

export { ApiError as AuthApiError };
