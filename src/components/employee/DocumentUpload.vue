<template>
  <div class="document-upload">
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fas fa-upload me-2"></i>
          Document Submission
        </h5>
      </div>
      
      <div class="card-body">
        <form @submit.prevent="submitDocuments">
          <div class="row">
            <!-- ID Proof (Mandatory) -->
            <div class="col-md-6 mb-3">
              <label for="idProof" class="form-label">
                ID Proof *
                <span class="badge bg-danger ms-1">Required</span>
              </label>
              <input
                type="url"
                class="form-control"
                id="idProof"
                v-model="documents.idProofUrl"
                placeholder="https://example.com/id-proof.pdf"
                required
                :class="{ 'is-invalid': errors.idProofUrl }"
              />
              <div class="form-text">Driver's License, Passport, or National ID</div>
              <div v-if="errors.idProofUrl" class="invalid-feedback">
                {{ errors.idProofUrl }}
              </div>
            </div>
            
            <!-- Offer Letter (Mandatory) -->
            <div class="col-md-6 mb-3">
              <label for="offerLetter" class="form-label">
                Signed Offer Letter *
                <span class="badge bg-danger ms-1">Required</span>
              </label>
              <input
                type="url"
                class="form-control"
                id="offerLetter"
                v-model="documents.offerLetterUrl"
                placeholder="https://example.com/offer-letter.pdf"
                required
                :class="{ 'is-invalid': errors.offerLetterUrl }"
              />
              <div class="form-text">Signed copy of your offer letter</div>
              <div v-if="errors.offerLetterUrl" class="invalid-feedback">
                {{ errors.offerLetterUrl }}
              </div>
            </div>
            
            <!-- PAN/Aadhar (Optional) -->
            <div class="col-md-6 mb-3">
              <label for="panAadhar" class="form-label">
                PAN/Aadhar Card
                <span class="badge bg-secondary ms-1">Optional</span>
              </label>
              <input
                type="url"
                class="form-control"
                id="panAadhar"
                v-model="documents.panAadharUrl"
                placeholder="https://example.com/pan-card.pdf"
              />
              <div class="form-text">PAN Card or Aadhar Card</div>
            </div>
            
            <!-- Bank Details (Optional) -->
            <div class="col-md-6 mb-3">
              <label for="bankDetails" class="form-label">
                Bank Account Details
                <span class="badge bg-secondary ms-1">Optional</span>
              </label>
              <input
                type="url"
                class="form-control"
                id="bankDetails"
                v-model="documents.bankDetailsUrl"
                placeholder="https://example.com/bank-details.pdf"
              />
              <div class="form-text">Bank account details or cancelled cheque</div>
            </div>
          </div>
          
          <!-- Upload Instructions -->
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Upload Instructions:</strong>
            <ul class="mb-0 mt-2">
              <li>Upload documents to a cloud service (Google Drive, Dropbox, etc.)</li>
              <li>Make sure the sharing permissions allow viewing</li>
              <li>Copy the shareable link and paste it in the respective field</li>
              <li>Accepted formats: PDF, JPG, PNG</li>
              <li>Maximum file size: 10MB per document</li>
            </ul>
          </div>
          
          <div class="d-flex justify-content-between">
            <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ submitting ? 'Submitting...' : 'Submit Documents' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import documentService from '@/api/documentService.js'

const emit = defineEmits(['submitted', 'cancel'])

const submitting = ref(false)
const errors = ref({})

const documents = reactive({
  idProofUrl: '',
  offerLetterUrl: '',
  panAadharUrl: '',
  bankDetailsUrl: ''
})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  // Validate required fields
  if (!documents.idProofUrl?.trim()) {
    errors.value.idProofUrl = 'ID Proof URL is required'
    isValid = false
  } else if (!isValidUrl(documents.idProofUrl)) {
    errors.value.idProofUrl = 'Please enter a valid URL'
    isValid = false
  }

  if (!documents.offerLetterUrl?.trim()) {
    errors.value.offerLetterUrl = 'Offer Letter URL is required'
    isValid = false
  } else if (!isValidUrl(documents.offerLetterUrl)) {
    errors.value.offerLetterUrl = 'Please enter a valid URL'
    isValid = false
  }

  // Validate optional fields if provided
  if (documents.panAadharUrl && !isValidUrl(documents.panAadharUrl)) {
    errors.value.panAadharUrl = 'Please enter a valid URL'
    isValid = false
  }

  if (documents.bankDetailsUrl && !isValidUrl(documents.bankDetailsUrl)) {
    errors.value.bankDetailsUrl = 'Please enter a valid URL'
    isValid = false
  }

  return isValid
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const submitDocuments = async () => {
  if (!validateForm()) return

  try {
    submitting.value = true
    
    await documentService.submitDocuments(documents)
    
    emit('submitted')
    
  } catch (error) {
    console.error('Error submitting documents:', error)
    
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`)
    } else {
      alert('Failed to submit documents. Please try again.')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.document-upload {
  max-width: 800px;
  margin: 0 auto;
}

.form-label {
  font-weight: 500;
  color: #495057;
}

.badge {
  font-size: 0.7em;
}

.alert ul {
  padding-left: 1.2em;
}

.form-text {
  color: #6c757d;
  font-size: 0.875em;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}
</style>
