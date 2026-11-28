// THE COLD BULK (research brief B3;
// a recorded decision). Is a self grounded by passing what it cannot keep into the calm bulk around it? B1 (E-SLF-0182) put
// E-SPN-0093's bound cluster among k lone loves on a CLOSED ring: it lost more than half its excess within 8 to 32 beats
// at every density, since whatever left came round again. Here the same cluster and the same bath sit on an OPEN line
// whose ends run into the honeycomb's own vacuum, the empty mesh (E-RLT-0121), so what leaves never returns.
//
// WHY A LINE IS THE HONEYCOMB HERE. The working rule's beat is a product of line maps (note/line-transfer.md Lemma 1):
// a state on one line stays on it, and on the {3,4,3,4} honeycomb a line is an open geodesic, its docks all distinct.
// So B1's cluster and bath on the honeycomb are exactly B1's line engine on an infinite line of empty docks. Gate L1
// checks the line law on the exact ball itself (every branch on the line, exact return, charge and count), and O1 that
// ODD is silent there: a line holds at most 2 vibes a dock, under ODD's k* = 4. The open line runs as a
// ring of Lo docks that no love crosses at its far link (I3: that weight is exactly 0 every beat), which is the infinite
// line exactly for T = floor((Lo - width) / 2) beats, past the ball's 4.
//
// THE RULE (B1's): the working knit's line sector with E-SPN-0103's drift cost and fermion sign, pass contact, flat
// links, in floats, with the split coin D P D (I1 checks it equals the coin-before beat here).
//
// GATES, fixed in the item's what before this file existed (gate 9ca51cc54bf9, 2026-11-15): I1, I2, I3, I4, L1, O1,
// C2; measures (a) the loss rate open against closed, (b) the keeping time against 10 times B1's tau, (c) a periodic
// long run on the (sqrt 2)^6 quotient's line if one fits; gravity not measurable on one line (an open gate). Verdict:
// fail on any instrument gate (I1, I2, I3, L1, O1) or when tau_open is measured below 10 B1 tau at every W; pass when
// (b) holds at every W with I4, C2 and (c) where run; open otherwise. The smoke setting is no evidence (open by rule).
//
// PREDICTION (before the first run): the bath strips the cluster in its first passage, so tau_open <= 8 at W 12.
//
// SETTINGS. Default SMOKE (box-8 level, W 10, k 3, one start, Lo 20, ball R 2 with 3 loves; seconds on a small machine).
// COLD_SWEEP=full for a large machine: box-12 level, W 12 (starts 0 to 2) and W 15 (0 to 1), Lo 32 (75 million configurations
// of 6 loves), the balls R 3 (3 loves) and R 2 (6 loves), and the (sqrt 2)^6 quotient's line period.
//
// Depth L2: B1's rule in floats on one sector, the line law and ODD checked exactly on the ball.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  lineBasis,
  lineLightest,
  wholeBasis,
} from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import type { AxisRing, Placed } from '@/code/measure/held-cluster'
import { pointBeatWith, type CutState } from '@/code/measure/bound-line'
import type { LockedTables } from '@/code/rule/doublet-locked-knit'
import {
  currentCoinPlace,
  setCoinPlace,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import {
  enumerateFrames,
  quotientMesh,
} from '@/code/substrate/coxeter/congruence-3434'
import {
  bathLoves,
  boundCount,
  emptyAmp,
  lineBeat,
  lineBeatBack,
  lineEngine,
  lineReader,
  lineStart,
  lovesOutside,
  maxDifference,
  normOf,
  thermal,
  type Amp,
  type LineEngine,
  type LineReader,
} from '@/code/measure/cold-line'
import {
  ballLineCheck,
  type BallLineCheck,
} from '@/code/measure/cold-line-ball'

const RECORDED = {
  energy: 0.33001851839229945,
  share: 0.9823600683345252,
}

const K = 3
const EXACT = 1e-12
const REVERSED = 1e-10
const HOLD = 0.9
const HALF = 0.5
const TENFOLD = 10
const PERIODIC_MAX = 26
const PERIODIC_BEATS = 256
const PERIODIC_READ = 8
const LN37 = Math.log(37)

type Case = { W: number; starts: number; Lo: number; b1Tau: number }
type Setting = {
  name: 'smoke' | 'full'
  box: number
  cases: readonly Case[]
  balls: readonly {
    radius: number
    loves: readonly (readonly [number, number])[]
  }[]
  quotient: boolean
}

const THREE: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 1],
  [1, 1],
]
const SIX: readonly (readonly [number, number])[] = [
  [-2, 0],
  [-1, 1],
  [0, 0],
  [0, 1],
  [1, 0],
  [2, 1],
]

