<template>
  <div class="mx-auto max-w-[1100px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Compete</div>
      <h1 class="app-section-title mb-3">Leaderboard</h1>
      <p class="text-muted-foreground">
        This week's XP, Monday to Sunday. Everything you do — lessons, notes, flashcards and
        practice — counts, and the board resets when the week does.
      </p>
    </section>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Board -->
      <section class="glass-panel section-card p-6 lg:col-span-2">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-display text-lg font-bold">Top learners</h2>
          <span v-if="board" class="text-xs text-muted-foreground">
            {{ board.weekStart }} → {{ board.weekEnd }}
          </span>
        </div>

        <div v-if="board?.entries.length" class="flex flex-col">
          <div
            v-for="entry in board.entries"
            :key="entry.userId"
            class="flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors"
            :class="entry.isMe ? 'bg-primary/10' : 'hover:bg-foreground/[0.04]'"
          >
            <span class="w-8 shrink-0 text-center font-display text-lg font-black" :class="rankClass(entry.rank)">
              {{ entry.rank }}
            </span>
            <img
              v-if="entry.avatar"
              :src="entry.avatar"
              :alt="entry.name"
              class="size-9 shrink-0 rounded-full object-cover"
              loading="lazy"
            />
            <span
              v-else
              class="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 font-bold text-primary"
            >
              {{ entry.name.charAt(0).toUpperCase() }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="truncate font-semibold">
                {{ entry.name }}
                <span v-if="entry.isMe" class="text-xs text-primary">(you)</span>
              </div>
              <div class="text-xs text-muted-foreground">
                {{ entry.lessons }} lessons · {{ entry.cards }} cards · {{ entry.activeDays }} active days
              </div>
            </div>
            <span class="font-display font-extrabold">{{ entry.xp }} XP</span>
          </div>

          <div
            v-if="board.me && board.me.rank > board.entries.length"
            class="mt-4 flex items-center gap-4 rounded-2xl bg-primary/10 px-3 py-3"
          >
            <span class="w-8 shrink-0 text-center font-display text-lg font-black">{{ board.me.rank }}</span>
            <div class="min-w-0 flex-1 truncate font-semibold">{{ board.me.name }} (you)</div>
            <span class="font-display font-extrabold">{{ board.me.xp }} XP</span>
          </div>
        </div>

        <div v-else-if="!loading" class="py-8 text-center">
          <app-icon name="lucide:trophy" size="48" class="mx-auto mb-3 text-primary" />
          <p class="text-muted-foreground">
            Nobody has earned XP yet this week. Complete a lesson to take the top spot.
          </p>
        </div>
      </section>

      <!-- Visibility -->
      <section class="glass-panel section-card p-6">
        <div class="mb-4 flex items-center gap-2">
          <app-icon name="lucide:eye" size="20" class="text-primary" />
          <h2 class="font-display text-lg font-bold">Your visibility</h2>
        </div>

        <label class="mb-4 flex cursor-pointer items-center gap-3">
          <input v-model="prefs.optIn" type="checkbox" class="size-4 accent-[var(--brand-2)]" />
          <span class="text-sm">Show me on the public leaderboard</span>
        </label>

        <label class="mb-4 block">
          <span class="mb-2 block text-sm font-semibold">Display name (optional)</span>
          <input
            v-model="prefs.alias"
            type="text"
            maxlength="50"
            placeholder="Compete under an alias"
            class="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 dark:border-white/15"
          />
        </label>

        <button class="btn-brand w-full justify-center" :disabled="savingPrefs" @click="savePrefs">
          <app-icon v-if="savingPrefs" name="lucide:loader-circle" size="18" class="animate-spin" />
          Save
        </button>
      </section>
    </div>

    <!-- Challenges -->
    <section class="mt-8">
      <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div class="eyebrow mb-2">Head to head</div>
          <h2 class="app-section-title">Challenges</h2>
        </div>
      </div>

      <div class="glass-panel section-card mb-6 p-6">
        <div class="mb-4 flex items-center gap-2">
          <app-icon name="lucide:swords" size="20" class="text-primary" />
          <h3 class="font-display text-lg font-bold">Challenge a friend</h3>
        </div>
        <div class="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <input
            v-model="invite.email"
            type="email"
            placeholder="Their sign-up email"
            class="rounded-xl border border-black/10 bg-transparent px-4 py-2.5 dark:border-white/15"
          />
          <select
            v-model="invite.metric"
            class="rounded-xl border border-black/10 bg-transparent px-4 py-2.5 dark:border-white/15"
          >
            <option value="lessons">Lessons</option>
            <option value="cards">Flashcards</option>
            <option value="xp">XP</option>
          </select>
          <select
            v-model.number="invite.days"
            class="rounded-xl border border-black/10 bg-transparent px-4 py-2.5 dark:border-white/15"
          >
            <option :value="3">3 days</option>
            <option :value="7">7 days</option>
            <option :value="14">14 days</option>
            <option :value="30">30 days</option>
          </select>
          <button class="btn-brand justify-center" :disabled="inviting || !invite.email" @click="sendInvite">
            <app-icon v-if="inviting" name="lucide:loader-circle" size="18" class="animate-spin" />
            Send
          </button>
        </div>
      </div>

      <div v-if="challenges.length" class="grid gap-4 md:grid-cols-2">
        <article
          v-for="challenge in challenges"
          :key="challenge.id"
          class="glass-panel section-card p-5"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="eyebrow">{{ challenge.metricLabel }}</span>
            <span
              class="rounded-full px-3 py-1 text-[0.68rem] font-extrabold tracking-wide uppercase"
              :class="statusClass(challenge)"
            >
              {{ statusLabel(challenge) }}
            </span>
          </div>

          <div class="mb-4 flex items-center justify-between gap-3">
            <div class="text-center">
              <div class="font-display text-2xl font-black">{{ challenge.me.score }}</div>
              <div class="text-xs text-muted-foreground">You</div>
            </div>
            <span class="text-xs font-bold text-muted-foreground">vs</span>
            <div class="text-center">
              <div class="font-display text-2xl font-black">{{ challenge.opponent.score }}</div>
              <div class="max-w-[9rem] truncate text-xs text-muted-foreground">
                {{ challenge.opponent.name }}
              </div>
            </div>
          </div>

          <p class="mb-3 text-xs text-muted-foreground">
            {{ challenge.startsOn }} → {{ challenge.endsOn }}
          </p>

          <div v-if="challenge.awaitingMyResponse" class="flex gap-2">
            <button class="btn-brand flex-1 justify-center" @click="respond(challenge, true)">
              Accept
            </button>
            <button
              class="flex-1 rounded-full border border-black/10 px-4 py-2 font-semibold transition-colors hover:border-rose-500/50 dark:border-white/15"
              @click="respond(challenge, false)"
            >
              Decline
            </button>
          </div>
        </article>
      </div>

      <div v-else-if="!loading" class="glass-panel section-card p-8 text-center">
        <app-icon name="lucide:swords" size="48" class="mx-auto mb-3 text-primary" />
        <p class="text-muted-foreground">
          No challenges yet. Invite someone above and race them for a week.
        </p>
      </div>
    </section>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'

export default {
  name: 'LeaderboardPage',
  components: { AppIcon },
  data() {
    return {
      board: null,
      challenges: [],
      prefs: { optIn: true, alias: '' },
      invite: { email: '', metric: 'lessons', days: 7 },
      loading: true,
      savingPrefs: false,
      inviting: false
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const [board, challengeData] = await Promise.all([
          this.$store.dispatch('fetchLeaderboard'),
          this.$store.dispatch('fetchChallenges')
        ])
        this.board = board
        this.prefs = { optIn: board.prefs.optIn, alias: board.prefs.alias || '' }
        this.challenges = challengeData.challenges
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    rankClass(rank) {
      if (rank === 1) return 'text-amber-400'
      if (rank === 2) return 'text-slate-400'
      if (rank === 3) return 'text-orange-400'
      return 'text-muted-foreground'
    },
    statusLabel(challenge) {
      if (challenge.status === 'pending') {
        return challenge.awaitingMyResponse ? 'Invited you' : 'Awaiting reply'
      }
      if (challenge.status === 'declined') return 'Declined'
      if (challenge.status === 'active') return 'Live'
      if (challenge.isDraw) return 'Draw'
      return challenge.iWon ? 'You won' : 'You lost'
    },
    statusClass(challenge) {
      if (challenge.status === 'active') return 'bg-primary/15 text-primary'
      if (challenge.status === 'pending') return 'bg-amber-500/15 text-amber-500'
      if (challenge.status === 'completed' && challenge.iWon) return 'bg-emerald-500/15 text-emerald-500'
      return 'bg-foreground/10 text-muted-foreground'
    },
    async savePrefs() {
      this.savingPrefs = true
      try {
        this.board = await this.$store.dispatch('saveLeaderboardPrefs', {
          optIn: this.prefs.optIn,
          alias: this.prefs.alias || null
        })
        toast.success('Leaderboard settings saved.')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not save your settings.')
      } finally {
        this.savingPrefs = false
      }
    },
    async sendInvite() {
      this.inviting = true
      try {
        const result = await this.$store.dispatch('createChallenge', { ...this.invite })
        toast.success(`Challenge sent to ${result.opponent}.`)
        this.invite.email = ''
        await this.load()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not send that challenge.')
      } finally {
        this.inviting = false
      }
    },
    async respond(challenge, accept) {
      try {
        await this.$store.dispatch('respondToChallenge', { challengeId: challenge.id, accept })
        toast.success(accept ? 'Challenge accepted — good luck!' : 'Challenge declined.')
        await this.load()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not update that challenge.')
      }
    }
  }
}
</script>
