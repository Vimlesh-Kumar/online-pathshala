<template>
    <v-flex style="position:sticky; z-index: 100;">
        <v-app-bar>
            <template v-slot:prepend v-if="cols = '8'">
                <v-app-bar-nav-icon></v-app-bar-nav-icon>
            </template>
            <v-btn height="180" width="300"><router-link to="/"><v-img src="../assets/logof.png"
                        width="300"></v-img></router-link></v-btn>

            <v-select v-if="select" v-model="selectValue" class="select mx-5 no-color" variant="solo" density="compact" label="Category"
                :items="category" required single-line hide-details></v-select>

            <v-text-field class="mx-14" density="compact" variant="solo" label="Search" append-inner-icon="mdi-magnify"
                single-line hide-details>
            </v-text-field>

            <!-- <v-btn v-if="!user || user.user_role === 'Student'" class="mx-5 bg-green-lighten-5">Teach on Pathshala</v-btn> -->
            <v-btn v-if="user && user.user_role === 'Tutor'" class="mx-5 bg-green-lighten-3" @click="handleAddCourse">Add
                Course</v-btn>

            <div v-if="user" class="d-flex">
                <v-btn icon><router-link to="/user/cart"><v-icon class="text-green"
                            size="large">mdi-cart</v-icon></router-link>

                </v-btn>
                <v-btn icon><router-link to="/user/wishlist">

                        <v-icon class="text-red">mdi-heart</v-icon>
                    </router-link>
                </v-btn>

            </div>

            <v-btn v-if="user" flat class="bg-green-lighten-3 mx-5" @click="handleLogoutClick">Log out</v-btn>
            <v-btn v-if="!user" flat class="bg-green-lighten-3 mx-5"><router-link to="/user/sign-in">Log
                    in</router-link></v-btn>
            <v-btn v-if="!user" flat class="bg-green-lighten-2"><router-link to="/user/sign-up" class="white text">Sign
                    up</router-link></v-btn>
            <!-- {{ select }} -->
        </v-app-bar>
    </v-flex>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
    data() {
        return {
            selectValue: '',
        }
    },

    methods: {
        async handleLogoutClick() {
            localStorage.removeItem('token')
            this.$store.dispatch('fetchingUser')
            this.$router.push('/')
        },
        handleAddCourse() {
            if (this.user.user_role === 'Tutor') {
                this.$router.push('/user/tutor/add-course')
            }
        },

        async handleCategorySelect(select) {
            const response=await axios.get(`/courses/category/${select}`);
            this.$router.push(`/courses/category`)
            console.log(response)
        }

    },
    computed: {
        ...mapGetters(['user', 'category']),
        select() {
            this.handleCategorySelect(this.selectValue)
            return true;
        }
    },
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

::v-deep .v-img__img {
    position: relative;
}
</style>

