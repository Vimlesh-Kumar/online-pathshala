<template>
  <v-app>
    <the-header></the-header>
    <v-main>
      <router-view />
    </v-main>
    <the-footer></the-footer>
  </v-app>
</template>

<script>
  import TheHeader from './layouts/TheHeader.vue'
  import TheFooter from './layouts/TheFooter.vue'
  export default{
    components:{
      TheHeader,
      TheFooter
    }
  }
</script>

<style>
.v-btn {
  text-transform: none;
}
</style>