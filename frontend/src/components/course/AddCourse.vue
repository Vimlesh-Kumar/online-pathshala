<template>
    <div class="mx-auto max-w-[520px] px-4 py-10">
        <div class="glass-panel section-card px-8 py-6">
            <h1 class="mb-1 font-display text-2xl font-bold">Course details</h1>
            <p class="mb-6 text-sm text-muted-foreground">
                Fill in the basics, or use Suggest for a free starting draft.
            </p>

            <form novalidate @submit.prevent="submitForm">
                <app-field v-model="title" class="mb-4" label="Course Title" required />

                <div class="mb-4 flex flex-col gap-1.5">
                    <span class="text-sm font-semibold">Category <span class="text-destructive">*</span></span>
                    <select-root v-model="category">
                        <select-trigger class="h-12 w-full rounded-2xl" aria-label="Category">
                            <select-value placeholder="Choose a category" />
                        </select-trigger>
                        <select-content class="rounded-2xl">
                            <select-item v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</select-item>
                        </select-content>
                    </select-root>
                </div>

                <div class="mb-1 flex items-end gap-2">
                    <app-field v-model="subtitle" class="flex-1" label="Subtitle" required />
                    <button
                        type="button"
                        class="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary/12 px-4 py-3 font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                        :disabled="suggesting || !title"
                        @click="getSuggestions"
                    >
                        <app-icon
                            :name="suggesting ? 'lucide:loader-circle' : 'lucide:wand-sparkles'"
                            size="18"
                            :class="suggesting ? 'animate-spin' : ''"
                        />
                        Suggest
                    </button>
                </div>

                <div
                    v-if="suggestions"
                    class="mt-2 mb-4 rounded-[18px] border border-black/5 bg-primary/5 p-3.5 dark:border-white/10"
                >
                    <div class="mb-2 text-xs font-bold">Pick a subtitle:</div>
                    <button
                        v-for="(s, i) in suggestions.subtitles"
                        :key="i"
                        type="button"
                        class="mr-2 mb-2 rounded-2xl border border-black/10 px-3 py-1.5 text-left text-sm transition-colors hover:border-primary/50 dark:border-white/12"
                        @click="subtitle = s"
                    >
                        {{ s }}
                    </button>

                    <div class="mt-3 mb-2 text-xs font-bold">Or a title:</div>
                    <button
                        v-for="(t, i) in suggestions.titles"
                        :key="i"
                        type="button"
                        class="mr-2 mb-2 rounded-2xl border border-black/10 px-3 py-1.5 text-left text-sm transition-colors hover:border-primary/50 dark:border-white/12"
                        @click="title = t"
                    >
                        {{ t }}
                    </button>
                </div>

                <app-field v-model="price" class="mt-3 mb-4" label="Price" type="number" required />
                <app-field v-model="url" class="mb-6" label="Course Thumbnail URL" type="url" required />

                <button type="submit" class="btn-brand w-full">ADD COURSE</button>
            </form>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import AppField from '@/components/ui/AppField.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import {
    Select as SelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

export default {
    components: {
        AppField,
        AppIcon,
        SelectRoot,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue
    },
    data() {
        return {
            title: "",
            subtitle: "",
            author: "",
            category: "",
            categories: this.$store.state.categories,
            price: "",
            url: "",
            suggestions: null,
            suggesting: false
        };
    },
    computed: {
        ...mapGetters(['user'])
    },
    methods: {
        async getSuggestions() {
            this.suggesting = true
            try {
                this.suggestions = await this.$store.dispatch('suggestCourseCopy', {
                    title: this.title,
                    category: this.category
                })
            } finally {
                this.suggesting = false
            }
        },
        async submitForm() {
            const courseDetails = {
                title: this.title,
                subtitle: this.subtitle,
                author: this.user.full_name,
                category: this.category,
                price: this.price,
                thumb_url: this.url
            };
            await axios.post('user/tutor/add-course', courseDetails)
            this.$router.push('/user')
        }
    },
};
</script>
