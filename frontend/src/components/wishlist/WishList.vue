<template>
    <v-btn icon class="mx-4">
        <v-icon v-if="!wishlistCoursesId.includes(course_id)" @click="addToWishlist(course_id)"
            color="red">mdi-heart-outline</v-icon>
        <v-icon v-else @click="removeFromWishlist(course_id)" color="red">mdi-heart</v-icon>
    </v-btn>
</template>

<script>
import { mapState } from 'vuex'
export default {

    props: ['course_id', 'user',],

    computed: {
        ...mapState(['wishlistCourses']),

        wishlistCoursesId() {
            if (this.wishlistCourses) {
                return this.wishlistCourses.map((w) => w.id)
            }
            return []
        }
    },

    methods: {

        /***
         * Handle Add to wihslist button
         * taking course id as a parameter
         */
        async addToWishlist(course_id) {
            if (this.user) {
                if (!this.wishlistCoursesId.includes(course_id)) {
                    await this.$store.dispatch('addToWishlist', course_id)
                    await this.$store.dispatch('getWishlistCourses')
                }
                else
                    this.showWishlistOutlined = false
            }
            else {
                this.$router.push('/user/sign-in')
            }
        },

        /***
         * Handle remove course from wishlist icon & 
         * taking course_id(Number) as a parameter
         */
        async removeFromWishlist(course_id) {
            await this.$store.dispatch('removeFromWishlist', course_id)
            await this.$store.dispatch('getWishlistCourses')
        }
    }
}
</script>