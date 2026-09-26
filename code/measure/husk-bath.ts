// The husk's heat bath: the cold weave's gas read on the husk, with fills of a chosen depth period, the
// depth-shift symmetry check, and a warped beat that breaks the depth step by the {3,4,3,4} cusp's measure
// (E-SPN-0056, E-SPN-0057).
//
// The box is code/tool/mesh's d4Mesh of odd side S: dock x + S y + S^2 z + S^3 w, w the depth. The husk is
// the column sum along w (a husk dock is a column of S bulk docks), and a husk MODE is a column and a husk
// direction (the root with its w dropped): g = 2 S slots on an axis direction, S on a diagonal one, as in
// E-SPN-0048 and 0050.
//
// THE DEPTH STEP. The cold weave is the same in every dock, and the step w -> w + 1 is a symmetry of the
// box, so the beat commutes with it: T4 beat = beat T4. A state of depth period m (m dividing S) keeps that
// period forever, and the nonlinear gas has one closed sector for each divisor of S: the states of period m,
// whose depth Fourier content sits on the multiples of S / m. The husk (k4 = 0 alone) is the smallest.
//
// THE WARP (a stand-in for the cusp's metric, labeled so). The {3,4,3,4} ball grows by lambda per shell
// (E-MTH-0007, lambda the Perron root of x^3 - 21 x^2 + 51 x - 23), so a layer j shells inside the husk
// sheet holds lambda^-j of the ball. Here that measure is each layer's CLOCK: the collisions of a dock in
// layer j (j = min(w, S - w), the flat box read both ways from the sheet w = 0) run on a Bresenham schedule
// of rate lambda^(-s j), s the warp exponent, and the stream copies every slot every beat. A skipped
// collision is the identity, so energy, charge and both momenta stay exact, the beat stays a bijection, and
// the husk read is still the flat column sum. s = 0 is the unwarped weave.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { GOLDEN, SILVER, weyl } from '@/code/tool/weyl'
import { coldDockCollide, type ColdState, type ColdWeave } from '@/code/rule/cold-weave'

const ROOTS = rootsD4()

// each root's husk direction, and the number of roots that cast it (2 on an axis, 1 on a diagonal)
export const HUSK_KEYS: string[] = []
export const HUSK_OF = Int32Array.from(
  ROOTS.map(r => {
    const key = `${r[0]},${r[1]},${r[2]}`
    let h = HUSK_KEYS.indexOf(key)

    if (h < 0) {
      HUSK_KEYS.push(key)
      h = HUSK_KEYS.length - 1
    }

    return h
  }),
)
export const HUSK_SLOTS = HUSK_KEYS.map((_, h) => Array.from(HUSK_OF).filter(x => x === h).length)

// the Perron root of x^3 - 21 x^2 + 51 x - 23 (E-MTH-0007), by Newton from 18
export function coxeterWarp(): number {
  let x = 18

  for (let k = 0; k < 60; k++) {
    x -= (x ** 3 - 21 * x ** 2 + 51 * x - 23) / (3 * x ** 2 - 42 * x + 51)
  }

  return x
}

// a fill of depth period `period` (0 for one draw per slot, the spread fill), density 0.4, stores 0 to 2, by
// the golden and silver sequences; `seed` flips one slot of dock 0 (a love of store 0 put there, or removed)
export function periodicFill(input: { side: number; period: number; seed?: boolean }): ColdState {
  const { side, period } = input
  const columns = side ** 3
  const n = side ** 4 * 24
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)

  for (let i = 0; i < n; i++) {
    const cell = Math.floor(i / 24)
    const d = i % 24
    const key = period > 0 ? (cell % (period * columns)) * 24 + d : i

    if (weyl(key + 1, GOLDEN) < 0.4) {
      vibe[i] = weyl(key + 1, SILVER) < 0.5 ? 1 : -1
      store[i] = Math.floor(weyl(key + 7, SILVER) * 3)
    }
  }

  if (input.seed) {
    vibe[0] = vibe[0] === 0 ? 1 : 0
    store[0] = 0
  }

  return { vibe, store, demon: new Int32Array(side ** 4 * 12) }
}

// slots (vibe or store) and line counters that differ from their image under w -> w + shift
export function depthMismatch(state: ColdState, side: number, shift: number): number {
  const stride = side ** 3 * 24
  const n = state.vibe.length
  let count = 0

  for (let i = 0; i < n; i++) {
    const j = (i + shift * stride) % n

    if (state.vibe[i] !== state.vibe[j] || state.store[i] !== state.store[j]) {
      count++
    }
  }

  const dstride = side ** 3 * 12
  const m = state.demon.length

  for (let i = 0; i < m; i++) {
    if (state.demon[i] !== state.demon[(i + shift * dstride) % m]) {
      count++
    }
  }

  return count
}

// the state moved by w -> w + shift
export function depthShift(state: ColdState, side: number, shift: number): ColdState {
  const stride = side ** 3 * 24
  const dstride = side ** 3 * 12
  const n = state.vibe.length
  const m = state.demon.length
  const vibe = new Int8Array(n)
  const store = new Int32Array(n)
  const demon = new Int32Array(m)

  for (let i = 0; i < n; i++) {
    vibe[(i + shift * stride) % n] = state.vibe[i] ?? 0
    store[(i + shift * stride) % n] = state.store[i] ?? 0
  }

  for (let i = 0; i < m; i++) {
    demon[(i + shift * dstride) % m] = state.demon[i] ?? 0
  }

  return { vibe, store, demon }
}

// the layer clocks: fires[j * period + t mod period] would need a period; instead the Bresenham test
// floor((t + 1) r) > floor(t r), exact in doubles for the beats used here
export function layerRates(side: number, lambda: number, s: number): number[] {
  return Array.from({ length: side }, (_, w) => lambda ** (-s * Math.min(w, side - w)))
}

