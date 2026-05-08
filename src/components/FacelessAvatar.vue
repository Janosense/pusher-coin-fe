<script setup>
import { computed } from 'vue'

const props = defineProps({
  seed: { type: [String, Number], default: 0 },
  size: { type: Number, default: 60 }
})

const PALETTE = ['#5B2A86', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6']

// FNV-1a 32-bit hash. No crypto required; deterministic per seed.
const hash = (input) => {
  const str = String(input)
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

const tile = computed(() => {
  const h = hash(props.seed)
  const fg = PALETTE[h % PALETTE.length]
  const bg = PALETTE[(h >> 3) % PALETTE.length]
  // Use the next 15 bits of the hash to fill 3 columns; mirror the leftmost two.
  const cells = []
  for (let row = 0; row < 5; row++) {
    const rowBits = (h >> (row * 3)) & 0b111
    const r = [
      (rowBits >> 2) & 1,
      (rowBits >> 1) & 1,
      rowBits & 1
    ]
    cells.push([r[0], r[1], r[2], r[1], r[0]])
  }
  return { fg: fg === bg ? PALETTE[(h >> 5) % PALETTE.length] : fg, bg, cells }
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 5 5"
    role="img"
    :aria-label="`Avatar for user ${seed}`"
  >
    <rect width="5" height="5" :fill="tile.bg" />
    <template v-for="(row, y) in tile.cells">
      <rect
        v-for="(cell, x) in row"
        v-show="cell"
        :key="`${x}-${y}`"
        :x="x"
        :y="y"
        width="1"
        height="1"
        :fill="tile.fg"
      />
    </template>
  </svg>
</template>

<style scoped>
svg {
  display: block;
  border-radius: 50%;
  overflow: hidden;
}
</style>
