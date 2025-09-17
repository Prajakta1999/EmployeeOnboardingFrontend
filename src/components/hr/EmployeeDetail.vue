<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>Employee Onboarding Details</h3>
      
      <div v-if="loading">Loading employee details...</div>
      <div v-else-if="employee">
        <!-- Employee Info -->
        <div class="employee-section">
          <h4>Employee Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Name:</label>
              <span>{{ employee.employeeName }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>{{ employee.email }}</span>
            </div>
            <div class="info-item">
              <label>Phone:</label>
              <span>{{ employee.phoneNumber || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Employee ID:</label>
              <span>{{ employee.employeeIdNumber }}</span>
            </div>
            <div class="info-item">
              <label>Department:</label>
              <span>{{ employee.department }}</span>
            </div>
            <div class="info-item">
              <label>Designation:</label>
              <span>{{ employee.designation }}</span>
            </div>
            <div class="info-item">
              <label>Joining Date:</label>
              <span>{{ formatDate(employee.joiningDate) }}</span>
            </div>
            <div class="info-item">
              <label>Status:</label>
              <span :class="'status-badge status-' + employee.status.toLowerCase()">
                {{ employee.status.replace('_', ' ') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="employee-section">
          <h4>Onboarding Progress</h4>
          <div class="progress-info">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: employee.completionPercentage + '%' }"></div>
            </div>
            <span class="progress-text">{{ employee.completionPercentage }}% Complete</span>
          </div>
          <div class="progress-stats">
            <div class="stat">
              <span class="stat-number">{{ employee.completedTasks || 0 }}</span>
              <span class="stat-label">Completed Tasks</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ employee.totalTasks || 0 }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ employee.approvedDocuments || 0 }}</span>
              <span class="stat-label">Approved Documents</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ employee.totalDocuments || 0 }}</span>
              <span class="stat-label">Total Documents</span>
            </div>
          </div>
          <p class="last-updated"><small>Last Updated: {{ formatDate(employee.lastUpdated) }}</small></p>
        </div>

        <!-- Combined Tasks and Documents View -->
        <div class="employee-section">
          <h4>Onboarding Requirements</h4>
          
          <!-- Filter tabs -->
          <div class="filter-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'all' }]"
              @click="activeTab = 'all'"
            >
              All ({{ allRequirements.length }})
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'tasks' }]"
              @click="activeTab = 'tasks'"
            >
              Tasks ({{ taskRequirements.length }})
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'documents' }]"
              @click="activeTab = 'documents'"
            >
              Documents ({{ documentRequirements.length }})
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'pending' }]"
              @click="activeTab = 'pending'"
            >
              Pending ({{ pendingRequirements.length }})
            </button>
          </div>

          <!-- Requirements List -->
          <div class="requirements-list">
            <div v-if="filteredRequirements.length === 0" class="no-requirements">
              No {{ activeTab === 'all' ? '' : activeTab }} requirements found.
            </div>
            <div 
              v-for="requirement in filteredRequirements" 
              :key="requirement.id" 
              class="requirement-item"
            >
              <div class="requirement-icon">
                <span v-if="requirement.type === 'task'" class="icon task-icon">📋</span>
                <span v-else class="icon document-icon">📄</span>
              </div>
              
              <div class="requirement-content">
                <div class="requirement-header">
                  <strong>{{ requirement.name }}</strong>
                  <div class="requirement-badges">
                    <span v-if="requirement.mandatory" class="mandatory-badge">Mandatory</span>
                    <span :class="'status-badge status-' + requirement.status.toLowerCase()">
                      {{ requirement.status.replace('_', ' ') }}
                    </span>
                  </div>
                </div>
                
                <p v-if="requirement.description" class="requirement-description">
                  {{ requirement.description }}
                </p>
                
                <div class="requirement-meta">
                  <span class="requirement-type">{{ requirement.type.toUpperCase() }}</span>
                  <span v-if="requirement.completedAt" class="completion-date">
                    Completed: {{ formatDate(requirement.completedAt) }}
                  </span>
                  <span v-if="requirement.dueDate" class="due-date">
                    Due: {{ formatDate(requirement.dueDate) }}
                  </span>
                </div>
                
                <p v-if="requirement.notes" class="requirement-notes">
                  <strong>Notes:</strong> {{ requirement.notes }}
                </p>
              </div>
              
              <div class="requirement-actions">
                <a 
                  v-if="requirement.url" 
                  :href="requirement.url" 
                  target="_blank" 
                  class="btn small primary"
                >
                  View
                </a>
                <button 
                  v-if="requirement.type === 'document' && requirement.status === 'PENDING_REVIEW'"
                  class="btn small secondary"
                  @click="reviewDocument(requirement)"
                >
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="modal-actions">
        <button class="btn" @click="$emit('close')">Close</button>
        <button 
          v-if="employee?.status !== 'COMPLETED' && canCompleteOnboarding"
          class="btn primary" 
          @click="completeOnboarding"
          :disabled="actionLoading"
        >
          {{ actionLoading ? 'Completing...' : 'Mark as Complete' }}
        </button>
        <button 
          v-else-if="employee?.status !== 'COMPLETED'"
          class="btn disabled" 
          disabled
          :title="completionBlockedReason"
        >
          Cannot Complete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const props = defineProps({
  employeeId: {
    type: [String, Number],
    required: true
  }
});

