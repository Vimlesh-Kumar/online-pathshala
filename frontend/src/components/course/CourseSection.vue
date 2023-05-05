<template>
    <v-main>
        <v-container>
            <div class="d-flex justify-center py-3">
                <h1>Curriculum</h1>
            </div>
            <div>
                <v-sheet class="border true bg-blue-grey-lighten-5 mx-auto" max-width="1000">
                    <v-container>
                        <div class="d-flex">
                            <h2>Section {{ sectionCount }}:</h2>

                            <v-text-field label="Section Name" variant="solo" placeholder="Introduction"
                                v-model="sectionName" class="my-input" dense></v-text-field>
                            <v-btn @click="saveAndAddLecture">Save</v-btn>
                        </div>

                        <!-- Lecture Adding -->
                        <div v-if="addLectureform === true">
                            <v-divider class="my-3"></v-divider>
                            <CourseSectionLesson :sectionName="sectionName"></CourseSectionLesson>
                        </div>

                    </v-container>
                </v-sheet>
            </div>

        </v-container>
    </v-main>
</template>

<script>
// import axios from 'axios';
import { mapGetters } from 'vuex';
import CourseSectionLesson from './CourseSectionLesson.vue';

export default {
    data() {
        return {
            sectionCount: 1,
            addLectureform: false,
            sectionName: ''
        }
    },
    components: {
        CourseSectionLesson
    },

    computed: {
        ...mapGetters(['user'])
    },
    async created() {
        await this.$store.dispatch('fetchingUser')
    },
    methods: {
        saveAndAddLecture() {
            this.addLectureform = true;
            console.log(this.sectionName)
        }
    }

}
</script>


<style scoped>
.my-input input {
    max-height: 10px;
}
</style>