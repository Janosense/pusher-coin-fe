<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Visual countdown for a single broadcast window.
 *
 * Props:
 *   - currentWindow: { startAt, endAt } | null — when set, the room is
 *     already live and the component renders a "LIVE" pill.
 *   - nextWindow: { startAt, endAt } | null — when set and there is no
 *     current window, the component counts down to startAt and emits
 *     `is-live` once startAt is reached so the parent can re-fetch.
 *
 * The component is purely display + a 1Hz local ticker; it never calls
 * the API. The parent decides when to refresh based on the `is-live`
 * event.
 */

const props = defineProps({
  currentWindow: { type: Object, default: null },
  nextWindow: { type: Object, default: null }
})

const emit = defineEmits(['is-live'])

const now = ref(Date.now())
let intervalId = null

const startTicker = () => {
  if (intervalId) return
  intervalId = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

const stopTicker = () => {
  if (!intervalId) return
  window.clearInterval(intervalId)
  intervalId = null
}

onMounted(startTicker)
onBeforeUnmount(stopTicker)

const isLive = computed(() => !!props.currentWindow)

const msUntilStart = computed(() => {
  if (!props.nextWindow?.startAt) return null
  return new Date(props.nextWindow.startAt).getTime() - now.value
})

const countdownLabel = computed(() => {
  const ms = msUntilStart.value
  if (ms === null) return null
  if (ms <= 0) return null
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
})

// Edge case: the user keeps the page open through the start of the next
// window. When the countdown hits zero, tell the parent so it can refetch
// the room (and pick up the new current_window / next_window).
watch(msUntilStart, (val, prev) => {
  if (val !== null && val <= 0 && prev !== null && prev > 0) {
    emit('is-live')
  }
})
</script>

<template>
  <span v-if="isLive" class="countdown countdown--live">
    <span class="countdown__dot" /> Live now
  </span>
  <span v-else-if="countdownLabel" class="countdown">
    Starts in {{ countdownLabel }}
  </span>
  <span v-else class="countdown countdown--idle">No upcoming broadcast</span>
</template>

<style scoped>
.countdown {
  display: inline-flex;
  align-items: center;
  column-gap: 6px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.75);
}

.countdown--live {
  color: #f87171;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.countdown--idle {
  color: rgba(255, 255, 255, 0.45);
}

.countdown__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
