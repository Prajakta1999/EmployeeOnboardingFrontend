<!-- <template>
  <div class="card">
    <h2>Student Dashboard</h2>
    <p>Welcome! This area is only for students.</p>
  </div>
</template>

<script setup>
// You can fetch student-only data here; axios will attach the bearer automatically.
</script> -->


<template>
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
</style>