<template>
    <div class="mx-auto max-w-[1000px] px-4 pt-10 pb-14">
        <div class="glass-panel section-card overflow-hidden">
            <h1 class="p-6 text-center font-display text-2xl font-bold">Course Objectives</h1>
            <separator />

            <div class="p-6">
                <div
                    v-for="objective in courseObjectives"
                    :key="objective.id"
                    class="flex items-center gap-3 border-b border-black/5 py-3 last:border-b-0 dark:border-white/10"
                >
                    <app-icon name="lucide:arrow-right" size="18" class="shrink-0 text-primary" />
                    <p class="mr-auto">{{ objective.objective }}</p>

                    <button
                        class="grid size-9 place-items-center rounded-xl border border-black/10 transition-colors hover:border-primary/50 dark:border-white/12"
                        aria-label="Edit objective"
                        @click="editObjective(objective)"
                    >
                        <app-icon name="lucide:pencil" size="16" />
                    </button>
                    <button
                        class="grid size-9 place-items-center rounded-xl border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                        aria-label="Delete objective"
                        @click="deleteObjective(objective)"
                    >
                        <app-icon name="lucide:trash-2" size="16" />
                    </button>
                </div>
            </div>

            <!-- Objective edit -->
            <dialog-root v-model:open="showEditDialog">
                <dialog-content class="sm:max-w-[500px]">
                    <dialog-header>
                        <dialog-title class="font-display text-xl font-bold">Edit Objective</dialog-title>
                    </dialog-header>
                    <app-field v-model="editedObjective.objective" label="Objective" />
                    <dialog-footer class="mt-4">
                        <button
                            class="rounded-full px-5 py-2.5 font-semibold text-muted-foreground transition-colors hover:text-foreground"
                            @click="showEditDialog = false"
                        >
                            Cancel
                        </button>
                        <button class="btn-brand" @click="saveEditedObjective">Save</button>
                    </dialog-footer>
                </dialog-content>
            </dialog-root>

            <div class="m-5 rounded-[18px] border border-black/10 p-5 dark:border-white/12">
                <div
                    v-for="(objective, index) in objectives"
                    :key="index"
                    class="mb-3 flex items-end gap-3"
                >
                    <app-field v-model="objective.text" class="flex-1" label="Objective" />
                    <button
                        v-if="index === objectives.length - 1"
                        class="btn-brand shrink-0 px-5"
                        aria-label="Add another objective"
                        @click="addObjective"
                    >
                        <app-icon name="lucide:plus" size="18" />
                    </button>
                </div>

                <div class="mt-6 flex flex-wrap justify-center gap-4">
                    <button type="submit" class="btn-brand" @click="submitObjectives">Save Objectives</button>
                    <button
                        class="rounded-full bg-primary/12 px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/20"
                        @click="redirectToCurriculum"
                    >
                        Add Curriculum
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import AppField from '@/components/ui/AppField.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import { Separator } from '@/components/ui/separator';
import {
    Dialog as DialogRoot,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

export default {
    components: {
        AppField,
        AppIcon,
        Separator,
        DialogRoot,
        DialogContent,
        DialogFooter,
        DialogHeader,
        DialogTitle
    },

    data() {
        return {
            objectives: [{ text: "" }],
            courseId: null,
            url: '',
            showEditDialog: false,
            editedObjective: {},
            editedObjectiveId: null
        };
    },
    methods: {
        addObjective() {
            this.objectives.push({ text: "" });
        },

        editObjective(objective) {
            this.showEditDialog = true;
            this.editedObjectiveId = objective.id;
            this.editedObjective = objective
        },

        async saveEditedObjective() {
            const obj = this.editedObjective
            this.showEditDialog = false;

            await axios.put('/course/objective', obj)
        },

        async deleteObjective(objective) {
            await axios.delete(`/course/objective/${objective.id}`)
            await this.$store.dispatch('getObjectives', this.courseId)
        },


        async submitObjectives() {
            const data = {
                objectives: this.objectives,
                course_id: this.courseId
            }
            await axios.post('/course/objectives', data)
            await this.$store.dispatch('getObjectives', this.courseId)

            this.objectives = [{ text: "" }]
        },

        redirectToCurriculum() {
            const newUrlSplit = this.url.slice(0, 3)
            const newUrl = newUrlSplit.join("/")

            this.$router.push(newUrl + '/section')
        }
    },


    computed: {
        ...mapGetters(['user', 'courseObjectives'])
    },
    mounted() {
        const currentUrl = this.$route.path
        this.url = currentUrl.split("/")
        this.courseId = this.url[2];
    },
    async created() {
        await this.$store.dispatch('fetchingUser')
        await this.$store.dispatch('getObjectives', this.courseId)
    }
}
</script>
