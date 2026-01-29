<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authApi, AuthApiError } from '../api/auth'
import { useAuth } from '../authentication/useAuth'

const { t } = useI18n()
const router = useRouter()
const { setAuthenticatedUser } = useAuth()

const fiscalCode = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  if (!fiscalCode.value || !password.value) {
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await authApi.login({
      fiscalCode: fiscalCode.value.toUpperCase(),
      password: password.value,
    })

    if (!response.requiresProfileSelection && response.activeProfile) {
      // Case 1: Patient only - patient profile selected
      setAuthenticatedUser({
        ...response,
        activeProfile: response.activeProfile
      })
      router.push('/patient-choice')
    } else {
      // Case 2: Doctor and Patient - select profile
      setAuthenticatedUser({ ...response, activeProfile: 'PATIENT' })
      router.push('/doctor-patient-choice')
    }
  } catch (error) {
    if (error instanceof AuthApiError) {
      if (error.statusCode === 401) {
        errorMessage.value = t('auth.invalidCredentials')
      } else {
        errorMessage.value = t('auth.loginError')
      }
    } else {
      errorMessage.value = t('auth.networkError')
    }
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">
          {{ t('app.title') }}
          <div class="title-underline"></div>
        </h1>
        <p class="login-subtitle">
          {{ t('auth.loginSubtitle') }}
        </p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="fiscal-code" class="form-label">
            {{ t('auth.fiscalCode') }}
          </label>
          <input
            id="fiscal-code"
            v-model="fiscalCode"
            type="text"
            class="form-input"
            :placeholder="t('auth.fiscalCodePlaceholder')"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            {{ t('auth.password') }}
          </label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :placeholder="t('auth.passwordPlaceholder')"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="toggle-password-btn"
              :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
              @click="togglePasswordVisibility"
            >
              <span v-if="showPassword">👁️</span>
              <span v-else>👁️‍🗨️</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="login-btn"
          :disabled="isLoading || !fiscalCode || !password"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>{{ t('auth.loginButton') }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--accent-primary-15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--accent-secondary-15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 28rem;
  padding: 3rem;
  background: var(--white-40);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--white-50);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-15), inset 0 1px 0 var(--white-60);
  animation: fadeInUp 0.6s cubic-bezier(0, 0, 0.2, 1);
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: clamp(2.5rem, 6vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--gray-171717);
  position: relative;
  animation: fadeInDown 0.6s cubic-bezier(0, 0, 0.2, 1);
}

.title-underline {
  position: absolute;
  bottom: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: var(--gray-171717);
  animation: expandWidth 0.8s cubic-bezier(0, 0, 0.2, 1);
}

.login-subtitle {
  color: var(--gray-525252);
  font-size: 1rem;
  font-weight: 500;
  animation: fadeIn 0.6s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  padding: 0.75rem 1rem;
  background: var(--error-15);
  border: 1px solid var(--error-30);
  border-radius: 0.75rem;
  color: var(--error);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-404040);
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-family: 'Titillium Web', sans-serif;
  color: var(--text-primary);
  background: var(--white-30);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1.5px solid var(--white-50);
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: inset 0 1px 0 var(--white-40);
}

.form-input::placeholder {
  color: var(--gray-a3a3a3);
}

.form-input:focus {
  background: var(--white-50);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-primary-15), inset 0 1px 0 var(--white-60);
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.password-input-wrapper .form-input {
  padding-right: 3rem;
}

.toggle-password-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.toggle-password-btn:hover {
  opacity: 1;
}

.toggle-password-btn:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  border-radius: 0.25rem;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--white);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid var(--white-30);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 4px 16px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-40), inset 0 1px 0 var(--white-30);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 3px solid var(--white-30);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--gray-525252);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
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

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 60%;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 1rem;
  }

  .login-container {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem 1rem;
  }

  .login-header {
    margin-bottom: 2rem;
  }
}
</style>
