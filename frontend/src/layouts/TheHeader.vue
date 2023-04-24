<template>
    <v-app-bar>
        <!-- <template v-slot:prepend>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template> -->

        <v-img src="../assets/logof.png"></v-img>
            <v-select variant="solo"  density="compact" label="Category" :items="category" required single-line
                hide-details></v-select>
        <v-text-field density="compact" variant="solo" label="Search" append-inner-icon="mdi-magnify" single-line
            hide-details class="mx-1">
        </v-text-field>

        <v-btn v-if="!user || user.user_role === 'Student'" class="mx-3">Teach on Pathshala</v-btn>
        <v-btn v-if="user && user.user_role === 'Tutor'" class="mx-3 px-5 py-1" @click="handleAddCourse">Add course</v-btn>
        <v-icon>mdi-cart</v-icon>

        <v-btn v-if="user" flat class="bg-green-lighten-3 mx-5" @click="handleLogoutClick">Log out</v-btn>
        <v-btn v-if="!user" flat class="bg-green-lighten-3 mx-5"><router-link to="/user/sign-in">Log
                in</router-link></v-btn>
        <v-btn v-if="!user" flat class="bg-green-lighten-2"><router-link to="/user/sign-up" class="white text">Sign
                up</router-link></v-btn>

    </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    data() {
        return{

        }
    },

    methods: {
        handleLogoutClick() {
            localStorage.removeItem('token')
            this.$store.dispatch('user', null)
            this.$router.push('/')
        },
        handleAddCourse() {
            if (this.user.user_role === 'Tutor') {
                this.$router.push('/user/tutor/add-course')
            }
        }
    },
    computed: {
        ...mapGetters(['user','category'])
    }
}
</script>

<style scoped>
.v-btn {
    text-transform: none;
}

.v-btn a {
    text-decoration: none;
}
</style>

