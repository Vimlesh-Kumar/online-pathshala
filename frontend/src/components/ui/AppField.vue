<script setup lang="ts">
/**
 * Labelled form control — the replacement for `<v-text-field>` / `<v-textarea>`.
 *
 * Wraps a native input (or textarea) with a floating-free label, an optional
 * leading icon, and an error line, so the migrated forms stay consistent
 * without repeating the same 15 lines of markup on every screen.
 */
import { computed, useId } from 'vue'
import AppIcon from './AppIcon.vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    type?: string
    /** Iconify name rendered inside the field's leading edge. */
    icon?: string
    placeholder?: string
    error?: string
    hint?: string
    readonly?: boolean
    disabled?: boolean
    required?: boolean
    /** Render a <textarea> instead of an <input>. */
    multiline?: boolean
    rows?: number
    maxlength?: number
    class?: string
  }>(),
  { type: 'text', rows: 4 },
)

// `blur` is re-emitted explicitly: it does not bubble, so a listener placed on
// the component would otherwise land on the wrapper div and never fire.
const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
}>()

const id = useId()
const describedBy = computed(() => (props.error || props.hint ? `${id}-msg` : undefined))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<template>
  <div :class="cn('flex flex-col gap-1.5', props.class)">
    <label v-if="label" :for="id" class="text-sm font-semibold">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>

    <div class="relative flex items-center">
      <app-icon
        v-if="icon && !multiline"
        :name="icon"
        size="18"
        class="pointer-events-none absolute left-3.5 text-muted-foreground"
      />

      <textarea
        v-if="multiline"
        :id="id"
        :value="modelValue ?? ''"
        :rows="rows"
        :maxlength="maxlength"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        class="w-full rounded-2xl border border-black/10 bg-foreground/[0.04] px-4 py-3 outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-3 focus:ring-primary/20 disabled:opacity-60 aria-invalid:border-destructive/60 dark:border-white/12"
        @input="onInput"
        @blur="emit('blur', $event)"
      ></textarea>

      <input
        v-else
        :id="id"
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        class="h-12 w-full rounded-2xl border border-black/10 bg-foreground/[0.04] pr-4 outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-3 focus:ring-primary/20 disabled:opacity-60 aria-invalid:border-destructive/60 dark:border-white/12"
        :class="icon ? 'pl-11' : 'pl-4'"
        @input="onInput"
        @blur="emit('blur', $event)"
      />
    </div>

    <p v-if="error || hint" :id="`${id}-msg`" class="text-xs" :class="error ? 'text-destructive' : 'text-muted-foreground'">
      {{ error || hint }}
    </p>
  </div>
</template>
