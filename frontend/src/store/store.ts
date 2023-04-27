import axios from "axios";
import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            user: null,
            categories: ["Development", "Finance", "Health", "Music", "Business", "Design", "PhotoVedio", "Real Estate", "Others"],
            // enrollmentDetails: null,
            allCourses: [],
            userCourses: [],
            singleCourseDetails: null
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
        }
    }
})

export default store;