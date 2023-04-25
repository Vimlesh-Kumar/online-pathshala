import { createStore } from "vuex";
const store = createStore({
    state() {
        return {
            user: null,
            categories: ["Development", "Finance", "Health", "Music", "Business", "Design", "PhotoVedio", "Real Estate", "Others"],
            enrollmentDetails: null,
            allCourses: null
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
        }
    },

    actions: {
        user(context, user) {
            context.commit('updateUser', user)
        },
        enrollmentDetails(context, enrollmentDetails) {
            context.commit('updateEnrolling', enrollmentDetails)
        },
        allCourses(context, allCourses) {
            context.commit('updateAllCourses', allCourses)
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
        }   
    }
})

export default store;