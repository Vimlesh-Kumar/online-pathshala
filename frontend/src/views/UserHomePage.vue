<template>
    <v-main>
        <!-- <v-container v-if="user === null">
            <v-card class="mx-auto px-6 py-8 text-center" max-width="344">
                <v-card-title>Hello, You are not logged in!</v-card-title>
                <v-card-text>Please login <router-link to="/user/sign-in">Log in</router-link></v-card-text>
            </v-card>
        </v-container> -->
        <!-- <v-container v-if="user && userCourses.length === 0">
            <v-card class="mx-auto px-6 py-8 text-center" max-width="800">
                <v-card-title style="font-size: 30px;">Hello {{ user.full_name }}</v-card-title>
                <v-card-text>{{ user.user_role }}</v-card-text>
                <v-card-subtitle v-if="user.user_role === 'Student'">Let's start learning, {{ user.full_name
                }}</v-card-subtitle>
                <v-card-subtitle v-else-if="user.user_role === 'Tutor'">Please add a course, {{ user.full_name
                }}</v-card-subtitle>

            </v-card>
            <all-courses :allCourses="allCourses"></all-courses>
        </v-container> -->
        <!-- {{userCourses}} -->

        <v-container v-if="user">
            <div class="bg-black" max-height="4">
                <p class="font-weight-bold mx-10" style="font-size:40px; font-family: 'Times New Roman', Times, serif;">My{{
                    user.user_role === 'Student' ? " learnings" : " Courses" }}</p>
            </div>
            <div v-if="userCourses.length !== 0">
                <all-courses :allCourses="userCourses"></all-courses>
            </div>
            <div v-else>
                <v-sheet class="border true">
                    <v-card class="ma-5" height="100">
                        <v-card-title>Oops! It looks like you haven't {{ user.user_role==='Student'? 'enrolled in' : 'added' }} any courses yet.</v-card-title>
                    </v-card>
                </v-sheet>
            </div>
            <div class="mt-10">

                <h1 :style="{ fontFamily: 'Times New Roman' }">Expand your skillset with these courses</h1>
                <all-courses :allCourses="allCourses"></all-courses>
            </div>
        </v-container>
    </v-main>
</template>

<script>
import { mapGetters } from 'vuex';
import AllCourses from '../components/course/AllCourses.vue';

export default {
    data() {
        return {

        }
    },
    components: {
        AllCourses
    },
    computed: {
        ...mapGetters(['user', 'enrollmentDetails', 'allCourses', 'userCourses'])
    },
    async created() {
        // user details
        await this.$store.dispatch('fetchingUser')

        // User's Courses
        await this.$store.dispatch('fetchingUserCourses')

        // All courses reloading
        await this.$store.dispatch('fetchingAllCourses')
        // console.log(this.userCourses)
    },
}
</script>
