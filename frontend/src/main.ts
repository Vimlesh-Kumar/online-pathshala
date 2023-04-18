/**
 * main.ts
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
import './axios';
import httpInterceptor from './interceptor'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)
httpInterceptor();
registerPlugins(app)

app.mount('#app')
