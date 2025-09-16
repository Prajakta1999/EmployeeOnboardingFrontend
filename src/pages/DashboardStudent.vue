<template>
  <div>
    <h2>Employee Dashboard</h2>

    <!-- Progress Summary -->
    <div class="card">
      <h3>My Onboarding Progress</h3>
      <div v-if="loading.dashboard">Loading...</div>
      <div v-else-if="dashboardData">
        <div class="employee-info">
          <h4>{{ dashboardData.employeeName }}</h4>
          <p><strong>Email:</strong> {{ dashboardData.email }}</p>
          <p><strong>Phone:</strong> {{ dashboardData.phoneNumber || 'N/A' }}</p>
          <p><strong>Department:</strong> {{ dashboardData.department }}</p>
          <p><strong>Designation:</strong> {{ dashboardData.designation }}</p>
          <p><strong>Employee ID:</strong> {{ dashboardData.employeeIdNumber }}</p>
          <p><strong>Status:</strong> <span :class="`status-${dashboardData.status?.toLowerCase()}`">{{ dashboardData.status }}</span></p>
          <p><strong>Joining Date:</strong> {{ formatDate(dashboardData.joiningDate) }}</p>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: dashboardData.completionPercentage + '%' }"></div>
          </div>
          <span class="progress-percent">{{ dashboardData.completionPercentage }}% Complete</span>
          
          <div v-if="dashboardData.nextAction" class="next-action">
            <strong>Next Action:</strong> {{ dashboardData.nextAction }}
          </div>
        </div>
      </div>
      <p v-else>Unable to load your onboarding information.</p>
    </div>

    <!-- Pending Tasks -->
    <div class="card" style="margin-top: 2rem;">
      <h3>Pending Tasks ({{ dashboardData?.pendingTasks?.length || 0 }})</h3>
      <div v-if="loading.tasks">Loading tasks...</div>
      <div v-else-if="!dashboardData?.pendingTasks?.length">
        <p>🎉 Great job! You have no pending tasks.</p>
      </div>
      <div v-else class="task-list">
        <div v-for="task in dashboardData.pendingTasks" :key="task.taskId" class="task-card pending">
          <div class="task-header">
            <h4>{{ task.taskName }}</h4>
            <span v-if="task.mandatory" class="mandatory">Mandatory</span>
          </div>
          <p>{{ task.description }}</p>
          <div class="task-actions">
            <button 
              v-if="task.taskType === 'POLICY_ACKNOWLEDGMENT'"
              class="btn small primary"
              @click="completePolicyAcknowledgment(task.taskType)"
            >
              Acknowledge Policy
            </button>
            <button 
              v-else-if="task.taskType === 'ORIENTATION_SESSION'"
              class="btn small primary"
              @click="confirmOrientation(task.taskType)"
            >
              Confirm Attendance
            </button>
            <button 
              v-else-if="task.taskType === 'DOCUMENT_SUBMISSION'"
              class="btn small primary"
              @click="openDocumentSubmission"
            >
              Submit Documents
            </button>
            <button 
              v-else
              class="btn small primary"
              @click="completeGenericTask(task.taskType)"
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Tasks -->
    <div class="card" style="margin-top: 2rem;">
      <h3>Completed Tasks ({{ dashboardData?.completedTasks?.length || 0 }})</h3>
      <div v-if="loading.tasks">Loading tasks...</div>
      <div v-else-if="!dashboardData?.completedTasks?.length">
        <p>No tasks completed yet.</p>
      </div>
      <div v-else class="task-list">
        <div v-for="task in dashboardData.completedTasks" :key="task.taskId" class="task-card completed">
          <div class="task-header">
            <h4>{{ task.taskName }}</h4>
            <span class="completed-badge">✓ Completed</span>
          </div>
          <p>{{ task.description }}</p>
          <p class="completion-date">Completed: {{ formatDateTime(task.completedAt) }}</p>
          <p v-if="task.notes" class="task-notes">Notes: {{ task.notes }}</p>
        </div>
      </div>
    </div>

    <!-- Documents Status -->
    <div class="card" style="margin-top: 2rem;">
      <h3>My Documents ({{ dashboardData?.documents?.length || 0 }})</h3>
      <div v-if="loading.documents">Loading documents...</div>
      <div v-else-if="!dashboardData?.documents?.length">
        <p>No documents submitted yet.</p>
        <button class="btn primary" @click="openDocumentSubmission">Submit Documents</button>
      </div>
      <div v-else>
        <div class="documents-grid">
          <div v-for="doc in dashboardData.documents" :key="doc.documentId" class="document-card">
            <h4>{{ doc.documentName }}</h4>
            <p><strong>Type:</strong> {{ formatDocumentType(doc.documentType) }}</p>
            <p><strong>Status:</strong> 
              <span :class="`doc-status-${doc.status.toLowerCase().replace('_', '-')}`">
                {{ formatDocumentStatus(doc.status) }}
              </span>
            </p>
            <p v-if="doc.mandatory" class="mandatory-doc">Mandatory Document</p>
            <p v-if="doc.submittedAt" class="submission-date">
              Submitted: {{ formatDateTime(doc.submittedAt) }}
            </p>
            <p v-if="doc.reviewComments" class="review-comments">
              <strong>Review Comments:</strong> {{ doc.reviewComments }}
            </p>
            <p v-if="doc.reviewedByName" class="reviewer">
              Reviewed by: {{ doc.reviewedByName }}
            </p>
          </div>
        </div>
        <button class="btn primary" style="margin-top: 1rem;" @click="openDocumentSubmission">
          Submit More Documents
        </button>
      </div>
    </div>

    <!-- Document Submission Modal -->
    <div v-if="showDocumentModal" class="modal-backdrop" @click="closeDocumentModal">
      <div class="modal" @click.stop>
        <h3>Submit Documents</h3>
        <form @submit.prevent="handleDocumentSubmission">
          <div class="form-group">
            <label>ID Proof URL: <span class="required">*</span></label>
            <input v-model="documentForm.idProofUrl" type="url" required placeholder="Enter ID proof document URL">
          </div>

          <div class="form-group">
            <label>PAN/Aadhar URL:</label>
            <input v-model="documentForm.panAadharUrl" type="url" placeholder="Enter PAN/Aadhar document URL">
          </div>

          <div class="form-group">
            <label>Bank Details URL:</label>
            <input v-model="documentForm.bankDetailsUrl" type="url" placeholder="Enter bank details document URL">
          </div>

          <div class="form-group">
            <label>Offer Letter URL: <span class="required">*</span></label>
            <input v-model="documentForm.offerLetterUrl" type="url" required placeholder="Enter offer letter document URL">
          </div>

          <div class="form-actions">
            <button type="button" class="btn" @click="closeDocumentModal">Cancel</button>
            <button type="submit" class="btn primary" :disabled="loading.form">Submit Documents</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const auth = useAuthStore();
