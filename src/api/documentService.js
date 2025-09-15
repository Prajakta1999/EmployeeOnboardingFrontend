import http from './http.js'

class DocumentService {
  // Employee Document Operations
  async submitDocuments(documents) {
    return http.put('/employee/documents', documents)
  }

  async updateDocument(documentId, documentUrl) {
    return http.put(`/employee/documents/${documentId}`, { documentUrl })
  }

  async getEmployeeDocuments() {
    return http.get('/employee/documents')
  }

  // HR Document Review Operations
  async getDocumentsForReview(employeeId) {
    return http.get(`/hr/documents/${employeeId}`)
  }

  async approveDocument(documentId, comments = '') {
    return http.put(`/hr/documents/${documentId}/approve`, { comments })
  }

  async rejectDocument(documentId, comments) {
    return http.put(`/hr/documents/${documentId}/reject`, { comments })
  }

  async reviewDocument(documentId, status, comments) {
    return http.put(`/hr/documents/${documentId}/review`, { status, comments })
  }
}

export default new DocumentService()
