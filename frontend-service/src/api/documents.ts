import { DOCUMENTS_API_URL } from './config';
import { z } from 'zod';
import { idSchema, nonEmptyTrimmedStringSchema, parseWithSchema } from './validation';
import { userApi } from './users';
import { requestApi } from './httpClient';
import type {
  AnyDocument,
  Document,
  Dosage,
  MedicinePrescription,
  ServicePrescription,
  Validity,
} from '../types/document';

const BASE_URL = DOCUMENTS_API_URL;

export interface FileMetadata {
  summary: string;
  tags: string[];
}

export interface CreateMedicinePrescriptionRequest {
  type: 'medicine_prescription';
  doctorId: string;
  metadata: FileMetadata;
  validity: {
    type: 'until_date' | 'until_execution';
    date?: string;
  };
  dosage: {
    medicineId: string;
    dose: {
      amount: number;
      unit: string;
    };
    frequency: {
      timesPerPeriod: number;
      period: string;
    };
    duration: {
      length: number;
      unit: string;
    };
  };
}

export interface CreateServicePrescriptionRequest {
  type: 'service_prescription';
  doctorId: string;
  metadata: FileMetadata;
  validity: {
    type: 'until_date' | 'until_execution';
    date?: string;
  };
  serviceId: string;
  facilityId: string;
  priority: 'ROUTINE' | 'URGENT' | 'DEFERRED';
}

export interface CreateReportRequest {
  type: 'report';
  doctorId: string;
  metadata: FileMetadata;
  servicePrescriptionId: string;
  executionDate: string;
  findings: string;
  clinicalQuestion?: string;
  conclusion?: string;
  recommendations?: string;
}

export type CreateDocumentRequest =
  | CreateMedicinePrescriptionRequest
  | CreateServicePrescriptionRequest
  | CreateReportRequest;

export interface DocumentResponse {
  id: string;
  doctorId: string;
  patientId: string;
  issueDate: string;
  title: string;
  metadata: FileMetadata;
}

export interface MedicinePrescriptionResponse extends DocumentResponse {
  type: 'medicine_prescription';
  title: string;
  validity: Validity;
  dosage: Dosage;
}

export interface ServicePrescriptionResponse extends DocumentResponse {
  type: 'service_prescription';
  title: string;
  validity: Validity;
  serviceId: string;
  facilityId: string;
  priority: string;
}

export interface ReportResponse extends DocumentResponse {
  type: 'report';
  title: string;
  servicePrescription: ServicePrescriptionResponse;
  executionDate: string;
  clinicalQuestion?: string;
  findings: string;
  conclusion?: string;
  recommendations?: string;
}

export interface UploadedDocumentResponse extends DocumentResponse {
  type: 'uploaded_document';
  title: string;
  filename: string;
  documentType: string;
}

export type DocumentApiResponse =
  | MedicinePrescriptionResponse
  | ServicePrescriptionResponse
  | ReportResponse
  | UploadedDocumentResponse;

export interface UploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
}

const fileMetadataSchema = z.object({
  summary: nonEmptyTrimmedStringSchema,
  tags: z.array(nonEmptyTrimmedStringSchema),
});

const validityRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('until_date'),
    date: nonEmptyTrimmedStringSchema,
  }),
  z.object({
    type: z.literal('until_execution'),
  }),
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
  type: z.literal('medicine_prescription'),
  doctorId: idSchema,
  metadata: fileMetadataSchema,
  validity: validityRequestSchema,
  dosage: dosageSchema,
});

const createServicePrescriptionRequestSchema = z.object({
  type: z.literal('service_prescription'),
  doctorId: idSchema,
  metadata: fileMetadataSchema,
  validity: validityRequestSchema,
  serviceId: idSchema,
  facilityId: idSchema,
  priority: z.enum(['ROUTINE', 'URGENT', 'DEFERRED']),
});

