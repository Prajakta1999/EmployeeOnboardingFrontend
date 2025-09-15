<template>
  <div v-if="show" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i :class="iconClass"></i>
            {{ title }}
          </h5>
          <button type="button" class="btn-close" @click="cancel"></button>
        </div>
        
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cancel">
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            :class="confirmButtonClass" 
            @click="confirm"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  type: {
    type: String,
    default: 'primary' // 'primary', 'danger', 'warning'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'fas fa-exclamation-triangle text-danger me-2'
    case 'warning': return 'fas fa-exclamation-circle text-warning me-2'
    default: return 'fas fa-question-circle text-primary me-2'
  }
})

const confirmButtonClass = computed(() => {
  const baseClass = 'btn '
  switch (props.type) {
    case 'danger': return baseClass + 'btn-danger'
    case 'warning': return baseClass + 'btn-warning'
    default: return baseClass + 'btn-primary'
  }
})

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>
