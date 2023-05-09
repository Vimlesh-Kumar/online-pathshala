<template>
    <v-main>
        <v-container>
            <v-card class="mx-auto" max-width="1000">
                <v-card-title class="text-center mt-2">Course Objectives</v-card-title>
                <v-container>
                    <v-divider class="mb-5"></v-divider>
                    <div class="d-flex my-2 mx-5" v-for="objective in courseObjectives" :key="objective">
                        <div class="me-auto">
                            <p><span class="mdi mdi-arrow-right-bold"></span>
                                {{ objective.objective }}</p>
                        </div>
                        <div class="d-flex justify-end">
                            <v-btn @click="editObjective(objective)">
                                <span class="mdi mdi-pencil-outline"></span>
                            </v-btn>

                            <!-- Objective Edit -->
                            <v-dialog v-model="showEditDialog" max-width="500">
                                <v-card>
                                    <v-card-title>Edit Objective</v-card-title>
                                    <v-card-text>
                                        <v-form>
                                            <v-text-field v-model="editedObjective.objective"></v-text-field>
                                        </v-form>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn @click="saveEditedObjective">Save</v-btn>
                                        <v-btn @click="showEditDialog = false">Cancel</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                            <!--Delete Objective  -->
                            <v-btn class="mx-4 text-red"
                                @click="deleteObjective(objective)"><v-icon>mdi-delete-alert</v-icon></v-btn>
                        </div>
                    </div>

                </v-container>
                <v-sheet class="border true ma-5 pa-5">
                    <!-- <v-card-text> -->
                    <v-container fluid>
                        <v-row v-for="(objective, index) in objectives" :key="index"
                            class="d-flex justify-center align-center align-content-center">
                            <v-col cols="8">
                                <v-text-field v-model="objective.text" :label="`Objective`" variant="solo" required
                                    hide-details="auto"></v-text-field>
                            </v-col>
                            <v-col cols="2" v-if="index === objectives.length - 1">
                                <v-btn color="success" @click="addObjective">+</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" class="text-center">
                                <v-btn color="success mx-5" @click="submitObjectives" type="submit">
                                    Save Objectives
                                </v-btn>
                                <v-btn class="bg-green mx-5" @click="redirectToCurriculum">Add Curriculum</v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                    <!-- </v-card-text> -->
                </v-sheet>
            </v-card>
        </v-container>
    </v-main>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
// import CourseObjectiveEditDialog from './CourseObjectiveEdit.vue'


export default {
    components: {
        // CourseObjectiveEditDialog
    },

    data() {
        return {
            objectives: [{ text: "" }],
            courseId: null,
            url: '',
            showEditDialog: false,
            editedObjective: '',
            editedObjectiveId: null
        };
    },
    methods: {
        addObjective() {
            this.objectives.push({ text: "" });
            // console.log(this.objectives)
        },

        editObjective(objective) {
            // console.log(objective)
            this.showEditDialog = true;
            this.editedObjectiveId = objective.id;
            this.editedObjective = objective

        },

        async saveEditedObjective() {
            const obj = this.editedObjective
            console.log(obj)
            this.showEditDialog = false;

            const response = await axios.put('/course/objective', obj)
            console.log(response)
        },

        async deleteObjective(objective) {
            console.log(objective)
            const response = await axios.delete(`/course/objective/${objective.id}`)
            console.log(response)
            await this.$store.dispatch('getObjectives', this.courseId)
        },


        async submitObjectives() {
            const data = {
                objectives: this.objectives,
                course_id: this.courseId
            }
            // console.log(data)
            await axios.post('/course/objectives', data)
            await this.$store.dispatch('getObjectives', this.courseId)

            this.objectives=[{text:""}]

        },

        redirectToCurriculum() {
            // console.log(this.url)
            const newUrlSplit = this.url.slice(0, 3)
            const newUrl = newUrlSplit.join("/")

            // console.log(newUrl)
            // console.log(course_id)
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