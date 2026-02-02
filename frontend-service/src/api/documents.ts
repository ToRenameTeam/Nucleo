import { DOCUMENTS_API_URL } from './config'

const BASE_URL = DOCUMENTS_API_URL

export interface FileMetadata {
  summary: string
  tags: string[]
}

export interface CreateMedicinePrescriptionRequest {
  type: 'medicine_prescription'
  doctorId: string
  metadata: FileMetadata
  validity: {
    type: 'until_date' | 'until_execution'
    date?: string
  }
  dosage: {
    medicineId: string
    dose: {
      amount: number
      unit: string
    }
    frequency: {
      timesPerPeriod: number
      period: string
    }
    duration: {
      length: number
      unit: string
    }
  }
}

export interface CreateServicePrescriptionRequest {
  type: 'service_prescription'
  doctorId: string
  metadata: FileMetadata
  validity: {
    type: 'until_date' | 'until_execution'
    date?: string
  }
  serviceId: string
  facilityId: string
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY'
}

export interface CreateReportRequest {
  type: 'report'
  doctorId: string
  metadata: FileMetadata
  servicePrescriptionId: string
  executionDate: string
  findings: string
  clinicalQuestion?: string
  conclusion?: string
  recommendations?: string
}

export type CreateDocumentRequest = 
  | CreateMedicinePrescriptionRequest 
  | CreateServicePrescriptionRequest 
  | CreateReportRequest

export interface DocumentResponse {
  id: string
  doctorId: string
  patientId: string
  issueDate: string
  metadata: FileMetadata
}

export interface UploadDocumentRequest {
  file: File
}

export interface UploadResponse {
  success: boolean
  message: string
  documentId?: string
}

export const documentsApiService = {
  /**
   * Create a new document (prescription or report)
   */
  async createDocument(patientId: string, request: CreateDocumentRequest): Promise<DocumentResponse> {
    const payload = {
      '@type': request.type,
      doctorId: request.doctorId,
      metadata: request.metadata,
      ...('validity' in request && { validity: request.validity }),
      ...('dosage' in request && { dosage: request.dosage }),
      ...('serviceId' in request && { serviceId: request.serviceId }),
      ...('facilityId' in request && { facilityId: request.facilityId }),
      ...('priority' in request && { priority: request.priority }),
      ...('servicePrescriptionId' in request && { servicePrescriptionId: request.servicePrescriptionId }),
      ...('executionDate' in request && { executionDate: request.executionDate }),
      ...('findings' in request && { findings: request.findings }),
      ...('clinicalQuestion' in request && { clinicalQuestion: request.clinicalQuestion }),
      ...('conclusion' in request && { conclusion: request.conclusion }),
      ...('recommendations' in request && { recommendations: request.recommendations })
    }

    const response = await fetch(`${BASE_URL}/patients/${patientId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  /**
   * Upload a document file (PDF)
   */
  async uploadDocument(patientId: string, file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${BASE_URL}/patients/${patientId}/documents/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  /**
   * Get all documents for a patient
   */
  async getDocumentsByPatient(patientId: string): Promise<DocumentResponse[]> {
    const response = await fetch(`${BASE_URL}/patients/${patientId}/documents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  },

  /**
   * Get a specific document by ID
   */
  async getDocumentById(patientId: string, documentId: string): Promise<DocumentResponse> {
    const response = await fetch(`${BASE_URL}/patients/${patientId}/documents/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }
}
