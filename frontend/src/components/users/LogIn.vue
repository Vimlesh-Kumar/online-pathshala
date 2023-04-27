<template>
    <v-sheet class=" pa-12 mt-15" rounded>
        <v-card class="mx-auto px-6 py-8" max-width="444">
            <v-form v-model="form" @submit.prevent="onSubmit">
                <p class="font-weight-black mb-5">Log in to your Pathshala account</p>
                <!-- Error -->
                <error :error="error"></error>

                <v-text-field v-model="email" :readonly="loading" :rules="[required]" class="mb-2" clearable
                    label="Email"></v-text-field>

                <v-text-field v-model="password" type="password" :readonly="loading" :rules="[required]" clearable label="Password"
                    placeholder="Enter your password"></v-text-field>

                <v-btn :disabled="!form" :loading="loading" class="mb-3" block color="success" size="large" type="submit"
                    variant="elevated">
                    Sign In
                </v-btn>
            </v-form>
            <v-card-text>Don't have an account?<router-link to="/user/sign-up">Sign up</router-link></v-card-text>
        </v-card>
    </v-sheet>
</template>

<script>
import axios from 'axios';
import Error from './../error/error.vue'

export default {
    components: {
        Error
    },
    data: () => ({
        form: false,
        email: null,
        password: null,
        loading: false,
        error: ''
    }),

    methods: {
        async onSubmit() {
            try {
                if (!this.form) return
                this.loading = true
                setTimeout(() => (this.loading = false), 2000)

                const loginUser = {
                    email: this.email,
                    password: this.password
                }
                // Request send to the Backend
                const response = await axios.post('user/signin', loginUser)
                // console.log(response)

                // Saving token in local storage
                localStorage.setItem('token', response.data.token);
                // console.log(response.data.user)

                // this.$store.dispatch('user', response.data.user)

                // redirescting to the homepage
                this.$router.push('/user/home')
            } catch (e) {
                this.error = 'There was a problem logging in. Check your email and password or create an account.'
            }
        },
        required(v) {
            return !!v || 'Field is required'
        },
    },
}
</script>