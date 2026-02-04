<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'
import SearchBar from '../../components/shared/SearchBar.vue'
import TagBar from '../../components/shared/TagBar.vue'
import DocumentCard from '../../components/shared/DocumentCard.vue'
import MedicinePrescriptionDetails from '../../components/doctor/document-details/MedicinePrescriptionDetails.vue'
import CardList from '../../components/shared/CardList.vue'
import DocumentModal from '../../components/patient/documents/DocumentModal.vue'
import DateRangeFilter from '../../components/patient/documents/DateRangeFilter.vue'
import BatchActionsBar from '../../components/patient/documents/BatchActionsBar.vue'
import PrescriptionsManager from '../../components/doctor/prescriptions/PrescriptionsManager.vue'
import type { DateRange } from '../../types/date-range'
import type { Tag } from '../../types/tag'
import type { AnyDocument, MedicinePrescription } from '../../types/document'
import { parseItalianDate } from '../../utils/dateUtils'
import { documentsApiService } from '../../api/documents'
import { useAuth } from '../../composables/useAuth'

const { t } = useI18n()
const { currentUser } = useAuth()

const isLoading = ref(false)
const loadError = ref<string | null>(null)

// Load documents on mount
onMounted(async () => {
    await loadDocuments()
})

const loadDocuments = async () => {
    if (!currentUser.value?.userId) {
        console.warn('[DoctorDocumentsPage] No current user found')
        loadError.value = t('doctor.documents.errorLoading')
        return
    }

    isLoading.value = true
    loadError.value = null

    try {
        console.log('[DoctorDocumentsPage] Loading documents for doctor:', currentUser.value.userId)

        let fetchedDocuments: AnyDocument[] = await documentsApiService.getDocumentsByDoctor(currentUser.value.userId)
        documents.value = fetchedDocuments
        console.log('[DoctorDocumentsPage] Loaded', fetchedDocuments.length, 'documents')
    } catch (error) {
        console.error('[DoctorDocumentsPage] Error loading documents:', error)
        loadError.value = t('doctor.documents.errorLoading')
    } finally {
        isLoading.value = false
    }
}

const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const selectedDocument = ref<AnyDocument | null>(null)
const isModalOpen = ref(false)

// Selection mode
const selectionMode = ref(false)
const selectedDocumentIds = ref<Set<string>>(new Set())

// Date range filter
const dateRange = ref<DateRange>({
    from: null,
    to: null
})

const documents = ref<AnyDocument[]>([])

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

