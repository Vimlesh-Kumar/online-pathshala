<script setup lang="ts">
/**
 * App-wide icon. Renders from an offline Iconify subset — no network requests.
 *
 * Names are `set:name`, e.g. `lucide:heart`. Lucide is the house set; the `mdi`
 * set is kept only for brand marks Lucide does not carry (GitHub, Vue, …).
 *
 * New icons are picked up from source automatically: `npm run icons`.
 */
import { computed } from 'vue'
import { Icon } from '@iconify/vue/offline'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    /** Iconify name, e.g. `lucide:play`. */
    name: string
    /** Any CSS length; a bare number is treated as pixels. */
    size?: string | number
    /**
     * Paint the glyph solid in the current text colour.
     *
     * Lucide ships stroke-only outlines with `fill="none"` set as a
     * presentation attribute on each shape, which a `fill-*` class on the
     * <svg> cannot override — the fill has to be applied to the shapes
     * themselves, which is what this does.
     */
    filled?: boolean
    class?: string
  }>(),
  { size: '1.25em' },
)

const dimension = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <Icon
    :icon="name"
    :width="dimension"
    :height="dimension"
    :class="cn('inline-block shrink-0', filled && '[&_*]:fill-current', props.class)"
    aria-hidden="true"
  />
</template>
