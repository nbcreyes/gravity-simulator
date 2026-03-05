let ctx         = null
let masterGain  = null
let initialized = false
let activeNodes = []
let stopFlag    = false

// ── Reverb ────────────────────────────────────────────────────────────────────
function createReverb(duration = 4, decay = 2.5) {
  const length  = ctx.sampleRate * duration
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c)
    for (let i = 0; i < length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
  }
  const conv  = ctx.createConvolver()
  conv.buffer = impulse
  return conv
}

// ── Piano key → frequency ─────────────────────────────────────────────────────
// Virtual Piano layout (middle octave reference)
// Keys: a s d f g h j k l ; ' z x c v b n m
// Plus: q w e r t y u i o p (upper row)
// Numbers prefix = octave shift

const BASE_NOTES = {
  // Lower octave (number keys row)
  '1': 130.81, '2': 146.83, '3': 155.56, '4': 164.81,
  '5': 174.61, '6': 185.00, '7': 196.00, '8': 207.65,
  '9': 220.00, '0': 233.08,
  // Middle row (q w e r t y u i o p)
  'q': 261.63, 'w': 277.18, 'e': 293.66, 'r': 311.13,
  't': 329.63, 'y': 349.23, 'u': 369.99, 'i': 392.00,
  'o': 415.30, 'p': 440.00,
  // Home row (a s d f g h j k l)
  'a': 466.16, 's': 493.88, 'd': 523.25, 'f': 554.37,
  'g': 587.33, 'h': 622.25, 'j': 659.25, 'k': 698.46,
  'l': 739.99,
  // Bottom row (z x c v b n m)
  'z': 783.99, 'x': 830.61, 'c': 880.00, 'v': 932.33,
  'b': 987.77, 'n': 1046.50, 'm': 1108.73,
}

function getFreq(key) {
  return BASE_NOTES[key] || null
}

// ── Parse Virtual Piano sheet notation ───────────────────────────────────────
// Tokens:
//   single char  = single note
//   [xyz]        = chord (all keys played simultaneously)
//   space        = small time step
//   newline      = phrase separator

function parseSheet(sheet) {
  const tokens = []
  let i = 0
  while (i < sheet.length) {
    if (sheet[i] === '[') {
      // Chord or special token
      const end   = sheet.indexOf(']', i)
      const inner = sheet.slice(i + 1, end)
      tokens.push({ type: 'chord', keys: inner.split('') })
      i = end + 1
    } else if (sheet[i] === ' ' || sheet[i] === '\n') {
      tokens.push({ type: 'rest' })
      i++
    } else if (/[a-z0-9]/.test(sheet[i])) {
      tokens.push({ type: 'note', key: sheet[i] })
      i++
    } else {
      i++
    }
  }
  return tokens
}

// ── Organ-style tone ──────────────────────────────────────────────────────────
function playTone(freq, startTime, duration, gain, reverb) {
  if (!ctx || !freq) return

  const osc  = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const osc3 = ctx.createOscillator()
  const g    = ctx.createGain()

  osc.type            = 'sawtooth'
  osc.frequency.value = freq
  osc2.type           = 'sine'
  osc2.frequency.value = freq * 2
  osc3.type           = 'triangle'
  osc3.frequency.value = freq * 0.5

  const g1 = ctx.createGain(); g1.gain.value = 0.5
  const g2 = ctx.createGain(); g2.gain.value = 0.3
  const g3 = ctx.createGain(); g3.gain.value = 0.25

  osc.connect(g1);  g1.connect(g)
  osc2.connect(g2); g2.connect(g)
  osc3.connect(g3); g3.connect(g)

  // Slow organ-like ADSR
  const att = 0.15
  const rel = Math.min(duration * 0.4, 1.2)

  g.gain.setValueAtTime(0, startTime)
  g.gain.linearRampToValueAtTime(gain, startTime + att)
  g.gain.setValueAtTime(gain, startTime + duration - rel)
  g.gain.linearRampToValueAtTime(0, startTime + duration)

  g.connect(masterGain)
  if (reverb) g.connect(reverb)

  osc.start(startTime);  osc.stop(startTime + duration + 0.05)
  osc2.start(startTime); osc2.stop(startTime + duration + 0.05)
  osc3.start(startTime); osc3.stop(startTime + duration + 0.05)

  activeNodes.push(osc, osc2, osc3, g, g1, g2, g3)
}

// ── Main theme sequence (Day One / Interstellar Main Theme) ───────────────────
// Transcribed from the Virtual Piano sheet notation provided
// BPM ~52, each "step" = one 16th note

