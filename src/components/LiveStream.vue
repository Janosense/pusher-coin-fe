<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import NextBroadcastCountdown from '@/components/NextBroadcastCountdown.vue'

/**
 * Transport-agnostic stream container.
 *
 * Phase 3 selected Mux LL-HLS as the production transport, so .m3u8
 * URLs route through hls.js (dynamically imported to keep the bundle
 * lean for non-streaming sessions). Safari plays HLS natively and
 * skips the library load entirely. Iframe-style URLs (YouTube/Vimeo
 * embeds) are still honoured because the seed/demo data uses them and
 * operators may want to drop in third-party embeds for one-off events.
 */

const props = defineProps({
  status: { type: String, required: true },
  streamUrl: { type: String, default: null },
  currentWindow: { type: Object, default: null },
  nextWindow: { type: Object, default: null }
})

defineEmits(['is-live'])

const videoEl = ref(null)
let hlsInstance = null

const isLive = computed(
  () => props.status === 'available' && !!props.currentWindow && !!props.streamUrl
)

const isHlsUrl = (url) => /\.m3u8(\?|$)/.test(url.toLowerCase())

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

const teardownHls = () => {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
}

const attachHls = async (video, url) => {
  // Safari plays HLS natively — let the browser handle it.
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    return
  }
  const { default: Hls } = await import('hls.js')
  if (!Hls.isSupported()) {
    video.src = url
    return
  }
  teardownHls()
  hlsInstance = new Hls({ lowLatencyMode: true })
  hlsInstance.loadSource(url)
  hlsInstance.attachMedia(video)
}

watch(
  () => [videoEl.value, props.streamUrl, isLive.value, transport.value],
  ([video, url, live, kind]) => {
    teardownHls()
    if (!video || !live || kind !== 'video' || !url) return
    if (isHlsUrl(url)) {
      attachHls(video, url)
    } else {
      video.src = url
    }
  },
  { flush: 'post' }
)

onBeforeUnmount(teardownHls)
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
        ref="videoEl"
        class="live-stream__player"
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
