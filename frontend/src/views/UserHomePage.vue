<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section v-if="user" class="page-intro mb-10 p-6 md:p-10">
      <div class="eyebrow mb-4">{{ user.user_role === 'Student' ? 'My Learning' : 'Tutor Dashboard' }}</div>
      <h1 class="app-section-title mb-3">
        {{ user.user_role === 'Student' ? `Welcome back, ${user.full_name}` : `Manage your courses, ${user.full_name}` }}
      </h1>
      <p class="text-muted-foreground">
        {{ user.user_role === 'Student'
          ? 'Pick up where you left off, revisit saved courses, and keep your learning queue clean.'
          : 'Review your published catalog and jump back into course creation without leaving the main workflow.' }}
      </p>
    </section>

    <recent-courses class="mb-6" />

    <learning-momentum v-if="user" class="mb-10" />

    <section v-if="user">
      <div class="mb-6 flex flex-col justify-between md:flex-row md:items-end">
        <div>
          <div class="eyebrow mb-3">{{ user.user_role === 'Student' ? 'Enrolled Courses' : 'Your Courses' }}</div>
          <h2 class="app-section-title">
            {{ userCourses.length ? 'Your current library' : 'Nothing here yet' }}
          </h2>
        </div>
        <div v-if="user.user_role === 'Tutor'" class="mt-4 flex gap-3 md:mt-0">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-primary/12 px-5 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/20"
            @click="$router.push('/user/tutor/dashboard')"
          >
            <app-icon name="lucide:chart-column" size="18" /> Dashboard
          </button>
          <button class="btn-brand" @click="$router.push('/user/tutor/add-course')">Add new course</button>
        </div>
      </div>

      <div v-if="userCourses.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="c in userCourses"
          :key="c.id"
          class="flex h-full flex-col overflow-hidden rounded-[26px] border border-black/5 bg-white/70 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:border-white/10 dark:bg-white/5"
        >
          <div class="relative">
            <img :src="c.thumb_url" :alt="c.title" class="h-[150px] w-full object-cover" loading="lazy" />
            <span
              v-if="Number(c.progress) >= 100"
              class="absolute top-3 right-3 rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] px-3 py-1 text-[0.72rem] font-extrabold text-white shadow-md"
            >
              ✓ Completed
            </span>
            <div
              v-else
              class="absolute top-2.5 right-2.5 rounded-full border border-white/10 bg-white/80 p-[3px] shadow-md backdrop-blur-md dark:bg-slate-900/80"
            >
              <progress-ring :value="Number(c.progress) || 0" :size="44" :stroke-width="5" label-size="11px" />
            </div>
          </div>

          <div class="flex flex-1 flex-col p-5">
            <div class="eyebrow mb-2">{{ c.category }}</div>
            <h3 class="mb-3 line-clamp-2 min-h-[2.6rem] font-display text-[1.05rem] leading-snug font-bold">
              {{ c.title }}
            </h3>

            <div class="mt-auto">
              <div class="mb-1 flex items-center justify-between text-xs">
                <span class="text-muted-foreground">
                  {{ c.completed_lessons || 0 }}/{{ c.total_lessons || 0 }} lessons
                </span>
                <span class="font-bold">{{ Math.round(Number(c.progress) || 0) }}%</span>
              </div>
              <div class="mb-4 h-[7px] overflow-hidden rounded-full bg-foreground/10">
                <div
                  class="h-full rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] transition-[width] duration-500"
                  :style="{ width: `${Math.min(Number(c.progress) || 0, 100)}%` }"
                ></div>
              </div>

              <button class="btn-brand w-full" @click="$router.push(`/learn/${c.id}`)">
                <app-icon name="lucide:play" size="18" filled />
                {{ Number(c.progress) > 0 ? 'Continue learning' : 'Start learning' }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="glass-panel section-card p-8 text-center">
        <app-icon name="lucide:book-open" size="52" class="mx-auto mb-4 text-primary" />
        <h3 class="mb-3 font-display text-2xl font-bold">
          {{ user.user_role === 'Student' ? 'You have not enrolled in any course yet.' : 'You have not created any course yet.' }}
        </h3>
        <p class="mb-6 text-muted-foreground">
          {{ user.user_role === 'Student'
            ? 'Start with featured courses and build your learning path.'
            : 'Create your first course to begin publishing learning content.' }}
        </p>
        <button class="btn-brand mx-auto" @click="$router.push('/courses/all')">Explore courses</button>
      </div>
    </section>

    <section v-if="user" v-reveal class="mt-12">
      <div class="eyebrow mb-3">✨ Picked For You</div>
      <h2 class="app-section-title mb-2">{{ recommendedTitle }}</h2>
      <p class="mb-6 text-muted-foreground">{{ recommendedSubtitle }}</p>
      <all-courses
        v-if="loadingRecommended || recommended.length"
        :all-courses="recommended"
        :loading="loadingRecommended"
      />
      <div v-else class="glass-panel section-card p-6 text-center">
        <p class="text-muted-foreground">
          No new recommendations right now — you've covered your favorite categories!
        </p>
      </div>
    </section>

    <section v-reveal class="mt-12">
      <div class="eyebrow mb-3">Discover More</div>
      <h2 class="app-section-title mb-6">Expand your skillset</h2>
      <all-courses :all-courses="allCourses.slice(0, 8)" :loading="!allCourses.length" />
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import AllCourses from '../components/course/AllCourses.vue';
import LearningMomentum from '../components/learning/LearningMomentum.vue';
import RecentCourses from '../components/course/RecentCourses.vue';
import ProgressRing from '../components/support/ProgressRing.vue';
import AppIcon from '@/components/ui/AppIcon.vue';

export default {
  components: { AllCourses, LearningMomentum, RecentCourses, ProgressRing, AppIcon },
  data() {
    return { recommended: [], recommendReason: 'popular', recommendBasedOn: [], loadingRecommended: true }
  },
  computed: {
    ...mapGetters(['user', 'allCourses', 'userCourses']),
    recommendedTitle() {
      return this.recommendReason === 'interests' ? 'Based on your interests' : 'Popular right now'
    },
    recommendedSubtitle() {
      if (this.recommendReason === 'interests' && this.recommendBasedOn.length) {
        return `Because you're into ${this.recommendBasedOn.join(', ')}.`
      }
      return 'Top-rated courses to help you get started.'
    }
  },
  async created() {
    await this.$store.dispatch('fetchingUser')
    await this.$store.dispatch('fetchingUserCourses')
    await this.$store.dispatch('fetchingFeaturedCourses')
    if (this.user) {
      const rec = await this.$store.dispatch('fetchRecommendations')
      this.recommended = rec.courses || []
      this.recommendReason = rec.reason
      this.recommendBasedOn = rec.basedOn || []
    }
    this.loadingRecommended = false
  },
}
</script>
