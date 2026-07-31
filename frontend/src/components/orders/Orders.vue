<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Purchase History</div>
      <h1 class="app-section-title mb-3">Your receipts</h1>
      <p class="text-muted-foreground">Every enrollment you've completed, with its coupon and total.</p>
    </section>

    <div v-if="loading" class="py-12 text-center">
      <app-icon name="lucide:loader-circle" size="44" class="mx-auto animate-spin text-primary" />
    </div>

    <div v-else-if="orders.length" class="grid gap-5">
      <div v-for="order in orders" :key="order.ref" class="glass-panel section-card p-6">
        <div class="flex flex-col justify-between gap-4 md:flex-row">
          <div class="flex-1">
            <div class="mb-3 flex flex-wrap items-center gap-3">
              <span class="font-display font-extrabold tracking-wide">{{ order.ref }}</span>
              <span
                class="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-500"
              >
                <app-icon name="lucide:badge-check" size="14" />{{ order.paymentMethod }}
              </span>
              <span class="text-xs text-muted-foreground">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <div v-for="title in order.titles" :key="title" class="flex items-center gap-2">
                <app-icon name="lucide:circle-play" size="18" class="text-primary" />
                <span class="font-medium">{{ title }}</span>
              </div>
            </div>
          </div>
          <div class="md:text-right">
            <div class="mb-1 text-xs text-muted-foreground">
              {{ order.itemCount }} course{{ order.itemCount === 1 ? '' : 's' }}
            </div>
            <div class="gradient-text font-display text-2xl font-black">₹{{ formatMoney(order.total) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="glass-panel section-card p-10 text-center">
      <app-icon name="lucide:receipt-text" size="56" class="mx-auto mb-3 text-primary" />
      <h3 class="mb-4 font-display text-lg font-bold">No purchases yet.</h3>
      <button class="btn-brand mx-auto" @click="$router.push('/courses/all')">Browse courses</button>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'OrdersPage',
  components: { AppIcon },
  data() {
    return { loading: true, orders: [] }
  },
  async created() {
    try {
      this.orders = await this.$store.dispatch('fetchOrders')
    } catch (e) {
      console.error(e)
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatMoney(n) {
      return Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatDate(d) {
      if (!d) return ''
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    },
  },
}
</script>
