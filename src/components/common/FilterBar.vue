
<template>
  <div class="filter-bar card mb-4">
    <div class="card-body">
      <div class="row g-3 align-items-end">
        <div class="col-md-3">
          <label class="form-label">Department</label>
          <select v-model="filters.department" class="form-select">
            <option value="">All Departments</option>
            <option v-for="dept in departments" :key="dept" :value="dept">
              {{ dept }}
            </option>
          </select>
        </div>
        
        <div class="col-md-3">
          <label class="form-label">Status</label>
          <select v-model="filters.status" class="form-select">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_DOCUMENTS">Pending Documents</option>
          </select>
        </div>
        
        <div class="col-md-2">
          <label class="form-label">Joining From</label>
          <input 
            type="date" 
            v-model="filters.joiningDateFrom" 
            class="form-control"
          />
        </div>
        
        <div class="col-md-2">
          <label class="form-label">Joining To</label>
          <input 
            type="date" 
            v-model="filters.joiningDateTo" 
            class="form-control"
          />
        </div>
        
        <div class="col-md-2">
          <button @click="applyFilters" class="btn btn-primary w-100">
            <i class="fas fa-filter"></i> Filter
          </button>
          <button @click="clearFilters" class="btn btn-outline-secondary w-100 mt-2">
            <i class="fas fa-times"></i> Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import employeeService from '@/api/employeeService.js'

const emit = defineEmits(['filter'])

const departments = ref([])
const filters = reactive({
  department: '',
  status: '',
  joiningDateFrom: '',
  joiningDateTo: ''
})

const loadDepartments = async () => {
  try {
    const response = await employeeService.getAllDepartments()
    departments.value = response.data || []
  } catch (error) {
    console.error('Error loading departments:', error)
  }
}

const applyFilters = () => {
  emit('filter', { ...filters })
}

const clearFilters = () => {
  filters.department = ''
  filters.status = ''
  filters.joiningDateFrom = ''
  filters.joiningDateTo = ''
  emit('filter', { ...filters })
}

onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.filter-bar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-label {
  font-weight: 500;
  color: #495057;
}
</style>
