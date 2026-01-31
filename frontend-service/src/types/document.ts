export interface Document {
  id: string
  title: string
  description: string
  tags: string[]
  date: string
  doctor?: string
  hospital?: string
  isPrescription?: boolean
  prescriptionCode?: string
  expirationDays?: number
  usedDate?: string
}

export type DocumentType = 'prescription' | 'report' | 'analysis' | 'visit' | 'diagnostic' | 'other'

export interface DocumentModal {
  document: Document | null;
  isOpen: boolean;
}

export interface DocumentCard {
  document: Document
  selectable?: boolean
  selected?: boolean
}

export interface DocumentViewer {
  document: Document | null;
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

export type PrescriptionStatus = 'valid' | 'expired' | 'used'

export interface BadgeColors {
  color: string
  bgColor: string
  borderColor: string
}

export interface DocumentSelector {
  selectedDocId: string | null;
  availableDocuments: Document[];
  placeholder?: string;
}

export interface BatchActions {
  selectedDocuments: Document[];
  totalDocuments: number;
}