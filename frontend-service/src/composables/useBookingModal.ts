import { ref } from 'vue'

// Shared state for booking modal
const isBookingModalOpen = ref(false)
const preselectedVisitType = ref<string | null>(null)

/**
 * Composable to manage booking modal state across different pages
 * This allows opening the booking modal from any page (e.g., documents page)
 * while keeping the modal component in the home page
 */
export function useBookingModal() {
  const openBookingModal = (visitType: string | null = null) => {
    preselectedVisitType.value = visitType
    isBookingModalOpen.value = true
    console.log('[useBookingModal] Opening booking modal with preselected visit:', visitType)
  }

  const closeBookingModal = () => {
    isBookingModalOpen.value = false
    // Reset preselected visit after a delay to allow modal close animation
    setTimeout(() => {
      preselectedVisitType.value = null
    }, 300)
  }

  return {
    isBookingModalOpen,
    preselectedVisitType,
    openBookingModal,
    closeBookingModal
  }
}
