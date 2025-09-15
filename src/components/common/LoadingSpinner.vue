<template>
  <div class="loading-spinner d-flex justify-content-center align-items-center">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <span v-if="text" class="ms-2">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Loading...'
  }
})
</script>

<style scoped>
.loading-spinner {
  padding: 2rem;
  min-height: 200px;
}
</style>
