<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import SearchBar from '../../components/shared/SearchBar.vue'
import DocumentCard from '../../components/shared/DocumentCard.vue'
import CardList from '../../components/shared/CardList.vue'
import DocumentModal from '../../components/patient/documents/DocumentModal.vue'
import MedicinePrescriptionDetails from '../../components/doctor/document-details/MedicinePrescriptionDetails.vue'
import TagBar from '../../components/shared/TagBar.vue'
import { userApi, type UserInfo } from '../../api/users'
import { documentsApiService } from '../../api/documents'
import type { AnyDocument, MedicinePrescription } from '../../types/document'
import type { Tag } from '../../types/tag'
import { parseItalianDate } from '../../utils/dateUtils'

const { t } = useI18n()
const router = useRouter()

// Loading states
const isLoading = ref(false)
const isLoadingDocuments = ref(false)
const loadError = ref<string | null>(null)

// Data
const allPatients = ref<UserInfo[]>([])
const patientDocuments = ref<AnyDocument[]>([])

// UI state
const searchQuery = ref('')
const selectedPatient = ref<UserInfo | null>(null)
const selectedDocument = ref<AnyDocument | null>(null)
const isModalOpen = ref(false)
const selectedTags = ref<string[]>([])

// Type guard functions
const isMedicinePrescription = (doc: AnyDocument): doc is MedicinePrescription => {
  return 'type' in doc && doc.type === 'medicine_prescription'
}

const isServicePrescription = (doc: AnyDocument): boolean => {
  return 'type' in doc && doc.type === 'service_prescription'
}

const isReport = (doc: AnyDocument): boolean => {
  return 'type' in doc && doc.type === 'report'
}

// Load patients on mount
onMounted(async () => {
  await loadPatients()
})

const loadPatients = async () => {
  isLoading.value = true
  loadError.value = null

  try {
    const users = await userApi.getAllUsers()
    // Filter only users who have a patient profile
    allPatients.value = users.filter(user => user.patient)
    console.log('[DoctorPatientsPage] Loaded', allPatients.value.length, 'patients')
  } catch (error) {
    console.error('[DoctorPatientsPage] Error loading patients:', error)
    loadError.value = t('doctor.patients.errorLoading')
  } finally {
    isLoading.value = false
  }
}

const loadPatientDocuments = async (patientId: string) => {
  isLoadingDocuments.value = true

  try {
    const documents = await documentsApiService.getDocumentsByPatient(patientId)
    patientDocuments.value = documents
    console.log('[DoctorPatientsPage] Loaded', documents.length, 'documents for patient', patientId)
  } catch (error) {
    console.error('[DoctorPatientsPage] Error loading patient documents:', error)
    patientDocuments.value = []
  } finally {
    isLoadingDocuments.value = false
  }
}

// Computed properties
const filteredPatients = computed(() => {
  let patients = allPatients.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    patients = patients.filter(patient => {
      const fullName = `${patient.name} ${patient.lastName}`.toLowerCase()
      const reverseName = `${patient.lastName} ${patient.name}`.toLowerCase()
      const fiscalCode = patient.fiscalCode.toLowerCase()

      return fullName.includes(query) ||
             reverseName.includes(query) ||
             fiscalCode.includes(query) ||
             patient.name.toLowerCase().includes(query) ||
             patient.lastName.toLowerCase().includes(query)
    })
  }

  // Sort by last name
  return patients.sort((a, b) => a.lastName.localeCompare(b.lastName, 'it'))
})

// Group patients by first letter of last name (alphabetic directory)
interface PatientGroup {
  letter: string
  patients: UserInfo[]
}

const groupedPatients = computed<PatientGroup[]>(() => {
  const groups: Map<string, UserInfo[]> = new Map()
  
  for (const patient of filteredPatients.value) {
    const firstLetter = patient.lastName.charAt(0).toUpperCase()
    if (!groups.has(firstLetter)) {
      groups.set(firstLetter, [])
    }
    groups.get(firstLetter)!.push(patient)
  }
  
  // Convert to array and sort by letter
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'it'))
    .map(([letter, patients]) => ({ letter, patients }))
})

// Get all available letters for quick navigation
const availableLetters = computed(() => {
  return groupedPatients.value.map(group => group.letter)
})

