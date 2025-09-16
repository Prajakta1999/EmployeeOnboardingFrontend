<template>
  <div>
    <h2>Employee Dashboard</h2>

    <!-- Progress -->
    <div class="card">
      <h3>My Onboarding Progress</h3>
      <div v-if="loading.progress">Loading progress...</div>
      <div v-else-if="progress.length" class="progress-grid">
        <div v-for="prog in progress" :key="prog.taskId" class="progress-card">
          <strong>{{ prog.taskName }}</strong>
          <p>{{ prog.completedModules }} / {{ prog.totalModules }} Modules Completed</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: prog.completionPercentage + '%' }"></div>
          </div>
          <span class="progress-percent">{{ prog.completionPercentage.toFixed(1) }}%</span>
        </div>
      </div>
      <p v-else>You don’t have onboarding tasks assigned yet.</p>
    </div>

    <!-- Assigned Tasks -->
    <div class="card" style="margin-top: 2rem;">
      <h3>My Assigned Tasks</h3>
      <div v-if="loading.assigned">Loading...</div>
      <div v-else-if="tasks.length === 0">
        <p>No tasks have been assigned yet.</p>
      </div>
      <ul v-else class="item-list">
        <li v-for="task in tasks" :key="task.id">
          <div>
            <strong>{{ task.name }}</strong>
            <p class="hr-name">Assigned by {{ task.hrName }}</p>
          </div>
          <div class="actions">
            <button class="btn small primary" @click="viewModules(task.id)">View Modules</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '@/api/taskService';

const router = useRouter();

const tasks = ref([]);
const progress = ref([]);
const loading = reactive({ assigned: false, progress: false });

async function fetchData() {
  loading.assigned = true;
  loading.progress = true;
  try {
    const [tasksRes, progressRes] = await Promise.all([
      api.getAssignedTasks(),
      api.getMyProgress(),
    ]);
    tasks.value = Array.isArray(tasksRes.data.data) ? tasksRes.data.data : [];
    progress.value = Array.isArray(progressRes.data.data) ? progressRes.data.data : [];
  } catch (e) {
    console.error('Failed to load employee dashboard:', e);
  } finally {
    loading.assigned = false;
    loading.progress = false;
  }
}

function viewModules(taskId) {
  router.push({ name: 'employee-task-view', params: { id: taskId } });
}

onMounted(fetchData);
</script>

<style scoped>
.item-list { list-style: none; padding: 0; margin: 0; }
.item-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.hr-name { margin-top: .25rem; font-size: .9em; color: #718096; }
.progress-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
.progress-card { border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; }
.progress-bar { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: .25rem; }
.progress-fill { height: 100%; background: #4299e1; }
.progress-percent { font-size: .8em; font-weight: 500; color: #718096; }
</style>