const createReportRequestSchema = z.object({
  type: z.literal('report'),
  doctorId: idSchema,
  metadata: fileMetadataSchema,
  servicePrescriptionId: idSchema,
  executionDate: nonEmptyTrimmedStringSchema,
  findings: nonEmptyTrimmedStringSchema,
  clinicalQuestion: nonEmptyTrimmedStringSchema.optional(),
  conclusion: nonEmptyTrimmedStringSchema.optional(),
  recommendations: nonEmptyTrimmedStringSchema.optional(),
});

const createDocumentRequestSchema = z.discriminatedUnion('type', [
  createMedicinePrescriptionRequestSchema,
  createServicePrescriptionRequestSchema,
  createReportRequestSchema,
]);

const documentResponseSchema = z
  .object({
    id: idSchema,
    doctorId: idSchema,
    patientId: idSchema,
    issueDate: nonEmptyTrimmedStringSchema,
    title: nonEmptyTrimmedStringSchema,
    metadata: fileMetadataSchema,
  })
  .passthrough();

const medicinePrescriptionResponseSchema = documentResponseSchema.extend({
  type: z.literal('medicine_prescription'),
  validity: validityRequestSchema,
  dosage: dosageSchema,
});

const servicePrescriptionResponseSchema = documentResponseSchema.extend({
  type: z.literal('service_prescription'),
  validity: validityRequestSchema,
  serviceId: idSchema,
  facilityId: idSchema,
  priority: nonEmptyTrimmedStringSchema,
});

const reportResponseSchema = documentResponseSchema.extend({
  type: z.literal('report'),
  servicePrescription: servicePrescriptionResponseSchema,
  executionDate: nonEmptyTrimmedStringSchema,
  clinicalQuestion: nonEmptyTrimmedStringSchema.optional(),
  findings: nonEmptyTrimmedStringSchema,
  conclusion: nonEmptyTrimmedStringSchema.optional(),
  recommendations: nonEmptyTrimmedStringSchema.optional(),
});

const uploadedDocumentResponseSchema = documentResponseSchema.extend({
  type: z.literal('uploaded_document'),
  filename: nonEmptyTrimmedStringSchema,
  documentType: nonEmptyTrimmedStringSchema,
});

const documentApiResponseSchema = z.discriminatedUnion('type', [
  medicinePrescriptionResponseSchema,
  servicePrescriptionResponseSchema,
  reportResponseSchema,
  uploadedDocumentResponseSchema,
]);

const uploadResponseSchema = z
  .object({
    success: z.boolean(),
    message: nonEmptyTrimmedStringSchema,
    documentId: idSchema.optional(),
  })
  .passthrough();

const userFullNameCache = new Map<string, Promise<string>>();

function buildDocumentTitle(type: CreateDocumentRequest['type'], summary: string): string {
  return summary.trim() || getDocumentTypeLabel(type);
}

function resolveUserFullName(userId: string): Promise<string> {
  const cachedValue = userFullNameCache.get(userId);

  if (cachedValue) {
    return cachedValue;
  }

  const request = userApi.getUserFullName(userId).catch((error) => {
    console.warn('[Documents API] Failed to resolve user full name:', userId, error);
    return userId;
  });

  userFullNameCache.set(userId, request);
  return request;
}

async function enrichDocumentWithUserName(
  document: AnyDocument,
  userRole: 'doctor' | 'patient'
): Promise<AnyDocument> {
  const userId = userRole === 'doctor' ? document.doctorId : document.patientId;

  if (!userId) {
    return document;
  }

  const userFullName = await resolveUserFullName(userId);

  if (userRole === 'doctor') {
    return {
      ...document,
      doctor: `Dott. ${userFullName}`,
    };
  }

  return {
    ...document,
    patient: userFullName,
  };
}

async function enrichDocumentsWithUserName(
  documents: AnyDocument[],
  userRole: 'doctor' | 'patient'
): Promise<AnyDocument[]> {
  return Promise.all(documents.map((document) => enrichDocumentWithUserName(document, userRole)));
}

