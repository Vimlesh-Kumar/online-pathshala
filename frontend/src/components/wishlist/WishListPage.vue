<template>
    <v-container class="mt-15">
        <v-card-title class="bg-black font-weight-bold">My Wishlist</v-card-title>
        <AllCoursesVue :allCourses="allCourses"></AllCoursesVue>
    </v-container>
</template>

<script>
import axios from 'axios'
import AllCoursesVue from '../course/AllCourses.vue'
import { mapGetters } from 'vuex'

export default {
    components: {
        AllCoursesVue
    },
    data() {
        return {
            allCourses: null
        }
    },
    computed: {
        ...mapGetters(['user', 'coursesInCart'])
    },

    async created() {
        await this.$store.dispatch('fetchingUser')
        await this.$store.dispatch('getCartCourses')

        const response = await axios.get('/user/wishlist')
        // console.log(response)
        this.allCourses = response.data.courses



    },
}
</script>