const emit = defineEmits(['close', 'refresh']);
const auth = useAuthStore();
const API_BASE = 'http://localhost:8080/api/v1/api';

const loading = ref(false);
const actionLoading = ref(false);
const employee = ref(null);
const error = ref('');
const activeTab = ref('all');

// Computed properties for requirements
const allRequirements = computed(() => {
  if (!employee.value) return [];
  
  const requirements = [];
  
  // Add tasks as requirements
  if (employee.value.tasks) {
    employee.value.tasks.forEach(task => {
      requirements.push({
        id: `task-${task.taskId}`,
        type: 'task',
        name: task.taskName,
        description: task.description,
        status: task.status,
        mandatory: task.mandatory,
        completedAt: task.completedAt,
        dueDate: task.dueDate,
        notes: task.notes,
        url: null
      });
    });
  }
  
  // Add documents as requirements
  if (employee.value.documents) {
    employee.value.documents.forEach(doc => {
      requirements.push({
        id: `doc-${doc.documentId}`,
        type: 'document',
        name: formatDocumentType(doc.documentType),
        description: doc.documentName,
        status: doc.status,
        mandatory: doc.mandatory,
        completedAt: doc.submittedAt,
        dueDate: null,
        notes: doc.rejectionReason,
        url: doc.documentUrl
      });
    });
  }
  
  return requirements;
});

const taskRequirements = computed(() => 
  allRequirements.value.filter(req => req.type === 'task')
);

const documentRequirements = computed(() => 
  allRequirements.value.filter(req => req.type === 'document')
);

const pendingRequirements = computed(() => 
  allRequirements.value.filter(req => 
    req.status === 'PENDING' || 
    req.status === 'PENDING_REVIEW' || 
    req.status === 'IN_PROGRESS'
  )
);

const filteredRequirements = computed(() => {
  switch (activeTab.value) {
    case 'tasks':
      return taskRequirements.value;
    case 'documents':
      return documentRequirements.value;
    case 'pending':
      return pendingRequirements.value;
    default:
      return allRequirements.value;
  }
});

const canCompleteOnboarding = computed(() => {
  if (!employee.value) return false;
  
  return employee.value.completedTasks === employee.value.totalTasks &&
         employee.value.approvedDocuments === employee.value.totalDocuments &&
         employee.value.completionPercentage === 100;
});

const completionBlockedReason = computed(() => {
  if (!employee.value) return '';
  
  const reasons = [];
  if (employee.value.completedTasks < employee.value.totalTasks) {
    reasons.push(`${employee.value.totalTasks - employee.value.completedTasks} tasks remaining`);
  }
  if (employee.value.approvedDocuments < employee.value.totalDocuments) {
    reasons.push(`${employee.value.totalDocuments - employee.value.approvedDocuments} documents pending`);
  }
  
  return reasons.join(', ') || 'Requirements not met';
});

