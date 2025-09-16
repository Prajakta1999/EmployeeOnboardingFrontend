<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal" @click.stop>
      <form @submit.prevent="handleSubmit" class="row">
        <h3>{{ course ? 'Edit Course' : 'Create New Course' }}</h3>
        <input class="input" type="text" v-model.trim="formData.name" placeholder="Course name" required />
        <textarea class="input" v-model.trim="formData.description" placeholder="Course description" rows="4"></textarea>
        <div class="row two" style="justify-content:flex-end;">
            <button class="btn" type="button" @click="$emit('close')">Cancel</button>
            <button class="btn primary" :disabled="loading" type="submit">
              {{ loading ? 'Saving...' : 'Save Course' }}
            </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const props = defineProps({
  course: Object, // Pass course data for editing, null for creating
  loading: Boolean
});
const emit = defineEmits(['submit', 'close']);

const formData = ref({ name: '', description: '' });

watchEffect(() => {
  // Pre-fill form if editing
  formData.value = {
    name: props.course?.name || '',
    description: props.course?.description || ''
  };
});

function handleSubmit() {
  emit('submit', formData.value);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal {
  background-color: white; padding: 2rem; border-radius: 8px;
  max-width: 500px; width: 100%;
}
</style>