<template>
  <div class="card task-card" :class="{ 'completed': task.status === 'COMPLETED' }">
    <div class="card-body">
      <div class="row align-items-center">
        <div class="col-md-1 text-center">
          <div class="task-icon">
            <i :class="getTaskIcon(task.taskType)" :style="{ color: getTaskColor(task.status) }"></i>
          </div>
        </div>
        
        <div class="col-md-7">
          <h6 class="mb-1">{{ task.taskName }}</h6>
          <p class="text-muted mb-2">{{ task.description }}</p>
          <StatusBadge :status="task.status" type="task" />
          
          <div v-if="task.completedAt" class="mt-2">
            <small class="text-success">
              <i class="fas fa-check me-1"></i>
              Completed on {{ formatDate(task.completedAt) }}
            </small>
          </div>
          
          <div v-if="task.notes" class="mt-2">
            <small class="text-muted">
              <strong>Notes:</strong> {{ task.notes }}
            </small>
          </div>
        </div>
        
        <div class="col-md-2 text-center">
          <div v-if="task.mandatory" class="mb-2">
            <span class="badge bg-warning text-dark">Required</span>
          </div>
        </div>
        
        <div class="col-md-2 text-end">
          <button
            v-if="task.status === 'PENDING'"
            @click="handleTaskAction(task)"
            class="btn btn-primary"
            :disabled="completing"
          >
            <span v-if="completing" class="spinner-border spinner-border-sm me-2"></span>
            {{ getActionButtonText(task.taskType) }}
          </button>
          
          <div v-else class="text-success">
            <i class="fas fa-check-circle fa-2x"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete'])

const completing = ref(false)

const getTaskIcon = (taskType) => {
  switch (taskType) {
    case 'POLICY_ACKNOWLEDGMENT': return 'fas fa-file-contract fa-2x'
    case 'ORIENTATION_SESSION': return 'fas fa-chalkboard-teacher fa-2x'
    case 'DOCUMENT_SUBMISSION': return 'fas fa-upload fa-2x'
    default: return 'fas fa-tasks fa-2x'
  }
}

const getTaskColor = (status) => {
  return status === 'COMPLETED' ? '#28a745' : '#6c757d'
}

const getActionButtonText = (taskType) => {
  switch (taskType) {
    case 'POLICY_ACKNOWLEDGMENT': return 'Acknowledge'
    case 'ORIENTATION_SESSION': return 'Mark Attended'
    case 'DOCUMENT_SUBMISSION': return 'Mark Submitted'
    default: return 'Complete'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleTaskAction = async (task) => {
  // Show confirmation for certain tasks
  if (task.taskType === 'POLICY_ACKNOWLEDGMENT') {
    const confirmed = confirm('Do you confirm that you have read and understood the company policies?')
    if (!confirmed) return
  }
  
  if (task.taskType === 'ORIENTATION_SESSION') {
    const confirmed = confirm('Have you attended the orientation session?')
    if (!confirmed) return
  }
  
  try {
    completing.value = true
    emit('complete', task)
  } finally {
    completing.value = false
  }
}
</script>

<style scoped>
.task-card {
  transition: all 0.3s ease;
  border-left: 4px solid #dee2e6;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.task-card.completed {
  border-left-color: #28a745;
  background-color: #f8fff9;
}

.task-icon {
  padding: 10px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
