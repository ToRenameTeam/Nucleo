import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './plugins/i18n'
import { useTheme } from './composables/useTheme'

// Inizializza il tema all'avvio
useTheme()

createApp(App)
  .use(router)
  .use(i18n)
  .mount('#app')
