// Harness for the compact-counter light in bulk trits (E-FRC-0219, 0220): starts, a gas of hopping vibes,
// the exactness check against the husk shaped rule, reversal, Gauss, the carry-chain census and a hop's
// radiation read on the husk. The rule is code/rule/trit-compact; reals appear only in the radiation reading.
//
// Starts use the integer Weyl sequence w(i) = (i + 1) * 40503 mod 2^16 (40503 = round(2^16 / golden ratio)),
// a value in a window of n integers being floor(w n / 2^16) - n / 2: integers only.

import { G_METRIC, emptyLinear, energyMask, linearBeat, linearEnergy, linearFlux } from '@/code/measure/trit-hop-light'
import { makeShadowScratch, shadowReading } from '@/code/measure/trit-shaped-light'
import { bulkGaussViolations, huskGaussViolations, placeTritPair, type TritLight, type TritState } from '@/code/rule/trit-column'
import { buildHopTable, gasStep, hopStep, huskLinkOf, cross, type HopTable, type HopTally } from '@/code/rule/trit-hop'
import { geometryOfBulk, makeHuskEngine } from '@/code/rule/trit-husk'
import { emptyShaped, makeShapedScratch, shapedBeat, type ShapedState } from '@/code/rule/trit-husk-shaped'
import {
  carryAdd as carryAddLocal,
  decodeTernary as decodeLocal,
  encodeTernary as encodeLocal,
  ternaryDigits as ternaryDigitsLocal,
  compactArrays,
  compactBeat,
  compactBeatBack,
  compactFlux,
  copyCompact,
  emptyCompact,
  emptyCompactTally,
  makeCompactLight,
  readCompactHusk,
  writeCompactHusk,
  type CompactLight,
  type CompactState,
  type CompactTally,
  type CounterCode,
} from '@/code/rule/trit-compact'

export const weylInt = (i: number): number => ((i + 1) * 40503) % 65536

export const weylIn = (i: number, n: number): number => Math.floor((weylInt(i) * n) / 65536) - Math.floor(n / 2)

// the trit-column TritState view of a compact state, for the hop rule (which reads vibes and strings only)
export function asTritState(s: CompactState): TritState {
  return { vibe: s.vibe, angle: s.angle, string: s.string, potential: s.potential, counter: s.store[0]!, lag: s.store[1]!, spatial: s.store[2]! }
}

// the husk values of a shaped state, in counter-index order
function shapedCounters(s: ShapedState): Int32Array[] {
  const out = [s.counter, s.lag, s.spatial]

  for (let i = 0; i < s.upper.length; i++) out.push(s.upper[i]!, s.upperLag[i]!)

  return out
}

// A golden-Weyl start written into a compact state and the matching husk shaped state: angles in their
// windows, every counter in -D .. D, potentials in a small window, and `pairs` love-fear pairs one bulk link
// apart (their strings keep Gauss exact from the start)
export function weylStart(c: CompactLight, s: CompactState, husk: ShapedState, pairs: number, salt: number): void {
  const b = c.bulk
  const d = b.depth
  const q = 2 * d + 1

  for (let i = 0; i < b.huskLinks; i++) husk.angle[i] = weylIn(i + salt, i % 9 < 3 ? 4 * d : 2 * d)

  const counters = shapedCounters(husk)

  for (let p = 0; p < b.huskTriangles; p++) {
    husk.potential[p] = weylIn(3 * p + salt + 7, 2 * d + 1)

    for (let k = 0; k < counters.length; k++) counters[k]![p] = weylIn(p * 11 + k * 101 + salt + 13, q)
  }

  writeCompactHusk(c, s, { angle: husk.angle, potential: husk.potential, counter: counters })

  const t = asTritState(s)
  const table = buildHopTable(b)

  for (let j = 0; j < pairs; j++) {
    const x = (weylInt(j + salt + 17) * b.docks) >>> 16
    const k = weylInt(j + salt + 29) % 12

    const y = b.neighbour[x * 24 + table.rootOf[k]!]!

    if (t.vibe[x] !== 0 || t.vibe[y] !== 0 || t.string[x * 12 + k] !== 0) continue

    placeTritPair(c.light, t, x, [k], 1)
  }

  const huskString = readCompactHusk(c, s).string

  husk.string.set(huskString)
}

export type CompareResult = { mismatches: number; firstBeat: number }

