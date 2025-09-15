<template>
  <div class="document-review">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Document Review - {{ employeeName }}</h3>
      <button @click="$emit('close')" class="btn btn-outline-secondary">
        <i class="fas fa-times"></i> Close
      </button>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="documents.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      No documents submitted for review.
    </div>

    <div v-else>
      <div v-for="document in documents" :key="document.documentId" class="card mb-3">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-3">
              <h6 class="mb-1">{{ document.documentName }}</h6>
              <StatusBadge :status="document.status" type="document" />
              <div v-if="document.mandatory" class="mt-1">
                <span class="badge bg-warning text-dark">Mandatory</span>
              </div>
            </div>
            
            <div class="col-md-3">
              <small class="text-muted">Submitted:</small><br>
              <span>{{ formatDate(document.submittedAt) }}</span>
            </div>
            
            <div class="col-md-3">
              <a 
                :href="document.documentUrl" 
                target="_blank" 
                class="btn btn-outline-primary btn-sm"
              >
                <i class="fas fa-eye"></i> View Document
              </a>
            </div>
            
            <div class="col-md-3 text-end">
              <button 
                v-if="document.status === 'PENDING_REVIEW'"
                @click="showReviewModal(document)"
                class="btn btn-primary btn-sm me-2"
              >
                <i class="fas fa-gavel"></i> Review
              </button>
              <button 
                v-if="document.status === 'PENDING_REVIEW'"
                @click="quickApprove(document)"
                class="btn btn-success btn-sm me-2"
              >
                <i class="fas fa-check"></i> Quick Approve
              </button>
              <button 
                v-if="document.status === 'PENDING_REVIEW'"
                @click="quickReject(document)"
                class="btn btn-danger btn-sm"
              >
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
          
          <!-- Review Comments -->
          <div v-if="document.reviewComments" class="mt-3 pt-3 border-top">
            <div class="row">
              <div class="col-md-8">
                <strong>Review Comments:</strong>
                <p class="mb-0 text-muted">{{ document.reviewComments }}</p>
              </div>
              <div class="col-md-4 text-end">
                <small class="text-muted">
                  Reviewed by: {{ document.reviewedByName }}<br>
                  {{ formatDate(document.reviewedAt) }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Review Document: {{ selectedDocument?.documentName }}</h5>
            <button type="button" class="btn-close" @click="closeReviewModal"></button>
          </div>
          
          <form @submit.prevent="submitReview">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Decision *</label>
                <div class="btn-group w-100" role="group">
                  <input 
                    type="radio" 
                    class="btn-check" 
                    id="approve" 
                    v-model="reviewData.status" 
                    value="APPROVED"
                  >
                  <label class="btn btn-outline-success" for="approve">
                    <i class="fas fa-check me-1"></i> Approve
                  </label>
                  
                  <input 
                    type="radio" 
                    class="btn-check" 
                    id="reject" 
                    v-model="reviewData.status" 
                    value="REJECTED"
                  >
                  <label class="btn btn-outline-danger" for="reject">
                    <i class="fas fa-times me-1"></i> Reject
                  </label>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="comments" class="form-label">
                  Comments {{ reviewData.status === 'REJECTED' ? '*' : '' }}
                </label>
                <textarea
                  id="comments"
                  v-model="reviewData.comments"
                  class="form-control"
                  rows="3"
                  :placeholder="reviewData.status === 'APPROVED' ? 'Optional comments...' : 'Please provide reason for rejection...'"
                  :required="reviewData.status === 'REJECTED'"
                ></textarea>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeReviewModal">
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="!reviewData.status || reviewing"
              >
                <span v-if="reviewing" class="spinner-border spinner-border-sm me-2"></span>
                {{ reviewing ? 'Submitting...' : 'Submit Review' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import documentService from '@/api/documentService.js'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps({
  employeeId: {
    type: [String, Number],
    required: true
  },
  employeeName: {
    type: String,
    default: 'Employee'
  }
})

const emit = defineEmits(['close', 'reviewed'])

const documents = ref([])
const loading = ref(false)
const showModal = ref(false)
const selectedDocument = ref(null)
const reviewing = ref(false)

const reviewData = reactive({
  status: '',
  comments: ''
})

const loadDocuments = async () => {
  try {
    loading.value = true
    const response = await documentService.getDocumentsForReview(props.employeeId)
    documents.value = response.data.data || []
  } catch (error) {
    console.error('Error loading documents:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showReviewModal = (document) => {
  selectedDocument.value = document
  reviewData.status = ''
  reviewData.comments = ''
  showModal.value = true
}

const closeReviewModal = () => {
  showModal.value = false
  selectedDocument.value = null
  reviewData.status = ''
  reviewData.comments = ''
}

const quickApprove = async (document) => {
  try {
    await documentService.approveDocument(document.documentId, 'Quick approval')
    loadDocuments()
    emit('reviewed')
  } catch (error) {
    console.error('Error approving document:', error)
    alert('Failed to approve document. Please try again.')
  }
}

const quickReject = (document) => {
  selectedDocument.value = document
  reviewData.status = 'REJECTED'
  reviewData.comments = ''
  showModal.value = true
}

const submitReview = async () => {
  if (!reviewData.status) return
  
  try {
    reviewing.value = true
    
    if (reviewData.status === 'APPROVED') {
      await documentService.approveDocument(selectedDocument.value.documentId, reviewData.comments)
    } else {
      await documentService.rejectDocument(selectedDocument.value.documentId, reviewData.comments)
    }
    
    closeReviewModal()
    loadDocuments()
    emit('reviewed')
    
  } catch (error) {
    console.error('Error reviewing document:', error)
    alert('Failed to submit review. Please try again.')
  } finally {
    reviewing.value = false
  }
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.document-review {
  padding: 20px;
}

.card {
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-group .btn-check:checked + .btn {
  background-color: var(--bs-success) !important;
  border-color: var(--bs-success) !important;
  color: white !important;
}

.btn-group .btn-check:checked + .btn-outline-danger {
  background-color: var(--bs-danger) !important;
  border-color: var(--bs-danger) !important;
}
</style>
