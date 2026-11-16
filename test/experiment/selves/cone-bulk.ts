// THE COLD BULK ON THE LIGHT CONE (item vibe-roadmap-grounding-0019; B3's engine; grounding decisions 002, 003, 004).
// B3 (E-SLF-0183) put B1's bound cluster (E-SLF-0182, E-SPN-0093's level) and its bath on an open honeycomb line that
// runs into the calm vacuum, and found the open line loses the cluster's excess only about 20 percent slower than B1's
// closed ring. Its dense engine held every configuration of 32 docks, exact for 4 beats at W 12, so the keeping time
// was only predicted (6.4 beats against the 80 the 10x gate asks). Here code/measure/cone-line.ts stores only the
// configurations the start reaches on an open line of at least 256 docks, so the keeping time is MEASURED.
//
// WHY A LINE IS THE HONEYCOMB HERE (E-SLF-0183): the working rule's beat is a product of line maps, a state on one line
// stays on it, and a honeycomb line is an open geodesic; E-SLF-0183's L1 checked the line law on the exact ball and O1
// that ODD (decision 003) is silent on a line (at most 2 vibes a dock, under ODD's k* = 4). The line here is long
// enough that no love reaches its ends in the run (E3), so it is the infinite line of empty docks exactly.
//
// THE RULE: B1's line sector (E-SPN-0103 cost and sign, pass contact, flat links) in floats with the split coin D P D
// (decision 004). E1 checks the sparse engine against cold-line.ts (itself checked against E-SPN-0104's ring form,
// pointBeatWith, in E-SLF-0182 and E-SLF-0183) amplitude for amplitude, with the split coin and the coin-before beat.
//
// GATES, fixed in the item's what before this file existed (2026-11-15): C1, E1, E2, E3, I4, C2, the growth law, the
// measures (a) and (b), GATE (b) tau_open >= 10 times B1's tau. Verdict: fail if C1, E1, E2 or E3 fails, or if
// tau_open is measured below 10 B1 tau at every W with k 3; pass if (b) holds measured at every W with k 3 with I4 and
// C2; open otherwise. A k 6 setting is gated only where its tau is measured. Smoke is no evidence (open by rule).
//
// PREDICTION (before the first run): n 6 reaches 12 to 20 beats (N near t^5), n 9 only 2 to 4; tau_open is measured
// between 5 and 12 beats at W 12 k 3, so (b) fails measured.
//
// SETTINGS. Default SMOKE (box-8 level, W 10 k 3 start 0, Lo 24, CAP 2e6, 32 beats; seconds on the laptop).
// CONE_SWEEP=full for the M3 (box-12 level, W 12 and W 15, k 3 and 6, 256 beats, CAP 1.5e8).
//
// SMOKE (laptop, 2026-11-15, no evidence): the first probe stopped at E3 (4 reversal beats pass the 2e6 smoke cap; the
// smoke reversal is now 3 beats); the second ran, open by rule.
//
// FULL RUN (M3, 2026-11-15, clone cone-bulk, 5,653 s, light slot, gate e0f91c26f6f8): OPEN. C1 exact, E1 0 (all
// 14,232,612 amplitudes bit for bit, F 1.2e-14), E2 6.4e-16 before each wrap (first differ at t_w exactly where a love
// can wrap), E3 1.1e-15 and 9.6e-16 back (weight below the 1e-14 floor 3.1e-23), norm 3.1e-11, end hits 0, I4 tau 8,
// C2 0.912 and 0.929 (lone runs 229 and 228 beats, cap). Growth: 3 loves p 2.8, 6 loves p 4.1 and 3.9 (last ratio
// 1.45), 9 loves about 5. Reach: W 12 k 3 11 beats, W 15 k 3 9, k 6 3 and 2. The open g stays above 1/2 within the
// reach (W 12: 0.518 at beat 9, 0.541 at 11; W 15: 0.625 at 9) where the closed ring crosses at 7 (W 12) and 48
// (W 15); tau_open predicted 14.5 (W 12) and 22.1 (W 15) against 80 and 320: not measured, so open.
//
// Depth L2: B1's rule in floats on one sector; the line law and ODD rest on E-SLF-0183's exact ball checks.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
} from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { Placed } from '@/code/measure/held-cluster'
import {
  bathLoves,
  boundCount,
  emptyAmp,
  lineBeat,
  lineEngine,
  lineReader,
  lineStart,
  normOf,
  thermal,
  type Amp,
  type LineEngine,
  type LineReader,
} from '@/code/measure/cold-line'
import {
  ConeCap,
  agreeWith,
  coneBeat,
  coneBeatBack,
  coneBoundCount,
  coneNorm,
  coneStart,
  coneStore,
  copyStore,
  fromDense,
  storeDifference,
  type ConeStore,
} from '@/code/measure/cone-line'