function compareToHusk(c: CompactLight, s: CompactState, husk: ShapedState): number {
  const v = readCompactHusk(c, s)
  const counters = shapedCounters(husk)
  let m = 0

  for (let i = 0; i < v.angle.length; i++) m += v.angle[i] === husk.angle[i] ? 0 : 1
  for (let i = 0; i < v.string.length; i++) m += v.string[i] === husk.string[i] ? 0 : 1
  for (let p = 0; p < v.potential.length; p++) m += v.potential[p] === husk.potential[p] ? 0 : 1

  for (let k = 0; k < counters.length; k++) {
    const a = v.counter[k]!
    const b = counters[k]!

    for (let p = 0; p < a.length; p++) m += a[p] === b[p] ? 0 : 1
  }

  return m
}

function sameTrits(a: CompactState, b: CompactState, withStores: boolean): number {
  let m = 0
  const x = withStores ? compactArrays(a) : [a.vibe, a.angle, a.string, a.potential]
  const y = withStores ? compactArrays(b) : [b.vibe, b.angle, b.string, b.potential]

  x.forEach((arr, i) => arr.forEach((v, j) => (m += v === y[i]![j] ? 0 : 1)))

  return m
}

export type ExactRun = {
  beats: number
  // ternary against thermometer: every shared trit (vibe, angle, string, potential) and every counter value
  tritMismatches: number
  counterMismatches: number
  // each code decoded against the husk shaped rule
  ternaryHuskMismatches: number
  thermometerHuskMismatches: number
  // Gauss's law, bulk and husk, every beat, both codes
  bulkGauss: number
  huskGauss: number
  // reversal: every trit back at the start
  ternaryReversal: number
  thermometerReversal: number
  hops: HopTally
  ternaryTally: CompactTally
  thermometerTally: CompactTally
}

