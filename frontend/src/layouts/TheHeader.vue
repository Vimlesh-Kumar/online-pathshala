<template>
    <v-app-bar>
        <!-- <template v-slot:prepend>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template> -->

        <v-img src="../assets/logof.png"></v-img>
        <v-select class="select mx-5" variant="solo" density="compact" label="Category" :items="category" required single-line hide-details></v-select>
        <v-text-field class="mx-14" density="compact" variant="solo" label="Search" append-inner-icon="mdi-magnify" single-line
            hide-details >
        </v-text-field>

        <v-btn v-if="!user || user.user_role === 'Student'" class="mx-5 bg-green-lighten-5">Teach on Pathshala</v-btn>
        <v-btn v-if="user && user.user_role === 'Tutor'" class="mx-5 bg-green-lighten-3" @click="handleAddCourse">Add Course</v-btn>

        <v-icon class="bg-blue">mdi-cart</v-icon>

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
        return {

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
        ...mapGetters(['user', 'category'])
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

.select {
      max-width: 180px;
      /* max-height: 60px; */
      /* font-size: 11px; */
    }
</style>

