<template>
  <section v-if="user" class="page-intro p-6 md:p-10">
    <div class="flex flex-col gap-6 md:flex-row md:items-start">
      <!-- Avatar -->
      <div class="shrink-0">
        <img
          v-if="user.avatar_url"
          :src="user.avatar_url"
          :alt="user.full_name"
          class="size-24 rounded-full object-cover shadow-lg ring-4 ring-white/60 md:size-28 dark:ring-white/10"
        />
        <span
          v-else
          class="grid size-24 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] font-display text-3xl font-black text-white shadow-lg md:size-28"
        >
          {{ initials }}
        </span>
      </div>

      <div class="min-w-0 flex-1">
        <div class="eyebrow mb-3">{{ roleLabel }}</div>
        <h1 class="app-section-title mb-2">{{ greeting }}</h1>

        <p v-if="user.headline" class="mb-3 font-semibold text-primary">{{ user.headline }}</p>

        <p v-if="user.bio" class="mb-4 max-w-2xl text-muted-foreground" :class="bioExpanded ? '' : 'line-clamp-3'">
          {{ user.bio }}
        </p>
        <button
          v-if="user.bio && user.bio.length > 180"
          class="mb-4 -mt-2 block text-xs font-bold text-primary underline-offset-2 hover:underline"
          @click="bioExpanded = !bioExpanded"
        >
          {{ bioExpanded ? 'Show less' : 'Show more' }}
        </button>

        <p v-if="!user.headline && !user.bio" class="mb-4 max-w-2xl text-muted-foreground">
          {{ fallbackSubtitle }}
        </p>

        <!-- Meta chips -->
        <div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span v-for="meta in metaChips" :key="meta.label" class="inline-flex items-center gap-1.5">
            <app-icon :name="meta.icon" size="14" />
            {{ meta.label }}
          </span>
        </div>

        <!-- Social links -->
        <div v-if="socialLinks.length" class="flex flex-wrap items-center gap-2">
          <a
            v-for="link in socialLinks"
            :key="link.key"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-primary/50 hover:text-primary dark:border-white/15 dark:bg-white/5"
            :title="link.label"
          >
            <app-icon :name="link.icon" size="15" />
            {{ link.handle }}
          </a>
        </div>
      </div>

      <!-- Completeness -->
      <div
        v-if="completeness.percent < 100"
        class="w-full shrink-0 rounded-2xl border border-black/5 bg-white/60 p-4 md:w-64 dark:border-white/10 dark:bg-white/5"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-bold tracking-wide uppercase">Profile strength</span>
          <span class="font-display text-sm font-black">{{ completeness.percent }}%</span>
        </div>
        <div class="mb-3 h-2 overflow-hidden rounded-full bg-foreground/10">
          <div
            class="h-full rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] transition-[width] duration-500"
            :style="{ width: `${completeness.percent}%` }"
          ></div>
        </div>
        <ul class="mb-3 flex flex-col gap-1.5">
          <li
            v-for="todo in completeness.missing.slice(0, 3)"
            :key="todo"
            class="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <app-icon name="lucide:circle-dashed" size="13" /> {{ todo }}
          </li>
        </ul>
        <button
          class="w-full rounded-full bg-primary/12 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
          @click="$router.push('/user/profile')"
        >
          Complete your profile
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import AppIcon from '@/components/ui/AppIcon.vue'

/** Social columns on the user record, in the order they should appear. */
const SOCIAL_FIELDS = [
  { key: 'website_url', label: 'Website', icon: 'lucide:globe' },
  { key: 'github_url', label: 'GitHub', icon: 'mdi:github' },
  { key: 'linkedin_url', label: 'LinkedIn', icon: 'mdi:linkedin' },
  { key: 'twitter_url', label: 'Twitter / X', icon: 'mdi:twitter' },
  { key: 'youtube_url', label: 'YouTube', icon: 'mdi:youtube' }
]

/** What counts towards a "complete" profile, and how to ask for what's missing. */
const COMPLETENESS_FIELDS = [
  { key: 'avatar_url', todo: 'Add a profile photo' },
  { key: 'headline', todo: 'Add a headline' },
  { key: 'bio', todo: 'Write a short bio' },
  { key: 'address', todo: 'Add your location' },
  { key: 'phone', todo: 'Add a contact number' }
]

export default {
  name: 'ProfileHeader',
  components: { AppIcon },
  data() {
    return { bioExpanded: false }
  },
  computed: {
    ...mapGetters(['user']),
    initials() {
      return (this.user.full_name || '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
    },
    roleLabel() {
      return this.user.user_role === 'Student' ? 'My Learning' : 'Tutor Dashboard'
    },
    greeting() {
      return this.user.user_role === 'Student'
        ? `Welcome back, ${this.user.full_name}`
        : `Manage your courses, ${this.user.full_name}`
    },
    fallbackSubtitle() {
      return this.user.user_role === 'Student'
        ? 'Pick up where you left off, revisit saved courses, and keep your learning queue clean.'
        : 'Review your published catalog and jump back into course creation without leaving the main workflow.'
    },
    memberSince() {
      if (!this.user.created_at) return null
      const date = new Date(this.user.created_at)
      if (Number.isNaN(date.getTime())) return null
      return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    },
    metaChips() {
      const chips = [{ icon: 'lucide:mail', label: this.user.email }]
      if (this.user.address) chips.push({ icon: 'lucide:map-pin', label: this.user.address })
      if (this.memberSince) chips.push({ icon: 'lucide:calendar', label: `Member since ${this.memberSince}` })
      return chips
    },
    socialLinks() {
      return SOCIAL_FIELDS
        .filter((field) => this.user[field.key])
        .map((field) => ({
          ...field,
          url: this.normalizeUrl(this.user[field.key]),
          handle: this.handleFor(this.user[field.key], field.label)
        }))
    },
    completeness() {
      const done = COMPLETENESS_FIELDS.filter((field) => this.user[field.key])
      const missing = COMPLETENESS_FIELDS.filter((field) => !this.user[field.key]).map((field) => field.todo)

      // Any one social link counts as a single step, so a learner is not pushed
      // to fill in all five to reach 100%.
      const hasSocial = SOCIAL_FIELDS.some((field) => this.user[field.key])
      if (!hasSocial) missing.push('Link a social profile')

      const total = COMPLETENESS_FIELDS.length + 1
      const completed = done.length + (hasSocial ? 1 : 0)
      return { percent: Math.round((completed / total) * 100), missing }
    }
  },
  methods: {
    /** Stored links may omit the scheme; an href without one is read as a relative path. */
    normalizeUrl(value) {
      const url = String(value).trim()
      return /^https?:\/\//i.test(url) ? url : `https://${url}`
    },
    /** Prefer the last path segment (the username) over the raw URL. */
    handleFor(value, fallback) {
      try {
        const { hostname, pathname } = new URL(this.normalizeUrl(value))
        const segment = pathname.split('/').filter(Boolean).pop()
        return segment ? `@${segment}` : hostname.replace(/^www\./, '')
      } catch {
        return fallback
      }
    }
  }
}
</script>
