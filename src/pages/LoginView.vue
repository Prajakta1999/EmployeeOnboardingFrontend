<template>
  <div class="card" style="max-width:480px;margin:2rem auto;">
    <h2 style="margin:0 0 1rem 0;">Login</h2>
    <LoginForm @submit="onSubmit" :loading="loading" />
    <p style="margin-top:1rem;">No account?
      <router-link class="link" to="/signup">Create one</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import LoginForm from '@/components/forms/LoginForm.vue';

const auth = useAuthStore();
const loading = ref(false);

async function onSubmit({ email, password }) {
  loading.value = true;
  try {
    await auth.doLogin({ email, password });
  } finally {
    loading.value = false;
  }
}
</script>
