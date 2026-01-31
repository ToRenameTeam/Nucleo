<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const showCookieBanner = ref(false)
const showPrivacyModal = ref(false)
const showLegalModal = ref(false)

onMounted(() => {
  const consent = localStorage.getItem('cookie-consent')
  if (!consent) {
    showCookieBanner.value = true
  }
})

const acceptAllCookies = () => {
  localStorage.setItem('cookie-consent', 'all')
  showCookieBanner.value = false
}

const acceptNecessaryCookies = () => {
  localStorage.setItem('cookie-consent', 'necessary')
  showCookieBanner.value = false
}

const openPrivacyModal = () => {
  showPrivacyModal.value = true
}

const openLegalModal = () => {
  showLegalModal.value = true
}

const currentYear = new Date().getFullYear()
</script>

<template>
  <!-- Compact Legal Footer -->
  <footer class="legal-footer">
    <div class="footer-left">
      <span class="footer-brand">{{ t('app.title') }} © {{ currentYear }}</span>
    </div>
    
    <div class="footer-center">
      <!-- Area centrale come spacer per la BottomBar -->
    </div>
    
    <div class="footer-right">
      <div class="footer-links">
        <button 
          @click="openPrivacyModal" 
          class="footer-link"
          :aria-label="t('legalFooter.privacyAria')"
        >
          {{ t('legalFooter.privacy') }}
        </button>
        <span class="footer-separator">|</span>
        <button 
          @click="openLegalModal" 
          class="footer-link"
          :aria-label="t('legalFooter.legalAria')"
        >
          {{ t('legalFooter.legalNotes') }}
        </button>
        <span class="footer-separator">|</span>
        <a 
          href="https://form.agid.gov.it/" 
          target="_blank" 
          rel="noopener noreferrer"
          class="footer-link"
          :aria-label="t('legalFooter.accessibilityAria')"
        >
          {{ t('legalFooter.accessibility') }}
        </a>
        <span class="footer-separator">|</span>
        <span class="footer-license">{{ t('legalFooter.license') }}</span>
      </div>
    </div>
  </footer>

  <!-- Cookie Banner -->
  <Transition name="slide-up">
    <div v-if="showCookieBanner" class="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title">
      <div class="cookie-content">
        <h3 id="cookie-banner-title">{{ t('legalFooter.cookieTitle') }}</h3>
        <p>{{ t('legalFooter.cookieDescription') }}</p>
        <div class="cookie-actions">
          <button 
            @click="acceptNecessaryCookies" 
            class="cookie-btn cookie-btn-secondary"
            :aria-label="t('legalFooter.acceptNecessaryAria')"
          >
            {{ t('legalFooter.acceptNecessary') }}
          </button>
          <button 
            @click="openPrivacyModal" 
            class="cookie-btn cookie-btn-link"
            :aria-label="t('legalFooter.moreInfoAria')"
          >
            {{ t('legalFooter.moreInfo') }}
          </button>
          <button 
            @click="acceptAllCookies" 
            class="cookie-btn cookie-btn-primary"
            :aria-label="t('legalFooter.acceptAllAria')"
          >
            {{ t('legalFooter.acceptAll') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Privacy Modal -->
  <Transition name="modal">
    <div v-if="showPrivacyModal" class="modal-overlay" @click.self="showPrivacyModal = false">
      <div class="modal-container" role="dialog" aria-labelledby="privacy-modal-title">
        <div class="modal-header">
          <h2 id="privacy-modal-title">{{ t('legalFooter.privacyModalTitle') }}</h2>
          <button 
            @click="showPrivacyModal = false" 
            class="modal-close"
            aria-label="Chiudi informativa privacy"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <section>
            <h3>1. Titolare del trattamento</h3>
            <p>
              <strong>Pubblica Amministrazione Italiana</strong><br>
              Indirizzo: [Inserire indirizzo]<br>
              Email: <a href="mailto:privacy@example.gov.it">privacy@example.gov.it</a><br>
              PEC: <a href="mailto:pec@example.gov.it">pec@example.gov.it</a>
            </p>
          </section>

          <section>
            <h3>2. Tipologie di dati raccolti</h3>
            <p>Il sistema raccoglie e tratta le seguenti categorie di dati:</p>
            <ul>
              <li><strong>Dati anagrafici:</strong> nome, cognome, codice fiscale</li>
              <li><strong>Dati sanitari:</strong> documenti medici, referti, prescrizioni (Art. 9 GDPR)</li>
              <li><strong>Dati di navigazione:</strong> indirizzo IP, cookie tecnici</li>
              <li><strong>Dati di utilizzo:</strong> statistiche aggregate anonime</li>
            </ul>
          </section>

          <section>
            <h3>3. Finalità del trattamento</h3>
            <p>I dati personali sono trattati per le seguenti finalità:</p>
            <ul>
              <li>Erogazione del servizio di gestione sanitaria digitale</li>
              <li>Prenotazione e gestione appuntamenti medici</li>
              <li>Archiviazione e consultazione documenti sanitari</li>
              <li>Miglioramento del servizio tramite analisi statistiche aggregate</li>
            </ul>
          </section>

          <section>
            <h3>4. Base giuridica del trattamento</h3>
            <p>
              Il trattamento è fondato su:
            </p>
            <ul>
              <li><strong>Art. 6 par. 1 lett. e) GDPR:</strong> esecuzione di un compito di interesse pubblico</li>
              <li><strong>Art. 9 par. 2 lett. h) GDPR:</strong> finalità di medicina preventiva, diagnosi, assistenza sanitaria</li>
              <li><strong>D.Lgs. 196/2003:</strong> Codice Privacy italiano</li>
            </ul>
          </section>

          <section>
            <h3>5. Modalità di trattamento e conservazione</h3>
            <p>
              I dati sono trattati con strumenti elettronici, con misure di sicurezza tecniche e organizzative 
              adeguate per garantire la riservatezza e l'integrità. I dati sanitari sono conservati secondo 
              i termini previsti dalla normativa vigente.
            </p>
          </section>

          <section>
            <h3>6. Diritti degli interessati</h3>
            <p>Ai sensi degli articoli 15-22 del GDPR, hai diritto di:</p>
            <ul>
              <li>Accedere ai tuoi dati personali (Art. 15)</li>
              <li>Rettificare dati inesatti (Art. 16)</li>
              <li>Richiedere la cancellazione (Art. 17 - "diritto all'oblio")</li>
              <li>Limitare il trattamento (Art. 18)</li>
              <li>Portabilità dei dati (Art. 20)</li>
              <li>Opporti al trattamento (Art. 21)</li>
              <li>Proporre reclamo al Garante Privacy</li>
            </ul>
            <p>
              Per esercitare i tuoi diritti: <a href="mailto:privacy@example.gov.it">privacy@example.gov.it</a>
            </p>
          </section>

          <section>
            <h3>7. Cookie Policy</h3>
            <h4>Cookie tecnici (sempre attivi)</h4>
            <ul>
              <li><strong>cookie-consent:</strong> memorizza la scelta sui cookie</li>
              <li><strong>session:</strong> gestione sessione utente autenticato</li>
            </ul>
            
            <h4>Cookie di analisi (opzionali)</h4>
            <p>
              Utilizziamo <strong>Matomo Analytics</strong> (self-hosted, GDPR compliant) per raccogliere 
              statistiche aggregate anonime sull'utilizzo del servizio. Gli indirizzi IP sono anonimizzati.
            </p>
          </section>

          <section>
            <h3>8. Modifiche all'informativa</h3>
            <p>
              Questa informativa può essere aggiornata. La versione aggiornata sarà pubblicata su questa pagina 
              con indicazione della data di ultima modifica.
            </p>
            <p><strong>Ultimo aggiornamento:</strong> 6 Gennaio 2026</p>
          </section>
        </div>
        
        <div class="modal-footer">
          <button @click="showPrivacyModal = false" class="btn-primary">
            {{ t('legalFooter.privacyModalClose') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Legal Notes Modal -->
  <Transition name="modal">
    <div v-if="showLegalModal" class="modal-overlay" @click.self="showLegalModal = false">
      <div class="modal-container" role="dialog" aria-labelledby="legal-modal-title">
        <div class="modal-header">
          <h2 id="legal-modal-title">{{ t('legalFooter.legalModalTitle') }}</h2>
          <button 
            @click="showLegalModal = false" 
            class="modal-close"
            aria-label="Chiudi note legali"
          >
            <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <section>
            <h3>Denominazione ente</h3>
            <p>
              <strong>Pubblica Amministrazione Italiana</strong><br>
              Sede legale: [Inserire indirizzo completo]<br>
              Codice Fiscale: [Inserire CF]<br>
              Partita IVA: [Inserire P.IVA]
            </p>
          </section>

          <section>
            <h3>Contatti</h3>
            <p>
              Email: <a href="mailto:info@example.gov.it">info@example.gov.it</a><br>
              PEC: <a href="mailto:pec@example.gov.it">pec@example.gov.it</a><br>
              Telefono: +39 [numero]
            </p>
          </section>

          <section>
            <h3>Responsabile del procedimento</h3>
            <p>
              Ai sensi della Legge 241/1990, il Responsabile del procedimento è:<br>
              <strong>[Nome Cognome]</strong><br>
              Email: <a href="mailto:responsabile@example.gov.it">responsabile@example.gov.it</a>
            </p>
          </section>

          <section>
            <h3>Normativa di riferimento</h3>
            <ul>
              <li>D.Lgs. 82/2005 - Codice dell'Amministrazione Digitale (CAD)</li>
              <li>Regolamento UE 2016/679 (GDPR)</li>
              <li>D.Lgs. 196/2003 - Codice Privacy</li>
              <li>Legge 4/2004 - Disposizioni per favorire l'accesso dei soggetti disabili agli strumenti informatici</li>
              <li>Linee guida di design per i servizi digitali della PA (AgID)</li>
            </ul>
          </section>

          <section>
            <h3>Licenze software e contenuti</h3>
            <p>
              <strong>Codice sorgente:</strong> Licenza European Union Public Licence (EUPL) v. 1.2<br>
              <strong>Contenuti e documentazione:</strong> Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)
            </p>
            <p>
              Il codice sorgente è disponibile su: <a href="https://github.com/[repository]" target="_blank" rel="noopener">GitHub</a>
            </p>
          </section>

          <section>
            <h3>Copyright</h3>
            <p>
              © {{ currentYear }} Pubblica Amministrazione Italiana<br>
              Tutti i diritti riservati sui marchi e loghi.
            </p>
          </section>

          <section>
            <h3>Limitazione di responsabilità</h3>
            <p>
              L'amministrazione si impegna a mantenere il servizio accessibile e funzionante, 
              ma non può garantire l'assenza di interruzioni o errori. L'uso del servizio è a 
              rischio dell'utente nei limiti consentiti dalla legge.
            </p>
          </section>

          <section>
            <h3>Foro competente</h3>
            <p>
              Per eventuali controversie è competente il Foro di [Città], Italia.
            </p>
          </section>
        </div>
        
        <div class="modal-footer">
          <button @click="showLegalModal = false" class="btn-primary">
            {{ t('legalFooter.legalModalClose') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Compact Legal Footer con layout a 3 aree */
.legal-footer {
  position: relative;
  width: 100%;
  min-height: calc(0.75rem + 6rem + 0.75rem);
  background: var(--bg-secondary-30);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--bg-secondary-50);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  margin-top: auto;
}

/* Area sinistra - Brand */
.footer-left {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
}

.footer-brand {
  font-size: clamp(0.625rem, 2vw, 0.75rem);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

/* Area centrale - Spacer per BottomBar */
.footer-center {
  width: calc(100vw - 3rem);
  max-width: 600px;
  min-width: 300px;
  pointer-events: none;
}

/* Area destra - Links */
.footer-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: var(--text-secondary);
  font-size: clamp(0.625rem, 2vw, 0.75rem);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.2s;
  white-space: nowrap;
}

.footer-link:hover,
.footer-link:focus {
  color: var(--accent-primary);
  text-decoration: underline;
}

.footer-separator {
  color: var(--border-color);
  font-size: clamp(0.625rem, 2vw, 0.75rem);
  user-select: none;
}

.footer-license {
  color: var(--text-secondary);
  font-size: clamp(0.6rem, 1.8vw, 0.7rem);
  font-weight: 500;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 768px) {
  .legal-footer {
    min-height: calc(0.5rem + 2.5rem + 0.5rem);
  }

  .footer-left,
  .footer-right {
    padding: 0.5rem 0.75rem;
  }

  .footer-center {
    width: auto;
    max-width: none;
    min-width: 200px;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.375rem;
    align-items: flex-end;
  }

  .footer-separator {
    display: none;
  }
}

@media (max-width: 480px) {
  .legal-footer {
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
    padding: 0 0.5rem;
  }
  
  .footer-brand {
    font-size: 0.625rem;
  }
  
  .footer-left {
    padding: 0.5rem 0.25rem;
  }

  .footer-center {
    flex: 1;
    width: auto;
    min-width: 0;
  }
  
  .footer-right {
    padding: 0.5rem 0.25rem;
  }
  
  .footer-links {
    gap: 0.25rem;
    align-items: flex-end;
  }
  
  .footer-link,
  .footer-license {
    font-size: 0.625rem;
  }
}

/* Cookie Banner */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary-98);
  backdrop-filter: blur(10px);
  border-top: 2px solid var(--accent-primary);
  box-shadow: 0 -4px 20px var(--text-primary-10);
  padding: 1.5rem;
  z-index: 10000;
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
}

