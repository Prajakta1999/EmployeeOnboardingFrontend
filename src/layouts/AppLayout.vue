<template>
  <div>
    <Navbar />
    <div class="container">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/common/Navbar.vue';
</script>
