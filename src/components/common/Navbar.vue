<template>
  <nav>
    <div class="container" style="display:flex;justify-content:space-between;align-items:center;padding:.8rem 1rem;">
      <div style="font-weight:700;">eLearn</div>
      <div>
        <template v-if="auth.isAuthenticated">
          <span style="opacity:.8;margin-right:1rem;">{{ auth.role }}</span>
          <router-link v-if="auth.isInstructor" to="/instructor">Instructor</router-link>
          <router-link v-if="auth.isStudent" to="/student">Student</router-link>
          <button class="btn" style="margin-left:1rem;" @click="auth.logout(true)">Logout</button>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/signup" style="margin-left:1rem;">Sign up</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';
const auth = useAuthStore();
</script>
