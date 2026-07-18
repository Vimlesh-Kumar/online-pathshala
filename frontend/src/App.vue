<template>
  <v-app class="app-shell">
    <the-header></the-header>
    <v-main class="app-main">
      <router-view />
    </v-main>
    <the-footer></the-footer>
    <support-chat></support-chat>
  </v-app>
</template>

<script>
  import TheHeader from './layouts/TheHeader.vue'
  import TheFooter from './layouts/TheFooter.vue'
  import SupportChat from './components/support/SupportChat.vue'
  export default{
    components:{
      TheHeader,
      TheFooter,
      SupportChat
    }
  }
</script>

<style>
.v-btn {
  text-transform: none;
}
</style>
