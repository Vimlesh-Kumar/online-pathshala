<template>
    <div class="my-10">
        <v-card class="mt-10 mx-auto px-8 py-5 glass-panel section-card" max-width="520" flat>
            <v-card-title class="mb-1">Course details</v-card-title>
            <v-card-subtitle class="mb-4">Fill in the basics, or use Suggest for a free starting draft.</v-card-subtitle>
            <v-form @submit.prevent="submitForm">
                <v-text-field variant="outlined" label="Course Title" v-model="title" required></v-text-field>
                <v-select variant="outlined" label="Category" v-model="category" :items="categories" required></v-select>

                <div class="d-flex ga-2 mb-1">
                    <v-text-field variant="outlined" label="Subtitle" v-model="subtitle" required hide-details />
                    <v-btn variant="tonal" :loading="suggesting" :disabled="!title" @click="getSuggestions">
                        <v-icon start size="18">mdi-auto-fix</v-icon> Suggest
                    </v-btn>
                </div>

                <div v-if="suggestions" class="suggestion-box mb-4 mt-2">
                    <div class="text-caption font-weight-bold mb-2">Pick a subtitle:</div>
                    <v-chip
                        v-for="(s, i) in suggestions.subtitles" :key="i" class="mb-2 mr-2 chip-wrap"
                        variant="outlined" @click="subtitle = s"
                    >{{ s }}</v-chip>

                    <div class="text-caption font-weight-bold mb-2 mt-3">Or a title:</div>
                    <v-chip
                        v-for="(t, i) in suggestions.titles" :key="i" class="mb-2 mr-2"
                        variant="outlined" @click="title = t"
                    >{{ t }}</v-chip>
                </div>

                <v-text-field variant="outlined" label="Price" v-model="price" type="number" required class="mt-3"></v-text-field>
                <v-text-field variant="outlined" label="Course Thumbnail URL" v-model="url" type="url" required></v-text-field>
                <v-btn block class="btn-gradient" size="large" type="submit" required>ADD COURSE</v-btn>
            </v-form>
        </v-card>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
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

<style scoped>
.suggestion-box {
    background: var(--grad-primary-soft);
    border: 1px solid var(--glass-border);
    border-radius: var(--r-md);
    padding: 14px;
}
.chip-wrap {
    height: auto;
    white-space: normal;
    text-align: left;
}
</style>
