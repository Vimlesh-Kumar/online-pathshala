<template>
    <v-main>
        <v-container>
            <div class="mx-auto d-flex justify-center">
                <h1>Curriculum</h1>
            </div>
            <div>
                <v-sheet class="border true bg-blue-grey-lighten-5 mx-auto" max-width="900">
                    <v-container>
                        <div class="d-flex">
                            <h2>Section {{ sectionCount }}:</h2>
                            <v-text-field label="Section Name" v-model="sectionName"></v-text-field>
                            <v-btn>Save</v-btn>
                        </div>
                        <v-container class="ms-15">
                            <v-card class="px-10  me-15 ">
                                <v-card-title class="my-2">Lecture {{ lessonCount }}</v-card-title>
                                <div>
                                    <v-form @submit.prevent="submitForm">
                                        <v-text-field label="Lesson Name" v-model="lessonName" required></v-text-field>
                                        <v-text-field label="Lesson Duration" v-model="lessonDuration"
                                            required></v-text-field>
                                        <div class="my-3">
                                            <v-row>
                                                <v-file-input ref="fileInput" label="Select a file"
                                                    accept=".jpg,.jpeg,.png,.pdf,.mp4"></v-file-input>
                                                <v-btn class="mx-5 my-3 bg-yellow" @click="uploadFile"><span
                                                        class="mdi mdi-upload"></span> Upload</v-btn>
                                            </v-row>


                                            <v-progress-linear v-if="uploadProgress !== null" :value="uploadProgress"
                                                height="25" v-model="uploadProgress" color="green">
                                                <strong class="text-white">{{ Math.ceil(uploadProgress) }}%</strong>
                                            </v-progress-linear>
                                            <div v-if="uploadStatus !== ''" class="text-green font-weight-medium ms-7">{{
                                                uploadStatus }}</div>


                                        </div>
                                        <v-btn class="my-8" type="submit" block color="primary">Submit</v-btn>
                                    </v-form>
                                </div>
                            </v-card>
                        </v-container>
                    </v-container>

                </v-sheet>
            </div>
        </v-container>
    </v-main>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            sectionCount: 1,
            lessonCount: 1,
            lessonName: '',
            lessonDuration: '',
            uploadId: '',


            uploadProgress: null,
            uploadStatus: ''
        }
    },
    computed: {
        ...mapGetters(['user'])
    },
    async created() {
        await this.$store.dispatch('fetchingUser')
    },
    methods: {
        async uploadFile() {
            // console.log(this.$refs.fileInput.files[0])
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
                            console.log(progressEvent)
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
        }
    }
}
</script>




<!-- <template>
    <v-main>
        <v-container>
            <v-card>
                <v-card-title>
                    <v-text-field v-model="name" label="Name" outlined dense class="mr-3"></v-text-field>
                    <v-btn @click="saveName" color="primary">Save</v-btn>
                </v-card-title>
                <v-card-text>
                    <div v-if="!editing">{{ name }}</div>
                    <v-text-field v-if="editing" v-model="editedName" label="Name" outlined dense
                        class="mr-3"></v-text-field>
                    <v-btn v-if="!editing" @click="editing = true" color="primary">Edit</v-btn>
                    <v-btn v-if="editing" @click="saveEditedName" color="primary">Save</v-btn>
                </v-card-text>
            </v-card>
        </v-container>
    </v-main>
</template>

<script>
export default {
    data() {
        return {
            name: '',
            editedName: '',
            editing: false,
        };
    },
    methods: {
        saveName() {
            this.editing = false;
        },
        saveEditedName() {
            this.name = this.editedName;
            this.editing = false;
        },
    },
};
</script> -->
