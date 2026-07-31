<template>
  <footer class="mt-20 px-4 pb-10 text-foreground/90">
    <div class="mx-auto max-w-[1400px]">
      <!-- Decorative top divider -->
      <div
        class="mb-10 h-0.5 rounded-full bg-linear-to-r from-transparent via-[#6366f1] to-transparent opacity-40"
      ></div>

      <div
        class="relative grid gap-10 overflow-hidden rounded-[34px] border border-white/10 bg-white/60 p-8 shadow-xl backdrop-blur-2xl md:p-12 lg:grid-cols-12 dark:bg-white/5"
      >
        <!-- Ambient glows -->
        <div
          class="pointer-events-none absolute -top-1/2 -right-[20%] size-[400px] rounded-full bg-[radial-gradient(circle,rgb(124_58_237_/_0.12),transparent_70%)]"
        ></div>
        <div
          class="pointer-events-none absolute -bottom-[30%] -left-[10%] size-[300px] rounded-full bg-[radial-gradient(circle,rgb(6_182_212_/_0.1),transparent_70%)]"
        ></div>

        <!-- Brand + developer spotlight -->
        <div class="relative lg:col-span-5 lg:pr-12">
          <div class="mb-6 flex items-center gap-4">
            <div
              class="grid size-12 place-items-center rounded-2xl bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] shadow-[0_8px_24px_rgb(124_58_237_/_0.35)]"
            >
              <app-icon name="lucide:graduation-cap" size="26" class="text-white" />
            </div>
            <div>
              <div class="gradient-text font-display text-[1.4rem] leading-tight font-extrabold tracking-tight">
                Online Pathshala
              </div>
              <div class="text-[0.78rem] font-medium text-muted-foreground">Learn anything, beautifully</div>
            </div>
          </div>

          <p class="mb-6 max-w-prose leading-relaxed text-muted-foreground">
            A full-stack learning management platform built with modern web technologies. Designed and
            developed as a comprehensive project showcasing end-to-end software engineering skills.
          </p>

          <div class="rounded-3xl border border-white/10 bg-foreground/[0.03] p-5">
            <div class="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase">
              <app-icon name="lucide:code" size="14" class="text-[#7c3aed]" />
              <span class="text-muted-foreground">Developed by</span>
            </div>
            <div class="font-display text-lg font-extrabold">Vimlesh Kumar</div>
            <div class="text-sm text-muted-foreground">Full Stack Developer</div>
            <div class="mt-4 flex flex-wrap gap-2">
              <a
                v-for="social in socials"
                :key="social.label"
                :href="social.href"
                :target="social.href.startsWith('mailto:') ? undefined : '_blank'"
                rel="noopener"
                :aria-label="social.label"
                class="grid size-9 place-items-center rounded-xl border border-white/10 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
              >
                <app-icon :name="social.icon" size="18" />
              </a>
            </div>
          </div>
        </div>

        <!-- Link columns -->
        <nav
          v-for="column in linkColumns"
          :key="column.heading"
          class="relative col-span-6 sm:col-span-4 lg:col-span-2"
        >
          <div class="mb-4 text-xs font-extrabold tracking-widest uppercase">{{ column.heading }}</div>
          <div class="flex flex-col items-start gap-2.5">
            <component
              :is="link.href ? 'a' : 'button'"
              v-for="link in column.links"
              :key="link.label"
              :href="link.href"
              :target="link.href ? '_blank' : undefined"
              :rel="link.href ? 'noopener' : undefined"
              class="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              @click="link.path && $router.push(link.path)"
            >
              <app-icon :name="link.icon" size="14" />
              {{ link.label }}
            </component>
          </div>
        </nav>

        <!-- Tech stack + categories -->
        <div class="relative sm:col-span-4 lg:col-span-3">
          <div class="mb-4 text-xs font-extrabold tracking-widest uppercase">Built With</div>
          <div class="mb-8 flex flex-wrap gap-2">
            <span
              v-for="tech in techStack"
              :key="tech.name"
              class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-foreground/[0.04] px-2.5 py-1 text-xs font-semibold text-muted-foreground"
            >
              <app-icon :name="tech.icon" size="13" />{{ tech.name }}
            </span>
          </div>

          <div class="mb-4 text-xs font-extrabold tracking-widest uppercase">Categories</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in category.slice(0, 6)"
              :key="cat"
              class="rounded-full border border-white/12 px-3 py-1 text-xs font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
              @click="handleCategorySelect(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      <div
        class="mt-8 grid grid-cols-2 gap-6 rounded-3xl border border-white/10 bg-foreground/[0.03] p-6 text-center sm:grid-cols-4"
      >
        <div v-for="stat in stats" :key="stat.label">
          <div class="gradient-text font-display text-2xl font-extrabold">{{ stat.value }}</div>
          <div class="mt-1 text-xs text-muted-foreground">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-8 flex flex-col items-center justify-between gap-3 px-4 md:flex-row">
        <div class="flex items-center gap-2">
          <span class="pulse-dot"></span>
          <span class="text-sm text-muted-foreground">
            © {{ currentYear }} Online Pathshala — All rights reserved
          </span>
        </div>
        <div class="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Made with</span>
          <app-icon name="lucide:heart" size="14" class="heart-beat text-[#f43f5e]" />
          <span>by <strong class="gradient-text">Vimlesh Kumar</strong></span>
        </div>
        <div class="flex gap-4">
          <button
            v-for="modal in modals"
            :key="modal.id"
            class="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            @click="activeModal = modal.id"
          >
            {{ modal.trigger }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Privacy / Terms / Contact ────────────────────────────────── -->
    <dialog-root v-model:open="showPrivacy">
      <dialog-content class="max-h-[85vh] gap-0 overflow-y-auto sm:max-w-[680px]">
        <dialog-header class="mb-6 flex-row items-center gap-3 space-y-0">
          <div
            class="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-135 from-[#7c3aed] to-[#6366f1]"
          >
            <app-icon name="lucide:shield-check" size="22" class="text-white" />
          </div>
          <dialog-title class="font-display text-2xl font-extrabold">Privacy Policy</dialog-title>
        </dialog-header>

        <div class="prose-legal">
          <p class="legal-meta">Last updated: July 2026</p>

          <h3>Data We Collect</h3>
          <p>
            We collect only the information necessary to provide a great learning experience — your name,
            email address, and profile picture when you sign up. Course progress, quiz results, and purchase
            history are stored to personalize your dashboard.
          </p>

          <h3>How We Use It</h3>
          <p>
            Your data powers your personalized experience: course recommendations, progress tracking, and
            certificate generation. We never sell your information to third parties.
          </p>

          <h3>Data Storage &amp; Security</h3>
          <p>
            All data is stored securely using encrypted connections (HTTPS/TLS). Passwords are hashed using
            industry-standard algorithms. Media assets are stored on Vercel Blob Storage with private access
            controls.
          </p>

          <h3>Cookies</h3>
          <p>
            We use local storage to maintain your session token. No third-party tracking cookies are used on
            this platform.
          </p>

          <h3>Your Rights</h3>
          <p>
            You can update or delete your profile at any time from the account settings page. For full data
            deletion requests, contact us at the email below.
          </p>

          <div class="legal-strip">
            <app-icon name="lucide:mail" size="16" class="text-[#7c3aed]" />
            <span>Questions? Reach out at <strong>vimlesh11072000@gmail.com</strong></span>
          </div>
        </div>
      </dialog-content>
    </dialog-root>

    <dialog-root v-model:open="showTerms">
      <dialog-content class="max-h-[85vh] gap-0 overflow-y-auto sm:max-w-[680px]">
        <dialog-header class="mb-6 flex-row items-center gap-3 space-y-0">
          <div
            class="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-135 from-[#6366f1] to-[#06b6d4]"
          >
            <app-icon name="lucide:file-text" size="22" class="text-white" />
          </div>
          <dialog-title class="font-display text-2xl font-extrabold">Terms of Use</dialog-title>
        </dialog-header>

        <div class="prose-legal">
          <p class="legal-meta">Effective: July 2026</p>

          <h3>Acceptance</h3>
          <p>
            By accessing Online Pathshala, you agree to these terms. If you don't agree, please don't use the
            platform.
          </p>

          <h3>User Accounts</h3>
          <p>
            You are responsible for maintaining the security of your account credentials. One account per
            person — sharing accounts is not permitted.
          </p>

          <h3>Course Content</h3>
          <p>
            All course materials are the intellectual property of their respective instructors. You may access
            purchased courses for personal learning only. Redistributing, downloading, or sharing course
            content is prohibited.
          </p>

          <h3>Instructor Responsibilities</h3>
          <p>
            Instructors are responsible for the accuracy and originality of their course content. Online
            Pathshala reserves the right to remove content that violates community guidelines.
          </p>

          <h3>Payments &amp; Refunds</h3>
          <p>
            All purchases are processed securely. Refund requests can be submitted within 7 days of purchase
            if less than 20% of the course has been completed.
          </p>

          <h3>Platform Usage</h3>
          <p>
            Automated scraping, abuse of the support system, or attempts to manipulate reviews are grounds for
            account suspension.
          </p>

          <div class="legal-strip">
            <app-icon name="lucide:scale" size="16" class="text-[#6366f1]" />
            <span>These terms may be updated. We'll notify registered users via email.</span>
          </div>
        </div>
      </dialog-content>
    </dialog-root>

    <dialog-root v-model:open="showContact">
      <dialog-content class="max-h-[85vh] gap-0 overflow-y-auto sm:max-w-[680px]">
        <dialog-header class="mb-6 flex-row items-center gap-3 space-y-0">
          <div
            class="grid size-11 shrink-0 place-items-center rounded-2xl bg-linear-135 from-[#06b6d4] to-[#7c3aed]"
          >
            <app-icon name="lucide:message-square" size="22" class="text-white" />
          </div>
          <dialog-title class="font-display text-2xl font-extrabold">Get In Touch</dialog-title>
        </dialog-header>

        <p class="mb-6 leading-relaxed text-muted-foreground">
          I'm always open to feedback, collaboration, or just a friendly hello. Feel free to reach out through
          any of the channels below.
        </p>

        <div class="grid gap-3">
          <a
            v-for="channel in contactChannels"
            :key="channel.label"
            :href="channel.href"
            :target="channel.href.startsWith('mailto:') ? undefined : '_blank'"
            rel="noopener"
            class="flex items-center gap-4 rounded-2xl border border-white/10 bg-foreground/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div class="grid size-11 shrink-0 place-items-center rounded-xl" :class="channel.tint">
              <app-icon :name="channel.icon" size="22" class="text-white" />
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                {{ channel.label }}
              </div>
              <div class="truncate font-semibold">{{ channel.value }}</div>
            </div>
            <app-icon name="lucide:arrow-up-right" size="16" class="ml-auto text-muted-foreground" />
          </a>
        </div>

        <div class="legal-strip mt-6">
          <app-icon name="lucide:map-pin" size="16" class="text-[#06b6d4]" />
          <span>Gandhinagar, Gujarat · +91-8130684131</span>
        </div>
      </dialog-content>
    </dialog-root>
  </footer>
</template>

<script>
import { mapGetters } from 'vuex'
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  Dialog as DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export default {
  components: { AppIcon, DialogRoot, DialogContent, DialogHeader, DialogTitle },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      activeModal: '',
      socials: [
        { label: 'GitHub', icon: 'mdi:github', href: 'https://github.com/Vimlesh-Kumar' },
        { label: 'LinkedIn', icon: 'mdi:linkedin', href: 'https://linkedin.com/in/vimlesh11' },
        { label: 'Email', icon: 'lucide:mail', href: 'mailto:vimlesh11072000@gmail.com' },
        { label: 'Portfolio', icon: 'lucide:globe', href: 'https://vimlesh.dev' }
      ],
      linkColumns: [
        {
          heading: 'Explore',
          links: [
            { label: 'Home', icon: 'lucide:house', path: '/' },
            { label: 'Courses', icon: 'lucide:library', path: '/courses/all' },
            { label: 'My Learning', icon: 'lucide:graduation-cap', path: '/user' },
            { label: 'Cart', icon: 'lucide:shopping-cart', path: '/user/cart' },
            { label: 'Wishlist', icon: 'lucide:heart', path: '/user/wishlist' }
          ]
        },
        {
          heading: 'For Instructors',
          links: [
            { label: 'Dashboard', icon: 'lucide:layout-dashboard', path: '/user/tutor/dashboard' },
            { label: 'Create Course', icon: 'lucide:circle-plus', path: '/user/tutor/add-course' },
            { label: 'Orders', icon: 'lucide:receipt-text', path: '/user/orders' },
            { label: 'Profile', icon: 'lucide:circle-user', path: '/user/profile' },
            {
              label: 'Source Code',
              icon: 'mdi:github',
              href: 'https://github.com/Vimlesh-Kumar/online-pathshala'
            }
          ]
        }
      ],
      techStack: [
        { name: 'Vue 3', icon: 'mdi:vuejs' },
        { name: 'Node.js', icon: 'mdi:nodejs' },
        { name: 'MySQL', icon: 'mdi:database' },
        { name: 'Tailwind', icon: 'mdi:tailwind' },
        { name: 'Express', icon: 'mdi:server' },
        { name: 'Railway', icon: 'mdi:train' },
        { name: 'Aiven', icon: 'mdi:cloud-check' },
        { name: 'Valkey', icon: 'mdi:lightning-bolt-outline' },
        { name: 'Vite', icon: 'mdi:lightning-bolt' }
      ],
      stats: [
        { value: '9+', label: 'Course Categories' },
        { value: 'AI', label: 'Powered Support' },
        { value: 'Full Stack', label: 'Architecture' },
        { value: '100%', label: 'Responsive' }
      ],
      modals: [
        { id: 'privacy', trigger: 'Privacy' },
        { id: 'terms', trigger: 'Terms' },
        { id: 'contact', trigger: 'Contact' }
      ],
      contactChannels: [
        {
          label: 'Email',
          value: 'vimlesh11072000@gmail.com',
          icon: 'lucide:mail',
          href: 'mailto:vimlesh11072000@gmail.com',
          tint: 'bg-linear-135 from-[#7c3aed] to-[#6366f1]'
        },
        {
          label: 'GitHub',
          value: 'github.com/Vimlesh-Kumar',
          icon: 'mdi:github',
          href: 'https://github.com/Vimlesh-Kumar',
          tint: 'bg-linear-135 from-[#1e293b] to-[#334155]'
        },
        {
          label: 'LinkedIn',
          value: 'linkedin.com/in/vimlesh11',
          icon: 'mdi:linkedin',
          href: 'https://linkedin.com/in/vimlesh11',
          tint: 'bg-linear-135 from-[#0077b5] to-[#00a0dc]'
        },
        {
          label: 'Portfolio',
          value: 'vimlesh.dev',
          icon: 'lucide:globe',
          href: 'https://vimlesh.dev',
          tint: 'bg-linear-135 from-[#7c3aed] to-[#ec4899]'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['category']),
    showPrivacy: {
      get() { return this.activeModal === 'privacy' },
      set(v) { if (!v) this.activeModal = '' }
    },
    showTerms: {
      get() { return this.activeModal === 'terms' },
      set(v) { if (!v) this.activeModal = '' }
    },
    showContact: {
      get() { return this.activeModal === 'contact' },
      set(v) { if (!v) this.activeModal = '' }
    }
  },
  methods: {
    handleCategorySelect(category) {
      this.$router.push({ path: '/courses/all', query: { category } })
    }
  }
}
</script>

<style scoped>
/* Shared long-form styling for the three legal dialogs. */
.prose-legal :deep(h3),
.prose-legal h3 {
  margin: 1.5rem 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.02rem;
  font-weight: 800;
}

.prose-legal p {
  color: var(--text-soft);
  line-height: 1.75;
}

.legal-meta {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.legal-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  border-radius: var(--r-md);
  border: 1px solid var(--glass-border);
  background: var(--grad-primary-soft);
  padding: 0.85rem 1rem;
  font-size: 0.88rem;
}

/* Live-status dot next to the copyright line. */
.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgb(16 185 129 / 0.7);
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  70% { box-shadow: 0 0 0 8px rgb(16 185 129 / 0); }
  100% { box-shadow: 0 0 0 0 rgb(16 185 129 / 0); }
}

.heart-beat {
  animation: heart-beat 1.4s ease-in-out infinite;
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  20% { transform: scale(1.25); }
  40% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-dot,
  .heart-beat {
    animation: none;
  }
}
</style>
