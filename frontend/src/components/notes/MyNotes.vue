<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Study Notes</div>
      <h1 class="app-section-title mb-3">Everything you wrote down</h1>
      <p class="text-muted-foreground">
        Every note you took while watching, kept with the exact moment it came from. Click a
        timestamp to drop straight back into the video.
      </p>
    </section>

    <div v-if="loading" class="py-12 text-center">
      <app-icon name="lucide:loader-circle" size="44" class="mx-auto animate-spin text-primary" />
    </div>

    <template v-else-if="totalNotes">
      <!-- Toolbar -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <div class="relative flex min-w-64 flex-1 items-center">
          <app-icon
            name="lucide:search"
            size="18"
            class="pointer-events-none absolute left-4 text-muted-foreground"
          />
          <input
            v-model="query"
            type="search"
            aria-label="Search your notes"
            placeholder="Search your notes, lessons or courses"
            class="h-12 w-full rounded-2xl border border-black/10 bg-foreground/[0.04] pr-4 pl-11 outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-3 focus:ring-primary/20 dark:border-white/12"
          />
        </div>
        <span class="text-sm text-muted-foreground">
          {{ matchCount }} of {{ totalNotes }} note{{ totalNotes === 1 ? '' : 's' }}
        </span>
      </div>

      <div v-if="filteredCourses.length" class="grid gap-5">
        <section v-for="group in filteredCourses" :key="group.courseId" class="glass-panel section-card p-6">
          <div class="mb-5 flex flex-wrap items-center gap-4">
            <img
              v-if="group.courseThumb"
              :src="group.courseThumb"
              alt=""
              class="h-14 w-24 shrink-0 rounded-xl object-cover"
            />
            <div class="min-w-0 flex-1">
              <h2 class="truncate font-display text-lg font-bold">{{ group.courseTitle }}</h2>
              <p class="text-xs text-muted-foreground">
                {{ group.notes.length }} note{{ group.notes.length === 1 ? '' : 's' }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                class="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold transition-colors hover:border-primary/50 dark:border-white/15"
                @click="exportPdf(group)"
              >
                <app-icon name="lucide:file-text" size="16" /> PDF
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-full bg-primary/12 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                @click="$router.push(`/learn/${group.courseId}`)"
              >
                <app-icon name="lucide:circle-play" size="16" /> Continue
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <article
              v-for="note in group.notes"
              :key="note.id"
              class="rounded-2xl border border-black/5 bg-foreground/[0.03] p-4 dark:border-white/10"
            >
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <button
                  class="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                  :title="`Open the video at ${formatTime(note.timestamp_seconds)}`"
                  @click="openAtNote(note)"
                >
                  <app-icon name="lucide:circle-play" size="14" />
                  {{ formatTime(note.timestamp_seconds) }}
                </button>
                <span class="truncate text-xs text-muted-foreground">{{ note.lesson_name }}</span>
                <span class="ml-auto flex items-center gap-1">
                  <button
                    class="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                    title="Edit note"
                    @click="startEdit(note)"
                  >
                    <app-icon name="lucide:pencil" size="15" />
                  </button>
                  <button
                    class="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Delete note"
                    :disabled="busyId === note.id"
                    @click="remove(group, note)"
                  >
                    <app-icon name="lucide:trash-2" size="15" />
                  </button>
                </span>
              </div>

              <template v-if="editingId === note.id">
                <app-field v-model="editDraft" multiline :rows="3" :maxlength="2000" />
                <div class="mt-2 flex gap-2">
                  <button
                    class="rounded-full bg-primary/12 px-4 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                    :disabled="busyId === note.id || !editDraft.trim()"
                    @click="saveEdit(note)"
                  >
                    Save
                  </button>
                  <button
                    class="rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-foreground/5"
                    @click="cancelEdit"
                  >
                    Cancel
                  </button>
                </div>
              </template>
              <p v-else class="text-sm leading-relaxed whitespace-pre-wrap">{{ note.content }}</p>
            </article>
          </div>
        </section>
      </div>

      <div v-else class="glass-panel section-card p-10 text-center">
        <app-icon name="lucide:search-x" size="52" class="mx-auto mb-3 text-primary" />
        <h3 class="font-display text-lg font-bold">No notes match “{{ query }}”.</h3>
      </div>
    </template>

    <div v-else class="glass-panel section-card p-10 text-center">
      <app-icon name="lucide:notebook-pen" size="56" class="mx-auto mb-3 text-primary" />
      <h3 class="mb-2 font-display text-lg font-bold">You haven't taken any notes yet.</h3>
      <p class="mb-5 text-sm text-muted-foreground">
        Open any lesson and write down what matters — we'll stamp it with the exact moment.
      </p>
      <button class="btn-brand mx-auto" @click="$router.push('/user')">Go to my learning</button>
    </div>
  </div>
</template>

<script>
import { jsPDF } from 'jspdf'
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'

export default {
  name: 'MyNotes',
  components: { AppField, AppIcon },
  data() {
    return {
      courses: [],
      loading: true,
      query: '',
      editingId: null,
      editDraft: '',
      busyId: null,
    }
  },
  computed: {
    totalNotes() {
      return this.courses.reduce((sum, group) => sum + group.notes.length, 0)
    },
    filteredCourses() {
      const term = this.query.trim().toLowerCase()
      if (!term) return this.courses

      return this.courses
        .map((group) => {
          // A course title match keeps the whole course; otherwise filter its notes.
          if (group.courseTitle?.toLowerCase().includes(term)) return group
          const notes = group.notes.filter(
            (note) =>
              note.content.toLowerCase().includes(term) ||
              note.lesson_name?.toLowerCase().includes(term),
          )
          return notes.length ? { ...group, notes } : null
        })
        .filter(Boolean)
    },
    matchCount() {
      return this.filteredCourses.reduce((sum, group) => sum + group.notes.length, 0)
    },
  },
  async created() {
    try {
      const data = await this.$store.dispatch('fetchAllNotes')
      this.courses = data.courses || []
    } catch (error) {
      console.error(error)
      toast.error('Could not load your notes.')
    } finally {
      this.loading = false
    }
  },
  methods: {
    /** Deep-link into the player at this note's lesson and second. */
    openAtNote(note) {
      this.$router.push({
        path: `/learn/${note.course_id}`,
        query: { lesson: note.lesson_id, t: note.timestamp_seconds },
      })
    },
    startEdit(note) {
      this.editingId = note.id
      this.editDraft = note.content
    },
    cancelEdit() {
      this.editingId = null
      this.editDraft = ''
    },
    async saveEdit(note) {
      const content = this.editDraft.trim()
      if (!content) return

      this.busyId = note.id
      try {
        const updated = await this.$store.dispatch('updateNote', { noteId: note.id, content })
        Object.assign(note, updated)
        this.cancelEdit()
        toast.success('Note updated.')
      } catch (error) {
        console.error(error)
        toast.error('Could not update your note.')
      } finally {
        this.busyId = null
      }
    },
    async remove(group, note) {
      this.busyId = note.id
      try {
        await this.$store.dispatch('deleteNote', note.id)
        // Drop it from the source list so both the group and the filtered view update.
        const source = this.courses.find((c) => c.courseId === group.courseId)
        if (source) source.notes = source.notes.filter((n) => n.id !== note.id)
        this.courses = this.courses.filter((c) => c.notes.length)
        if (this.editingId === note.id) this.cancelEdit()
        toast.success('Note deleted.')
      } catch (error) {
        console.error(error)
        toast.error('Could not delete your note.')
      } finally {
        this.busyId = null
      }
    },
    /** Export one course's notes as a printable study sheet. */
    exportPdf(group) {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const marginX = 48
      const pageHeight = doc.internal.pageSize.getHeight()
      const textWidth = doc.internal.pageSize.getWidth() - marginX * 2
      let y = 64

      const nextLine = (height) => {
        if (y + height > pageHeight - 56) {
          doc.addPage()
          y = 64
        }
      }

      doc.setFont('helvetica', 'bold').setFontSize(18)
      doc.text(group.courseTitle || 'Course notes', marginX, y)
      y += 22

      doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(120)
      doc.text(
        `${group.notes.length} note${group.notes.length === 1 ? '' : 's'} · Online Pathshala`,
        marginX,
        y,
      )
      y += 26

      for (const note of group.notes) {
        nextLine(48)
        doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(90)
        doc.text(`[${this.formatTime(note.timestamp_seconds)}] ${note.lesson_name || ''}`, marginX, y)
        y += 16

        doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(20)
        for (const line of doc.splitTextToSize(note.content, textWidth)) {
          nextLine(16)
          doc.text(line, marginX, y)
          y += 16
        }
        y += 12
      }

      const fileName = (group.courseTitle || 'course').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      doc.save(`notes-${fileName}.pdf`)
    },
    formatTime(seconds) {
      const total = Math.max(0, Math.floor(Number(seconds) || 0))
      const hours = Math.floor(total / 3600)
      const minutes = Math.floor((total % 3600) / 60)
      const secs = total % 60
      const pad = (n) => String(n).padStart(2, '0')
      return hours ? `${hours}:${pad(minutes)}:${pad(secs)}` : `${minutes}:${pad(secs)}`
    },
  },
}
</script>
