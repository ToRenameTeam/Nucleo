<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { CheckCircleIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import SearchBar from '../../components/shared/SearchBar.vue'
import TagBar from '../../components/shared/TagBar.vue'
import DocumentCard from '../../components/shared/DocumentCard.vue'
import CardList from '../../components/shared/CardList.vue'
import DocumentModal from '../../components/patient/documents/DocumentModal.vue'
import DateRangeFilter from '../../components/patient/documents/DateRangeFilter.vue'
import type { DateRange } from '../../types/date-range'
import BatchActionsBar from '../../components/patient/documents/BatchActionsBar.vue'
import type { Tag } from '../../types/tag'
import type { Document, ServicePrescription, AnyDocument } from '../../types/document'
import { parseAnyDate, isDateInRange } from '../../utils/dateUtils'
import { documentsApiService } from '../../api/documents'
import { masterDataApi, type ServiceType } from '../../api/masterData'
import { normalizeToSpecialization } from '../../utils/specialization'

const { currentUser, currentPatientProfile } = useAuth()
const router = useRouter()

const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const selectedDocument = ref<Document | null>(null)
const isModalOpen = ref(false)
const isLoading = ref(false)

// Selection mode
const selectionMode = ref(false)
const selectedDocumentIds = ref<Set<string>>(new Set())

// Date range filter
const dateRange = ref<DateRange>({
  from: null,
  to: null
})

const documents = ref<AnyDocument[]>([])
const serviceTypes = ref<ServiceType[]>([])

const tags = computed<Tag[]>(() => {
  // Estrai tutti i tag unici dai documenti
  const tagCounts = new Map<string, number>()
  
  documents.value.forEach(doc => {
    doc.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase().trim()
      if (normalizedTag) {
        tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1)
      }
    })
  })
  
  // Converti in array e ordina per conteggio (decrescente)
  const sortedTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({
      id: tag,
      label: normalizeToSpecialization(tag), // Usa la funzione utility
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Limita a 5 tag
  
  // Aggiungi "Tutti" all'inizio
  return [
    { id: 'tutti', label: 'Tutti', count: documents.value.length },
    ...sortedTags
  ]
})

// Type guard for ServicePrescription
function isServicePrescription(doc: AnyDocument): doc is ServicePrescription {
  return 'type' in doc && doc.type === 'service_prescription'
}

async function loadDocuments() {
  const patientId = currentPatientProfile.value?.userId || currentUser.value?.userId

  if (!patientId) {
    console.log('[PatientDocumentsPage] No patient ID available')
    return
  }

  isLoading.value = true
  
  try {
    const [fetchedDocuments, fetchedServiceTypes] = await Promise.all([
      documentsApiService.getDocumentsByPatient(patientId),
      masterDataApi.getServiceTypes()
    ])
    documents.value = fetchedDocuments
    serviceTypes.value = fetchedServiceTypes
    
    // Debug: log documents to check structure
    console.log('[PatientDocumentsPage] Total documents:', fetchedDocuments.length)
    fetchedDocuments.forEach((doc, idx) => {
      console.log(`[PatientDocumentsPage] Document ${idx}:`, {
        id: doc.id,
        title: doc.title,
        type: 'type' in doc ? doc.type : 'NO TYPE FIELD',
        hasType: 'type' in doc,
        isServicePrescription: isServicePrescription(doc)
      })
    })
  } catch (err) {
    console.error('[PatientDocumentsPage] Error loading documents:', err)
  } finally {
    isLoading.value = false
  }
}

// Get service type name from serviceId
function getServiceTypeName(serviceId: string): string | null {
  const service = serviceTypes.value.find(st => st._id === serviceId)
  return service?.name || null
}

// Handle booking button click for service prescription
function handleBookVisit(doc: ServicePrescription) {
  const serviceName = getServiceTypeName(doc.serviceId)
  if (serviceName) {
    // Navigate to home with booking modal state
    router.push({
      name: 'patient-home',
      query: {
        bookVisit: serviceName
      }
    })
  }
}

onMounted(() => {
  loadDocuments()
})

// Watch for changes in patient profile
watch(() => currentPatientProfile.value?.userId, () => {
  loadDocuments()
  // Reset selection when changing profile
  selectionMode.value = false
  selectedDocumentIds.value.clear()
})

