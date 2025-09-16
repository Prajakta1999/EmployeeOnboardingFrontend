<template>
  <div>
    <div class="header">
      <h2>HR Dashboard</h2>
      <button class="btn primary" @click="openAddEmployeeModal()">Add Employee to Onboarding</button>
    </div>

    <!-- Dashboard Overview -->
    <div v-if="dashboardData" class="dashboard-overview">
      <div class="stat-card">
        <h3>Total Onboarded</h3>
        <p class="stat-number">{{ dashboardData.totalEmployeesOnboarded || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Tasks</h3>
        <p class="stat-number">{{ dashboardData.employeesWithPendingTasks || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Documents</h3>
        <p class="stat-number">{{ dashboardData.employeesWithPendingDocuments || 0 }}</p>
      </div>
      <div class="stat-card">
        <h3>In Progress</h3>
        <p class="stat-number">{{ dashboardData.employeesInProgress || 0 }}</p>
      </div>
    </div>

    <!-- Recent Onboardings -->
    <div v-if="dashboardData?.recentOnboardings?.length" class="card">
      <h3>Recent Onboardings</h3>
      <div class="recent-list">
        <div v-for="recent in dashboardData.recentOnboardings" :key="recent.employeeId" class="recent-item">
          <strong>{{ recent.employeeName }}</strong>
          <span>{{ recent.department }}</span>
          <span :class="`status-${recent.status.toLowerCase()}`">{{ recent.status }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.status" @change="fetchOnboardingEmployees">
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="PENDING_DOCUMENTS">Pending Documents</option>
      </select>
      
      <select v-model="filters.department" @change="fetchOnboardingEmployees">
        <option value="">All Departments</option>
        <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
      </select>

      <input 
        v-model="filters.joiningDateFrom" 
        type="date" 
        @change="fetchOnboardingEmployees"
        placeholder="From Date"
      >
      
      <input 
        v-model="filters.joiningDateTo" 
        type="date" 
        @change="fetchOnboardingEmployees"
        placeholder="To Date"
      >
    </div>

    <div v-if="loading.employees" class="card">Loading employees...</div>
    <div v-else-if="employees.length === 0" class="card">
      <p>No employees in onboarding process. Add employees to get started.</p>
    </div>

    <div v-else class="card-grid">
      <div v-for="employee in employees" :key="employee.employeeId" class="card">
        <h3>{{ employee.employeeName }}</h3>
        <p><strong>Email:</strong> {{ employee.email }}</p>
        <p><strong>Phone:</strong> {{ employee.phoneNumber || 'N/A' }}</p>
        <p><strong>Department:</strong> {{ employee.department }}</p>
        <p><strong>Designation:</strong> {{ employee.designation }}</p>
        <p><strong>Status:</strong> <span :class="`status-${employee.status.toLowerCase()}`">{{ employee.status }}</span></p>
        <p><strong>Progress:</strong> {{ employee.completionPercentage }}%</p>
        <p><strong>Tasks:</strong> {{ employee.completedTasks }}/{{ employee.totalTasks }}</p>
        <p><strong>Documents:</strong> {{ employee.approvedDocuments }}/{{ employee.totalDocuments }}</p>
        
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: employee.completionPercentage + '%' }"></div>
        </div>

        <div class="actions">
          <button class="btn small" @click="viewEmployeeDetails(employee.employeeId)">View Details</button>
          <button class="btn small" @click="reviewDocuments(employee.employeeId)">Review Documents</button>
          <button 
            v-if="employee.status !== 'COMPLETED'"
            class="btn small success" 
            @click="completeOnboarding(employee.employeeId)"
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddEmployeeModal" class="modal-backdrop" @click="closeAddEmployeeModal">
      <div class="modal" @click.stop>
        <h3>Add Employee to Onboarding</h3>
        <form @submit.prevent="handleAddEmployee">
          <div class="form-group">
            <label>Select Employee: <span class="required">*</span></label>
            <select v-model="newEmployee.userId" required>
              <option value="">Choose an employee</option>
              <option v-for="emp in availableEmployees" :key="emp.userId" :value="emp.userId">
                {{ emp.name }} - {{ emp.email }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Department: <span class="required">*</span></label>
            <select v-model="newEmployee.department" required>
              <option value="">Choose department</option>
              <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Designation: <span class="required">*</span></label>
            <input v-model="newEmployee.designation" type="text" required placeholder="Enter designation">
          </div>

          <div class="form-group">
            <label>Employee ID: <span class="required">*</span></label>
            <input v-model="newEmployee.employeeId" type="text" required placeholder="Enter employee ID">
          </div>

          <div class="form-group">
            <label>Joining Date: <span class="required">*</span></label>
            <input v-model="newEmployee.joiningDate" type="date" required>
          </div>

          <div class="form-actions">
            <button type="button" class="btn" @click="closeAddEmployeeModal">Cancel</button>
            <button type="submit" class="btn primary" :disabled="loading.form">Add Employee</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Employee Details Modal -->
    <div v-if="showDetailsModal && selectedEmployeeDetails" class="modal-backdrop" @click="closeDetailsModal">
      <div class="modal large" @click.stop>
        <h3>{{ selectedEmployeeDetails.employeeName }} - Onboarding Details</h3>
        
        <div class="details-section">
          <h4>Basic Information</h4>
          <p><strong>Email:</strong> {{ selectedEmployeeDetails.email }}</p>
          <p><strong>Phone:</strong> {{ selectedEmployeeDetails.phoneNumber || 'N/A' }}</p>
          <p><strong>Department:</strong> {{ selectedEmployeeDetails.department }}</p>
          <p><strong>Designation:</strong> {{ selectedEmployeeDetails.designation }}</p>
          <p><strong>Employee ID:</strong> {{ selectedEmployeeDetails.employeeIdNumber }}</p>
          <p><strong>Joining Date:</strong> {{ formatDate(selectedEmployeeDetails.joiningDate) }}</p>
          <p><strong>Status:</strong> <span :class="`status-${selectedEmployeeDetails.status.toLowerCase()}`">{{ selectedEmployeeDetails.status }}</span></p>
          <p><strong>Progress:</strong> {{ selectedEmployeeDetails.completionPercentage }}%</p>
          <p><strong>Last Updated:</strong> {{ formatDateTime(selectedEmployeeDetails.lastUpdated) }}</p>
        </div>

        <div class="details-section">
          <h4>Tasks ({{ selectedEmployeeDetails.tasks?.length || 0 }})</h4>
          <div v-if="selectedEmployeeDetails.tasks?.length">
            <div v-for="task in selectedEmployeeDetails.tasks" :key="task.taskId" class="task-item" :class="task.status.toLowerCase()">
              <strong>{{ task.taskName }}</strong>
              <p>{{ task.description }}</p>
              <span class="task-type">{{ task.taskType }}</span>
              <span v-if="task.mandatory" class="mandatory">Mandatory</span>
              <span :class="`status-${task.status.toLowerCase()}`">{{ task.status }}</span>
              <p v-if="task.completedAt"><small>Completed: {{ formatDateTime(task.completedAt) }}</small></p>
              <p v-if="task.notes"><small>Notes: {{ task.notes }}</small></p>
            </div>
          </div>
          <p v-else>No tasks found</p>
        </div>

        <div class="details-section">
          <h4>Documents ({{ selectedEmployeeDetails.documents?.length || 0 }})</h4>
          <div v-if="selectedEmployeeDetails.documents?.length">
            <div v-for="doc in selectedEmployeeDetails.documents" :key="doc.documentId" class="document-item">
              <strong>{{ doc.documentName }}</strong>
              <p><strong>Type:</strong> {{ formatDocumentType(doc.documentType) }}</p>
              <p><strong>Status:</strong> <span :class="`doc-status-${doc.status.toLowerCase().replace('_', '-')}`">{{ doc.status }}</span></p>
              <p v-if="doc.mandatory" class="mandatory-doc">Mandatory</p>
              <p v-if="doc.reviewComments"><strong>Review Comments:</strong> {{ doc.reviewComments }}</p>
              <div v-if="doc.status === 'PENDING_REVIEW'" class="document-actions">
                <button class="btn small success" @click="reviewDocument(doc.documentId, 'APPROVED')">Approve</button>
                <button class="btn small danger" @click="reviewDocument(doc.documentId, 'REJECTED')">Reject</button>
              </div>
            </div>
          </div>
        </div>

        <button class="btn" @click="closeDetailsModal">Close</button>
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
const employees = ref([]);
const dashboardData = ref(null);
const departments = ref([]);
const availableEmployees = ref([]);
const selectedEmployeeDetails = ref(null);
const showAddEmployeeModal = ref(false);
const showDetailsModal = ref(false);

const newEmployee = reactive({ 
  userId: '', 
  department: '', 
  designation: '',
  employeeId: '',
  joiningDate: new Date().toISOString().split('T')[0]
});

const filters = reactive({ 
  status: '', 
  department: '',
  joiningDateFrom: '',
  joiningDateTo: ''
});

const loading = reactive({ 
  employees: false, 
  form: false, 
  dashboard: false 
});

// API calls
async function fetchDashboard() {
  loading.dashboard = true;
  try {
    const { data } = await axios.get(`${API_BASE}/hr/dashboard`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    dashboardData.value = data.data || data;
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
  } finally {
    loading.dashboard = false;
  }
}

async function fetchOnboardingEmployees() {
  loading.employees = true;
  try {
    let url = `${API_BASE}/hr/onboarding`;
    
    // Use filter endpoint if any filters are applied
    const hasFilters = filters.status || filters.department || filters.joiningDateFrom || filters.joiningDateTo;
    
    if (hasFilters) {
      const filterData = {};
      if (filters.status) filterData.status = filters.status;
      if (filters.department) filterData.department = filters.department;
      if (filters.joiningDateFrom) filterData.joiningDateFrom = filters.joiningDateFrom;
      if (filters.joiningDateTo) filterData.joiningDateTo = filters.joiningDateTo;
      
      const { data } = await axios.post(`${API_BASE}/hr/onboarding/filter`, filterData, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      employees.value = Array.isArray(data.data?.employees) ? data.data.employees : [];
    } else {
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      employees.value = Array.isArray(data.data?.employees) ? data.data.employees : Array.isArray(data.data) ? data.data : [];
    }
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    employees.value = [];
  } finally {
    loading.employees = false;
  }
}

async function fetchDepartments() {
  try {
    const { data } = await axios.get(`${API_BASE}/hr/departments`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    departments.value = Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch departments:', error);
  }
}

async function fetchAvailableEmployees() {
  try {
    const { data } = await axios.get(`${API_BASE}/hr/employees/available`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    availableEmployees.value = Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch available employees:', error);
  }
}

async function viewEmployeeDetails(employeeId) {
  try {
    const { data } = await axios.get(`${API_BASE}/hr/onboarding/${employeeId}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    selectedEmployeeDetails.value = data.data || data;
    showDetailsModal.value = true;
  } catch (error) {
    console.error('Failed to fetch employee details:', error);
  }
}

async function reviewDocument(documentId, status) {
  const comments = prompt('Enter review comments (optional):');
  
  try {
    const reviewData = { status };
    if (comments) reviewData.comments = comments;
    
    await axios.put(`${API_BASE}/hr/documents/${documentId}/${status.toLowerCase()}`, reviewData, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    // Refresh employee details
    await viewEmployeeDetails(selectedEmployeeDetails.value.employeeId);
  } catch (error) {
    console.error('Failed to review document:', error);
    alert('Failed to review document');
  }
}

async function completeOnboarding(employeeId) {
  if (!confirm('Are you sure you want to mark this employee\'s onboarding as complete?')) return;
  
  try {
    await axios.put(`${API_BASE}/hr/onboarding/${employeeId}/complete`, {}, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchOnboardingEmployees();
    await fetchDashboard();
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    alert('Failed to complete onboarding');
  }
}

// Modal handlers
function openAddEmployeeModal() {
  showAddEmployeeModal.value = true;
  fetchAvailableEmployees();
}

function closeAddEmployeeModal() {
  showAddEmployeeModal.value = false;
  newEmployee.userId = '';
  newEmployee.department = '';
  newEmployee.designation = '';
  newEmployee.employeeId = '';
  newEmployee.joiningDate = new Date().toISOString().split('T')[0];
}

function closeDetailsModal() {
  showDetailsModal.value = false;
  selectedEmployeeDetails.value = null;
}

async function handleAddEmployee() {
  loading.form = true;
  try {
    // Match exact DTO structure
    const payload = {
      userId: parseInt(newEmployee.userId),
      department: newEmployee.department,
      designation: newEmployee.designation,
      joiningDate: newEmployee.joiningDate,
      employeeId: newEmployee.employeeId
    };

    console.log('Sending payload:', payload);

    await axios.post(`${API_BASE}/hr/onboarding`, payload, {
      headers: { 
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    await fetchOnboardingEmployees();
    await fetchDashboard();
    closeAddEmployeeModal();
  } catch (error) {
    console.error('Failed to add employee:', error);
    console.error('Error response:', error.response?.data);
    
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Unknown error occurred';
    
    alert(`Failed to add employee: ${errorMessage}`);
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

onMounted(async () => {
  await Promise.all([
    fetchDashboard(),
    fetchOnboardingEmployees(),
    fetchDepartments()
  ]);
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #007bff;
  margin: 0;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filters select, .filters input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-fill {
  height: 100%;
  background-color: #4299e1;
  border-radius: 4px;
}

.status-pending { color: #f56565; font-weight: 500; }
.status-in_progress { color: #ed8936; font-weight: 500; }
.status-completed { color: #48bb78; font-weight: 500; }
.status-pending_documents { color: #9f7aea; font-weight: 500; }

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal.large {
  max-width: 900px;
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

.details-section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.task-item, .document-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border-left: 4px solid;
  background: #f8f9fa;
}

.task-item.pending { border-left-color: #ffc107; }
.task-item.completed { border-left-color: #28a745; }

.task-type {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #e9ecef;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.mandatory, .mandatory-doc {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #dc3545;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.document-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.doc-status-pending-review { color: #ffc107; font-weight: 500; }
.doc-status-approved { color: #28a745; font-weight: 500; }
.doc-status-rejected { color: #dc3545; font-weight: 500; }
</style>
