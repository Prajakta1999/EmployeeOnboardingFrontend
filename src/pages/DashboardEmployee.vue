<template>
  <AppLayout>
    <div class="employee-dashboard">
      <div class="container-fluid">
        <!-- Welcome Header -->
        <div class="row mb-4">
          <div class="col-md-8">
            <h2>Welcome, {{ employeeData.employeeName }}!</h2>
            <p class="text-muted mb-0">
              {{ employeeData.department }} • {{ employeeData.designation }}
              <span class="ms-2">
                <StatusBadge :status="employeeData.status" type="onboarding" />
              </span>
            </p>
          </div>
          <div class="col-md-4 text-end">
            <button @click="refreshDashboard" class="btn btn-outline-primary">
              <i class="fas fa-refresh me-2"></i>Refresh
            </button>
          </div>
        </div>

        <!-- Progress Overview -->
        <div class="row mb-4">
          <div class="col-md-8">
            <ProgressTracker
              :completion-percentage="employeeData.completionPercentage"
              :tasks="employeeData.pendingTasks.concat(employeeData.completedTasks)"
              :documents="employeeData.documents"
              :next-action="employeeData.nextAction"
            />
          </div>
          <div class="col-md-4">
            <div class="card bg-light">
              <div class="card-body text-center">
                <h6 class="card-subtitle mb-2 text-muted">Quick Stats</h6>
                <div class="row">
                  <div class="col-6">
                    <div class="fw-bold text-primary">{{ completedTasksCount }}</div>
                    <small class="text-muted">Tasks Done</small>
                  </div>
                  <div class="col-6">
                    <div class="fw-bold text-success">{{ approvedDocsCount }}</div>
                    <small class="text-muted">Docs Approved</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="card">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  :class="{ active: activeTab === 'tasks' }"
                  @click="activeTab = 'tasks'"
                  href="#"
                >
                  <i class="fas fa-tasks me-2"></i>
                  My Tasks 
                  <span v-if="pendingTasksCount > 0" class="badge bg-warning text-dark ms-2">
                    {{ pendingTasksCount }}
                  </span>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  :class="{ active: activeTab === 'documents' }"
                  @click="activeTab = 'documents'"
                  href="#"
                >
                  <i class="fas fa-file-alt me-2"></i>
                  Documents
                  <span v-if="rejectedDocsCount > 0" class="badge bg-danger ms-2">
                    {{ rejectedDocsCount }}
                  </span>
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  :class="{ active: activeTab === 'profile' }"
                  @click="activeTab = 'profile'"
                  href="#"
                >
                  <i class="fas fa-user me-2"></i>Profile
                </a>
              </li>
            </ul>
          </div>
          
          <div class="card-body">
            <!-- Tasks Tab -->
            <div v-if="activeTab === 'tasks'">
              <TaskList @task-completed="onTaskCompleted" ref="taskListComponent" />
            </div>

            <!-- Documents Tab -->
            <div v-if="activeTab === 'documents'">
              <div v-if="showDocumentUpload">
                <DocumentUpload 
                  @submitted="onDocumentsSubmitted"
                  @cancel="showDocumentUpload = false"
                />
              </div>
              <div v-else>
                <DocumentStatus 
                  @upload-documents="showDocumentUpload = true"
                  @update-document="updateDocument"
                  ref="documentStatusComponent"
                />
              </div>
            </div>

            <!-- Profile Tab -->
            <div v-if="activeTab === 'profile'">
              <EmployeeProfile :employee-data="employeeData" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ProgressTracker from '@/components/employee/ProgressTracker.vue'
import TaskList from '@/components/employee/TaskList.vue'
import DocumentUpload from '@/components/employee/DocumentUpload.vue'
import DocumentStatus from '@/components/employee/DocumentStatus.vue'
import EmployeeProfile from '@/components/employee/EmployeeProfile.vue'
import employeeService from '@/api/employeeService.js'

const activeTab = ref('tasks')
const showDocumentUpload = ref(false)
const employeeData = ref({
  employeeName: '',
  email: '',
  department: '',
  designation: '',
  status: 'PENDING',
  completionPercentage: 0,
  pendingTasks: [],
  completedTasks: [],
  documents: [],
  nextAction: ''
})

// Component refs
const taskListComponent = ref(null)
const documentStatusComponent = ref(null)

// Computed properties
const completedTasksCount = computed(() => employeeData.value.completedTasks?.length || 0)
const pendingTasksCount = computed(() => employeeData.value.pendingTasks?.length || 0)
const approvedDocsCount = computed(() => 
  employeeData.value.documents?.filter(doc => doc.status === 'APPROVED').length || 0
)
const rejectedDocsCount = computed(() => 
  employeeData.value.documents?.filter(doc => doc.status === 'REJECTED').length || 0
)

const loadDashboard = async () => {
  try {
    const response = await employeeService.getEmployeeDashboard()
    employeeData.value = response.data.data || employeeData.value
  } catch (error) {
    console.error('Error loading dashboard:', error)
  }
}

const refreshDashboard = () => {
  loadDashboard()
  taskListComponent.value?.refresh()
  documentStatusComponent.value?.refresh()
}

const onTaskCompleted = () => {
  loadDashboard() // Refresh dashboard data
}

const onDocumentsSubmitted = () => {
  showDocumentUpload.value = false
  loadDashboard()
  documentStatusComponent.value?.refresh()
}

const updateDocument = (document) => {
  // Handle document update logic
  console.log('Update document:', document)
  showDocumentUpload.value = true
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.employee-dashboard {
  padding: 20px;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  background-color: #f8f9fa;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.nav-tabs .nav-link:hover {
  color: #007bff;
  background-color: #f8f9fa;
}

.fw-bold {
  font-weight: 600;
}
</style>
