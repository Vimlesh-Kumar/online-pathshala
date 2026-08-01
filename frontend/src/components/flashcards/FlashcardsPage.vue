<template>
  <div class="mx-auto max-w-[1100px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Spaced repetition</div>
      <h1 class="app-section-title mb-3">Flashcards</h1>
      <p class="text-muted-foreground">
        Cards are built from each course's curriculum and your own notes, then scheduled so you
        review them right before you would have forgotten them.
      </p>
    </section>

    <!-- Review session -->
    <section v-if="reviewing" class="glass-panel section-card mb-8 p-6 md:p-8">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <div class="eyebrow mb-1">{{ activeDeckTitle || 'All decks' }}</div>
          <span class="text-sm text-muted-foreground">
            {{ reviewed }} reviewed · {{ queue.length - index }} left in this session
          </span>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/50 dark:border-white/15"
          @click="endSession"
        >
          <app-icon name="lucide:x" size="16" /> End session
        </button>
      </div>

      <template v-if="currentCard">
        <button
          class="mb-5 flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center rounded-[26px] border border-black/5 bg-foreground/[0.03] p-8 text-center transition-colors hover:bg-foreground/[0.06] dark:border-white/10"
          @click="revealed = true"
        >
          <div class="eyebrow mb-4">{{ revealed ? 'Answer' : 'Question' }}</div>
          <p class="font-display text-xl leading-snug font-bold">{{ currentCard.front }}</p>
          <p v-if="revealed" class="mt-5 border-t border-black/5 pt-5 text-muted-foreground dark:border-white/10">
            {{ currentCard.back }}
          </p>
          <span v-else class="mt-6 text-xs text-muted-foreground">Tap to reveal</span>
        </button>

        <div v-if="revealed" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            v-for="rating in ratings"
            :key="rating.value"
            class="rounded-2xl border px-4 py-3 text-sm font-bold transition-colors"
            :class="rating.class"
            :disabled="grading"
            @click="grade(rating.value)"
          >
            {{ rating.label }}
            <span class="mt-0.5 block text-[0.68rem] font-medium opacity-70">{{ rating.hint }}</span>
          </button>
        </div>
        <p v-else class="text-center text-sm text-muted-foreground">
          Try to answer from memory first — that effort is what makes the card stick.
        </p>
      </template>

      <div v-else class="py-8 text-center">
        <app-icon name="lucide:party-popper" size="52" class="mx-auto mb-3 text-primary" />
        <h3 class="mb-2 font-display text-2xl font-bold">Session complete</h3>
        <p class="mb-5 text-muted-foreground">
          You reviewed {{ reviewed }} card{{ reviewed === 1 ? '' : 's' }}. Come back tomorrow for the next batch.
        </p>
        <button class="btn-brand mx-auto" @click="endSession">Back to decks</button>
      </div>
    </section>

    <template v-else>
      <!-- Summary -->
      <div class="mb-8 grid gap-4 sm:grid-cols-3">
        <div
          v-for="stat in summaryStats"
          :key="stat.label"
          class="glass-panel section-card p-5"
        >
          <div class="mb-1 flex items-center gap-2 text-muted-foreground">
            <app-icon :name="stat.icon" size="16" />
            <span class="text-xs font-semibold tracking-wide uppercase">{{ stat.label }}</span>
          </div>
          <div class="font-display text-3xl font-extrabold">{{ stat.value }}</div>
        </div>
      </div>

      <div v-if="summary.due > 0" class="mb-8 text-center">
        <button class="btn-brand mx-auto" @click="startSession(null)">
          <app-icon name="lucide:zap" size="18" />
          Review {{ summary.due }} due card{{ summary.due === 1 ? '' : 's' }}
        </button>
      </div>

      <!-- Build a deck -->
      <section class="glass-panel section-card mb-8 p-6">
        <div class="mb-4 flex items-center gap-2">
          <app-icon name="lucide:sparkles" size="20" class="text-primary" />
          <h2 class="font-display text-lg font-bold">Build a deck from a course</h2>
        </div>

        <div v-if="userCourses.length" class="flex flex-col gap-3 sm:flex-row">
          <select
            v-model="selectedCourseId"
            class="flex-1 rounded-xl border border-black/10 bg-transparent px-4 py-2.5 dark:border-white/15"
          >
            <option v-for="course in userCourses" :key="course.id" :value="course.id">
              {{ course.title }}
            </option>
          </select>
          <button class="btn-brand" :disabled="generating || !selectedCourseId" @click="generate">
            <app-icon
              :name="generating ? 'lucide:loader-circle' : 'lucide:wand-sparkles'"
              size="18"
              :class="generating ? 'animate-spin' : ''"
            />
            {{ generating ? 'Building…' : 'Generate cards' }}
          </button>
        </div>
        <p v-else class="text-muted-foreground">
          Enroll in a course first — decks are built from course content and your notes.
        </p>
      </section>

      <!-- Decks -->
      <section v-if="decks.length">
        <h2 class="app-section-title mb-5">Your decks</h2>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="deck in decks"
            :key="deck.id"
            class="flex h-full flex-col overflow-hidden rounded-[26px] border border-black/5 bg-white/70 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
          >
            <img :src="deck.thumb_url" :alt="deck.title" class="h-[120px] w-full object-cover" loading="lazy" />
            <div class="flex flex-1 flex-col p-5">
              <div class="eyebrow mb-2">{{ deck.category }}</div>
              <h3 class="mb-3 line-clamp-2 min-h-[2.6rem] font-display text-[1rem] leading-snug font-bold">
                {{ deck.title }}
              </h3>
              <div class="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{{ deck.card_count }} cards</span>
                <span :class="deck.due_count ? 'font-bold text-primary' : ''">
                  {{ deck.due_count }} due
                </span>
              </div>
              <div class="mt-auto flex gap-2">
                <button
                  class="btn-brand flex-1 justify-center"
                  :disabled="!deck.due_count"
                  @click="startSession(deck)"
                >
                  <app-icon name="lucide:play" size="16" filled />
                  {{ deck.due_count ? 'Review' : 'All caught up' }}
                </button>
                <button
                  class="rounded-full bg-primary/12 px-3 py-2 font-semibold text-primary transition-colors hover:bg-primary/20"
                  title="Add more cards from new notes"
                  :disabled="generating"
                  @click="topUp(deck)"
                >
                  <app-icon name="lucide:plus" size="16" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div v-else-if="!loading" class="glass-panel section-card p-8 text-center">
        <app-icon name="lucide:layers" size="52" class="mx-auto mb-4 text-primary" />
        <h3 class="mb-3 font-display text-2xl font-bold">No decks yet</h3>
        <p class="text-muted-foreground">
          Pick a course above and generate your first set of cards.
        </p>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'
