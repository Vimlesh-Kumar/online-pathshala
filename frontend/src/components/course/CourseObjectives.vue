<template>
    <v-main>
        <v-container>
            <!-- <div class="mx-auto bg-yellow justify-center"> -->
            <!-- <v-row justify="center"> -->
            <v-card class="mx-auto" max-width="600">
                <v-card-title class="text-center">Course Objectives</v-card-title>
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
            courseId: null
        };
    },
    methods: {
        addObjective() {
            this.objectives.push({ text: "" });
        },

        async submitObjectives() {

            const currentUrl = this.$route.path
            const url = currentUrl.split("/")
            this.courseId = url[2];

            const data = {
                objectives: this.objectives,
                course_id: this.courseId
            }
            // console.log(data)
            await axios.post('/course/objectives', data)
            // console.log(response)

            const newUrlSplit = url.slice(0, 3)
            const newUrl = newUrlSplit.join("/")

            // console.log(newUrl)
            // console.log(course_id)
            this.$router.push(newUrl + '/lesson')
        }
    },


    computed: {
        ...mapGetters(['user'])
    },
    async created() {
        await this.$store.dispatch('fetchingUser')
    }
}
</script>