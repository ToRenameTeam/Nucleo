import { DOCUMENTS_API_URL } from './config'
import type { 
  Document, 
  MedicinePrescription, 
  ServicePrescription, 
  Report, 
  AnyDocument, 
  Validity, 
  Dosage 
} from '../types/document'

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
  title: string
  metadata: FileMetadata
}

export interface MedicinePrescriptionResponse extends DocumentResponse {
  type: 'medicine_prescription'
  title: string
  validity: Validity
  dosage: Dosage
}

export interface ServicePrescriptionResponse extends DocumentResponse {
  type: 'service_prescription'
  title: string
  validity: Validity
  serviceId: string
  facilityId: string
  priority: string
}

export interface ReportResponse extends DocumentResponse {
  type: 'report'
  title: string
  servicePrescription: ServicePrescriptionResponse
  executionDate: string
  clinicalQuestion?: string
  findings: string
  conclusion?: string
  recommendations?: string
}

export interface UploadedDocumentResponse extends DocumentResponse {
  type: 'uploaded_document'
  title: string
  filename: string
  documentType: string
}

export type DocumentApiResponse = MedicinePrescriptionResponse | ServicePrescriptionResponse | ReportResponse | UploadedDocumentResponse

export interface UploadDocumentRequest {
  file: File
}

export interface UploadResponse {
  success: boolean
  message: string
  documentId?: string
}

// Helper functions
function mapDocumentResponse(response: DocumentApiResponse): AnyDocument {  
  const baseDocument: Document = {
    id: response.id,
    title: response.title || getDocumentTypeLabel(response.type),
    description: response.metadata.summary || '--',
    date: response.issueDate,
    tags: response.metadata.tags || [],
    patientId: response.patientId,
    doctorId: response.doctorId
  }
  
  // Map to specific document types
  switch (response.type) {
    case 'medicine_prescription': {
      const medicinePrescription: MedicinePrescription = {
        ...baseDocument,
        type: 'medicine_prescription',
        validity: response.validity,
        dosage: response.dosage
      }
      return medicinePrescription
    }
    
    case 'service_prescription': {
      const servicePrescription: ServicePrescription = {
        ...baseDocument,
        type: 'service_prescription',
        validity: response.validity,
        serviceId: response.serviceId,
        facilityId: response.facilityId,
        priority: response.priority
      }
      return servicePrescription
    }
    
    case 'report': {
      const report: Report = {
        ...baseDocument,
        type: 'report',
        servicePrescription: mapDocumentResponse(response.servicePrescription) as ServicePrescription,
        executionDate: response.executionDate,
        clinicalQuestion: response.clinicalQuestion,
        findings: response.findings,
        conclusion: response.conclusion,
        recommendations: response.recommendations
      }
      return report
    }
    
    case 'uploaded_document': {
      // For uploaded documents, we just return the base document
      // as they don't have additional structured fields
      return baseDocument
    }

    default:
      return baseDocument
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(errorData.message || `Request failed with status ${response.status}`)
  }
  
  return response.json()
}

function getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'medicine_prescription':
      return 'Prescrizione Farmaci'
    case 'service_prescription':
      return 'Prescrizione Esami/Visite'
    case 'report':
      return 'Referto'
    default:
      return 'Documento'
  }
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

    const response = await fetch(`${BASE_URL}/api/patients/${patientId}/documents`, {
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

    const response = await fetch(`${BASE_URL}/api/patients/${patientId}/documents/upload`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      // Try to get error details from response
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`)
      // Attach the error code if available
      ;(error as any).code = errorData.code
      throw error
    }

    return await response.json()
  },

  /**
   * Get all documents for a patient
   */
  async getDocumentsByPatient(patientId: string): Promise<AnyDocument[]> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients/${patientId}/documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const documents = await handleResponse<DocumentApiResponse[]>(response)
      return documents.map(doc => mapDocumentResponse(doc))
    } catch (error) {
      console.error('[Documents API] Error fetching documents by patient:', error)
      throw error
    }
  },

  /**
   * Download a document PDF
   */
  async downloadDocument(patientId: string, documentId: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients/${patientId}/documents/${documentId}/pdf`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Get filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = 'document.pdf'

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('[Documents API] Error downloading document:', error)
      throw error
    }
  },

  /**
   * Download multiple documents as PDFs
   */
  async downloadMultipleDocuments(documents: { patientId: string; documentId: string; title?: string }[]): Promise<void> {
    try {
      for (const doc of documents) {
        await this.downloadDocument(doc.patientId, doc.documentId)
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } catch (error) {
      console.error('[Documents API] Error downloading multiple documents:', error)
      throw error
    }
  },

  /**
   * Get a specific document by ID
   */
  async getDocumentById(patientId: string, documentId: string): Promise<AnyDocument> {
    try {
      const response = await fetch(`${BASE_URL}/api/patients/${patientId}/documents/${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const document = await handleResponse<DocumentApiResponse>(response)
      return mapDocumentResponse(document)
    } catch (error) {
      console.error('[Documents API] Error fetching document by ID:', error)
      throw error
    }
  },

  /**
   * Get all documents issued by a specific doctor
   */
  async getDocumentsByDoctor(doctorId: string): Promise<AnyDocument[]> {
    const queryParams = new URLSearchParams()
    queryParams.append('doctorId', doctorId)
    const url = `${BASE_URL}/api/documents?${queryParams.toString()}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const documents = await handleResponse<DocumentApiResponse[]>(response)
      return documents.map(doc => mapDocumentResponse(doc))
    } catch (error) {
      console.error('[Documents API] Error fetching documents by doctor:', error)
      throw error
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    const url = `${BASE_URL}/documents/${documentId}`
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      return response.status === 200 || response.status === 204
    } catch (error) {
      console.error('[Documents API] Error deleting document:', error)
      throw error
    }
  },

  /**
   * Create a medicine prescription
   */
  async createMedicinePrescription(patientId: string, request: CreateMedicinePrescriptionRequest): Promise<MedicinePrescription> {
    const url = `${BASE_URL}/api/patients/${patientId}/documents`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `Request failed with status ${response.status}`)
      }
      
      const document = await response.json()
      return mapDocumentResponse(document) as MedicinePrescription
    } catch (error) {
      console.error('[Documents API] Error creating medicine prescription:', error)
      throw error
    }
  },

  /**
   * Create a service prescription
   */
  async createServicePrescription(patientId: string, request: CreateServicePrescriptionRequest): Promise<ServicePrescription> {
    const url = `${BASE_URL}/api/patients/${patientId}/documents`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `Request failed with status ${response.status}`)
      }
      
      const document = await response.json()
      return mapDocumentResponse(document) as ServicePrescription
    } catch (error) {
      console.error('[Documents API] Error creating service prescription:', error)
      throw error
    }
  }
}

// Backward compatibility alias
export const doctorDocumentsApi = documentsApiService
