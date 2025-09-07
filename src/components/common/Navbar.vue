<!-- <template>
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
</script> -->


<template>
  <nav class="navbar">
    <div class="container">
      
      <router-link to="/" class="brand">eLearn</router-link>

      <div class="nav-links">
        <template v-if="auth.isAuthenticated">
          <router-link v-if="auth.isInstructor" to="/instructor">Dashboard</router-link>
          <router-link v-if="auth.isStudent" to="/student">Dashboard</router-link>
          
          <div class="user-menu">
            <div class="avatar">
              {{ auth.userInitials }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ auth.userName }}</span>
              <span class="user-role">{{ auth.role }}</span>
            </div>
            <button class="btn logout-btn" @click="auth.logout(true)">Logout</button>
          </div>
        </template>
        
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/signup" class="btn primary">Sign up</router-link>
        </template>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';
const auth = useAuthStore();
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.8rem 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-weight: 700;
  font-size: 1.5rem;
  color: #2d3748;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

.nav-links a:hover {
  color: #2b6cb0;
}

.nav-links a.btn {
  color: white; /* Override for button-styled links */
}
.nav-links a.btn:hover {
  color: white;
}

/* Authenticated user styles */
.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
}

/* (NEW) Avatar Styles */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4a5568;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Aligned to the left now */
  line-height: 1.2;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
}

.user-role {
  font-size: 0.8rem;
  color: #718096;
  text-transform: capitalize;
}

.logout-btn {
  background-color: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.logout-btn:hover {
  background-color: #e2e8f0;
}
</style>