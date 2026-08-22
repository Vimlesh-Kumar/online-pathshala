/**
 * main.ts
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
import './axios';
import './styles/tailwind.css';
import './styles/global.css';
import httpInterceptor from './interceptor';
import store from './store/store'
import router from './router'
import { setupPwa } from './utils/pwa'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)
httpInterceptor(router);
registerPlugins(app)
app.use(store)

// Service worker, install prompt and online/offline tracking.
setupPwa()

app.mount('#app')
