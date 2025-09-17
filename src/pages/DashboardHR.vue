<template>
  <div>
    <div class="header">
      <h2>HR Dashboard</h2>
      <button class="btn primary" @click="openEmployeeModal()">Add Employee to Onboarding</button>
    </div>
    
    <div v-if="loading.dashboard" class="card">Loading dashboard...</div>
    <div v-else class="stats-grid">
      <div class="stat-card">
        <h3>{{ dashboard.totalEmployeesOnboarded }}</h3>
        <p>Total Onboarded</p>
      </div>
      <div class="stat-card">
        <h3>{{ dashboard.employeesInProgress }}</h3>
        <p>In Progress</p>
      </div>
      <div class="stat-card">
        <h3>{{ dashboard.employeesWithPendingTasks }}</h3>
        <p>Pending Tasks</p>
      </div>
      <div class="stat-card">
        <h3>{{ dashboard.employeesWithPendingDocuments }}</h3>
        <p>Pending Documents</p>
      </div>
    </div>
    
    <div class="card">
      <h3>Filter Employees</h3>
      <div class="filter-row">
        <select v-model="filters.department">
          <option value="">All Departments</option>
          <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
        </select>
        <select v-model="filters.status">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING_DOCUMENTS">Pending Documents</option>
        </select>
        <input type="date" v-model="filters.joiningDateFrom" placeholder="From Date">
        <input type="date" v-model="filters.joiningDateTo" placeholder="To Date">
        <button class="btn" @click="applyFilters">Apply Filters</button>
        <button class="btn secondary" @click="clearFilters">Clear</button>
      </div>
    </div>
    
    <div v-if="loading.employees" class="card">Loading employees...</div>
    <div v-else-if="employees.length === 0" class="card">
      <p>No employees found matching your criteria.</p>
    </div>
    <div v-else class="card-grid">
      <div v-for="employee in employees" :key="employee.employeeId" class="employee-card">
        <h3>{{ employee.employeeName }}</h3>
        <p><strong>Email:</strong> {{ employee.email }}</p>
        <p><strong>Department:</strong> {{ employee.department }}</p>
        <p><strong>Designation:</strong> {{ employee.designation }}</p>
        <p><strong>Employee ID:</strong> {{ employee.employeeIdNumber }}</p>
        <p><strong>Joining Date:</strong> {{ employee.joiningDate }}</p>
        <p><strong>Status:</strong> 
          <span :class="'status-badge status-' + employee.status.toLowerCase()">
            {{ employee.status.replace('_', ' ') }}
          </span>
        </p>
        <p><strong>Progress:</strong> {{ employee.completionPercentage }}%</p>
        <p><strong>Tasks:</strong> {{ employee.completedTasks }}/{{ employee.totalTasks }}</p>
        <p><strong>Documents:</strong> {{ employee.approvedDocuments }}/{{ employee.totalDocuments }}</p>
        
        <div v-if="employee.status !== 'COMPLETED' && !canCompleteOnboarding(employee)" class="warning-message">
          <p><strong>⚠️ Cannot complete onboarding:</strong></p>
          <ul>
            <li v-if="employee.completedTasks < employee.totalTasks">
              {{ employee.totalTasks - employee.completedTasks }} tasks remaining
            </li>
            <li v-if="employee.approvedDocuments < employee.totalDocuments">
              {{ employee.totalDocuments - employee.approvedDocuments }} documents pending approval
            </li>
          </ul>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: employee.completionPercentage + '%' }"></div>
        </div>
        
        <div class="actions">
          <button class="btn small" @click="viewEmployeeDetails(employee.employeeId)">View Details</button>
          <button class="btn small" @click="reviewDocuments(employee.employeeId)">Review Documents</button>
          <button 
            v-if="employee.status === 'COMPLETED'"
            class="btn small success"
            disabled
          >
            ✅ Completed
          </button>
          <button 
            v-else-if="canCompleteOnboarding(employee)"
            class="btn small primary" 
            @click="completeOnboarding(employee.employeeId)"
            :disabled="loading.completion[employee.employeeId]"
          >
            {{ loading.completion[employee.employeeId] ? 'Completing...' : 'Complete Onboarding' }}
          </button>
          <button 
            v-else
            class="btn small disabled" 
            disabled
            :title="getCompletionBlockedReason(employee)"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showEmployeeModal" class="modal-backdrop" @click="closeEmployeeModal">
      <div class="modal" @click.stop>
        <h3>Add Employee to Onboarding</h3>
        <div v-if="loading.availableEmployees">Loading available employees...</div>
        <div v-else>
          <form @submit.prevent="handleAddEmployee">
            <div class="form-group">
              <label>Select Employee:</label>
              <select v-model="newEmployee.userId" required>
                <option value="">Choose an employee</option>
                <option v-for="emp in availableEmployees" :key="emp.userId" :value="emp.userId">
                  {{ emp.name }} - {{ emp.email }}
                </option>
                <option v-if="!loading.availableEmployees && availableEmployees.length === 0" disabled>
                  No available employees
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Department:</label>
              <input type="text" v-model="newEmployee.department" required>
            </div>
            <div class="form-group">
              <label>Designation:</label>
              <input type="text" v-model="newEmployee.designation" required>
            </div>
            <div class="form-group">
              <label>Employee ID:</label>
              <input type="text" v-model="newEmployee.employeeId" required>
            </div>
            <div class="form-group">
              <label>Joining Date:</label>
              <input type="date" v-model="newEmployee.joiningDate" required>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" @click="closeEmployeeModal">Cancel</button>
              <button type="submit" class="btn primary" :disabled="loading.form">Add Employee</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <DocumentReview 
      v-if="showDocumentReview"
      :employeeId="selectedEmployeeId"
      @close="closeDocumentReview"
      @refresh="fetchEmployees"
    />
    
    <EmployeeDetail
      v-if="showEmployeeDetail"
      :employeeId="selectedEmployeeId"
      @close="closeEmployeeDetail"
    />

    <div v-if="notification.show" :class="['notification', notification.type]">
      {{ notification.message }}
      <button @click="closeNotification" class="close-btn">&times;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import DocumentReview from '@/components/hr/DocumentReview.vue';
