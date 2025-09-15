<template>
  <div class="hr-stats">
    <LoadingSpinner v-if="loading" text="Loading dashboard..." />
    
    <div v-else>
      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="card bg-primary text-white h-100">
            <div class="card-body text-center">
              <i class="fas fa-users fa-2x mb-2"></i>
              <h3 class="mb-1">{{ stats.totalEmployeesOnboarded }}</h3>
              <p class="mb-0">Total Onboarded</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="card bg-warning text-white h-100">
            <div class="card-body text-center">
              <i class="fas fa-tasks fa-2x mb-2"></i>
              <h3 class="mb-1">{{ stats.employeesWithPendingTasks }}</h3>
              <p class="mb-0">Pending Tasks</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="card bg-info text-white h-100">
            <div class="card-body text-center">
              <i class="fas fa-file-alt fa-2x mb-2"></i>
              <h3 class="mb-1">{{ stats.employeesWithPendingDocuments }}</h3>
              <p class="mb-0">Pending Documents</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="card bg-success text-white h-100">
            <div class="card-body text-center">
              <i class="fas fa-spinner fa-2x mb-2"></i>
              <h3 class="mb-1">{{ stats.employeesInProgress }}</h3>
              <p class="mb-0">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Onboardings -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-clock me-2"></i>
            Recent Onboarding Activity
          </h5>
        </div>
        <div class="card-body">
          <div v-if="stats.recentOnboardings && stats.recentOnboardings.length === 0" class="text-center py-4">
            <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
            <p class="text-muted">No recent onboarding activity</p>
          </div>
          
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="employee in stats.recentOnboardings" :key="employee.employeeId">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-2">
                        <i class="fas fa-user text-muted"></i>
                      </div>
                      <div>
                        <div class="fw-semibold">{{ employee.employeeName }}</div>
                        <small class="text-muted">{{ employee.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ employee.department }}</td>
                  <td>{{ formatDate(employee.joiningDate) }}</td>
                  <td>
                    <StatusBadge :status="employee.status" type="onboarding" />
                  </td>
                  <td>
                    <div class="progress" style="height: 8px;">
                      <div 
                        class="progress-bar"
                        :style="{ width: employee.completionPercentage + '%' }"
                        :class="getProgressClass(employee.completionPercentage)"
                      ></div>
                    </div>
                    <small class="text-muted">{{ employee.completionPercentage }}%</small>
                  </td>
                  <td>
                    <button 
                      @click="$emit('view-employee', employee)"
                      class="btn btn-sm btn-outline-primary"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import employeeService from '@/api/employeeService.js'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const emit = defineEmits(['view-employee'])

const stats = ref({
  totalEmployeesOnboarded: 0,
  employeesWithPendingTasks: 0,
  employeesWithPendingDocuments: 0,
  employeesInProgress: 0,
  recentOnboardings: []
})

const loading = ref(false)

const loadStats = async () => {
  try {
    loading.value = true
    const response = await employeeService.getHRDashboard()
    stats.value = response.data.data || stats.value
  } catch (error) {
    console.error('Error loading HR stats:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const getProgressClass = (percentage) => {
  if (percentage >= 100) return 'bg-success'
  if (percentage >= 75) return 'bg-info'
  if (percentage >= 50) return 'bg-warning'
  return 'bg-danger'
}

onMounted(() => {
  loadStats()
})

// Expose refresh function
defineExpose({
  refresh: loadStats
})
</script>

<style scoped>
.hr-stats {
  padding: 20px;
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-1px);
}

.avatar-sm {
  width: 32px;
  height: 32px;
}

.progress {
  min-width: 100px;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.fw-semibold {
  font-weight: 600;
}
</style>
