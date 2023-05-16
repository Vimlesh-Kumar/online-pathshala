import axios from "axios";
// import { stat } from "fs/promises";
import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            user: null,
            categories: ["Development", "Finance", "Health", "Music", "Business", "Design", "PhotoVedio", "Real Estate", "Others"],
            // enrollmentDetails: null,
            allCourses: [],
            userCourses: [],
            singleCourseDetails: null,
            courseObjectives: [],
            cartCourses: [],
            wishlistCourses: []
        }
    },

    mutations: {
        updateUser(state, user) {       //user=payload
            state.user = user;
        },

        updateAllCourses(state, allCourses) {
            state.allCourses = allCourses;
        },

        updateUserCourses(state, userCourses) {
            state.userCourses = userCourses;
        },

        updateSingleCourseDetails(state, course) {
            state.singleCourseDetails = course
        },

        updateCourseObjctives(state, objectives) {
            state.courseObjectives = objectives;
        },

        updateCartCourses(state, courses) {
            state.cartCourses = courses
        },

        updateWishlistCourses(state, courses) {
            state.wishlistCourses = courses;
        }
    },

    actions: {
        async fetchingUser(context) {
            const token = localStorage.getItem('token')
            if (token === null) {
                context.commit('updateUser', null)
            }
            else {
                const response = await axios.get(`/user/details`)
                context.commit('updateUser', response.data.user)
            }
        },

        async fetchingAllCourses({ commit }) {
            try {
                const response = await axios.get('/courses')
                commit('updateAllCourses', response.data.courses)
            }
            catch (error) {
                console.log(error);
            }
        },

        async fetchingUserCourses(context) {
            const response = await axios.get(`/user/courses`)
            // console.log(response)
            context.commit('updateUserCourses', response.data.courses)
        },

        async getACourse(context, course) {
            context.commit('updateSingleCourseDetails', course)
        },

        async getObjectives(conetxt, id) {
            const response = await axios.get(`/course/objectives-display/${id}`)
            // console.log(response)
            conetxt.commit('updateCourseObjctives', response.data.objectives)
        },

        async getCartCourses(context) {
            const response = await axios.get('/user/cart');
            context.commit('updateCartCourses', response.data.courses)
        },

        async getWishlistCourses(context) {
            const response = await axios.get('/user/wishlist')
            context.commit('updateWishlistCourses', response.data.courses)
        },

        /***
         * POST REQUEST for adding a course into WISHLIST
         * id-number taking course id of that course
         */
        async addToWishlist(commit, id) {
            await axios.post('/user/wishlist', { course_id: id })
        },

        async removeFromWishlist(context, id) {
            await axios.post('/user/wishlist/remove', { course_id: id })

        }
    },

    getters: {
        user(state) {
            return state.user;
        },

        category(state) {
            return state.categories;
        },

        allCourses(state) {
            return state.allCourses;
        },

        userCourses(state) {
            return state.userCourses;
        },

        singleCourse(state) {
            return state.singleCourseDetails;
        },

        courseObjectives(state) {
            return state.courseObjectives
        },

        coursesInCart(state) {
            return state.cartCourses
        },
    }
})

export default store;