<template>
  <v-app>
    <the-header></the-header>
    <router-view />
  </v-app>
</template>

<script>
  import TheHeader from './layouts/TheHeader.vue'
  export default{
    components:{
      TheHeader
    }
  }
</script>