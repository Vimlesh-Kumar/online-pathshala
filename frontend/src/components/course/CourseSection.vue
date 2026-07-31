<template>
    <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
        <h1 class="app-section-title mb-6 text-center">Curriculum</h1>

        <div class="glass-panel section-card mx-auto max-w-[1000px] p-6">
            <div class="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                <h2 class="font-display text-xl font-bold">Section {{ sectionCount }}:</h2>
                <app-field
                    v-model="sectionName"
                    class="w-full md:max-w-100"
                    label="Section Name"
                    placeholder="Introduction"
                />
                <button class="btn-brand shrink-0" @click="handleEditSection">Edit Section</button>
            </div>

            <div v-if="addLectureform === false" class="mt-6 flex justify-center">
                <button
                    class="inline-flex items-center gap-2 rounded-full bg-primary/12 px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/20"
                    @click="addLectureform = true"
                >
                    <app-icon name="lucide:plus" size="18" /> Lecture
                </button>
            </div>

            <!-- Lecture Adding -->
            <div v-if="addLectureform === true">
                <separator class="my-5" />
                <CourseSectionLesson :sectionName="sectionName" :sectionWithLectures="sectionsWithLectures">
                </CourseSectionLesson>
            </div>
        </div>

        <CurruculumDisplay></CurruculumDisplay>
    </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import CourseSectionLesson from './CourseSectionLesson.vue';
import CurruculumDisplay from './CurruculumDisplayForTutor.vue';
import AppField from '@/components/ui/AppField.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import { Separator } from '@/components/ui/separator';

export default {
    data() {
        return {
            sectionCount: 1,
            addLectureform: false,
            sectionName: '',
            editSection: false,
            sectionLectures: [],
            sectionsWithLectures: []
        }
    },
    components: {
        CourseSectionLesson,
        CurruculumDisplay,
        AppField,
        AppIcon,
        Separator
    },

    computed: {
        ...mapGetters(['user'])
    },

    async created() {
        await this.$store.dispatch('fetchingUser');

        const currentUrl = this.$route.path;
        const url = currentUrl.split("/");
        const courseId = url[2]

        const response = await axios.get('/course/section/all-sections', {
            params: {
                course_id: courseId
            }
        })
        this.sectionLectures = response.data.allsectionLecturesDetails
    },

    methods: {
        async handleEditSection() {
            this.editSection = true;
            this.addLectureform = true;
            const allLectures = this.sectionLectures

            this.sectionName = allLectures[0].section_name
            this.sectionsWithLectures = allLectures
        },

    }

}
</script>
