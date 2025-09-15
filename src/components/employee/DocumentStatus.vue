<template>
  <div class="document-status">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-file-alt me-2"></i>
          Document Status
        </h5>
      </div>
      
      <div class="card-body">
        <LoadingSpinner v-if="loading" />
        
        <div v-else-if="documents.length === 0" class="text-center py-4">
          <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
          <p class="text-muted">No documents submitted yet</p>
          <button @click="$emit('upload-documents')" class="btn btn-primary">
            <i class="fas fa-upload me-2"></i>Submit Documents
          </button>
        </div>
        
        <div v-else>
          <div v-for="document in documents" :key="document.documentId" class="document-item mb-3">
            <div class="card border-0 bg-light">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-4">
                    <h6 class="mb-1">{{ document.documentName }}</h6>
                    <div class="d-flex align-items-center gap-2">
                      <StatusBadge :status="document.status" type="document" />
                      <span v-if="document.mandatory" class="badge bg-warning text-dark">Required</span>
                    </div>
                  </div>
                  
                  <div class="col-md-3">
                    <small class="text-muted">Submitted:</small><br>
                    <span>{{ formatDate(document.submittedAt) }}</span>
                  </div>
                  
                  <div class="col-md-3">
                    <div v-if="document.reviewedAt">
                      <small class="text-muted">Reviewed:</small><br>
                      <span>{{ formatDate(document.reviewedAt) }}</span>
                    </div>
                    <div v-else class="text-muted">
                      <small>Pending review...</small>
                    </div>
                  </div>
                  
                  <div class="col-md-2 text-end">
                    <a :href="document.documentUrl" target="_blank" class="btn btn-sm btn-outline-primary me-2">
                      <i class="fas fa-eye"></i>
                    </a>
                    <button 
                      v-if="document.status === 'REJECTED'"
                      @click="updateDocument(document)"
                      class="btn btn-sm btn-warning"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                </div>
                
                <div v-if="document.reviewComments" class="mt-3 pt-3 border-top">
                  <strong class="text-muted">Review Comments:</strong>
                  <p class="mb-0 mt-1">{{ document.reviewComments }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-4">
            <button @click="$emit('upload-documents')" class="btn btn-outline-primary">
              <i class="fas fa-plus me-2"></i>Update Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import documentService from '@/api/documentService.js'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const emit = defineEmits(['upload-documents', 'update-document'])

const documents = ref([])
const loading = ref(false)

const loadDocuments = async () => {
  try {
    loading.value = true
    const response = await documentService.getEmployeeDocuments()
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
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const updateDocument = (document) => {
  emit('update-document', document)
}

onMounted(() => {
  loadDocuments()
})

defineExpose({
  refresh: loadDocuments
})
</script>
