<template>
  <div class="progress-tracker">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-chart-line me-2"></i>
          Onboarding Progress
        </h5>
      </div>
      
      <div class="card-body">
        <!-- Overall Progress -->
        <div class="text-center mb-4">
          <div class="progress-circle-container">
            <div class="progress-circle" :style="{ '--progress': completionPercentage }">
              <div class="progress-circle-inner">
                <span class="progress-percentage">{{ completionPercentage }}%</span>
                <small class="text-muted">Complete</small>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Progress Steps -->
        <div class="progress-steps">
          <div 
            v-for="(step, index) in progressSteps" 
            :key="index"
            class="progress-step"
            :class="{ 
              'completed': step.completed, 
              'active': !step.completed && isNextStep(index),
              'pending': !step.completed && !isNextStep(index)
            }"
          >
            <div class="step-icon">
              <i v-if="step.completed" class="fas fa-check"></i>
              <i v-else-if="isNextStep(index)" class="fas fa-clock"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div v-if="step.completedAt" class="step-completion">
                <small class="text-success">
                  <i class="fas fa-check me-1"></i>
                  Completed {{ formatDate(step.completedAt) }}
                </small>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Next Steps -->
        <div v-if="nextAction" class="alert alert-info mt-4">
          <i class="fas fa-lightbulb me-2"></i>
          <strong>Next Step:</strong> {{ nextAction }}
        </div>
        
        <!-- Completion Message -->
        <div v-if="completionPercentage === 100" class="alert alert-success mt-4">
          <i class="fas fa-trophy me-2"></i>
          <strong>Congratulations!</strong> You have completed your onboarding process.
          Welcome to the team! 🎉
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completionPercentage: {
    type: Number,
    default: 0
  },
  tasks: {
    type: Array,
    default: () => []
  },
  documents: {
    type: Array,
    default: () => []
  },
  nextAction: {
    type: String,
    default: ''
  }
})

const progressSteps = computed(() => {
  const steps = []
  
  // Add task-based steps
  const taskSteps = [
    {
      title: 'Policy Acknowledgment',
      description: 'Read and acknowledge company policies',
      taskType: 'POLICY_ACKNOWLEDGMENT'
    },
    {
      title: 'Orientation Session',
      description: 'Attend the new employee orientation',
      taskType: 'ORIENTATION_SESSION'
    },
    {
      title: 'Document Submission',
      description: 'Submit required documents',
      taskType: 'DOCUMENT_SUBMISSION'
    }
  ]
  
  taskSteps.forEach(stepConfig => {
    const relatedTask = props.tasks.find(task => task.taskType === stepConfig.taskType)
    steps.push({
      ...stepConfig,
      completed: relatedTask?.status === 'COMPLETED',
      completedAt: relatedTask?.completedAt
    })
  })
  
  // Add document approval step
  const mandatoryDocs = props.documents.filter(doc => doc.mandatory)
  const approvedMandatoryDocs = mandatoryDocs.filter(doc => doc.status === 'APPROVED')
  
  steps.push({
    title: 'Document Approval',
    description: 'Wait for HR to review and approve your documents',
    completed: mandatoryDocs.length > 0 && approvedMandatoryDocs.length === mandatoryDocs.length,
    completedAt: approvedMandatoryDocs.length > 0 ? 
      Math.max(...approvedMandatoryDocs.map(doc => new Date(doc.reviewedAt).getTime())) : null
  })
  
  return steps
})

const isNextStep = (index) => {
  // Find the first incomplete step
  const firstIncompleteIndex = progressSteps.value.findIndex(step => !step.completed)
  return index === firstIncompleteIndex
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.progress-tracker {
  max-width: 600px;
  margin: 0 auto;
}

/* Circular Progress */
.progress-circle-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
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
}

.progress-circle-inner {
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

/* Progress Steps */
.progress-steps {
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
  z-index: 0;
}

.progress-step {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem 0;
  z-index: 1;
}

.progress-step:last-child::after {
  display: none;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
  background: white;
  border: 2px solid #dee2e6;
  color: #6c757d;
}

.progress-step.completed .step-icon {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.progress-step.active .step-icon {
  background: #007bff;
  border-color: #007bff;
  color: white;
  animation: pulse 2s infinite;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.step-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.step-completion {
  font-size: 0.8rem;
}

/* Animations */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

/* State styles */
.progress-step.pending .step-title {
  color: #6c757d;
}

.progress-step.completed .step-title {
  color: #28a745;
}

.progress-step.active .step-title {
  color: #007bff;
}
</style>
