<template>
  <div class="app-shell">
    <the-header></the-header>
    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <the-footer></the-footer>
    <support-chat></support-chat>
    <toast-stack></toast-stack>
    <back-to-top></back-to-top>
    <command-palette></command-palette>
  </div>
</template>

<script>
  import TheHeader from './layouts/TheHeader.vue'
  import TheFooter from './layouts/TheFooter.vue'
  import SupportChat from './components/support/SupportChat.vue'
  import ToastStack from './components/support/ToastStack.vue'
  import BackToTop from './components/support/BackToTop.vue'
  import CommandPalette from './components/support/CommandPalette.vue'
  export default{
    components:{
      TheHeader,
      TheFooter,
      SupportChat,
      ToastStack,
      BackToTop,
      CommandPalette
    }
  }
</script>