// Helper functions
function mapDocumentResponse(response: DocumentApiResponse): AnyDocument {
  console.log('[Documents API] Mapping document response:', {
    id: response.id,
    type: response.type,
    title: response.title,
  });

  const baseDocument: Document = {
    id: response.id,
    title: response.title || getDocumentTypeLabel(response.type),
    description: response.metadata.summary || '--',
    date: response.issueDate,
    tags: response.metadata.tags || [],
    patientId: response.patientId,
    doctorId: response.doctorId,
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
      console.log('[Documents API] Mapped as MedicinePrescription');
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
      console.log(
        '[Documents API] Mapped as ServicePrescription with serviceId:',
        response.serviceId
      );
      return servicePrescription;
    }

    case 'report': {
      return {
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
    }

    case 'uploaded_document': {
      return baseDocument;
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

export const documentsApiService = {
  /**
   * Create a new document (prescription or report)
   */
  async createDocument(
    patientId: string,
    request: CreateDocumentRequest
  ): Promise<DocumentResponse> {
    const sanitizedPatientId = parseWithSchema(idSchema, patientId, 'create document patientId');
    const sanitizedRequest = parseWithSchema(
      createDocumentRequestSchema,
      request,
      'create document request'
    );

    const payload = {
      ...sanitizedRequest,
      title: buildDocumentTitle(sanitizedRequest.type, sanitizedRequest.metadata.summary),
    };

    const response = await requestApi(`${BASE_URL}/api/documents/patients/${sanitizedPatientId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    return parseWithSchema(documentResponseSchema, rawData, 'create document response');
  },

  /**
   * Upload a document file (PDF)
   */
  async uploadDocument(patientId: string, file: File): Promise<UploadResponse> {
    const sanitizedPatientId = parseWithSchema(idSchema, patientId, 'upload document patientId');
    const formData = new FormData();
    formData.append('file', file);

    const response = await requestApi(
      `${BASE_URL}/api/documents/patients/${sanitizedPatientId}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      // Try to get error details from response
      const errorData: { message?: string; code?: string } = await response
        .json()
        .catch(() => ({ message: 'Unknown error' }));
      const error = new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      ) as Error & {
        code?: string;
      };
      // Attach the error code if available
      error.code = errorData.code;
      throw error;
    }

    const rawData = await response.json();
    return parseWithSchema(uploadResponseSchema, rawData, 'upload document response');
  },

  /**
   * Get all documents for a patient
   */
  async getDocumentsByPatient(patientId: string): Promise<AnyDocument[]> {
    try {
      const sanitizedPatientId = parseWithSchema(idSchema, patientId, 'get documents by patientId');

      const response = await requestApi(
        `${BASE_URL}/api/documents/patients/${sanitizedPatientId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const documentsRaw = await handleResponse<unknown>(response);
      const documents = parseWithSchema(
        z.array(documentApiResponseSchema),
        documentsRaw,
        'documents by patient response'
      );
      const mappedDocuments = documents.map((doc) => mapDocumentResponse(doc));
      return enrichDocumentsWithUserName(mappedDocuments, 'doctor');
    } catch (error) {
      console.error('[Documents API] Error fetching documents by patient:', error);
      throw error;
    }
  },

  /**
   * Download a document PDF
   */
  async downloadDocument(patientId: string, documentId: string): Promise<void> {
    try {
      const sanitizedPatientId = parseWithSchema(
        idSchema,
        patientId,
        'download document patientId'
      );
      const sanitizedDocumentId = parseWithSchema(idSchema, documentId, 'download documentId');

      const response = await requestApi(
        `${BASE_URL}/api/documents/patients/${sanitizedPatientId}/${sanitizedDocumentId}/pdf`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'document.pdf';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('[Documents API] Error downloading document:', error);
      throw error;
    }
  },

  /**
   * Download multiple documents as PDFs
   */
  async downloadMultipleDocuments(
    documents: { patientId: string; documentId: string; title?: string }[]
  ): Promise<void> {
    try {
      for (const doc of documents) {
        await this.downloadDocument(doc.patientId, doc.documentId);
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('[Documents API] Error downloading multiple documents:', error);
      throw error;
    }
  },

  /**
   * Get a specific document by ID
   */
  async getDocumentById(patientId: string, documentId: string): Promise<AnyDocument> {
    try {
      const sanitizedPatientId = parseWithSchema(idSchema, patientId, 'get document patientId');
      const sanitizedDocumentId = parseWithSchema(idSchema, documentId, 'get document documentId');

      const response = await requestApi(
        `${BASE_URL}/api/documents/patients/${sanitizedPatientId}/${sanitizedDocumentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const documentRaw = await handleResponse<unknown>(response);
      const document = parseWithSchema(
        documentApiResponseSchema,
        documentRaw,
        'get document by id response'
      );
      return mapDocumentResponse(document);
    } catch (error) {
      console.error('[Documents API] Error fetching document by ID:', error);
      throw error;
    }
  },

  /**
   * Get all documents issued by a specific doctor
   */
  async getDocumentsByDoctor(doctorId: string): Promise<AnyDocument[]> {
    const sanitizedDoctorId = parseWithSchema(idSchema, doctorId, 'get documents by doctorId');
    const queryParams = new URLSearchParams();
    queryParams.append('doctorId', sanitizedDoctorId);
    const url = `${BASE_URL}/api/documents?${queryParams.toString()}`;

    try {
      const response = await requestApi(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const documentsRaw = await handleResponse<unknown>(response);
      const documents = parseWithSchema(
        z.array(documentApiResponseSchema),
        documentsRaw,
        'documents by doctor response'
      );
      const mappedDocuments = documents.map((doc) => mapDocumentResponse(doc));
      return enrichDocumentsWithUserName(mappedDocuments, 'patient');
    } catch (error) {
      console.error('[Documents API] Error fetching documents by doctor:', error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(patientId: string, documentId: string): Promise<boolean> {
    const sanitizedPatientId = parseWithSchema(idSchema, patientId, 'delete document patientId');
    const sanitizedDocumentId = parseWithSchema(idSchema, documentId, 'delete document documentId');
    const url = `${BASE_URL}/api/documents/patients/${sanitizedPatientId}/${sanitizedDocumentId}`;

    try {
      const response = await requestApi(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('[Documents API] Error deleting document:', error);
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
      'create medicine prescription patientId'
    );
    const sanitizedRequest = parseWithSchema(
      createMedicinePrescriptionRequestSchema,
      request,
      'create medicine prescription request'
    );
    const url = `${BASE_URL}/api/documents/patients/${sanitizedPatientId}`;

    const payload = {
      ...sanitizedRequest,
      title: buildDocumentTitle(sanitizedRequest.type, sanitizedRequest.metadata.summary),
    };

    try {
      const response = await requestApi(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const documentRaw = await response.json();
      const document = parseWithSchema(
        documentApiResponseSchema,
        documentRaw,
        'create medicine prescription response'
      );
      return mapDocumentResponse(document) as MedicinePrescription;
    } catch (error) {
      console.error('[Documents API] Error creating medicine prescription:', error);
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
      'create service prescription patientId'
    );
    const sanitizedRequest = parseWithSchema(
      createServicePrescriptionRequestSchema,
      request,
      'create service prescription request'
    );
    const url = `${BASE_URL}/api/documents/patients/${sanitizedPatientId}`;

    const payload = {
      ...sanitizedRequest,
      title: buildDocumentTitle(sanitizedRequest.type, sanitizedRequest.metadata.summary),
    };

    try {
      const response = await requestApi(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const documentRaw = await response.json();
      const document = parseWithSchema(
        documentApiResponseSchema,
        documentRaw,
        'create service prescription response'
      );
      return mapDocumentResponse(document) as ServicePrescription;
    } catch (error) {
      console.error('[Documents API] Error creating service prescription:', error);
      throw error;
    }
  },
};
