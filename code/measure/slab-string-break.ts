// SHAKING OR STRING BREAKING: READINGS FOR THE SLAB COMPOSITE UNDER THE MIXER (E-SPN-0141). E-SPN-0139 found three
// holes on the slab bound by the Steiner string unbind under the frame mixer at every rate it tried (1/64 and up), and
// not in the order the Klein gap predicts. Two readings remain: the mixer SHAKES the composite (a threshold angle that
// tracks the binding gap), or the string BREAKS (the leaked weight is the composite plus pairs made from the sea). These
// are the readings that tell them apart.
//
//   seaCount        a rule configuration on the love sea: holes, fears, stored pairs, and E-GRV-0144's conserved
//                   charge register (count minus twice the charge, from the sea). String breaking in the rule needs a
//                   fear or a store to appear from a start of holes alone
//   holesOutside    the slab's sea-aware witness: every hole carries register 1 (a hole in the love sea, E-GRV-0144),
//                   so the register a window of Chebyshev radius R around the three holes' centroid misses is the
//                   expected number of holes outside it. Exact integer test: |3 x_i - sum x| <= 3 R on every axis
//   leakSectors     the weight that left the level by the last beat, split by where it is: escaped from the window,
//                   far (Steiner length at least `from`), compact on one line, compact off it
//   watchHold       code/measure/slab-holes holdLevel's hold loop, rerun from its level vector with the register
//                   witness read at every beat and the last state kept (holdLevel returns only the level)
//   crossingTheta   the angle at which a hold margin crosses 1, by log-log interpolation between two scanned rates
//
// Floats, as measurement, except seaCount and the window test, which are integers. DETERMINISM: no random numbers.
// NOTHING MOVES: these are readings; the beat is code/measure/slab-holes slabBeat and the rule code/measure/candidate-
// audit candidateRun, unchanged.

import type { Configuration } from '@/code/rule/doublet-locked-knit'
import { seaEnergies, totalOf } from '@/code/measure/normal-order'
import { emptyState, innerSlab, offLineSlab, slabBeat, steinerShells, thetaOfRate, weightOfSlab, type SlabSpace, type SlabState, type SlabTally } from '@/code/measure/slab-holes'

// ---- the rule: what a start of holes becomes on the love sea ----

export type SeaCount = { holes: number; fears: number; stores: number; register: number }

export function seaCount(c: Configuration, buffer: Int32Array): SeaCount {
  let holes = 0
  let fears = 0
  let stores = 0

  for (let i = 0; i < c.vibe.length; i++) {
    if (c.vibe[i] === 0) holes++
    else if (c.vibe[i] === -1) fears++
  }

  for (let s = 0; s < c.store.length; s++) if (c.store[s] !== 0) stores++

  return { holes, fears, stores, register: totalOf(seaEnergies(c, 1, 'charge', buffer)) }
}

// ---- the slab: the register a window around the composite misses ----

// per configuration, the number of holes farther than `radius` (Chebyshev, per axis) from the holes' centroid
export function holesOutside(space: SlabSpace, radius: number): Uint8Array {
  const n = space.spec.holes
  const A = space.spec.axes
  const out = new Uint8Array(space.configs)

  for (let p = 0; p < space.configs; p++) {
    const sum: number[] = new Array<number>(A).fill(0)

    for (let i = 0; i < n; i++) for (let d = 0; d < A; d++) sum[d] = (sum[d] as number) + (space.coords[p * n * A + i * A + d] as number)

    let count = 0

    for (let i = 0; i < n; i++) {
      let far = false

      for (let d = 0; d < A; d++) if (Math.abs(n * (space.coords[p * n * A + i * A + d] as number) - (sum[d] as number)) > n * radius) far = true
      if (far) count++
    }

    out[p] = count
  }

  return out
}

