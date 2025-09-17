<template>
  <div>
    <!-- Main Document Review Modal -->
    <div class="modal-backdrop" @click="$emit('close')">
      <div class="modal" @click.stop>
        <h3>Review Documents</h3>
        
        <div v-if="loading">Loading documents...</div>
        <div v-else-if="documents.length === 0">
          <p>No documents submitted by this employee yet.</p>
        </div>
        <div v-else>
          <div class="documents-summary">
            <p><strong>Total Documents:</strong> {{ documents.length }}</p>
            <div class="status-summary">
              <span class="doc-stat pending">{{ pendingCount }} Pending Review</span>
              <span class="doc-stat approved">{{ approvedCount }} Approved</span>
              <span class="doc-stat rejected">{{ rejectedCount }} Rejected</span>
            </div>
          </div>

          <div v-for="doc in documents" :key="doc.documentId" class="document-review-item">
            <div class="doc-header">
              <h4>{{ formatDocumentType(doc.documentType) }}</h4>
              <span :class="'status-badge status-' + doc.status.toLowerCase().replace('_', '-')">
                {{ formatStatus(doc.status) }}
              </span>
            </div>
            
            <div class="doc-details">
              <p><strong>Document Name:</strong> {{ doc.documentName }}</p>
              <p><strong>Document Type:</strong> {{ formatDocumentType(doc.documentType) }}</p>
              <p v-if="doc.submittedAt"><strong>Submitted:</strong> {{ formatDate(doc.submittedAt) }}</p>
              <p v-if="doc.mandatory"><strong>Type:</strong> <span class="mandatory-badge">Mandatory</span></p>
              <p v-else><strong>Type:</strong> Optional</p>
              
              <div class="doc-actions">
                <a v-if="doc.documentUrl" :href="doc.documentUrl" target="_blank" class="btn small">
                  View Document
                </a>
                <span v-else class="no-document">No document URL provided</span>
                
                <div v-if="doc.status === 'PENDING_REVIEW'" class="review-actions">
                  <button 
                    class="btn small success" 
                    @click="reviewDocument(doc.documentId, 'APPROVED')"
                    :disabled="reviewLoading"
                  >
                    Approve
                  </button>
                  <button 
                    class="btn small danger" 
                    @click="openRejectModal(doc)"
                    :disabled="reviewLoading"
                  >
                    Reject
                  </button>
                </div>
              </div>
              
              <div v-if="doc.reviewComments" class="review-comments">
                <p><strong>Review Comments:</strong> {{ doc.reviewComments }}</p>
                <p v-if="doc.reviewedByName && doc.reviewedAt">
                  <small>Reviewed by {{ doc.reviewedByName }} on {{ formatDate(doc.reviewedAt) }}</small>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn" @click="$emit('close')">Close</button>
          <button v-if="documents.length > 0" class="btn primary" @click="refreshDocuments">
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-backdrop" @click="closeRejectModal">
      <div class="modal small" @click.stop>
        <h3>Reject Document</h3>
        <p><strong>Document:</strong> {{ selectedDocument?.documentName }}</p>
        <form @submit.prevent="handleRejectDocument">
          <div class="form-group">
            <label>Reason for Rejection: <span class="required">*</span></label>
            <textarea 
              v-model="rejectionComments" 
              required
              rows="4"
              placeholder="Please provide a reason for rejection..."
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn" @click="closeRejectModal">Cancel</button>
            <button type="submit" class="btn danger" :disabled="reviewLoading">
              Reject Document
            </button>
          </div>
        </form>
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
const API_BASE = 'http://localhost:8080/api/v1';

const loading = ref(false);
const reviewLoading = ref(false);
const documents = ref([]);
const showRejectModal = ref(false);
const selectedDocument = ref(null);
const rejectionComments = ref('');

// Computed properties for document counts
const pendingCount = computed(() => 
  documents.value.filter(doc => doc.status === 'PENDING_REVIEW').length
);
const approvedCount = computed(() => 
  documents.value.filter(doc => doc.status === 'APPROVED').length
);
const rejectedCount = computed(() => 
  documents.value.filter(doc => doc.status === 'REJECTED').length
);

async function fetchDocuments() {
  loading.value = true;
  try {
    console.log(`Fetching documents for employee ID: ${props.employeeId}`);
    const response = await axios.get(`${API_BASE}/api/hr/documents/${props.employeeId}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    console.log('API Response:', response.data);
    
    // Fix: Access the nested data property
    const responseData = response.data;
    if (responseData && responseData.data && Array.isArray(responseData.data)) {
      documents.value = responseData.data;
    } else if (Array.isArray(responseData)) {
      // Fallback if API returns array directly
      documents.value = responseData;
    } else {
      documents.value = [];
      console.warn('Unexpected API response format:', responseData);
    }
    
    console.log('Documents loaded:', documents.value);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    if (error.response?.status === 404) {
      console.log('No documents found for this employee');
      documents.value = [];
    } else {
      alert('Failed to load documents. Please try again.');
    }
  } finally {
    loading.value = false;
  }
}

async function reviewDocument(documentId, status, comments = '') {
  reviewLoading.value = true;
  try {
    const payload = { status };
    if (comments) payload.comments = comments;

    console.log(`Reviewing document ${documentId} with status ${status}`);
    
    // Using the correct endpoint format
    await axios.put(`${API_BASE}/api/hr/documents/${documentId}/review`, payload, {
      headers: { Authorization: `Bearer ${auth.accessToken}` }
    });
    
    alert(`Document ${status.toLowerCase()} successfully!`);
    await fetchDocuments(); // Refresh the documents
    emit('refresh'); // Notify parent component
  } catch (error) {
    console.error('Failed to review document:', error);
    alert('Failed to review document. Please try again.');
  } finally {
    reviewLoading.value = false;
  }
}

function openRejectModal(document) {
  selectedDocument.value = document;
  showRejectModal.value = true;
  rejectionComments.value = '';
}

function closeRejectModal() {
  showRejectModal.value = false;
  selectedDocument.value = null;
  rejectionComments.value = '';
}

async function handleRejectDocument() {
  if (!rejectionComments.value.trim()) {
    alert('Please provide a reason for rejection');
    return;
  }
  
  await reviewDocument(selectedDocument.value.documentId, 'REJECTED', rejectionComments.value);
  closeRejectModal();
}

async function refreshDocuments() {
  await fetchDocuments();
}

function formatDocumentType(type) {
  if (!type) return 'Unknown';
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatStatus(status) {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

onMounted(fetchDocuments);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center; 
  z-index: 1001;
}

.modal {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal.small {
  max-width: 500px;
}

.documents-summary {
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
}

.status-summary {
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

.document-review-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  background-color: white;
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.doc-header h4 {
  margin: 0;
  color: #2d3748;
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

.doc-details p {
  margin: 0.5rem 0;
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

.doc-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.review-actions {
  display: flex;
  gap: 0.5rem;
}

.no-document {
  color: #a0aec0;
  font-style: italic;
}

.review-comments {
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  border-left: 4px solid #4299e1;
}

.review-comments p {
  margin: 0.25rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.required {
  color: #e53e3e;
}

.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  background: white;
  color: #4a5568;
}

.btn:hover {
  opacity: 0.8;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn.primary {
  background-color: #4299e1;
  color: white;
  border-color: #4299e1;
}

.btn.success {
  background-color: #48bb78;
  color: white;
  border-color: #48bb78;
}

.btn.success:hover {
  background-color: #38a169;
}

.btn.danger {
  background-color: #e53e3e;
  color: white;
  border-color: #e53e3e;
}

.btn.danger:hover {
  background-color: #c53030;
}
</style>
