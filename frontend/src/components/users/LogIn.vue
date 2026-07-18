<template>
  <v-container class="app-section d-flex justify-center">
    <v-card class="auth-card glass-panel" flat max-width="960">
      <v-row no-gutters>
        <!-- Marketing panel -->
        <v-col cols="12" md="5" class="auth-aside pa-8 pa-md-10 d-none d-md-flex flex-column">
          <div class="d-flex align-center mb-8">
            <v-avatar rounded="lg" size="40" class="auth-mark mr-3">
              <v-icon color="white">mdi-school</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-bold">Pathshala</span>
          </div>
          <h2 class="auth-aside-title mb-4">Welcome back.<br />Keep learning.</h2>
          <p class="auth-aside-copy mb-8">Pick up right where you left off and keep building job-ready skills.</p>

          <div class="demo-box mt-auto">
            <div class="text-caption font-weight-bold mb-1">Try the demo</div>
            <div class="text-body-2">admin@test.com</div>
            <div class="text-body-2">Test@1234</div>
          </div>
        </v-col>

        <!-- Form -->
        <v-col cols="12" md="7" class="pa-8 pa-md-12">
          <h1 class="auth-title mb-2">Log in</h1>
          <p class="app-section-copy mb-7">Enter your details to access your account.</p>

          <v-form v-model="form" @submit.prevent="onSubmit">
            <error :error="error"></error>

            <v-text-field
              v-model="email" :readonly="loading" :rules="[required]" clearable
              label="Email" variant="outlined" prepend-inner-icon="mdi-email-outline" class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="password" type="password" :readonly="loading" :rules="[required]" clearable
              label="Password" variant="outlined" prepend-inner-icon="mdi-lock-outline" class="mb-4"
            ></v-text-field>

            <v-btn :disabled="!form" :loading="loading" class="btn-gradient mb-4" block size="large" type="submit">
              Sign In <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-form>

          <div class="text-body-2">
            Don't have an account?
            <router-link to="/user/sign-up" class="auth-link">Sign up free</router-link>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';
import Error from './../Message&Error/error.vue'

export default {
    components: {
        Error
    },
    data: () => ({
        form: false,
        email: null,
        password: null,
        loading: false,
        error: ''
    }),

    methods: {
        async onSubmit() {
            if (!this.form) return
            this.loading = true
            this.error = ''
            try {
                const response = await axios.post('user/signin', {
                    email: this.email,
                    password: this.password
                })
                // API returns { success, message, data: { user, token } }
                const token = response.data?.data?.token
                if (!token) throw new Error('No token returned')
                localStorage.setItem('token', token)
                await this.$store.dispatch('fetchingUser')
                this.$router.push('/user')
            } catch (e) {
                this.error = 'There was a problem logging in. Check your email and password or create an account.'
            } finally {
                this.loading = false
            }
        },
        required(v) {
            return !!v || 'Field is required'
        },
    },
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  border-radius: var(--r-xl);
  overflow: hidden;
  margin-top: 24px;
}

.auth-aside {
  background: var(--grad-primary);
  color: #fff;
}
.auth-mark { background: rgba(255, 255, 255, 0.2); }
.auth-aside-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.1;
}
.auth-aside-copy { opacity: 0.9; line-height: 1.7; }
.demo-box {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--r-md);
  padding: 14px 16px;
  backdrop-filter: blur(6px);
}

.auth-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-strong);
}
.auth-link {
  color: var(--brand-2);
  font-weight: 700;
  text-decoration: none;
}
.auth-link:hover { text-decoration: underline; }
</style>
