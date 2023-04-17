<template>
    <v-sheet class=" pa-12 mt-10" rounded>
        <v-card class="mx-auto px-6 py-8" max-width="344">
            <v-form v-model="form" @submit.prevent="onSubmit">
                <v-text-field v-model="email" :readonly="loading" :rules="[required]" class="mb-2" clearable
                    label="Email"></v-text-field>

                <v-text-field v-model="password" :readonly="loading" :rules="[required]" clearable label="Password"
                    placeholder="Enter your password"></v-text-field>

                <br>

                <v-btn :disabled="!form" :loading="loading" block color="success" size="large" type="submit"
                    variant="elevated">
                    Sign In
                </v-btn>
            </v-form>
            <v-card-text>Don't have an account?<router-link to="/user/sign-up">Sign up</router-link></v-card-text>
        </v-card>
    </v-sheet>
</template>

<script>
import axios from 'axios'

export default {
    data: () => ({
        form: false,
        email: null,
        password: null,
        loading: false,
    }),

    methods: {
        onSubmit() {
            if (!this.form) return

            this.loading = true

            setTimeout(() => (this.loading = false), 2000)

            const loginUser={
                email:this.email,
                password:this.password
            }
            console.log(loginUser)
            axios.post('http://localhost:8000/user/signin',loginUser).then(
                res=>{
                    console.log(res);
                }
            ).catch(
                err=>{
                    console.log(err)
                }
            )
        },
        required(v) {
            return !!v || 'Field is required'
        },
    },
}
</script>