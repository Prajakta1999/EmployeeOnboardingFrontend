<template>
  <div class="card">
    <h4>Modules for: {{ courseName }}</h4>
    <div v-if="!modules || modules.length === 0">
        <p>No modules found for this course.</p>
    </div>
    <ul v-else class="item-list">
        <li v-for="module in modules" :key="module.id">
            <div>
                <strong>{{ module.title }}</strong> ({{ module.contentType }})
                <span :class="['badge', module.isPublished ? 'published' : 'draft']">
                    {{ module.isPublished ? 'Published' : 'Draft' }}
                </span>
            </div>
            <div class="actions">
                <button @click="$emit('publish', module.id, !module.isPublished)" class="btn small">
                    {{ module.isPublished ? 'Unpublish' : 'Publish' }}
                </button>
                 <button @click="$emit('edit', module)" class="btn small">Edit</button>
                <button @click="$emit('delete', module.id)" class="btn small danger">Delete</button>
            </div>
        </li>
    </ul>
     <button class="btn primary" @click="$emit('add')">Add New Module</button>
  </div>
</template>

<script setup>
defineProps({
  modules: Array,
  courseName: String,
});
defineEmits(['add', 'edit', 'delete', 'publish']);
</script>

<style scoped>
.item-list { list-style: none; padding: 0; margin: 0 0 1rem 0; }
.item-list li { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #eee; }
.item-list li:last-child { border-bottom: none; }
.actions { display: flex; gap: 0.5rem; }
.badge { padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.8em; color: white; }
.badge.published { background-color: #4CAF50; }
.badge.draft { background-color: #757575; }
</style>