import EmployeeDetail from '@/components/hr/EmployeeDetail.vue';

const auth = useAuthStore();
// FIXED: The API base URL was incorrect, it had an extra '/api'
const API_BASE = 'http://localhost:8080/api/v1/api';

// State
const dashboard = ref({});
const employees = ref([]);
const departments = ref([]);
const availableEmployees = ref([]);
const showEmployeeModal = ref(false);
const showDocumentReview = ref(false);
const showEmployeeDetail = ref(false);
const selectedEmployeeId = ref(null);

const loading = reactive({
  dashboard: false,
  employees: false,
  availableEmployees: false,
  form: false,
  completion: {} // Track completion loading per employee
});

const filters = reactive({
  department: '',
  status: '',
  joiningDateFrom: '',
  joiningDateTo: ''
});

const newEmployee = reactive({
  userId: '',
  department: '',
  designation: '',
  employeeId: '',
  joiningDate: ''
});

// Notification system
const notification = reactive({
  show: false,
  message: '',
  type: 'info' // 'success', 'error', 'warning', 'info'
});

// Watch for modal opening to fetch employees
watch(showEmployeeModal, (newValue) => {
  if (newValue) {
    fetchAvailableEmployees();
  }
});

// Helper functions
function canCompleteOnboarding(employee) {
  return employee.status !== 'COMPLETED' && 
         employee.completedTasks === employee.totalTasks &&
         employee.approvedDocuments === employee.totalDocuments &&
         employee.completionPercentage === 100;
}

function getCompletionBlockedReason(employee) {
  if (employee.status === 'COMPLETED') {
    return 'Onboarding already completed';
  }
  
  const reasons = [];
  if (employee.completedTasks < employee.totalTasks) {
    reasons.push(`${employee.totalTasks - employee.completedTasks} tasks remaining`);
  }
  if (employee.approvedDocuments < employee.totalDocuments) {
    reasons.push(`${employee.totalDocuments - employee.approvedDocuments} documents pending`);
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Requirements not met';
}

function showNotification(message, type = 'info') {
  notification.message = message;
  notification.type = type;
  notification.show = true;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.show = false;
  }, 5000);
}

function closeNotification() {
  notification.show = false;
}

