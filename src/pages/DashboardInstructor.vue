<!-- <template>
  <div>
    <div class="header">
      <h2>Instructor Dashboard</h2>
      <button class="btn primary" @click="openCourseModal(null)">Create New Course</button>
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
    
    <CourseForm
      v-if="showCourseForm"
      :course="editingCourse"
      :loading="loading.form"
      @close="closeCourseModal"
      @submit="handleCourseSubmit"
    />
    
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import * as courseService from '@/api/courseService';
import CourseForm from '@/components/instructor/CourseForm.vue';
import ModuleList from '@/components/instructor/ModuleList.vue';

// State Management
const courses = ref([]);
const modules = ref([]);
const selectedCourse = ref(null);
const editingCourse = ref(null);
const showCourseForm = ref(false);
const loading = reactive({ courses: false, modules: false, form: false });

// --- Data Fetching ---
async function fetchCourses() {
  loading.courses = true;
  try {
    const { data } = await courseService.getInstructorCourses();
    
    // Pro Tip: Uncomment this line to see the exact structure of your API response!
    // console.log('API Response for courses:', data);

    // FIX: Access the nested 'data.data' array and ensure it's an array before filtering.
    const courseList = Array.isArray(data.data) ? data.data : [];
    courses.value = courseList.filter(course => course);

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
        // Assuming module responses are also nested
        const { data } = await courseService.getInstructorModules(course.id);
        const moduleList = Array.isArray(data.data) ? data.data : [];
        modules.value = moduleList;
    } catch(error) {
        console.error("Failed to fetch modules:", error);
    } finally {
        loading.modules = false;
    }
}

onMounted(fetchCourses);

// --- Course Actions ---
function openCourseModal(course) {
  editingCourse.value = course;
  showCourseForm.value = true;
}

function closeCourseModal() {
  showCourseForm.value = false;
  editingCourse.value = null;
}

async function handleCourseSubmit(courseData) {
  loading.form = true;
  try {
    if (editingCourse.value) {
      await courseService.updateCourse(editingCourse.value.id, courseData);
    } else {
      await courseService.createCourse(courseData);
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
  if (confirm('Are you sure you want to delete this course and all its modules?')) {
    try {
      await courseService.deleteCourse(courseId);
      await fetchCourses();
      if(selectedCourse.value?.id === courseId) {
          selectedCourse.value = null;
          modules.value = [];
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  }
}

// --- Module Actions ---
function openModuleModal(module) {
    alert('Please create and wire up ModuleForm.vue to enable this functionality.');
}

async function handleDeleteModule(moduleId) {
    if (confirm('Are you sure you want to delete this module?')) {
        try {
            await courseService.deleteModule(moduleId);
            await viewModules(selectedCourse.value);
        } catch (error) {
            console.error("Failed to delete module:", error);
        }
    }
}

async function handlePublishModule(moduleId, shouldPublish) {
    try {
        if(shouldPublish) {
            await courseService.publishModule(moduleId);
        } else {
            await courseService.unpublishModule(moduleId);
        }
        await viewModules(selectedCourse.value);
    } catch (error) {
        console.error("Failed to toggle publish state:", error);
    }
}
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
</style> -->


<template>
  <div>
    <div class="header">
      <h2>Instructor Dashboard</h2>
      <button class="btn primary" @click="openCourseModal(null)">Create New Course</button>
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
    
    <CourseForm
      v-if="showCourseForm"
      :course="editingCourse"
      :loading="loading.form"
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
import * as courseService from '@/api/courseService';
import CourseForm from '@/components/instructor/CourseForm.vue';
import ModuleList from '@/components/instructor/ModuleList.vue';
import ModuleForm from '@/components/instructor/ModuleForm.vue'; // (NEW) Import ModuleForm

// State Management
const courses = ref([]);
const modules = ref([]);
const selectedCourse = ref(null);
const editingCourse = ref(null);
const showCourseForm = ref(false);
const loading = reactive({ courses: false, modules: false, form: false });

// (NEW) State for Module Form
const editingModule = ref(null);
const showModuleForm = ref(false);


// --- Data Fetching ---
async function fetchCourses() {
  loading.courses = true;
  try {
    const { data } = await courseService.getInstructorCourses();
    const courseList = Array.isArray(data.data) ? data.data : [];
    courses.value = courseList.filter(course => course);
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
        const moduleList = Array.isArray(data.data) ? data.data : [];
        modules.value = moduleList;
    } catch(error) {
        console.error("Failed to fetch modules:", error);
    } finally {
        loading.modules = false;
    }
}

onMounted(fetchCourses);

// --- Course Actions ---
function openCourseModal(course) {
  editingCourse.value = course;
  showCourseForm.value = true;
}

function closeCourseModal() {
  showCourseForm.value = false;
  editingCourse.value = null;
}

async function handleCourseSubmit(courseData) {
  loading.form = true;
  try {
    if (editingCourse.value) {
      await courseService.updateCourse(editingCourse.value.id, courseData);
    } else {
      await courseService.createCourse(courseData);
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
  if (confirm('Are you sure you want to delete this course and all its modules?')) {
    try {
      await courseService.deleteCourse(courseId);
      await fetchCourses();
      if(selectedCourse.value?.id === courseId) {
          selectedCourse.value = null;
          modules.value = [];
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  }
}

// --- Module Actions ---

// (UPDATED) Open/close functions for the module modal
function openModuleModal(module) {
    editingModule.value = module; // null for create, module object for edit
    showModuleForm.value = true;
}

function closeModuleModal() {
    showModuleForm.value = false;
    editingModule.value = null;
}

// (NEW) Handle module form submission for create and update
async function handleModuleSubmit(moduleData) {
    loading.form = true;
    try {
        if (editingModule.value) {
            // Update existing module
            await courseService.updateModule(editingModule.value.id, moduleData);
        } else {
            // Create new module
            const payload = { ...moduleData, courseId: selectedCourse.value.id };
            await courseService.createModule(payload);
        }
        await viewModules(selectedCourse.value); // Refresh module list
        await fetchCourses(); // Refresh course list to update module counts
        closeModuleModal();
    } catch (error) {
        console.error("Failed to save module:", error);
        alert("Failed to save module. Check console for details.");
    } finally {
        loading.form = false;
    }
}

async function handleDeleteModule(moduleId) {
    if (confirm('Are you sure you want to delete this module?')) {
        try {
            await courseService.deleteModule(moduleId);
            await viewModules(selectedCourse.value);
            await fetchCourses(); // Refresh course list to update module counts
        } catch (error) {
            console.error("Failed to delete module:", error);
        }
    }
}

async function handlePublishModule(moduleId, shouldPublish) {
    try {
        if(shouldPublish) {
            await courseService.publishModule(moduleId);
        } else {
            await courseService.unpublishModule(moduleId);
        }
        await viewModules(selectedCourse.value);
        await fetchCourses(); // Refresh course list to update module counts
    } catch (error) {
        console.error("Failed to toggle publish state:", error);
    }
}
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
</style>