// the expected count of holes outside the window: sum over configurations of weight times holes outside
export function registerMissed(space: SlabSpace, s: SlabState, outside: Uint8Array): number {
  let m = 0

  for (let p = 0; p < space.configs; p++) {
    const k = outside[p] as number

    if (k === 0) continue

    let w = 0

    for (let b = 0; b < space.block; b++) w += (s.re[p * space.block + b] as number) ** 2 + (s.im[p * space.block + b] as number) ** 2
    m += k * w
  }

  return m
}

// ---- where the leaked weight went ----

export type LeakSectors = { leaked: number; escaped: number; far: number; compactOnLine: number; compactOffLine: number; fidelity: number }

// u the state after the hold, v the level (unit), escaped the weight absorbed on the way; the residual u - <v|u> v split
// by Steiner length (at least `from` is far) and, below it, by offLineSlab
export function leakSectors(space: SlabSpace, v: SlabState, u: SlabState, escaped: number, from: number): LeakSectors {
  const [r, i] = innerSlab(v, u)
  const residual = emptyState(space)
  const compact = emptyState(space)

  for (let k = 0; k < u.re.length; k++) {
    const vr = v.re[k] as number
    const vi = v.im[k] as number

    residual.re[k] = (u.re[k] as number) - (r * vr - i * vi)
    residual.im[k] = (u.im[k] as number) - (r * vi + i * vr)
  }

  for (let p = 0; p < space.configs; p++) {
    if ((space.steiner[p] as number) >= from) continue
    for (let b = 0; b < space.block; b++) {
      compact.re[p * space.block + b] = residual.re[p * space.block + b] as number
      compact.im[p * space.block + b] = residual.im[p * space.block + b] as number
    }
  }

  const far = steinerShells(space, residual)
    .slice(from)
    .reduce((x, y) => x + y, 0)
  const compactOffLine = offLineSlab(space, compact)
  const compactAll = weightOfSlab(compact)

  return { leaked: escaped + weightOfSlab(residual), escaped, far, compactOnLine: compactAll - compactOffLine, compactOffLine, fidelity: r * r + i * i }
}

// ---- the hold, watched ----

export type HoldWatch = { fidelity: number[]; tail: number[]; missed: number[][]; last: SlabState; escaped: number }

// `beats` beats of slabBeat at K = 0 from the level v: per beat the fidelity, E-SPN-0135's tail (escaped plus the
// weight at Steiner length `from` and up), and per window the register missed (holes outside plus every hole of the
// escaped weight), all as holdLevel reads them
export function watchHold(space: SlabSpace, v: SlabState, beats: number, from: number, outsides: readonly Uint8Array[]): HoldWatch {
  const n = space.spec.holes
  const tally: SlabTally = { escaped: 0 }
  const fidelity: number[] = []
  const tail: number[] = []
  const missed: number[][] = outsides.map(() => [])
  let u: SlabState = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

  for (let t = 0; t < beats; t++) {
    u = slabBeat(space, [0, 0], u, tally)

    const [r, i] = innerSlab(v, u)
    const sh = steinerShells(space, u)

    fidelity.push(r * r + i * i)
    tail.push(tally.escaped + sh.slice(from).reduce((x, y) => x + y, 0))
    outsides.forEach((o, k) => (missed[k] as number[]).push(registerMissed(space, u, o) + n * tally.escaped))
  }

  return { fidelity, tail, missed, last: u, escaped: tally.escaped }
}

// ---- the threshold ----

// the hold margin max((1 - least fidelity) / (1 - fidelity), largest tail / tail): held iff at most 1
export const holdMargin = (minFidelity: number, maxTail: number, fidelity: number, tail: number): number => Math.max((1 - minFidelity) / (1 - fidelity), maxTail / tail)

// the angle where the margin crosses 1 between a held rate (margin <= 1) and a failing one (margin > 1), linear in
// ln margin against ln theta
export function crossingTheta(held: { rate: number; margin: number }, failing: { rate: number; margin: number }): number {
  const a = Math.log(thetaOfRate(held.rate))
  const b = Math.log(thetaOfRate(failing.rate))
  const ma = Math.log(held.margin)
  const mb = Math.log(failing.margin)

  return Math.exp(a + ((0 - ma) * (b - a)) / (mb - ma))
}
