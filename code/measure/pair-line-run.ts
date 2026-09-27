// Runs of the paid string on the line (code/rule/pair-line) read against its exact measure. Built for E-FRC-0218.
//
// A run seeds mesons (a love and a fear on neighboring cells, flux 1 between, at golden Weyl positions, each moved on
// to the next place whose cells are free) and demons (whole values 0 to the capacity from the silver Weyl sequence
// through the truncated law q^d), settles, and reads every `every`-th beat in `batches` batches:
// - the charge density, the paid fraction, and the meson profile (a piece of paid flux holding exactly one love and
//   one fear d cells apart, E-FRC-0189's reading, both orientations)
// - the static-meson pair correlation: with p_i = [vibe_i = s1, vibe_(i+1) = -s1] and q_j = [vibe_j = s2,
//   vibe_(j+1) = -s2], the count of p_i q_(i+2+gap) against the translation reference n_p n_q / N per read
//   (n_p (n_p - 1) / (N - 1) when the two patterns are the same). In the measure this ratio is Z_AB Z_0 / (Z_A Z_B)
//   exactly (a charged free cell weighs y, a static one 1, code/measure/pair-string), so ratio - 1 is the connected
//   ratio C(gap) of E-FRC-0188's static mesons
// - the demons' mean per batch, for the temperature and its spread
// - the lowest integer flux read (below 0 only if charges pass one another)
// Nothing moves: a pattern is read afresh from each snapshot.

import { pairLineBeat, pairLineBeatBack, pairLineEnergy, pairLineGauss, type PairLine, type PairLineState } from '@/code/rule/pair-line'
import { GOLDEN, SILVER } from '@/code/tool/weyl'
import { freeCell, perron, staticPotential, transferEigenvalues } from '@/code/measure/pair-string'

// The mod-3 measure's predictions at x, y (E-FRC-0189's formulas, from the free cell's Perron vectors): the charge
// density, the paid fraction, the meson profile at d = 1 .. profile, ln(lambda0 / x) (the profile's rate),
// ln(lambda0 / lambda1) (one-meson exchange), and the static mesons' connected ratio C(gap) for the same and the
// flipped orientation (code/measure/pair-string staticPotential: C = e^(-beta V) - 1)
export function modThreePredictions(input: { x: number; y: number; profile: number; gaps: number }): {
  charges: number
  paid: number
  profile: number[]
  profileRate: number
  exchangeRate: number
  same: number[]
  flipped: number[]
} {
  const { x, y } = input
  const t = freeCell(x, y)
  const { left, right, value } = perron(t)
  const lr = [0, 1, 2].reduce((a, e) => a + (left[e] as number) * (right[e] as number), 0)
  let charges = 0

  for (let e = 0; e < 3; e++) {
    for (let f = 0; f < 3; f++) {
      if (e !== f) {
        charges += ((left[e] as number) * (t[e * 3 + f] as number) * (right[f] as number)) / (value * lr)
      }
    }
  }

  const [l0, l1] = transferEigenvalues(x, y)
  const connected = (second: number[]): number[] =>
    Array.from({ length: input.gaps + 1 }, (_, gap) => Math.expm1(-staticPotential({ x, y, first: [1, -1], second, gap })))

  return {
    charges,
    paid: [1, 2].reduce((a, e) => a + (left[e] as number) * (right[e] as number), 0) / lr,
    profile: Array.from({ length: input.profile + 1 }, (_, d) => (d === 0 ? 0 : (2 * (left[0] as number) * (y * x) * x ** (d - 1) * y * (right[0] as number)) / (value ** (d + 1) * lr))),
    profileRate: Math.log(value / x),
    exchangeRate: Math.log(l0 / Math.abs(l1)),
    same: connected([1, -1]),
    flipped: connected([-1, 1]),
  }
}

export type PairLineSetup = {
  readonly cells: number
  readonly mass: number
  readonly tension: number
  readonly capacity: number
  readonly q: number
  readonly seeds: number
  readonly settle: number
  readonly beats: number
  readonly every: number
  readonly batches: number
  readonly profile: number
  readonly gaps: number
}

export type PairLineBatch = {
  reads: number
  demon: number
  charges: number
  paid: number
  readonly profile: Float64Array
  // [same orientation (love-left with love-left), flipped (love-left with fear-left)] real counts per gap
  readonly same: Float64Array
  readonly flipped: Float64Array
  sameReference: number
  flippedReference: number
}

export type PairLineRun = {
  readonly exact: boolean
  readonly reverses: boolean
  readonly lowestFlux: number
  readonly highestFlux: number
  readonly fewestCharges: number
  readonly mostCharges: number
  readonly batches: PairLineBatch[]
}

const mod3 = (x: number): number => ((x % 3) + 3) % 3

export function pairLineStart(setup: PairLineSetup): PairLineState {
  const { cells, capacity, q, seeds } = setup
  const weights = Array.from({ length: capacity + 1 }, (_, d) => q ** d)
  const total = weights.reduce((a, b) => a + b, 0)
  const cumulative = weights.map((_, d) => weights.slice(0, d + 1).reduce((a, b) => a + b, 0) / total)
  const demon = Int32Array.from({ length: cells }, (_, i) => cumulative.findIndex(c => ((i + 1) * SILVER) % 1 < c))
  const vibe = new Int8Array(cells)
  const flux = new Int32Array(cells)

  for (let k = 0; k < seeds; k++) {
    let i = Math.floor((((k + 1) * GOLDEN) % 1) * cells)

    while (vibe[i] !== 0 || vibe[(i + 1) % cells] !== 0 || vibe[(i + 2) % cells] !== 0 || vibe[(i - 1 + cells) % cells] !== 0) {
      i = (i + 1) % cells
    }

    vibe[i] = 1
    vibe[(i + 1) % cells] = -1
    flux[i] = 1
  }

  return { vibe, flux, demon }
}

