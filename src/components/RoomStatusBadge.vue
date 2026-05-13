<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (v) => ['available', 'maintenance', 'unavailable'].includes(v)
  }
})

const label = computed(() => {
  switch (props.status) {
    case 'available':
      return 'Available'
    case 'maintenance':
      return 'Maintenance'
    default:
      return 'Unavailable'
  }
})
</script>

<template>
  <span class="room-status-badge" :class="`room-status-badge--${status}`">
    <span class="room-status-badge__dot" />
    {{ label }}
  </span>
</template>

<style scoped>
.room-status-badge {
  display: inline-flex;
  align-items: center;
  column-gap: 6px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--white);
}

.room-status-badge__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.room-status-badge--available {
  color: #4ade80;
}

.room-status-badge--maintenance {
  color: #facc15;
}

.room-status-badge--unavailable {
  color: #9ca3af;
}
</style>
