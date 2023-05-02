<template>
    <v-main>
        <v-container>
            vvvvv
        </v-container>
    </v-main>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters(['user'])
    },
    async created() {
        await this.$store.dispatch('fetchingUser')
    }
}
</script>