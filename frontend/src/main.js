import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Estilos globales
import './assets/styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

import('bootstrap/dist/js/bootstrap.bundle.min.js').then(() => {
    console.log('✅ Bootstrap JS cargado:', typeof window.bootstrap)
})