const RECORDED = {
  energy: 0.33001851839229945,
  share: 0.9823600683345252,
}

const EXACT = 1e-12
const START = 1e-14
const REVERSED = 1e-10
const BACK_FLOOR = 1e-14
const HOLD = 0.9
const HALF = 0.5
const TENFOLD = 10

type Case = {
  W: number
  starts: number
  // B1's tau by bath size k
  b1Tau: Record<number, number>
}

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  cases: readonly Case[]
  ks: readonly number[]
  beats: number
  cap: number
  Lo: number
  // E2 rings: for n 3 and for the n 6 cluster + bath (0: not run)
  lc3: number
  lc6: number
  reverse6: number
  reverseLone: number
}

const SMOKE: Setting = {
  name: 'smoke',
  box: 8,
  levelBar: 1e-4,
  cases: [{ W: 10, starts: 1, b1Tau: { 3: 4 } }],
  ks: [3],
  beats: 32,
  cap: 2e6,
  Lo: 24,
  lc3: 24,
  lc6: 0,
  // 4 beats hold 2.7e6 slots at W 10, past the smoke cap
  reverse6: 3,
  reverseLone: 16,
}

const FULL: Setting = {
  name: 'full',
  box: 12,
  levelBar: 1e-9,
  cases: [
    { W: 12, starts: 3, b1Tau: { 3: 8, 6: 8 } },
    { W: 15, starts: 2, b1Tau: { 3: 32, 6: 16 } },
  ],
  ks: [3, 6],
  beats: 256,
  cap: 1.5e8,
  Lo: 32,
  lc3: 32,
  lc6: 28,
  reverse6: 8,
  reverseLone: 64,
}

const readBeat = (t: number): boolean => t <= 32 || t % 8 === 0

const mean = (xs: readonly number[]): number =>
  xs.reduce((s, x) => s + x, 0) / xs.length

// the docks B1's start spans once lifted (E-SLF-0183 widthOf)
const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

// ---- the open runs ----

type OpenRun = {
  n: number
  reach: number
  capped: boolean
  // read beat -> F
  reads: Map<number, number>
  // stored slots and reached configurations at beats 0..reach
  slots: number[]
  written: number[]
  normOff: number
  endHits: number
  seconds: number
}

function openRun(
  first: ConeStore,
  beats: number,
  rd: LineReader,
  log: (what: string) => void,
  label: string,
): OpenRun {
  const started = Date.now()

  let a = first
  let b = coneStore(a.n, a.line, a.cap)
  let reach = 0
  let capped = false
  let normOff = Math.abs(coneNorm(a) - 1)
  let endHits = a.endHits

  const reads = new Map<number, number>([[0, coneBoundCount(a, rd)]])
  const slots = [a.used]
  const written = [a.written]

  for (let t = 1; t <= beats; t++) {
    try {
      coneBeat(a, b, true)
    } catch (err) {
      if (err instanceof ConeCap) {
        capped = true
        break
      }

      throw err
    }

    ;[a, b] = [b, a]
    reach = t
    endHits += a.endHits
    normOff = Math.max(normOff, Math.abs(coneNorm(a) - 1))
    slots.push(a.used)
    written.push(a.written)

    if (readBeat(t)) {
      reads.set(t, coneBoundCount(a, rd))
    }

    if (t <= 32 || t % 32 === 0) {
      log(`${label} beat ${t}: ${a.used} slots, ${a.written} reached`)
    }
  }

  return {
    n: a.n,
    reach,
    capped,
    reads,
    slots,
    written,
    normOff,
    endHits,
    seconds: (Date.now() - started) / 1000,
  }
}

