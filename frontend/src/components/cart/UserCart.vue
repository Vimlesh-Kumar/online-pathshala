<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Shopping Cart</div>
      <h1 class="app-section-title mb-3">Review your selected courses</h1>
      <p class="text-muted-foreground">
        Apply a coupon and check out for free — you'll be enrolled instantly.
      </p>
    </section>

    <div class="grid gap-6 md:grid-cols-12">
      <div class="md:col-span-8">
        <div class="glass-panel section-card p-4 md:p-6">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="font-display text-2xl font-bold">Cart items</h2>
            <span class="text-sm text-muted-foreground">{{ coursesInCart.length }} courses</span>
          </div>

          <div v-if="coursesInCart.length" class="grid gap-4.5">
            <div
              v-for="item in coursesInCart"
              :key="item.id"
              class="section-card border border-black/5 bg-[var(--surface-2)] p-4 dark:border-white/10"
            >
              <div class="flex flex-col gap-4 md:flex-row">
                <img
                  :src="item.thumb_url"
                  :alt="item.title"
                  class="h-33 w-full shrink-0 rounded-xl object-cover md:w-55"
                />
                <div class="flex flex-1 flex-col justify-between gap-4 md:flex-row">
                  <div>
                    <h3 class="mb-2 font-display text-lg font-bold">{{ item.title }}</h3>
                    <p class="mb-2 text-sm text-muted-foreground">{{ item.author }}</p>
                    <div class="flex items-center gap-2">
                      <star-rating :model-value="Number(item.rating || 0)" :size="16" />
                      <span class="font-bold">{{ item.rating }}</span>
                    </div>
                  </div>
                  <div class="md:text-right">
                    <div class="gradient-text mb-3 font-display text-2xl font-black">
                      ₹{{ formatMoney(item.price) }}
                    </div>
                    <div class="flex flex-wrap items-center gap-2 md:justify-end">
                      <wish-list :course_id="item.id" :user="user" />
                      <button
                        class="rounded-full border border-destructive/40 px-5 py-2 font-semibold text-destructive transition-colors hover:bg-destructive/10"
                        @click="removeFromCart(item.id)"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="section-card p-8 text-center">
            <app-icon name="lucide:shopping-cart" size="60" class="mx-auto mb-4 text-primary" />
            <h3 class="mb-3 font-display text-2xl font-bold">Your cart is empty.</h3>
            <p class="mb-6 text-muted-foreground">Browse the catalog and add courses to continue.</p>
            <button class="btn-brand mx-auto" @click="$router.push('/courses/all')">Browse courses</button>
          </div>
        </div>
      </div>

      <div class="md:col-span-4">
        <div class="glass-panel section-card p-6">
          <div class="eyebrow mb-4">Order Summary</div>

          <div class="mb-3 flex justify-between">
            <span>Items</span>
            <strong>{{ cartSummary.itemCount }}</strong>
          </div>
          <div class="mb-3 flex justify-between">
            <span>Subtotal</span>
            <strong>₹{{ formatMoney(cartSummary.totalAmount) }}</strong>
          </div>
          <div v-if="couponResult" class="mb-3 flex justify-between text-emerald-500">
            <span>Discount ({{ couponResult.code }})</span>
            <strong>−₹{{ formatMoney(couponResult.discount) }}</strong>
          </div>

          <!-- Coupon -->
          <div class="mt-4 mb-1 flex gap-2">
            <app-field
              v-model="coupon"
              class="flex-1"
              placeholder="Coupon code"
              :disabled="!coursesInCart.length"
              @keyup.enter="applyCoupon"
            />
            <button
              class="shrink-0 rounded-2xl bg-primary/12 px-5 font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              :disabled="checkingCoupon || !coupon || !coursesInCart.length"
              @click="applyCoupon"
            >
              Apply
            </button>
          </div>
          <div v-if="couponError" class="mb-2 text-xs text-destructive">{{ couponError }}</div>
          <div v-else-if="couponResult" class="mb-2 flex items-center gap-1 text-xs text-emerald-500">
            <app-icon name="lucide:circle-check" size="14" /> {{ couponResult.label }}
          </div>
          <div class="mb-5 text-xs text-muted-foreground">Try: LEARN50 · WELCOME10 · FREE100</div>

          <separator class="mb-4" />
          <div class="mb-6 flex items-center justify-between">
            <span class="font-display text-lg font-bold">Total</span>
            <span class="gradient-text font-display text-2xl font-black">
              ₹{{ formatMoney(displayTotal) }}
            </span>
          </div>

          <button
            class="btn-brand w-full"
            :disabled="checkingOut || !coursesInCart.length"
            @click="completeCheckout"
          >
            <app-icon
              :name="checkingOut ? 'lucide:loader-circle' : 'lucide:lock'"
              size="18"
              :class="checkingOut ? 'animate-spin' : ''"
            />
            Complete checkout
          </button>
          <p class="mt-3 text-center text-xs text-muted-foreground">Free enrollment · no card required</p>
        </div>
      </div>
    </div>

    <!-- Success dialog -->
    <dialog-root v-model:open="successDialog">
      <dialog-content class="text-center sm:max-w-[460px]" @interact-outside.prevent @escape-key-down.prevent>
        <dialog-header class="sr-only">
          <dialog-title>Enrollment complete</dialog-title>
        </dialog-header>
        <span
          class="mx-auto mb-4 grid size-18 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] shadow-[0_18px_40px_-14px_rgb(124_58_237_/_0.9)]"
        >
          <app-icon name="lucide:check" size="38" class="text-white" />
        </span>
        <h2 class="mb-2 font-display text-2xl font-bold">You're enrolled! 🎉</h2>
        <p class="mb-4 text-muted-foreground">
          {{ receipt?.items?.length }} course{{ receipt?.items?.length === 1 ? '' : 's' }} added to your
          learning.
          <br />Receipt <strong>{{ receipt?.ref }}</strong> · ₹{{ formatMoney(receipt?.total) }}
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-full bg-primary/12 px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary/20"
            @click="goOrders"
          >
            View receipt
          </button>
          <button class="btn-brand flex-1" @click="goLearning">Start learning</button>
        </div>
      </dialog-content>
    </dialog-root>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import WishList from '../wishlist/WishList.vue'
import { toast } from '@/plugins/toast'
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { Separator } from '@/components/ui/separator'
import {
  Dialog as DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export default {
  components: {
    WishList,
    AppField,
    AppIcon,
    StarRating,
    Separator,
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle
  },
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
      toast.info('Removed from cart.')
      if (this.couponResult) this.applyCoupon() // re-price
    },
    async applyCoupon() {
      if (!this.coupon) return
      this.checkingCoupon = true
      this.couponError = ''
      try {
        this.couponResult = await this.$store.dispatch('validateCoupon', this.coupon)
        toast.success(this.couponResult?.label || 'Coupon applied!')
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
        toast.error(this.couponError)
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
