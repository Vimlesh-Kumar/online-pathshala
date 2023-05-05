<template>
    <div>
        <!-- <h1>vvvv{{ sectionName }}</h1> -->
        <v-container class="d-flex justify-center" v-for="i in lessonCount" :key="i">
            <v-card class="px-10 justify-center" width="700">
                <v-card-title class="my-2">Lecture {{ i }}</v-card-title>
                <div>
                    <v-form @submit.prevent="submitForm">
                        <v-text-field label="Lesson Name" v-model="lessonName" required></v-text-field>
                        <v-text-field label="Lesson Duration" v-model="lessonDuration" required></v-text-field>
                        <div class="my-3">


                            <v-row>
                                <v-file-input type="file" ref="fileInput" label="Select a file"
                                    accept=".jpg,.jpeg,.png,.pdf,.mp4"></v-file-input>
                                <v-btn class="mx-5 my-3 bg-yellow" @click="uploadFile"><span class="mdi mdi-upload"></span>
                                    Upload</v-btn>
                            </v-row>


                            <v-progress-linear v-if="uploadProgress !== null" :value="uploadProgress" height="25"
                                v-model="uploadProgress" color="green">
                                <strong class="text-white">{{ Math.ceil(uploadProgress) }}%</strong>
                            </v-progress-linear>
                            <div v-if="uploadStatus !== ''" class="text-green font-weight-medium ms-7">{{
                                uploadStatus }}</div>


                        </div>
                        <!-- <v-btn class="my-8" type="submit" block color="primary">Submit</v-btn> -->
                    </v-form>
                </div>
            </v-card>
        </v-container>
        <div class="d-flex justify-end mt-3 me-15">
            <div class="mx-10">

                <v-btn class="" type="submit" color="primary">Submit</v-btn>
            </div>
            <v-btn class="bg-green-lighten-3" @click="addNewLecture">Add Next
                Lecture</v-btn>
        </div>
    </div>
</template>



<script>
import axios from 'axios';

export default {
    data() {
        return {
            lessonCount: 1,
            lessonName: '',
            lessonDuration: '',
            uploadId: '',


            sections: [],



            uploadProgress: null,
            uploadStatus: ''
        }
    },

    props: ['sectionName'],
    methods: {
        async uploadFile() {
            console.log(this.$refs.fileInput)
            const file = this.$refs.fileInput.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (event) => {
                const fileContent = event.target.result;
                // console.log(fileContent)
                const response = await axios.post('/lessons/upload',
                    {
                        name: file.name,
                        content: fileContent
                    },

                    {
                        onUploadProgress: (progressEvent) => {
                            // console.log(progressEvent)
                            const percentCompleted = parseInt(Math.round((progressEvent.loaded * 100) / progressEvent.total))
                            this.uploadProgress = percentCompleted
                            this.uploadStatus = `Uploading file: ${percentCompleted}%`
                        }
                    }
                )
                try {
                    // const data = response;
                    // console.log(data);
                    this.uploadProgress = null
                    this.uploadStatus = 'File uploaded successfully!'


                    this.uploadId = response.data.video_id
                } catch (error) {
                    this.uploadProgress = null
                    this.uploadStatus = 'Error in uploading file.'
                }
            }
        },

        submitForm() {
            const formData = {
                lessonName: this.lessonName,
                lessonDuration: this.lessonDuration,
                videoKey: this.uploadId
            }
            console.log(formData);
            // submit the form data to the server here
        },

        addNewLecture() {
            this.lessonCount++
        }
    }
}
</script>