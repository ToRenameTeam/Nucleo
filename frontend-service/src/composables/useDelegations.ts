import { ref } from 'vue'
import { delegationApi } from '../api/delegations'
import { authApi, userApi } from '../api/users'
import type { DelegationItem } from '../types/delegation'

export function useDelegations() {
  const delegations = ref<DelegationItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadDelegations = async (
    userId: string, 
    type: 'received' | 'sent'
  ): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      const apiCall = type === 'received' 
        ? delegationApi.getReceivedDelegations 
        : delegationApi.getSentDelegations
      
      const response = await apiCall(userId)
      
      const items = await Promise.all(
        response.delegations.map(async (delegation) => {
          const targetUserId = type === 'received' 
            ? delegation.delegatorUserId 
            : delegation.delegatingUserId
          
          try {
            const userData = await authApi.getUserById(targetUserId)
            
            return {
              delegationId: delegation.delegationId,
              userId: targetUserId,
              name: userData.name,
              lastName: userData.lastName,
              fiscalCode: userData.fiscalCode,
              date: delegation.createdAt || '',
              status: delegation.status
            } as DelegationItem
          } catch (err) {
            console.error(`Error loading user ${targetUserId}:`, err)
            return null
          }
        })
      )
      
      delegations.value = items.filter((item): item is DelegationItem => item !== null)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load delegations'
      delegations.value = []
    } finally {
      isLoading.value = false
    }
  }

  const acceptDelegation = async (
    delegationId: string, 
    userId: string
  ): Promise<boolean> => {
    try {
      await delegationApi.acceptDelegation(delegationId, userId)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to accept delegation'
      return false
    }
  }

  const declineDelegation = async (
    delegationId: string, 
    userId: string
  ): Promise<boolean> => {
    try {
      await delegationApi.declineDelegation(delegationId, userId)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to decline delegation'
      return false
    }
  }

  const removeDelegation = async (
    delegationId: string, 
    userId: string
  ): Promise<boolean> => {
    try {
      await delegationApi.deleteDelegation(delegationId, userId)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove delegation'
      return false
    }
  }

  const countDelegations = async (
    userId: string
  ): Promise<{ received: number; sent: number }> => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        delegationApi.getReceivedDelegations(userId),
        delegationApi.getSentDelegations(userId)
      ])
      
      return {
        received: receivedResponse.delegations.length,
        sent: sentResponse.delegations.length
      }
    } catch (err) {
      console.error('Error counting delegations:', err)
      return { received: 0, sent: 0 }
    }
  }

  const createDelegation = async (
    fiscalCode: string,
    currentUserId: string
  ): Promise<{ success: boolean; userName?: string; error?: string }> => {
    isLoading.value = true
    error.value = null
    
    try {
      const foundUser = await userApi.searchUserByFiscalCode(fiscalCode)
      
      await delegationApi.createDelegation({
        delegatingUserId: foundUser.userId,
        delegatorUserId: currentUserId
      })
      
      return {
        success: true,
        userName: `${foundUser.name} ${foundUser.lastName}`
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create delegation'
      error.value = errorMessage
      return { 
        success: false,
        error: errorMessage
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    delegations,
    isLoading,
    error,
    
    loadDelegations,
    acceptDelegation,
    declineDelegation,
    removeDelegation,
    countDelegations,
    createDelegation
  }
}