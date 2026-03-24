import axios from "axios";
// import { stat } from "fs/promises";
import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            user: null,
            categories: ["Development", "Finance", "Health", "Music", "Business", "Design", "PhotoVedio", "Real Estate", "Others"],
            allCourses: [],
            userCourses: [],
            singleCourseDetails: null,
            courseObjectives: [],
            cartCourses: [],
            wishlistCourses: [],
            searchQuery: '',
            selectedCategory: ''
        }
    },

    mutations: {
        updateUser(state, user) {
            state.user = user;
        },
        updateAllCourses(state, allCourses) {
            state.allCourses = allCourses;
        },
        updateSearchQuery(state, query) {
            state.searchQuery = query;
        },
        updateSelectedCategory(state, category) {
            state.selectedCategory = category;
        },
        // ... rest of mutations
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
        setSearchQuery({ commit }, query) {
            commit('updateSearchQuery', query);
        },
        setSelectedCategory({ commit }, category) {
            commit('updateSelectedCategory', category);
        },
        // ... rest of actions
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
        // ... rest
        async fetchingUserCourses(context) {
            const response = await axios.get(`/user/courses`)
            context.commit('updateUserCourses', response.data.courses)
        },
        async getACourse(context, course) {
            context.commit('updateSingleCourseDetails', course)
        },
        async getObjectives(conetxt, id) {
            const response = await axios.get(`/course/objectives-display/${id}`)
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
        async addToWishlist(commit, id) {
            await axios.post('/user/wishlist', { course_id: id })
        },
        async removeFromWishlist(context, id) {
            await axios.post('/user/wishlist/remove', { course_id: id })
        }
    },

    getters: {
        user(state: any) { return state.user; },
        category(state: any) { return state.categories; },
        searchQuery(state: any) { return state.searchQuery; },
        selectedCategory(state: any) { return state.selectedCategory; },
        allCourses(state: any) {
            let courses = state.allCourses;
            if (state.selectedCategory) {
                courses = courses.filter((c: any) => c.category === state.selectedCategory);
            }
            if (state.searchQuery) {
                const q = state.searchQuery.toLowerCase();
                courses = courses.filter((c: any) => 
                    c.title.toLowerCase().includes(q) || 
                    c.author.toLowerCase().includes(q)
                );
            }
            return courses;
        },
        userCourses(state: any) { return state.userCourses; },
        singleCourse(state: any) { return state.singleCourseDetails; },
        courseObjectives(state: any) { return state.courseObjectives },
        coursesInCart(state: any) { return state.cartCourses },
    }
})

export default store;