import { type AddressInfo } from 'node:net';
import { type Server } from 'node:http';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { type StartedTestContainer } from 'testcontainers';
import { startServer, disconnectDB } from '../../src/app.js';
import { NotificationModel } from '../../src/infrastructure/database/index.js';
import { startMongoTestContainer, stopMongoTestContainer } from './test-container.js';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface CreateUserPayload {
  fiscalCode: string;
  password: string;
  name: string;
  lastName: string;
  dateOfBirth: string;
}

interface NotificationResponse {
  id: string;
  receiver: string;
  title: string;
  content: string | null;
  status: 'UNREAD' | 'READ';
  created_at: string;
}

let container: StartedTestContainer;
let server: Server | null = null;
let baseUrl = '';

const TEST_JWT_SECRET = 'integration-test-jwt-secret';

jest.setTimeout(120000);

beforeAll(async function () {
  process.env.JWT_SECRET = TEST_JWT_SECRET;

  const context = await startMongoTestContainer();
  container = context.container;

  server = await startServer({
    port: 0,
    mongoUri: context.mongoUri,
    runDatabaseSeeds: false,
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Unable to resolve test server address');
  }

  baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
});

beforeEach(async function () {
  if (!mongoose.connection.db) {
    return;
  }

  await mongoose.connection.db.dropDatabase();
});

afterAll(async function () {
  if (server) {
    await closeServer(server);
  }

  await disconnectDB();
  await stopMongoTestContainer(container);
});

describe('Users Service Integration', function () {
  it('returns healthy status', async function () {
    const response = await fetch(`${baseUrl}/health`);
    const json = (await response.json()) as {
      status: string;
      timestamp: string;
      service: string;
    };

    expect(response.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.service).toBe('users-service');
  });

  it('creates a user and rejects duplicates by fiscal code', async function () {
    const payload: CreateUserPayload = {
      fiscalCode: 'TSTABC90A01H501Z',
      password: 'Password123!',
      name: 'Mario',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
    };

    const createResponse = await postJson<ApiResponse<{ userId: string; fiscalCode: string }>>(
      `${baseUrl}/api/users`,
      payload
    );
    const duplicateResponse = await postJson<ApiResponse<null>>(`${baseUrl}/api/users`, payload);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.fiscalCode).toBe(payload.fiscalCode);
    expect(createResponse.body.data.userId).toBeTruthy();

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.success).toBe(false);
    expect(duplicateResponse.body.message).toContain('already exists');
  });

  it('authenticates a created user via login endpoint', async function () {
    const payload: CreateUserPayload = {
      fiscalCode: 'TSTDEF91B02H501X',
      password: 'SecurePass456!',
      name: 'Giulia',
      lastName: 'Login',
      dateOfBirth: '1991-02-02',
    };

    await postJson(`${baseUrl}/api/users`, payload);

    const loginResponse = await postJson<
      ApiResponse<{ userId: string; activeProfile: 'PATIENT'; patient: { userId: string } }>
    >(`${baseUrl}/api/auth/login`, {
      fiscalCode: payload.fiscalCode,
      password: payload.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.activeProfile).toBe('PATIENT');
    expect(loginResponse.body.data.patient.userId).toBe(loginResponse.body.data.userId);
  });

  it('creates a delegation and allows the delegating user to accept it', async function () {
    const delegatingUser = await createUser({
      fiscalCode: 'TSTGHI92C03H501W',
      password: 'Delegating789!',
      name: 'Anna',
      lastName: 'Delegating',
      dateOfBirth: '1992-03-03',
    });

    const delegatorUser = await createUser({
      fiscalCode: 'TSTJKL93D04H501V',
      password: 'Delegator101!',
      name: 'Luca',
      lastName: 'Delegator',
      dateOfBirth: '1993-04-04',
    });

    const createDelegationResponse = await postJson<
      ApiResponse<{ delegationId: string; status: string }>
    >(`${baseUrl}/api/delegations`, {
      delegatingUserId: delegatingUser.userId,
      delegatorUserId: delegatorUser.userId,
    });

    expect(createDelegationResponse.status).toBe(201);
    expect(createDelegationResponse.body.success).toBe(true);
    expect(createDelegationResponse.body.data.status).toBe('Pending');

    const delegationId = createDelegationResponse.body.data.delegationId;

    const acceptResponse = await putJson<ApiResponse<{ delegationId: string; status: string }>>(
      `${baseUrl}/api/delegations/${delegationId}/accept`,
      {
        userId: delegatingUser.userId,
      }
    );

    expect(acceptResponse.status).toBe(200);
    expect(acceptResponse.body.success).toBe(true);
    expect(acceptResponse.body.data.status).toBe('Active');

    const activeDelegationsResponse = await getJson<
      ApiResponse<{ delegations: Array<{ delegationId: string; delegatorUserId: string }> }>
    >(`${baseUrl}/api/delegations/active-for-user?userId=${delegatingUser.userId}`);

    expect(activeDelegationsResponse.status).toBe(200);
    expect(activeDelegationsResponse.body.success).toBe(true);
    expect(activeDelegationsResponse.body.data.delegations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          delegationId,
          delegatorUserId: delegatorUser.userId,
        }),
      ])
    );
  });

  it('lists notifications with combinable filters', async function () {
    const user = await createUser({
      fiscalCode: 'TSTMNO94E05H501U',
      password: 'Notifications123!',
      name: 'Elena',
      lastName: 'Notifiche',
      dateOfBirth: '1994-05-05',
    });

    await NotificationModel.create([
      {
        id: '0f5f7f88-4b21-4be8-938b-145df24d1b22',
        receiver: user.userId,
        title: 'Titolo 1',
        content: 'Contenuto 1',
        status: 'UNREAD',
        created_at: new Date('2026-03-20T10:00:00.000Z'),
      },
      {
        id: '20d4d302-f5d6-45bc-b514-cd2f4176f88f',
        receiver: user.userId,
        title: 'Titolo 2',
        content: 'Contenuto 2',
        status: 'READ',
        created_at: new Date('2026-03-01T10:00:00.000Z'),
      },
    ]);

    const response = await getJson<ApiResponse<{ notifications: NotificationResponse[] }>>(
      `${baseUrl}/api/users/${user.userId}/notifications?since=2026-03-15&status=UNREAD&limit=1`
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.notifications).toHaveLength(1);
    expect(response.body.data.notifications[0]?.status).toBe('UNREAD');
  });

  it('marks a notification as read', async function () {
    const user = await createUser({
      fiscalCode: 'TSTPQR95F06H501T',
      password: 'ReadStatus123!',
      name: 'Marco',
      lastName: 'Letto',
      dateOfBirth: '1995-06-06',
    });

    await NotificationModel.create({
      id: '6ed9ebf5-2ca0-44b7-bf30-c2ac6416ec52',
      receiver: user.userId,
      title: 'Titolo da leggere',
      content: null,
      status: 'UNREAD',
      created_at: new Date('2026-03-30T10:00:00.000Z'),
    });

    const response = await patchJson<ApiResponse<NotificationResponse>>(
      `${baseUrl}/api/users/${user.userId}/notifications/6ed9ebf5-2ca0-44b7-bf30-c2ac6416ec52/read`,
      {}
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('READ');
  });
});

