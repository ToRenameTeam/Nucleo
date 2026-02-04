<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { DocumentPlusIcon, PlusIcon, CalendarIcon, ClockIcon, UserIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import Toast from '../../components/shared/Toast.vue'
import BaseCard from '../../components/shared/BaseCard.vue'
import DocumentCard from '../../components/shared/DocumentCard.vue'
import LoadingSpinner from '../../components/shared/LoadingSpinner.vue'
import DocumentModal from '../../components/patient/documents/DocumentModal.vue'
import UploadDocumentModal from '../../components/patient/documents/UploadDocumentModal.vue'
import ScheduleModal from '../../components/shared/ScheduleModal.vue'
import CardList from '../../components/shared/CardList.vue'
import type { Document } from '../../types/document'
import type { Appointment } from '../../types/appointment'
import type { CardMetadata } from '../../types/shared'
import { appointmentsApi } from '../../api/appointments'
import { documentsApiService } from '../../api/documents'
import { parseItalianDateSlash, setTimeOnDate } from '../../utils/dateUtils'
import { formatCategory } from '../../utils/formatters'
import { getBadgeColors, getBadgeIcon } from '../../utils/badgeHelpers'
import { useI18n } from 'vue-i18n'

useI18n()
const { currentUser } = useAuth()

const appointmentsData = ref<Appointment[]>([])
const documentsData = ref<Document[]>([])
const isLoading = ref(false)

function parseAppointmentDateTime(appointment: Appointment): Date | null {
  const date = parseItalianDateSlash(appointment.date)
  if (!date) return null
  return setTimeOnDate(new Date(date), appointment.time)
}

const upcomingAppointments = computed(() => {
  const now = new Date()
  
  return appointmentsData.value
    .filter(appointment => {
      const appointmentDate = parseAppointmentDateTime(appointment)
      return appointmentDate && appointmentDate > now
    })
    .sort((a, b) => {
      const dateA = parseAppointmentDateTime(a)
      const dateB = parseAppointmentDateTime(b)
      
      if (!dateA || !dateB) return 0
      
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3)
})

const recentDocuments = computed(() => documentsData.value.slice(0, 2))
const selectedDocument = ref<Document | null>(null)
const isDocumentModalOpen = ref(false)
const showSuccessToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Booking modal states
const isBookingModalOpen = ref(false)
const selectedDoctorId = ref<string>('doc-123') // TODO: Implementare selezione medico

// Upload refs
const isUploadModalOpen = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

async function loadData() {
  if (!currentUser.value?.userId) {
    console.log('[PatientHomePage] No current user ID available')
    return
  }

  isLoading.value = true
  
  try {
    const [fetchedAppointments, fetchedDocuments] = await Promise.all([
      appointmentsApi.getAppointmentsByPatient(currentUser.value.userId),
      documentsApiService.getDocumentsByPatient(currentUser.value.userId)
    ])
    
    appointmentsData.value = fetchedAppointments
    documentsData.value = fetchedDocuments
  } catch (err) {
    console.error('[PatientHomePage] Error loading data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})

const handleUpload = () => {
  // Trigger file input click
  fileInputRef.value?.click()
}

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  if (file.type !== 'application/pdf') {
    toastMessage.value = 'upload.invalidFileType'
    toastType.value = 'error'
    showSuccessToast.value = true
    return
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    toastMessage.value = 'upload.fileTooLarge'
    toastType.value = 'error'
    showSuccessToast.value = true
    return
  }

  selectedFile.value = file
  isUploadModalOpen.value = true

  // Reset input value to allow re-selecting the same file
  if (target) {
    target.value = ''
  }
}

const handleUploadConfirm = async () => {
  if (!selectedFile.value || !currentUser.value?.userId) return

  isUploading.value = true

  try {
    await documentsApiService.uploadDocument(currentUser.value.userId, selectedFile.value)

    // Close modal
    isUploadModalOpen.value = false
    selectedFile.value = null

    // Show success toast
    toastMessage.value = 'upload.success'
    toastType.value = 'success'
    showSuccessToast.value = true

    // Reload documents to show the newly uploaded one
    await loadData()
  } catch (error: any) {
    console.error('[PatientHomePage] Error uploading document:', error)

    // Close modal on error
    isUploadModalOpen.value = false
    selectedFile.value = null

    // Check if it's a non-medical document error
    if (error.message && error.message.includes('does not appear to be a medical document')) {
      toastMessage.value = 'upload.nonMedicalDocument'
    } else {
      toastMessage.value = 'upload.error'
    }

    toastType.value = 'error'
    showSuccessToast.value = true
  } finally {
    isUploading.value = false
  }
}

const handleUploadCancel = () => {
  isUploadModalOpen.value = false
  selectedFile.value = null
}

function handleOpenBooking() {
  isBookingModalOpen.value = true
}

function handleCloseBooking() {
  isBookingModalOpen.value = false
}

async function handleBookingConfirmed(availabilityId: string) {
  if (!currentUser.value?.userId) return
  
  try {
    await appointmentsApi.createAppointment(currentUser.value.userId, availabilityId)
    
    toastMessage.value = 'toast.bookingConfirmed'
    toastType.value = 'success'
    showSuccessToast.value = true
    
    isBookingModalOpen.value = false
    
    // Ricarica appuntamenti
    await loadData()
  } catch (error) {
    console.error('[PatientHomePage] Error booking appointment:', error)
    toastMessage.value = 'Errore durante la prenotazione'
    toastType.value = 'error'
    showSuccessToast.value = true
  }
}

const handleAppointmentClick = (id: string) => {
  console.log('Appointment clicked:', id)
}

// Get metadata for appointment card
function getAppointmentMetadata(appointment: Appointment): CardMetadata[] {
  const meta: CardMetadata[] = [
    { icon: CalendarIcon, label: appointment.date }
  ]
  
  if (appointment.time) {
    meta.push({ icon: ClockIcon, label: appointment.time })
  }
  
  if (appointment.user) {
    meta.push({ icon: UserIcon, label: appointment.user })
  }
  
  if (appointment.location) {
    meta.push({ icon: MapPinIcon, label: appointment.location })
  }
  
  return meta
}

const handleDocumentClick = (document: Document) => {
  selectedDocument.value = document
  isDocumentModalOpen.value = true
}

const handleCloseDocumentModal = () => {
  isDocumentModalOpen.value = false
  setTimeout(() => {
    selectedDocument.value = null
  }, 300)
}

const handleCloseToast = () => {
  showSuccessToast.value = false
  toastMessage.value = ''
  toastType.value = 'success'
}
</script>

<template>
  <div class="home-page">
    <div class="content-grid">
      <div class="main-column">

        <div class="quick-actions">
          <div class="quick-actions-flex">
            <button 
              @click="handleUpload"
              class="quick-action-btn quick-action-btn-flex"
            >
              <DocumentPlusIcon class="quick-action-icon" />
              <span>{{ $t('home.uploadDocument') }}</span>
            </button>
            <button 
              @click="handleOpenBooking"
              class="quick-action-btn quick-action-btn-flex"
            >
              <PlusIcon class="quick-action-icon" />
              <span>{{ $t('home.newAppointment') }}</span>
            </button>
          </div>
        </div>

        <div class="section-card">
          <h3 class="section-title">{{ $t('home.upcomingAppointments') }}</h3>
          
          <!-- Loading State -->
          <LoadingSpinner 
            v-if="isLoading" 
            :message="$t('home.loadingAppointments')" 
            size="medium"
          />
          
          <!-- Empty State -->
          <div v-else-if="upcomingAppointments.length === 0" class="empty-card-message">
            {{ $t('home.noAppointments') }}
          </div>
          
          <!-- Appointments List -->
          <CardList v-else>
            <BaseCard
              v-for="appointment in upcomingAppointments"
              :key="appointment.id"
              :title="appointment.title"
              :description="appointment.description"
              :icon="CalendarIcon"
              :metadata="getAppointmentMetadata(appointment)"
              @click="handleAppointmentClick(appointment.id)"
            >
              <template v-if="appointment.category && appointment.category.length > 0" #badges>
                <div class="badges-row">
                  <div 
                    v-for="cat in appointment.category"
                    :key="cat"
                    class="appointment-badge" 
                    :style="{
                      color: getBadgeColors(cat).color,
                      backgroundColor: getBadgeColors(cat).bgColor,
                      borderColor: getBadgeColors(cat).borderColor
                    }"
                  >
                    <span class="badge-icon">{{ getBadgeIcon(cat) }}</span>
                    <span class="badge-label">{{ formatCategory(cat) }}</span>
                  </div>
                </div>
              </template>
            </BaseCard>
          </CardList>
        </div>

        <div class="section-card section-card-spacing">
          <h3 class="section-title">{{ $t('home.recentDocuments') }}</h3>
          <CardList>
            <DocumentCard
              v-for="doc in recentDocuments.slice(0, 2)"
              :key="doc.id"
              :document="doc"
              @click="handleDocumentClick(doc)"
            />
          </CardList>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="application/pdf"
      style="display: none"
      @change="handleFileSelected"
    />

    <!-- Upload Document Modal -->
    <UploadDocumentModal
      :is-open="isUploadModalOpen"
      :file="selectedFile"
      @close="handleUploadCancel"
      @confirm="handleUploadConfirm"
    />

    <!-- Booking Modal -->
    <ScheduleModal
      :is-open="isBookingModalOpen"
      mode="select"
      :doctor-id="selectedDoctorId"
      title="patient.booking.title"
      subtitle="patient.booking.subtitle"
      @close="handleCloseBooking"
      @select-availability="handleBookingConfirmed"
    />

    <!-- Document Modal (Teleported to body) -->
    <Teleport to="body">
      <DocumentModal
        :document="selectedDocument"
        :is-open="isDocumentModalOpen"
        @close="handleCloseDocumentModal"
      />
    </Teleport>

    <!-- Success Toast -->
    <Toast
      :show="showSuccessToast"
      :type="toastType"
      :message="$t(toastMessage || 'toast.bookingConfirmed')"
      :duration="4000"
      @close="handleCloseToast"
    />
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100%;
  width: 100%;
  overflow-x: hidden;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.home-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--sky-0ea5e9-20) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--purple-a855f7-20) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.content-grid {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  align-items: start;
  position: relative;
  z-index: 1;
}

.main-column {
  display: flex;
  flex-direction: column;
}

.section-card {
  padding: 1.25rem;
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-fill-mode: both;
}

.quick-actions-flex {
  display: flex;
  gap: 1rem;
}

.quick-action-btn-flex {
  flex: 1 1 0%;
  min-width: 0;
}

.quick-action-icon {
  width: 1.75rem;
  height: 1.75rem;
}

.quick-actions {
  padding: 1.25rem;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.empty-card-message {
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem 0;
  font-size: 1rem;
  background: var(--bg-secondary-40);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.appointment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1.5px solid;
  border-radius: 0.75rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 600;
  font-size: 0.8125rem;
  box-shadow: 0 2px 8px var(--badge-shadow), inset 0 1px 0 var(--white-40);
  width: fit-content;
  animation: fadeInScale 0.4s cubic-bezier(0, 0, 0.2, 1);
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.badge-label {
  font-weight: 600;
  letter-spacing: 0.01em;
  font-size: 0.8125rem;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 1023px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 1rem;
  }

  .section-card {
    padding: 1rem;
  }
  
  .quick-actions {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 0.75rem;
  }
  .section-card {
    padding: 0.875rem;
  }
  .section-card h3 {
    font-size: 1.5rem;
  }
  .quick-actions {
    margin: 0.5rem 0;
  }
  .quick-actions-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  .quick-action-btn-flex {
    width: 100%;
    flex: unset;
    padding: 0.875rem 1rem;
  }
}

.quick-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  background: var(--white-60);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-50);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 4px 16px var(--black-8), inset 0 1px 0 var(--white-80);
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  background: var(--white-80);
  box-shadow: 0 8px 24px var(--black-12), inset 0 1px 0 var(--white-90);
}

.section-title {
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--section-title-color);
  margin-bottom: 1rem;
}
</style>
