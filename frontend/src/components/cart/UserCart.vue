<template>
    <v-main>
        <v-container>
            <h1 class="mt-2">Shopping Cart</h1>
            <!-- {{ total }} -->
            <!-- <div> -->
            <v-row>
                <v-col cols="8">
                    <v-list lines="three">
                        <h3>{{ coursesInCart.length }} Courses in Cart</h3>
                        <v-divider></v-divider>
                        <v-list-item v-for="(item, index) in coursesInCart" :key="index">
                            <div class="d-flex mb-5">
                                <div class="align-center">
                                    <img :src="item.thumb_url" height="75">

                                </div>
                                <div class="mx-5 me-auto">
                                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ item.author }}</v-list-item-subtitle>
                                    <span>
                                        <span class="text-amber-accent-4 me-2 align-baseline font-weight-bold">
                                            {{ item.rating }}
                                        </span>
                                        <span class=" ">



                                            <v-rating :model-value="item.rating" color="amber" density="compact"
                                                class="align-baseline" half-increments readonly size="small"></v-rating>

                                        </span>
                                    </span>
                                </div>
                                <div>
                                    <div class="d-flex">
                                        <h3 class="ms-auto">₹{{ item.price }}</h3>

                                    </div>
                                    <div class="ms-auto">
                                        <wish-list :course_id="item.course_id" :user="user"
                                            :wishlistCourses="wishlistCourses" :coursesInCart="coursesInCart"></wish-list>
                                        <v-btn icon>
                                            <v-icon @click="removeFromCart(item.course_id)" color="red">mdi-delete</v-icon>
                                        </v-btn>
                                    </div>

                                </div>

                            </div>
                            <v-divider></v-divider>
                        </v-list-item>
                    </v-list>
                </v-col>
                <v-col cols="4" class="ms-">
                    <h3>Total:</h3>
                    <!-- <v-card> -->
                        <!-- <v-card-subtitle>
                            Total:
                        </v-card-subtitle> -->
                        <v-card-title class="font-weight-bold">₹{{ total }}</v-card-title>
                    <!-- </v-card> -->
                </v-col>
            </v-row>
            <!-- </div> -->
        </v-container>
    </v-main>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapState } from 'vuex';
import WishList from '../wishlist/WishList.vue'

export default {
    data() {
        return {
            // cartItems: []
        }
    },

    components: {
        WishList
    },
    created() {
        this.$store.dispatch('fetchingUser');
        this.$store.dispatch('getCartCourses');
        this.$store.dispatch('getWishlistCourses');
    },

    computed: {
        ...mapGetters(['coursesInCart', 'user',]),
        ...mapState(['wishlistCourses']),
        total() {
            console.log(this.coursesInCart)
            var sum = 0;
            for (let course of this.coursesInCart) {
                console.log(course)
                sum = sum + course.price
            }

            console.log(sum)
            return sum;
        }
    },

    methods: {
        /***
         * remove course from cart
         * courseId-Id of course that want to remove
         */
        async removeFromCart(courseId) {
            // console.log(courseId)
            const response = await axios.post('/user/cart-remove', { course_id: courseId })
            console.log(response)
            await this.$store.dispatch('getCartCourses')
        },

    }
}
</script>
