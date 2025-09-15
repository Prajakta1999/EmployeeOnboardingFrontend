import http from './http.js'

class OnboardingService {
  // Task Management
  async completeTask(taskData) {
    return http.put('/employee/onboarding/tasks/complete', taskData)
  }

  async completePolicyAcknowledgment() {
    return http.put('/employee/tasks/policy-acknowledgment')
  }

  async completeOrientationConfirmation() {
    return http.put('/employee/tasks/orientation-confirmation')
  }

  async completeDocumentSubmission() {
    return http.put('/employee/tasks/documents-submission')
  }

  // Progress Tracking
  async getOnboardingProgress() {
    return http.get('/employee/onboarding/progress')
  }

  // Filtering and Search
  async filterEmployeesByDepartment(department) {
    return http.get(`/hr/onboarding/filter?department=${department}`)
  }

  async filterEmployeesByStatus(status) {
    return http.get(`/hr/onboarding/filter?status=${status}`)
  }
}

export default new OnboardingService()