// Computed tags for documents
const tags = computed<Tag[]>(() => {
  const reportCount = patientDocuments.value.filter(d => isReport(d)).length
  const medicinePrescriptionCount = patientDocuments.value.filter(d => isMedicinePrescription(d)).length
  const servicePrescriptionCount = patientDocuments.value.filter(d => isServicePrescription(d)).length

  return [
    { id: 'all', label: t('doctor.documents.categories.all'), count: patientDocuments.value.length },
    { id: 'report', label: t('doctor.documents.categories.reports'), count: reportCount },
    { id: 'medicine_prescription', label: t('doctor.documents.categories.medicinePrescriptions'), count: medicinePrescriptionCount },
    { id: 'service_prescription', label: t('doctor.documents.categories.servicePrescriptions'), count: servicePrescriptionCount }
  ]
})

const filteredDocuments = computed(() => {
  let filtered = patientDocuments.value

  if (selectedTags.value.length > 0 && !selectedTags.value.includes('all')) {
    filtered = filtered.filter(doc => {
      if (!('type' in doc)) return false
      return selectedTags.value.some(selectedTag => doc.type === selectedTag)
    })
  }

  // Sort by newest first
  filtered.sort((a, b) => {
    const dateA = parseItalianDate(a.date)
    const dateB = parseItalianDate(b.date)
    if (!dateA || !dateB) return 0
    return dateB.getTime() - dateA.getTime()
  })

  return filtered
})

const activeTags = computed(() => {
  if (selectedTags.value.length === 0) {
    return ['all']
  }
  return selectedTags.value
})

// Format date of birth for display
const formatDateOfBirth = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

// Calculate age from date of birth
const calculateAge = (dateStr: string): number => {
  try {
    const birthDate = new Date(dateStr)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  } catch {
    return 0
  }
}

// Event handlers
const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handlePatientClick = async (patient: UserInfo) => {
  selectedPatient.value = patient
  selectedTags.value = []
  
  // Update URL with patient fiscal code for breadcrumb
  router.replace({
    query: { patient: patient.fiscalCode }
  })
  
  await loadPatientDocuments(patient.userId)
}

const handleBackToPatients = () => {
  selectedPatient.value = null
  patientDocuments.value = []
  selectedTags.value = []
  
  // Remove patient query param from URL
  router.replace({ query: {} })
}

