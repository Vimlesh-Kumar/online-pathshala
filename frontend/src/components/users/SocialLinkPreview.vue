<template>
  <div
    v-if="loading || preview"
    class="mt-2 rounded-2xl border border-black/5 bg-foreground/[0.03] p-3 dark:border-white/10"
  >
    <!-- Loading -->
    <div v-if="loading" class="flex items-center gap-3">
      <div class="size-11 shrink-0 animate-pulse rounded-xl bg-foreground/10"></div>
      <div class="min-w-0 flex-1">
        <div class="mb-2 h-3 w-1/3 animate-pulse rounded bg-foreground/10"></div>
        <div class="h-3 w-2/3 animate-pulse rounded bg-foreground/10"></div>
      </div>
    </div>

    <!-- Could not read the link at all -->
    <div v-else-if="preview.error" class="flex items-center gap-2 text-xs text-amber-500">
      <app-icon name="lucide:triangle-alert" size="15" class="shrink-0" />
      {{ preview.error }}
    </div>

    <div v-else class="flex items-start gap-3">
      <!-- A remote image that fails to load falls back to the favicon. -->
      <img
        v-if="preview.image && !imageBroken"
        :src="preview.image"
        :alt="preview.title || preview.handle"
        class="size-11 shrink-0 rounded-xl object-cover"
        loading="lazy"
        @error="imageBroken = true"
      />
      <img
        v-else
        :src="preview.favicon"
        :alt="preview.domain"
        class="size-11 shrink-0 rounded-xl bg-white/60 object-contain p-2 dark:bg-white/10"
        loading="lazy"
      />

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2">
          <span class="truncate font-bold">{{ preview.title || preview.handle }}</span>
          <span v-if="preview.title" class="truncate text-xs text-muted-foreground">
            {{ preview.handle }}
          </span>
        </div>

        <p v-if="preview.description" class="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {{ preview.description }}
        </p>

        <div
          v-if="preview.details?.length"
          class="mt-1 flex flex-wrap gap-x-3 text-[0.68rem] text-muted-foreground"
        >
          <span v-for="detail in preview.details" :key="detail" class="inline-flex items-center gap-1">
            <app-icon name="lucide:map-pin" size="11" /> {{ detail }}
          </span>
        </div>

        <div v-if="preview.stats?.length" class="mt-1.5 flex flex-wrap gap-3">
          <span v-for="stat in preview.stats" :key="stat.label" class="text-[0.7rem] text-muted-foreground">
            <strong class="text-foreground">{{ formatCount(stat.value) }}</strong> {{ stat.label }}
          </span>
        </div>

        <p v-if="preview.note" class="mt-1 text-[0.68rem] text-muted-foreground italic">
          {{ preview.note }}
        </p>
      </div>

      <a
        :href="preview.url"
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary"
        :title="`Open ${preview.domain}`"
      >
        <app-icon name="lucide:external-link" size="16" />
      </a>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

/** Wait for typing to settle before asking the server to fetch a URL. */
const DEBOUNCE_MS = 800

export default {
  name: 'SocialLinkPreview',
  components: { AppIcon },
  props: {
    url: { type: String, default: '' }
  },
  data() {
    return { preview: null, loading: false, imageBroken: false, timer: null, requestId: 0 }
  },
  watch: {
    url: {
      immediate: true,
      handler() {
        this.schedule()
      }
    }
  },
  beforeUnmount() {
    if (this.timer) clearTimeout(this.timer)
  },
  methods: {
    /** Only a link that already looks complete is worth a round trip. */
    looksComplete(value) {
      const trimmed = String(value || '').trim()
      if (trimmed.length < 6) return false
      const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      try {
        const { hostname } = new URL(withScheme)
        return hostname.includes('.') && !hostname.endsWith('.')
      } catch {
        return false
      }
    },
    schedule() {
      if (this.timer) clearTimeout(this.timer)

      if (!this.looksComplete(this.url)) {
        this.preview = null
        this.loading = false
        return
      }
      this.timer = setTimeout(() => this.load(), DEBOUNCE_MS)
    },
    async load() {
      // A slow response for an old URL must not overwrite a newer one.
      const requestId = ++this.requestId
      this.loading = true
      this.imageBroken = false

      try {
        const previews = await this.$store.dispatch('fetchLinkPreviews', [this.url])
        if (requestId !== this.requestId) return
        this.preview = previews[0] || null
      } catch (error) {
        if (requestId !== this.requestId) return
        this.preview = null
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
    formatCount(value) {
      const number = Number(value) || 0
      if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`
      if (number >= 1_000) return `${(number / 1_000).toFixed(1)}k`
      return String(number)
    }
  }
}
</script>
