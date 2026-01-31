<script setup lang="ts">
import { ref, computed } from 'vue'
import { DocumentPlusIcon, PlusIcon } from '@heroicons/vue/24/outline'
import SearchBar from '../../components/shared/SearchBar.vue'
import Toast from '../../components/shared/Toast.vue'
import AppointmentCard from '../../components/shared/AppointmentCard.vue'
import DocumentCard from '../../components/shared/DocumentCard.vue'
import DocumentModal from '../../components/patient/documents/DocumentModal.vue'
import AppointmentBooking from '../../components/patient/home/AppointmentBooking.vue'
import CardList from '../../components/shared/CardList.vue'
import { MOCK_DOCUMENTS, MOCK_APPOINTMENTS } from '../../constants/mockData'
import type { Document } from '../../types/document'

const searchQuery = ref('')
const appointments = computed(() => MOCK_APPOINTMENTS.slice(0, 2))
const recentDocuments = computed(() => MOCK_DOCUMENTS.slice(0, 2))
const isBookingOpen = ref(false)
const selectedDocument = ref<Document | null>(null)
const isDocumentModalOpen = ref(false)
const preselectedVisitType = ref<string | null>(null)
const showSuccessToast = ref(false)

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const handleUpload = () => {
  console.log('Upload document')
}

const handleNewAppointment = () => {
  preselectedVisitType.value = null
  isBookingOpen.value = true
}

const handleAppointmentClick = (id: string) => {
  console.log('Appointment clicked:', id)
}

const handleBookingConfirm = (appointment: any) => {
  console.log('Appointment booked:', appointment)
  showSuccessToast.value = true
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
}
</script>

<template>
  <div class="home-page">
    <div class="content-grid">
      <div class="main-column">
        <div class="section-card">
          <SearchBar @search="handleSearch" />
          <p class="search-hint">
            {{ $t('home.searchHint') }}
          </p>
        </div>

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
              @click="handleNewAppointment"
              class="quick-action-btn quick-action-btn-flex"
            >
              <PlusIcon class="quick-action-icon" />
              <span>{{ $t('home.newAppointment') }}</span>
            </button>
          </div>
        </div>

        <div class="section-card">
          <h3 class="section-title">{{ $t('home.upcomingAppointments') }}</h3>
          <div v-if="appointments.length === 0" class="empty-card-message">
            {{ $t('home.noAppointments') }}
          </div>
          <CardList v-else>
            <AppointmentCard
              v-for="appointment in appointments"
              :key="appointment.id"
              :appointment="appointment"
              @click="handleAppointmentClick"
            />
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

    <!-- Appointment Booking Modal -->
    <AppointmentBooking
      :is-open="isBookingOpen"
      :preselected-visit="preselectedVisitType"
      @close="isBookingOpen = false"
      @confirm="handleBookingConfirm"
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
      :message="$t('toast.bookingConfirmed')"
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

.search-hint {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--hint-text-color);
  text-align: center;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  width: 1.25rem;
  height: 1.25rem;
}

.quick-actions {
  margin: 1rem;
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
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 0.875rem;
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
