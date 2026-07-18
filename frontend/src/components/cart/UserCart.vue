<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-8">
      <div class="eyebrow mb-4">Shopping Cart</div>
      <h1 class="app-section-title mb-3">Review your selected courses</h1>
      <p class="app-section-copy mb-0">Apply a coupon and check out for free — you'll be enrolled instantly.</p>
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
                      <div class="text-h5 font-weight-black mb-3 gradient-text">₹{{ formatMoney(item.price) }}</div>
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
            <v-btn class="btn-gradient" @click="$router.push('/courses/all')">Browse courses</v-btn>
          </v-card>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="glass-panel section-card summary-card pa-6" flat>
          <div class="eyebrow mb-4">Order Summary</div>

          <div class="d-flex justify-space-between mb-3">
            <span>Items</span>
            <strong>{{ cartSummary.itemCount }}</strong>
          </div>
          <div class="d-flex justify-space-between mb-3">
            <span>Subtotal</span>
            <strong>₹{{ formatMoney(cartSummary.totalAmount) }}</strong>
          </div>
          <div v-if="couponResult" class="d-flex justify-space-between mb-3 text-success">
            <span>Discount ({{ couponResult.code }})</span>
            <strong>−₹{{ formatMoney(couponResult.discount) }}</strong>
          </div>

          <!-- Coupon -->
          <div class="d-flex ga-2 mb-1 mt-4">
            <v-text-field
              v-model="coupon" label="Coupon code" variant="outlined" density="compact"
              hide-details :disabled="!coursesInCart.length" @keyup.enter="applyCoupon"
            />
            <v-btn variant="tonal" :loading="checkingCoupon" :disabled="!coupon || !coursesInCart.length" @click="applyCoupon">Apply</v-btn>
          </div>
          <div v-if="couponError" class="text-error text-caption mb-2">{{ couponError }}</div>
          <div v-else-if="couponResult" class="text-success text-caption mb-2">
            <v-icon size="14">mdi-check-circle</v-icon> {{ couponResult.label }}
          </div>
          <div class="text-caption text-medium-emphasis mb-5">Try: LEARN50 · WELCOME10 · FREE100</div>

          <v-divider class="mb-4" />
          <div class="d-flex justify-space-between mb-6">
            <span class="text-h6 font-weight-bold">Total</span>
            <span class="text-h5 font-weight-black gradient-text">₹{{ formatMoney(displayTotal) }}</span>
          </div>

          <v-btn
            class="btn-gradient" block size="large"
            :loading="checkingOut" :disabled="!coursesInCart.length"
            @click="completeCheckout"
          >
            <v-icon start>mdi-lock-check</v-icon> Complete checkout
          </v-btn>
          <p class="text-caption text-medium-emphasis text-center mt-3 mb-0">Free enrollment · no card required</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success dialog -->
    <v-dialog v-model="successDialog" max-width="460" persistent>
      <v-card class="glass-panel pa-2" rounded="xl">
        <v-card-text class="text-center pa-6">
          <v-avatar size="72" class="success-badge mb-4"><v-icon size="40" color="white">mdi-check-bold</v-icon></v-avatar>
          <h2 class="text-h5 font-weight-bold mb-2">You're enrolled! 🎉</h2>
          <p class="app-section-copy mb-4">
            {{ receipt?.items?.length }} course{{ receipt?.items?.length === 1 ? '' : 's' }} added to your learning.
            <br />Receipt <strong>{{ receipt?.ref }}</strong> · ₹{{ formatMoney(receipt?.total) }}
          </p>
          <div class="d-flex ga-3">
            <v-btn variant="tonal" class="flex-grow-1" @click="goOrders">View receipt</v-btn>
            <v-btn class="btn-gradient flex-grow-1" @click="goLearning">Start learning</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import WishList from '../wishlist/WishList.vue'

export default {
  components: { WishList },
  data() {
    return {
      coupon: '',
      couponResult: null,
      couponError: '',
      checkingCoupon: false,
      checkingOut: false,
      successDialog: false,
      receipt: null,
    }
  },
  created() {
    this.$store.dispatch('fetchingUser');
    this.$store.dispatch('getCartCourses');
    this.$store.dispatch('getWishlistCourses');
  },
  computed: {
    ...mapGetters(['coursesInCart', 'user', 'cartSummary']),
    displayTotal() {
      return this.couponResult ? this.couponResult.total : (this.cartSummary.totalAmount || 0)
    }
  },
  methods: {
    formatMoney(n) {
      return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    async removeFromCart(courseId) {
      await axios.post('/user/cart-remove', { course_id: courseId })
      await this.$store.dispatch('getCartCourses')
      if (this.couponResult) this.applyCoupon() // re-price
    },
    async applyCoupon() {
      if (!this.coupon) return
      this.checkingCoupon = true
      this.couponError = ''
      try {
        this.couponResult = await this.$store.dispatch('validateCoupon', this.coupon)
      } catch (e) {
        this.couponResult = null
        this.couponError = e?.response?.data?.message || 'Invalid coupon code.'
      } finally {
        this.checkingCoupon = false
      }
    },
    async completeCheckout() {
      this.checkingOut = true
      try {
        this.receipt = await this.$store.dispatch('checkout', this.couponResult?.code || this.coupon || null)
        this.successDialog = true
        await this.$store.dispatch('getCartCourses')
        await this.$store.dispatch('fetchingUserCourses')
      } catch (e) {
        this.couponError = e?.response?.data?.message || 'Checkout failed.'
      } finally {
        this.checkingOut = false
      }
    },
    goOrders() {
      this.successDialog = false
      this.$router.push('/user/orders')
    },
    goLearning() {
      this.successDialog = false
      this.$router.push('/user')
    },
  }
}
</script>

<style scoped>
.cart-list {
  display: grid;
  gap: 18px;
}
.cart-item {
  background: var(--surface-2);
  border: 1px solid var(--glass-border);
}
.success-badge {
  background: var(--grad-primary);
  box-shadow: var(--shadow-glow);
}
</style>
