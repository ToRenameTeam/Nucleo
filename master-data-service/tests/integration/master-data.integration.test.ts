import { type AddressInfo } from 'node:net';
import { type Server } from 'node:http';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { type StartedTestContainer } from 'testcontainers';
import { startServer, disconnectDB } from '../../src/app.js';
import { MedicineCategory, ServiceCategory } from '../../src/domain/index.js';
import { startMongoTestContainer, stopMongoTestContainer } from './test-container.js';

interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  error?: string;
}

interface ServiceTypePayload {
  code: string;
  name: string;
  description: string;
  category: ServiceCategory[];
  isActive?: boolean;
}

interface FacilityPayload {
  code: string;
  name: string;
  address: string;
  city: string;
  isActive?: boolean;
}

interface MedicinePayload {
  code: string;
  name: string;
  description: string;
  category: MedicineCategory;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  manufacturer: string;
  isActive?: boolean;
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

describe('Master Data Service Integration', function () {
  it('returns healthy status', async function () {
    const response = await fetch(`${baseUrl}/health`);
    const json = (await response.json()) as {
      status: string;
      timestamp: string;
      service: string;
    };

    expect(response.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.service).toBe('master-data-service');
  });

  it('creates a service type and rejects duplicates', async function () {
    const payload: ServiceTypePayload = {
      code: 'service-901',
      name: 'Visita Integrativa',
      description: 'Visita di test integrazione',
      category: [ServiceCategory.CARDIOLOGIA],
    };

    const createResponse = await postJson<ApiResponse<{ id: string; code: string }>>(
      `${baseUrl}/api/service-catalog`,
      payload
    );
    const duplicateResponse = await postJson<ApiResponse<null>>(
      `${baseUrl}/api/service-catalog`,
      payload
    );

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.id).toBe(payload.code);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.success).toBe(false);
    expect(duplicateResponse.body.error).toContain('already exists');
  });

  it('filters active service types', async function () {
    await postJson(`${baseUrl}/api/service-catalog`, {
      code: 'service-902',
      name: 'Visita Attiva',
      description: 'Elemento attivo',
      category: [ServiceCategory.PREVENZIONE],
      isActive: true,
    });

    await postJson(`${baseUrl}/api/service-catalog`, {
      code: 'service-903',
      name: 'Visita Inattiva',
      description: 'Elemento inattivo',
      category: [ServiceCategory.PREVENZIONE],
      isActive: false,
    });

    const response = await getJson<ApiResponse<Array<{ code: string; isActive: boolean }>>>(
      `${baseUrl}/api/service-catalog?active=true`
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(1);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].code).toBe('service-902');
    expect(response.body.data[0].isActive).toBe(true);
  });

  it('returns only active cities in facility endpoint', async function () {
    const activeFacility: FacilityPayload = {
      code: 'facility-901',
      name: 'Poliambulatorio Milano Centro',
      address: 'Via Centrale 12',
      city: 'Milano',
      isActive: true,
    };

    const inactiveFacility: FacilityPayload = {
      code: 'facility-902',
      name: 'Poliambulatorio Torino Nord',
      address: 'Corso Test 18',
      city: 'Torino',
      isActive: false,
    };

    await postJson(`${baseUrl}/api/facilities`, activeFacility);
    await postJson(`${baseUrl}/api/facilities`, inactiveFacility);

    const response = await getJson<ApiResponse<string[]>>(`${baseUrl}/api/facilities/cities`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toContain('Milano');
    expect(response.body.data).not.toContain('Torino');
  });

  it('creates medicine and exposes category metadata', async function () {
    const payload: MedicinePayload = {
      code: 'medicine-901',
      name: 'Farmaco Test',
      description: 'Descrizione di integrazione',
      category: MedicineCategory.ANALGESICO,
      activeIngredient: 'Paracetamolo',
      dosageForm: 'Compresse',
      strength: '500mg',
      manufacturer: 'Test Pharma',
    };

    const createResponse = await postJson<ApiResponse<{ id: string; code: string }>>(
      `${baseUrl}/api/medicines`,
      payload
    );
    const categoriesResponse = await getJson<
      ApiResponse<Array<{ value: MedicineCategory; label: string }>>
    >(`${baseUrl}/api/medicines/categories`);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.id).toBe(payload.code);

    expect(categoriesResponse.status).toBe(200);
    expect(categoriesResponse.body.success).toBe(true);
    expect(categoriesResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: MedicineCategory.ANALGESICO,
          label: 'Analgesico',
        }),
      ])
    );
  });
});

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