// the growth law: the least-squares slope of ln N against ln(t + 1) over the second half of the reached beats
function growthLaw(slots: readonly number[]): number {
  const B = slots.length - 1

  if (B < 2) {
    return NaN
  }

  const xs: number[] = []
  const ys: number[] = []

  for (let t = Math.ceil(B / 2); t <= B; t++) {
    xs.push(Math.log(t + 1))
    ys.push(Math.log(slots[t]!))
  }

  const mx = mean(xs)
  const my = mean(ys)

  let sxy = 0
  let sxx = 0

  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i]! - my)
    sxx += (x - mx) ** 2
  })

  return sxy / sxx
}

// ---- the closed control (cold-line.ts, B1's ring) ----

type DenseRun = { reads: Map<number, number>; normOff: number }

function denseSeries(
  e: LineEngine,
  start: Amp,
  rd: LineReader,
  beats: number,
): DenseRun {
  let a = start
  let b = emptyAmp(a.re.length)
  let normOff = Math.abs(normOf(a) - 1)

  const reads = new Map<number, number>([[0, boundCount(e, rd, a)]])

  for (let t = 1; t <= beats; t++) {
    lineBeat(e, a, b, true)
    ;[a, b] = [b, a]
    normOff = Math.max(normOff, Math.abs(normOf(a) - 1))

    if (readBeat(t)) {
      reads.set(t, boundCount(e, rd, a))
    }
  }

  return { reads, normOff }
}

// ---- E1, E2 ----

type Equality = {
  what: string
  // the largest difference (amplitude, sparse outside, or dense weight missing, as an amplitude) per beat
  diffs: number[]
  exact: number
  total: number
  fRel: number
  start: number
}

const diffOf = (g: { worst: number; missing: number }): number =>
  Math.max(g.worst, Math.sqrt(g.missing))

function equality(input: {
  what: string
  e: LineEngine
  W: number
  fit: readonly Placed[]
  bath: readonly (readonly [number, number])[]
  placed: boolean
  offset: number
  beats: number
  split: boolean
  rd: LineReader | undefined
  anchorMax: number
  cap: number
}): Equality {
  const { what, e, W, fit, bath, offset, beats, split, rd, anchorMax, cap } =
    input
  // the sparse line holds the dense docks shifted by `shift`, with room past both ends for the beats run
  const shift = beats + 2
  const line = e.sp.L + 2 * shift
  const placed = input.placed ? fit : undefined
  const dense = lineStart({ e, W, placed, bath, lift: true, offset })
  const mine = coneStart({
    n: e.sp.n,
    line,
    cap,
    W,
    placed,
    bath,
    offset: offset + shift,
  }).store
  const start = diffOf(agreeWith(mine, e, dense.amp, shift))

  // the run starts from the dense start itself, so each beat is compared operation for operation
  let s = fromDense(e, dense.amp, line, cap, shift)
  let s2 = coneStore(e.sp.n, line, cap)
  let a = dense.amp
  let b = emptyAmp(a.re.length)
  let exact = 0
  let total = 0
  let fRel = 0

  const diffs: number[] = []

  for (let t = 1; t <= beats; t++) {
    lineBeat(e, a, b, split)
    ;[a, b] = [b, a]
    coneBeat(s, s2, split)
    ;[s, s2] = [s2, s]

    const g = agreeWith(s, e, a, shift)

    diffs.push(diffOf(g))
    exact += g.exact
    total += g.sparse

    if (rd) {
      const F = boundCount(e, rd, a)
      const Fs = coneBoundCount(s, rd, anchorMax + shift)

      fRel = Math.max(fRel, Math.abs(F - Fs) / Math.max(Math.abs(F), 1e-300))
    }
  }

  return { what, diffs, exact, total, fRel, start }
}

