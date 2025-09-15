import http from './http.js'

class EmployeeService {
  // HR Operations
  async getAvailableEmployees() {
    return http.get('/hr/employees/available')
  }

  async addEmployeeToOnboarding(data) {
    return http.post('/hr/onboarding', data)
  }

  async getAllOnboardingEmployees() {
    return http.get('/hr/onboarding')
  }

  async getEmployeeOnboardingDetails(employeeId) {
    return http.get(`/hr/onboarding/${employeeId}`)
  }

  async getFilteredOnboardingEmployees(filters) {
    const params = new URLSearchParams()
    if (filters.department) params.append('department', filters.department)
    if (filters.status) params.append('status', filters.status)
    if (filters.joiningDateFrom) params.append('joiningDateFrom', filters.joiningDateFrom)
    if (filters.joiningDateTo) params.append('joiningDateTo', filters.joiningDateTo)
    
    return http.get(`/hr/onboarding/filter?${params.toString()}`)
  }

  async completeEmployeeOnboarding(employeeId) {
    return http.put(`/hr/onboarding/${employeeId}/complete`)
  }

  async getHRDashboard() {
    return http.get('/hr/dashboard')
  }

  async getAllDepartments() {
    return http.get('/hr/departments')
  }

  // Employee Operations
  async getEmployeeDashboard() {
    return http.get('/employee/dashboard')
  }

  async getEmployeeTasks() {
    return http.get('/employee/onboarding/tasks')
  }

  async getEmployeeProgress() {
    return http.get('/employee/onboarding/progress')
  }
}

export default new EmployeeService()
