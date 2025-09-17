<template>
  <div class="modal-backdrop" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>{{ hasExistingDocuments ? 'Update Documents' : 'Submit Documents' }}</h3>
      
      <!-- Show existing documents if any -->
      <div v-if="hasExistingDocuments" class="existing-documents">
        <h4>Current Documents</h4>
        <div class="document-list">
          <div v-for="doc in documents" :key="doc.documentId" class="document-item">
            <div class="document-info">
              <span class="document-type">{{ formatDocumentType(doc.documentType) }}</span>
              <span :class="['status-badge', getStatusClass(doc.status)]">
                {{ doc.status }}
              </span>
            </div>
            <div class="document-actions">
              <a :href="doc.documentUrl" target="_blank" class="btn small secondary">
                View Document
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>ID Proof * (Required)</label>
          <input 
            type="url" 
            v-model="formData.idProofUrl" 
            placeholder="https://example.com/id-proof.pdf"
            required
            :class="{ 'has-existing': getExistingDocument('ID_PROOF') }"
          />
          <small v-if="getExistingDocument('ID_PROOF')">
            Currently: {{ getExistingDocument('ID_PROOF').status }} - 
            <a :href="getExistingDocument('ID_PROOF').documentUrl" target="_blank">View Current</a>
          </small>
          <small v-else>Upload your ID proof document and paste the URL here</small>
        </div>

        <div class="form-group">
          <label>PAN/Aadhar (Optional)</label>
          <input 
            type="url" 
            v-model="formData.panAadharUrl" 
            placeholder="https://example.com/pan-aadhar.pdf"
            :class="{ 'has-existing': getExistingDocument('PAN_AADHAR') }"
          />
          <small v-if="getExistingDocument('PAN_AADHAR')">
            Currently: {{ getExistingDocument('PAN_AADHAR').status }} - 
            <a :href="getExistingDocument('PAN_AADHAR').documentUrl" target="_blank">View Current</a>
          </small>
          <small v-else>Upload your PAN or Aadhar document and paste the URL here</small>
        </div>

        <div class="form-group">
          <label>Bank Details (Optional)</label>
          <input 
            type="url" 
            v-model="formData.bankDetailsUrl" 
            placeholder="https://example.com/bank-details.pdf"
            :class="{ 'has-existing': getExistingDocument('BANK_DETAILS') }"
          />
          <small v-if="getExistingDocument('BANK_DETAILS')">
            Currently: {{ getExistingDocument('BANK_DETAILS').status }} - 
            <a :href="getExistingDocument('BANK_DETAILS').documentUrl" target="_blank">View Current</a>
          </small>
          <small v-else>Upload your bank account details document and paste the URL here</small>
        </div>

        <div class="form-group">
          <label>Offer Letter Acceptance * (Required)</label>
          <input 
            type="url" 
            v-model="formData.offerLetterUrl" 
            placeholder="https://example.com/offer-letter.pdf"
            required
            :class="{ 'has-existing': getExistingDocument('OFFER_LETTER') }"
          />
          <small v-if="getExistingDocument('OFFER_LETTER')">
            Currently: {{ getExistingDocument('OFFER_LETTER').status }} - 
            <a :href="getExistingDocument('OFFER_LETTER').documentUrl" target="_blank">View Current</a>
          </small>
          <small v-else>Upload your signed offer letter and paste the URL here</small>
        </div>

        <div class="form-note">
          <p><strong>Note:</strong> Please upload your documents to a cloud storage service (Google Drive, Dropbox, etc.) 
          and make sure the links are publicly accessible, then paste the URLs above.</p>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>

        <div class="modal-actions">
          <button type="button" class="btn" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn primary" :disabled="loading">
            {{ loading ? 'Submitting...' : (hasExistingDocuments ? 'Update Documents' : 'Submit Documents') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const emit = defineEmits(['close', 'refresh']);
const auth = useAuthStore();

// FIXED: Use consistent API base URL
const API_BASE = 'http://localhost:8080/api/v1/api';

const loading = ref(false);
const documents = ref([]);
const error = ref('');
const success = ref('');
const fetchCalled = ref(false); // Prevent duplicate calls

const formData = reactive({
  idProofUrl: '',
  panAadharUrl: '',
  bankDetailsUrl: '',
  offerLetterUrl: ''
});

// Computed properties
const hasExistingDocuments = computed(() => documents.value.length > 0);

// Helper functions
function formatDocumentType(type) {
  const typeMap = {
    'ID_PROOF': 'ID Proof',
    'PAN_AADHAR': 'PAN/Aadhar',
    'BANK_DETAILS': 'Bank Details',
    'OFFER_LETTER': 'Offer Letter'
  };
  return typeMap[type] || type;
}

function getStatusClass(status) {
  const statusMap = {
    'PENDING': 'status-pending',
    'APPROVED': 'status-approved',
    'REJECTED': 'status-rejected',
    'SUBMITTED': 'status-submitted'
  };
  return statusMap[status] || 'status-default';
}

function getExistingDocument(documentType) {
  return documents.value.find(doc => doc.documentType === documentType);
}

function clearMessages() {
  error.value = '';
  success.value = '';
}

// FIXED: Prevent duplicate API calls
async function fetchExistingDocuments() {
  if (fetchCalled.value) return; // Prevent duplicate calls
  fetchCalled.value = true;
  
  try {
    console.log('Fetching existing documents...');
    const response = await axios.get(`${API_BASE}/employee/documents`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    console.log('Documents API response:', response.data);
    
    // Handle different response structures
    let documentsData = [];
    if (response.data.data && Array.isArray(response.data.data)) {
      documentsData = response.data.data;
    } else if (Array.isArray(response.data)) {
      documentsData = response.data;
    } else if (response.data.documents && Array.isArray(response.data.documents)) {
      documentsData = response.data.documents;
    }
    
    documents.value = documentsData;
    console.log('Parsed documents:', documents.value);
    
    // Pre-fill form with existing document URLs
    documents.value.forEach(doc => {
      switch(doc.documentType) {
        case 'ID_PROOF':
          formData.idProofUrl = doc.documentUrl || '';
          break;
        case 'PAN_AADHAR':
          formData.panAadharUrl = doc.documentUrl || '';
          break;
        case 'BANK_DETAILS':
          formData.bankDetailsUrl = doc.documentUrl || '';
          break;
        case 'OFFER_LETTER':
          formData.offerLetterUrl = doc.documentUrl || '';
          break;
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    // Don't show error for initial fetch failure (might be no documents exist)
    if (error.response?.status !== 404) {
      error.value = 'Failed to load existing documents';
    }
  }
}

async function handleSubmit() {
  clearMessages();
  loading.value = true;
  
  try {
    console.log('Submitting documents:', formData);
    
    // Validate required fields
    if (!formData.idProofUrl || !formData.offerLetterUrl) {
      throw new Error('ID Proof and Offer Letter are required');
    }
    
    // Validate URLs
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(formData.idProofUrl)) {
      throw new Error('ID Proof URL must be a valid HTTP/HTTPS URL');
    }
    if (!urlPattern.test(formData.offerLetterUrl)) {
      throw new Error('Offer Letter URL must be a valid HTTP/HTTPS URL');
    }
    
    const response = await axios.put(`${API_BASE}/employee/documents`, formData, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    console.log('Submit response:', response.data);
    success.value = 'Documents submitted successfully!';
    
    // Wait a moment to show success message
    setTimeout(() => {
      emit('refresh');
      emit('close');
    }, 1500);
    
  } catch (error) {
    console.error('Failed to submit documents:', error);
    
    if (error.response?.status === 400) {
      error.value = error.response.data?.message || 'Invalid document data provided';
    } else if (error.response?.status === 403) {
      error.value = 'You do not have permission to submit documents';
    } else if (error.message) {
      error.value = error.message;
    } else {
      error.value = 'Failed to submit documents. Please check the URLs are valid and accessible.';
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchExistingDocuments();
});
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
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

/* Existing Documents Section */
.existing-documents {
  background-color: #f7fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.existing-documents h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.document-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.document-type {
  font-weight: 500;
  color: #2d3748;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background: #fef5e7;
  color: #c05621;
}

.status-approved {
  background: #f0fff4;
  color: #22543d;
}

.status-rejected {
  background: #fed7d7;
  color: #c53030;
}

.status-submitted {
  background: #ebf8ff;
  color: #2c5282;
}

.status-default {
  background: #edf2f7;
  color: #4a5568;
}

.document-actions {
  display: flex;
  gap: 0.5rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-group input.has-existing {
  border-color: #48bb78;
  background-color: #f0fff4;
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #718096;
  font-size: 0.8rem;
}

.form-group small a {
  color: #4299e1;
  text-decoration: none;
}

.form-group small a:hover {
  text-decoration: underline;
}

.form-note {
  background-color: #edf2f7;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
}

.form-note p {
  margin: 0;
  font-size: 0.9rem;
  color: #4a5568;
}

/* Message Styles */
.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #fc8181;
}

.success-message {
  background: #f0fff4;
  color: #22543d;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border: 1px solid #9ae6b4;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