const API_BASE = 'http://localhost:8080/api/v1';

// State
const dashboardData = ref(null);
const showDocumentModal = ref(false);
const documentForm = reactive({
  idProofUrl: '',
  panAadharUrl: '',
  bankDetailsUrl: '',
  offerLetterUrl: ''
});

const loading = reactive({
  dashboard: false,
  tasks: false,
  documents: false,
  form: false
});

// API calls
async function fetchDashboard() {
  loading.dashboard = true;
  try {
    const { data } = await axios.get(`${API_BASE}/employee/dashboard`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    dashboardData.value = data.data || data;
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
  } finally {
    loading.dashboard = false;
  }
}

// Task completion handlers - using CompleteTaskRequest DTO structure
async function completePolicyAcknowledgment(taskType) {
  try {
    await axios.put(`${API_BASE}/employee/tasks/policy-acknowledgment`, {
      taskType: taskType,
      notes: 'Policy acknowledged by employee'
    }, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchDashboard();
  } catch (error) {
    console.error('Failed to complete policy acknowledgment:', error);
    alert('Failed to complete task');
  }
}

async function confirmOrientation(taskType) {
  try {
    await axios.put(`${API_BASE}/employee/tasks/orientation-confirmation`, {
      taskType: taskType,
      notes: 'Orientation attendance confirmed'
    }, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchDashboard();
  } catch (error) {
    console.error('Failed to confirm orientation:', error);
    alert('Failed to complete task');
  }
}

async function completeGenericTask(taskType) {
  try {
    await axios.put(`${API_BASE}/employee/onboarding/tasks/${taskType}/complete`, {
      taskType: taskType,
      notes: 'Task completed by employee'
    }, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchDashboard();
  } catch (error) {
    console.error('Failed to complete task:', error);
    alert('Failed to complete task');
  }
}

// Document handlers - using DocumentSubmissionRequest DTO structure
function openDocumentSubmission() {
  showDocumentModal.value = true;
}

function closeDocumentModal() {
  showDocumentModal.value = false;
  documentForm.idProofUrl = '';
  documentForm.panAadharUrl = '';
  documentForm.bankDetailsUrl = '';
  documentForm.offerLetterUrl = '';
}

async function handleDocumentSubmission() {
  loading.form = true;
  try {
    // Match exact DocumentSubmissionRequest DTO structure
    const payload = {
      idProofUrl: documentForm.idProofUrl,
      offerLetterUrl: documentForm.offerLetterUrl
    };

    // Add optional fields if provided
    if (documentForm.panAadharUrl) payload.panAadharUrl = documentForm.panAadharUrl;
    if (documentForm.bankDetailsUrl) payload.bankDetailsUrl = documentForm.bankDetailsUrl;

    await axios.put(`${API_BASE}/employee/documents`, payload, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    await fetchDashboard();
    closeDocumentModal();
  } catch (error) {
    console.error('Failed to submit documents:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Unknown error occurred';
    
    alert(`Failed to submit documents: ${errorMessage}`);
  } finally {
    loading.form = false;
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
}

function formatDocumentType(type) {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function formatDocumentStatus(status) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

onMounted(fetchDashboard);
</script>

<style scoped>
.employee-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.progress-section {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin: 1rem 0 0.5rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #48bb78);
  border-radius: 6px;
}

.progress-percent {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.next-action {
  margin-top: 1rem;
  padding: 1rem;
  background: #e6fffa;
  border: 1px solid #81e6d9;
  border-radius: 6px;
  color: #234e52;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.task-card.pending {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.task-card.completed {
  background-color: #d4edda;
  border-left-color: #28a745;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.task-header h4 {
  margin: 0;
}

.mandatory {
  padding: 0.2rem 0.6rem;
  background: #dc3545;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.completed-badge {
  padding: 0.2rem 0.6rem;
  background: #28a745;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.task-actions {
  margin-top: 1rem;
}

.completion-date, .task-notes {
  font-size: 0.9em;
  color: #6c757d;
  margin: 0.25rem 0;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.document-card {
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.document-card h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.doc-status-pending-review { color: #ffc107; font-weight: 500; }
.doc-status-approved { color: #28a745; font-weight: 500; }
.doc-status-rejected { color: #dc3545; font-weight: 500; }

.mandatory-doc {
  color: #dc3545;
  font-weight: 500;
  font-size: 0.9em;
}

.submission-date, .reviewer {
  font-size: 0.85em;
  color: #6c757d;
}

.review-comments {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
  font-size: 0.9em;
}

.status-pending { color: #ffc107; font-weight: 500; }
.status-in_progress { color: #17a2b8; font-weight: 500; }
.status-completed { color: #28a745; font-weight: 500; }
.status-pending_documents { color: #6f42c1; font-weight: 500; }

.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.required {
  color: #e53e3e;
}

.form-group select, .form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>
