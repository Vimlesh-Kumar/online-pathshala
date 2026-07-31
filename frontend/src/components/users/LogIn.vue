<template>
  <div class="mx-auto flex max-w-[1400px] justify-center px-4 pt-10 pb-14">
    <div
      class="glass-panel grid w-full max-w-[960px] overflow-hidden rounded-[34px] md:grid-cols-12"
    >
      <!-- Marketing panel -->
      <aside
        class="hidden flex-col bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] p-8 text-white md:col-span-5 md:flex md:p-10"
      >
        <div class="mb-8 flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-xl bg-white/20">
            <app-icon name="lucide:graduation-cap" size="22" />
          </span>
          <span class="font-display text-xl font-bold">Pathshala</span>
        </div>
        <h2 class="mb-4 font-display text-3xl leading-tight font-extrabold">
          Welcome back.<br />Keep learning.
        </h2>
        <p class="mb-8 leading-relaxed opacity-90">
          Pick up right where you left off and keep building job-ready skills.
        </p>

        <div class="mt-auto rounded-[18px] border border-white/25 bg-white/15 px-4 py-3.5 backdrop-blur-sm">
          <div class="mb-1 text-xs font-bold">Try the demo</div>
          <div class="text-sm">admin@test.com</div>
          <div class="text-sm">Test@1234</div>
        </div>
      </aside>

      <!-- Form -->
      <div class="p-8 md:col-span-7 md:p-12">
        <h1 class="mb-2 font-display text-3xl font-extrabold">Log in</h1>
        <p class="mb-7 text-muted-foreground">Enter your details to access your account.</p>

        <form novalidate @submit.prevent="onSubmit">
          <error-alert :error="error"></error-alert>

          <app-field
            v-model="email"
            class="mb-3"
            label="Email"
            type="email"
            icon="lucide:mail"
            placeholder="you@example.com"
            :readonly="loading"
            :error="touched ? emailError : ''"
            required
          />

          <app-field
            v-model="password"
            class="mb-5"
            label="Password"
            type="password"
            icon="lucide:lock"
            placeholder="Your password"
            :readonly="loading"
            :error="touched ? passwordError : ''"
            required
          />

          <button type="submit" class="btn-brand mb-4 w-full" :disabled="loading">
            <template v-if="loading">
              <app-icon name="lucide:loader-circle" size="18" class="animate-spin" /> Signing in…
            </template>
            <template v-else>
              Sign In <app-icon name="lucide:arrow-right" size="18" />
            </template>
          </button>
        </form>

        <div class="text-sm">
          Don't have an account?
          <router-link to="/user/sign-up" class="font-bold text-primary hover:underline">
            Sign up free
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// Aliased: the component was previously imported as `Error`, which shadowed the
// global Error constructor used below.
import ErrorAlert from './../Message&Error/error.vue'
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
    components: {
        ErrorAlert,
        AppField,
        AppIcon
    },
    data: () => ({
        email: '',
        password: '',
        loading: false,
        touched: false,
        error: ''
    }),

    computed: {
        emailError() {
            return this.email ? '' : 'Field is required'
        },
        passwordError() {
            return this.password ? '' : 'Field is required'
        },
        formValid() {
            return !this.emailError && !this.passwordError
        }
    },

    methods: {
        async onSubmit() {
            this.touched = true
            if (!this.formValid) return
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
        }
    },
}
</script>
