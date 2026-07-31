<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <!-- ── Hero ─────────────────────────────────────── -->
    <section
      class="relative overflow-hidden rounded-[34px] border border-black/5 bg-white/60 p-6 shadow-2xl backdrop-blur-2xl md:p-12 dark:border-white/10 dark:bg-white/5"
    >
      <!-- Ambient layer: drifting particles plus two soft corner glows. The old
           full-strength blur blobs washed the panel out once the app went dark. -->
      <particles-bg
        class="pointer-events-none absolute inset-0"
        :quantity="90"
        :color="isDark ? '#a78bfa' : '#6366f1'"
      />
      <div
        class="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-[radial-gradient(circle,rgb(124_58_237_/_0.22),transparent_65%)] blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-24 -left-20 size-80 rounded-full bg-[radial-gradient(circle,rgb(6_182_212_/_0.18),transparent_65%)] blur-3xl"
      ></div>
      <border-beam :size="220" :duration="14" color-from="#7c3aed" color-to="#06b6d4" />

      <div class="relative z-1 grid items-center gap-10 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <div class="eyebrow mb-6">✨ Modern Learning Marketplace</div>

          <h1
            class="mb-5 font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[1.02] font-extrabold tracking-[-0.04em]"
          >
            Learn anything.<br />
            <!--
              FlipWords animates each letter with a `filter`, which gives every
              letter its own paint layer and breaks `background-clip: text`
              inheritance — so it cannot live inside `.gradient-text`. A solid
              brand tint is used instead.
            -->
            <flip-words
              class="-ml-2 text-[#7c3aed] dark:text-[#a78bfa]"
              :words="['Beautifully.', 'Practically.', 'Confidently.', 'On your terms.']"
            />
          </h1>

          <p class="mb-8 max-w-[54ch] text-[1.08rem] leading-relaxed text-muted-foreground">
            Practical, job-ready courses with a clean player, progress tracking, and a catalog that
            actually feels good to browse. Learn at your pace — free to start.
          </p>

          <div class="mb-10 flex flex-wrap gap-4">
            <shimmer-button
              class="font-display font-bold shadow-[0_20px_50px_-15px_rgb(124_58_237_/_0.9)]"
              background="linear-gradient(135deg,#7c3aed 0%,#6366f1 45%,#06b6d4 100%)"
              @click="$router.push('/courses/all')"
            >
              <span class="inline-flex items-center gap-2 px-3 py-1 text-base text-white">
                Explore courses
                <app-icon name="lucide:arrow-right" size="18" />
              </span>
            </shimmer-button>

            <button
              class="rounded-full border-[1.5px] border-black/10 px-7 py-3 font-display text-base font-bold transition-all hover:-translate-y-0.5 hover:border-primary/50 dark:border-white/15"
              @click="$router.push('/user/sign-up')"
            >
              Create free account
            </button>
          </div>

          <div class="flex flex-wrap gap-8">
            <div v-for="stat in stats" :key="stat.label">
              <div class="gradient-text font-display text-[1.9rem] leading-none font-extrabold">
                <number-ticker
                  :value="stat.value"
                  :decimal-places="stat.decimals"
                  class="tracking-tight"
                />{{ stat.suffix }}
              </div>
              <div class="mt-1 text-sm text-muted-foreground">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <div class="hidden lg:col-span-5 lg:block">
          <div class="relative p-3">
            <div
              class="overflow-hidden rounded-[34px] border border-black/5 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <img
                src="../assets/homepage2.jpg"
                alt="A learner watching a video lesson"
                class="h-60 w-full object-cover"
              />
              <div class="p-6">
                <div class="mb-3 flex items-center justify-between">
                  <span class="eyebrow">Featured Path</span>
                  <span class="inline-flex items-center gap-1 font-extrabold text-brand-amber">
                    <app-icon name="lucide:star" size="15" filled /> 4.8
                  </span>
                </div>
                <h3 class="mb-2 font-display text-lg font-bold">Dev to Deployment</h3>
                <div class="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span><span class="font-bold text-foreground">68%</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-foreground/10">
                  <div
                    class="h-full w-[68%] rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4]"
                  ></div>
                </div>
              </div>
            </div>

            <div class="float-badge absolute top-[2%] -left-[8%]">
              <app-icon name="lucide:badge-check" size="20" class="text-emerald-500" />
              <div><b>Certificate</b><br /><small class="text-muted-foreground">on completion</small></div>
            </div>
            <div class="float-badge float-badge-delayed absolute -right-[6%] -bottom-[4%]">
              <app-icon name="lucide:circle-play" size="20" class="text-[#f43f5e]" />
              <div><b>HD Video</b><br /><small class="text-muted-foreground">lessons</small></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Category rail ──────────────────────────── -->
    <section class="mt-10 flex flex-wrap items-center gap-3">
      <span class="mr-2 font-bold text-muted-foreground">Browse:</span>
      <button
        v-for="cat in category"
        :key="cat"
        class="rounded-full border border-black/10 px-4 py-1.5 font-semibold transition-all hover:-translate-y-0.5 hover:border-transparent hover:bg-linear-135 hover:from-[#7c3aed] hover:via-[#6366f1] hover:to-[#06b6d4] hover:text-white dark:border-white/12"
        @click="goToCategory(cat)"
      >
        {{ cat }}
      </button>
    </section>

    <!-- ── Featured courses ───────────────────────── -->
    <section v-reveal class="mt-12">
      <div class="mb-7 flex flex-col justify-between md:flex-row md:items-end">
        <div>
          <div class="eyebrow mb-3">🔥 Featured Courses</div>
          <h2 class="app-section-title">Start with the strongest picks</h2>
          <p class="mt-3 text-muted-foreground">Top-rated courses from the catalog, ready to explore.</p>
        </div>
        <button
          class="mt-4 inline-flex items-center gap-1 font-bold text-primary transition-colors hover:text-primary/80 md:mt-0"
          @click="$router.push('/courses/all')"
        >
          Browse full catalog <app-icon name="lucide:arrow-right" size="18" />
        </button>
      </div>

      <all-courses :all-courses="allCourses.slice(0, 8)" :loading="loadingCourses" />
    </section>

    <!-- ── Feature band ───────────────────────────── -->
    <section class="mt-16 grid gap-6 md:grid-cols-3">
      <card-spotlight
        v-for="(feature, i) in features"
        :key="feature.title"
        v-reveal="i * 90"
        class="h-full rounded-[26px] border border-black/5 bg-white/60 p-7 backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
        :gradient-color="isDark ? '#312e81' : '#ddd6fe'"
        :gradient-size="260"
      >
        <div
          class="mb-5 grid size-14 place-items-center rounded-[18px] bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] shadow-[0_18px_40px_-14px_rgb(124_58_237_/_0.9)]"
        >
          <app-icon :name="feature.icon" size="26" class="text-white" />
        </div>
        <h3 class="mb-3 font-display text-lg font-bold">{{ feature.title }}</h3>
        <p class="leading-relaxed text-muted-foreground">{{ feature.desc }}</p>
      </card-spotlight>
    </section>

    <!-- ── CTA band ───────────────────────────────── -->
    <section v-reveal class="mt-16">
      <div
        class="relative grid items-center gap-6 overflow-hidden rounded-[34px] bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] p-8 shadow-2xl md:grid-cols-3 md:p-12"
      >
        <div class="md:col-span-2">
          <h2 class="mb-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-extrabold tracking-tight text-white">
            Ready to teach what you know?
          </h2>
          <p class="max-w-[52ch] text-[1.05rem] text-white/90">
            Publish a course, build your curriculum, and reach learners — all in one place.
          </p>
        </div>
        <div class="flex md:justify-end">
          <button
            class="rounded-full bg-white px-8 py-3.5 font-display text-base font-extrabold text-[#7c3aed] shadow-lg transition-transform hover:-translate-y-0.5"
            @click="$router.push('/user/tutor/add-course')"
          >
            Become an instructor
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AllCourses from '../components/course/AllCourses.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useAppTheme } from '@/composables/useAppTheme'
import { ParticlesBg } from '@/components/ui/particles-bg'
import { BorderBeam } from '@/components/ui/border-beam'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { NumberTicker } from '@/components/ui/number-ticker'
import { FlipWords } from '@/components/ui/flip-words'
import { CardSpotlight } from '@/components/ui/card-spotlight'