const filteredDocuments = computed(() => {
  let filtered = documents.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.description.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Filter by multiple tags
  if (selectedTags.value.length > 0 && !selectedTags.value.includes('tutti')) {
    filtered = filtered.filter(doc => 
      selectedTags.value.some(selectedTag =>
        doc.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      )
    )
  }

  // Filter by date range
  if (dateRange.value.from || dateRange.value.to) {
    filtered = filtered.filter(doc => {
      const docDate = parseAnyDate(doc.date)
      if (!docDate) return false
      return isDateInRange(docDate, dateRange.value.from, dateRange.value.to)
    })
  }

  // Always sort by newest first
  filtered.sort((a, b) => {
    const dateA = parseItalianDate(a.date)
    const dateB = parseItalianDate(b.date)
    
    if (!dateA || !dateB) return 0
    
    return dateB.getTime() - dateA.getTime()
  })

  return filtered
})

const selectedDocuments = computed(() => {
  return filteredDocuments.value.filter(doc => selectedDocumentIds.value.has(doc.id))
})

// Active tags for TagBar - include 'tutti' when no tags are selected
const activeTags = computed(() => {
  if (selectedTags.value.length === 0) {
    return ['tutti']
  }
  return selectedTags.value
})

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleTagSelected = (tagId: string) => {
  if (tagId === 'tutti') {
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

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedDocumentIds.value.clear()
  }
}

const toggleDocumentSelection = (docId: string) => {
  if (selectedDocumentIds.value.has(docId)) {
    selectedDocumentIds.value.delete(docId)
  } else {
    selectedDocumentIds.value.add(docId)
  }
}

const selectAll = () => {
  filteredDocuments.value.forEach(doc => {
    selectedDocumentIds.value.add(doc.id)
  })
}

const deselectAll = () => {
  selectedDocumentIds.value.clear()
}

const handleDownloadAll = async () => {
  const patientId = currentPatientProfile.value?.userId || currentUser.value?.userId

  if (selectedDocuments.value.length === 0 || !patientId) {
    return
  }

  try {
    console.log('[PatientDocumentsPage] Downloading', selectedDocuments.value.length, 'documents')

    const documentsToDownload = selectedDocuments.value.map(doc => ({
      patientId: patientId,
      documentId: doc.id,
      title: doc.title
    }))

    await documentsApiService.downloadMultipleDocuments(documentsToDownload)
    console.log('[PatientDocumentsPage] Download batch completed')
  } catch (error) {
    console.error('[PatientDocumentsPage] Error downloading documents:', error)
    // TODO: Mostrare un messaggio di errore all'utente
  }
}

const handleCancelSelection = () => {
  selectionMode.value = false
  selectedDocumentIds.value.clear()
}

const handleDocumentClick = (document: Document) => {
  if (!selectionMode.value) {
    selectedDocument.value = document
    isModalOpen.value = true
  }
}

const handleCloseModal = () => {
  isModalOpen.value = false
  setTimeout(() => {
    selectedDocument.value = null
  }, 300)
}

</script>

