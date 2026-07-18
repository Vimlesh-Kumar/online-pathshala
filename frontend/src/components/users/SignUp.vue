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
          <h2 class="auth-aside-title mb-4">Start learning<br />for free.</h2>
          <p class="auth-aside-copy mb-8">Join thousands of learners. Create an account and explore the full catalog.</p>

          <ul class="perk-list mt-auto">
            <li><v-icon size="18" class="mr-2">mdi-check-circle</v-icon> Track your progress</li>
            <li><v-icon size="18" class="mr-2">mdi-check-circle</v-icon> Earn certificates</li>
            <li><v-icon size="18" class="mr-2">mdi-check-circle</v-icon> Teach your own courses</li>
          </ul>
        </v-col>

        <!-- Form -->
        <v-col cols="12" md="7" class="pa-8 pa-md-12">
          <h1 class="auth-title mb-2">Create account</h1>
          <p class="app-section-copy mb-6">It only takes a minute.</p>

          <form @submit.prevent="userRegister">
            <error :error="error"></error>
            <v-text-field v-model="state.name" :error-messages="v$.name.$errors.map(e => e.$message)"
              :counter="50" label="Name" variant="outlined" prepend-inner-icon="mdi-account-outline"
              required @input="v$.name.$touch" @blur="v$.name.$touch"></v-text-field>

            <v-text-field v-model="state.email" :error-messages="v$.email.$errors.map(e => e.$message)"
              label="E-mail" variant="outlined" prepend-inner-icon="mdi-email-outline"
              required @input="v$.email.$touch" @blur="v$.email.$touch"></v-text-field>

            <v-text-field v-model="state.password" :error-messages="v$.password.$errors.map(e => e.$message)"
              type="password" label="Password" variant="outlined" prepend-inner-icon="mdi-lock-outline"
              required @input="v$.password.$touch" @blur="v$.password.$touch"></v-text-field>

            <v-select v-model="state.select" :items="['Student', 'Tutor']"
              :error-messages="v$.select.$errors.map(e => e.$message)" label="Register as" variant="outlined"
              required @change="v$.select.$touch" @blur="v$.select.$touch"></v-select>

            <v-checkbox v-model="state.checkbox" :error-messages="v$.checkbox.$errors.map(e => e.$message)"
              label="I agree to the terms" color="primary" required @change="v$.checkbox.$touch"
              @blur="v$.checkbox.$touch"></v-checkbox>

            <div class="d-flex ga-3 mt-2">
              <v-btn class="btn-gradient flex-grow-1" size="large" type="submit" @click="v$.$validate">
                Sign up
              </v-btn>
              <v-btn variant="tonal" size="large" @click="clear">Clear</v-btn>
            </div>
          </form>

          <div class="mt-6 text-body-2">
            Already have an account?
            <router-link to="/user/sign-in" class="auth-link">Sign in</router-link>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import { reactive, } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required } from '@vuelidate/validators';
import axios from 'axios';
import Error from './../Message&Error/error.vue'

export default {
    components: {
        Error
    },
    data() {
        return {
            error: '',
        }
    },
    setup() {
        const initialState = {
            name: '',
            email: '',
            password: '',
            select: null,
            checkbox: null,
        }

        const state = reactive({
            ...initialState,
        })

        const rules = {
            name: { required },
            email: { required, email },
            password: { required },
            select: { required },
            roles: { required },
            checkbox: { required },
        }

        const v$ = useVuelidate(rules, state)

        function clear() {
            v$.value.$reset()

            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value
            }
        }

        return { state, clear, v$ }
    },

    methods: {
        async userRegister() {
            try {
                const user = {
                    full_name: this.state.name,
                    email: this.state.email,
                    password: this.state.password,
                    user_role: this.state.select
                }
                await axios.post('user/signup', user)
                this.$router.push('/user/sign-in');
            } catch (e) {
                this.error = 'Sorry, This email already exists, Please try a different email address to register or login to your account.'
            }
        }
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
.perk-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.perk-list li { display: flex; align-items: center; font-weight: 600; }

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
