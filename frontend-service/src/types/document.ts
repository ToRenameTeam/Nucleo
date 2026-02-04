export interface Document {
  id: string
  title: string
  description: string
  tags: string[]
  date: string
  patientId?: string
  doctorId?: string
  doctor?: string
  hospital?: string
}

export interface ValidityUntilDate {
  type: 'until_date'
  date: string
}

export interface ValidityUntilExecution {
  type: 'until_execution'
}

export type Validity = ValidityUntilDate | ValidityUntilExecution

export interface Dose {
  amount: number
  unit: string
}

export interface Frequency {
  timesPerPeriod: number
  period: string
}

export interface Duration {
  length: number
  unit: string
}

export interface Dosage {
  medicineId: string
  dose: Dose
  frequency: Frequency
  duration: Duration
}

// Specific document types
export interface MedicinePrescription extends Document {
  type: 'medicine_prescription'
  validity: Validity
  dosage: Dosage
}

export interface ServicePrescription extends Document {
  type: 'service_prescription'
  validity: Validity
  serviceId: string
  facilityId: string
  priority: string
}

export interface Report extends Document {
  type: 'report'
  servicePrescription: ServicePrescription
  executionDate: string
  clinicalQuestion?: string
  findings: string
  conclusion?: string
  recommendations?: string
}

// Union type for all document types
export type AnyDocument = Document | MedicinePrescription | ServicePrescription | Report 

export type DocumentType = 'prescription' | 'report' | 'analysis' | 'visit' | 'diagnostic' | 'other'

export interface DocumentModal {
  document: AnyDocument | null;
  isOpen: boolean;
}

export interface DocumentCard {
  document: AnyDocument
  selectable?: boolean
  selected?: boolean
}

export interface DocumentViewer {
  document: AnyDocument | null;
  currentPageIndex: number;
  showPanel?: boolean;
  previewHeight?: string;
}

export interface DocumentCategory {
  type: DocumentType
  label: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
}

export interface BadgeColors {
  color: string
  bgColor: string
  borderColor: string
}

export interface DocumentSelector {
  selectedDocId: string | null;
  availableDocuments: AnyDocument[];
  placeholder?: string;
}

export interface BatchActions {
  selectedDocuments: AnyDocument[];
  totalDocuments: number;
}