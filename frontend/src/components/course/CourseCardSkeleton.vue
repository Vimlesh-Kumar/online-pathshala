<template>
  <v-card class="section-card overflow-hidden h-100" flat>
    <div class="skeleton" style="height: 188px;"></div>
    <v-card-text class="pa-5">
      <div class="skeleton mb-3" style="height: 14px; width: 40%;"></div>
      <div class="skeleton mb-2" style="height: 18px; width: 90%;"></div>
      <div class="skeleton mb-4" style="height: 18px; width: 65%;"></div>
      <div class="skeleton mb-4" style="height: 14px; width: 50%;"></div>
      <div class="d-flex justify-space-between">
        <div class="skeleton" style="height: 24px; width: 30%;"></div>
        <div class="skeleton" style="height: 24px; width: 25%;"></div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default { name: 'CourseCardSkeleton' }
</script>
