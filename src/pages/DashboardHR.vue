<template>
  <div>
    <div class="header">
      <h2>HR Dashboard</h2>
      <button class="btn primary" @click="openEmployeeModal()">Assign New Task</button>
    </div>

    <div v-if="loading.tasks" class="card">Loading tasks...</div>
    <div v-else-if="tasks.length === 0" class="card">
      <p>No onboarding tasks created yet.</p>
    </div>

    <div v-else class="card-grid">
      <div v-for="task in tasks" :key="task.id" class="card">
        <h3>{{ task.name }}</h3>
        <p>{{ task.description }}</p>
        <p>Modules: {{ task.publishedModules }} Published / {{ task.totalModules }} Total</p>
        <div class="actions">
          <button class="btn" @click="viewModules(task)">Manage Modules</button>
          <button class="btn" @click="openTaskForm(task)">Edit</button>
          <button class="btn danger" @click="deleteTask(task.id)">Delete</button>
        </div>
      </div>
    </div>

    <ModuleList
      v-if="selectedTask"
      :modules="modules"
      :taskName="selectedTask.name"
      @add="openModuleForm(null)"
      @edit="openModuleForm"
      @delete="deleteModule"
      @publish="togglePublishModule"
      style="margin-top: 2rem;"
    />

    <!-- Employee Selection Modal -->
    <div v-if="showEmployeeModal" class="modal-backdrop" @click="closeEmployeeModal">
      <div class="modal" @click.stop>
        <h3>Select Employees for Task</h3>
        <div v-if="loading.employees">Loading employees...</div>
        <div v-else>
          <table class="emp-table">
            <thead>
              <tr><th></th><th>Name</th><th>Email</th><th>Phone</th></tr>
            </thead>
            <tbody>
              <tr v-for="emp in employees" :key="emp.id">
                <td><input type="checkbox" v-model="selectedEmployees" :value="emp" /></td>
                <td>{{ emp.name }}</td>
                <td>{{ emp.email }}</td>
                <td>{{ emp.phone || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top:1rem; display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn" @click="closeEmployeeModal">Cancel</button>
            <button class="btn primary" @click="assignEmployees">Assign</button>
          </div>
        </div>
      </div>
    </div>

    <TaskForm
      v-if="showTaskForm"
      :task="editingTask"
      :employees="taskEmployees"
      :loading="loading.form"
      @close="closeTaskForm"
      @submit="submitTask"
    />

    <OnboardingModuleForm
      v-if="showModuleForm"
      :module="editingModule"
      :loading="loading.form"
      @close="closeModuleForm"
      @submit="submitModule"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import * as api from '@/api/taskService';
import TaskForm from '@/components/hr/TaskForm.vue';
import ModuleList from '@/components/hr/ModuleList.vue';
import OnboardingModuleForm from '@/components/hr/OnboardingModuleForm.vue';

const auth = useAuthStore();

const tasks = ref([]);
const modules = ref([]);
const selectedTask = ref(null);

const editingTask = ref(null);
const showTaskForm = ref(false);

const editingModule = ref(null);
const showModuleForm = ref(false);

const employees = ref([]);
const selectedEmployees = ref([]);
const taskEmployees = ref([]);
const showEmployeeModal = ref(false);

const loading = reactive({ tasks: false, modules: false, form: false, employees: false });

async function fetchTasks() {
  loading.tasks = true;
  try {
    const { data } = await api.getHrTasks();
    tasks.value = Array.isArray(data.data) ? data.data : [];
  } finally {
    loading.tasks = false;
  }
}

async function viewModules(task) {
  selectedTask.value = task;
  loading.modules = true;
  try {
    const { data } = await api.getHrModules(task.id);
    modules.value = Array.isArray(data.data) ? data.data : [];
  } finally {
    loading.modules = false;
  }
}

// Employee Modal
function openEmployeeModal() { showEmployeeModal.value = true; fetchEmployees(); }
function closeEmployeeModal() { showEmployeeModal.value = false; selectedEmployees.value = []; }
async function fetchEmployees() {
  loading.employees = true;
  try {
    const res = await axios.get('http://localhost:8080/api/v1/students', {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    employees.value = Array.isArray(res.data.data) ? res.data.data : [];
  } finally { loading.employees = false; }
}
function assignEmployees() {
  taskEmployees.value = [...selectedEmployees.value];
  closeEmployeeModal();
  openTaskForm(null);
}

// Task actions
function openTaskForm(task) { editingTask.value = task; showTaskForm.value = true; }
function closeTaskForm() { showTaskForm.value = false; editingTask.value = null; taskEmployees.value = []; }
async function submitTask(taskData) {
  loading.form = true;
  try {
    const payload = { ...taskData, employees: taskEmployees.value.map(e => e.id) };
    if (editingTask.value) await api.updateTask(editingTask.value.id, payload);
    else await api.createTask(payload);
    await fetchTasks(); closeTaskForm();
  } finally { loading.form = false; }
}
async function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  await api.deleteTask(id);
  await fetchTasks();
  if (selectedTask.value?.id === id) { selectedTask.value = null; modules.value = []; }
}

// Module actions
function openModuleForm(module) { editingModule.value = module; showModuleForm.value = true; }
function closeModuleForm() { showModuleForm.value = false; editingModule.value = null; }
async function submitModule(mod) {
  loading.form = true;
  try {
    if (editingModule.value) await api.updateModule(editingModule.value.id, mod);
    else await api.createModule({ ...mod, taskId: selectedTask.value.id });
    await viewModules(selectedTask.value);
    await fetchTasks();
    closeModuleForm();
  } finally { loading.form = false; }
}
async function deleteModule(id) {
  if (!confirm('Delete this module?')) return;
  await api.deleteModule(id);
  await viewModules(selectedTask.value);
  await fetchTasks();
}
async function togglePublishModule(id, publish) {
  if (publish) await api.publishModule(id);
  else await api.unpublishModule(id);
  await viewModules(selectedTask.value);
  await fetchTasks();
}

onMounted(fetchTasks);
</script>

<style scoped>
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; }
.card-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px,1fr)); gap:1.5rem; }
.actions { margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap; }
.emp-table { width:100%; border-collapse:collapse; margin-top:1rem; }
.emp-table th, .emp-table td { border:1px solid #ccc; padding:0.5rem; }
.emp-table th { background:#f5f5f5; }
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000; }
.modal { background:white; padding:2rem; border-radius:8px; max-width:600px; width:100%; }
</style>
