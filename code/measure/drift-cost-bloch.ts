// Measurement for the string paid by the drift alone (E-SPN-0086, 0087): LOCKED STAND-IN tokens on an infinite husk
// line at total momentum K, in relative coordinates, read through code/measure/flux-store-bloch.
//
// THE BOX. The rule (code/rule/drift-cost-line) has no store and no cap: the relative coordinates run to infinity.
// A computer needs a finite box, so the measurement cuts the relative space at string length l <= S and reflects
// there (flux-store-bloch's wall, used here as a MEASUREMENT BOX, not as a rule). A level is a level of the rule only
// when it does not feel the box: the same energy and vector on two boxes, both past the wrap l = 2N. E-SPN-0077's
// port store is exactly this operator with the box at S = 2D, so the store and the no-store rule are compared on
// one instrument.
//
// THE LIGHTEST LEVEL is E-SPN-0076's definition (lightestUnwrapped), evaluated here one level at a time so a large
// box does not hold every level's full vector at once (lightestStreaming; checked equal to lightestUnwrapped on
// small boxes in the experiments).

import {
  antisymmetricSubspace,
  blochColumn,
  blochSpace,
  branchReader,
  contactEnergy,
  lightestUnwrapped,
  overlap,
  reducedBeat,
  stringMoments,
  type Bloch,
  type BlochSpec,
  type BranchReading,
  type Level,
  type Reduced,
  type Subspace,
} from '@/code/measure/flux-store-bloch'
import { unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'
import {
  lockedRun,
  spanOf,
  type LockedStart,
} from '@/code/measure/locked-run'
import { type Vibe } from '@/code/rule/locked-token-line'

export const lightN = (D: number): number => 2 * D + 1

// the no-store rule read in a box of string length S (the cost pi / N per link, c = N, M = 2 N^2)
export function boxSpec(
  kinds: readonly Vibe[],
  D: number,
  box: number,
  labels: 2 | 3 = 2,
): BlochSpec {
  const N = lightN(D)

  return {
    kinds,
    convention: 'C',
    unlike: 'knit',
    depth: D,
    cost: N,
    root: 2 * N * N,
    labels,
    wall: box,
  }
}

export type Built = { bloch: Bloch; sub: Subspace; red: Reduced }

export function build(spec: BlochSpec, K: number): Built {
  const bloch = blochSpace(spec)
  const sub = antisymmetricSubspace(bloch, K)
  const red = reducedBeat(bloch, sub, K)

  return { bloch, sub, red }
}

// a reduced vector taken to the full (distinguishable) basis
export function toFull(bu: Built, c: Vec): Vec {
  const v = {
    re: new Float64Array(bu.bloch.size),
    im: new Float64Array(bu.bloch.size),
  }

  bu.sub.vectors.forEach((bv, a) => {
    const cr = c.re[a]!
    const ci = c.im[a]!

    if (cr === 0 && ci === 0) {
      return
    }

    bv.idx.forEach((i, m) => {
      v.re[i] = v.re[i]! + cr * bv.re[m]! - ci * bv.im[m]!
      v.im[i] = v.im[i]! + cr * bv.im[m]! + ci * bv.re[m]!
    })
  })

  return v
}

// a full-basis vector projected onto the subspace's (orthonormal) vectors
export function toReduced(bu: Built, v: Vec): Vec {
  const dim = bu.sub.vectors.length
  const c = { re: new Float64Array(dim), im: new Float64Array(dim) }

  bu.sub.vectors.forEach((bv, a) => {
    let r = 0
    let s = 0

    bv.idx.forEach((i, m) => {
      // conj(bv) * v
      r += bv.re[m]! * v.re[i]! + bv.im[m]! * v.im[i]!
      s += bv.re[m]! * v.im[i]! - bv.im[m]! * v.re[i]!
    })
    c.re[a] = r
    c.im[a] = s
  })

  return c
}

const wrapE = (phase: number): number => {
  let e = -phase

  while (e <= -Math.PI) {
    e += 2 * Math.PI
  }

  while (e > Math.PI) {
    e -= 2 * Math.PI
  }

  return e
}

export type Lightest = {
  level: Level
  unwrapped: number
  reference: number
  reading: BranchReading
  nextUnwrapped: number
  particleLevels: number
  worstOffset: number
  compactestMean: number
  dim: number
  residual: number
  leak: number
}

// E-SPN-0076's lightest level, one level at a time (the same arithmetic as lightestUnwrapped)
export function lightestStreaming(bu: Built, L: number): Lightest {
  const b = bu.bloch
  const eig = unitaryEigen(bu.red.dim, bu.red.re, bu.red.im)
  const read = branchReader(b, L)
  const sigma = (2 * Math.PI * b.spec.cost) / b.spec.root

  let best:
    | {
        level: Level
        unwrapped: number
        reference: number
        reading: BranchReading
      }
    | undefined
  let second = Number.NaN
  let particleLevels = 0
  let worstOffset = 0
  let compactestMean = Number.POSITIVE_INFINITY

  eig.phases.forEach((ph, k) => {
    const vector = toFull(bu, eig.vectors[k]!)
    const reading = read(vector)

    if (reading.even < 0.5) {
      return
    }

    const energy = wrapE(ph)
    const mean = stringMoments(b, vector).mean
    const reference =
      reading.kinetic + sigma * mean + contactEnergy(b, vector)
    const unwrapped =
      energy +
      2 * Math.PI * Math.round((reference - energy) / (2 * Math.PI))

    particleLevels++
    worstOffset = Math.max(worstOffset, Math.abs(unwrapped - reference))
    compactestMean = Math.min(compactestMean, mean)

    if (!best || unwrapped < best.unwrapped) {
      if (best) {
        second = Number.isNaN(second)
          ? best.unwrapped
          : Math.min(second, best.unwrapped)
      }

      best = {
        level: { energy, vector },
        unwrapped,
        reference,
        reading,
      }
    } else if (Number.isNaN(second) || unwrapped < second) {
      second = unwrapped
    }
  })

  if (!best) {
    throw new Error('drift-cost-bloch: no particle-sector level')
  }

  return {
    ...best,
    nextUnwrapped: second,
    particleLevels,
    worstOffset,
    compactestMean,
    dim: bu.red.dim,
    residual: eig.residual,
    leak: bu.red.leak,
  }
}

// the reference implementation on the same operator (for the equality check on small boxes)
export function lightestReference(
  bu: Built,
  L: number,
): { unwrapped: number; energy: number } {
  const eig = unitaryEigen(bu.red.dim, bu.red.re, bu.red.im)
  const ls: Level[] = eig.phases.map((ph, k) => ({
    energy: wrapE(ph),
    vector: toFull(bu, eig.vectors[k]!),
  }))
  const lp = lightestUnwrapped(bu.bloch, ls, L)

  return { unwrapped: lp.unwrapped, energy: lp.level.energy }
}

// the weight of a level on strings of length at least `from`
export function tailWeight(b: Bloch, v: Vec, from: number): number {
  let w = 0
  let t = 0

  for (let i = 0; i < b.size; i++) {
    const p = v.re[i]! ** 2 + v.im[i]! ** 2

    t += p

    if (b.strings[Math.floor(i / b.labelCount)]! >= from) {
      w += p
    }
  }

  return w / t
}

// |<u, v>| for vectors on two boxes of the same cluster (configurations matched by their relative positions)
export function crossBoxOverlap(
  b1: Bloch,
  u: Vec,
  b2: Bloch,
  v: Vec,
): number {
  let r = 0
  let i = 0
  let nu = 0
  let nv = 0

  for (let k = 0; k < b2.size; k++) {
    nv += v.re[k]! ** 2 + v.im[k]! ** 2
  }

  for (let c = 0; c < b1.configs.length; c++) {
    const c2 = b2.configOf(b1.configs[c]!)

    for (let lab = 0; lab < b1.labelCount; lab++) {
      const k1 = b1.index(c, lab)

      nu += u.re[k1]! ** 2 + u.im[k1]! ** 2

      if (c2 < 0) {
        continue
      }

      const k2 = b2.index(c2, lab)

      r += u.re[k1]! * v.re[k2]! + u.im[k1]! * v.im[k2]!
      i += u.re[k1]! * v.im[k2]! - u.im[k1]! * v.re[k2]!
    }
  }

  return Math.hypot(r, i) / Math.sqrt(nu * nv)
}

// ONE BEAT OF THE RING RULE AGAINST THE BOX OPERATOR. A momentum state of a ring (no wall, the cost as a phase on the
// smallest arc) whose relative part is a Weyl-filled vector on the box configurations of string length at most
// `support` (so one beat, which lengthens a string by at most 2, never reaches the box wall): the ring's image equals
// the box operator's image, and nothing lands outside the box's configurations.
export function ringAgreementFree(
  spec: BlochSpec,
  ring: number,
  m: number,
  support: number,
  fill: (i: number) => [number, number],
): { gap: number; outside: number } {
  const b: Bloch = blochSpace(spec)
  const K = (2 * Math.PI * m) / ring
  const n = spec.kinds.length
  const phi = {
    re: new Float64Array(b.size),
    im: new Float64Array(b.size),
  }

  for (let i = 0; i < b.size; i++) {
    if (b.strings[Math.floor(i / b.labelCount)]! > support) {
      continue
    }

    const [x, y] = fill(i)

    phi.re[i] = x
    phi.im[i] = y
  }

  const labelOf = (r: number): number[] => {
    const out = new Array<number>(n)

    let c = r

    for (let t = n - 1; t >= 0; t--) {
      out[t] = c % b.q
      c = Math.floor(c / b.q)
    }

    return out
  }

  const starts: LockedStart[] = []

  for (let x0 = 0; x0 < ring; x0++) {
    const ph: [number, number] = [Math.cos(K * x0), Math.sin(K * x0)]

    for (let i = 0; i < b.size; i++) {
      if (phi.re[i] === 0 && phi.im[i] === 0) {
        continue
      }

      const d = b.configs[Math.floor(i / b.labelCount)]!
      const a: [number, number] = [
        phi.re[i]! * ph[0] - phi.im[i]! * ph[1],
        phi.re[i]! * ph[1] + phi.im[i]! * ph[0],
      ]

      starts.push({
        x: d.map(v => (((x0 + v) % ring) + ring) % ring),
        j: labelOf(i % b.labelCount),
        amp: a,
      })
    }
  }

  const run = lockedRun({
    ring,
    kinds: spec.kinds,
    convention: spec.convention,
    unlike: spec.unlike,
    start: starts,
  })
  const R = 3 ** n
  const P = ring ** n
  const xs = new Array<number>(n)

  for (let p = 0; p < P; p++) {
    let c = p

    for (let t = n - 1; t >= 0; t--) {
      xs[t] = c % ring
      c = Math.floor(c / ring)
    }

    const th =
      (-2 * Math.PI * ((spec.cost * spanOf(ring, xs)) % spec.root)) /
      spec.root

    for (let r = 0; r < R; r++) {
      const vr = run.re[p * R + r]!
      const vi = run.im[p * R + r]!

      run.re[p * R + r] = vr * Math.cos(th) - vi * Math.sin(th)
      run.im[p * R + r] = vr * Math.sin(th) + vi * Math.cos(th)
    }
  }

  run.beat()

  const img = {
    re: new Float64Array(b.size),
    im: new Float64Array(b.size),
  }

  for (let col = 0; col < b.size; col++) {
    if (phi.re[col] === 0 && phi.im[col] === 0) {
      continue
    }

    const c = blochColumn(b, K, col)

    c.idx.forEach((i, k) => {
      img.re[i] =
        img.re[i]! + c.re[k]! * phi.re[col]! - c.im[k]! * phi.im[col]!

      img.im[i] =
        img.im[i]! + c.re[k]! * phi.im[col]! + c.im[k]! * phi.re[col]!
    })
  }

  let gap = 0

  const covered = new Uint8Array(P * R)

  for (let x0 = 0; x0 < ring; x0++) {
    const ph: [number, number] = [Math.cos(K * x0), Math.sin(K * x0)]

    for (let i = 0; i < b.size; i++) {
      const d = b.configs[Math.floor(i / b.labelCount)]!
      const p = d.reduce(
        (a, v) => a * ring + ((((x0 + v) % ring) + ring) % ring),
        0,
      )
      const r = labelOf(i % b.labelCount).reduce((a, v) => a * 3 + v, 0)
      const want: [number, number] = [
        img.re[i]! * ph[0] - img.im[i]! * ph[1],
        img.re[i]! * ph[1] + img.im[i]! * ph[0],
      ]

      covered[p * R + r] = 1
      gap = Math.max(
        gap,
        Math.hypot(
          want[0] - run.re[p * R + r]!,
          want[1] - run.im[p * R + r]!,
        ),
      )
    }
  }

  let outside = 0

  for (let a = 0; a < P * R; a++) {
    if (!covered[a]) {
      outside += run.re[a]! ** 2 + run.im[a]! ** 2
    }
  }

  return { gap, outside }
}

// ---------------------------------------------------------------------------------------------------------
// the pair (a love and a fear under C) on the far side of the wrap: the relative operator is 2N-periodic

// the largest entry difference between the pair's beat at relative separation d and at d + 2N, over d = lo .. hi
export function pairPeriodGap(
  D: number,
  K: number,
  lo: number,
  hi: number,
): number {
  const N = lightN(D)
  const b = blochSpace(boxSpec(['love', 'fear'], D, hi + 2 * N + 4))

  let gap = 0

  for (let d = lo; d <= hi; d++) {
    const c1 = b.configOf([0, d])
    const c2 = b.configOf([0, d + 2 * N])

    for (let r = 0; r < b.labelCount; r++) {
      const x = blochColumn(b, K, b.index(c1, r))
      const y = blochColumn(b, K, b.index(c2, r))
      const shifted = new Map<number, [number, number]>()

      y.idx.forEach((i, m) => {
        const cfg = b.configs[Math.floor(i / b.labelCount)]!

        shifted.set(
          b.index(b.configOf([0, cfg[1]! - 2 * N]), i % b.labelCount),
          [y.re[m]!, y.im[m]!],
        )
      })

      x.idx.forEach((i, m) => {
        const o = shifted.get(i) ?? [0, 0]

        gap = Math.max(
          gap,
          Math.hypot(x.re[m]! - o[0], x.im[m]! - o[1]),
        )
        shifted.delete(i)
      })

      for (const o of shifted.values()) {
        gap = Math.max(gap, Math.hypot(o[0], o[1]))
      }
    }
  }

  return gap
}

// THE BROKEN STRING. Past contact the pair's relative beat is 2N-periodic (the cost's phase returns at l = 2N), so
// the far separations carry a band spectrum: one period of 2N relative docks closed with a twist theta. Returns the
// band widths (each sorted eigenphase's range over theta, cut in the widest gap at theta = 0), per relative parity.
export function brokenBands(
  D: number,
  K: number,
  twists: number,
): { widths: number[]; largest: number; flatBands: number } {
  const N = lightN(D)
  const P = 2 * N
  const base = 2 * P
  const b = blochSpace(boxSpec(['love', 'fear'], D, base + P + 4))
  const R = b.labelCount
  const dim = P * R
  const widths: number[] = []
  const bands: number[][] = []

  for (let s = 0; s < twists; s++) {
    const theta = (2 * Math.PI * s) / twists
    const re = new Float64Array(dim * dim)
    const im = new Float64Array(dim * dim)

    for (let dr = 0; dr < P; dr++) {
      const c = b.configOf([0, base + dr])

      for (let r = 0; r < R; r++) {
        const col = blochColumn(b, K, b.index(c, r))

        col.idx.forEach((i, m) => {
          const d2 = b.configs[Math.floor(i / R)]![1]! - base
          const wrap = d2 >= P ? 1 : d2 < 0 ? -1 : 0
          const row = (d2 - wrap * P) * R + (i % R)
          const tw: [number, number] = [
            Math.cos(wrap * theta),
            Math.sin(wrap * theta),
          ]
          const vr = col.re[m]! * tw[0] - col.im[m]! * tw[1]
          const vi = col.re[m]! * tw[1] + col.im[m]! * tw[0]

          re[row * dim + dr * R + r] = re[row * dim + dr * R + r]! + vr
          im[row * dim + dr * R + r] = im[row * dim + dr * R + r]! + vi
        })
      }
    }

    const eig = unitaryEigen(dim, re, im)

    bands.push(
      eig.phases
        .map(p => ((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))
        .sort((x, y) => x - y),
    )
  }

  // cut the circle in the widest gap of the first twist's spectrum, then compare sorted phases across twists
  const first = bands[0]!

  let cut = 0
  let widest = -1

  for (let i = 0; i < first.length; i++) {
    const next =
      i + 1 < first.length ? first[i + 1]! : first[0]! + 2 * Math.PI
    const g = next - first[i]!

    if (g > widest) {
      widest = g
      cut = (first[i]! + g / 2) % (2 * Math.PI)
    }
  }

  const rotated = bands.map(ph =>
    ph
      .map(
        p =>
          (((p - cut) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
      )
      .sort((x, y) => x - y),
  )

  for (let i = 0; i < first.length; i++) {
    const values = rotated.map(ph => ph[i]!)

    widths.push(Math.max(...values) - Math.min(...values))
  }

  return {
    widths,
    largest: Math.max(...widths),
    flatBands: widths.filter(w => w < 1e-10).length,
  }
}

// THE STRING IN TIME. A love and a fear made on one relative configuration (separation d0, labels j) at K, run for
// `beats` beats in a box of S; returns the largest mean string length reached, the largest weight ever found at
// l > far, and the largest weight ever found at l < near (after the first beat).
export function pairInTime(
  D: number,
  box: number,
  K: number,
  d0: number,
  j: readonly [number, number],
  beats: number,
  near: number,
  far: number,
): {
  maxMean: number
  minMean: number
  farWeight: number
  nearWeight: number
  norm: number
} {
  const b = blochSpace(boxSpec(['love', 'fear'], D, box))
  const size = b.size
  const cols = Array.from({ length: size }, (_, c) =>
    blochColumn(b, K, c),
  )

  let re = new Float64Array(size)
  let im = new Float64Array(size)
  let nre = new Float64Array(size)
  let nim = new Float64Array(size)

  re[b.index(b.configOf([0, d0]), j[0] * b.q + j[1])] = 1

  let maxMean = 0
  let minMean = Number.POSITIVE_INFINITY
  let farWeight = 0
  let nearWeight = 0
  let norm = 1

  for (let t = 0; t < beats; t++) {
    nre.fill(0)
    nim.fill(0)

    for (let c = 0; c < size; c++) {
      const xr = re[c]!
      const xi = im[c]!

      if (xr === 0 && xi === 0) {
        continue
      }

      const col = cols[c]!

      for (let m = 0; m < col.idx.length; m++) {
        const i = col.idx[m]!

        nre[i] = nre[i]! + col.re[m]! * xr - col.im[m]! * xi
        nim[i] = nim[i]! + col.re[m]! * xi + col.im[m]! * xr
      }
    }

    const tr = re
    const ti = im

    re = nre
    im = nim
    nre = tr
    nim = ti

    let w = 0
    let mean = 0
    let wf = 0
    let wn = 0

    for (let i = 0; i < size; i++) {
      const p = re[i]! ** 2 + im[i]! ** 2

      if (p === 0) {
        continue
      }

      const l = b.strings[Math.floor(i / b.labelCount)]!

      w += p
      mean += p * l

      if (l > far) {
        wf += p
      }

      if (l < near) {
        wn += p
      }
    }

    maxMean = Math.max(maxMean, mean / w)
    minMean = Math.min(minMean, mean / w)
    farWeight = Math.max(farWeight, wf / w)
    nearWeight = Math.max(nearWeight, wn / w)
    norm = w
  }

  return { maxMean, minMean, farWeight, nearWeight, norm }
}

// ---------------------------------------------------------------------------------------------------------
// following one level in K

// complex LU with partial pivoting, solve in place
function luSolve(
  n: number,
  are: Float64Array,
  aim: Float64Array,
  bre: Float64Array,
  bim: Float64Array,
  factored: { done: boolean; piv: Int32Array },
): void {
  if (!factored.done) {
    for (let k = 0; k < n; k++) {
      let p = k
      let pm = -1

      for (let i = k; i < n; i++) {
        const m = are[i * n + k]! ** 2 + aim[i * n + k]! ** 2

        if (m > pm) {
          pm = m
          p = i
        }
      }

      factored.piv[k] = p

      if (p !== k) {
        for (let j = 0; j < n; j++) {
          const tr = are[k * n + j]!
          const ti = aim[k * n + j]!

          are[k * n + j] = are[p * n + j]!
          aim[k * n + j] = aim[p * n + j]!
          are[p * n + j] = tr
          aim[p * n + j] = ti
        }
      }

      const dr = are[k * n + k]!
      const di = aim[k * n + k]!
      const dd = dr * dr + di * di || 1e-300

      for (let i = k + 1; i < n; i++) {
        const xr = are[i * n + k]!
        const xi = aim[i * n + k]!
        // l = x / d
        const lr = (xr * dr + xi * di) / dd
        const li = (xi * dr - xr * di) / dd

        are[i * n + k] = lr
        aim[i * n + k] = li

        if (lr === 0 && li === 0) {
          continue
        }

        for (let j = k + 1; j < n; j++) {
          const ur = are[k * n + j]!
          const ui = aim[k * n + j]!

          are[i * n + j] = are[i * n + j]! - (lr * ur - li * ui)
          aim[i * n + j] = aim[i * n + j]! - (lr * ui + li * ur)
        }
      }
    }

    factored.done = true
  }

  for (let k = 0; k < n; k++) {
    const p = factored.piv[k]!

    if (p !== k) {
      const tr = bre[k]!
      const ti = bim[k]!

      bre[k] = bre[p]!
      bim[k] = bim[p]!
      bre[p] = tr
      bim[p] = ti
    }
  }

  for (let i = 1; i < n; i++) {
    let sr = bre[i]!
    let si = bim[i]!

    for (let j = 0; j < i; j++) {
      sr -= are[i * n + j]! * bre[j]! - aim[i * n + j]! * bim[j]!
      si -= are[i * n + j]! * bim[j]! + aim[i * n + j]! * bre[j]!
    }

    bre[i] = sr
    bim[i] = si
  }

  for (let i = n - 1; i >= 0; i--) {
    let sr = bre[i]!
    let si = bim[i]!

    for (let j = i + 1; j < n; j++) {
      sr -= are[i * n + j]! * bre[j]! - aim[i * n + j]! * bim[j]!
      si -= are[i * n + j]! * bim[j]! + aim[i * n + j]! * bre[j]!
    }

    const dr = are[i * n + i]!
    const di = aim[i * n + i]!
    const dd = dr * dr + di * di || 1e-300

    bre[i] = (sr * dr + si * di) / dd
    bim[i] = (si * dr - sr * di) / dd
  }
}

function applyReduced(red: Reduced, x: Vec): Vec {
  const n = red.dim
  const out = { re: new Float64Array(n), im: new Float64Array(n) }

  for (let i = 0; i < n; i++) {
    let r = 0
    let s = 0

    for (let j = 0; j < n; j++) {
      r += red.re[i * n + j]! * x.re[j]! - red.im[i * n + j]! * x.im[j]!
      s += red.re[i * n + j]! * x.im[j]! + red.im[i * n + j]! * x.re[j]!
    }

    out.re[i] = r
    out.im[i] = s
  }

  return out
}

const normalizeVec = (x: Vec): number => {
  let s = 0

  for (let i = 0; i < x.re.length; i++) {
    s += x.re[i]! ** 2 + x.im[i]! ** 2
  }

  const f = 1 / Math.sqrt(s)

  for (let i = 0; i < x.re.length; i++) {
    x.re[i] = x.re[i]! * f
    x.im[i] = x.im[i]! * f
  }

  return Math.sqrt(s)
}

// inverse iteration from a start vector: the eigenvector of U nearest the start's Rayleigh quotient
export function inverseIterate(
  red: Reduced,
  start: Vec,
  rounds = 4,
): { vector: Vec; energy: number; residual: number } {
  const n = red.dim
  const x = {
    re: Float64Array.from(start.re),
    im: Float64Array.from(start.im),
  }

  normalizeVec(x)

  let residual = Number.POSITIVE_INFINITY
  let lambda: [number, number] = [1, 0]

  for (let round = 0; round < rounds; round++) {
    const ux = applyReduced(red, x)

    let lr = 0
    let li = 0

    for (let i = 0; i < n; i++) {
      lr += x.re[i]! * ux.re[i]! + x.im[i]! * ux.im[i]!
      li += x.re[i]! * ux.im[i]! - x.im[i]! * ux.re[i]!
    }

    lambda = [lr, li]

    let r2 = 0

    for (let i = 0; i < n; i++) {
      r2 +=
        (ux.re[i]! - (lr * x.re[i]! - li * x.im[i]!)) ** 2 +
        (ux.im[i]! - (lr * x.im[i]! + li * x.re[i]!)) ** 2
    }

    residual = Math.sqrt(r2)

    if (residual < 1e-11) {
      break
    }

    // the shift: the quotient on the circle, nudged off it so the solve stays regular
    const m = Math.hypot(lr, li)
    const sr = (lr / m) * (1 + 1e-10)
    const si = (li / m) * (1 + 1e-10)
    const are = Float64Array.from(red.re)
    const aim = Float64Array.from(red.im)

    for (let i = 0; i < n; i++) {
      are[i * n + i] = are[i * n + i]! - sr
      aim[i * n + i] = aim[i * n + i]! - si
    }

    const fac = { done: false, piv: new Int32Array(n) }

    luSolve(n, are, aim, x.re, x.im, fac)
    normalizeVec(x)
  }

  return {
    vector: x,
    energy: wrapE(Math.atan2(lambda[1], lambda[0])),
    residual,
  }
}

export type Band = {
  bandwidth: number
  velocity: number
  minOverlap: number
  energies: number[]
  worstResidual: number
}

// the level followed from K = 0 to pi in `steps` steps by inverse iteration from the previous vector (projected on
// the new K's subspace); consecutive full-basis overlaps reported
export function followBand(
  spec: BlochSpec,
  start: Level,
  steps: number,
): Band {
  const energies = [start.energy]

  let prev = start.vector
  let minOverlap = 1
  let velocity = 0
  let worstResidual = 0

  for (let s = 1; s <= steps; s++) {
    const K = (Math.PI * s) / steps
    const bu = build(spec, K)
    const got = inverseIterate(bu.red, toReduced(bu, prev))
    const full = toFull(bu, got.vector)

    let e = got.energy

    while (e - energies[s - 1]! > Math.PI) {
      e -= 2 * Math.PI
    }

    while (e - energies[s - 1]! < -Math.PI) {
      e += 2 * Math.PI
    }

    velocity = Math.max(
      velocity,
      Math.abs(e - energies[s - 1]!) / (Math.PI / steps),
    )
    minOverlap = Math.min(minOverlap, overlap(prev, full))
    worstResidual = Math.max(worstResidual, got.residual)
    energies.push(e)
    prev = full
  }

  return {
    bandwidth: Math.max(...energies) - Math.min(...energies),
    velocity,
    minOverlap,
    energies,
    worstResidual,
  }
}

// E-SPN-0077's tracker (full spectrum at every K, the level of largest overlap), for calibrating followBand
export function followBandFull(
  spec: BlochSpec,
  start: Level,
  steps: number,
): Band {
  const energies = [start.energy]

  let prev = start.vector
  let minOverlap = 1
  let velocity = 0
  let worstResidual = 0

  for (let s = 1; s <= steps; s++) {
    const K = (Math.PI * s) / steps
    const bu = build(spec, K)
    const eig = unitaryEigen(bu.red.dim, bu.red.re, bu.red.im)

    let best: Vec | undefined
    let bestE = 0
    let bestOverlap = -1

    eig.vectors.forEach((c, k) => {
      const full = toFull(bu, c)
      const o = overlap(prev, full)

      if (o > bestOverlap) {
        bestOverlap = o
        best = full
        bestE = wrapE(eig.phases[k]!)
      }
    })

    let e = bestE

    while (e - energies[s - 1]! > Math.PI) {
      e -= 2 * Math.PI
    }

    while (e - energies[s - 1]! < -Math.PI) {
      e += 2 * Math.PI
    }

    velocity = Math.max(
      velocity,
      Math.abs(e - energies[s - 1]!) / (Math.PI / steps),
    )
    minOverlap = Math.min(minOverlap, bestOverlap)
    worstResidual = Math.max(worstResidual, eig.residual)
    energies.push(e)
    prev = best!
  }

  return {
    bandwidth: Math.max(...energies) - Math.min(...energies),
    velocity,
    minOverlap,
    energies,
    worstResidual,
  }
}
