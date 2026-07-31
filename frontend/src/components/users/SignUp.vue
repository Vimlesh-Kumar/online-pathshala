<template>
  <div class="mx-auto flex max-w-[1400px] justify-center px-4 pt-10 pb-14">
    <div class="glass-panel grid w-full max-w-[960px] overflow-hidden rounded-[34px] md:grid-cols-12">
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
          Start learning<br />for free.
        </h2>
        <p class="mb-8 leading-relaxed opacity-90">
          Join thousands of learners. Create an account and explore the full catalog.
        </p>

        <ul class="mt-auto flex list-none flex-col gap-2.5 p-0">
          <li v-for="perk in perks" :key="perk" class="flex items-center gap-2 font-semibold">
            <app-icon name="lucide:circle-check-big" size="18" /> {{ perk }}
          </li>
        </ul>
      </aside>

      <!-- Form -->
      <div class="p-8 md:col-span-7 md:p-12">
        <h1 class="mb-2 font-display text-3xl font-extrabold">Create account</h1>
        <p class="mb-6 text-muted-foreground">It only takes a minute.</p>

        <form novalidate @submit.prevent="userRegister">
          <error-alert :error="error"></error-alert>

          <app-field
            v-model="state.name"
            class="mb-4"
            label="Name"
            icon="lucide:user"
            placeholder="Your full name"
            :error="firstError(v$.name)"
            :hint="`${state.name.length}/50`"
            required
            @blur="v$.name.$touch"
          />

          <app-field
            v-model="state.email"
            class="mb-4"
            label="E-mail"
            type="email"
            icon="lucide:mail"
            placeholder="you@example.com"
            :error="firstError(v$.email)"
            required
            @blur="v$.email.$touch"
          />

          <app-field
            v-model="state.password"
            class="mb-4"
            label="Password"
            type="password"
            icon="lucide:lock"
            placeholder="Choose a password"
            :error="firstError(v$.password)"
            required
            @blur="v$.password.$touch"
          />

          <div class="mb-4 flex flex-col gap-1.5">
            <span class="text-sm font-semibold">Register as <span class="text-destructive">*</span></span>
            <select-root v-model="state.select" @update:model-value="v$.select.$touch">
              <select-trigger class="h-12 w-full rounded-2xl" aria-label="Register as">
                <select-value placeholder="Choose a role" />
              </select-trigger>
              <select-content class="rounded-2xl">
                <select-item value="Student">Student</select-item>
                <select-item value="Tutor">Tutor</select-item>
              </select-content>
            </select-root>
            <p v-if="firstError(v$.select)" class="text-xs text-destructive">{{ firstError(v$.select) }}</p>
          </div>

          <div class="mb-2 flex flex-col gap-1.5">
            <div class="flex items-center gap-2.5">
              <checkbox id="terms" v-model="state.checkbox" @update:model-value="v$.checkbox.$touch" />
              <label for="terms" class="cursor-pointer text-sm">I agree to the terms</label>
            </div>
            <p v-if="firstError(v$.checkbox)" class="text-xs text-destructive">
              {{ firstError(v$.checkbox) }}
            </p>
          </div>

          <div class="mt-4 flex gap-3">
            <button type="submit" class="btn-brand flex-1">Sign up</button>
            <button
              type="button"
              class="rounded-full bg-primary/12 px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/20"
              @click="clear"
            >
              Clear
            </button>
          </div>
        </form>

        <div class="mt-6 text-sm">
          Already have an account?
          <router-link to="/user/sign-in" class="font-bold text-primary hover:underline">Sign in</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required } from '@vuelidate/validators';
import axios from 'axios';
// Aliased so it no longer shadows the global Error constructor.
import ErrorAlert from './../Message&Error/error.vue'
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select as SelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

export default {
    components: {
        ErrorAlert,
        AppField,
        AppIcon,
        Checkbox,
        SelectRoot,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue
    },
    data() {
        return {
            error: '',
            perks: ['Track your progress', 'Earn certificates', 'Teach your own courses']
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

        // NOTE: a stray `roles` rule used to live here with no matching state
        // field, which kept the form permanently invalid. Harmless while submit
        // ignored validation; removed now that submit actually gates on it.
        const rules = {
            name: { required },
            email: { required, email },
            password: { required },
            select: { required },
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
        firstError(field) {
            return field.$errors.length ? field.$errors[0].$message : ''
        },
        async userRegister() {
            const valid = await this.v$.$validate()
            if (!valid) return
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
