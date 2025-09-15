<template>
  <form @submit.prevent="emitSubmit" class="row">
    <div class="row two">
      <input
        class="input"
        type="text"
        v-model.trim="name"
        placeholder="Full name (min 2 chars)"
        required
      />
      <select class="input" v-model="role" required>
  <option disabled value="">Select role</option>
  <option value="HR">HR</option>
  <option value="EMPLOYEE">EMPLOYEE</option>
</select>
    </div>

    <input
      class="input"
      type="email"
      v-model.trim="email"
      placeholder="e.g. example@gmail.com"
      required
    />

    <input
      class="input"
      type="password"
      v-model.trim="password"
      placeholder="Password (1 uppercase & 1 special char)"
      required
    />

    <!-- Show validation errors -->
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
    </div>

    <button class="btn primary" :disabled="loading" type="submit">
      {{ loading ? 'Creating...' : 'Sign up' }}
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({ loading: Boolean });
const emit = defineEmits(['submit']);

const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('');
const errorMessage = ref('');

// Validation helpers
function validateEmail(mail) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(mail);
}

function validatePassword(pass) {
  const hasUpper = /[A-Z]/.test(pass);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  return hasUpper && hasSpecial;
}

function emitSubmit() {
  errorMessage.value = '';

  if (name.value.length < 2) {
    errorMessage.value = 'Name must be at least 2 characters long';
    return;
  }
  if (!validateEmail(email.value)) {
    errorMessage.value = 'Please enter a valid email (e.g. example@gmail.com)';
    return;
  }
  if (!validatePassword(password.value)) {
    errorMessage.value = 'Password must contain 1 uppercase and 1 special character';
    return;
  }

  emit('submit', {
    name: name.value,
    email: email.value,
    password: password.value,
    role: role.value
  });
}
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}
</style>
