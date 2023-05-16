<template>
    <!-- Error Handled for username & password -->
    <v-alert v-if="error" class="mb-5" type="error" icon="$warning" :text="error"></v-alert>
</template>

<script>
export default {
    name: 'Error',
    props: ['error']
}
</script>