<template>
    <v-container class="mt-7">
        <v-row allign="center" justify="center">
            <v-col cols="12">
                <v-card class="elevation-6 mx-auto mt-10" max-width="450">
                    <v-card-text class="mt-1">
                        <h2>Sign up and start learning</h2>

                        <form class="mt-5" @submit.prevent="userRegister">
                            <error :error="error"></error>
                            <v-text-field v-model="state.name" :error-messages="v$.name.$errors.map(e => e.$message)"
                                :counter="50" label="Name" required @input="v$.name.$touch"
                                @blur="v$.name.$touch"></v-text-field>

                            <v-text-field v-model="state.email" :error-messages="v$.email.$errors.map(e => e.$message)"
                                label="E-mail" required @input="v$.email.$touch" @blur="v$.email.$touch"></v-text-field>

                            <v-text-field v-model="state.password"
                                :error-messages="v$.password.$errors.map(e => e.$message)" type="password" label="Password"
                                required @input="v$.password.$touch" @blur="v$.password.$touch"></v-text-field>


                            <v-select v-model="state.select" :items="['Student', 'Tutor']"
                                :error-messages="v$.select.$errors.map(e => e.$message)" label="Register as" required
                                @change="v$.select.$touch" @blur="v$.select.$touch"></v-select>

                            <v-checkbox v-model="state.checkbox" :error-messages="v$.checkbox.$errors.map(e => e.$message)"
                                label="Do you agree?" required @change="v$.checkbox.$touch"
                                @blur="v$.checkbox.$touch"></v-checkbox>

                            <div class="text-center">
                                <v-btn class="me-4" color="success" type="submit" @click="v$.$validate">
                                    Sign up
                                </v-btn>
                                <v-btn @click="clear" color="red">
                                    clear
                                </v-btn>
                            </div>
                        </form>
                        <div class="text-center mt-6">
                            <h4>Already have an account?<a><router-link to="/user/sign-in">Sign in</router-link></a></h4>
                        </div>
                    </v-card-text>

                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import { reactive, } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { email, required } from '@vuelidate/validators';
import axios from 'axios';
import Error from './../Message&Error/error.vue'

export default {
    components: {
        Error
    },
    data() {
        return {
            error: '',
        }
    },
    setup() {
        const initialState = {
            name: '',
            email: '',
            password: '',
            select: null,
            checkbox: null,
        }

        const state = reactive({
            ...initialState,
        })

        const rules = {
            name: { required },
            email: { required, email },
            password: { required },
            select: { required },
            roles: { required },
            checkbox: { required },
        }

        const v$ = useVuelidate(rules, state)

        function clear() {
            v$.value.$reset()

            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value
            }
        }

        return { state, clear, v$ }
    },

    methods: {
        async userRegister() {
            try {
                const user = {
                    full_name: this.state.name,
                    email: this.state.email,
                    password: this.state.password,
                    user_role: this.state.select
                }
                // console.log(user)
                const response = await axios.post('user/signup', user)
                console.log(response);
                this.$router.push('/user/sign-in');
            } catch (e) {
                this.error = 'Sorry, This email already exists, Please try a different email address to register or login to your account.'
            }
        }
    },
}
</script>