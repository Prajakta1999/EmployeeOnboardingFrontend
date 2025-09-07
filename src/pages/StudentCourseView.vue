<template>
  <div>
    <div v-if="loading" class="card">Loading course details...</div>
    <div v-else-if="course">
      <router-link to="/student" class="back-link">&larr; Back to Dashboard</router-link>
      <h2 style="margin-top: 0.5rem;">{{ course.name }}</h2>
      <p style="opacity: 0.8;">by {{ course.instructorName }}</p>

      <div class="card">
        <h3>Modules</h3>
        <ul v-if="modules.length" class="item-list">
          <li v-for="module in modules" :key="module.id">
            <div class="module-info">
              <span :class="['status-icon', { completed: module.isCompleted }]">
                {{ module.isCompleted ? '✔' : '○' }}
              </span>
              <div>
                <strong>{{ module.title }}</strong> ({{ module.contentType }})
                <p class="module-desc">{{ module.description }}</p>
              </div>
            </div>
            <button
              :class="['btn', 'small', module.isCompleted ? '' : 'primary']"
              @click="toggleModuleCompletion(module)"
              :disabled="loadingStates[module.id]"
            >
              {{ loadingStates[module.id] ? 'Updating...' : (module.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete') }}
            </button>
          </li>
        </ul>
        <p v-else>No modules are available for this course yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import * as api from '@/api/courseService';

const route = useRoute();
const courseId = route.params.id;

const course = ref(null);
const modules = ref([]);
const loading = ref(true);
const loadingStates = reactive({}); // To track loading state per button

async function fetchCourseData() {
  loading.value = true;
  try {
    // We need an endpoint to get a single course's details for a student.
    // For now, we'll get all enrolled courses and find the one we need.
    const enrolledRes = await api.getEnrolledCourses();
    const courseData = Array.isArray(enrolledRes.data.data) ? enrolledRes.data.data : [];
    course.value = courseData.find(c => c.id == courseId);

    // Fetch the modules for this course
    await fetchModules();

  } catch (error) {
    console.error("Failed to fetch course data:", error);
  } finally {
    loading.value = false;
  }
}

async function fetchModules() {
  try {
    const modulesRes = await api.getStudentModules(courseId);
    const moduleData = Array.isArray(modulesRes.data.data) ? modulesRes.data.data : [];
    modules.value = moduleData;
  } catch (error) {
    console.error("Failed to fetch modules:", error);
  }
}

async function toggleModuleCompletion(module) {
  loadingStates[module.id] = true;
  try {
    if (module.isCompleted) {
      await api.unmarkModuleComplete(module.id);
    } else {
      await api.markModuleComplete(module.id);
    }
    // Refresh the module list to show the new status
    await fetchModules();
  } catch (error) {
    console.error(`Failed to update module ${module.id}:`, error);
    alert('Failed to update completion status.');
  } finally {
    loadingStates[module.id] = false;
  }
}

onMounted(fetchCourseData);
</script>

<style scoped>
.back-link {
  text-decoration: none;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 1rem;
  display: inline-block;
}
.item-list { list-style: none; padding: 0; margin: 0; }
.item-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    border-bottom: 1px solid #eee;
}
.item-list li:last-child { border-bottom: none; }

.module-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.status-icon {
  font-size: 1.5rem;
  line-height: 1.2;
  color: #a0aec0;
}
.status-icon.completed {
  color: #48bb78;
}

.module-desc {
  margin: 0.25rem 0 0 0;
  font-size: 0.9em;
  color: #718096;
}
</style>