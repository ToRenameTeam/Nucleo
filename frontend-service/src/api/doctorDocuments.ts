import type {
  Document,
  MedicinePrescription,
  ServicePrescription,
  Report,
  AnyDocument,
  Validity,
  Dosage,
} from '../types/document';
import { DOCUMENTS_API_URL } from './config';
import { z } from 'zod';
import { idSchema, nonEmptyTrimmedStringSchema, parseWithSchema } from './validation';

const BASE_URL = DOCUMENTS_API_URL;
const DOCUMENTS_BASE_URL = `${DOCUMENTS_API_URL}/api/documents`;

// Validity types for API requests (using _t as discriminator)
interface ValidityUntilDate {
  _t: 'until_date';
  date: string;
}

interface ValidityUntilExecution {
  _t: 'until_execution';
}

type ValidityRequest = ValidityUntilDate | ValidityUntilExecution;

// API Request types (using _t as class discriminator for Kotlin backend)
interface CreateMedicinePrescriptionRequest {
  _t: 'medicine_prescription';
  doctorId: string;
  title?: string;
  metadata: {
    summary: string;
    tags: string[];
  };
  validity: ValidityRequest;
  dosage: Dosage;
}

interface CreateServicePrescriptionRequest {
  _t: 'service_prescription';
  doctorId: string;
  title?: string;
  metadata: {
    summary: string;
    tags: string[];
  };
  validity: ValidityRequest;
  serviceId: string;
  facilityId: string;
  priority: string;
}

// API Response types
interface FileMetadata {
  summary: string;
  tags: string[];
}

interface BaseDocumentResponse {
  id: string;
  doctorId: string;
  patientId: string;
  issueDate: string;
  metadata: FileMetadata;
}

interface MedicinePrescriptionResponse extends BaseDocumentResponse {
  type: 'medicine_prescription';
  validity: Validity;
  dosage: Dosage;
}

interface ServicePrescriptionResponse extends BaseDocumentResponse {
  type: 'service_prescription';
  validity: Validity;
  serviceId: string;
  facilityId: string;
  priority: string;
}

interface ReportResponse extends BaseDocumentResponse {
  type: 'report';
  servicePrescription: ServicePrescriptionResponse;
  executionDate: string;
  clinicalQuestion?: string;
  findings: string;
  conclusion?: string;
  recommendations?: string;
}

type DocumentResponse = MedicinePrescriptionResponse | ServicePrescriptionResponse | ReportResponse;

const fileMetadataSchema = z.object({
  summary: nonEmptyTrimmedStringSchema,
  tags: z.array(nonEmptyTrimmedStringSchema),
});

const validityRequestSchema = z.discriminatedUnion('_t', [
  z.object({ _t: z.literal('until_date'), date: nonEmptyTrimmedStringSchema }),
  z.object({ _t: z.literal('until_execution') }),
]);

const dosageSchema = z.object({
  medicineId: idSchema,
  dose: z.object({
    amount: z.number().positive(),
    unit: nonEmptyTrimmedStringSchema,
  }),
  frequency: z.object({
    timesPerPeriod: z.number().positive(),
    period: nonEmptyTrimmedStringSchema,
  }),
  duration: z.object({
    length: z.number().positive(),
    unit: nonEmptyTrimmedStringSchema,
  }),
});

const createMedicinePrescriptionRequestSchema = z.object({
  _t: z.literal('medicine_prescription'),
  doctorId: idSchema,
  title: nonEmptyTrimmedStringSchema.optional(),
  metadata: fileMetadataSchema,
  validity: validityRequestSchema,
  dosage: dosageSchema,
});

const createServicePrescriptionRequestSchema = z.object({
  _t: z.literal('service_prescription'),
  doctorId: idSchema,
  title: nonEmptyTrimmedStringSchema.optional(),
  metadata: fileMetadataSchema,
  validity: validityRequestSchema,
  serviceId: idSchema,
  facilityId: idSchema,
  priority: nonEmptyTrimmedStringSchema,
});

const validityResponseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('until_date'), date: nonEmptyTrimmedStringSchema }),
  z.object({ type: z.literal('until_execution') }),
]);

const baseDocumentResponseSchema = z.object({
  id: idSchema,
  doctorId: idSchema,
  patientId: idSchema,
  issueDate: nonEmptyTrimmedStringSchema,
  metadata: fileMetadataSchema,
});

const medicinePrescriptionResponseSchema = baseDocumentResponseSchema.extend({
  type: z.literal('medicine_prescription'),
  validity: validityResponseSchema,
  dosage: dosageSchema,
});

const servicePrescriptionResponseSchema = baseDocumentResponseSchema.extend({
  type: z.literal('service_prescription'),
  validity: validityResponseSchema,
  serviceId: idSchema,
  facilityId: idSchema,
  priority: nonEmptyTrimmedStringSchema,
});

const reportResponseSchema = baseDocumentResponseSchema.extend({
  type: z.literal('report'),
  servicePrescription: servicePrescriptionResponseSchema,
  executionDate: nonEmptyTrimmedStringSchema,
  clinicalQuestion: nonEmptyTrimmedStringSchema.optional(),
  findings: nonEmptyTrimmedStringSchema,
  conclusion: nonEmptyTrimmedStringSchema.optional(),
  recommendations: nonEmptyTrimmedStringSchema.optional(),
});

const documentResponseSchema = z.discriminatedUnion('type', [
  medicinePrescriptionResponseSchema,
  servicePrescriptionResponseSchema,
  reportResponseSchema,
]);

