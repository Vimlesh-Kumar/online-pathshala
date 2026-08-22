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
            notifications: [],
            unreadNotifications: 0,
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
        },
        updateNotifications(state, { items, unreadCount }) {
            state.notifications = items;
            state.unreadNotifications = unreadCount;
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
            try {
                const response = await axios.get(`/user/details`)
                context.commit('updateUser', response.data.data)
            }
            catch (error) {
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
        async getACourse(context, course) {
            context.commit('updateSingleCourseDetails', course)
        },
        async getObjectives(context, id) {
            const response = await axios.get(`/course/objectives-display/${id}`)
            context.commit('updateCourseObjctives', response.data.data || [])
        },
        async fetchingUserCourses(context) {
            try {
                const response = await axios.get(`/user/courses`)
                context.commit('updateUserCourses', response.data.data || [])
            } catch (error) {
                context.commit('updateUserCourses', [])
            }
        },
        async getCartCourses(context) {
            try {
                const response = await axios.get('/user/cart');
                context.commit('updateCartCourses', response.data.data?.courses || [])
                context.commit('updateCartSummary', response.data.data?.summary || { itemCount: 0, totalAmount: 0 })
            } catch (error) {
                context.commit('updateCartCourses', [])
                context.commit('updateCartSummary', { itemCount: 0, totalAmount: 0 })
            }
        },
        async getWishlistCourses(context) {
            try {
                const response = await axios.get('/user/wishlist')
                context.commit('updateWishlistCourses', response.data.data || [])
            } catch (error) {
                context.commit('updateWishlistCourses', [])
            }
        },
        async addToWishlist(_context, id) {
            await axios.post('/user/wishlist', { course_id: id })
        },
        async removeFromWishlist(_context, id) {
            await axios.post('/user/wishlist/remove', { course_id: id })
        },
        // ── Learning experience ──
        async enrollInCourse(_context, courseId) {
            const response = await axios.post('/user/course/enroll', { course_id: courseId })
            return response.data.data
        },
        async fetchCourseLessons(_context, courseId) {
            const response = await axios.get(`/course/${courseId}/lessons`)
            return response.data.data || []
        },
        async fetchCourseProgress(_context, courseId) {
            const response = await axios.get(`/user/course/${courseId}/progress`)
            return response.data.data
        },
        async markLessonComplete(_context, { courseId, lessonId }) {
            const response = await axios.post('/user/course/progress', { course_id: courseId, lesson_id: lessonId })
            return response.data.data
        },
        async issueCertificate(_context, { courseId, certificateKey }) {
            const response = await axios.post(`/user/course/${courseId}/certificate`, { certificateKey })
            return response.data.data
        },
        // ── Lesson notes ──
        async fetchCourseNotes(_context, courseId) {
            const response = await axios.get(`/user/notes/course/${courseId}`)
            return response.data.data || []
        },
        async fetchAllNotes(_context) {
            const response = await axios.get('/user/notes')
            return response.data.data || { courses: [], totalNotes: 0 }
        },
        async createNote(_context, { courseId, lessonId, timestampSeconds, content }) {
            const response = await axios.post('/user/notes', {
                course_id: courseId,
                lesson_id: lessonId,
                timestamp_seconds: timestampSeconds,
                content
            })
            return response.data.data
        },
        async updateNote(_context, { noteId, content }) {
            const response = await axios.patch(`/user/notes/${noteId}`, { content })
            return response.data.data
        },
        async deleteNote(_context, noteId) {
            await axios.delete(`/user/notes/${noteId}`)
        },
        // ── Resume playback ──
        async fetchPlaybackPositions(_context, courseId) {
            const response = await axios.get(`/user/course/${courseId}/playback`)
            return response.data.data || {}
        },
        async savePlaybackPosition(_context, { courseId, lessonId, positionSeconds }) {
            await axios.post('/user/course/playback', {
                course_id: courseId,
                lesson_id: lessonId,
                position_seconds: positionSeconds
            })
        },
        // ── Momentum: streaks, XP, badges ──
        async fetchMomentum(_context) {
            const response = await axios.get('/user/momentum')
            return response.data.data
        },
        // ── Profile link previews ──
        async fetchLinkPreviews(_context, urls: string[]) {
            const response = await axios.post('/user/links/preview', { urls })
            return response.data.data?.previews || []
        },
        // ── Flashcards: spaced repetition ──
        async fetchFlashcardDecks(_context) {
            const response = await axios.get('/user/flashcards')
            return response.data.data || { summary: { total: 0, due: 0, mastered: 0 }, decks: [] }
        },
        async generateFlashcardDeck(_context, courseId) {
            const response = await axios.post('/user/flashcards/generate', { course_id: courseId })
            return response.data.data
        },
        async fetchDueFlashcards(_context, courseId) {
            const response = await axios.get('/user/flashcards/due', {
                params: courseId ? { course_id: courseId } : {}
            })
            return response.data.data || { cards: [], summary: { total: 0, due: 0, mastered: 0 } }
        },
        async reviewFlashcard(_context, { cardId, rating }) {
            const response = await axios.post(`/user/flashcards/${cardId}/review`, { rating })
            return response.data.data
        },
        async createFlashcard(_context, { courseId, lessonId, front, back }) {
            const response = await axios.post('/user/flashcards', {
                course_id: courseId,
                lesson_id: lessonId,
                front,
                back
            })
            return response.data.data
        },
        async deleteFlashcard(_context, cardId) {
            await axios.delete(`/user/flashcards/${cardId}`)
        },
        // ── AI practice quizzes ──
        async fetchPracticeRound(_context, { courseId, lessonId = null, refresh = false }) {
            const response = await axios.get(`/course/${courseId}/practice`, {
                params: { ...(lessonId ? { lesson_id: lessonId } : {}), ...(refresh ? { refresh: 'true' } : {}) }
            })
            return response.data.data
        },
        async submitPracticeRound(_context, { courseId, lessonId = null, answers }) {
            const response = await axios.post(`/course/${courseId}/practice/submit`, {
                lesson_id: lessonId,
                answers
            })
            return response.data.data
        },
        async fetchPracticeHistory(_context, courseId) {
            const response = await axios.get(`/course/${courseId}/practice/history`)
            return response.data.data || { stats: {}, attempts: [] }
        },
        // ── Study goals & weekly planner ──
        async fetchStudyPlan(_context) {
            const response = await axios.get('/user/goals')
            return response.data.data
        },
        async saveStudyGoal(_context, { weeklyLessons, weeklyDays, planDays, remindersOn }) {
            const response = await axios.put('/user/goals', {
                weekly_lessons: weeklyLessons,
                weekly_days: weeklyDays,
                plan_days: planDays,
                reminders_on: remindersOn
            })
            return response.data.data
        },
        // ── Leaderboard & peer challenges ──
        async fetchLeaderboard(_context) {
            const response = await axios.get('/user/social/leaderboard')
            return response.data.data
        },
        async saveLeaderboardPrefs(_context, { optIn, alias }) {
            const response = await axios.put('/user/social/leaderboard/prefs', { opt_in: optIn, alias })
            return response.data.data
        },
        async fetchChallenges(_context) {
            const response = await axios.get('/user/social/challenges')
            return response.data.data || { challenges: [] }
        },
        async createChallenge(_context, { email, metric, days }) {
            const response = await axios.post('/user/social/challenges', { email, metric, days })
            return response.data.data
        },
        async respondToChallenge(_context, { challengeId, accept }) {
            const response = await axios.post(`/user/social/challenges/${challengeId}/respond`, { accept })
            return response.data.data
        },
        // ── Notifications ──
        async fetchNotifications({ commit }) {
            try {
                const response = await axios.get('/user/notifications')
                const data = response.data.data || { items: [], unreadCount: 0 }
                commit('updateNotifications', data)
                return data
            } catch (error) {
                commit('updateNotifications', { items: [], unreadCount: 0 })
                return { items: [], unreadCount: 0 }
            }
        },
        async markNotificationRead({ dispatch }, id) {
            await axios.post('/user/notifications/read', { id })
            return dispatch('fetchNotifications')
        },
        async markAllNotificationsRead({ dispatch }) {
            await axios.post('/user/notifications/read', { all: true })
            return dispatch('fetchNotifications')
        },
        // ── Course announcements ──
        async fetchAnnouncements(_context, courseId) {
            const response = await axios.get(`/course/${courseId}/announcements`)
            return response.data.data || []
        },
        async fetchMyAnnouncements(_context) {
            const response = await axios.get('/user/tutor/announcements')
            return response.data.data || []
        },
        async postAnnouncement(_context, { courseId, title, content }) {
            const response = await axios.post(`/course/${courseId}/announcements`, { title, content })
            return response.data.data
        },
        async deleteAnnouncement(_context, announcementId) {
            await axios.delete(`/announcements/${announcementId}`)
        },
        // ── Certificate verification (public) ──
        async verifyCertificate(_context, key) {
            const response = await axios.get(`/certificates/verify/${encodeURIComponent(key)}`)
            return response.data.data
        },
        // ── Commerce ──
        async validateCoupon(_context, code) {
            const response = await axios.post('/user/coupon/validate', { code })
            return response.data.data
        },
        async checkout(_context, coupon) {
            const response = await axios.post('/user/checkout', { coupon })
            return response.data.data
        },
        async fetchOrders(_context) {
            const response = await axios.get('/user/orders')
            return response.data.data || []
        },
        // ── Engagement ──
        async fetchReviews(_context, courseId) {
            const response = await axios.get(`/course/${courseId}/reviews`)
            return response.data.data
        },
        async postReview(_context, { courseId, rating, content }) {
            await axios.post(`/course/${courseId}/reviews`, { rating, content })
        },
        async fetchQna(_context, courseId) {
            const response = await axios.get(`/course/${courseId}/qna`)
            return response.data.data || []
        },
        async postQuestion(_context, { courseId, content }) {
            await axios.post(`/course/${courseId}/questions`, { content })
        },
        async postAnswer(_context, { questionId, content }) {
            await axios.post(`/questions/${questionId}/answers`, { content })
        },
        async fetchQuiz(_context, courseId) {
            const response = await axios.get(`/course/${courseId}/quiz`)
            return response.data.data || []
        },
        async submitQuiz(_context, { courseId, answers }) {
            const response = await axios.post(`/course/${courseId}/quiz/submit`, { answers })
            return response.data.data
        },
        async fetchTutorStats(_context) {
            const response = await axios.get('/user/tutor/stats')
            return response.data.data
        },
        // ── AI support (free, rule-based) ──
        async askSupport(_context, message) {
            const response = await axios.post('/support/ask', { message })
            return response.data.data
        },
        async askAboutCourse(_context, { courseId, question }) {
            const response = await axios.post(`/course/${courseId}/ask`, { question })
            return response.data.data
        },
        async suggestCourseCopy(_context, { title, category }) {
            const response = await axios.post('/user/tutor/suggest-copy', { title, category })
            return response.data.data
        },
        async fetchRecommendations(_context) {
            const response = await axios.get('/user/recommendations')
            return response.data.data
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
        cartItemCount(state: any) { return state.cartSummary?.itemCount || state.cartCourses.length || 0 },
        notifications(state: any) { return state.notifications },
        unreadNotifications(state: any) { return state.unreadNotifications }
    }
})

export default store;
