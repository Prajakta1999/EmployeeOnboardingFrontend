<template>
  <form @submit.prevent="emitSubmit" class="row" autocomplete="on">
    <input class="input" type="email" v-model.trim="email" placeholder="Email" required />
    <input class="input" type="password" v-model.trim="password" placeholder="Password" required />
    <button class="btn primary" :disabled="loading" type="submit">
      {{ loading ? 'Signing in...' : 'Login' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({ loading: Boolean });
const emit = defineEmits(['submit']);

const email = ref('');
const password = ref('');

function emitSubmit() {
  emit('submit', { email: email.value, password: password.value });
}
</script>