export function layerFires(rate: number, t: number): boolean {
  return rate >= 1 || Math.floor((t + 1) * rate) > Math.floor(t * rate)
}

// one beat of the cold weave with each layer's collisions on its own clock, in place
export function warpedBeatInPlace(weave: ColdWeave, state: { vibe: Int8Array; store: Int32Array; demon: Int32Array }, t: number, rates: readonly number[], scratch: { vibe: Int8Array; store: Int32Array }): void {
  const side = Math.round(weave.mesh.cellCount ** 0.25)
  const volume = side ** 3
  const a = { vibe: state.vibe, store: state.store, demon: state.demon, role: undefined }
  const fires = rates.map(r => layerFires(r, t))

  for (let x = 0; x < weave.mesh.cellCount; x++) {
    if (fires[Math.floor(x / volume)]) {
      coldDockCollide(weave, a, x * 24, t, true)
    }
  }

  const n = state.vibe.length

  for (let i = 0; i < n; i++) {
    const from = weave.source[i] ?? 0

    scratch.vibe[i] = state.vibe[from] ?? 0
    scratch.store[i] = state.store[from] ?? 0
  }

  state.vibe.set(scratch.vibe)
  state.store.set(scratch.store)
}

// a tally of husk mode counts: per-mode sums for the Fano factor, and per-class histograms
export type HuskTally = { side: number; sum: Float64Array; square: Float64Array; histogram: Float64Array[]; samples: number; counts: Int32Array }

export function makeHuskTally(side: number): HuskTally {
  const modes = side ** 3 * HUSK_KEYS.length

  return {
    side,
    sum: new Float64Array(modes),
    square: new Float64Array(modes),
    histogram: [new Float64Array(2 * side + 1), new Float64Array(side + 1)],
    samples: 0,
    counts: new Int32Array(modes),
  }
}

export function sampleHusk(tally: HuskTally, vibe: Int8Array): void {
  const columns = tally.side ** 3
  const k = HUSK_KEYS.length

  tally.counts.fill(0)

  for (let i = 0; i < vibe.length; i++) {
    if (vibe[i] !== 0) {
      const mode = (((i / 24) | 0) % columns) * k + (HUSK_OF[i % 24] ?? 0)

      tally.counts[mode] = (tally.counts[mode] ?? 0) + 1
    }
  }

  for (let m = 0; m < tally.counts.length; m++) {
    const n = tally.counts[m] ?? 0
    const h = tally.histogram[HUSK_SLOTS[m % k] === 2 ? 0 : 1]!

    tally.sum[m] = (tally.sum[m] ?? 0) + n
    tally.square[m] = (tally.square[m] ?? 0) + n * n
    h[n] = (h[n] ?? 0) + 1
  }

  tally.samples++
}

// class readings: 0 axis, 1 diagonal. fano = mean over modes of var / mean, fermi = 1 - n / g
export type HuskClass = { fano: number; fermi: number; fill: number; g: number; tvBinomial: number; tvPoisson: number; tvNegativeBinomial: number }

function logChoose(n: number, k: number): number {
  let x = 0

  for (let i = 1; i <= k; i++) {
    x += Math.log(n - k + i) - Math.log(i)
  }

  return x
}

function logFactorial(k: number): number {
  let x = 0

  for (let i = 2; i <= k; i++) {
    x += Math.log(i)
  }

  return x
}

function totalVariation(measured: Float64Array, model: (k: number) => number): number {
  const total = measured.reduce((a, b) => a + b, 0)
  let tv = 0
  let mass = 0

  measured.forEach((c, k) => {
    const p = model(k)

    mass += p
    tv += Math.abs(c / total - p)
  })

  return (tv + Math.max(0, 1 - mass)) / 2
}

export function huskClass(tally: HuskTally, c: number): HuskClass {
  const k = HUSK_KEYS.length
  const g = c === 0 ? 2 * tally.side : tally.side
  let fano = 0
  let fill = 0
  let modes = 0

  for (let m = 0; m < tally.sum.length; m++) {
    if ((HUSK_SLOTS[m % k] === 2 ? 0 : 1) !== c) {
      continue
    }

    const mean = (tally.sum[m] ?? 0) / tally.samples

    if (mean <= 0) {
      continue
    }

    fano += ((tally.square[m] ?? 0) / tally.samples - mean * mean) / mean
    fill += mean / g
    modes++
  }

  fano /= modes
  fill /= modes

  const h = tally.histogram[c]!
  const mean = g * fill
  const q = mean / (g + mean)

  return {
    fano,
    fermi: 1 - fill,
    fill,
    g,
    tvBinomial: totalVariation(h, x => Math.exp(logChoose(g, x) + x * Math.log(fill) + (g - x) * Math.log(1 - fill))),
    tvPoisson: totalVariation(h, x => Math.exp(-mean + x * Math.log(mean) - logFactorial(x))),
    tvNegativeBinomial: totalVariation(h, x => Math.exp(logChoose(g + x - 1, x) + g * Math.log(1 - q) + x * Math.log(q))),
  }
}

export function stateEnergy(state: ColdState): number {
  let e = 0

  for (let i = 0; i < state.vibe.length; i++) {
    if (state.vibe[i] !== 0) {
      e += 1 + (state.store[i] ?? 0)
    }
  }

  for (let i = 0; i < state.demon.length; i++) {
    e += state.demon[i] ?? 0
  }

  return e
}

export function stateCharge(state: ColdState): number {
  let q = 0

  for (let i = 0; i < state.vibe.length; i++) {
    q += state.vibe[i] ?? 0
  }

  return q
}
