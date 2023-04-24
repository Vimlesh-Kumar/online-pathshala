import { createStore } from "vuex";
const store = createStore({
    state() {
        return {
            user: null,
            categories: ["Development","Finance","Health","Music","Business","Design","PhotoVedio","Real Estate","Others"]
        }
    },

    mutations: {
        updateUser(state, user) {       //user=payload
            state.user = user;
        }
    },

    actions: {
        user(context,user){
            context.commit('updateUser',user)
        }
    },

    getters: {
        user(state) {
            return state.user;
        },
        category(state){
            return state.categories
        }
    }
})

export default store;