// ---- one W ----

type KResult = {
  k: number
  b1Tau: number
  starts: number
  reach: number
  capped: boolean
  beats: number[]
  openG: number[]
  closedBeats: number[]
  closedG: number[]
  tauOpen: number
  tauMeasured: boolean
  tauClosed: number
  rateOpen: number
  rateClosed: number
  gateB: boolean
  gateBMeasured: boolean
  measuredShort: boolean
  growth: number
  growthRatio: number
  slots: number[]
  bathReach: number
  bathGrowth: number
}

type CaseResult = {
  W: number
  width: number
  line: number
  lone: OpenRun
  loneGrowth: number
  c2: boolean
  c2Least: number
  ks: KResult[]
  b1F: number[]
  b1TauRepro: number
  normOff: number
  endHits: number
}

function runCase(
  c: Case,
  setting: Setting,
  placed: readonly Placed[],
  log: (what: string) => void,
): CaseResult {
  const { W } = c
  const read = Math.floor((W - 1) / 2)
  const fit = fitRing(placed, W).kept
  const width = widthOf(W, fit)
  const beats = setting.beats
  const line = Math.max(256, width + 2 * beats + 2)
  const offset = beats + 1
  const rdO = lineReader(placed, line, read, false)
  const make = (
    n: number,
    bath: readonly (readonly [number, number])[],
    withCluster: boolean,
  ): ConeStore =>
    coneStart({
      n,
      line,
      cap: setting.cap,
      W,
      placed: withCluster ? fit : undefined,
      bath,
      offset,
    }).store

  // the lone cluster, 256 beats
  const lone = openRun(make(3, [], true), beats, rdO, log, `W ${W} lone`)
  const F0 = lone.reads.get(0)!
  const c2Least = Math.min(...[...lone.reads.values()].map(F => F / F0))

  let normOff = lone.normOff
  let endHits = lone.endHits

  // the closed control
  const engines = new Map<string, LineEngine>()
  const engineOf = (n: number): LineEngine => {
    const key = `${n}`
    const found = engines.get(key)

    if (found) {
      return found
    }

    const made = lineEngine(W, n, true)

    engines.set(key, made)

    return made
  }
  const rdC = lineReader(placed, W, read, true)
  const c3 = engineOf(3)
  const loneC = denseSeries(
    c3,
    lineStart({ e: c3, W, placed: fit, bath: [], lift: false, offset: 0 }).amp,
    rdC,
    beats,
  )

  normOff = Math.max(normOff, loneC.normOff)
  log(`W ${W} closed lone`)

  const ks: KResult[] = []
  let b1F: number[] = []
  let b1TauRepro = Infinity

  for (const k of setting.ks) {
    const b1Tau = c.b1Tau[k]

    if (b1Tau === undefined) {
      continue
    }

    const starts = k === 3 ? c.starts : 1
    const cluster: OpenRun[] = []
    const bathRuns: OpenRun[] = []
    const kC: DenseRun[] = []
    const bathC: DenseRun[] = []
    const ck = engineOf(3 + k)
    const cb = engineOf(k)

    for (let s = 0; s < starts; s++) {
      const bath = bathLoves(W, read, k, s)
      const run = openRun(
        make(3 + k, bath, true),
        beats,
        rdO,
        log,
        `W ${W} k ${k} start ${s}`,
      )

      cluster.push(run)
      bathRuns.push(
        openRun(make(k, bath, false), run.reach, rdO, log, `W ${W} k ${k} bath ${s}`),
      )
      kC.push(
        denseSeries(
          ck,
          lineStart({ e: ck, W, placed: fit, bath, lift: false, offset: 0 }).amp,
          rdC,
          beats,
        ),
      )
      bathC.push(
        denseSeries(
          cb,
          lineStart({ e: cb, W, placed: undefined, bath, lift: false, offset: 0 })
            .amp,
          rdC,
          beats,
        ),
      )
      log(`W ${W} k ${k} start ${s} done (reach ${run.reach})`)
    }

    for (const r of [...cluster, ...bathRuns]) {
      normOff = Math.max(normOff, r.normOff)
      endHits += r.endHits
    }

    for (const r of [...kC, ...bathC]) {
      normOff = Math.max(normOff, r.normOff)
    }

    const reach = Math.min(
      ...cluster.map(r => r.reach),
      ...bathRuns.map(r => r.reach),
      lone.reach,
    )
    const readBeats = [...lone.reads.keys()].filter(
      t =>
        t <= reach &&
        cluster.every(r => r.reads.has(t)) &&
        bathRuns.every(r => r.reads.has(t)),
    )
    const openG = readBeats.map(
      t =>
        (mean(cluster.map(r => r.reads.get(t)!)) -
          mean(bathRuns.map(r => r.reads.get(t)!))) /
        lone.reads.get(t)!,
    )
    const closedBeats = [...loneC.reads.keys()]
    const closedG = closedBeats.map(
      t =>
        (mean(kC.map(r => r.reads.get(t)!)) -
          mean(bathC.map(r => r.reads.get(t)!))) /
        loneC.reads.get(t)!,
    )

    if (W === 12 && k === 3) {
      // B1's own reading (thermal floor), every 8
      b1F = closedBeats
        .filter(t => t % 8 === 0)
        .map(
          t =>
            (mean(kC.map(r => r.reads.get(t)!)) - thermal(W, 3 + k)) /
            (loneC.reads.get(t)! - thermal(W, 3)),
        )

      const at = b1F.findIndex(f => f < HALF)

      b1TauRepro = at < 0 ? Infinity : 8 * at
    }

    const below = openG.findIndex(g => g < HALF)
    const last = openG.length - 1
    const B = readBeats[last]!
    const half = readBeats.findIndex(t => t >= B / 2)
    const late =
      last > half
        ? (openG[half]! - openG[last]!) / (B - readBeats[half]!)
        : 0
    const tauMeasured = below >= 0
    const tauOpen = tauMeasured
      ? readBeats[below]!
      : late > 0
        ? B + (openG[last]! - HALF) / late
        : Infinity
    const cBelow = closedG.findIndex(g => g < HALF)
    const tauClosed = cBelow < 0 ? Infinity : closedBeats[cBelow]!
    const closedAtB = closedBeats.indexOf(B)
    const growthRun = cluster[0]!

    ks.push({
      k,
      b1Tau,
      starts,
      reach,
      capped: cluster.some(r => r.capped),
      beats: readBeats,
      openG,
      closedBeats,
      closedG,
      tauOpen,
      tauMeasured,
      tauClosed,
      rateOpen: B > 0 ? (openG[0]! - openG[last]!) / B : NaN,
      rateClosed:
        B > 0 && closedAtB >= 0 ? (closedG[0]! - closedG[closedAtB]!) / B : NaN,
      gateB: tauOpen >= TENFOLD * b1Tau,
      gateBMeasured: !tauMeasured && B >= TENFOLD * b1Tau,
      measuredShort: tauMeasured && tauOpen < TENFOLD * b1Tau,
      growth: growthLaw(growthRun.slots),
      growthRatio:
        growthRun.slots.length > 1
          ? growthRun.slots[growthRun.reach]! /
            growthRun.slots[growthRun.reach - 1]!
          : NaN,
      slots: growthRun.slots,
      bathReach: Math.min(...bathRuns.map(r => r.reach)),
      bathGrowth: growthLaw(bathRuns[0]!.slots),
    })
  }

  engines.clear()

  return {
    W,
    width,
    line,
    lone,
    loneGrowth: growthLaw(lone.slots),
    c2: c2Least >= HOLD,
    c2Least,
    ks,
    b1F,
    b1TauRepro,
    normOff,
    endHits,
  }
}

