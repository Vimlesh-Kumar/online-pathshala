<template>
  <div class="glass-panel section-card p-6">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="eyebrow mb-1">Your notes</div>
        <p class="text-xs text-muted-foreground">
          Notes are stamped with the exact moment in the video — click one to jump back.
        </p>
      </div>
      <div class="flex rounded-full bg-foreground/5 p-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors"
          :class="
            scope === tab.value
              ? 'bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] text-white'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="scope = tab.value"
        >
          {{ tab.label }}
          <span class="ml-1 opacity-70">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Composer -->
    <div class="mb-6">
      <div class="mb-2 flex flex-wrap items-center gap-2">
        <span
          v-if="draftTimestamp !== null"
          class="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-bold text-primary"
        >
          <app-icon name="lucide:clock" size="14" /> Noting at {{ formatTime(draftTimestamp) }}
        </span>
        <span v-else class="text-xs text-muted-foreground">
          {{
            canTimestamp
              ? 'Start typing to attach this note to the current moment.'
              : 'Timestamps are unavailable for this video — your note will still be saved.'
          }}
        </span>
        <button
          v-if="draftTimestamp !== null && canTimestamp"
          class="text-xs font-semibold text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          @click="captureTimestamp"
        >
          Use current time
        </button>
      </div>

      <app-field
        v-model="draft"
        multiline
        :rows="3"
        :maxlength="2000"
        placeholder="Write what you want to remember from this moment…"
        @keydown.ctrl.enter="save"
        @keydown.meta.enter="save"
      />

      <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span class="text-xs text-muted-foreground">
          {{ draft.length }}/2000 · Ctrl + Enter to save
        </span>
        <button class="btn-brand" :disabled="saving || !draft.trim()" @click="save">
          <app-icon
            :name="saving ? 'lucide:loader-circle' : 'lucide:notebook-pen'"
            size="18"
            :class="saving ? 'animate-spin' : ''"
          />
          Save note
        </button>
      </div>
    </div>

    <!-- List -->
    <div v-if="loading" class="py-8 text-center">
      <app-icon name="lucide:loader-circle" size="32" class="mx-auto animate-spin text-primary" />
    </div>

    <div v-else-if="visibleNotes.length" class="flex flex-col gap-3">
      <div
        v-for="note in visibleNotes"
        :key="note.id"
        class="rounded-2xl border border-black/5 bg-foreground/[0.03] p-4 dark:border-white/10"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
            :title="`Jump to ${formatTime(note.timestamp_seconds)}`"
            @click="$emit('jump', { lessonId: note.lesson_id, seconds: note.timestamp_seconds })"
          >
            <app-icon name="lucide:circle-play" size="14" />
            {{ formatTime(note.timestamp_seconds) }}
          </button>
          <span v-if="scope === 'course'" class="truncate text-xs text-muted-foreground">
            {{ note.lesson_name }}
          </span>
          <div class="ml-auto flex items-center gap-1">
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
              @click="remove(note)"
            >
              <app-icon name="lucide:trash-2" size="15" />
            </button>
          </div>
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
      </div>
    </div>

    <p v-else class="py-6 text-center text-sm text-muted-foreground">
      {{
        scope === 'lesson'
          ? 'No notes on this lesson yet — jot down your first takeaway above.'
          : 'No notes in this course yet.'
      }}
    </p>
  </div>
</template>

<script>
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'

export default {
  name: 'LessonNotes',
  components: { AppField, AppIcon },
  props: {
    courseId: { type: [Number, String], required: true },
    lessonId: { type: [Number, String], default: null },
    /**
     * Reads the current playback position, in seconds. Supplied by the player;
     * returns null when the video API isn't available, in which case notes are
     * still saved — just without a timestamp.
     */
    getTimestamp: { type: Function, default: null },
  },
  emits: ['jump'],
  data() {
    return {
      notes: [],
      loading: true,
      saving: false,
      draft: '',
      draftTimestamp: null,
      editingId: null,
      editDraft: '',
      busyId: null,
      scope: 'lesson',
    }
  },
  computed: {
    canTimestamp() {
      return typeof this.getTimestamp === 'function'
    },
    lessonNotes() {
      return this.notes.filter((n) => n.lesson_id === Number(this.lessonId))
    },
    visibleNotes() {
      return this.scope === 'lesson' ? this.lessonNotes : this.notes
    },
    tabs() {
      return [
        { value: 'lesson', label: 'This lesson', count: this.lessonNotes.length },
        { value: 'course', label: 'Whole course', count: this.notes.length },
      ]
    },
  },
  watch: {
    lessonId() {
      // A new lesson starts a fresh note — the old timestamp no longer applies.
      this.draftTimestamp = null
      this.cancelEdit()
    },
    draft(value) {
      // Stamp the note at the moment the user starts writing, not at the moment
      // they finish — by then the video has moved on.
      if (value && this.draftTimestamp === null) this.captureTimestamp()
    },
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.loading = true
      try {
        this.notes = await this.$store.dispatch('fetchCourseNotes', this.courseId)
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    captureTimestamp() {
      // Without a live player there is no position to stamp — leave it unset so
      // the composer doesn't claim a moment it can't read.
      if (!this.canTimestamp) return
      this.draftTimestamp = this.getTimestamp() ?? 0
    },
    async save() {
      const content = this.draft.trim()
      if (!content || !this.lessonId) return

      this.saving = true
      try {
        const note = await this.$store.dispatch('createNote', {
          courseId: this.courseId,
          lessonId: this.lessonId,
          timestampSeconds: this.draftTimestamp ?? 0,
          content,
        })
        // Keep the local list in playback order without a round trip.
        this.notes = [...this.notes, note].sort(
          (a, b) => a.lesson_id - b.lesson_id || a.timestamp_seconds - b.timestamp_seconds,
        )
        this.draft = ''
        this.draftTimestamp = null
        toast.success('Note saved.')
      } catch (error) {
        console.error(error)
        toast.error('Could not save your note.')
      } finally {
        this.saving = false
      }
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
    async remove(note) {
      this.busyId = note.id
      try {
        await this.$store.dispatch('deleteNote', note.id)
        this.notes = this.notes.filter((n) => n.id !== note.id)
        if (this.editingId === note.id) this.cancelEdit()
        toast.success('Note deleted.')
      } catch (error) {
        console.error(error)
        toast.error('Could not delete your note.')
      } finally {
        this.busyId = null
      }
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
