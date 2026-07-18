<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-8">
      <div class="eyebrow mb-4">Purchase History</div>
      <h1 class="app-section-title mb-3">Your receipts</h1>
      <p class="app-section-copy mb-0">Every enrollment you've completed, with its coupon and total.</p>
    </section>

    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="44" />
    </div>

    <div v-else-if="orders.length" class="d-grid ga-5">
      <v-card v-for="order in orders" :key="order.ref" class="glass-panel section-card pa-6" flat>
        <div class="d-flex flex-column flex-md-row justify-space-between ga-4">
          <div class="flex-grow-1">
            <div class="d-flex align-center flex-wrap ga-3 mb-3">
              <span class="order-ref">{{ order.ref }}</span>
              <v-chip size="small" variant="tonal" color="success">
                <v-icon start size="14">mdi-check-decagram</v-icon>{{ order.paymentMethod }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="d-flex flex-column ga-2">
              <div v-for="title in order.titles" :key="title" class="d-flex align-center">
                <v-icon size="18" color="primary" class="mr-2">mdi-play-circle-outline</v-icon>
                <span class="font-weight-medium">{{ title }}</span>
              </div>
            </div>
          </div>
          <div class="text-md-right">
            <div class="text-caption text-medium-emphasis mb-1">{{ order.itemCount }} course{{ order.itemCount === 1 ? '' : 's' }}</div>
            <div class="text-h5 font-weight-black gradient-text">₹{{ formatMoney(order.total) }}</div>
          </div>
        </div>
      </v-card>
    </div>

    <v-card v-else class="glass-panel section-card pa-10 text-center" flat>
      <v-icon size="56" color="primary" class="mb-3">mdi-receipt-text-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mb-4">No purchases yet.</h3>
      <v-btn class="btn-gradient" @click="$router.push('/courses/all')">Browse courses</v-btn>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'OrdersPage',
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

<style scoped>
.d-grid { display: grid; }
.order-ref {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  color: var(--text-strong);
  letter-spacing: 0.02em;
}
</style>
