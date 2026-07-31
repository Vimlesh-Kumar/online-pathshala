<template>
    <div class="mx-auto max-w-[1100px] px-4 pt-10 pb-14">
        <h1 class="app-section-title mb-8 text-center">Added Curriculum</h1>

        <div
            v-for="(section, name) in lectureBySection"
            :key="name"
            class="glass-panel section-card mb-8 overflow-hidden"
        >
            <div class="bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] px-6 py-4">
                <h2 class="font-display text-lg font-bold text-white">
                    Section: {{ section[0].section_name }}
                </h2>
            </div>

            <div class="p-6">
                <div
                    v-for="(lecture, index) in section"
                    :key="index"
                    class="mb-5 rounded-[18px] border border-black/10 p-5 last:mb-0 dark:border-white/12"
                >
                    <h3 class="font-display font-bold">Lecture : {{ index + 1 }}</h3>
                    <separator class="my-3" />
                    <div class="grid gap-4 md:grid-cols-2">
                        <div class="flex flex-col justify-center gap-2 text-muted-foreground">
                            <p>Lecture Name: <span class="text-foreground">{{ lecture.lesson_name }}</span></p>
                            <p>Lecture Duration: <span class="text-foreground">{{ lecture.duration }}</span></p>
                        </div>
                        <div class="aspect-video overflow-hidden rounded-2xl bg-black/40">
                            <video controls class="size-full">
                                <source />
                            </video>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Separator } from '@/components/ui/separator';

export default {
    components: { Separator },
    data() {
        return {
            courseSections: [],
            lectureBySection: {}
        }
    },

    async created() {
        const currentUrl = this.$route.path;
        const url = currentUrl.split("/");
        const courseId = url[2]

        const response = await axios.get('/course/section/all-sections', {
            params: {
                course_id: courseId
            }
        })
        const data = response.data.allsectionLecturesDetails

        // lectureAccordingTOSection
        const sections = {}
        for (let object of data) {
            const section_name = object.section_name
            if (sections[section_name]) {
                sections[section_name].push(object)
            }
            else {
                sections[section_name] = []
                sections[section_name].push(object)
            }
        }

        this.courseSections = data
        this.lectureBySection = sections
    },
}
</script>
