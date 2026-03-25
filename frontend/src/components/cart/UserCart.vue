<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-8">
      <div class="eyebrow mb-4">Shopping Cart</div>
      <h1 class="app-section-title mb-3">Review your selected courses</h1>
      <p class="app-section-copy mb-0">Keep your shortlist organized before checkout or move courses into the wishlist.</p>
    </section>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="glass-panel section-card pa-4 pa-md-6" flat>
          <div class="d-flex align-center justify-space-between mb-6">
            <h2 class="text-h5 font-weight-bold">Cart items</h2>
            <span class="text-body-2 text-medium-emphasis">{{ coursesInCart.length }} courses</span>
          </div>

          <div v-if="coursesInCart.length" class="cart-list">
            <v-card v-for="item in coursesInCart" :key="item.id" class="cart-item section-card pa-4" flat>
              <div class="d-flex flex-column flex-md-row ga-4">
                <v-img :src="item.thumb_url" width="220" height="132" cover class="rounded-xl flex-shrink-0" />
                <div class="flex-grow-1">
                  <div class="d-flex flex-column flex-md-row justify-space-between ga-4">
                    <div>
                      <h3 class="text-h6 font-weight-bold mb-2">{{ item.title }}</h3>
                      <p class="text-body-2 text-medium-emphasis mb-2">{{ item.author }}</p>
                      <div class="d-flex align-center">
                        <v-rating :model-value="item.rating" color="warning" density="compact" half-increments readonly size="small" />
                        <span class="ml-2 font-weight-bold">{{ item.rating }}</span>
                      </div>
                    </div>
                    <div class="text-md-right">
                      <div class="text-h5 font-weight-black mb-3">₹{{ item.price }}</div>
                      <div class="d-flex flex-wrap justify-md-end ga-2">
                        <wish-list :course_id="item.id" :user="user" />
                        <v-btn variant="outlined" rounded="pill" color="error" @click="removeFromCart(item.id)">Remove</v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </div>

          <v-card v-else class="section-card pa-8 text-center" flat>
            <v-icon size="60" color="primary" class="mb-4">mdi-cart-off</v-icon>
            <h3 class="text-h5 font-weight-bold mb-3">Your cart is empty.</h3>
            <p class="app-section-copy mb-6">Browse the catalog and add courses to continue.</p>
            <v-btn color="primary" rounded="pill" @click="$router.push('/courses/all')">Browse courses</v-btn>
          </v-card>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="section-card summary-card pa-6" flat>
          <div class="eyebrow mb-4">Order Summary</div>
          <div class="d-flex justify-space-between mb-3">
            <span>Items</span>
            <strong>{{ cartSummary.itemCount }}</strong>
          </div>
          <div class="d-flex justify-space-between mb-6">
            <span>Total</span>
            <strong class="text-h5">₹{{ Number(cartSummary.totalAmount || 0).toFixed(2) }}</strong>
          </div>
          <v-btn color="primary" rounded="pill" block size="large">Proceed to checkout</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import WishList from '../wishlist/WishList.vue'

export default {
  components: { WishList },
  created() {
    this.$store.dispatch('fetchingUser');
    this.$store.dispatch('getCartCourses');
    this.$store.dispatch('getWishlistCourses');
  },
  computed: {
    ...mapGetters(['coursesInCart', 'user', 'cartSummary'])
  },
  methods: {
    async removeFromCart(courseId) {
      await axios.post('/user/cart-remove', { course_id: courseId })
      await this.$store.dispatch('getCartCourses')
    },
  }
}
</script>

<style scoped>
.cart-list {
  display: grid;
  gap: 18px;
}

.cart-item,
.summary-card {
  background: rgba(255, 253, 248, 0.94);
  border: 1px solid rgba(31, 41, 55, 0.08);
}
</style>
