<script setup>
import { computed } from 'vue'
import NextBroadcastCountdown from '@/components/NextBroadcastCountdown.vue'

/**
 * Transport-agnostic stream container.
 *
 * The streaming provider is a Phase 3 open question (HLS via Mux /
 * Cloudflare Stream vs LL-HLS vs WebRTC). Until the choice is made, this
 * component sniffs the URL:
 *
 *   - Embed-style URLs (youtube.com, vimeo.com, /embed/...) → <iframe>
 *   - .m3u8 / .mp4 / .webm                                  → <video>
 *   - Anything else                                          → poster
 *
 * Once the provider is chosen, this is the single place to drop in the
 * right client library (hls.js, livekit-client, etc.).
 */

const props = defineProps({
  status: { type: String, required: true },
  streamUrl: { type: String, default: null },
  currentWindow: { type: Object, default: null },
  nextWindow: { type: Object, default: null }
})

defineEmits(['is-live'])

const isLive = computed(
  () => props.status === 'available' && !!props.currentWindow && !!props.streamUrl
)

const transport = computed(() => {
  if (!props.streamUrl) return null
  const url = props.streamUrl.toLowerCase()
  if (/\.(m3u8|mp4|webm)(\?|$)/.test(url)) return 'video'
  if (/youtube\.com|youtu\.be|vimeo\.com|\/embed\//.test(url)) return 'iframe'
  return 'unknown'
})

const placeholderMessage = computed(() => {
  if (props.status === 'maintenance') return 'This room is under maintenance.'
  if (props.status === 'unavailable') return 'This room is currently unavailable.'
  if (!props.currentWindow && !props.nextWindow) return 'No scheduled broadcasts.'
  return null
})
</script>

<template>
  <div class="live-stream" :class="{ 'live-stream--offline': !isLive }">
    <template v-if="isLive">
      <iframe
        v-if="transport === 'iframe'"
        class="live-stream__player"
        :src="streamUrl"
        title="Live broadcast"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      />
      <video
        v-else-if="transport === 'video'"
        class="live-stream__player"
        :src="streamUrl"
        autoplay
        muted
        playsinline
        controls
      />
      <div v-else class="live-stream__placeholder">
        Stream format not recognised.
      </div>
    </template>

    <div v-else class="live-stream__placeholder">
      <p v-if="placeholderMessage" class="live-stream__message">{{ placeholderMessage }}</p>
      <NextBroadcastCountdown
        v-if="status === 'available'"
        :current-window="currentWindow"
        :next-window="nextWindow"
        @is-live="$emit('is-live')"
      />
    </div>
  </div>
</template>

<style scoped>
.live-stream {
  position: absolute;
  inset: 0;
  background-color: var(--black, #000);
}

.live-stream__player {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  background: var(--black, #000);
}

.live-stream__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 12px;
  padding: 24px;
  text-align: center;
  background: radial-gradient(circle at center, rgba(40, 40, 60, 0.6), rgba(0, 0, 0, 0.9));
  color: rgba(255, 255, 255, 0.85);
}

.live-stream__message {
  margin: 0;
  font-size: 16px;
  letter-spacing: 0.02em;
}
</style>