export default experiment({
  id: 'selves/cone-bulk',
  code: 'E-SLF-0184',
  title:
    "the cold bulk on the light cone (B3's engine): B1's bound cluster and bath on an open honeycomb line of at least 256 docks, the sparse light-cone engine storing only reached configurations, its keeping time measured against ten times B1's on the closed ring, and the engine's growth law",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.CONE_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- the level (C1) ----
    const basis = lineBasis({
      flavors: [0, 0, 0],
      statistics: 'fermion',
      D: 3,
      box: setting.box,
      unit: 0,
    })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.max(
      Math.abs(level.unwrapped - RECORDED.energy),
      Math.abs(level.spinHalf - RECORDED.share),
    )
    const gC1 = levelOff <= setting.levelBar

    log('level')

    // ---- E1, E2, E3 on the first case ----
    const c0 = setting.cases[0]!
    const W0 = c0.W
    const read0 = Math.floor((W0 - 1) / 2)
    const fit0 = fitRing(placed, W0).kept
    const width0 = widthOf(W0, fit0)
    const T = Math.floor((setting.Lo - width0) / 2)
    const equalities: Equality[] = []

    for (const n of [3, 6]) {
      const e = lineEngine(setting.Lo, n, false)
      const rd = lineReader(placed, setting.Lo, read0, false)
      const sets: [string, readonly (readonly [number, number])[], boolean][] =
        n === 3
          ? [
              ['lone', [], true],
              ...Array.from(
                { length: c0.starts },
                (_, s) =>
                  [`bath k 3 start ${s}`, bathLoves(W0, read0, 3, s), false] as [
                    string,
                    readonly (readonly [number, number])[],
                    boolean,
                  ],
              ),
            ]
          : [['cluster + bath k 3 start 0', bathLoves(W0, read0, 3, 0), true]]

      for (const [what, bath, withCluster] of sets) {
        for (const split of [true, false]) {
          equalities.push(
            equality({
              what: `E1 n ${n} ${what} ${split ? 'split' : 'coin-before'}`,
              e,
              W: W0,
              fit: fit0,
              bath,
              placed: withCluster,
              offset: T,
              beats: T,
              split,
              rd,
              anchorMax: setting.Lo - 1 - read0,
              cap: setting.cap,
            }),
          )
        }
      }

      log(`E1 n ${n}`)
    }

    // E2: the open line against a closed ring of Lc, the same lifted start at cut trit 0
    type Wrap = { what: string; tw: number; before: number; firstDiffer: number }
    const wraps: Wrap[] = []
    const wrapSets: [number, number, string, readonly (readonly [number, number])[], boolean][] = [
      [3, setting.lc3, 'lone', [], true],
      [3, setting.lc3, 'bath k 3 start 0', bathLoves(W0, read0, 3, 0), false],
      [6, setting.lc6, 'cluster + bath k 3 start 0', bathLoves(W0, read0, 3, 0), true],
    ]

    for (const [n, Lc, what, bath, withCluster] of wrapSets) {
      if (Lc === 0) {
        continue
      }

      const e = lineEngine(Lc, n, true)
      const o = Math.floor((Lc - width0) / 2)
      const tw = Math.min(o + 1, Lc - o - width0 + 1)
      const r = equality({
        what,
        e,
        W: W0,
        fit: fit0,
        bath,
        placed: withCluster,
        offset: o,
        beats: tw + 2,
        split: true,
        rd: undefined,
        anchorMax: Infinity,
        cap: setting.cap,
      })
      const before = Math.max(0, ...r.diffs.slice(0, tw - 1))
      const at = r.diffs.findIndex(d => d > EXACT)

      wraps.push({
        what: `E2 n ${n} ${what} on ring ${Lc}`,
        tw,
        before: Math.max(before, r.start),
        firstDiffer: at < 0 ? Infinity : at + 1,
      })
      log(`E2 ${what}`)
    }

    // E3: forward and back
    const reverse = (
      n: number,
      bath: readonly (readonly [number, number])[],
      withCluster: boolean,
      beats: number,
    ): { off: number; skipped: number } => {
      const line = width0 + 2 * beats + 4
      const first = coneStart({
        n,
        line,
        cap: setting.cap,
        W: W0,
        placed: withCluster ? fit0 : undefined,
        bath,
        offset: beats + 2,
      }).store
      const keep = copyStore(first)

      let a = first
      let b = coneStore(n, line, setting.cap)
      let skipped = 0

      for (let t = 0; t < beats; t++) {
        coneBeat(a, b, true)
        ;[a, b] = [b, a]
      }

      for (let t = 0; t < beats; t++) {
        skipped += coneBeatBack(a, b, true, BACK_FLOOR)
        ;[a, b] = [b, a]
      }

      return { off: storeDifference(a, keep), skipped }
    }
    const back6 = reverse(6, bathLoves(W0, read0, 3, 0), true, setting.reverse6)
    const backLone = reverse(3, [], true, setting.reverseLone)

    log('E3')

    // ---- the cases ----
    const cases = setting.cases.map(c => runCase(c, setting, placed, log))

    // ---- gates ----
    const e1Worst = Math.max(...equalities.flatMap(q => q.diffs))
    const e1Start = Math.max(...equalities.map(q => q.start))
    const e1F = Math.max(...equalities.map(q => q.fRel))
    const gE1 = e1Worst <= EXACT && e1Start <= START && e1F <= EXACT
    const gE2 = wraps.every(w => w.before <= EXACT)
    const gE3 =
      back6.off <= REVERSED &&
      backLone.off <= REVERSED &&
      cases.every(c => c.normOff <= REVERSED && c.endHits === 0)
    const w12 = cases.find(c => c.W === 12)
    const gI4 = setting.name === 'smoke' ? true : w12 ? w12.b1TauRepro === 8 : false
    const gC2 = cases.every(c => c.c2)
    const k3 = cases.flatMap(c => c.ks.filter(k => k.k === 3))
    const measuredShort = k3.length > 0 && k3.every(k => k.measuredShort)
    const passAll = k3.length > 0 && k3.every(k => k.gateBMeasured)
    const instrumentOk = gC1 && gE1 && gE2 && gE3
    const status: 'pass' | 'fail' | 'open' = !instrumentOk
      ? 'fail'
      : setting.name === 'smoke'
        ? 'open'
        : measuredShort
          ? 'fail'
          : passAll && gI4 && gC2
            ? 'pass'
            : 'open'

    const f4 = (x: number): string =>
      Number.isFinite(x) ? x.toFixed(4) : String(x)
    const kRow = (W: number, k: KResult): string =>
      `W ${W} k ${k.k} (${k.starts} start${k.starts > 1 ? 's' : ''}): reach ${k.reach} beats${k.capped ? ' (cap)' : ''}; open g ${k.openG.map(f4).join(' ')} at beats ${k.beats.join(' ')}; closed g to beat 32 ${k.closedG.slice(0, 33).map(f4).join(' ')}; tau_open ${f4(k.tauOpen)} ${k.tauMeasured ? 'MEASURED' : 'predicted'} against 10 B1 tau ${TENFOLD * k.b1Tau} (B1 tau ${k.b1Tau}); tau_closed ${k.tauClosed}; loss rate open ${f4(k.rateOpen)} closed ${f4(k.rateClosed)} a beat; slots ${k.slots.join(' ')}; growth p ${f4(k.growth)}, last ratio ${f4(k.growthRatio)}; bath alone reach ${k.bathReach} (p ${f4(k.bathGrowth)})`
    const caseRow = (c: CaseResult): string =>
      `W ${c.W} (start width ${c.width}, line ${c.line} docks): lone cluster ${c.lone.reach} beats, least F0(t)/F0(0) ${f4(c.c2Least)}, slots at the reach ${c.lone.slots[c.lone.reach]}, growth p ${f4(c.loneGrowth)}; ${c.ks.map(k => kRow(c.W, k)).join('; ')}${c.b1F.length ? `; B1 reading on the closed ring every 8 ${c.b1F.map(f4).join(' ')} (tau ${c.b1TauRepro})` : ''}`

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_E1: gE1 ? 1 : 0,
      gate_E2: gE2 ? 1 : 0,
      gate_E3: gE3 ? 1 : 0,
      gate_I4: gI4 ? 1 : 0,
      gate_C2: gC2 ? 1 : 0,
      levelOff,
      e1Worst,
      e1Start,
      e1F,
      e1Exact: equalities.reduce((s, q) => s + q.exact, 0),
      e1Total: equalities.reduce((s, q) => s + q.total, 0),
      e2Before: Math.max(...wraps.map(w => w.before)),
      back6: back6.off,
      backLone: backLone.off,
      backSkipped: back6.skipped + backLone.skipped,
      seconds: (Date.now() - started) / 1000,
    }

    for (const c of cases) {
      metrics[`W${c.W}_c2Least`] = c.c2Least
      metrics[`W${c.W}_loneGrowth`] = c.loneGrowth
      metrics[`W${c.W}_b1TauRepro`] = Number.isFinite(c.b1TauRepro)
        ? c.b1TauRepro
        : -1

      for (const k of c.ks) {
        const p = `W${c.W}_k${k.k}`

        metrics[`${p}_reach`] = k.reach
        metrics[`${p}_tauOpen`] = Number.isFinite(k.tauOpen) ? k.tauOpen : -1
        metrics[`${p}_tauMeasured`] = k.tauMeasured ? 1 : 0
        metrics[`${p}_tauClosed`] = Number.isFinite(k.tauClosed)
          ? k.tauClosed
          : -1
        metrics[`${p}_gateB`] = k.gateB ? 1 : 0
        metrics[`${p}_growth`] = k.growth
        metrics[`${p}_slotsAtReach`] = k.slots[k.reach]!
      }
    }

    return verdict({
      status,
      claim: `${setting.name} setting: E-SPN-0093's cluster (E ${level.unwrapped.toFixed(5)}, box ${setting.box}) and B1's baths on an open honeycomb line, the sparse light-cone engine (split coin) against B1's closed ring: ${cases.map(caseRow).join(' || ')}`,
      metrics,
      notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. Gates C1 ${gC1} (level off ${levelOff.toExponential(1)}), E1 ${gE1} (cold-line.ts on Lo ${setting.Lo}, ${T} beats: worst ${e1Worst.toExponential(1)}, ${metrics.e1Exact} of ${metrics.e1Total} amplitudes bit for bit, F ${e1F.toExponential(1)}, start ${e1Start.toExponential(1)}; ${equalities.map(q => q.what).join(', ')}), E2 ${gE2} (${wraps.map(w => `${w.what}: before t_w ${w.tw} ${w.before.toExponential(1)}, first differ ${w.firstDiffer}`).join('; ')}), E3 ${gE3} (n 6 ${setting.reverse6} beats back ${back6.off.toExponential(1)}, lone ${setting.reverseLone} beats back ${backLone.off.toExponential(1)}, weight left out below ${BACK_FLOOR} ${(back6.skipped + backLone.skipped).toExponential(1)}; norm ${Math.max(...cases.map(c => c.normOff)).toExponential(1)}; end hits ${cases.reduce((s, c) => s + c.endHits, 0)}), I4 ${gI4}, C2 ${gC2}. The rule is B1's line sector in floats with the split coin; the line law and ODD's silence on a line are E-SLF-0183's exact ball checks. Unscreened 1/r gravity is not measurable on one line.`,
    })
  },
})