// the same start, the same gas, in both codes and in the husk rule; then both codes run back
export function exactRun(input: { light: TritLight; levels: number; beats: number; pairs: number; salt: number }): ExactRun {
  const { light, levels, beats, pairs, salt } = input
  const ter = makeCompactLight(light, levels, 'ternary')
  const thr = makeCompactLight(light, levels, 'thermometer')
  const st = emptyCompact(ter)
  const sh = emptyCompact(thr)
  const g = geometryOfBulk(light.bulk)
  const engine = makeHuskEngine(g, light.bulk.depth)
  const husk = emptyShaped(g, levels)
  const huskTwin = emptyShaped(g, levels)
  const scratch = makeShapedScratch(g, levels)
  const options = { levels, cyclic: false }

  weylStart(ter, st, husk, pairs, salt)
  weylStart(thr, sh, huskTwin, pairs, salt)

  const st0 = copyCompact(st)
  const sh0 = copyCompact(sh)
  const table = buildHopTable(light.bulk)
  const hops: HopTally = { crossings: 0, refused: 0, carried: 0 }
  const ternaryTally = emptyCompactTally()
  const thermometerTally = emptyCompactTally()
  let tritMismatches = 0
  let counterMismatches = 0
  let ternaryHuskMismatches = compareToHusk(ter, st, husk)
  let thermometerHuskMismatches = compareToHusk(thr, sh, husk)
  let bulkGauss = 0
  let huskGauss = 0

  for (let t = 0; t < beats; t++) {
    const [k, phase] = gasStep(t)

    hopStep(table, asTritState(st), k, phase, hops)
    hopStep(table, asTritState(sh), k, phase)
    compactBeat(ter, st, ternaryTally)
    compactBeat(thr, sh, thermometerTally)

    husk.string.set(readCompactHusk(ter, st).string)
    shapedBeat(engine, husk, scratch, options)

    tritMismatches += sameTrits(st, sh, false)

    const a = readCompactHusk(ter, st)
    const b = readCompactHusk(thr, sh)

    for (let x = 0; x < a.counter.length; x++) for (let p = 0; p < a.counter[x]!.length; p++) counterMismatches += a.counter[x]![p] === b.counter[x]![p] ? 0 : 1

    ternaryHuskMismatches += compareToHusk(ter, st, husk)
    thermometerHuskMismatches += compareToHusk(thr, sh, husk)

    for (const [cl, s] of [
      [ter, st],
      [thr, sh],
    ] as const) {
      bulkGauss += bulkGaussViolations(light, asTritState(s))
      compactFlux(cl, s)
      huskGauss += huskGaussViolations(light, cl.huskFlux, s.vibe)
    }
  }

  for (let t = beats - 1; t >= 0; t--) {
    const [k, phase] = gasStep(t)

    compactBeatBack(ter, st)
    compactBeatBack(thr, sh)
    hopStep(table, asTritState(st), k, phase)
    hopStep(table, asTritState(sh), k, phase)
  }

  return {
    beats,
    tritMismatches,
    counterMismatches,
    ternaryHuskMismatches,
    thermometerHuskMismatches,
    bulkGauss,
    huskGauss,
    ternaryReversal: sameTrits(st, st0, true),
    thermometerReversal: sameTrits(sh, sh0, true),
    hops,
    ternaryTally,
    thermometerTally,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the carry chain census: every value of -D .. D written, and every change v -> v' paid by the carry chain

export type CarryCensus = { depth: number; digits: number; values: number; unused: number; encodeFailures: number; chainFailures: number; cases: number; meanReach: number; maxReach: number; meanFlips: number; thermometerMeanFlips: number }

export function carryCensus(depth: number): CarryCensus {
  const k = ternaryDigitsLocal(depth)
  const seen = new Set<string>()
  let encodeFailures = 0
  let chainFailures = 0
  let cases = 0
  let reach = 0
  let maxReach = 0
  let flips = 0
  let thermo = 0
  const a = new Int8Array(k)
  const b = new Int8Array(k)

  for (let v = -depth; v <= depth; v++) {
    encodeLocal(v, k, a)
    seen.add(Array.from(a).join(','))
    if (decodeLocal(a, k) !== v) encodeFailures++

    for (let w = -depth; w <= depth; w++) {
      encodeLocal(v, k, b)

      const r = carryAddLocal(b, k, w - v)

      encodeLocal(w, k, a)
      if (Array.from(a).join(',') !== Array.from(b).join(',')) chainFailures++
      cases++
      reach += r.reach
      maxReach = Math.max(maxReach, r.reach)
      flips += r.flips
      thermo += Math.abs(w - v)
    }
  }

  return {
    depth,
    digits: k,
    values: seen.size,
    unused: 3 ** k - seen.size,
    encodeFailures: encodeFailures + (seen.size === 2 * depth + 1 ? 0 : 1),
    chainFailures,
    cases,
    meanReach: reach / cases,
    maxReach,
    meanFlips: flips / cases,
    thermometerMeanFlips: thermo / cases,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the trit budget

// per husk triangle: the counter trits the column holds (3 D) against what 2 L + 1 counters take; per husk
// dock (32 D bulk triangles of four trits: u and three counters, 128 D): the potentials take 32 D (the sum of
// n_P D over the dock's 20 husk triangles) and the counters 20 (2 L + 1) k
export function budget(depth: number, levels: number, code: CounterCode): { perTriangleNeed: number; perTriangleHave: number; perDockNeed: number; perDockHave: number; ratio: number } {
  const k = code === 'ternary' ? ternaryDigitsLocal(depth) : depth
  const counters = 2 * levels + 1
  const perDockNeed = 32 * depth + 20 * counters * k

  return { perTriangleNeed: counters * k, perTriangleHave: 3 * depth, perDockNeed, perDockHave: 128 * depth, ratio: perDockNeed / (128 * depth) }
}

// ---------------------------------------------------------------------------------------------------------
// a hop's radiation in bulk trits

export type BulkHop = {
  gain: number
  incoherentOverSignal: number
  energyRatio: number
  huskMismatches: number
  crossings: number
  refused: number
  bulkGauss: number
  huskGauss: number
  reversal: number
  potentialWraps: number
  counterReach: number
  counterFlips: number
  flips: number
}

// A love and a fear on the two ends of one bulk axis link (x, k); every `half` beats the link's crossing runs
// (the vibes swap and the string trit pays the charge), forth and back. The husk shaped rule runs beside with
// the column-summed string, and the linear leapfrog with the same current. Read beyond `radius`
export function bulkHopRadiation(input: { light: TritLight; levels: number; beats: number; half: number; radius: number }): BulkHop {
  const { light, levels, beats, half, radius } = input
  const bulk = light.bulk
  const c = makeCompactLight(light, levels, 'ternary')
  const s = emptyCompact(c)
  const t = asTritState(s)
  const g = geometryOfBulk(bulk)
  const engine = makeHuskEngine(g, bulk.depth)
  const husk = emptyShaped(g, levels)
  const scratch = makeShapedScratch(g, levels)
  const options = { levels, cyclic: false }
  const lin = emptyLinear(g)
  const work = new Float64Array(g.huskLinks)
  const next = new Float64Array(g.huskLinks)
  const table: HopTable = buildHopTable(bulk)
  const tally = emptyCompactTally()
  const hops: HopTally = { crossings: 0, refused: 0, carried: 0 }
  // the crossing link: the first axis root (k = 0 casts husk axis 0) at the bulk dock of column 0, level 0
  const x = 0
  const k = 0
  const y = bulk.neighbour[x * 24 + table.rootOf[k]!]!
  const huskLink = huskLinkOf(bulk, x, k)

  t.vibe[x] = 1
  t.vibe[y] = -1

  // the pair starts on one dock pair with no string: the fear is where the love's crossing would put it, so
  // Gauss needs the love's unit on the link: place it as a string trit
  t.string[x * 12 + k] = 1
  husk.string.set(readCompactHusk(c, s).string)
  lin.string[huskLink] = husk.string[huskLink]!

  const s0 = copyCompact(s)
  let huskMismatches = 0
  let bulkGauss = 0
  let huskGauss = 0
  const schedule: number[] = []

  for (let b = 0; b < beats; b++) {
    const due = b % half === 0 && b > 0

    schedule.push(due ? 1 : 0)

    if (due) {
      const j = cross(table, t, x, k, hops)

      lin.string[huskLink] = (lin.string[huskLink] ?? 0) - j
    }

    compactBeat(c, s, tally)
    husk.string.set(readCompactHusk(c, s).string)
    shapedBeat(engine, husk, scratch, options)
    linearBeat(engine, lin, work)

    const v = readCompactHusk(c, s)

    for (let i = 0; i < v.angle.length; i++) huskMismatches += v.angle[i] === husk.angle[i] ? 0 : 1
    for (let p = 0; p < v.potential.length; p++) huskMismatches += v.potential[p] === husk.potential[p] ? 0 : 1

    bulkGauss += bulkGaussViolations(light, t)
    compactFlux(c, s)
    huskGauss += huskGaussViolations(light, c.huskFlux, t.vibe)
  }

  // read in the husk shaped state (equal to the trits' decoding when huskMismatches is 0)
  const center = bulk.column[x]!
  const all = energyMask(g, center, -1)
  const far = energyMask(g, center, radius)
  const reading = makeShadowScratch(g)
  const integerTotal = shadowReading(engine, husk, options, all, reading)

  shadowReading(engine, husk, options, far, reading)

  const linearTotal = linearEnergy(engine, lin, all, work, next)

  linearFlux(g, lin, work)

  let dot = 0
  let norm = 0
  let rest = 0

  for (let l = 0; l < g.huskLinks; l++) {
    if (!far.links[l]) continue

    const w = 1 / (G_METRIC[l % 9] ?? 1)
    const a = reading.shadow[l] ?? 0
    const b = work[l] ?? 0

    dot += w * a * b
    norm += w * b * b
    rest += w * (a - b) ** 2
  }

  for (let b = beats - 1; b >= 0; b--) {
    compactBeatBack(c, s)
    if (schedule[b]) cross(table, t, x, k)
  }

  let reversal = 0

  compactArrays(s).forEach((arr, i) => arr.forEach((v, j) => (reversal += v === compactArrays(s0)[i]![j] ? 0 : 1)))

  return {
    gain: dot / norm,
    incoherentOverSignal: rest / norm,
    energyRatio: integerTotal / linearTotal,
    huskMismatches,
    crossings: hops.crossings,
    refused: hops.refused,
    bulkGauss,
    huskGauss,
    reversal,
    potentialWraps: tally.potentialWraps,
    counterReach: tally.counterReach,
    counterFlips: tally.counterFlips,
    flips: tally.flips,
  }
}

// A static string: a love and a fear `length` axis links apart along one bulk axis root, held for `beats`
// beats in the L-level light; the potential wraps counted (E-FRC-0214: 514,610 at one level, D 8, 2,000 beats)
export function staticStringWraps(input: { light: TritLight; levels: number; beats: number; length: number }): { potentialWraps: number; bulkGauss: number } {
  const { light, levels, beats, length } = input
  const c = makeCompactLight(light, levels, 'ternary')
  const s = emptyCompact(c)
  const t = asTritState(s)
  const tally = emptyCompactTally()

  placeTritPair(light, t, 0, Array.from({ length }, () => 0), 1)

  let bulkGauss = 0

  for (let b = 0; b < beats; b++) {
    compactBeat(c, s, tally)
    if (b % 100 === 99) bulkGauss += bulkGaussViolations(light, t)
  }

  return { potentialWraps: tally.potentialWraps, bulkGauss }
}
