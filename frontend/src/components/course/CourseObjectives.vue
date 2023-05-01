<template>
    <v-main>
        <v-container >
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
                                <v-col align-self="center" cols="2" class="text-center "
                                    v-if="index === objectives.length - 1">
                                    <v-btn color="primary" @click="addObjective">+</v-btn>
                                </v-col>
                            </v-row>
                            <!-- <v-row>
                            <v-col cols="12" class="text-center">
                                <v-btn color="primary" @click="addObjective">
                                    Add Objective
                                </v-btn>
                            </v-col>
                        </v-row> -->
                            <v-row>
                                <v-col cols="12" class="text-center">
                                    <v-btn color="primary" @click="submitObjectives">
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
import { mapGetters } from 'vuex'


export default {

    data() {
        return {
            objectives: [{ text: "" }]
        };
    },
    methods: {
        addObjective() {
            this.objectives.push({ text: "" });
        },
        submitObjectives() {
            // Submit objectives to server, or perform other action as needed
            console.log(this.objectives);
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