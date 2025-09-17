<template>
  <div>
    <h2>Employee Dashboard</h2>

    <!-- Progress Summary -->
    <div class="card">
      <h3>My Onboarding Progress</h3>
      <div v-if="loading.dashboard">Loading progress...</div>
      <div v-else-if="dashboard.data?.employeeName">
        <div class="employee-info">
          <div class="info-section">
            <p><strong>Name:</strong> {{ dashboard.data.employeeName }}</p>
            <p><strong>Employee ID:</strong> {{ dashboard.data.employeeIdNumber }}</p>
            <p><strong>Department:</strong> {{ dashboard.data.department }}</p>
            <p><strong>Designation:</strong> {{ dashboard.data.designation }}</p>
            <p><strong>Joining Date:</strong> {{ formatDate(dashboard.data.joiningDate) }}</p>
            <p><strong>Email:</strong> {{ dashboard.data.email }}</p>
          </div>
          <div class="progress-section">
            <div class="progress-circle">
              <div class="circle-progress" :style="{ '--progress': dashboard.data.completionPercentage }">
                <span class="percentage">{{ dashboard.data.completionPercentage }}%</span>
              </div>
            </div>
            <p class="status-text">
              Status: <span :class="'status-badge status-' + dashboard.data.status.toLowerCase().replace('_', '-')">
                {{ dashboard.data.status.replace('_', ' ') }}
              </span>
            </p>
            <p class="next-action" v-if="dashboard.data.nextAction">
              <strong>Next Action:</strong> {{ dashboard.data.nextAction }}
            </p>
          </div>
        </div>
      </div>
      <p v-else>No onboarding information found. Please contact HR.</p>
    </div>

    <!-- Pending Tasks -->
    <div class="card" style="margin-top: 2rem;">
      <h3>Pending Tasks ({{ pendingTasksCount }})</h3>
      <div v-if="loading.dashboard">Loading tasks...</div>
      <div v-else-if="pendingTasksCount === 0">
        <p>✅ All tasks completed! Great job!</p>
      </div>
      <ul v-else class="task-list">
        <li v-for="task in dashboard.data?.pendingTasks || []" :key="task.taskId" class="task-item pending">
          <div class="task-content">
            <strong>{{ task.taskName }}</strong>
            <p>{{ task.description }}</p>
            <span v-if="task.mandatory" class="mandatory-badge">Mandatory</span>
          </div>
          <div class="task-actions">
            <button 
              v-if="task.taskType === 'POLICY_ACKNOWLEDGMENT'"
              class="btn small primary"
              @click="completePolicyAcknowledgment(task.taskId)"
            >
              Acknowledge Policy
            </button>
            <button 
              v-else-if="task.taskType === 'ORIENTATION_SESSION'"
              class="btn small primary"
              @click="confirmOrientation(task.taskId)"
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
              @click="openTaskModal(task)"
            >
              Complete Task
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Completed Tasks -->
    <div class="card" style="margin-top: 2rem;">
      <h3>Completed Tasks ({{ completedTasksCount }})</h3>
      <div v-if="completedTasksCount === 0">
        <p>No tasks completed yet.</p>
      </div>
      <ul v-else class="task-list">
        <li v-for="task in dashboard.data?.completedTasks || []" :key="task.taskId" class="task-item completed">
          <div class="task-content">
            <strong>{{ task.taskName }}</strong>
            <p>{{ task.description }}</p>
            <p v-if="task.notes" class="task-notes"><em>Notes: {{ task.notes }}</em></p>
            <small>Completed: {{ formatDate(task.completedAt) }}</small>
          </div>
          <div class="task-status">
            ✅ Completed
          </div>
        </li>
      </ul>
    </div>

    <!-- Documents -->
    <div class="card" style="margin-top: 2rem;">
      <h3>My Documents</h3>
      <div v-if="loading.dashboard">Loading documents...</div>
      <div v-else>
        <div class="document-summary">
          <p><strong>Document Status:</strong></p>
          <div class="document-stats">
            <span class="doc-stat approved">{{ approvedDocs }} Approved</span>
            <span class="doc-stat pending">{{ pendingDocs }} Pending Review</span>
            <span class="doc-stat rejected">{{ rejectedDocs }} Rejected</span>
          </div>
        </div>
        
        <div class="document-list" v-if="documentsFromDashboard.length">
          <div v-for="doc in documentsFromDashboard" :key="doc.documentId" class="document-item">
            <div class="doc-info">
              <strong>{{ doc.documentType.replace('_', ' ') }}</strong>
              <p>{{ doc.documentName }}</p>
              <span v-if="doc.mandatory" class="mandatory-badge">Mandatory</span>
            </div>
            <div class="doc-status">
              <span :class="'status-badge status-' + doc.status.toLowerCase().replace('_', '-')">
                {{ doc.status.replace('_', ' ') }}
              </span>
              <p v-if="doc.reviewComments" class="review-comments">
                <strong>Review Comments:</strong> {{ doc.reviewComments }}
              </p>
            </div>
            <div class="doc-actions">
              <a v-if="doc.documentUrl" :href="doc.documentUrl" target="_blank" class="btn small">View</a>
              <button 
                v-if="doc.status === 'REJECTED'"
                class="btn small primary"
                @click="updateDocument(doc.documentId)"
              >
                Re-submit
              </button>
            </div>
          </div>
        </div>
        
        <button class="btn primary" @click="openDocumentSubmission" style="margin-top: 1rem;">
          {{ documentsFromDashboard.length ? 'Update Documents' : 'Submit Documents' }}
        </button>
      </div>
    </div>

    <!-- Task Completion Modal -->
    <div v-if="showTaskModal" class="modal-backdrop" @click="closeTaskModal">
      <div class="modal" @click.stop>
        <h3>Complete Task: {{ selectedTask?.taskName }}</h3>
        <form @submit.prevent="handleCompleteTask">
          <div class="form-group">
            <label>Notes (optional):</label>
            <textarea 
              v-model="taskNotes" 
              placeholder="Add any notes about completing this task..."
              rows="4"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" @click="closeTaskModal">Cancel</button>
            <button type="submit" class="btn primary" :disabled="loading.form">Complete Task</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Document Submission Modal -->
    <DocumentSubmission
      v-if="showDocumentModal"
      @close="closeDocumentSubmission"
      @refresh="fetchDashboard"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import DocumentSubmission from '@/components/employee/DocumentSubmission.vue';

