<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal" @click.stop>
      <form @submit.prevent="handleSubmit" class="row">
        <h3>{{ module ? 'Edit Module' : 'Create New Module' }}</h3>
        
        <input class="input" type="text" v-model.trim="formData.title" placeholder="Module title" required />
        <textarea class="input" v-model.trim="formData.description" placeholder="Module description" rows="3" required></textarea>
        
        <div class="row two">
            <input class="input" type="text" v-model.trim="formData.contentUrl" placeholder="Content URL (e.g., video link)" required />
            <select class="input" v-model="formData.contentType" required>
                <option disabled value="">Select content type</option>
                <option value="VIDEO">Video</option>
                <option value="TEXT">Text</option>
                <option value="QUIZ">Quiz</option>
            </select>
        </div>

        <div class="row two" style="justify-content:flex-end;">
            <button class="btn" type="button" @click="$emit('close')">Cancel</button>
            <button class="btn primary" :disabled="loading" type="submit">
              {{ loading ? 'Saving...' : 'Save Module' }}
            </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const props = defineProps({
  module: Object, // Pass module data for editing, null for creating
  loading: Boolean
});
const emit = defineEmits(['submit', 'close']);

const formData = ref({
  title: '',
  description: '',
  contentUrl: '',
  contentType: '',
});

watchEffect(() => {
  // Pre-fill form if we are editing an existing module
  if (props.module) {
    formData.value = {
      title: props.module.title || '',
      description: props.module.description || '',
      contentUrl: props.module.contentUrl || '',
      contentType: props.module.contentType || '',
    };
  } else {
    // Reset form for creation
    formData.value = { title: '', description: '', contentUrl: '', contentType: '' };
  }
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
  max-width: 600px; width: 100%;
}
</style>