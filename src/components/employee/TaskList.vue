<template>
  <div class="task-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4>Onboarding Tasks</h4>
      <button @click="refreshTasks" class="btn btn-outline-primary btn-sm">
        <i class="fas fa-refresh"></i> Refresh
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="tasks.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      No onboarding tasks assigned yet.
    </div>

    <div v-else>
      <TaskCard
        v-for="task in tasks"
        :key="task.taskId"
        :task="task"
        @complete="completeTask"
        class="mb-3"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import taskService from '@/api/taskService.js'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import TaskCard from './TaskCard.vue'

const emit = defineEmits(['task-completed'])

const tasks = ref([])
const loading = ref(false)

const loadTasks = async () => {
  try {
    loading.value = true
    const response = await taskService.getEmployeeTasks()
    tasks.value = response.data.data || []
  } catch (error) {
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false
  }
}

const refreshTasks = () => {
  loadTasks()
}

const completeTask = async (task) => {
  try {
    let response
    
    switch (task.taskType) {
      case 'POLICY_ACKNOWLEDGMENT':
        response = await taskService.completePolicyAcknowledgment()
        break
      case 'ORIENTATION_SESSION':
        response = await taskService.completeOrientationSession()
        break
      case 'DOCUMENT_SUBMISSION':
        response = await taskService.markDocumentsSubmitted()
        break
      default:
        response = await taskService.completeTask(task.taskType, 'Task completed')
    }
    
    // Refresh tasks after completion
    await loadTasks()
    emit('task-completed', task)
    
  } catch (error) {
    console.error('Error completing task:', error)
    alert('Failed to complete task. Please try again.')
  }
}

onMounted(() => {
  loadTasks()
})

// Expose refresh for parent components
defineExpose({
  refresh: loadTasks
})
</script>

<style scoped>
.task-list {
  padding: 20px;
}
</style>
