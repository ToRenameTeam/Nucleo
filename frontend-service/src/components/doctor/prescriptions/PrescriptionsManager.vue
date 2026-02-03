<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '../../../composables/useAuth'
import { PlusIcon } from '@heroicons/vue/24/outline'
import PrescriptionsMenuModal from './PrescriptionsMenuModal.vue'
import MedicinePrescriptionModal from './MedicinePrescriptionForm.vue'
import ServicePrescriptionModal from './ServicePrescriptionForm.vue'
import Toast from '../../shared/Toast.vue'
import { userApi, type UserInfo } from '../../../api/users'
import { doctorDocumentsApi } from '../../../api/doctorDocuments'

const { t } = useI18n()

const { currentUser } = useAuth()

const isPrescriptionsMenuOpen = ref(false)
const isMedicinePrescriptionModalOpen = ref(false)
const isServicePrescriptionModalOpen = ref(false)

const showSuccessToast = ref(false)
const successToastMessage = ref('')

const prescriptionSaveError = ref('')

const isSaving = ref(false)
const isLoadingUsers = ref(false)

const allUsers = ref<UserInfo[]>([])

const openPrescriptionsMenu = () => {
  isPrescriptionsMenuOpen.value = true
}

const closePrescriptionsMenu = () => {
  isPrescriptionsMenuOpen.value = false
}
const handleMedicinePrescription = () => {
  closePrescriptionsMenu()
  isMedicinePrescriptionModalOpen.value = true
}

const closeMedicinePrescriptionModal = () => {
  isMedicinePrescriptionModalOpen.value = false
  prescriptionSaveError.value = ''
}

const handleBackFromMedicinePrescription = () => {
  isMedicinePrescriptionModalOpen.value = false
  prescriptionSaveError.value = ''
  isPrescriptionsMenuOpen.value = true
}
const handleServicePrescription = () => {
  closePrescriptionsMenu()
  isServicePrescriptionModalOpen.value = true
}

const closeServicePrescriptionModal = () => {
  isServicePrescriptionModalOpen.value = false
  prescriptionSaveError.value = ''
}

const handleBackFromServicePrescription = () => {
  isServicePrescriptionModalOpen.value = false
  prescriptionSaveError.value = ''
  isPrescriptionsMenuOpen.value = true
}

const handleSaveMedicinePrescription = async (prescription: any) => {
  prescriptionSaveError.value = ''
  isSaving.value = true
  
  try {
    const doctorId = currentUser.value?.userId
    
    if (!doctorId) {
      throw new Error('Doctor ID not found')
    }
    
    const dosageParts = prescription.dosage?.split(' ') || ['1', 'mg']
    const frequencyParts = prescription.frequency?.split(' ') || ['1', 'day']
    const durationParts = prescription.duration?.split(' ') || ['7', 'day']
    
    const request = {
      type: 'medicine_prescription' as const,
      doctorId,
      metadata: {
        summary: t('prescriptionSummary.medicine', { medicine: prescription.medicineName }),
        tags: [t('prescriptionTags.prescription'), t('prescriptionTags.medicines')]
      },
      validity: {
        type: 'until_date' as const,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      dosage: {
        medicineId: prescription.medicineName,
        dose: {
          amount: parseInt(dosageParts[0]) || 1,
          unit: dosageParts[1] || 'mg'
        },
        frequency: {
          timesPerPeriod: parseInt(frequencyParts[0]) || 1,
          period: frequencyParts[1] || 'day'
        },
        duration: {
          length: parseInt(durationParts[0]) || 7,
          unit: durationParts[1] || 'day'
        }
      }
    }
    
    await doctorDocumentsApi.createMedicinePrescription(prescription.userId, request)
    
    isMedicinePrescriptionModalOpen.value = false
    successToastMessage.value = t('doctor.documents.prescriptions.toast.medicineSaved')
    showSuccessToast.value = true
    
    // Emit event to update the list of prescriptions
    window.dispatchEvent(new CustomEvent('prescriptions-updated'))
  } catch (error) {
    prescriptionSaveError.value = t('doctor.documents.prescriptions.errors.saveFailed')
    console.error('Error saving medicine prescription:', error)
  } finally {
    isSaving.value = false
  }
}

const handleSaveServicePrescription = async (prescription: any) => {
  prescriptionSaveError.value = ''
  isSaving.value = true
  
  try {
    const doctorId = currentUser.value?.userId
    
    if (!doctorId) {
      throw new Error('Doctor ID not found')
    }
    
    const request = {
      type: 'service_prescription' as const,
      doctorId,
      metadata: {
        summary: t('prescriptionSummary.service', { service: prescription.serviceType }),
        tags: [t('prescriptionTags.prescription'), t('prescriptionTags.services')]
      },
      validity: {
        type: 'until_execution' as const
      },
      serviceId: prescription.serviceType,
      facilityId: t('facilities.default'),
      priority: prescription.urgency
    }
    
    await doctorDocumentsApi.createServicePrescription(prescription.userId, request)
    
    isServicePrescriptionModalOpen.value = false
    successToastMessage.value = t('doctor.documents.prescriptions.toast.serviceSaved')
    showSuccessToast.value = true
    
    window.dispatchEvent(new CustomEvent('prescriptions-updated'))
  } catch (error) {
    prescriptionSaveError.value = t('doctor.documents.prescriptions.errors.saveFailed')
    console.error('Error saving service prescription:', error)
  } finally {
    isSaving.value = false
  }
}

const handleCloseToast = () => {
  showSuccessToast.value = false
}

// Load users on mount
onMounted(async () => {
  isLoadingUsers.value = true
  try {
    allUsers.value = await userApi.getAllUsers()
    console.log('Loaded users:', allUsers.value.length)
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    isLoadingUsers.value = false
  }
})
</script>

<template>
  <div class="prescriptions-manager">
    <button class="add-prescription-btn" @click="openPrescriptionsMenu">
      <PlusIcon class="btn-icon" />
      {{ t('doctor.documents.prescriptions.addPrescription') }}
    </button>

    <PrescriptionsMenuModal
      :is-open="isPrescriptionsMenuOpen"
      @close="closePrescriptionsMenu"
      @medicine-prescription="handleMedicinePrescription"
      @service-prescription="handleServicePrescription"
    />

    <MedicinePrescriptionModal
      :is-open="isMedicinePrescriptionModalOpen"
      :save-error="prescriptionSaveError"
      :is-saving="isSaving"
      :is-loading-users="isLoadingUsers"
      :users="allUsers"
      @close="closeMedicinePrescriptionModal"
      @back="handleBackFromMedicinePrescription"
      @save="handleSaveMedicinePrescription"
    />

    <ServicePrescriptionModal
      :is-open="isServicePrescriptionModalOpen"
      :save-error="prescriptionSaveError"
      :is-saving="isSaving"
      :is-loading-users="isLoadingUsers"
      :users="allUsers"
      @close="closeServicePrescriptionModal"
      @back="handleBackFromServicePrescription"
      @save="handleSaveServicePrescription"
    />

    <Toast
      :show="showSuccessToast"
      :message="successToastMessage"
      :duration="4000"
      type="success"
      @close="handleCloseToast"
    />
  </div>
</template>

<style scoped>
.prescriptions-manager {
  display: inline-block;
}

.add-prescription-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  border: 1px solid var(--white-20);
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px var(--black-15);
}

.add-prescription-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-40);
}

.add-prescription-btn:active {
  transform: translateY(0);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}

@media (max-width: 768px) {
  .add-prescription-btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }

  .btn-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}
</style>