.cookie-content h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.cookie-content p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cookie-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cookie-btn-primary {
  background: var(--accent-primary);
  color: white;
}

.cookie-btn-primary:hover {
  background: var(--accent-primary-85-black);
  transform: translateY(-1px);
}

.cookie-btn-secondary {
  background: var(--bg-secondary-95);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.cookie-btn-secondary:hover {
  background: var(--border-color);
}

.cookie-btn-link {
  background: transparent;
  color: var(--accent-primary);
  text-decoration: underline;
}

.cookie-btn-link:hover {
  color: var(--accent-primary-85-black);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--text-primary-50);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 1rem;
  overflow-y: auto;
}

.modal-container {
  background: var(--bg-primary);
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px var(--text-primary-20);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
  border-radius: 0.5rem;
}

.modal-close:hover {
  color: var(--text-primary);
  background: var(--bg-secondary-95);
}

.icon-close {
  width: 1.5rem;
  height: 1.5rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-body section {
  margin-bottom: 2rem;
}

.modal-body h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.modal-body h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.modal-body p,
.modal-body li {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

.modal-body ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.modal-body li {
  margin-bottom: 0.5rem;
}

.modal-body a {
  color: var(--accent-primary);
  text-decoration: underline;
}

.modal-body a:hover {
  color: var(--accent-primary-85-black);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--accent-primary-85-black);
  transform: translateY(-1px);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cookie-actions {
    flex-direction: column;
  }
  
  .cookie-btn {
    width: 100%;
  }
  
  .modal-container {
    max-height: 95vh;
    margin: 0.5rem;
  }
}
</style>
