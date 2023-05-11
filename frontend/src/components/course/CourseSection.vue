<template>
    <v-main>
        <v-container>
            <div class="d-flex justify-center py-3">
                <h1>Curriculum</h1>
            </div>
            <div>
                <v-sheet class="border true bg-blue-grey-lighten-5 mx-auto" max-width="1000">



                    <v-container>
                        <div class="d-flex align-center justify-md-space-around">
                            <h2>Section {{ sectionCount }}:</h2>
                            <v-sheet width="400">
                                <v-text-field label="Section Name" variant="solo" placeholder="Introduction"
                                    v-model="sectionName" hide-details="auto"></v-text-field>
                            </v-sheet>

                            <v-btn class="bg-blue" @click="handleEditSection">Edit Section</v-btn>
                        </div>
                        <div class="mx-14 my-5" v-if="addLectureform === false">
                            <!-- <v-icon>mdi-delete-alert</v-icon> -->
                            <!-- <v-sheet class="border true"> -->
                            <v-btn @click="addLectureform = true"> <v-icon>mdi-plus</v-icon>Lecture</v-btn>
                            <!-- </v-sheet> -->
                        </div>

                        <!-- Lecture Adding -->
                        <div v-if="addLectureform === true">
                            <v-divider class="my-3"></v-divider>
                            <CourseSectionLesson :sectionName="sectionName" :sectionWithLectures="sectionsWithLectures">
                            </CourseSectionLesson>
                        </div>

                        <!-- Curriculum Display -->
                        
                    </v-container>
                </v-sheet>
            </div>
            <CurruculumDisplay></CurruculumDisplay>

        </v-container>
    </v-main>
</template>

<script>
import axios from 'axios';
// import axios from 'axios';
import { mapGetters } from 'vuex';
import CourseSectionLesson from './CourseSectionLesson.vue';
import CurruculumDisplay from './CurruculumDisplayForTutor.vue';

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
        CurruculumDisplay
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
        console.log(response)
    },

    methods: {
        async handleEditSection() {
            this.editSection = true;
            this.addLectureform = true;
            // const response=await axios.get()
            const allLectures = this.sectionLectures
            console.log(allLectures)

            this.sectionName = allLectures[0].section_name
            this.sectionsWithLectures = allLectures
        },

    }

}
</script>
