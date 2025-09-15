<template>
  <div class="employee-profile">
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">
              <i class="fas fa-user me-2"></i>Profile Information
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Full Name</label>
                <p class="fw-semibold">{{ employeeData.employeeName }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Email Address</label>
                <p class="fw-semibold">{{ employeeData.email }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Phone Number</label>
                <p class="fw-semibold">{{ employeeData.phoneNumber || 'Not provided' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Employee ID</label>
                <p class="fw-semibold">{{ employeeData.employeeIdNumber }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Department</label>
                <p class="fw-semibold">{{ employeeData.department }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Designation</label>
                <p class="fw-semibold">{{ employeeData.designation }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Joining Date</label>
                <p class="fw-semibold">{{ formatDate(employeeData.joiningDate) }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label text-muted">Onboarding Status</label>
                <p><StatusBadge :status="employeeData.status" type="onboarding" /></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="fas fa-chart-pie me-2"></i>Onboarding Summary
            </h6>
          </div>
          <div class="card-body text-center">
            <div class="mb-3">
              <div class="progress-circle-small mx-auto" :style="{ '--progress': employeeData.completionPercentage }">
                <span class="fw-bold">{{ employeeData.completionPercentage }}%</span>
              </div>
            </div>
            
            <div class="row text-center">
              <div class="col-6">
                <div class="border-end">
                  <div class="fw-bold text-primary">{{ completedTasksCount }}</div>
                  <small class="text-muted">Tasks Done</small>
                </div>
              </div>
              <div class="col-6">
                <div class="fw-bold text-success">{{ approvedDocsCount }}</div>
                <small class="text-muted">Docs Approved</small>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card mt-3">
          <div class="card-header">
            <h6 class="mb-0">
              <i class="fas fa-info-circle me-2"></i>Quick Actions
            </h6>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary btn-sm">
                <i class="fas fa-download me-2"></i>Download Profile
              </button>
              <button class="btn btn-outline-info btn-sm">
                <i class="fas fa-envelope me-2"></i>Contact HR
              </button>
              <button class="btn btn-outline-secondary btn-sm">
                <i class="fas fa-book me-2"></i>Company Handbook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  employeeData: {
    type: Object,
    default: () => ({})
  }
})

const completedTasksCount = computed(() => props.employeeData.completedTasks?.length || 0)
const approvedDocsCount = computed(() => 
  props.employeeData.documents?.filter(doc => doc.status === 'APPROVED').length || 0
)

const formatDate = (dateString) => {
  if (!dateString) return 'Not set'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.employee-profile .form-label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.fw-semibold {
  font-weight: 600;
}

.progress-circle-small {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
    #007bff 0deg,
    #007bff calc(var(--progress) * 3.6deg),
    #e9ecef calc(var(--progress) * 3.6deg),
    #e9ecef 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-circle-small::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: white;
}

.progress-circle-small span {
  position: relative;
  z-index: 1;
  font-size: 0.9rem;
}
</style>
