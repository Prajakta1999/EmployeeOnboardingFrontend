<template>
  <div class="employee-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Available Employees</h3>
      <button @click="refreshList" class="btn btn-outline-primary">
        <i class="fas fa-refresh"></i> Refresh
      </button>
    </div>

    <LoadingSpinner v-if="loading" />
    
    <div v-else-if="employees.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      No employees available for onboarding.
    </div>

    <div v-else class="row">
      <div v-for="employee in employees" :key="employee.userId" class="col-md-6 mb-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title">{{ employee.name }}</h5>
                <p class="card-text text-muted">{{ employee.email }}</p>
                <p class="card-text">
                  <small class="text-muted">
                    <i class="fas fa-phone"></i> {{ employee.phoneNumber }}
                  </small>
                </p>
              </div>
              <div class="text-end">
                <button 
                  @click="selectEmployee(employee)" 
                  class="btn btn-primary btn-sm"
                >
                  <i class="fas fa-plus"></i> Add to Onboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <AddEmployeeModal
      v-if="selectedEmployee"
      :employee="selectedEmployee"
      @close="selectedEmployee = null"
      @success="onEmployeeAdded"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import employeeService from '@/api/employeeService.js'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AddEmployeeModal from './AddEmployeeModal.vue'

const employees = ref([])
const loading = ref(false)
const selectedEmployee = ref(null)

const loadEmployees = async () => {
  try {
    loading.value = true
    const response = await employeeService.getAvailableEmployees()
    employees.value = response.data.data || []
  } catch (error) {
    console.error('Error loading employees:', error)
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  loadEmployees()
}

const selectEmployee = (employee) => {
  selectedEmployee.value = employee
}

const onEmployeeAdded = () => {
  selectedEmployee.value = null
  loadEmployees() // Refresh the list
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.employee-list {
  padding: 20px;
}

.card {
  transition: transform 0.2s;
  border: 1px solid #e0e0e0;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
}

.btn-primary:hover {
  background-color: #2980b9;
  border-color: #2980b9;
}
</style>
