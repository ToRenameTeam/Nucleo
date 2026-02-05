<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeftIcon, MagnifyingGlassIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline'
import BaseModal from '../../shared/BaseModal.vue'
import { userApi } from '../../../api/users'

import type { NewDelegationModal } from '../../../types/delegation'

const { t } = useI18n()

const props = withDefaults(defineProps<NewDelegationModal & { sendError?: string }>(), {
  sendError: ''
})

const emit = defineEmits<{
    close: []
    back: []
    send: [fiscalCode: string]
}>()

const fiscalCode = ref('')
const isSearching = ref(false)
const searchError = ref('')
const foundUser = ref<{
    name: string
    lastName: string
    fiscalCode: string
    userId: string
} | null>(null)

const maxLength = 16

const remainingChars = computed(() => {
    return `${fiscalCode.value.length}/${maxLength}`
})

const canSearch = computed(() => {
    return fiscalCode.value.length === maxLength
})

const handleSearch = async () => {
    if (!canSearch.value) return

    isSearching.value = true
    searchError.value = ''
    foundUser.value = null

    try {
        const result = await userApi.searchUserByFiscalCode(fiscalCode.value)
        
        foundUser.value = {
            name: result.name,
            lastName: result.lastName,
            fiscalCode: result.fiscalCode,
            userId: result.userId
        }
    } catch (err) {
        console.error('Search error:', err)
        searchError.value = err instanceof Error ? err.message : t('delegations.newDelegation.searchError')
    } finally {
        isSearching.value = false
    }
}

const handleSendRequest = () => {
    if (!foundUser.value) return
    emit('send', foundUser.value.fiscalCode)
}

const handleBack = () => {
    fiscalCode.value = ''
    foundUser.value = null
    searchError.value = ''
    emit('back')
}

const handleClose = () => {
    fiscalCode.value = ''
    foundUser.value = null
    searchError.value = ''
    emit('close')
}

const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
</script>

<template>
    <BaseModal :is-open="isOpen" :show-footer="false" max-width="sm" @close="handleClose">
        <template #header>
            <div class="custom-header">
                <button class="back-button" @click="handleBack" :aria-label="t('delegations.newDelegation.back')">
                    <ArrowLeftIcon class="back-icon" />
                </button>
                <div class="header-content">
                    <h2 class="modal-title">{{ t('delegations.newDelegation.title') }}</h2>
                    <p class="modal-subtitle">{{ t('delegations.newDelegation.subtitle') }}</p>
                </div>
            </div>
        </template>

        <div class="new-delegation-content">
            <div class="search-section">
                <label class="input-label">{{ t('delegations.newDelegation.fiscalCodeLabel') }}</label>
                <div class="search-input-wrapper">
                    <input v-model="fiscalCode" type="text" :maxlength="maxLength"
                        :placeholder="t('delegations.newDelegation.fiscalCodePlaceholder')" 
                        class="fiscal-code-input"
                        :class="{ 'input-error': searchError }"
                        @keyup.enter="handleSearch" />
                    <button class="search-button" :disabled="!canSearch || isSearching" @click="handleSearch"
                        :aria-label="t('delegations.newDelegation.search')">
                        <MagnifyingGlassIcon class="search-icon" />
                    </button>
                </div>
                <span class="char-counter">{{ remainingChars }} {{ t('delegations.newDelegation.characters') }}</span>
                
                <p v-if="searchError" class="error-message">{{ searchError }}</p>
            </div>

            <div v-if="foundUser" class="found-user-section">
                <h3 class="section-title">{{ t('delegations.newDelegation.userFound') }}</h3>
                <div class="user-card">
                    <div class="user-avatar">
                        {{ getInitials(foundUser.name, foundUser.lastName) }}
                    </div>
                    <div class="user-info">
                        <h4 class="user-name">{{ foundUser.name }} {{ foundUser.lastName }}</h4>
                        <p class="user-fiscal-code">{{ foundUser.fiscalCode }}</p>
                    </div>
                </div>

                <button class="send-request-button" @click="handleSendRequest">
                    <PaperAirplaneIcon class="send-icon" />
                    {{ t('delegations.newDelegation.sendRequest') }}
                </button>
                
                <p v-if="props.sendError" class="error-message">{{ props.sendError }}</p>
            </div>
        </div>
    </BaseModal>
</template>

<style scoped>
.custom-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
}

.back-button {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white-40);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--white-50);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
    flex-shrink: 0;
}

.back-button:hover {
    background: var(--white-60);
    transform: translateX(-2px);
}

.back-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--text-primary);
    stroke-width: 2;
}

.header-content {
    flex: 1;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
}

.modal-subtitle {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
    margin: 0;
}

.new-delegation-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.search-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.input-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
}

.search-input-wrapper {
    display: flex;
    gap: 0.75rem;
}

.fiscal-code-input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--white-40);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--white-50);
    border-radius: 0.5rem;
    font-size: 1rem;
    color: var(--text-primary);
    transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
    text-transform: uppercase;
}

.fiscal-code-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px var(--accent-primary-20);
}

.fiscal-code-input::placeholder {
    color: var(--text-tertiary);
    text-transform: none;
}

.search-button {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--text-primary);
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
    flex-shrink: 0;
}

.search-button:hover:not(:disabled) {
    background: var(--text-secondary);
    transform: scale(1.05);
}

.search-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.search-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--white);
    stroke-width: 2;
}

.input-error {
    border-color: #ef4444 !important;
}

.input-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2) !important;
}

.error-message {
    font-size: 0.875rem;
    color: #ef4444;
    margin: 0;
    margin-top: -0.25rem;
}

.char-counter {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    text-align: right;
}

.found-user-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.section-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
}

.user-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--white-40);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--white-50);
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
}

.user-avatar {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary-30);
    border-radius: 0.5rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    flex-shrink: 0;
}

.user-info {
    flex: 1;
}

.user-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    margin-bottom: 0.25rem;
}

.user-fiscal-code {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
    margin: 0;
}

.check-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #10b981;
    stroke-width: 2;
    flex-shrink: 0;
}

.send-request-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--text-primary);
    border: none;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--white);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
    box-shadow: 0 4px 12px var(--shadow);
}

.send-request-button:hover {
    background: var(--text-secondary);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px var(--shadow);
}

.send-request-button:active {
    transform: translateY(0);
}

.send-icon {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
}

@media (max-width: 480px) {
    .modal-title {
        font-size: 1.25rem;
    }

    .search-input-wrapper {
        gap: 0.5rem;
    }

    .search-button {
        width: 2.75rem;
        height: 2.75rem;
    }

    .user-avatar {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1rem;
    }
}
</style>