<template>
  <div class="documents-page">
    <div class="header-section">
      <div class="header-content">
        <div>
          <h1 class="page-title">{{ $t('documents.title') }}</h1>
          <p class="page-subtitle">
            {{ filteredDocuments.length }} {{ filteredDocuments.length === 1 ? 'documento' : 'documenti' }}
          </p>
        </div>
        <div class="header-actions">
          <button 
            class="action-btn selection-btn"
            :class="{ 'active': selectionMode }"
            @click="toggleSelectionMode"
          >
            <CheckCircleIcon class="action-icon" />
            {{ selectionMode ? $t('documents.selection.cancel') : $t('documents.selection.selectMode') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Search Bar & Date Range Filter -->
    <div class="section-spacing">
      <div class="filters-row">
        <SearchBar @search="handleSearch" :placeholder="$t('documents.searchPlaceholder')"/>
        <DateRangeFilter v-model="dateRange" />
      </div>
    </div>

    <!-- Tag Bar with Select All (in selection mode) -->
    <div class="section-spacing">
      <div class="tags-and-actions">
        <TagBar
          :tags="tags"
          :selected-tag="selectedTags.length === 0 ? 'tutti' : selectedTags[0] || 'tutti'"
          :multiple="true"
          :active-tags="activeTags"
          @tag-selected="handleTagSelected"
        />
        <button 
          v-if="selectionMode && filteredDocuments.length > 0" 
          class="select-all-btn"
          @click="selectAll"
        >
          {{ $t('documents.selection.selectAll') }}
        </button>
      </div>
    </div>

    <!-- Documents List -->
    <CardList v-if="filteredDocuments.length" class="documents-list-container">
      <DocumentCard
        v-for="doc in filteredDocuments"
        :key="doc.id"
        :document="doc"
        :selectable="selectionMode"
        :selected="selectedDocumentIds.has(doc.id)"
        @click="handleDocumentClick(doc)"
        @toggle-select="() => toggleDocumentSelection(doc.id)"
      >
        <template #actions v-if="isServicePrescription(doc) && !selectionMode">
          <button class="book-visit-btn" @click.stop="handleBookVisit(doc)">
            <CalendarIcon class="book-icon" />
            <span>{{ $t('documents.bookVisit') }}</span>
          </button>
        </template>
      </DocumentCard>
    </CardList>

    <!-- Empty State -->
    <div v-else class="empty-state">
      {{ $t('documents.noResults') }}
    </div>
  </div>

  <!-- Batch Actions Bar -->
  <BatchActionsBar
    :selected-documents="selectedDocuments"
    :total-documents="filteredDocuments.length"
    @download-all="handleDownloadAll"
    @deselect-all="deselectAll"
    @cancel="handleCancelSelection"
  />

  <!-- Document Modal (Teleported to body) -->
  <Teleport to="body">
    <DocumentModal
      :document="selectedDocument"
      :is-open="isModalOpen"
      @close="handleCloseModal"
    />
  </Teleport>
</template>

<style scoped>
.action-icon {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
  vertical-align: middle;
}
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1.125rem;
  color: var(--gray-737373);
  background: var(--white-15);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-20);
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px var(--black-8);
  position: relative;
  z-index: 1;
}

.header-section {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 1.25rem 1.5rem;
  }
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

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
  border: 1px solid var(--white-15);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px var(--black-15);
}

@media (max-width: 768px) {
  .action-btn {
    width: 100%;
    justify-content: center;
    padding: 0.875rem 1rem;
  }
}

.selection-btn {
  background: var(--white-50);
  color: var(--gray-525252);
  border-color: var(--black-10);
}

.selection-btn:hover {
  background: var(--white-70);
  transform: translateY(-2px);
}

.selection-btn.active {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  border-color: var(--white-20);
}

.selection-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-40);
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
  }

  .filters-row > * {
    width: 100%;
  }
}

.tags-and-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .tags-and-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

.select-all-btn {
  padding: 0.625rem 1.25rem;
  background: var(--blue-3b82f6-10);
  border: 1px solid var(--blue-3b82f6-30);
  border-radius: 0.75rem;
  color: var(--blue-3b82f6);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .select-all-btn {
    width: 100%;
  }
}

.select-all-btn:hover {
  background: var(--blue-3b82f6-20);
  border-color: var(--blue-3b82f6-50);
  transform: translateY(-1px);
}

.documents-page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.documents-page::before {
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

.page-header {
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  padding: 1.5rem 2rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
}

.page-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-171717);
  line-height: 1.25;
}

.page-header p {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  color: var(--gray-525252);
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

.documents-list-container {
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.text-center {
  text-align: center;
  padding: 3rem 1rem;
  font-size: 1.125rem;
  color: var(--gray-737373);
  background: var(--white-15);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-20);
  border-radius: 1.5rem;
  box-shadow: 0 4px 16px var(--black-8);
  position: relative;
  z-index: 1;
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
  .documents-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .documents-page {
    padding: 0.75rem;
  }
  
  .page-title {
    font-size: 1.375rem;
  }
}
/* Book Visit Button */
.book-visit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 4px 12px var(--accent-primary-40);
  backdrop-filter: blur(8px);
  white-space: nowrap;
}

.book-visit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-40);
  filter: brightness(1.1);
}

.book-visit-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px var(--accent-primary-30);
}

.book-icon {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .book-visit-btn {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }

  .book-icon {
    width: 1rem;
    height: 1rem;
  }
}</style>
