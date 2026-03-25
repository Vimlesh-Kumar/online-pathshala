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

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1f8b53',
          secondary: '#4aba8c',
          surface: '#ffffff',
          background: '#f8fff9',
          info: '#0b2d20',
          success: '#20a460',
          warning: '#d1f9d7',
          error: '#b42318',
        },
      },
    },
  },
})
