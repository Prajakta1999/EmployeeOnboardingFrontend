
<template>
  <span :class="badgeClass">
    <i :class="iconClass" v-if="showIcon"></i>
    {{ displayText }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'onboarding' // 'onboarding', 'task', 'document'
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

const badgeClass = computed(() => {
  const baseClass = 'badge '
  
  if (props.type === 'onboarding') {
    switch (props.status) {
      case 'PENDING': return baseClass + 'bg-secondary'
      case 'IN_PROGRESS': return baseClass + 'bg-warning text-dark'
      case 'COMPLETED': return baseClass + 'bg-success'
      case 'PENDING_DOCUMENTS': return baseClass + 'bg-info'
      default: return baseClass + 'bg-secondary'
    }
  }
  
  if (props.type === 'task') {
    switch (props.status) {
      case 'PENDING': return baseClass + 'bg-warning text-dark'
      case 'COMPLETED': return baseClass + 'bg-success'
      default: return baseClass + 'bg-secondary'
    }
  }
  
  if (props.type === 'document') {
    switch (props.status) {
      case 'PENDING_REVIEW': return baseClass + 'bg-warning text-dark'
      case 'APPROVED': return baseClass + 'bg-success'
      case 'REJECTED': return baseClass + 'bg-danger'
      default: return baseClass + 'bg-secondary'
    }
  }
  
  return baseClass + 'bg-secondary'
})

const iconClass = computed(() => {
  if (props.type === 'onboarding') {
    switch (props.status) {
      case 'PENDING': return 'fas fa-clock me-1'
      case 'IN_PROGRESS': return 'fas fa-spinner me-1'
      case 'COMPLETED': return 'fas fa-check me-1'
      case 'PENDING_DOCUMENTS': return 'fas fa-file-alt me-1'
      default: return 'fas fa-question me-1'
    }
  }
  
  if (props.type === 'task') {
    switch (props.status) {
      case 'PENDING': return 'fas fa-clock me-1'
      case 'COMPLETED': return 'fas fa-check me-1'
      default: return 'fas fa-question me-1'
    }
  }
  
  if (props.type === 'document') {
    switch (props.status) {
      case 'PENDING_REVIEW': return 'fas fa-clock me-1'
      case 'APPROVED': return 'fas fa-check me-1'
      case 'REJECTED': return 'fas fa-times me-1'
      default: return 'fas fa-file me-1'
    }
  }
  
  return 'fas fa-question me-1'
})

const displayText = computed(() => {
  return props.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
})
</script>
