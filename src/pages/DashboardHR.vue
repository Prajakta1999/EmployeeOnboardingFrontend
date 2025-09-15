<template>
  <AppLayout>
    <div class="hr-dashboard">
      <div class="container-fluid">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>HR Dashboard</h2>
            <p class="text-muted mb-0">Manage employee onboarding process</p>
          </div>
          <button @click="showAddEmployeeModal = true" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>Add Employee to Onboarding
          </button>
        </div>

        <!-- Stats Dashboard -->
        <HRStats @view-employee="viewEmployeeDetails" ref="statsComponent" />

        <!-- Tabs -->
        <div class="card mt-4">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  :class="{ active: activeTab === 'available' }"
                  @click="activeTab = 'available'"
                  href="#"
                >
                  <i class="fas fa-users me-2"></i>Available Employees
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  :class="{ active: activeTab === 'onboarding' }"
                  @click="activeTab = 'onboarding'"
                  href="#"
                >
                  <i class="fas fa-clipboard-list me-2"></i>In Onboarding
                </a>
              </li>
              <li class="nav-item">
                <a 
                  class="nav-link" 
                  :class="{ active: activeTab === 'documents' }"
                  @click="activeTab = 'documents'"
                  href="#"
                >
                  <i class="fas fa-file-alt me-2"></i>Document Review
                </a>
              </li>
            </ul>
          </div>
          
          <div class="card-body">
            <!-- Available Employees Tab -->
            <div v-if="activeTab === 'available'">
              <EmployeeList ref="employeeListComponent" />
            </div>

            <!-- Onboarding Employees Tab -->
            <div v-if="activeTab === 'onboarding'">
              <OnboardingEmployeeList ref="onboardingListComponent" />
            </div>

            <!-- Document Review Tab -->
            <div v-if="activeTab === 'documents'">
              <div v-if="!selectedEmployeeForReview" class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="text-muted">Select an employee from the onboarding list to review their documents</p>
                <button @click="activeTab = 'onboarding'" class="btn btn-outline-primary">
                  Go to Onboarding List
                </button>
              </div>
              
              <DocumentReview
                v-else
                :employee-id="selectedEmployeeForReview.employeeId"
                :employee-name="selectedEmployeeForReview.employeeName"
                @close="selectedEmployeeForReview = null"
                @reviewed="onDocumentReviewed"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Add Employee Modal -->
      <div v-if="showAddEmployeeModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-lg">
          <EmployeeList @employee-added="onEmployeeAdded" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import HRStats from '@/components/hr/HRStats.vue'
import EmployeeList from '@/components/hr/EmployeeList.vue'
import OnboardingEmployeeList from '@/components/hr/OnboardingEmployeeList.vue'
import DocumentReview from '@/components/hr/DocumentReview.vue'

const router = useRouter()

const activeTab = ref('available')
const showAddEmployeeModal = ref(false)
const selectedEmployeeForReview = ref(null)

// Component refs
const statsComponent = ref(null)
const employeeListComponent = ref(null)
const onboardingListComponent = ref(null)

const viewEmployeeDetails = (employee) => {
  selectedEmployeeForReview.value = employee
  activeTab.value = 'documents'
}

const onEmployeeAdded = () => {
  showAddEmployeeModal.value = false
  // Refresh all components
  statsComponent.value?.refresh()
  employeeListComponent.value?.refresh()
  onboardingListComponent.value?.refresh()
}

const onDocumentReviewed = () => {
  // Refresh stats when documents are reviewed
  statsComponent.value?.refresh()
}
</script>

<style scoped>
.hr-dashboard {
  padding: 20px;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  background-color: #f8f9fa;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.nav-tabs .nav-link:hover {
  color: #007bff;
  background-color: #f8f9fa;
}
</style>
