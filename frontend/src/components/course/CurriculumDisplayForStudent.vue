<template>
    <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
        <h1 class="app-section-title">Student Enrolled Course</h1>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    data() {
        return {

        }
    },
    computed: {
        ...mapGetters(['user'])
    },

    async created() {
        await this.$store.dispatch('fetchingUser');
    }
}
</script>
