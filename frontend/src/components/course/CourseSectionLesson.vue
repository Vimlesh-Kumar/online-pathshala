<template>
    <div>
        <div v-for="(lesson, index) in lessons" :key="index" class="mb-6 flex justify-center">
            <div class="w-full max-w-[700px] rounded-[26px] border border-black/10 p-6 dark:border-white/12">
                <h3 class="mb-4 font-display text-lg font-bold">Lecture {{ index + 1 }}:</h3>

                <form novalidate @submit.prevent="submitForm">
                    <app-field
                        v-model="lessons[index].name"
                        class="mb-4"
                        label="Lesson Name"
                        required
                    />
                    <app-field
                        v-model="lessons[index].duration"
                        class="mb-4"
                        label="Lesson Duration"
                        required
                    />

                    <div class="my-3 flex flex-wrap items-center gap-3">
                        <label
                            class="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary/50 dark:border-white/12"
                        >
                            <app-icon name="lucide:paperclip" size="18" />
                            {{ selectedFile ? selectedFile.name : 'Select a file' }}
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,.mp4"
                                class="sr-only"
                                @change="onFileSelected"
                            />
                        </label>

                        <button
                            type="button"
                            class="inline-flex items-center gap-2 rounded-full bg-primary/12 px-5 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/20"
                            @click="uploadFile(index)"
                        >
                            <app-icon name="lucide:upload" size="18" /> Upload
                        </button>
                    </div>

                    <div
                        v-if="uploadProgress !== null"
                        class="relative h-6 overflow-hidden rounded-full bg-foreground/10"
                    >
                        <div
                            class="h-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] transition-[width] duration-200"
                            :style="{ width: `${uploadProgress}%` }"
                        ></div>
                        <strong class="absolute inset-0 grid place-items-center text-xs text-white">
                            {{ Math.ceil(uploadProgress) }}%
                        </strong>
                    </div>
                    <div v-if="uploadStatus !== ''" class="mt-2 font-medium text-primary">
                        {{ uploadStatus }}
                    </div>
                </form>

                <button
                    v-if="index === lessons.length - 1"
                    class="btn-brand mt-6"
                    @click="saveAndAddNewLecture"
                >
                    <app-icon name="lucide:plus" size="18" /> Next Lecture
                </button>
            </div>
        </div>

        <div class="mt-3 flex justify-end">
            <button type="submit" class="btn-brand" @click="submitForm">Save Section</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import AppField from '@/components/ui/AppField.vue';
import AppIcon from '@/components/ui/AppIcon.vue';

export default {
    components: { AppField, AppIcon },
    data() {
        return {
            lessons: [{ name: '', duration: '', video_key: '', sectionName: '', course_id: null }],
            selectedFile: null,
            uploadProgress: null,
            uploadStatus: '',
            courseId: ''
        }
    },

    props: ['sectionName', 'sectionWithLectures'],

    mounted() {
        const currentUrl = this.$route.path
        const url = currentUrl.split("/")
        const courseId = url[2];
        this.courseId = courseId
    },

    methods: {
        onFileSelected(event) {
            this.selectedFile = event.target.files[0]
        },
        /**
         * Function to upload video file for course
         * @param {Integer} index Index to provide lecture to fetch lecture details
         */
        async uploadFile(index) {
            const file = this.selectedFile;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (event) => {
                const fileContent = event.target.result;
                this.content = fileContent

                const response = await axios.post('/course/section/lectures/upload', {
                    name: this.selectedFile.name,
                    content: fileContent
                }, {
                    onUploadProgress: (uploadEvent) => {
                        const percentCompleted = Math.round((uploadEvent.loaded * 100) / uploadEvent.total)
                        this.uploadProgress = percentCompleted
                        this.uploadStatus = `Uploading file: ${percentCompleted}%`
                    }
                })
                try {
                    this.uploadProgress = null
                    this.uploadStatus = 'File uploaded successfully!'


                    this.uploadId = response.data.video_id
                } catch (error) {
                    this.uploadProgress = null
                    this.uploadStatus = 'Error in uploading file.'
                }


                this.lessons[index].video_key = response.data.video_id;
                this.lessons[index].sectionName = this.sectionName;
                this.lessons[index].course_id = this.courseId
            }

        },


        async submitForm() {

            const formData = this.lessons
            // submit the form data to the server here
            await axios.post('/course/section/save', formData)
        },

        saveAndAddNewLecture() {
            this.lectureCount++;
            this.lessons.push({ name: '', duration: '', video_key: '', sectionName: this.sectionName, course_id: null })

        },
    }
}
</script>