// Computed tags based on document types
const tags = computed<Tag[]>(() => {
    const reportCount = documents.value.filter(d => isReport(d)).length
    const medicinePrescriptionCount = documents.value.filter(d => isMedicinePrescription(d)).length
    const servicePrescriptionCount = documents.value.filter(d => isServicePrescription(d)).length

    return [
        { id: 'all', label: t('doctor.documents.categories.all'), count: documents.value.length },
        { id: 'report', label: t('doctor.documents.categories.reports'), count: reportCount },
        { id: 'medicine_prescription', label: t('doctor.documents.categories.medicinePrescriptions'), count: medicinePrescriptionCount },
        { id: 'service_prescription', label: t('doctor.documents.categories.servicePrescriptions'), count: servicePrescriptionCount }
    ]
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

    if (selectedTags.value.length > 0 && !selectedTags.value.includes('all')) {
        filtered = filtered.filter(doc => {
            if (!('type' in doc)) return false
            return selectedTags.value.some(selectedTag => doc.type === selectedTag)
        })
    }

    // Filter by date range
    if (dateRange.value.from || dateRange.value.to) {
        filtered = filtered.filter(doc => {
            const docDate = parseItalianDate(doc.date)
            if (!docDate) return false

            const from = dateRange.value.from
            const to = dateRange.value.to

            if (from && to) {
                return docDate >= from && docDate <= to
            } else if (from) {
                return docDate >= from
            } else if (to) {
                return docDate <= to
            }
            return true
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

// Active tags for TagBar - include 'all' when no tags are selected
const activeTags = computed(() => {
    if (selectedTags.value.length === 0) {
        return ['all']
    }
    return selectedTags.value
})

const handleSearch = (query: string) => {
    searchQuery.value = query
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

const toggleSelectionMode = () => {
    selectionMode.value = !selectionMode.value
    if (!selectionMode.value) {
        selectedDocumentIds.value.clear()
    }
}


const deselectAll = () => {
    selectedDocumentIds.value.clear()
}

const handleDownloadAll = async () => {
    if (selectedDocuments.value.length === 0) {
        return
    }

    try {
        console.log('[DoctorDocumentsPage] Downloading', selectedDocuments.value.length, 'documents')

        const documentsToDownload = selectedDocuments.value
            .filter(doc => doc.patientId) // Only download documents with patientId
            .map(doc => ({
                patientId: doc.patientId!,
                documentId: doc.id,
                title: doc.title
            }))

        if (documentsToDownload.length === 0) {
            console.warn('[DoctorDocumentsPage] No documents with patientId to download')
            return
        }

        await documentsApiService.downloadMultipleDocuments(documentsToDownload)
        console.log('[DoctorDocumentsPage] Download batch completed')
    } catch (error) {
        console.error('[DoctorDocumentsPage] Error downloading documents:', error)
        // TODO: Mostrare un messaggio di errore all'utente
    }
}

const handleCancelSelection = () => {
    selectionMode.value = false
    selectedDocumentIds.value.clear()
}

const handleDocumentClick = (document: AnyDocument) => {
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
    <div class="doctor-documents-page">
        <!-- Header Section -->
        <div class="header-section">
            <div class="header-content">
                <div class="header-text">
                    <h1 class="page-title">{{ t('doctor.documents.title') }}</h1>
                    <p class="page-subtitle">
                        {{ filteredDocuments.length }} {{ filteredDocuments.length === 1 ? 'documento' : 'documenti' }}
                    </p>
                </div>
                <div class="header-actions">
                    <PrescriptionsManager />
                    <button class="action-btn selection-btn" :class="{ 'active': selectionMode }"
                        @click="toggleSelectionMode">
                        <CheckCircleIcon class="action-icon" />
                        {{ selectionMode ? t('documents.selection.cancel') : t('documents.selection.selectMode') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Search Bar & Date Range Filter -->
        <div class="section-spacing">
            <div class="filters-row">
                <SearchBar @search="handleSearch" :placeholder="t('doctor.documents.searchPlaceholder')" />
                <DateRangeFilter v-model="dateRange" />
            </div>
        </div>

        <!-- Tag Bar with Select All (in selection mode) -->
        <div class="section-spacing">
            <div class="tags-and-actions">
                <TagBar :tags="tags" :selected-tag="selectedTags.length === 0 ? 'tutti' : selectedTags[0] || 'tutti'"
                    :multiple="true" :active-tags="activeTags" @tag-selected="handleTagSelected" />
                <button v-if="selectionMode && filteredDocuments.length > 0" class="select-all-btn" @click="selectAll">
                    {{ t('documents.selection.selectAll') }}
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>{{ t('common.loading') || 'Caricamento...' }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="error-state">
            <p>{{ loadError }}</p>
            <button @click="loadDocuments" class="retry-btn">
                {{ t('common.retry') || 'Riprova' }}
            </button>
        </div>

        <!-- Documents List -->
        <CardList v-else-if="filteredDocuments.length" class="documents-list-container">
            <DocumentCard v-for="doc in filteredDocuments" :key="doc.id" :document="doc" :selectable="selectionMode"
                :selected="selectedDocumentIds.has(doc.id)" @click="handleDocumentClick(doc)"
                @toggle-select="() => toggleDocumentSelection(doc.id)">
                <template #details>
                    <MedicinePrescriptionDetails v-if="isMedicinePrescription(doc)" :document="doc" />
                </template>
            </DocumentCard>
        </CardList>

        <!-- Empty State -->
        <div v-else class="empty-state">
            {{ t('documents.noResults') }}
        </div>
    </div>

    <!-- Batch Actions Bar -->
    <BatchActionsBar :selected-documents="selectedDocuments" :total-documents="filteredDocuments.length"
        @download-all="handleDownloadAll" @deselect-all="deselectAll" @cancel="handleCancelSelection" />

    <!-- Document Modal (Teleported to body) -->
    <Teleport to="body">
        <DocumentModal :document="selectedDocument" :is-open="isModalOpen" @close="handleCloseModal" />
    </Teleport>
</template>

<style scoped>
.doctor-documents-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 100vw;
    overflow-x: hidden;
    padding: 2rem;
    background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
    position: relative;
}

.doctor-documents-page::before {
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

.header-section {
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
    animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
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

.header-text {
    flex: 1;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
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

.section-spacing {
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 10;
    animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
    animation-delay: 0.1s;
    animation-fill-mode: both;
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

.tags-and-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
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

.select-all-btn:hover {
    background: var(--blue-3b82f6-20);
    border-color: var(--blue-3b82f6-50);
    transform: translateY(-1px);
}

.documents-list-container {
    position: relative;
    z-index: 1;
    animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
    animation-delay: 0.2s;
    animation-fill-mode: both;
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

.action-icon {
    width: 1.25rem;
    height: 1.25rem;
    display: inline-block;
    vertical-align: middle;
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

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .action-btn {
        width: 100%;
        justify-content: center;
        padding: 0.875rem 1rem;
    }

    .header-actions {
        width: 100%;
        flex-direction: column;
    }

    .tags-and-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .filters-row {
        flex-direction: column;
    }

    .filters-row>* {
        width: 100%;
    }

    .select-all-btn {
        width: 100%;
    }

    .doctor-documents-page {
        padding: 1rem;
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
        padding: 1.25rem;
    }

    .page-title {
        font-size: 1.5rem;
    }

    .page-subtitle {
        font-size: 0.875rem;
    }
}

@media (max-width: 480px) {
    .doctor-documents-page {
        padding: 0.75rem;
    }

    .page-title {
        font-size: 1.375rem;
    }
}
</style>
