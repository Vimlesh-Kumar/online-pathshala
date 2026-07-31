<script setup lang="ts">
/**
 * Read-only or interactive star rating — replaces Vuetify's `<v-rating>`,
 * which has no shadcn-vue equivalent.
 *
 * Two stacked rows: outlined stars underneath, filled stars on top clipped to
 * the score's width. Both rows are laid out identically, so a 4.3 fills four
 * stars plus 30% of the fifth with no seam.
 *
 * The icons render as `block`, not the AppIcon default `inline-block` — inline
 * elements sit on a text baseline, which offsets the two rows from each other.
 */
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: number
    max?: number
    /** Icon pixel size. */
    size?: number
    readonly?: boolean
    class?: string
  }>(),
  { modelValue: 0, max: 5, size: 14, readonly: true },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const gap = computed(() => Math.max(2, Math.round(props.size * 0.14)))
const filledWidth = computed(() => {
  const clamped = Math.min(Math.max(props.modelValue, 0), props.max)
  return `${(clamped / props.max) * 100}%`
})
</script>

<template>
  <div
    :class="cn('relative inline-flex w-fit items-center', props.class)"
    :role="readonly ? 'img' : undefined"
    :aria-label="readonly ? `Rated ${modelValue} out of ${max}` : undefined"
  >
    <!-- Track -->
    <div class="flex" :style="{ gap: `${gap}px` }">
      <app-icon
        v-for="i in max"
        :key="`empty-${i}`"
        name="lucide:star"
        :size="size"
        class="block text-muted-foreground/35"
      />
    </div>

    <!-- Fill -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 flex overflow-hidden"
      :style="{ width: filledWidth, gap: `${gap}px` }"
    >
      <app-icon
        v-for="i in max"
        :key="`full-${i}`"
        name="lucide:star"
        :size="size"
        filled
        class="block text-brand-amber"
      />
    </div>

    <!-- Interactive hit targets -->
    <div v-if="!readonly" class="absolute inset-0 flex" :style="{ gap: `${gap}px` }" role="radiogroup">
      <button
        v-for="i in max"
        :key="`hit-${i}`"
        type="button"
        class="cursor-pointer transition-transform hover:scale-125"
        :style="{ width: `${size}px` }"
        :aria-label="`Rate ${i} of ${max}`"
        :aria-checked="Math.round(modelValue) === i"
        role="radio"
        @click="emit('update:modelValue', i)"
      />
    </div>
  </div>
</template>
