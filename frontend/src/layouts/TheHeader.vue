<template>
  <v-app-bar flat class="border-b" color="white" elevation="0" height="72">
    <!-- Logo -->
    <router-link to="/" class="ml-4 d-flex align-center text-decoration-none">
      <v-img src="../assets/logof.png" width="160" height="48" contain></v-img>
    </router-link>

    <!-- Categories Dropdown (Modern) -->
    <v-menu open-on-hover transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="text" class="ml-4 font-weight-medium text-grey-darken-3">
          Categories
          <v-icon end>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" min-width="200" class="pa-2">
        <v-list-item
          v-for="cat in category"
          :key="cat"
          @click="handleCategorySelect(cat)"
          :title="cat"
          class="rounded-lg"
          active-color="primary"
        ></v-list-item>
      </v-list>
    </v-menu>

    <!-- Modern Search Bar -->
    <v-spacer></v-spacer>
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search for anything"
      density="compact"
      variant="outlined"
      class="mx-4 search-bar"
      hide-details
      rounded="lg"
      bg-color="grey-lighten-4"
      @keyup.enter="handleSearch"
    ></v-text-field>
    <v-spacer></v-spacer>

    <!-- Right Side Actions -->
    <div v-if="user" class="d-flex align-center mr-4">
      <v-btn v-if="user.user_role === 'Tutor'" variant="text" class="mr-2 text-primary font-weight-bold" @click="handleAddCourse">
        Instructor
      </v-btn>
      
      <v-btn icon variant="text" class="text-grey-darken-2">
        <v-badge :content="cartCount" color="red" offset-x="2" offset-y="2" v-if="cartCount > 0">
          <router-link to="/user/cart" class="text-inherit"><v-icon>mdi-cart-outline</v-icon></router-link>
        </v-badge>
        <router-link v-else to="/user/cart" class="text-inherit"><v-icon>mdi-cart-outline</v-icon></router-link>
      </v-btn>

      <v-btn icon variant="text" class="text-grey-darken-2">
        <router-link to="/user/wishlist" class="text-inherit"><v-icon>mdi-heart-outline</v-icon></router-link>
      </v-btn>

      <v-menu transition="scale-transition">
        <template v-slot:activator="{ props }">
          <v-avatar color="primary" class="ml-4 cursor-pointer" v-bind="props">
            <span class="text-white text-uppercase">{{ user.full_name?.charAt(0) }}</span>
          </v-avatar>
        </template>
        <v-list class="mt-2 pa-2 rounded-lg" min-width="200">
          <v-list-item class="mb-2">
            <v-list-item-title class="font-weight-bold">{{ user.full_name }}</v-list-item-title>
            <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider class="mb-2"></v-divider>
          <v-list-item @click="$router.push('/user/profile')" prepend-icon="mdi-account-outline">Profile</v-list-item>
          <v-list-item @click="handleLogoutClick" prepend-icon="mdi-logout" class="text-red">Logout</v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Login/Signup for Guest -->
    <div v-else class="mr-4">
      <v-btn variant="outlined" color="primary" class="mr-2 rounded-lg" @click="$router.push('/user/sign-in')">Log in</v-btn>
      <v-btn color="primary" class="rounded-lg shadow-sm" @click="$router.push('/user/sign-up')">Sign up</v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      searchQuery: '',
      cartCount: 0 // In a real app, this would come from store
    }
  },
  computed: {
    ...mapGetters(['user', 'category'])
  },
  methods: {
    async handleLogoutClick() {
      localStorage.removeItem('token')
      await this.$store.dispatch('fetchingUser')
      this.$router.push('/')
    },
    handleAddCourse() {
      this.$router.push('/user/tutor/add-course')
    },
    handleCategorySelect(category) {
      this.$router.push({ path: '/courses/category', query: { category } })
    },
    handleSearch() {
      if (this.searchQuery.trim()) {
        this.$router.push({ path: '/courses/search', query: { q: this.searchQuery } })
      }
    }
  }
}
</script>

<style scoped>
.search-bar {
  max-width: 600px;
}

.search-bar :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1;
}

.v-btn {
  text-transform: none;
  letter-spacing: 0;
}

.text-inherit {
  color: inherit;
  text-decoration: none;
}

.cursor-pointer {
  cursor: pointer;
}
</style>

