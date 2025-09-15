<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add Employee to Onboarding</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <!-- Employee Info Display -->
            <div class="card bg-light mb-4">
              <div class="card-body">
                <h6 class="card-subtitle mb-2">Employee Information</h6>
                <div class="row">
                  <div class="col-md-6">
                    <strong>Name:</strong> {{ employee.name }}
                  </div>
                  <div class="col-md-6">
                    <strong>Email:</strong> {{ employee.email }}
                  </div>
                  <div class="col-md-6 mt-2">
                    <strong>Phone:</strong> {{ employee.phoneNumber }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Onboarding Details Form -->
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="department" class="form-label">Department *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="department"
                    v-model="formData.department"
                    required
                    :class="{ 'is-invalid': errors.department }"
                  />
                  <div v-if="errors.department" class="invalid-feedback">
                    {{ errors.department }}
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="designation" class="form-label">Designation *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="designation"
                    v-model="formData.designation"
                    required
                    :class="{ 'is-invalid': errors.designation }"
                  />
                  <div v-if="errors.designation" class="invalid-feedback">
                    {{ errors.designation }}
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="employeeId" class="form-label">Employee ID *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="employeeId"
                    v-model="formData.employeeId"
                    required
                    :class="{ 'is-invalid': errors.employeeId }"
                  />
                  <div v-if="errors.employeeId" class="invalid-feedback">
                    {{ errors.employeeId }}
                  </div>
                </div>
              </div>
              
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="joiningDate" class="form-label">Joining Date *</label>
                  <input
                    type="date"
                    class="form-control"
                    id="joiningDate"
                    v-model="formData.joiningDate"
                    required
                    :class="{ 'is-invalid': errors.joiningDate }"
                  />
                  <div v-if="errors.joiningDate" class="invalid-feedback">
                    {{ errors.joiningDate }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ submitting ? 'Adding...' : 'Add Employee' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import employeeService from '@/api/employeeService.js'

const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const submitting = ref(false)
const errors = ref({})

const formData = reactive({
  userId: props.employee.userId,
  department: '',
  designation: '',
  employeeId: '',
  joiningDate: ''
})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.department.trim()) {
    errors.value.department = 'Department is required'
    isValid = false
  }

  if (!formData.designation.trim()) {
    errors.value.designation = 'Designation is required'
    isValid = false
  }

  if (!formData.employeeId.trim()) {
    errors.value.employeeId = 'Employee ID is required'
    isValid = false
  }

  if (!formData.joiningDate) {
    errors.value.joiningDate = 'Joining date is required'
    isValid = false
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) return

  try {
    submitting.value = true
    
    await employeeService.addEmployeeToOnboarding({
      userId: formData.userId,
      department: formData.department,
      designation: formData.designation,
      employeeId: formData.employeeId,
      joiningDate: formData.joiningDate
    })

    emit('success')
    
  } catch (error) {
    console.error('Error adding employee to onboarding:', error)
    
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`)
    } else {
      alert('Failed to add employee to onboarding. Please try again.')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal {
  z-index: 1050;
}

.card-subtitle {
  color: #6c757d;
  font-weight: 600;
}

.form-label {
  font-weight: 500;
  color: #2c3e50;
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