// API calls
async function fetchDashboard() {
  loading.dashboard = true;
  try {
    const response = await axios.get(`${API_BASE}/hr/dashboard`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    dashboard.value = response.data.data || {};
    
    if (response.data.data && response.data.data.recentOnboardings) {
      employees.value = response.data.data.recentOnboardings;
    }
    
    console.log('Dashboard data:', dashboard.value);
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    showNotification('Failed to load dashboard data', 'error');
  } finally {
    loading.dashboard = false;
  }
}

async function fetchEmployees() {
  loading.employees = true;
  try {
    const response = await axios.get(`${API_BASE}/hr/onboarding`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    const responseData = response.data;
    
    if (responseData.data && responseData.data.recentOnboardings) {
      employees.value = responseData.data.recentOnboardings;
    } else if (responseData.data && Array.isArray(responseData.data.employees)) {
      employees.value = responseData.data.employees;
    } else if (Array.isArray(responseData.employees)) {
      employees.value = responseData.employees;
    } else if (Array.isArray(responseData.data)) {
      employees.value = responseData.data;
    } else {
      employees.value = [];
    }
    
    console.log('Fetched employees:', employees.value);
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    showNotification('Failed to load employees', 'error');
    employees.value = [];
  } finally {
    loading.employees = false;
  }
}

async function fetchDepartments() {
  try {
    const response = await axios.get(`${API_BASE}/hr/departments`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    const responseData = response.data;
    if (responseData.data && Array.isArray(responseData.data)) {
      departments.value = responseData.data;
    } else if (Array.isArray(responseData)) {
      departments.value = responseData;
    } else {
      departments.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    showNotification('Failed to load departments', 'error');
  }
}

async function fetchAvailableEmployees() {
  loading.availableEmployees = true;
  try {
    const response = await axios.get(`${API_BASE}/hr/employees/available`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    const responseData = response.data;
    availableEmployees.value = Array.isArray(responseData.data) ? responseData.data : [];
    
    console.log('Fetched available employees:', availableEmployees.value);
  } catch (error) {
    console.error('Failed to fetch available employees:', error);
    showNotification('Failed to load available employees', 'error');
    availableEmployees.value = [];
  } finally {
    loading.availableEmployees = false;
  }
}

async function applyFilters() {
  loading.employees = true;
  try {
    const params = {};
    if (filters.department) params.department = filters.department;
    if (filters.status) params.status = filters.status;
    if (filters.joiningDateFrom) params.joiningDateFrom = filters.joiningDateFrom;
    if (filters.joiningDateTo) params.joiningDateTo = filters.joiningDateTo;
    
    const response = await axios.post(`${API_BASE}/hr/onboarding/filter`, params, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    const responseData = response.data;
    if (responseData.data && responseData.data.recentOnboardings) {
      employees.value = responseData.data.recentOnboardings;
    } else if (responseData.data && Array.isArray(responseData.data.employees)) {
      employees.value = responseData.data.employees;
    } else if (Array.isArray(responseData.employees)) {
      employees.value = responseData.employees;
    } else if (Array.isArray(responseData.data)) {
      employees.value = responseData.data;
    } else {
      employees.value = [];
    }
  } catch (error) {
    console.error('Failed to apply filters:', error);
    showNotification('Failed to apply filters', 'error');
  } finally {
    loading.employees = false;
  }
}

function clearFilters() {
  filters.department = '';
  filters.status = '';
  filters.joiningDateFrom = '';
  filters.joiningDateTo = '';
  fetchEmployees();
}

// Modal functions
function openEmployeeModal() {
  showEmployeeModal.value = true;
}

function closeEmployeeModal() {
  showEmployeeModal.value = false;
  Object.assign(newEmployee, {
    userId: '',
    department: '',
    designation: '',
    employeeId: '',
    joiningDate: ''
  });
}

async function handleAddEmployee() {
  loading.form = true;
  try {
    await axios.post(`${API_BASE}/hr/onboarding`, newEmployee, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    await fetchEmployees();
    await fetchDashboard();
    showNotification('Employee added to onboarding successfully', 'success');
    closeEmployeeModal();
  } catch (error) {
    console.error('Failed to add employee:', error);
    const errorMessage = error.response?.data?.message || 'Failed to add employee to onboarding';
    showNotification(errorMessage, 'error');
  } finally {
    loading.form = false;
  }
}

function viewEmployeeDetails(employeeId) {
  selectedEmployeeId.value = employeeId;
  showEmployeeDetail.value = true;
}

function closeEmployeeDetail() {
  showEmployeeDetail.value = false;
  selectedEmployeeId.value = null;
}

function reviewDocuments(employeeId) {
  selectedEmployeeId.value = employeeId;
  showDocumentReview.value = true;
}

function closeDocumentReview() {
  showDocumentReview.value = false;
  selectedEmployeeId.value = null;
}

// FIXED: Complete onboarding function with proper error handling
async function completeOnboarding(employeeId) {
  // Find the employee to check current status
  const employee = employees.value.find(emp => emp.employeeId === employeeId);
  
  if (!employee) {
    showNotification('Employee not found', 'error');
    return;
  }

  // Pre-validation checks
  if (employee.status === 'COMPLETED') {
    showNotification('This employee\'s onboarding is already completed', 'warning');
    return;
  }

  if (!canCompleteOnboarding(employee)) {
    showNotification(
      `Cannot complete onboarding: ${getCompletionBlockedReason(employee)}`, 
      'warning'
    );
    return;
  }

  // Confirm action
  if (!confirm(`Are you sure you want to complete ${employee.employeeName}'s onboarding?`)) {
    return;
  }
  
  // Set loading state for this specific employee
  loading.completion[employeeId] = true;
  
  try {
    // Make the API call
    await axios.put(`${API_BASE}/hr/onboarding/${employeeId}/complete`, {}, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    // Success - refresh data and show success message
    await fetchEmployees();
    await fetchDashboard();
    showNotification(`${employee.employeeName}'s onboarding completed successfully!`, 'success');
    
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    
    // Handle specific error types
    if (error.response?.status === 409) {
      // Handle 409 Conflict specifically
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          'Onboarding completion conflicts with current state';
      
      showNotification(`Cannot complete onboarding: ${errorMessage}`, 'error');
      
      // Log detailed error for debugging
      console.log('409 Conflict Details:', {
        status: error.response.status,
        data: error.response.data,
        employee: employee
      });
      
    } else if (error.response?.status === 404) {
      showNotification('Employee onboarding record not found', 'error');
    } else if (error.response?.status === 403) {
      showNotification('You do not have permission to complete this onboarding', 'error');
    } else {
      // Generic error handling
      const errorMessage = error.response?.data?.message || 
                          'Failed to complete onboarding. Please try again.';
      showNotification(errorMessage, 'error');
    }
    
    // Refresh employee data in case status changed
    await fetchEmployees();
    
  } finally {
    // Clear loading state
    loading.completion[employeeId] = false;
  }
}

onMounted(() => {
  fetchDashboard();
  fetchEmployees();
  fetchDepartments();
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stat-card h3 {
  font-size: 2rem;
  margin: 0;
}

.stat-card p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-row select,
.filter-row input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.employee-card {
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 8px;
  background: white;
}

.employee-card h3 {
  margin-top: 0;
  color: #2d3748;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-pending { background: #fed7d7; color: #c53030; }
.status-in_progress { background: #bee3f8; color: #2b6cb0; }
.status-completed { background: #c6f6d5; color: #2f855a; }
.status-pending_documents { background: #faf5ff; color: #805ad5; }

.warning-message {
  background: #fef5e7;
  border: 1px solid #f6ad55;
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.warning-message p {
  margin: 0 0 0.5rem 0;
  color: #c05621;
  font-weight: 500;
}

.warning-message ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #c05621;
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
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

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
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
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
}

.btn.success {
  background: #48bb78;
  color: white;
  border-color: #48bb78;
}

.btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn:hover:not(:disabled) {
  opacity: 0.8;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Notification styles */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1100;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification.success {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #22543d;
}

.notification.error {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #742a2a;
}

.notification.warning {
  background: #fef5e7;
  border: 1px solid #f6ad55;
  color: #c05621;
}

.notification.info {
  background: #ebf8ff;
  border: 1px solid #90cdf4;
  color: #2c5282;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.6;
  margin-left: auto;
}

.close-btn:hover {
  opacity: 1;
}
</style>