// Scroll to letter section
const scrollToLetter = (letter: string) => {
  const element = document.getElementById(`letter-${letter}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleDocumentClick = (document: AnyDocument) => {
  selectedDocument.value = document
  isModalOpen.value = true
}

const handleCloseModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedDocument.value = null
  }, 300)
}

const handleTagSelected = (tagId: string) => {
  if (tagId === 'all') {
    selectedTags.value = []
  } else {
    const index = selectedTags.value.indexOf(tagId)
    if (index > -1) {
      selectedTags.value.splice(index, 1)
    } else {
      selectedTags.value.push(tagId)
    }
  }
}
</script>

<template>
  <div class="doctor-patients-page">
    <!-- Background decorations -->
    <div class="background-decoration"></div>

    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <!-- Back button when viewing patient documents -->
        <button
          v-if="selectedPatient"
          class="back-button"
          @click="handleBackToPatients"
          :aria-label="t('common.back')"
        >
          <ArrowLeftIcon class="back-icon" />
        </button>

        <div class="header-text">
          <h1 class="page-title">
            {{ selectedPatient
              ? `${selectedPatient.name} ${selectedPatient.lastName}`
              : t('doctor.patients.title')
            }}
          </h1>
          <p class="page-subtitle">
            <template v-if="selectedPatient">
              {{ t('doctor.patients.medicalRecords') }} · {{ filteredDocuments.length }}
              {{ filteredDocuments.length === 1 ? t('doctor.patients.document') : t('doctor.patients.documents') }}
            </template>
            <template v-else>
              {{ filteredPatients.length }}
              {{ filteredPatients.length === 1 ? t('doctor.patients.patient') : t('doctor.patients.patientsCount') }}
            </template>
          </p>
        </div>
      </div>
    </div>

    <!-- Search Bar (only visible when viewing patient list) -->
    <div v-if="!selectedPatient" class="section-spacing">
      <SearchBar
        @search="handleSearch"
        :placeholder="t('doctor.patients.searchPlaceholder')"
      />
    </div>

    <!-- Patient Info Card (when viewing a patient's documents) -->
    <div v-if="selectedPatient" class="patient-info-card section-spacing">
      <div class="patient-avatar">
        <UserIcon class="avatar-icon" />
      </div>
      <div class="patient-details">
        <div class="patient-detail-row">
          <span class="detail-label">{{ t('doctor.patients.fiscalCode') }}:</span>
          <span class="detail-value">{{ selectedPatient.fiscalCode }}</span>
        </div>
        <div class="patient-detail-row">
          <span class="detail-label">{{ t('doctor.patients.dateOfBirth') }}:</span>
          <span class="detail-value">
            {{ formatDateOfBirth(selectedPatient.dateOfBirth) }}
            ({{ calculateAge(selectedPatient.dateOfBirth) }} {{ t('doctor.patients.years') }})
          </span>
        </div>
      </div>
    </div>

    <!-- Tag Bar for filtering documents (when viewing a patient) -->
    <div v-if="selectedPatient && patientDocuments.length > 0" class="section-spacing">
      <TagBar
        :tags="tags"
        :selected-tag="selectedTags.length === 0 ? 'all' : selectedTags[0] || 'all'"
        :multiple="true"
        :active-tags="activeTags"
        @tag-selected="handleTagSelected"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading || isLoadingDocuments" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="error-state">
      <p>{{ loadError }}</p>
      <button @click="loadPatients" class="retry-btn">
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Patient List View -->
    <template v-else-if="!selectedPatient">
      <!-- Alphabet Navigation -->
      <div v-if="groupedPatients.length > 0" class="alphabet-nav section-spacing">
        <button
          v-for="letter in availableLetters"
          :key="letter"
          class="alphabet-letter"
          @click="scrollToLetter(letter)"
          :aria-label="`Vai alla lettera ${letter}`"
        >
          {{ letter }}
        </button>
      </div>

      <!-- Patients Directory (grouped by letter) -->
      <div v-if="groupedPatients.length > 0" class="patients-directory">
        <div
          v-for="group in groupedPatients"
          :key="group.letter"
          :id="`letter-${group.letter}`"
          class="letter-group"
        >
          <div class="letter-header">
            <span class="letter-badge">{{ group.letter }}</span>
            <span class="letter-count">{{ group.patients.length }}</span>
          </div>
          
          <div class="patients-list">
            <div
              v-for="patient in group.patients"
              :key="patient.userId"
              class="patient-card"
              @click="handlePatientClick(patient)"
              role="button"
              tabindex="0"
              @keydown.enter="handlePatientClick(patient)"
              @keydown.space.prevent="handlePatientClick(patient)"
            >
              <div class="patient-card-avatar">
                <UserIcon class="patient-icon" />
              </div>
              <div class="patient-card-info">
                <h3 class="patient-name">{{ patient.lastName }} {{ patient.name }}</h3>
                <p class="patient-fiscal-code">{{ patient.fiscalCode }}</p>
                <p class="patient-dob">
                  {{ formatDateOfBirth(patient.dateOfBirth) }} · {{ calculateAge(patient.dateOfBirth) }} {{ t('doctor.patients.years') }}
                </p>
              </div>
              <div class="patient-card-arrow">
                <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <MagnifyingGlassIcon class="empty-icon" />
        <p>{{ searchQuery ? t('doctor.patients.noResults') : t('doctor.patients.noPatients') }}</p>
      </div>
    </template>

    <!-- Patient Documents View -->
    <template v-else>
      <!-- Documents List -->
      <CardList v-if="filteredDocuments.length > 0" class="documents-list-container">
        <DocumentCard
          v-for="doc in filteredDocuments"
          :key="doc.id"
          :document="doc"
          @click="handleDocumentClick(doc)"
        >
          <template #details>
            <MedicinePrescriptionDetails v-if="isMedicinePrescription(doc)" :document="doc" />
          </template>
        </DocumentCard>
      </CardList>

      <!-- Empty Documents State -->
      <div v-else class="empty-state">
        <p>{{ t('doctor.patients.noDocuments') }}</p>
      </div>
    </template>

    <!-- Document Modal (Teleported to body) -->
    <Teleport to="body">
      <DocumentModal
        :document="selectedDocument"
        :is-open="isModalOpen"
        @close="handleCloseModal"
      />
    </Teleport>
  </div>
</template>

<style scoped>
.doctor-patients-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.background-decoration {
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

.header-section {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  background: var(--white-50);
  border: 1px solid var(--black-10);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  flex-shrink: 0;
}

.back-button:hover {
  background: var(--white-70);
  transform: translateX(-2px);
}

.back-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--gray-525252);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0;
  line-height: 1.25;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--gray-525252);
  margin-top: 0.5rem;
  line-height: 1.5;
}

.section-spacing {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 10;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

/* Patient Info Card */
.patient-info-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.25rem;
  box-shadow: 0 4px 16px var(--black-8);
}

.patient-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary-20) 0%, var(--accent-secondary-20) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-icon {
  width: 2rem;
  height: 2rem;
  color: var(--accent-primary);
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.patient-detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.9375rem;
}

.detail-label {
  color: var(--gray-525252);
  font-weight: 500;
}

.detail-value {
  color: var(--gray-171717);
  font-weight: 600;
}

/* Alphabet Navigation */
.alphabet-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--black-8);
  justify-content: center;
}

.alphabet-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  background: var(--white-60);
  border: 1px solid var(--black-10);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-525252);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.alphabet-letter:hover {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--accent-primary-30);
}

.alphabet-letter:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Patients Directory */
.patients-directory {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.letter-group {
  scroll-margin-top: 1rem;
}

.letter-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--accent-primary-20);
}

.letter-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px var(--accent-primary-30);
}

.letter-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-525252);
}

.patients-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Patient Card */
.patient-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-secondary-25);
  backdrop-filter: blur(20px);
  border: 1.5px solid var(--bg-secondary-70);
  border-radius: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 4px 16px var(--text-primary-8), inset 0 1px 0 var(--bg-secondary-70);
}

.patient-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px var(--text-primary-12), inset 0 1px 0 var(--bg-secondary-80);
  background: var(--bg-secondary-35);
  border-color: var(--accent-primary-30);
}

.patient-card:focus {
  outline: none;
  border-color: var(--accent-primary-50);
  box-shadow: 0 0 0 3px var(--accent-primary-10), 0 12px 32px var(--text-primary-12);
}

.patient-card-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary-10) 0%, var(--accent-secondary-10) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.patient-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--accent-primary);
}

.patient-card-info {
  flex: 1;
  min-width: 0;
}

.patient-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.patient-fiscal-code {
  font-size: 0.8125rem;
  color: var(--gray-525252);
  margin: 0 0 0.25rem 0;
  font-family: monospace;
  letter-spacing: 0.02em;
}

.patient-dob {
  font-size: 0.8125rem;
  color: var(--gray-737373);
  margin: 0;
}

.patient-card-arrow {
  flex-shrink: 0;
}

.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--gray-737373);
  transition: transform 0.2s ease;
}

.patient-card:hover .arrow-icon {
  transform: translateX(4px);
  color: var(--accent-primary);
}

/* Documents List */
.documents-list-container {
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

/* States */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--white-15);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-20);
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px var(--black-8);
  position: relative;
  z-index: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 4px solid var(--white-40);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--red-fee2e2);
  border: 1px solid var(--red-fca5a5);
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px var(--black-8);
  position: relative;
  z-index: 1;
}

.error-state p {
  color: var(--red-dc2626);
  margin-bottom: 1rem;
  font-weight: 600;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary);
  color: var(--white);
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.125rem;
  color: var(--gray-737373);
  background: var(--white-15);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-20);
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px var(--black-8);
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--gray-525252);
  opacity: 0.6;
}

/* Animations */
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

/* Responsive */
@media (max-width: 768px) {
  .doctor-patients-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: row;
    align-items: center;
    padding: 1.25rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .alphabet-nav {
    padding: 0.75rem;
    gap: 0.375rem;
  }

  .alphabet-letter {
    width: 2rem;
    height: 2rem;
    font-size: 0.8125rem;
  }

  .letter-badge {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .patient-info-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.25rem;
  }

  .patient-details {
    align-items: center;
  }

  .patient-detail-row {
    justify-content: center;
    text-align: center;
  }

  .patient-card {
    padding: 1rem;
  }

  .patient-card-avatar {
    width: 3rem;
    height: 3rem;
  }

  .patient-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .patient-name {
    font-size: 1rem;
  }

  .patient-fiscal-code,
  .patient-dob {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .doctor-patients-page {
    padding: 0.75rem;
  }

  .header-content {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.375rem;
  }

  .back-button {
    width: 2.25rem;
    height: 2.25rem;
  }

  .back-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  .patient-avatar {
    width: 3.5rem;
    height: 3.5rem;
  }

  .avatar-icon {
    width: 1.75rem;
    height: 1.75rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }
}
</style>
