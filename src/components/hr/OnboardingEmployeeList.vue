<template>
  <div class="onboarding-employee-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Employees in Onboarding</h3>
      <button @click="refreshList" class="btn btn-outline-primary">
        <i class="fas fa-refresh"></i> Refresh
      </button>
    </div>

    <!-- Filter Bar -->
    <FilterBar @filter="applyFilters" />

    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="filteredEmployees.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      No employees found in onboarding process.
    </div>

    <div v-else class="row">
      <div v-for="employee in filteredEmployees" :key="employee.employeeId" class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 class="card-title">{{ employee.employeeName }}</h5>
                <p class="text-muted mb-1">{{ employee.department }} • {{ employee.designation }}</p>
                <p class="text-muted mb-0">
                  <i class="fas fa-id-card me-1"></i>{{ employee.employeeIdNumber }}
                </p>
              </div>
              <StatusBadge :status="employee.status" type="onboarding" />
            </div>

            <div class="row text-center mb-3">
              <div class="col-4">
                <div class="bg-light rounded p-2">
                  <div class="fw-bold text-primary">{{ employee.completionPercentage }}%</div>
                  <small class="text-muted">Complete</small>
                </div>
              </div>
              <div class="col-4">
                <div class="bg-light rounded p-2">
                  <div class="fw-bold text-success">{{ employee.completedTasks }}/{{ employee.totalTasks }}</div>
                  <small class="text-muted">Tasks</small>
                </div>
              </div>
              <div class="col-4">
                <div class="bg-light rounded p-2">
                  <div class="fw-bold text-info">{{ employee.approvedDocuments }}/{{ employee.totalDocuments }}</div>
                  <small class="text-muted">Documents</small>
                </div>
              </div>
            </div>

            <div class="progress mb-3" style="height: 8px;">
              <div 
                class="progress-bar" 
                :style="{ width: employee.completionPercentage + '%' }"
                :class="getProgressBarClass(employee.completionPercentage)"
              ></div>
            </div>

            <div class="d-flex gap-2">
              <button 
                @click="viewDetails(employee)" 
                class="btn btn-outline-primary btn-sm flex-fill"
              >
                <i class="fas fa-eye"></i> View Details
              </button>
              <button 
                v-if="employee.status === 'IN_PROGRESS' && employee.completionPercentage === 100"
                @click="completeOnboarding(employee)"
                class="btn btn-success btn-sm"
              >
                <i class="fas fa-check"></i> Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      title="Complete Onboarding"
      message="Are you sure you want to mark this employee's onboarding as complete?"
      confirmText="Complete"
      type="primary"
      :loading="completing"
      @confirm="confirmComplete"
      @cancel="cancelComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import employeeService from '@/api/employeeService.js'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const router = useRouter()

const employees = ref([])
const loading = ref(false)
const filters = ref({})
const showConfirmDialog = ref(false)
const selectedEmployee = ref(null)
const completing = ref(false)

const filteredEmployees = computed(() => {
  return employees.value.filter(employee => {
    if (filters.value.department && employee.department !== filters.value.department) {
      return false
    }
    if (filters.value.status && employee.status !== filters.value.status) {
      return false
    }
    // Add date filtering logic here if needed
    return true
  })
})

const loadEmployees = async () => {
  try {
    loading.value = true
    const response = await employeeService.getAllOnboardingEmployees()
    employees.value = response.data.data || []
  } catch (error) {
    console.error('Error loading onboarding employees:', error)
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  loadEmployees()
}

const applyFilters = (newFilters) => {
  filters.value = newFilters
}

const getProgressBarClass = (percentage) => {
  if (percentage >= 100) return 'bg-success'
  if (percentage >= 75) return 'bg-info'
  if (percentage >= 50) return 'bg-warning'
  return 'bg-danger'
}

const viewDetails = (employee) => {
  router.push(`/hr/employees/${employee.employeeId}/details`)
}

const completeOnboarding = (employee) => {
  selectedEmployee.value = employee
  showConfirmDialog.value = true
}

const confirmComplete = async () => {
  try {
    completing.value = true
    await employeeService.completeEmployeeOnboarding(selectedEmployee.value.employeeId)
    showConfirmDialog.value = false
    selectedEmployee.value = null
    loadEmployees() // Refresh list
  } catch (error) {
    console.error('Error completing onboarding:', error)
    alert('Failed to complete onboarding. Please try again.')
  } finally {
    completing.value = false
  }
}

const cancelComplete = () => {
  showConfirmDialog.value = false
  selectedEmployee.value = null
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.onboarding-employee-list {
  padding: 20px;
}

.card {
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e0e0e0;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.progress-bar {
  transition: width 0.3s ease;
}
</style>
