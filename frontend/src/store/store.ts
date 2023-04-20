import { createStore } from "vuex";
const store = createStore({
    state() {
        return {
            user: null
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
        }
    }
})

export default store;