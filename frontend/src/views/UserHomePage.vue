<template>
    <v-sheet class=" pa-12 mt-15" rounded>
        <v-card v-if="user === null" class="mx-auto px-6 py-8 text-center" max-width="344">
            <v-card-title>Hello, You are not logged in!</v-card-title>
            <v-card-text>Please login <router-link to="/user/sign-in">Log in</router-link></v-card-text>
        </v-card>
        <v-card v-else class="mx-auto px-6 py-8 text-center" max-width="344">
            <v-card-title>Hello {{ user.full_name }}</v-card-title>
            <v-card-text>{{ user.user_role }}</v-card-text>

            <v-card-subtitle v-if="user.user_role === 'Student'">Let's start learning, {{ user.full_name
            }}</v-card-subtitle>
            <v-card-subtitle v-else-if="user.user_role === 'Tutor'">Please add a course, {{ user.full_name
            }}</v-card-subtitle>
        </v-card>
    </v-sheet>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import jwt_decode from 'jwt-decode'

export default {
    data() {
        return {

        }
    },
    computed: {
        ...mapGetters(['user'])
    },
    async created() {
        const token = localStorage.getItem('token');
        const decoded = jwt_decode(token);
        const id = decoded.user.id
        await axios.get(`/user/details/${id}`)
            .then(response => {
                // this.$store.state.user = response.data.user
                this.$store.dispatch('user', response.data.user)
                // console.log(response.data.user);
            })
            .catch(error => {
                let tokenError = error.response.data.token
                if (tokenError === "Invalid") {
                    console.log("InValid Token Please login again")
                }
                console.log(error);
            });
    },
}
// import jwt_decode from 'jwt-decode';
// import axios from 'axios';

// export default {
//     data() {
//         return {
//             user: '',
//             tokenFound: false,
//         }
//     },
//     mounted() {
//         const token = localStorage.getItem('token');
//         if (token) {

//             this.decodeToken(token);
//         }
//         else {
//             console.log("Token not found")
//         }
//         this.userDetails();

//     },

//     methods: {
//         decodeToken(token) {
//             const decoded = jwt_decode(token);
//             // console.log(decoded)
//             if (decoded.user) {
//                 this.user = decoded.user
//             } else {
//                 this.user = ""
//             }
//         },

//         async userDetails() {
//             const token = localStorage.getItem('token');
//             await axios.get(`/user/details/${token}`)
//                 .then(response => {
//                     this.$store.state.user=response.data.user
//                     console.log(response.data.user);
//                 })
//                 .catch(error => {
//                     let tokenError = error.response.data.token
//                     if (tokenError === "Invalid") {
//                         console.log("InValid Token Please login again")
//                     }
//                     console.log(error);
//                 });

//         }
//     }

// }
</script>


<!-- <template>
    <v-sheet class=" pa-12 mt-15" rounded>

        <v-card class="mx-auto px-6 py-10 text-center" max-width="344">
            <v-card-title>Vim</v-card-title>

        </v-card>
    </v-sheet>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {

        }
    },
    mounted(){
        this.aUser();
    },
    methods:{
        aUser(){
            axios.get('/user/details', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(response => {
                    console.log(response.data);
                })
                .catch(error => {
                    console.log(error);
                });

        }
    }
}
</script> -->