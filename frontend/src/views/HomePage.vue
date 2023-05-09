<template>
    <v-main>
        <v-container>
            <v-card max-height="400">
                <v-img cover src="./../assets/homepage2.jpg"></v-img>
            </v-card>
        </v-container>

        <v-container>
            <v-container class="bg-black" max-height="400">
                <v-text class="font-weight-bold mx-1"
                    style="font-size:40px; font-family: 'Times New Roman', Times, serif;">Expand your skillset with these
                    courses
                </v-text>
            </v-container>
            <!-- <h1 :style="{ fontFamily: 'Times New Roman' }">Expand your skillset with these courses</h1> -->
            <all-courses :allCourses="allCourses"></all-courses>
        </v-container>
        <v-container>

        </v-container>
    </v-main>
</template>

<script>
import { mapGetters } from 'vuex'
import AllCourses from '../components/course/AllCourses.vue'

export default {
    components: {
        AllCourses
    },
    data() {
        return {

        }
    },
    computed: {
        ...mapGetters(['allCourses'])
    },
    created() {
        this.$store.dispatch('fetchingAllCourses');
        this.$store.dispatch('fetchingUser')
    }
}
</script>