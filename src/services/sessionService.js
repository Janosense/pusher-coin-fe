/**
 * Inactivity-timer service.
 *
 * Calls the supplied callback after the configured idle window with no
 * activity. Activity = mousemove, keydown, click, touch, focus, or
 * a `visibilitychange` to the visible state.
 */

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'focus']

let timerId = null
let timeoutMs = DEFAULT_TIMEOUT_MS
let onTimeout = null

const reset = () => {
  if (!onTimeout) return
  if (timerId) window.clearTimeout(timerId)
  timerId = window.setTimeout(() => {
    const cb = onTimeout
    if (cb) cb()
  }, timeoutMs)
}

const handleActivity = () => reset()

const handleVisibility = () => {
  if (document.visibilityState === 'visible') reset()
}

export const sessionService = {
  start(callback, ms = DEFAULT_TIMEOUT_MS) {
    this.stop()
    onTimeout = callback
    timeoutMs = ms
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }))
    document.addEventListener('visibilitychange', handleVisibility)
    reset()
  },

  stop() {
    if (timerId) {
      window.clearTimeout(timerId)
      timerId = null
    }
    ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity))
    document.removeEventListener('visibilitychange', handleVisibility)
    onTimeout = null
  },

  reset
}

export default sessionService
