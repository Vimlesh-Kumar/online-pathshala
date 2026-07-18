/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
// @ts-ignore
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Vibrant SaaS palette (violet → indigo → cyan) with light + dark themes.
export default createVuetify({
  defaults: {
    VBtn: { rounded: 'pill', style: 'text-transform:none;font-weight:700;letter-spacing:0;' },
    VCard: { rounded: 'xl' },
    VTextField: { rounded: 'lg' },
    VChip: { rounded: 'pill' },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#6366f1',
          secondary: '#06b6d4',
          accent: '#f43f5e',
          surface: '#ffffff',
          background: '#f6f7fb',
          info: '#6366f1',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#818cf8',
          secondary: '#22d3ee',
          accent: '#fb7185',
          surface: '#111a2e',
          background: '#0b1120',
          info: '#818cf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    },
  },
})
