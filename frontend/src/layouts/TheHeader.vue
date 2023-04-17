<template>
    <v-app-bar>
        <template v-slot:prepend>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
        </template>

        <v-img src="../assets/logo.png" height="50"></v-img>

        <v-btn >Categories</v-btn>

        <v-text-field density="compact" variant="solo" label="Search" append-inner-icon="mdi-magnify" single-line
            hide-details class="w-50">
        </v-text-field>


        <v-btn flat :style="{ 'text-transform': 'none' }"><router-link to="/user/sign-up" class="white text">Sign up</router-link></v-btn>
        <v-btn flat><router-link to="/user/sign-in">Sign in</router-link></v-btn>
    </v-app-bar>
</template>

<style scoped>
    .v-btn {
  text-transform: none;
}

</style>

