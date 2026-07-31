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


app.mount('#app')