const SHEET = `
u u u u u u [eup] u u [rua] u u u u u [eup] [rua] [tus] [rua] [eup] [rua] [tus] u u [rua] u u u u u [eup] u [uf] [tus] u u [rua] u u u u u [eup] [uf] [tus] [rua] [eup] [rua] [tus] u u [rua] u u u u u [eup] [uf] [tus] [rua] [eup] [rua] [tus] u u [yud] u u [uf] u u
[eup] a [us] a [up] s [rua] p [uo] p [ua] o [ua] p [uo] p [ua] o [eup] s [rua] d [tus] p [rua] o [eup] s [rua] d [tus] d [us] a [up] s [rua] p [uo] p [ua] o [ua] p [uo] f [ua] o
[ep] u a u s u a u p u s u [ra] u p u o u p u a u o u a u p u o u f u a u o u [ep] u s u [ra] u d u [ts] u p u [ra] u o u [ep] u s u [ra] u d u [ts] u d u s u a u p u s u
[ra] u p u o u p u a u o u a u p u o u f u a u o u [ep] u a u s u a u [uf] u a u [ts] u d u s u a u p u s u [ra] u p u o u p u a u o u a u p u o u f u a u o u [ep] u s u [uf] u a u [ts] u p u [ra] u o u
[ep] u s u [ra] u d u [ts] u a u p u a u s u p u [yd] u s u a u s u d u a u [uf] u f u f u f u f u f u [uf] [uf] [uf] [uf] [uf] [uf]
`

// ── Schedule the sheet ────────────────────────────────────────────────────────
function scheduleSheet(reverb) {
  const BPM      = 52
  const BEAT     = 60 / BPM
  const STEP     = BEAT / 4          // 16th note
  const NOTE_DUR = STEP * 3.5        // notes ring out longer than step

  const tokens   = parseSheet(SHEET)
  let   time     = ctx.currentTime + 1.5  // small lead-in silence

  tokens.forEach(token => {
    if (stopFlag) return

    if (token.type === 'rest') {
      time += STEP
      return
    }

    if (token.type === 'note') {
      if (token.key === 'u') {
        // 'u' in this sheet = sustained rest / let ring
        time += STEP
        return
      }
      const freq = getFreq(token.key)
      if (freq) playTone(freq, time, NOTE_DUR, 0.18, reverb)
      time += STEP
      return
    }

    if (token.type === 'chord') {
      // Filter out 'u' from chords — it's a timing marker not a note
      const keys  = token.keys.filter(k => k !== 'u')
      const freqs = keys.map(k => getFreq(k)).filter(Boolean)

      freqs.forEach(freq => {
        const vol = 0.14 / Math.max(freqs.length, 1)
        playTone(freq, time, NOTE_DUR, vol, reverb)
      })

      time += STEP
    }
  })

  // Loop — restart after sheet finishes with a gap
  const totalDuration = time - ctx.currentTime + BEAT * 4
  if (!stopFlag) {
    schedulerTimeout = setTimeout(() => {
      if (!stopFlag && initialized) scheduleSheet(reverb)
    }, totalDuration * 1000)
  }
}

let schedulerTimeout = null

export async function initAudio() {
  if (initialized) return
  stopFlag = false

  ctx        = new AudioContext()
  masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, ctx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 3)

  // Dry signal
  const dryGain = ctx.createGain()
  dryGain.gain.value = 0.5
  masterGain.connect(dryGain)
  dryGain.connect(ctx.destination)

  // Wet reverb signal
  const reverb  = createReverb(5, 2.5)
  const wetGain = ctx.createGain()
  wetGain.gain.value = 0.6
  masterGain.connect(reverb)
  reverb.connect(wetGain)
  wetGain.connect(ctx.destination)

  initialized = true

  scheduleSheet(reverb)
}

export function stopAudio() {
  if (!initialized) return
  stopFlag = true
  clearTimeout(schedulerTimeout)

  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.6)
  }

  setTimeout(() => {
    activeNodes.forEach(n => {
      try { n.disconnect() } catch {}
      try { if (n.stop) n.stop() } catch {}
    })
    activeNodes = []
    try { ctx?.close() } catch {}
    ctx         = null
    masterGain  = null
    initialized = false
  }, 2500)
}

// ── Collision boom ─────────────────────────────────────────────────────────────
export function playCollision(mass = 100) {
  if (!initialized || !ctx) return

  const freq = mass > 1000 ? 40 : mass > 100 ? 55 : 80

  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type   = 'sine'
  osc.frequency.setValueAtTime(freq, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.08, ctx.currentTime + 0.8)
  gain.gain.setValueAtTime(0.5, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.8)

  // Low thud noise
  const bufSize = ctx.sampleRate * 0.12
  const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate)
  const data    = buffer.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1

  const noise     = ctx.createBufferSource()
  const noiseGain = ctx.createGain()
  const filter    = ctx.createBiquadFilter()
  filter.type            = 'lowpass'
  filter.frequency.value = 180

  noise.buffer = buffer
  noiseGain.gain.setValueAtTime(0.45, ctx.currentTime)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noise.start(ctx.currentTime)
}

// ── Body place tone ────────────────────────────────────────────────────────────
export function playBodyPlace() {
  if (!initialized || !ctx) return

  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type   = 'sine'
  osc.frequency.setValueAtTime(523, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(261, ctx.currentTime + 0.35)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.35)
}

export function setAmbientVolume(vol) {
  if (!masterGain || !ctx) return
  masterGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.5)
}

export function isAudioInitialized() {
  return initialized
}