function mapDocumentResponse(response: DocumentResponse): AnyDocument {
  const baseDocument: Document = {
    id: response.id,
    title: response.metadata.summary || getDocumentTypeLabel(response.type),
    description: response.metadata.summary || '',
    date: response.issueDate,
    tags: response.metadata.tags || [],
  };

  // Map to specific document types
  switch (response.type) {
    case 'medicine_prescription': {
      const medicinePrescription: MedicinePrescription = {
        ...baseDocument,
        type: 'medicine_prescription',
        validity: response.validity,
        dosage: response.dosage,
      };
      return medicinePrescription;
    }

    case 'service_prescription': {
      const servicePrescription: ServicePrescription = {
        ...baseDocument,
        type: 'service_prescription',
        validity: response.validity,
        serviceId: response.serviceId,
        facilityId: response.facilityId,
        priority: response.priority,
      };
      return servicePrescription;
    }

    case 'report': {
      const report: Report = {
        ...baseDocument,
        type: 'report',
        servicePrescription: mapDocumentResponse(
          response.servicePrescription
        ) as ServicePrescription,
        executionDate: response.executionDate,
        clinicalQuestion: response.clinicalQuestion,
        findings: response.findings,
        conclusion: response.conclusion,
        recommendations: response.recommendations,
      };
      return report;
    }

    default:
      return baseDocument;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * Get a human-readable label for document type
 */
function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'medicine_prescription':
      return 'Prescrizione Farmaci';
    case 'service_prescription':
      return 'Prescrizione Esami/Visite';
    case 'report':
      return 'Referto';
    default:
      return 'Documento';
  }
}

export const doctorDocumentsApi = {
  /**
   * Get all documents issued by a specific doctor
   */
  async getDocumentsByDoctor(doctorId: string): Promise<AnyDocument[]> {
    const sanitizedDoctorId = parseWithSchema(idSchema, doctorId, 'doctor documents doctorId');
    console.log('[Doctor Documents API] Get documents by doctor:', sanitizedDoctorId);

    const queryParams = new URLSearchParams();
    queryParams.append('doctorId', sanitizedDoctorId);
    const url = `${DOCUMENTS_BASE_URL}?${queryParams.toString()}`;
    console.log('[Doctor Documents API] Fetch call to:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[Doctor Documents API] Response status:', response.status, response.statusText);

      const documentsRaw = await handleResponse<unknown>(response);
      const documents = parseWithSchema(
        z.array(documentResponseSchema),
        documentsRaw,
        'doctor documents response'
      );
      console.log('[Doctor Documents API] Data received:', documents.length, 'documents');

      const mappedDocuments = documents.map((doc) => mapDocumentResponse(doc));
      console.log('[Doctor Documents API] Mapped documents:', mappedDocuments.length, 'items');

      return mappedDocuments;
    } catch (error) {
      console.error('[Doctor Documents API] Error fetching documents by doctor:', error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    const sanitizedDocumentId = parseWithSchema(idSchema, documentId, 'doctor delete documentId');
    console.log('[Doctor Documents API] Delete document:', sanitizedDocumentId);

    const url = `${BASE_URL}/documents/${sanitizedDocumentId}`;
    console.log('[Doctor Documents API] Delete call to:', url);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[Doctor Documents API] Response status:', response.status, response.statusText);

      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('[Doctor Documents API] Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Create a medicine prescription
   */
  async createMedicinePrescription(
    patientId: string,
    request: CreateMedicinePrescriptionRequest
  ): Promise<MedicinePrescription> {
    const sanitizedPatientId = parseWithSchema(
      idSchema,
      patientId,
      'doctor create medicine prescription patientId'
    );
    const sanitizedRequest = parseWithSchema(
      createMedicinePrescriptionRequestSchema,
      request,
      'doctor create medicine prescription request'
    );

    console.log(
      '[Doctor Documents API] Create medicine prescription for patient:',
      sanitizedPatientId
    );

    const url = `${BASE_URL}/api/patients/${sanitizedPatientId}/documents`;
    console.log('[Doctor Documents API] POST call to:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedRequest),
      });

      console.log('[Doctor Documents API] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const documentRaw = await response.json();
      const document = parseWithSchema(
        documentResponseSchema,
        documentRaw,
        'doctor create medicine prescription response'
      );
      console.log('[Doctor Documents API] Medicine prescription created:', document.id);

      return mapDocumentResponse(document) as MedicinePrescription;
    } catch (error) {
      console.error('[Doctor Documents API] Error creating medicine prescription:', error);
      throw error;
    }
  },

  /**
   * Create a service prescription
   */
  async createServicePrescription(
    patientId: string,
    request: CreateServicePrescriptionRequest
  ): Promise<ServicePrescription> {
    const sanitizedPatientId = parseWithSchema(
      idSchema,
      patientId,
      'doctor create service prescription patientId'
    );
    const sanitizedRequest = parseWithSchema(
      createServicePrescriptionRequestSchema,
      request,
      'doctor create service prescription request'
    );

    console.log(
      '[Doctor Documents API] Create service prescription for patient:',
      sanitizedPatientId
    );

    const url = `${BASE_URL}/api/patients/${sanitizedPatientId}/documents`;
    console.log('[Doctor Documents API] POST call to:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedRequest),
      });

      console.log('[Doctor Documents API] Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const documentRaw = await response.json();
      const document = parseWithSchema(
        documentResponseSchema,
        documentRaw,
        'doctor create service prescription response'
      );
      console.log('[Doctor Documents API] Service prescription created:', document.id);

      return mapDocumentResponse(document) as ServicePrescription;
    } catch (error) {
      console.error('[Doctor Documents API] Error creating service prescription:', error);
      throw error;
    }
  },
};