const auth = useAuthStore();
const API_BASE = 'http://localhost:8080/api/v1';

// State
const dashboard = ref({});
const showTaskModal = ref(false);
const showDocumentModal = ref(false);
const selectedTask = ref(null);
const taskNotes = ref('');

const loading = reactive({
  dashboard: false,
  form: false
});

// Computed properties - using dashboard data structure
const pendingTasksCount = computed(() => dashboard.value.data?.pendingTasks?.length || 0);
const completedTasksCount = computed(() => dashboard.value.data?.completedTasks?.length || 0);
const documentsFromDashboard = computed(() => dashboard.value.data?.documents || []);
const approvedDocs = computed(() => documentsFromDashboard.value.filter(doc => doc.status === 'APPROVED').length);
const pendingDocs = computed(() => documentsFromDashboard.value.filter(doc => doc.status === 'PENDING_REVIEW').length);
const rejectedDocs = computed(() => documentsFromDashboard.value.filter(doc => doc.status === 'REJECTED').length);

// API calls - only need dashboard call now
async function fetchDashboard() {
  loading.dashboard = true;
  try {
    const response = await axios.get(`${API_BASE}/api/employee/dashboard`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    console.log('Dashboard API response:', response.data); // For debugging
    dashboard.value = response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
  } finally {
    loading.dashboard = false;
  }
}

// Task completion functions
async function completePolicyAcknowledgment(taskId) {
  try {
    await axios.put(`${API_BASE}/api/employee/tasks/policy-acknowledgment`, {
      taskType: 'POLICY_ACKNOWLEDGMENT',
      notes: 'Policy acknowledged'
    }, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchDashboard(); // Refresh dashboard data
    alert('Policy acknowledged successfully!');
  } catch (error) {
    console.error('Failed to acknowledge policy:', error);
    alert('Failed to acknowledge policy');
  }
}

async function confirmOrientation(taskId) {
  try {
    await axios.put(`${API_BASE}/api/employee/tasks/orientation-confirmation`, {
      taskType: 'ORIENTATION_SESSION',
      notes: 'Orientation attended'
    }, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchDashboard(); // Refresh dashboard data
    alert('Orientation attendance confirmed successfully!');
  } catch (error) {
    console.error('Failed to confirm orientation:', error);
    alert('Failed to confirm orientation attendance');
  }
}

function openTaskModal(task) {
  selectedTask.value = task;
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
  selectedTask.value = null;
  taskNotes.value = '';
}

async function handleCompleteTask() {
  loading.form = true;
  try {
    await axios.put(`${API_BASE}/api/employee/onboarding/tasks/${selectedTask.value.taskId}/complete`, {
      taskType: selectedTask.value.taskType,
      notes: taskNotes.value
    }, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchDashboard(); // Refresh dashboard data
    closeTaskModal();
    alert('Task completed successfully!');
  } catch (error) {
    console.error('Failed to complete task:', error);
    alert('Failed to complete task');
  } finally {
    loading.form = false;
  }
}

function openDocumentSubmission() {
  showDocumentModal.value = true;
}

function closeDocumentSubmission() {
  showDocumentModal.value = false;
}

async function updateDocument(documentId) {
  // This would open a document update modal
  console.log('Update document:', documentId);
  // You can implement document update functionality here
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
}

onMounted(fetchDashboard);
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

.employee-info {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
}

.info-section p {
  margin: 0.5rem 0;
}

.progress-section {
  text-align: center;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
}

.circle-progress {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#4299e1 calc(var(--progress) * 1%), #e2e8f0 0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-progress::before {
  content: '';
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: white;
}

.percentage {
  position: relative;
  z-index: 1;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2d3748;
}

.status-text {
  margin: 0.5rem 0;
}

.next-action {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.task-item.completed {
  background-color: #f7fafc;
  border-color: #c6f6d5;
}

.task-content {
  flex: 1;
}

.task-content strong {
  display: block;
  margin-bottom: 0.5rem;
}

.task-content p {
  margin: 0.25rem 0;
  color: #718096;
}

.task-notes {
  font-style: italic;
  color: #4a5568;
}

.mandatory-badge {
  background: #fed7d7;
  color: #c53030;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.task-actions, .task-status {
  margin-left: 1rem;
}

.document-summary {
  margin-bottom: 1.5rem;
}

.document-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.doc-stat {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.doc-stat.approved { background: #c6f6d5; color: #2f855a; }
.doc-stat.pending { background: #bee3f8; color: #2b6cb0; }
.doc-stat.rejected { background: #fed7d7; color: #c53030; }

.document-list {
  margin-top: 1rem;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.doc-info {
  flex: 1;
}

.doc-status {
  margin: 0 1rem;
  text-align: center;
}

.review-comments {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #718096;
}

.doc-actions {
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending-review { background: #bee3f8; color: #2b6cb0; }
.status-approved { background: #c6f6d5; color: #2f855a; }
.status-rejected { background: #fed7d7; color: #c53030; }
.status-completed { background: #c6f6d5; color: #2f855a; }
.status-in-progress { background: #faf5ff; color: #805ad5; }

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn.primary {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn:hover {
  opacity: 0.8;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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
  width: 90%;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
