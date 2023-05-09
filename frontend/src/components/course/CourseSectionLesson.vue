<template>
    <div>
        <v-container class="d-flex justify-center" v-for="(lesson, index) in lessons" :key="index">
            <v-card class="px-10 justify-center" width="700">
                <v-card-title class="my-2">Lecture {{ index + 1 }}:</v-card-title>
                <!-- {{ sectionName }} -->
                <div>
                    <v-form @submit.prevent="submitForm">
                        <v-text-field label="Lesson Name" v-model="lessons[index].name" required></v-text-field>
                        <v-text-field label="Lesson Duration" v-model="lessons[index].duration" required></v-text-field>
                        <div class="my-3">


                            <v-row>
                                <v-file-input label="Select a file" accept=".jpg,.jpeg,.png,.pdf,.mp4" type="file"
                                    @change="onFileSelected"></v-file-input>

                                <v-btn class="mx-5 my-3 bg-yellow" @click="uploadFile(index)"><span
                                        class="mdi mdi-upload"></span>
                                    Upload</v-btn>
                            </v-row>


                            <v-progress-linear v-if="uploadProgress !== null" :value="uploadProgress" height="25"
                                v-model="uploadProgress" color="green">
                                <strong class="text-white">{{ Math.ceil(uploadProgress) }}%</strong>
                            </v-progress-linear>
                            <div v-if="uploadStatus !== ''" class="text-green font-weight-medium ms-7">{{
                                uploadStatus }}</div>


                        </div>

                    </v-form>
                </div>
                <v-btn class="bg-green-lighten-3 mb-8" @click="saveAndAddNewLecture"
                    v-if="index === lessons.length - 1"><span class="mdi mdi-plus-thick"></span>Next Lecture</v-btn>
            </v-card>

        </v-container>
        <div class="d-flex justify-end mt-3 me-15">
            <div class="mx-10">

                <v-btn type="submit" color="green-lighten-3" @click="submitForm">Save Section</v-btn>
            </div>

        </div>
    </div>
</template>



<script>
import axios from 'axios';

export default {
    data() {
        return {
            lessons: [{ name: '', duration: '', video_key: '', sectionName: '', course_id: null }],
            selectedFile: null,
            uploadProgress: null,
            uploadStatus: '',
            courseId: ''
        }
    },

    props: ['sectionName'],

    mounted() {
        const currentUrl = this.$route.path
        const url = currentUrl.split("/")
        const courseId = url[2];
        // console.log(courseId)
        this.courseId = courseId
        // this.lessons.course_id=courseId
    },

    methods: {
        onFileSelected(event) {
            console.log(event.target.files[0])
            this.selectedFile = event.target.files[0]
        },
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
                        console.log("progress: " + Math.round(uploadEvent.loaded / uploadEvent.total * 100) + '%')
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
                console.log(this.courseId)
            }

        },


        async submitForm() {

            const formData = this.lessons
            console.log(formData);
            // submit the form data to the server here
            await axios.post('/course/section/save', formData)
        },

        saveAndAddNewLecture() {
            this.lectureCount++;
            this.lessons.push({ name: '', duration: '', video_key: '', sectionName: this.sectionName, course_id: null })
            console.log(this.lessons)

        }
    }
}
</script>