export function pairLineRun(input: { setup: PairLineSetup; both: boolean; reverseCheck?: number }): PairLineRun {
  const { setup, both } = input
  const { cells, gaps } = setup
  const line: PairLine = { cells, mass: setup.mass, tension: setup.tension, capacity: setup.capacity }
  const start = pairLineStart(setup)
  const s: PairLineState = { vibe: Int8Array.from(start.vibe), flux: Int32Array.from(start.flux), demon: Int32Array.from(start.demon) }
  const scratch = new Int32Array(cells)
  const e0 = pairLineEnergy(line, s)
  const readsTotal = Math.floor(setup.beats / setup.every)
  const perBatch = Math.ceil(readsTotal / setup.batches)
  const batches: PairLineBatch[] = Array.from({ length: setup.batches }, () => ({
    reads: 0,
    demon: 0,
    charges: 0,
    paid: 0,
    profile: new Float64Array(setup.profile + 1),
    same: new Float64Array(gaps + 1),
    flipped: new Float64Array(gaps + 1),
    sameReference: 0,
    flippedReference: 0,
  }))
  const plus = new Int32Array(cells)
  const minus = new Int32Array(cells)

  let exact = pairLineGauss(line, s)
  let reads = 0
  let lowest = Infinity
  let highest = -Infinity
  let fewest = Infinity
  let most = 0

  // reversal: the first `reverseCheck` beats run forward and back from the start
  let reverses = true

  if (input.reverseCheck) {
    const r: PairLineState = { vibe: Int8Array.from(start.vibe), flux: Int32Array.from(start.flux), demon: Int32Array.from(start.demon) }

    for (let t = 0; t < input.reverseCheck; t++) {
      pairLineBeat(line, r, t, both, scratch)
    }

    for (let t = input.reverseCheck - 1; t >= 0; t--) {
      pairLineBeatBack(line, r, t, both, scratch)
    }

    reverses = r.vibe.every((v, i) => v === start.vibe[i]) && r.flux.every((v, i) => v === start.flux[i]) && r.demon.every((v, i) => v === start.demon[i])
  }

  for (let t = 0; t < setup.settle + setup.beats; t++) {
    pairLineBeat(line, s, t, both, scratch)

    if (t < setup.settle || (t - setup.settle) % setup.every !== 0) {
      continue
    }

    const batch = batches[Math.min(setup.batches - 1, Math.floor(reads / perBatch))] as PairLineBatch

    if (reads % 64 === 0) {
      exact = exact && pairLineEnergy(line, s) === e0 && pairLineGauss(line, s)
    }

    let here = 0
    let np = 0
    let nm = 0

    for (let i = 0; i < cells; i++) {
      const v = s.vibe[i] as number
      const e = s.flux[i] as number

      batch.demon += s.demon[i] as number
      here += v !== 0 ? 1 : 0
      batch.paid += mod3(e) !== 0 ? 1 : 0
      lowest = e < lowest ? e : lowest
      highest = e > highest ? e : highest

      if (v !== 0) {
        const w = s.vibe[i + 1 === cells ? 0 : i + 1] as number

        if (w === -v) {
          if (v > 0) {
            plus[np++] = i
          } else {
            minus[nm++] = i
          }
        }
      }
    }

    batch.charges += here
    fewest = Math.min(fewest, here)
    most = Math.max(most, here)

    // the static-meson correlation: love-left with love-left, and love-left with fear-left
    for (let k = 0; k < np; k++) {
      const i = plus[k] as number

      for (let gap = 0; gap <= gaps; gap++) {
        const j = (i + 2 + gap) % cells
        const a = s.vibe[j] as number
        const b = s.vibe[j + 1 === cells ? 0 : j + 1] as number

        if (a === 1 && b === -1) {
          batch.same[gap] = (batch.same[gap] as number) + 1
        } else if (a === -1 && b === 1) {
          batch.flipped[gap] = (batch.flipped[gap] as number) + 1
        }
      }
    }

    batch.sameReference += (np * (np - 1)) / (cells - 1)
    // a fear-left pattern can never start on a love-left pattern's first cell, so N - 1 places remain
    batch.flippedReference += (np * nm) / (cells - 1)

    // the meson profile (E-FRC-0189): an unpaid link, a charge, d paid links with no charge between, the opposite
    // charge, an unpaid link
    for (let i = 0; i < cells; i++) {
      const q = s.vibe[i] as number

      if (q === 0 || mod3(s.flux[(i - 1 + cells) % cells] as number) !== 0) {
        continue
      }

      let d = 1

      while (d <= setup.profile + 1 && s.vibe[(i + d) % cells] === 0 && mod3(s.flux[(i + d - 1) % cells] as number) !== 0) {
        d++
      }

      const end = (i + d) % cells

      if (d <= setup.profile && s.vibe[end] === -q && mod3(s.flux[(i + d - 1) % cells] as number) !== 0 && mod3(s.flux[end] as number) === 0) {
        batch.profile[d] = (batch.profile[d] as number) + 1
      }
    }

    batch.reads++
    reads++
  }

  exact = exact && pairLineEnergy(line, s) === e0 && pairLineGauss(line, s)

  return { exact, reverses, lowestFlux: lowest, highestFlux: highest, fewestCharges: fewest, mostCharges: most, batches }
}
