<template>
    <v-alert color="success" icon="$success" :text="message"></v-alert>
    <!-- <v-snackbar  :timeout="3000" color="success">{{ message }}</v-snackbar> -->
</template>

<script>
export default {
    name: 'Message',
    props: ['message']
}
</script>