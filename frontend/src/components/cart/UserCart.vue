<template>
    <v-main>
        <v-container>
            <h1 class="mt-2">Shopping Cart</h1>

            <div>
                <v-row>
                    <v-col cols="8">
                        <v-list lines="three">
                            <h3>{{ coursesInCart.length }} Courses in Cart</h3>
                            <v-divider></v-divider>
                            <v-list-item v-for="(item, index) in coursesInCart" :key="index">
                                <div class="d-flex mb-5">
                                    <div>
                                        <img :src="item.thumb_url" height="75">

                                    </div>
                                    <div class="mx-5 me-auto">
                                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ item.author }}</v-list-item-subtitle>
                                    </div>
                                    <div class="">
                                        <!-- <v-list-item-action> -->
                                        <div class="ms-auto">
                                            <h3 class="ms-auto">₹ {{ item.price }}</h3>

                                        </div>
                                        <!-- <v-btn @click="removeFromCart(item)" color="text-red" height="20" width="20">Remove</v-btn> -->
                                        <div class="ms-auto">
                                            <v-btn icon class="mx-4">
                                                <v-icon @click="addToWishlist(item)" color="red">mdi-heart-outline</v-icon>
                                            </v-btn>
                                            <v-btn icon>
                                                <v-icon @click="removeFromCart(item)" color="red">mdi-delete</v-icon>
                                            </v-btn>
                                        </div>




                                        <!-- </v-list-item-action> -->
                                    </div>

                                </div>
                                <v-divider></v-divider>
                            </v-list-item>
                        </v-list>
                    </v-col>
                    <v-col cols="4" class="ms-">
                        <h3>Total</h3>
                    </v-col>
                </v-row>
            </div>
        </v-container>
        <!-- <template>
                <v-container>
                    <v-card>
                        <v-card-title>
                            My Cart ({{ coursesInCart }})
                        </v-card-title>
                        <v-card-text>
                            <v-list>
                                <v-list-item v-for="(item, index) in cartItems" :key="index">
                                    <v-list-item-content>
                                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                                        <v-list-item-subtitle>{{ item.quantity }} x ${{ item.price }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                    <v-list-item-action>
                                        <v-btn icon>
                                            <v-icon @click="removeFromCart(item)">mdi-delete</v-icon>
                                        </v-btn>
                                    </v-list-item-action>
                                </v-list-item>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-container>
            </template> -->
    </v-main>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    data() {
        return {
            cartItems: []
        }
    },

    async created() {
        await this.$store.dispatch('fetchingUser')
        await this.$store.dispatch('getCartCourses')
    },

    computed: {
        ...mapGetters(['coursesInCart', 'user']),
        cartItemCount() {
            return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
        }
    },

    methods: {
        addToCart(product) {
            let item = this.cartItems.find(item => item.id === product.id);
            if (item) {
                item.quantity++;
            } else {
                this.cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
        },
        removeFromCart(item) {
            console.log(item)
            let index = this.cartItems.indexOf(item);
            if (index > -1) {
                this.cartItems.splice(index, 1);
            }
        },
        addToWishlist(item) {
            console.log(item)
        }
    }
}
</script>
