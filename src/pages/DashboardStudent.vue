<!-- <template>
  <div class="card">
    <h2>Student Dashboard</h2>
    <p>Welcome! This area is only for students.</p>
  </div>
</template>

<script setup>
// You can fetch student-only data here; axios will attach the bearer automatically.
</script> -->


<!-- <template>

  <div>
    <h2>Student Dashboard</h2>

    <div class="card">
        <h3>My Enrolled Courses</h3>
        <div v-if="loading.enrolled">Loading...</div>
        <div v-else-if="enrolledCourses.length === 0">
            <p>You are not enrolled in any courses. Browse available courses below.</p>
        </div>
        <ul v-else class="item-list">
            <li v-for="course in enrolledCourses" :key="course.id">
                <div>
                    <strong>{{ course.name }}</strong>
                    <p style="margin:0.25rem 0 0 0;font-size:0.9em;">by {{ course.instructorName }}</p>
                </div>
                <button class="btn small">View Modules</button>
            </li>
        </ul>
    </div>

    <div class="card" style="margin-top: 2rem;">
        <h3>Available Courses to Enroll</h3>
        <div v-if="loading.available">Loading...</div>
         <div v-else-if="availableCourses.length === 0">
            <p>There are no courses available for enrollment at this time.</p>
        </div>
        <ul v-else class="item-list">
            <li v-for="course in availableCourses" :key="course.id">
                <div>
                    <strong>{{ course.name }}</strong>
                    <p style="margin:0.25rem 0 0 0;font-size:0.9em;">by {{ course.instructorName }}</p>
                </div>
                <button
                  class="btn small primary"
                  :disabled="loading.enrollAction"
                  @click="handleEnroll(course.id)"
                >
                  Enroll
                </button>
            </li>
        </ul>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import * as courseService from '@/api/courseService';

const availableCourses = ref([]);
const enrolledCourses = ref([]);
const loading = reactive({
    available: false,
    enrolled: false,
    enrollAction: false,
});

async function fetchAllCourses() {
    loading.available = true;
    loading.enrolled = true;
    try {
        const [availableRes, enrolledRes] = await Promise.all([
            courseService.getAvailableCourses(),
            courseService.getEnrolledCourses()
        ]);
        availableCourses.value = availableRes.data;
        enrolledCourses.value = enrolledRes.data;
    } catch (error) {
        console.error("Failed to fetch courses:", error);
    } finally {
        loading.available = false;
        loading.enrolled = false;
    }
}

async function handleEnroll(courseId) {
    loading.enrollAction = true;
    try {
        await courseService.enrollInCourse(courseId);
        // Refresh both lists after successful enrollment
        await fetchAllCourses();
    } catch (error) {
        console.error("Failed to enroll in course:", error);
        alert("Enrollment failed. You may already be enrolled or an error occurred.");
    } finally {
        loading.enrollAction = false;
    }
}

onMounted(fetchAllCourses);
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
.item-list li:last-child { border-bottom: none; }
</style> -->

