<template>
  <div class="mx-auto max-w-3xl px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Certificate Check</div>
      <h1 class="app-section-title mb-3">Verify a certificate</h1>
      <p class="text-muted-foreground">
        Every Online Pathshala certificate carries an id like <strong>OP-1A2B-3C4D</strong>. Enter it
        below to confirm who earned it, and for which course.
      </p>
    </section>

    <div class="glass-panel section-card mb-6 p-6">
      <div class="flex flex-col gap-3 sm:flex-row">
        <div class="relative flex flex-1 items-center">
          <app-icon
            name="lucide:shield-check"
            size="18"
            class="pointer-events-none absolute left-4 text-muted-foreground"
          />
          <input
            v-model="key"
            type="text"
            aria-label="Certificate id"
            placeholder="OP-1A2B-3C4D"
            class="h-12 w-full rounded-2xl border border-black/10 bg-foreground/[0.04] pr-4 pl-11 tracking-wider uppercase outline-none transition placeholder:normal-case placeholder:text-muted-foreground focus:border-primary/50 focus:ring-3 focus:ring-primary/20 dark:border-white/12"
            @keyup.enter="verify"
          />
        </div>
        <button class="btn-brand shrink-0" :disabled="checking || !key.trim()" @click="verify">
          <app-icon
            :name="checking ? 'lucide:loader-circle' : 'lucide:search'"
            size="18"
            :class="checking ? 'animate-spin' : ''"
          />
          Verify
        </button>
      </div>
    </div>

    <div v-if="checked && certificate" class="section-card border border-emerald-500/30 bg-emerald-500/10 p-6">
      <div class="mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <app-icon name="lucide:badge-check" size="24" />
        <span class="font-display text-lg font-bold">Genuine certificate</span>
      </div>
      <dl class="grid gap-4 sm:grid-cols-2">
        <div v-for="row in rows" :key="row.label">
          <dt class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {{ row.label }}
          </dt>
          <dd class="font-display text-lg font-bold">{{ row.value }}</dd>
        </div>
      </dl>
    </div>

    <div
      v-else-if="checked"
      class="section-card border border-destructive/30 bg-destructive/10 p-6 text-center"
    >
      <app-icon name="lucide:circle-alert" size="44" class="mx-auto mb-3 text-destructive" />
      <h2 class="mb-1 font-display text-lg font-bold">No certificate matches that id.</h2>
      <p class="text-sm text-muted-foreground">
        Check the id printed on the certificate and try again.
      </p>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'

export default {
  name: 'VerifyCertificate',
  components: { AppIcon },
  data() {
    return { key: '', checking: false, checked: false, certificate: null }
  },
  computed: {
    rows() {
      if (!this.certificate) return []
      return [
        { label: 'Awarded to', value: this.certificate.holder },
        { label: 'Course', value: this.certificate.courseTitle },
        { label: 'Instructor', value: this.certificate.instructor },
        { label: 'Issued on', value: this.formatDate(this.certificate.grantedAt) },
        { label: 'Certificate id', value: this.certificate.certificateKey },
      ]
    },
  },
  created() {
    // /verify/OP-1A2B-3C4D checks straight away; /verify just shows the form.
    const routeKey = this.$route.params.key
    if (routeKey) {
      this.key = String(routeKey)
      this.verify()
    }
  },
  methods: {
    async verify() {
      const key = this.key.trim()
      if (!key) return

      this.checking = true
      try {
        const result = await this.$store.dispatch('verifyCertificate', key)
        this.certificate = result?.valid ? result.certificate : null
        this.checked = true
      } catch (error) {
        console.error(error)
        this.checked = false
        toast.error(error?.response?.data?.message || 'Could not check that certificate.')
      } finally {
        this.checking = false
      }
    },
    formatDate(value) {
      return value
        ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : ''
    },
  },
}
</script>
