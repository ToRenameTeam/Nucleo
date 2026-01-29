export interface DelegationInfo {
  delegationId: string
  delegatorUserId: string
  ownerInfo: {
    userId: string
  } | null
}

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
  status: 'Pending' | 'Active' | 'Declined' | 'Deleted'
}

export interface DelegationsListModal {
  isOpen: boolean
  type: 'received' | 'sent'
  delegations: DelegationItem[]
}