async function fetchEmployeeDetails() {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.get(`${API_BASE}/hr/onboarding/${props.employeeId}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    // Handle different response structures
    if (response.data.data) {
      employee.value = response.data.data;
    } else {
      employee.value = response.data;
    }
    
    console.log('Employee details:', employee.value);
    
  } catch (error) {
    console.error('Failed to fetch employee details:', error);
    error.value = 'Failed to load employee details';
  } finally {
    loading.value = false;
  }
}

async function completeOnboarding() {
  if (!confirm('Are you sure you want to mark this employee\'s onboarding as complete?')) return;
  
  actionLoading.value = true;
  error.value = '';
  
  try {
    await axios.put(`${API_BASE}/hr/onboarding/${props.employeeId}/complete`, {}, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    await fetchEmployeeDetails();
    emit('refresh');
    
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    
    if (error.response?.status === 409) {
      error.value = error.response.data?.message || 'Cannot complete onboarding due to conflicts';
    } else {
      error.value = 'Failed to complete onboarding';
    }
  } finally {
    actionLoading.value = false;
  }
}

function reviewDocument(requirement) {
  // Emit event to parent to handle document review
  emit('review-document', requirement.id.replace('doc-', ''));
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDocumentType(type) {
  const typeMap = {
    'ID_PROOF': 'ID Proof',
    'PAN_AADHAR': 'PAN/Aadhar',
    'BANK_DETAILS': 'Bank Account Details',
    'OFFER_LETTER': 'Offer Letter Acceptance'
  };
  return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

onMounted(fetchEmployeeDetails);
</script>

<style scoped>
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
  max-width: 1000px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.employee-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.employee-section:last-of-type {
  border-bottom: none;
}

.employee-section h4 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-weight: 500;
  color: #718096;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.info-item span {
  color: #2d3748;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-bar {
  flex: 1;
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  min-width: 80px;
  color: #2d3748;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.stat {
  text-align: center;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 6px;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.stat-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.last-updated {
  margin: 0;
  text-align: center;
  color: #718096;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab-btn {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #718096;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #4299e1;
}

.tab-btn.active {
  color: #4299e1;
  border-bottom-color: #4299e1;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-requirements {
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
}

.requirement-item {
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  transition: box-shadow 0.2s ease;
}

.requirement-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.requirement-icon {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 40px;
}

.icon {
  font-size: 1.5rem;
}

.requirement-content {
  flex: 1;
}

.requirement-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.requirement-header strong {
  color: #2d3748;
  font-size: 1rem;
}

.requirement-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.requirement-description {
  margin: 0.5rem 0;
  color: #718096;
  font-size: 0.875rem;
}

.requirement-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 0.75rem 0;
  font-size: 0.75rem;
  color: #718096;
}

.requirement-type {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
}

.completion-date, .due-date {
  color: #4a5568;
}

.requirement-notes {
  margin: 0.75rem 0 0 0;
  font-size: 0.875rem;
  color: #4a5568;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
}

.requirement-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending { background: #fed7d7; color: #c53030; }
.status-in_progress { background: #bee3f8; color: #2b6cb0; }
.status-completed { background: #c6f6d5; color: #2f855a; }
.status-pending_review { background: #faf5ff; color: #805ad5; }
.status-approved { background: #c6f6d5; color: #2f855a; }
.status-rejected { background: #fed7d7; color: #c53030; }
.status-submitted { background: #bee3f8; color: #2b6cb0; }

.mandatory-badge {
  background: #fed7d7;
  color: #c53030;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #fc8181;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #4299e1;
  color: white;
  border-color: #4299e1;
}

.btn.secondary {
  background: #e2e8f0;
  color: #4a5568;
  border-color: #e2e8f0;
}

.btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn:hover:not(:disabled) {
  opacity: 0.8;
  transform: translateY(-1px);
}

.btn:disabled, .btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
