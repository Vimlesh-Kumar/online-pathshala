<template>
    <v-main>
        <div class="bg-black">
            <v-container>
                <v-row>
                    <v-col cols="8">
                        <div>
                            <p style="font-size: 15px;">{{ singleCourse.category }} > {{
                                singleCourse.title }}
                            </p>
                        </div>
                        <div class="my-1">
                            <p class="font-weight-bold"
                                style="font-size:45px; font-family: 'Times New Roman', Times, serif;">{{
                                    singleCourse.title }}
                            </p>
                        </div>
                        <div>
                            <p>
                                {{ singleCourse.subtitle }}
                            </p>
                        </div>
                        <div class="d-flex">
                            <v-rating :model-value="singleCourse.rating" color="amber" density="compact" half-increments
                                readonly size="small"></v-rating>

                            <div class="text-amber ms-5">
                                {{ singleCourse.rating }}
                            </div>
                        </div>
                        <div>
                            <p style="font-size: 14px;">Created by {{ singleCourse.author }}</p>
                        </div>
                    </v-col>


                    <v-col cols="4" style="position: fixed; top: 70px; right: 85px; z-index: 1000;">
                        <div>
                            <v-sheet class="ms-15 pa-8 border true">

                                <v-card>
                                    <v-snackbar v-model="showMessage" :timeout="2000" color="pink" class=" justify-end"
                                        min-width="100px">{{ message
                                        }}</v-snackbar>
                                    <!-- <messageDisplay :message="message" v-if="showMessage" class="mb-3"></messageDisplay> -->



                                    <v-img cover :src="singleCourse.thumb_url"></v-img>

                                    <v-card-title class="font-weight-bold">₹{{ singleCourse.price }}</v-card-title>

                                    <v-row v-if="user?.user_role === 'Tutor' && user.id === courseAuthor?.id"
                                        :class="'text-center'">
                                        <v-col>
                                            <v-btn class="bg-green-darken-4" @click="handleAddCourseLesson">Add Course
                                                Content</v-btn>
                                        </v-col>
                                    </v-row>
                                    <v-row v-else>
                                        <div class="d-flex mx-5 my-1 justify-sm-space-between align-center">
                                            <v-btn v-if="!cartCourses.includes(singleCourse.id)" width="140"
                                                class="bg-green-lighten-3 align-center" block
                                                @click="addToCart(singleCourse.id)">Add to
                                                Cart</v-btn>

                                            <v-btn v-else width="140" class="bg-green" block><router-link to="/user/cart"
                                                    style="text-decoration: none;">Go to
                                                    Cart</router-link></v-btn>

                                            <!-- Add to Wishlist -->
                                            <wish-list :course_id="singleCourse.id" :user="user"></wish-list>
                                        </div>
                                    </v-row>
                                    <v-card-text>
                                        <h2>This course includes:</h2>
                                        <v-divider class="my-2"></v-divider>
                                        <div><span class="mdi mdi-video-outline"></span> Full lifetime access</div>
                                        <div><span class="mdi mdi-trophy"></span> Certificate of completion</div>
                                        <div><span class="mdi mdi-cash"></span> 30-Day Money-Back Guarantee</div>
                                    </v-card-text>
                                </v-card>
                            </v-sheet>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <div>
            <v-container class="my-5">
                <v-row>
                    <v-col cols="8">
                        <v-sheet class="border true px-15">
                            <v-container>
                                <h2>What You'll Learn</h2>
                                <v-divider class="my-3"></v-divider>
                                <p v-for="objective in courseObjectives" :key="objective"><span
                                        class="mdi mdi-arrow-right-bold"></span> {{ objective.objective }}</p>
                            </v-container>
                        </v-sheet>

                        <v-sheet class="border true px-15 my-10">
                            <v-container>
                                <h2>Course Content</h2>
                            </v-container>
                        </v-sheet>
                        <v-sheet class="border true px-15 my-10">
                            <v-container>
                                <h2>Student Reviews</h2>
                                <v-row>
                                    <v-rating length="1" color="amber" :model-value="1"></v-rating>
                                    <div class="pt-2 text-amber font-weight-bold" style="font-size: 1.5rem;">
                                        {{ singleCourse.rating }}
                                    </div>
                                </v-row>

                            </v-container>
                        </v-sheet>

                    </v-col>
                </v-row>
            </v-container>
        </div>
    </v-main>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex';
// import messageDisplay from '../Message&Error/messageDisplay.vue';
import WishList from '../wishlist/WishList.vue';

export default {
    components: {
        // messageDisplay,
        WishList
    },
    computed: {
        ...mapGetters(['user', 'courseObjectives', 'coursesInCart']),
        cartCourses() {
            if (this.coursesInCart) {
                return this.coursesInCart.map((c) => c.course_id)
            }
            return []
        }
    },
    data() {
        return {
            singleCourse: '',
            courseAuthor: null,
            courseId: null,
            // error: '',
            message: '',
            showMessage: false,
            updatedCousesInCart: this.coursesInCart
        }
    },
    async created() {
        this.courseId = this.$route.params.id

        const response = await axios.get(`/course/${this.courseId}`)
        // console.log(response.data.tutorId.id)
        const course = response.data.course
        // console.log(course)
        this.singleCourse = course


        const tutorId = response.data.tutorId
        this.courseAuthor = tutorId



        this.$store.dispatch('getObjectives', this.courseId);
        this.$store.dispatch('fetchingUser');
        this.$store.dispatch('getCartCourses');
        this.$store.dispatch('getWishlistCourses');
    },
    methods: {
        handleAddCourseLesson() {
            // console.log(this.)
            const currentUrl = this.$route.path
            console.log(currentUrl)
            this.$router.push(currentUrl + "/objectives")
            // this.$router.push(`/course/${this.courseId}/objectives`)
        },

        async addToCart(id) {
            if (this.user) {
                if (!this.cartCourses.includes(id)) {
                    await axios.post('/user/cart', { course_id: id })
                    this.message = "Course added to cart!"
                    await this.$store.dispatch('getCartCourses')
                    this.showMessage = true
                }
            } else {
                this.$router.push('/user/sign-in')
            }
        },
    }
}
</script>

<style scoped>
::v-deep .v-snackbar__wrapper {
    bottom: unset !important;
    left: unset !important;
    transform: unset !important;
    top: inherit;
    margin-top: 58px;
}
</style>
