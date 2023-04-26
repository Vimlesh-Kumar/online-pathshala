import axios from "axios";
import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            user: null,
            categories: ["Development", "Finance", "Health", "Music", "Business", "Design", "PhotoVedio", "Real Estate", "Others"],
            enrollmentDetails: null,
            allCourses: [],
            userCourses: []
        }
    },

    mutations: {
        updateUser(state, user) {       //user=payload
            state.user = user;
        },
        updateEnrolling(state, enrollmentDetails) {
            state.enrollmentDetails = enrollmentDetails;
        },
        updateAllCourses(state, allCourses) {
            state.allCourses = allCourses;
        },
        updateUserCourses(state, userCourses) {
            state.userCourses = userCourses;
        }
    },

    actions: {
        async user(context, id) {

            if (id === null) {
                context.commit('updateUser', null)
            }
            else {
                const response = await axios.get(`/user/details/${id}`)
                context.commit('updateUser', response.data.user)
            }
        },

        enrollmentDetails(context, enrollmentDetails) {
            context.commit('updateEnrolling', enrollmentDetails)
        },

        async allCourses({ commit }) {
            try {
                const response = await axios.get('/courses')
                commit('updateAllCourses', response.data.courses)
            }
            catch (error) {
                console.log(error);
            }
        },

        async userCourses(context, id) {
            const response = await axios.get(`/user/courses/${id}`)
            context.commit('updateUserCourses', response.data.courses)
        }
    },

    getters: {
        user(state) {
            return state.user;
        },

        category(state) {
            return state.categories;
        },

        enrollmentDetails(state) {
            return state.enrollmentDetails;
        },

        allCourses(state) {
            return state.allCourses;
        },

        userCourses(state) {
            return state.userCourses;
        }
    }
})

export default store;