const SMOKE: Setting = {
  name: 'smoke',
  box: 8,
  // B1's smoke (ring 10, k 3): tau 4
  cases: [{ W: 10, starts: 1, Lo: 24, b1Tau: 4 }],
  balls: [{ radius: 2, loves: THREE }],
  quotient: false,
}
const FULL: Setting = {
  name: 'full',
  box: 12,
  // B1's full sweep: tau 8 at ring 12, 32 at ring 15 (k 3)
  cases: [
    { W: 12, starts: 3, Lo: 32, b1Tau: 8 },
    { W: 15, starts: 2, Lo: 32, b1Tau: 32 },
  ],
  balls: [
    { radius: 3, loves: THREE },
    { radius: 2, loves: SIX },
  ],
  quotient: true,
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((s, x) => s + x, 0) / xs.length

type Series = {
  counts: number[]
  outside: number[]
  crossing: number
  normOff: number
}

function series(
  e: LineEngine,
  start: Amp,
  rd: LineReader,
  beats: number,
  every: number,
  segment?: readonly [number, number],
): Series {
  let a = start
  let b = emptyAmp(a.re.length)
  let crossing = 0
  let normOff = Math.abs(normOf(a) - 1)

  const counts = [boundCount(e, rd, a)]
  const outside = segment ? [lovesOutside(e, a, segment[0], segment[1])] : []

  for (let t = 1; t <= beats; t++) {
    crossing = Math.max(crossing, lineBeat(e, a, b, true))
    ;[a, b] = [b, a]
    normOff = Math.max(normOff, Math.abs(normOf(a) - 1))

    if (t % every === 0) {
      counts.push(boundCount(e, rd, a))

      if (segment) {
        outside.push(lovesOutside(e, a, segment[0], segment[1]))
      }
    }
  }

  return { counts, outside, crossing, normOff }
}

// ---- I1, I2 ----
function instrument(placed: readonly Placed[]): {
  worst: number
  split: number
  reversed: number
  normOff: number
} {
  const L = 8
  const read = Math.floor((L - 1) / 2)
  const e = lineEngine(L, 3 + K, true)
  const fit = fitRing(placed, L).kept
  const bath = bathLoves(L, read, K, 0)
  const fresh = (): Amp =>
    lineStart({ e, W: L, placed: fit, bath, lift: false, offset: 0 }).amp
  const ring: AxisRing = {
    docks: Array.from({ length: L }, () => 0),
    first: 0,
    second: 1,
    position: new Map(),
  }
  const tables = {} as LockedTables
  const st = fresh()

  let cut: CutState = new Map()

  for (let u = 0; u < st.re.length; u++) {
    const re = st.re[u]!
    const im = st.im[u]!

    if (re === 0 && im === 0) {
      continue
    }

    const r = Math.floor(u / 3)
    const ts: { x: number; j: number; p: number }[] = []

    for (let bit = 0; bit < 2 * L; bit++) {
      if ((e.sp.lo[r]! >>> bit) & 1) {
        ts.push({ x: bit >>> 1, j: bit & 1 ? 0 : 1, p: 0 })
      }
    }

    cut.set(`${u}`, { ts, c: u % 3, amp: [re, im] })
  }

  let a = st
  let b = emptyAmp(a.re.length)
  let s = fresh()
  let sb = emptyAmp(a.re.length)
  let worst = 0
  let split = 0

  for (let t = 0; t < 6; t++) {
    cut = pointBeatWith(
      { cost: true, sign: true, unit: 0, flat: true },
      tables,
      ring,
      cut,
    )
    lineBeat(e, a, b, false)
    ;[a, b] = [b, a]
    lineBeat(e, s, sb, true)
    ;[s, sb] = [sb, s]
    split = Math.max(split, maxDifference(a, s))

    const seen = new Set<number>()

    for (const v of cut.values()) {
      let m = 0

      for (const tk of v.ts) {
        m |= 1 << (tk.j === 0 ? 2 * tk.x + 1 : 2 * tk.x)
      }

      const r = e.sp.lo.indexOf(m)
      const u = r * 3 + v.c

      seen.add(u)
      worst = Math.max(
        worst,
        Math.abs(a.re[u]! - v.amp[0]),
        Math.abs(a.im[u]! - v.amp[1]),
      )
    }

    for (let u = 0; u < a.re.length; u++) {
      if (!seen.has(u)) {
        worst = Math.max(worst, Math.abs(a.re[u]!), Math.abs(a.im[u]!))
      }
    }
  }

  // I2: the split beat 12 forward and 12 back
  const start = fresh()

  let normOff = 0

  a = fresh()
  b = emptyAmp(a.re.length)

  for (let t = 0; t < 12; t++) {
    lineBeat(e, a, b, true)
    ;[a, b] = [b, a]
    normOff = Math.max(normOff, Math.abs(normOf(a) - 1))
  }

  for (let t = 0; t < 12; t++) {
    lineBeatBack(e, a, b, true)
    ;[a, b] = [b, a]
  }

  return { worst, split, reversed: maxDifference(a, start), normOff }
}

// the docks B1's start spans once lifted: anchors 0..W - 1 and the level's furthest kept position (every placement of
// the level that fits the ring of W, not only the read ones)
const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

type CaseResult = {
  W: number
  T: number
  width: number
  b1Tau: number
  closedG: number[]
  openG: number[]
  openLone: number[]
  closedB1F: number[]
  b1TauRepro: number
  outside: number[]
  rateOpen: number
  rateClosed: number
  tauOpen: number
  tauMeasured: boolean
  gateB: boolean
  c2: boolean
  crossing: number
  normOff: number
  dropped: number
  readWeight: number
  etaStar: number
}

function runCase(
  c: Case,
  placed: readonly Placed[],
  engines: Map<string, LineEngine>,
  log: (what: string) => void,
): CaseResult {
  const { W, Lo } = c
  const read = Math.floor((W - 1) / 2)
  const fit = fitRing(placed, W).kept
  const width = widthOf(W, fit)
  const T = Math.floor((Lo - width) / 2)
  const offset = T

  if (T < 2) {
    throw new Error(`cold-bulk: W ${W} spans ${width} docks, no horizon on ${Lo}`)
  }
  const engineOf = (L: number, n: number, closed: boolean): LineEngine => {
    const key = `${L},${n},${closed}`
    const found = engines.get(key)

    if (found) {
      return found
    }

    const made = lineEngine(L, n, closed)

    engines.set(key, made)
    log(`engine ${key}: ${made.sp.count} configurations`)

    return made
  }

  // closed: B1's ring of W, for max(T, 8) beats (B1's tau is read at beat 8)
  const closedBeats = Math.max(T, 8)
  const c3 = engineOf(W, 3, true)
  const c6 = engineOf(W, 3 + K, true)
  const rdC = lineReader(placed, W, read, true)
  const loneC = series(
    c3,
    lineStart({ e: c3, W, placed: fit, bath: [], lift: false, offset: 0 }).amp,
    rdC,
    closedBeats,
    1,
  )
  const kC: Series[] = []
  const bathC: Series[] = []

  let dropped = 0

  for (let s = 0; s < c.starts; s++) {
    const bath = bathLoves(W, read, K, s)
    const st = lineStart({ e: c6, W, placed: fit, bath, lift: false, offset: 0 })

    dropped = Math.max(dropped, st.dropped)
    kC.push(series(c6, st.amp, rdC, closedBeats, 1))
    bathC.push(
      series(
        c3,
        lineStart({ e: c3, W, placed: undefined, bath, lift: false, offset: 0 })
          .amp,
        rdC,
        closedBeats,
        1,
      ),
    )
  }

  log(`W ${W} closed`)

  // open: the lift on a line of Lo
  const o3 = engineOf(Lo, 3, false)
  const o6 = engineOf(Lo, 3 + K, false)
  const rdO = lineReader(placed, Lo, read, false)
  const segment = [offset, offset + width - 1] as const
  const loneO = series(
    o3,
    lineStart({ e: o3, W, placed: fit, bath: [], lift: true, offset }).amp,
    rdO,
    T,
    1,
  )
  const kO: Series[] = []
  const bathO: Series[] = []

  for (let s = 0; s < c.starts; s++) {
    const bath = bathLoves(W, read, K, s)

    kO.push(
      series(
        o6,
        lineStart({ e: o6, W, placed: fit, bath, lift: true, offset }).amp,
        rdO,
        T,
        1,
        segment,
      ),
    )
    bathO.push(
      series(
        o3,
        lineStart({ e: o3, W, placed: undefined, bath, lift: true, offset })
          .amp,
        rdO,
        T,
        1,
      ),
    )
    log(`W ${W} open start ${s}`)
  }

  const excess = (k: Series[], bath: Series[], lone: Series, t: number) =>
    (mean(k.map(r => r.counts[t]!)) - mean(bath.map(r => r.counts[t]!))) /
    lone.counts[t]!
  const closedG = Array.from({ length: closedBeats + 1 }, (_, t) =>
    excess(kC, bathC, loneC, t),
  )
  const openG = Array.from({ length: T + 1 }, (_, t) =>
    excess(kO, bathO, loneO, t),
  )
  const closedB1F = Array.from(
    { length: closedBeats + 1 },
    (_, t) =>
      (mean(kC.map(r => r.counts[t]!)) - thermal(W, 3 + K)) /
      (loneC.counts[t]! - thermal(W, 3)),
  )
  const b1TauRepro =
    closedB1F[0]! < HALF ? 0 : closedB1F[8]! < HALF ? 8 : Infinity
  const outside = Array.from({ length: T + 1 }, (_, t) =>
    mean(kO.map(r => r.outside[t]!)),
  )
  const rateOpen = (openG[0]! - openG[T]!) / T
  const rateClosed = (closedG[0]! - closedG[T]!) / T
  const below = openG.findIndex(g => g < HALF)
  const half = Math.floor(T / 2)
  const late = (openG[half]! - openG[T]!) / (T - half)
  const tauOpen =
    below >= 0
      ? below
      : late > 0
        ? T + (openG[T]! - HALF) / late
        : Infinity

  return {
    W,
    T,
    width,
    b1Tau: c.b1Tau,
    closedG,
    openG,
    openLone: loneO.counts.map(F => F / loneO.counts[0]!),
    closedB1F,
    b1TauRepro,
    outside,
    rateOpen,
    rateClosed,
    tauOpen,
    tauMeasured: below >= 0,
    gateB: tauOpen >= TENFOLD * c.b1Tau,
    c2: loneO.counts.every(F => F / loneO.counts[0]! >= HOLD),
    crossing: Math.max(...kO.map(r => r.crossing), loneO.crossing, ...bathO.map(r => r.crossing)),
    normOff: Math.max(
      loneC.normOff,
      loneO.normOff,
      ...kC.map(r => r.normOff),
      ...kO.map(r => r.normOff),
      ...bathC.map(r => r.normOff),
      ...bathO.map(r => r.normOff),
    ),
    dropped,
    readWeight: rdO.weight,
    etaStar: (2 * LN37) / (read + 1),
  }
}

// ---- (c) the quotient's line ----
type Periodic = {
  period: number
  fits: boolean
  W: number
  tau: number
  gate: boolean
  g: number[]
  beats: number[]
}

function quotientLinePeriod(): number {
  const e = enumerateFrames({
    level: { twoPower: 6, odd: 1 },
    maxDocks: 1_100_000,
  })

  if (!e.fits) {
    throw new Error('cold-bulk: the (sqrt 2)^6 quotient does not fit')
  }

  const q = quotientMesh(e.table, e.order, 'congruence-3434 (sqrt 2)^6')
  const slot = LINE_FIRSTS[0]!

  let x = q.mesh.neighbour(0, slot)
  let period = 1

  while (x !== 0) {
    if (x < 0 || period > q.mesh.cellCount) {
      throw new Error('cold-bulk: the quotient line does not close')
    }

    x = q.mesh.neighbour(x, slot)
    period++
  }

  return period
}

function periodicRun(
  period: number,
  c: Case,
  placed: readonly Placed[],
  log: (what: string) => void,
): Periodic {
  const { W } = c
  const read = Math.floor((W - 1) / 2)
  const fit = fitRing(placed, W).kept
  const width = widthOf(W, fit)
  const lift = width <= period
  const offset = lift ? Math.floor((period - width) / 2) : 0
  const e3 = lineEngine(period, 3, true)
  const e6 = lineEngine(period, 3 + K, true)
  const rd = lineReader(placed, period, read, true)
  const lone = series(
    e3,
    lineStart({ e: e3, W, placed: fit, bath: [], lift, offset }).amp,
    rd,
    PERIODIC_BEATS,
    PERIODIC_READ,
  )
  const ks: Series[] = []
  const baths: Series[] = []

  for (let s = 0; s < c.starts; s++) {
    const bath = bathLoves(W, read, K, s)

    ks.push(
      series(
        e6,
        lineStart({ e: e6, W, placed: fit, bath, lift, offset }).amp,
        rd,
        PERIODIC_BEATS,
        PERIODIC_READ,
      ),
    )
    baths.push(
      series(
        e3,
        lineStart({ e: e3, W, placed: undefined, bath, lift, offset }).amp,
        rd,
        PERIODIC_BEATS,
        PERIODIC_READ,
      ),
    )
    log(`periodic ring ${period} start ${s}`)
  }

  const g = lone.counts.map(
    (F0, i) =>
      (mean(ks.map(r => r.counts[i]!)) - mean(baths.map(r => r.counts[i]!))) /
      F0,
  )
  const beats = g.map((_, i) => i * PERIODIC_READ)
  const at = g.findIndex(v => v < HALF)
  const tau = at < 0 ? Infinity : beats[at]!

  return {
    period,
    fits: true,
    W,
    tau,
    gate: tau >= TENFOLD * c.b1Tau,
    g,
    beats,
  }
}

export default experiment({
  id: 'selves/cold-bulk',
  code: 'E-SLF-0183',
  title:
    "the cold bulk (research brief B3): B1's bound cluster and bath on an open honeycomb line running into the empty-mesh vacuum, against B1's closed ring: the loss rate, the keeping time against ten times B1's, the line law and ODD on the exact ball, and a periodic run on the (sqrt 2)^6 quotient's line where one fits",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.COLD_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- the level ----
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

    log('level')

    // ---- I1, I2 ----
    const inst = instrument(placed)

    log('instrument')

    // ---- L1, O1 on the ball (split coin) ----
    const before = currentCoinPlace()

    setCoinPlace('split')

    let balls: BallLineCheck[]

    try {
      balls = setting.balls.map(spec => {
        const r = ballLineCheck({ ...spec, beats: 4 })

        log(`ball R ${spec.radius}, ${spec.loves.length} loves`)

        return r
      })
    } finally {
      setCoinPlace(before)
    }

    // ---- the cases ----
    const engines = new Map<string, LineEngine>()
    const cases = setting.cases.map(c => runCase(c, placed, engines, log))

    engines.clear()

    // ---- (c) ----
    let period = 0
    let periodic: Periodic | undefined

    if (setting.quotient) {
      period = quotientLinePeriod()
      log(`quotient line period ${period}`)

      const c = setting.cases.find(
        x => x.W + 4 <= period && period <= PERIODIC_MAX,
      )

      if (c) {
        periodic = periodicRun(period, c, placed, log)
      }
    }

    // ---- gates ----
    const gI1 = inst.worst <= EXACT && inst.split <= EXACT
    const gI2 =
      inst.reversed <= REVERSED &&
      inst.normOff <= REVERSED &&
      cases.every(c => c.normOff <= REVERSED)
    const gI3 = cases.every(c => c.crossing === 0)
    const w12 = cases.find(c => c.W === 12)
    const gI4 = w12 ? w12.b1TauRepro === 8 : false
    const gL1 = balls.every(
      b =>
        b.lineSimple &&
        b.lineStream &&
        b.offLine === 0 &&
        b.lawBreaks === 0 &&
        b.normExact &&
        b.returned,
    )
    const gO1 = balls.every(
      b =>
        b.oddEqualsOff &&
        b.oddFired === 0 &&
        b.controlExponent !== 0 &&
        b.orientationConflicts === 0,
    )
    const gC2 = cases.every(c => c.c2)
    const gB = cases.every(c => c.gateB)
    const measuredShort = cases.every(c => c.tauMeasured && !c.gateB)
    const gC = periodic ? periodic.gate : true
    const instrumentOk = gI1 && gI2 && gI3 && gL1 && gO1
    const status: 'pass' | 'fail' | 'open' = !instrumentOk
      ? 'fail'
      : setting.name === 'smoke'
        ? 'open'
        : measuredShort
          ? 'fail'
          : gB && gI4 && gC2 && gC
            ? 'pass'
            : 'open'

    const f4 = (x: number): string =>
      Number.isFinite(x) ? x.toFixed(4) : String(x)
    const caseRow = (c: CaseResult): string =>
      `W ${c.W} (start width ${c.width} docks, horizon T ${c.T}): open excess g ${c.openG.map(f4).join(' ')}; closed g ${c.closedG.map(f4).join(' ')}; B1 reading on the closed ring ${c.closedB1F.map(f4).join(' ')} (tau ${c.b1TauRepro}); loss rate open ${f4(c.rateOpen)} closed ${f4(c.rateClosed)} a beat (ratio ${f4(c.rateOpen / c.rateClosed)}); tau_open ${f4(c.tauOpen)} ${c.tauMeasured ? 'measured' : 'predicted'} against 10 B1 tau ${TENFOLD * c.b1Tau}; loves outside the start segment ${c.outside.map(f4).join(' ')}; open lone cluster ${c.openLone.map(f4).join(' ')}; far-link weight ${c.crossing}; eta* ${f4(c.etaStar)} nats a dock a beat`
    const ballRow = (b: BallLineCheck): string =>
      `ball R ${b.radius} (${b.docks} docks, line ${b.lineDocks} docks, simple ${b.lineSimple}, stream ${b.lineStream}), ${b.loves} loves ${b.beats} beats: most branches ${b.mostBranches}, off the line ${b.offLine}, law breaks ${b.lawBreaks}, norm exact ${b.normExact}, back exactly ${b.returned}, ODD = off ${b.oddEqualsOff} (fired ${b.oddFired}), control exponent ${b.controlExponent}`

    const metrics: Record<string, number> = {
      gate_I1: gI1 ? 1 : 0,
      gate_I2: gI2 ? 1 : 0,
      gate_I3: gI3 ? 1 : 0,
      gate_I4: gI4 ? 1 : 0,
      gate_L1: gL1 ? 1 : 0,
      gate_O1: gO1 ? 1 : 0,
      gate_C2: gC2 ? 1 : 0,
      gate_b: gB ? 1 : 0,
      gate_c: gC ? 1 : 0,
      periodic_run: periodic ? 1 : 0,
      quotient_line_period: period,
      levelOff,
      instrumentWorst: inst.worst,
      splitOff: inst.split,
      reversed: inst.reversed,
      seconds: (Date.now() - started) / 1000,
    }

    for (const c of cases) {
      metrics[`W${c.W}_tauOpen`] = Number.isFinite(c.tauOpen) ? c.tauOpen : -1
      metrics[`W${c.W}_tauMeasured`] = c.tauMeasured ? 1 : 0
      metrics[`W${c.W}_rateOpen`] = c.rateOpen
      metrics[`W${c.W}_rateClosed`] = c.rateClosed
      metrics[`W${c.W}_openG_T`] = c.openG[c.T]!
      metrics[`W${c.W}_closedG_T`] = c.closedG[c.T]!
      metrics[`W${c.W}_outside_T`] = c.outside[c.T]!
      metrics[`W${c.W}_b1TauRepro`] = Number.isFinite(c.b1TauRepro)
        ? c.b1TauRepro
        : -1
    }

    if (periodic) {
      metrics.periodic_tau = Number.isFinite(periodic.tau) ? periodic.tau : -1
    }

    return verdict({
      status,
      claim: `${setting.name} setting: E-SPN-0093's cluster (E ${level.unwrapped.toFixed(5)}, box ${setting.box}) with k ${K} bath loves on an open honeycomb line into the empty mesh, against B1's closed ring, split coin: ${cases.map(caseRow).join(' || ')}; ${balls.map(ballRow).join('; ')}; quotient line period ${period || 'not computed'}${periodic ? `, periodic run (W ${periodic.W}) g ${periodic.g.map(f4).join(' ')} at beats ${periodic.beats.join(' ')}, tau ${periodic.tau}` : setting.quotient ? ', no periodic arrangement fits (not gated)' : ''}; gravity not measurable on one line (open gate)`,
      metrics,
      notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. Gates I1 ${gI1} (pointBeatWith ${inst.worst.toExponential(1)}, split against coin-before ${inst.split.toExponential(1)}), I2 ${gI2} (back ${inst.reversed.toExponential(1)}), I3 ${gI3}, I4 ${gI4}, L1 ${gL1}, O1 ${gO1}, C2 ${gC2}, (b) ${gB}, (c) ${periodic ? gC : 'not run'}. Level off the record ${levelOff.toExponential(1)}. Rule: B1's line sector (E-SPN-0103 cost and sign, pass contact, flat links) in floats with the split coin; the line law and ODD are checked exactly on the ball. The export bound caps export only and cannot show keeping. Unscreened 1/r gravity is not measurable on one line and stays an open gate.`,
    })
  },
})
