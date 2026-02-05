import type { Document, MedicinePrescription, ServicePrescription, Report, AnyDocument, Validity, Dosage } from '../types/document'
import { DOCUMENTS_API_URL } from './config'

const BASE_URL = DOCUMENTS_API_URL
const DOCUMENTS_BASE_URL = `${DOCUMENTS_API_URL}/api/documents`

// Validity types for API requests (using _t as discriminator)
interface ValidityUntilDate {
  _t: 'until_date'
  date: string
}

interface ValidityUntilExecution {
  _t: 'until_execution'
}

type ValidityRequest = ValidityUntilDate | ValidityUntilExecution

// API Request types (using _t as class discriminator for Kotlin backend)
interface CreateMedicinePrescriptionRequest {
  _t: 'medicine_prescription'
  doctorId: string
  title?: string
  metadata: {
    summary: string
    tags: string[]
  }
  validity: ValidityRequest
  dosage: Dosage
}

interface CreateServicePrescriptionRequest {
  _t: 'service_prescription'
  doctorId: string
  title?: string
  metadata: {
    summary: string
    tags: string[]
  }
  validity: ValidityRequest
  serviceId: string
  facilityId: string
  priority: string
}

// API Response types
interface FileMetadata {
  summary: string
  tags: string[]
}

interface BaseDocumentResponse {
  id: string
  doctorId: string
  patientId: string
  issueDate: string
  metadata: FileMetadata
}

interface MedicinePrescriptionResponse extends BaseDocumentResponse {
  type: 'medicine_prescription'
  validity: Validity
  dosage: Dosage
}

interface ServicePrescriptionResponse extends BaseDocumentResponse {
  type: 'service_prescription'
  validity: Validity
  serviceId: string
  facilityId: string
  priority: string
}

interface ReportResponse extends BaseDocumentResponse {
  type: 'report'
  servicePrescription: ServicePrescriptionResponse
  executionDate: string
  clinicalQuestion?: string
  findings: string
  conclusion?: string
  recommendations?: string
}

type DocumentResponse = MedicinePrescriptionResponse | ServicePrescriptionResponse | ReportResponse

function mapDocumentResponse(response: DocumentResponse): AnyDocument {  
  const baseDocument: Document = {
    id: response.id,
    title: response.metadata.summary || getDocumentTypeLabel(response.type),
    description: response.metadata.summary || '',
    date: response.issueDate,
    tags: response.metadata.tags || []
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

/**
 * Get a human-readable label for document type
 */
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

export const doctorDocumentsApi = {
  /**
   * Get all documents issued by a specific doctor
   */
  async getDocumentsByDoctor(doctorId: string): Promise<AnyDocument[]> {
    console.log('[Doctor Documents API] Get documents by doctor:', doctorId)
    
    const queryParams = new URLSearchParams()
    queryParams.append('doctorId', doctorId)
    const url = `${DOCUMENTS_BASE_URL}?${queryParams.toString()}`
    console.log('[Doctor Documents API] Fetch call to:', url)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('[Doctor Documents API] Response status:', response.status, response.statusText)
      
      const documents = await handleResponse<DocumentResponse[]>(response)
      console.log('[Doctor Documents API] Data received:', documents.length, 'documents')
      
      const mappedDocuments = documents.map(doc => mapDocumentResponse(doc))
      console.log('[Doctor Documents API] Mapped documents:', mappedDocuments.length, 'items')
      
      return mappedDocuments
    } catch (error) {
      console.error('[Doctor Documents API] Error fetching documents by doctor:', error)
      throw error
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    console.log('[Doctor Documents API] Delete document:', documentId)
    
    const url = `${BASE_URL}/documents/${documentId}`
    console.log('[Doctor Documents API] Delete call to:', url)
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('[Doctor Documents API] Response status:', response.status, response.statusText)
      
      return response.status === 200 || response.status === 204
    } catch (error) {
      console.error('[Doctor Documents API] Error deleting document:', error)
      throw error
    }
  },

  /**
   * Create a medicine prescription
   */
  async createMedicinePrescription(patientId: string, request: CreateMedicinePrescriptionRequest): Promise<MedicinePrescription> {
    console.log('[Doctor Documents API] Create medicine prescription for patient:', patientId)
    
    const url = `${BASE_URL}/api/patients/${patientId}/documents`
    console.log('[Doctor Documents API] POST call to:', url)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      console.log('[Doctor Documents API] Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `Request failed with status ${response.status}`)
      }
      
      const document = await response.json()
      console.log('[Doctor Documents API] Medicine prescription created:', document.id)
      
      return mapDocumentResponse(document) as MedicinePrescription
    } catch (error) {
      console.error('[Doctor Documents API] Error creating medicine prescription:', error)
      throw error
    }
  },

  /**
   * Create a service prescription
   */
  async createServicePrescription(patientId: string, request: CreateServicePrescriptionRequest): Promise<ServicePrescription> {
    console.log('[Doctor Documents API] Create service prescription for patient:', patientId)
    
    const url = `${BASE_URL}/api/patients/${patientId}/documents`
    console.log('[Doctor Documents API] POST call to:', url)
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      console.log('[Doctor Documents API] Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errorData.message || `Request failed with status ${response.status}`)
      }
      
      const document = await response.json()
      console.log('[Doctor Documents API] Service prescription created:', document.id)
      
      return mapDocumentResponse(document) as ServicePrescription
    } catch (error) {
      console.error('[Doctor Documents API] Error creating service prescription:', error)
      throw error
    }
  }
}
