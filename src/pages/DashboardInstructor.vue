<template>
  <div>
    <div class="header">
      <h2>Instructor Dashboard</h2>
      <button class="btn primary" @click="openStudentModal()">Create New Course</button>
    </div>

    <div v-if="loading.courses" class="card">Loading courses...</div>
    <div v-else-if="courses.length === 0" class="card">
      <p>You have not created any courses yet. Click the button above to get started.</p>
    </div>

    <div v-else class="card-grid">
      <div v-for="course in courses" :key="course.id" class="card">
        <h3>{{ course.name }}</h3>
        <p>{{ course.description }}</p>
        <p>
          Modules: {{ course.publishedModules }} Published / {{ course.totalModules }} Total
        </p>
        <div class="actions">
          <button class="btn" @click="viewModules(course)">Manage Modules</button>
          <button class="btn" @click="openCourseModal(course)">Edit</button>
          <button class="btn danger" @click="handleDeleteCourse(course.id)">Delete</button>
        </div>
      </div>
    </div>

    <ModuleList
      v-if="selectedCourse"
      :modules="modules"
      :courseName="selectedCourse.name"
      @add="openModuleModal(null)"
      @edit="openModuleModal"
      @delete="handleDeleteModule"
      @publish="handlePublishModule"
      style="margin-top: 2rem;"
    />

    <!-- Student Selection Modal -->
    <div v-if="showStudentModal" class="modal-backdrop" @click="$emit('closeStudentModal')">
      <div class="modal" @click.stop>
        <h3>Select Students for Course</h3>
        <div v-if="loading.students">Loading students...</div>
        <div v-else>
          <table class="student-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>

              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td><input type="checkbox" v-model="selectedStudents" :value="student" /></td>
                <td>{{ student.name }}</td>
                <td>{{ student.email }}</td>
                <td>{{ student.phoneNumber || '-' }}</td>

              </tr>
            </tbody>
          </table>
          <div style="margin-top:1rem; display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn" @click="closeStudentModal">Cancel</button>
            <button class="btn primary" @click="addStudentsToCourse">Add Students</button>
          </div>
        </div>
      </div>
    </div>

    <CourseForm
      v-if="showCourseForm"
      :course="editingCourse"
      :loading="loading.form"
      :students="courseStudents"
      @close="closeCourseModal"
      @submit="handleCourseSubmit"
    />

    <ModuleForm
      v-if="showModuleForm"
      :module="editingModule"
      :loading="loading.form"
      @close="closeModuleModal"
      @submit="handleModuleSubmit"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import * as courseService from '@/api/courseService';
import CourseForm from '@/components/instructor/CourseForm.vue';
import ModuleList from '@/components/instructor/ModuleList.vue';
import ModuleForm from '@/components/instructor/ModuleForm.vue';
import { useAuthStore } from '@/store/auth';

const auth = useAuthStore();

// --- State ---
const courses = ref([]);
const modules = ref([]);
const selectedCourse = ref(null);
const editingCourse = ref(null);
const showCourseForm = ref(false);
const loading = reactive({ courses: false, modules: false, form: false, students: false });
const editingModule = ref(null);
const showModuleForm = ref(false);

// Student state
const students = ref([]);
const showStudentModal = ref(false);
const selectedStudents = ref([]);
const courseStudents = ref([]); // pass to CourseForm

// --- Fetch Courses & Modules ---
async function fetchCourses() {
  loading.courses = true;
  try {
    const { data } = await courseService.getInstructorCourses();
    courses.value = Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  } finally {
    loading.courses = false;
  }
}

async function viewModules(course) {
  selectedCourse.value = course;
  loading.modules = true;
  try {
    const { data } = await courseService.getInstructorModules(course.id);
    modules.value = Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("Failed to fetch modules:", error);
  } finally {
    loading.modules = false;
  }
}

// --- Student Modal ---
function openStudentModal() {
  showStudentModal.value = true;
  fetchStudents();
}

function closeStudentModal() {
  showStudentModal.value = false;
  selectedStudents.value = [];
}

function addStudentsToCourse() {
  courseStudents.value = [...selectedStudents.value];
  closeStudentModal();
  openCourseModal(null); // now open course form with students
}

// --- Fetch Students ---
async function fetchStudents() {
  loading.students = true;
  try {
    if (!auth.accessToken) return;
    const response = await axios.get('http://localhost:8080/api/v1/students', {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    // FIX: extract the 'data' field from API response
    students.value = Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error("Failed to fetch students:", error.response || error);
  } finally {
    loading.students = false;
  }
}


// --- Course Actions ---
function openCourseModal(course) {
  editingCourse.value = course;
  showCourseForm.value = true;
}

function closeCourseModal() {
  showCourseForm.value = false;
  editingCourse.value = null;
  courseStudents.value = [];
}

async function handleCourseSubmit(courseData) {
  loading.form = true;
  try {
    const payload = { ...courseData, students: courseStudents.value.map(s => s.id) };
    if (editingCourse.value) {
      await courseService.updateCourse(editingCourse.value.id, payload);
    } else {
      await courseService.createCourse(payload);
    }
    await fetchCourses();
    closeCourseModal();
  } catch (error) {
    console.error("Failed to save course:", error);
  } finally {
    loading.form = false;
  }
}

async function handleDeleteCourse(courseId) {
  if (!confirm('Are you sure you want to delete this course?')) return;
  try {
    await courseService.deleteCourse(courseId);
    await fetchCourses();
    if (selectedCourse.value?.id === courseId) {
      selectedCourse.value = null;
      modules.value = [];
    }
  } catch (error) {
    console.error("Failed to delete course:", error);
  }
}

// --- Module Actions ---
function openModuleModal(module) {
  editingModule.value = module;
  showModuleForm.value = true;
}

function closeModuleModal() {
  showModuleForm.value = false;
  editingModule.value = null;
}

async function handleModuleSubmit(moduleData) {
  loading.form = true;
  try {
    if (editingModule.value) {
      await courseService.updateModule(editingModule.value.id, moduleData);
    } else {
      await courseService.createModule({ ...moduleData, courseId: selectedCourse.value.id });
    }
    await viewModules(selectedCourse.value);
    await fetchCourses();
    closeModuleModal();
  } catch (error) {
    console.error("Failed to save module:", error);
  } finally {
    loading.form = false;
  }
}

async function handleDeleteModule(moduleId) {
  if (!confirm('Are you sure you want to delete this module?')) return;
  try {
    await courseService.deleteModule(moduleId);
    await viewModules(selectedCourse.value);
    await fetchCourses();
  } catch (error) {
    console.error("Failed to delete module:", error);
  }
}

async function handlePublishModule(moduleId, shouldPublish) {
  try {
    if (shouldPublish) await courseService.publishModule(moduleId);
    else await courseService.unpublishModule(moduleId);
    await viewModules(selectedCourse.value);
    await fetchCourses();
  } catch (error) {
    console.error("Failed to toggle publish state:", error);
  }
}

onMounted(fetchCourses);
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.student-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.student-table th,
.student-table td {
  border: 1px solid #ccc;
  padding: 0.5rem;
  text-align: left;
}
.student-table th {
  background-color: #f5f5f5;
}
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; z-index:1000;
}
.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
}
</style>
