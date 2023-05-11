<template>
    <v-main>
        <v-container>
            <h1>Student Enrolled Course</h1>
        </v-container>
    </v-main>
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