<template>
    <v-app-bar>
        <!-- <template v-slot:prepend>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template> -->

        <v-img src="../assets/logof.png" height="50" max-width="80%" class="ms-0"></v-img>

        <v-btn class="mx-3">Categories</v-btn>

        <v-text-field density="compact" variant="solo" label="Search" append-inner-icon="mdi-magnify" single-line
            hide-details class="mx-1">
        </v-text-field>
    
        <v-btn class="mx-3">Teach on Pathshala</v-btn>
        <v-icon>mdi-cart</v-icon>

        <v-btn v-if="user" flat class="bg-green-lighten-3 mx-5" @click="handleLogoutClick">Log out</v-btn>
        <v-btn v-if="!user" flat class="bg-green-lighten-3 mx-5"><router-link to="/user/sign-in">Log in</router-link></v-btn>
        <v-btn v-if="!user" flat class="bg-green-lighten-2"><router-link to="/user/sign-up" class="white text">Sign
                up</router-link></v-btn>
    </v-app-bar>
</template>

<script>
import jwtDecode from 'jwt-decode';
export default {
    data() {
        return {
            user: ''
        }
    },
    mounted() {
        // const token = localStorage.getItem("token")
        this.userDetails();
    },
    methods: {
        userDetails() {
            // const token = localStorage.getItem("token")
            // console.log(token)
            // const decoded=jwtDecode(token);
            // this.user=decoded.user
            // console.log(this.user)
            this.user = this.$store.state.user
            console.log(this.user)
            console.log("sdhfg")
        },
        handleLogoutClick(){
            localStorage.removeItem('token')
            this.$router.push('/')
        }
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

