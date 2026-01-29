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