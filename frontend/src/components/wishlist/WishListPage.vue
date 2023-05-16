<template>
    <v-container class="mt-15">
        <v-card-title class="bg-black font-weight-bold">My Wishlist</v-card-title>
        <AllCoursesVue :allCourses="wishlistCourses"></AllCoursesVue>
    </v-container>
</template>

<script>
import AllCoursesVue from '../course/AllCourses.vue'
import { mapGetters, mapState } from 'vuex'

export default {
    components: {
        AllCoursesVue
    },
    computed: {
        ...mapGetters(['user', 'coursesInCart']),
        ...mapState(['wishlistCourses'])
    },

    created() {
        this.$store.dispatch('fetchingUser');
        this.$store.dispatch('getCartCourses');
        this.$store.dispatch('getWishlistCourses');
    },
}
</script>