import { fireConfetti } from '@/utils/confetti'

export default {
  name: 'FlashcardsPage',
  components: { AppIcon },
  data() {
    return {
      loading: true,
      decks: [],
      summary: { total: 0, due: 0, mastered: 0 },
      selectedCourseId: null,
      generating: false,
      // Review session state.
      reviewing: false,
      activeDeckTitle: '',
      queue: [],
      index: 0,
      revealed: false,
      reviewed: 0,
      grading: false,
      ratings: [
        { value: 'again', label: 'Again', hint: 'No idea', class: 'border-rose-500/40 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' },
        { value: 'hard', label: 'Hard', hint: 'Struggled', class: 'border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' },
        { value: 'good', label: 'Good', hint: 'Got it', class: 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20' },
        { value: 'easy', label: 'Easy', hint: 'Instant', class: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' }
      ]
    }
  },
  computed: {
    ...mapGetters(['userCourses']),
    currentCard() {
      return this.queue[this.index] || null
    },
    summaryStats() {
      return [
        { label: 'Due today', value: this.summary.due, icon: 'lucide:zap' },
        { label: 'Total cards', value: this.summary.total, icon: 'lucide:layers' },
        { label: 'Mastered', value: this.summary.mastered, icon: 'lucide:trophy' }
      ]
    }
  },
  async created() {
    await this.$store.dispatch('fetchingUserCourses')
    this.selectedCourseId = this.userCourses[0]?.id || null
    await this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const data = await this.$store.dispatch('fetchFlashcardDecks')
        this.decks = data.decks
        this.summary = data.summary
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async generate() {
      await this.buildDeck(this.selectedCourseId)
    },
    async topUp(deck) {
      await this.buildDeck(deck.course_id)
    },
    async buildDeck(courseId) {
      if (!courseId) return
      this.generating = true
      try {
        const result = await this.$store.dispatch('generateFlashcardDeck', courseId)
        toast[result.added ? 'success' : 'info'](
          result.added
            ? `${result.added} new card${result.added === 1 ? '' : 's'} added.`
            : 'That deck is already up to date — take more notes and try again.'
        )
        await this.load()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not build that deck.')
      } finally {
        this.generating = false
      }
    },
    async startSession(deck) {
      try {
        const data = await this.$store.dispatch('fetchDueFlashcards', deck?.course_id || null)
        if (!data.cards.length) {
          toast.info('Nothing is due right now — enjoy the break.')
          return
        }
        this.queue = data.cards
        this.activeDeckTitle = deck?.title || ''
        this.index = 0
        this.reviewed = 0
        this.revealed = false
        this.reviewing = true
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not start that session.')
      }
    },
    async grade(rating) {
      if (!this.currentCard || this.grading) return
      this.grading = true
      const card = this.currentCard

      try {
        const result = await this.$store.dispatch('reviewFlashcard', { cardId: card.id, rating })
        this.reviewed += 1
        this.index += 1
        this.revealed = false

        // A failed card is due again today, so it goes back on the end of the queue
        // rather than waiting for tomorrow.
        if (result.intervalDays === 0) this.queue.push(card)
        if (!this.currentCard) fireConfetti()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not save that review.')
      } finally {
        this.grading = false
      }
    },
    async endSession() {
      this.reviewing = false
      this.queue = []
      await this.load()
    }
  }
}
</script>
