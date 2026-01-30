export interface DelegationInfo {
  delegationId: string
  delegatorUserId: string
  ownerInfo: {
    userId: string
  } | null
}

export type DelegationStatus = 'Pending' | 'Active' | 'Declined' | 'Deleted'

export interface DelegationsResponse {
  delegations: DelegationInfo[]
}

export interface DelegationsMenuModal {
  isOpen: boolean
  receivedCount?: number
  sentCount?: number
}

export interface NewDelegationModal {
  isOpen: boolean
}

export interface DelegationItem {
  delegationId: string
  userId: string
  name: string
  lastName: string
  fiscalCode: string
  date: string
  status: DelegationStatus
}

export interface DelegationsListModal {
  isOpen: boolean
  type: 'received' | 'sent'
  delegations: DelegationItem[]
}

export interface CreateDelegationRequest {
  delegatingUserId: string
  delegatorUserId: string
}

export interface CreateDelegationResponse {
  delegationId: string
  delegatingUserId: string
  delegatorUserId: string
  status: string
}

export interface DelegationResponse {
  delegationId: string
  delegatingUserId: string
  delegatorUserId: string
  status: DelegationStatus
  createdAt: string
}

export interface DelegationsListResponse {
  delegations: DelegationResponse[]
}

export interface AcceptDeclineResponse {
  delegationId: string
  status: string
}