<template>
    <v-main>
        <v-container>
            <!-- <div class="mx-auto bg-yellow justify-center"> -->
            <!-- <v-row justify="center"> -->
            <v-card class="mx-auto" max-width="700">
                <v-card-title class="text-center">Course Objectives</v-card-title>
                <v-divider></v-divider>
                <v-container>
                    <!-- {{ courseObjectives }} -->
                    <div class="d-flex my-2" v-for="objective in courseObjectives" :key="objective">
                        <div class="me-auto">
                            <p><span class="mdi mdi-arrow-right-bold"></span>
                                {{ objective.objective }}</p>
                        </div>
                        <div class="d-flex justify-end">
                            <v-btn @click="editObjective(objective)">
                                <span class="mdi mdi-pencil-outline"></span>
                            </v-btn>

                            <v-dialog v-model="showEditDialog"  max-width="500">
                                <v-card>
                                    <v-card-title>Edit Objective</v-card-title>
                                    <v-card-text>
                                        <v-form>
                                            <v-text-field v-model="editedObjective"></v-text-field>
                                        </v-form>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn @click="saveEditedObjective">Save</v-btn>
                                        <v-btn @click="showEditDialog = false">Cancel</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                            <!-- <v-btn @click="updateObjective(objective)">Update</v-btn> -->
                            <v-btn class="mx-4" @click="deleteObjective(objective)">Delete</v-btn>
                        </div>

                    </div>

                </v-container>
                <v-card-text>
                    <v-container>
                        <v-row v-for="(objective, index) in objectives" :key="index">
                            <v-col cols="8">
                                <v-text-field v-model="objective.text" :label="`Objective ${index + 1}`" outlined
                                    required></v-text-field>
                            </v-col>
                            <v-col align-self="center" cols="2" class="text-center " v-if="index === objectives.length - 1">
                                <v-btn color="success" @click="addObjective">+</v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" class="text-center">
                                <v-btn color="success" @click="submitObjectives" type="submit">
                                    Save Objectives
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </v-card>
            <!-- </v-row> -->
            <!-- </div> -->
        </v-container>
    </v-main>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex'


export default {

    data() {
        return {
            objectives: [{ text: "" }],
            courseId: null,
            url: '',
            showEditDialog: false,
            editedObjective:'',
            editedObjectiveId:null
        };
    },
    methods: {
        addObjective() {
            this.objectives.push({ text: "" });
            // console.log(this.objectives)
        },

        editObjective(objective) {
            console.log(objective)
            this.showEditDialog=true,
            this.editedObjectiveId=objective.id;
        },

        saveEditedObjective(){
            const obj=this.editedObjective
            console.log(obj)
            this.showEditDialog=false;
        },

        async submitObjectives() {

            // const currentUrl = this.$route.path
            // const url = currentUrl.split("/")
            // this.courseId = url[2];

            const data = {
                objectives: this.objectives,
                course_id: this.courseId
            }
            // console.log(data)
            await axios.post('/course/objectives', data)
            // console.log(response)
            // await this.$store.dispatch('getObjectives', this.courseId)

            console.log(this.url)
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
        // this.url=url
        this.courseId = this.url[2];
    },
    async created() {
        await this.$store.dispatch('fetchingUser')
        await this.$store.dispatch('getObjectives', this.courseId)
    }
}
</script>