export default {
  components: {
    AllCourses,
    AppIcon,
    ParticlesBg,
    BorderBeam,
    ShimmerButton,
    NumberTicker,
    FlipWords,
    CardSpotlight
  },
  setup() {
    const { isDark } = useAppTheme()
    return { isDark }
  },
  data() {
    return {
      loadingCourses: true,
      stats: [
        { value: 10, suffix: 'k+', decimals: 0, label: 'Active learners' },
        { value: 100, suffix: '+', decimals: 0, label: 'Structured lessons' },
        { value: 4.8, suffix: '★', decimals: 1, label: 'Average rating' }
      ],
      features: [
        { title: 'Focused discovery', desc: 'Browse featured and filtered courses in a clean, consistent catalog — no clutter.', icon: 'lucide:compass' },
        { title: 'Track your progress', desc: 'A distraction-free player with lesson-by-lesson completion and resume-where-you-left-off.', icon: 'lucide:chart-line' },
        { title: 'Learn & earn', desc: 'Finish a course, get an auto-generated certificate, and showcase what you achieved.', icon: 'lucide:award' }
      ]
    }
  },
  computed: {
    ...mapGetters(['allCourses', 'category'])
  },
  async created() {
    this.$store.dispatch('fetchingUser')
    this.$store.dispatch('getCartCourses')
    await this.$store.dispatch('fetchingFeaturedCourses')
    this.loadingCourses = false
  },
  methods: {
    goToCategory(cat) {
      this.$store.dispatch('setSelectedCategory', cat)
      this.$router.push({ path: '/courses/all', query: { category: cat } })
    }
  }
}
</script>

<style scoped>
/* Opaque rather than glassy: over the hero photo a translucent badge was
   unreadable in dark mode. */
.float-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--r-md);
  background: var(--surface);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  font-size: 0.78rem;
  line-height: 1.25;
  box-shadow: var(--shadow-md);
  animation: float 10s ease-in-out infinite;
}
.float-badge-delayed {
  animation-delay: -4s;
}

@media (prefers-reduced-motion: reduce) {
  .float-badge {
    animation: none;
  }
}
</style>
