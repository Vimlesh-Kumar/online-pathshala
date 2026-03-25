import axios from "axios";
import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            user: null,
            categories: ["Development", "Finance", "Health", "Music", "Business", "Design", "PhotoVideo", "Real Estate", "Office"],
            allCourses: [],
            userCourses: [],
            singleCourseDetails: null,
            courseObjectives: [],
            cartCourses: [],
            cartSummary: { itemCount: 0, totalAmount: 0 },
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
        updateCartSummary(state, summary) {
            state.cartSummary = summary;
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
        async fetchingUser(context) {
            const token = localStorage.getItem('token')
            if (!token) {
                context.commit('updateUser', null)
                return
            }

            try {
                const response = await axios.get(`/user/details`)
                context.commit('updateUser', response.data.data)
            }
            catch (error) {
                console.log(error);
                context.commit('updateUser', null)
            }
        },
        async fetchingAllCourses({ commit }) {
            try {
                const response = await axios.get('/courses')
                commit('updateAllCourses', response.data.data || [])
            }
            catch (error) {
                console.log(error);
                commit('updateAllCourses', [])
            }
        },
        async fetchingFeaturedCourses({ commit }) {
            try {
                const response = await axios.get('/courses/featured')
                commit('updateAllCourses', response.data.data || [])
            } catch (error) {
                console.log(error);
                commit('updateAllCourses', [])
            }
        },
        async fetchingUserCourses(context) {
            try {
                const response = await axios.get(`/user/courses`)
                context.commit('updateUserCourses', response.data.data || [])
            } catch (error) {
                console.log(error);
                context.commit('updateUserCourses', [])
            }
        },
        async getACourse(context, course) {
            context.commit('updateSingleCourseDetails', course)
        },
        async getObjectives(context, id) {
            const response = await axios.get(`/course/objectives-display/${id}`)
            context.commit('updateCourseObjctives', response.data.data || [])
        },
        async getCartCourses(context) {
            try {
                const response = await axios.get('/user/cart');
                context.commit('updateCartCourses', response.data.data?.courses || [])
                context.commit('updateCartSummary', response.data.data?.summary || { itemCount: 0, totalAmount: 0 })
            } catch (error) {
                console.log(error);
                context.commit('updateCartCourses', [])
                context.commit('updateCartSummary', { itemCount: 0, totalAmount: 0 })
            }
        },
        async getWishlistCourses(context) {
            try {
                const response = await axios.get('/user/wishlist')
                context.commit('updateWishlistCourses', response.data.data || [])
            } catch (error) {
                console.log(error);
                context.commit('updateWishlistCourses', [])
            }
        },
        async addToWishlist(_context, id) {
            await axios.post('/user/wishlist', { course_id: id })
        },
        async removeFromWishlist(_context, id) {
            await axios.post('/user/wishlist/remove', { course_id: id })
        }
    },

    getters: {
        user(state: any) { return state.user; },
        category(state: any) { return state.categories; },
        searchQuery(state: any) { return state.searchQuery; },
        selectedCategory(state: any) { return state.selectedCategory; },
        allCourses(state: any) {
            return state.allCourses;
        },
        userCourses(state: any) { return state.userCourses; },
        singleCourse(state: any) { return state.singleCourseDetails; },
        courseObjectives(state: any) { return state.courseObjectives },
        coursesInCart(state: any) { return state.cartCourses },
        cartSummary(state: any) { return state.cartSummary },
        cartItemCount(state: any) { return state.cartSummary?.itemCount || state.cartCourses.length || 0 }
    }
})

export default store;
