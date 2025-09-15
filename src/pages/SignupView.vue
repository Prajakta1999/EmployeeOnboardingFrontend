<template>
  <div class="card" style="max-width:520px;margin:2rem auto;padding:1.5rem;">
    <h2 style="margin:0 0 1rem 0;">Create an account</h2>
    <SignupForm @submit="onSubmit" :loading="loading" />
    <p style="margin-top:1rem;">
      Already have an account?
      <router-link class="link" to="/login">Login</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import SignupForm from '@/components/forms/SignupForm.vue';

const auth = useAuthStore();
const loading = ref(false);

async function onSubmit(payload) {
  loading.value = true;
  try {
    // call your API
    await auth.doSignup(payload);
  } catch (err) {
    console.error('Signup failed:', err);
  } finally {
    loading.value = false;
  }
}
</script>