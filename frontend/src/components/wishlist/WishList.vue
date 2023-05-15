<template>
    <v-btn icon class="mx-4">
        <v-icon v-if="showWishlistOutlined" @click="addToWishlist(course_id)" color="red">mdi-heart-outline</v-icon>
        <v-icon v-else @click="removeFromWishlist(course_id)" color="red">mdi-heart</v-icon>
    </v-btn>
    <!-- </v-container> -->
</template>

<script>
import axios from 'axios'
export default {
    data() {
        return {
            showWishlistOutlined:true
        }
    },
    props: ['course_id'],

    methods: {
        /***
         * 
         */
        async addToWishlist(course_id) {
            const response = await axios.post('/user/wishlist', { course_id: course_id })
            console.log(response)
            this.showWishlistOutlined=false
        },

        async removeFromWishlist(course_id) {
            const response=await axios.post('/user/wishlist/remove',{course_id:course_id})
            console.log(response)
            this.showWishlistOutlined=true
        }
    }
}
</script>