<template>
  <div>
    <h2>Student Dashboard</h2>

    <div class="card">
      <h3>My Progress Summary</h3>
      <div v-if="loading.progress">Loading progress...</div>
      <div v-else-if="progress.length" class="progress-grid">
        <div v-for="prog in progress" :key="prog.courseId" class="progress-card">
          <strong>{{ prog.courseName }}</strong>
          <p>{{ prog.totalModulesCompleted }} / {{ prog.totalModulesAvailable }} Modules Completed</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: prog.completionPercentage + '%' }"></div>
          </div>
          <span class="progress-percent">{{ prog.completionPercentage.toFixed(1) }}%</span>
        </div>
      </div>
      <p v-else>You have no progress to show yet. Enroll in a course to get started!</p>
    </div>

    <div class="card" style="margin-top: 2rem;">
        <h3>My Enrolled Courses</h3>
        <div v-if="loading.enrolled">Loading...</div>
        <div v-else-if="enrolledCourses.length === 0">
            <p>You are not enrolled in any courses. Browse available courses below.</p>
        </div>
        <ul v-else class="item-list">
            <li v-for="course in enrolledCourses" :key="course.id">
                <div>
                    <strong>{{ course.name }}</strong>
                    <p class="instructor-name">by {{ course.instructorName }}</p>
                </div>
                <div class="actions">
                  <button class="btn small danger-outline" @click="handleUnenroll(course.id)">Unenroll</button>
                  <button class="btn small primary" @click="viewCourseModules(course.id)">View Course</button>
                </div>
            </li>
        </ul>
    </div>

    <div class="card" style="margin-top: 2rem;">
        <h3>Available Courses to Enroll</h3>
        <div v-if="loading.available">Loading...</div>
         <div v-else-if="availableCourses.length === 0">
            <p>There are no courses available for enrollment at this time.</p>
        </div>
        <ul v-else class="item-list">
            <li v-for="course in availableCourses" :key="course.id">
                <div>
                    <strong>{{ course.name }}</strong>
                    <p class="instructor-name">by {{ course.instructorName }}</p>
                </div>
                <button
                  class="btn small primary"
                  :disabled="loading.enrollAction"
                  @click="handleEnroll(course.id)"
                >
                  Enroll
                </button>
            </li>
        </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '@/api/courseService';

const router = useRouter();

const availableCourses = ref([]);
const enrolledCourses = ref([]);
const progress = ref([]);

const loading = reactive({
    available: false,
    enrolled: false,
    enrollAction: false,
    progress: false,
});

async function fetchData() {
    loading.available = true;
    loading.enrolled = true;
    loading.progress = true;
    try {
        const [availableRes, enrolledRes, progressRes] = await Promise.all([
            api.getAvailableCourses(),
            api.getEnrolledCourses(),
            api.getMyProgress(),
        ]);
        availableCourses.value = Array.isArray(availableRes.data.data) ? availableRes.data.data : [];
        enrolledCourses.value = Array.isArray(enrolledRes.data.data) ? enrolledRes.data.data : [];
        progress.value = Array.isArray(progressRes.data.data) ? progressRes.data.data : [];

    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
    } finally {
        loading.available = false;
        loading.enrolled = false;
        loading.progress = false;
    }
}

async function handleEnroll(courseId) {
    loading.enrollAction = true;
    try {
        await api.enrollInCourse(courseId);
        // Refresh all data after successful enrollment
        await fetchData();
    } catch (error) {
        console.error("Failed to enroll in course:", error);
        alert("Enrollment failed. You may already be enrolled or an error occurred.");
    } finally {
        loading.enrollAction = false;
    }
}

async function handleUnenroll(courseId) {
  if (confirm('Are you sure you want to unenroll from this course? Your progress will be lost.')) {
    try {
      await api.unenrollFromCourse(courseId);
      await fetchData(); // Refresh all data
    } catch (error) {
      console.error('Failed to unenroll:', error);
      alert('Failed to unenroll from the course.');
    }
  }
}

function viewCourseModules(courseId) {
  router.push({ name: 'student-course-view', params: { id: courseId } });
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
.item-list li:last-child { border-bottom: none; }
.instructor-name {
  margin:0.25rem 0 0 0;
  font-size:0.9em;
  color: #718096;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.danger-outline {
  background-color: transparent;
  border: 1px solid #e53e3e;
  color: #e53e3e;
}
.danger-outline:hover {
  background-color: #e53e3e;
  color: white;
}
.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
.progress-card {
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 8px;
}
.progress-card p {
  font-size: 0.9em;
  color: #718096;
  margin: 0.5rem 0;
}
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}
.progress-fill {
  height: 100%;
  background-color: #4299e1;
  border-radius: 4px;
}
.progress-percent {
  font-size: 0.8em;
  font-weight: 500;
  color: #718096;
}
</style>