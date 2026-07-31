<template>
  <div
    class="h-full overflow-hidden rounded-[26px] border border-black/5 bg-white/70 dark:border-white/10 dark:bg-white/5"
  >
    <div class="skeleton h-[188px] rounded-none"></div>
    <div class="p-5">
      <div class="skeleton mb-3 h-3.5 w-2/5"></div>
      <div class="skeleton mb-2 h-4.5 w-[90%]"></div>
      <div class="skeleton mb-4 h-4.5 w-[65%]"></div>
      <div class="skeleton mb-4 h-3.5 w-1/2"></div>
      <div class="flex justify-between">
        <div class="skeleton h-6 w-[30%]"></div>
        <div class="skeleton h-6 w-1/4"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'CourseCardSkeleton' }
</script>
