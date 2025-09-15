import http from './http.js'

class TaskService {
  // Task Operations
  async getEmployeeTasks() {
    return http.get('/employee/onboarding/tasks')
  }

  async completeTask(taskType, notes = '') {
    return http.put('/employee/onboarding/tasks/complete', {
      taskType,
      notes
    })
  }

  // Specific Task Completions
  async completePolicyAcknowledgment() {
    return http.put('/employee/tasks/policy-acknowledgment', {})
  }

  async completeOrientationSession() {
    return http.put('/employee/tasks/orientation-confirmation', {})
  }

  async markDocumentsSubmitted() {
    return http.put('/employee/tasks/documents-submission', {})
  }

  // Task Status Helpers
  getTaskStatusColor(status) {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'PENDING': return 'warning'
      default: return 'secondary'
    }
  }

  getTaskTypeDisplayName(taskType) {
    switch (taskType) {
      case 'POLICY_ACKNOWLEDGMENT': return 'Policy Acknowledgment'
      case 'ORIENTATION_SESSION': return 'Orientation Session'
      case 'DOCUMENT_SUBMISSION': return 'Document Submission'
      default: return taskType
    }
  }
}

export default new TaskService()