async function createUser(payload: CreateUserPayload): Promise<{
  userId: string;
  fiscalCode: string;
}> {
  const response = await postJson<ApiResponse<{ userId: string; fiscalCode: string }>>(
    `${baseUrl}/api/users`,
    payload
  );

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);

  return response.body.data;
}

async function getJson<T>(url: string): Promise<{ status: number; body: T }> {
  const token = createTestAccessToken();

  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const body = (await response.json()) as T;

  return {
    status: response.status,
    body,
  };
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function createTestAccessToken(): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 3600;
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      userId: 'integration-user',
      fiscalCode: 'TSTINT90A01H501Z',
      activeProfile: 'PATIENT',
      iat: issuedAt,
      exp: expiresAt,
      iss: 'nucleo-users-service',
    })
  );

  const signature = crypto
    .createHmac('sha256', TEST_JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

async function postJson<T = unknown>(
  url: string,
  payload: unknown
): Promise<{ status: number; body: T }> {
  const token = createTestAccessToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as T;

  return {
    status: response.status,
    body,
  };
}

async function putJson<T = unknown>(
  url: string,
  payload: unknown
): Promise<{ status: number; body: T }> {
  const token = createTestAccessToken();

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as T;

  return {
    status: response.status,
    body,
  };
}

async function patchJson<T = unknown>(
  url: string,
  payload: unknown
): Promise<{ status: number; body: T }> {
  const token = createTestAccessToken();

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as T;

  return {
    status: response.status,
    body,
  };
}

async function closeServer(appServer: Server): Promise<void> {
  await new Promise<void>(function (resolve, reject) {
    appServer.close(function (error) {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
