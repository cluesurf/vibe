// A BOUNDARY THAT HANDS ONLY ERRORS OUTWARD (item vibe-roadmap-grounding-0024; self-structures-and-experience.md,
// structure 7, then structure 6's copy-out). Opt-in only: adopting any piece here is the author's base change.
//
// THE QUESTION. E-SLF-0188 found B1's lone 3-love cluster an exact bound level of B1's rule, kept for ever, so the
// losses B1 and B3 saw come from the bath. Can an exactly reversible piece around the self hand the bath's arrivals to
// a passing vacuum and keep the self, where a plain swap washes it out and no boundary lets the bath pile up?
//
// THE SETUP (gate in the item's what, fixed before any probe). The ring of 32 docks (the line of the (sqrt 2)^10
// congruence quotient, so the run is periodic-grade exact for every beat), B1's rule with E-SPN-0103's pieces (the
// cut trit carried, coin before), the self = B1's level at total momentum 0 (B1's start). Arrivals: at beats 20 + 40 k, k = 0 .. 23,
// a love enters line mode (dock (16 + 7 k) mod 32, label k mod 2) from an incoming cell when that mode is empty. Every
// dock meets a fresh empty passing cell each beat. Beat order: the arrival, the piece, B1's beat.
//
// THE ARMS (code/measure/error-boundary): B the boundary (a love alone on its dock with no other love within 8 docks
// goes into its dock's cell), S plain swap (every love alone on its dock goes), N no piece, C copy-out (where B's
// syndrome holds, the cell's trit gains the dock's tone, a controlled shift mod 3; no love moves), A0 B with no
// arrivals, A1 no piece and no arrivals.
//
// THE READINGS. R(t) = F(t) / F(0), F B1's bound-trio count (cold-line boundCount, read 7); A(t) the entered
// arrivals, E(t) the loves handed out; I(t) the mean over beats t - 9 .. t of the total-variation distance between
// consecutive beats' 3-love configuration distributions. The line's reduced state is a mixture (records leave and never
// return), held as merged columns for 2 to 5 loves; the weight merges drop (trunc), the weight past 5 loves (cap) and
// the branches left with fewer than 2 loves or dropped from the 2-love merge (broken: the self already lost) are
// ledgered, and R is read as a lower bound and an upper bound R + (10 (trunc + cap) + broken) / F(0).
//
// SETTINGS. Default SMOKE (30 beats, nMax 4; proves the file runs, open by rule). BOUNDARY_SWEEP=full for the M3.
//
// Depth L2: B1's rule in floats on one quotient line; the pieces exact signed permutations (checked).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { lineBasis, lineLightest, wholeBasis } from '@/code/measure/coined-line-bloch'
import { fitRing, levelPlacement } from '@/code/measure/held-cluster'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { levelRing, reduceToLevel } from '@/code/substrate/coxeter/congruence-3434'
import { exactCell } from '@/code/substrate/coxeter/exact-3434'
import { boundCount, emptyAmp, lineBeat, lineEngine, lineReader, lineStart, type Amp } from '@/code/measure/cold-line'
import {
  checkPiece,
  mergeColumns,
  runBoundary,
  type Arm,
  type Arrival,
  type RunResult,
} from '@/code/measure/error-boundary'

const RECORDED = { energy: 0.33001851839229945 }
const L = 32
const D = 8
const READ = 7
const FMAX = 10
const TRACE = 1e-9
const MERGE = 1e-9
const DROP = 1e-3
const HOLD = 0.5
const LEVEL = 0.05
const OUTFLOW = 0.5
const CHANGE = 1e-3
const GATE_BEATS = [80, 200, 1000] as const

// budget: the copy-out control's dephasing makes one dense column per syndrome pattern of every column; past 4 GB of
// new columns in one beat it ends and reports its reach (a control, not gated; logged as a deviation)
type ArmRun = { name: string; arm: Arm; beats: number; arrivals: boolean; nMax: number; budget?: number }

type Setting = {
  name: 'smoke' | 'full'
  runs: readonly ArmRun[]
  readAt: (beats: number) => number[]
  tvAt: (beats: number) => number[]
}

const SMOKE: Setting = {
  name: 'smoke',
  runs: [
    { name: 'B', arm: 'boundary', beats: 30, arrivals: true, nMax: 4 },
    { name: 'A1', arm: 'none', beats: 30, arrivals: false, nMax: 3 },
    { name: 'S', arm: 'swap', beats: 4, arrivals: true, nMax: 3 },
    { name: 'N', arm: 'none', beats: 25, arrivals: true, nMax: 4 },
    { name: 'C', arm: 'copy', beats: 25, arrivals: true, nMax: 4, budget: 4e9 },
  ],
  readAt: beats => [0, 1, 2, 4, 10, 20, 25, 30].filter(t => t <= beats),
  tvAt: beats => [20, 30].filter(t => t <= beats),
}
const FULL: Setting = {
  name: 'full',
  runs: [
    // the controls first, so a failing control shows within the first hour; B last
    { name: 'S', arm: 'swap', beats: 80, arrivals: true, nMax: 3 },
    { name: 'A1', arm: 'none', beats: 1000, arrivals: false, nMax: 3 },
    { name: 'A0', arm: 'boundary', beats: 1000, arrivals: false, nMax: 3 },
    { name: 'N', arm: 'none', beats: 99, arrivals: true, nMax: 5 },
    { name: 'C', arm: 'copy', beats: 99, arrivals: true, nMax: 5, budget: 4e9 },
    { name: 'B', arm: 'boundary', beats: 1000, arrivals: true, nMax: 5 },
  ],
  readAt: beats =>
    [0, 1, 2, 4, 10, 20, 40, 60, 80, 99, 100, 120, 160, 200, 300, 400, 500, 600, 700, 800, 900, 1000].filter(
      t => t <= beats,
    ),
  tvAt: beats => [...GATE_BEATS, 99].filter(t => t <= beats),
}

const ARRIVALS: Arrival[] = Array.from({ length: 24 }, (_, k) => ({ beat: 20 + 40 * k, dock: (16 + 7 * k) % L, label: k % 2 }))

// columns per sector: merge past cap, keep keep (n = 0 .. 5; 0 and 1 are never followed)
const CAP = [0, 0, 128, 128, 24, 8]
const KEEP = [0, 0, 64, 64, 12, 4]
const FLOOR = 1e-12
// the most F a unit of broken weight (at most 2 loves, then at most one arrival before its loves leave) can carry
const FBROKEN = 1

// the ring is the quotient's line: every line slot's transport k_a has order 32 in K mod (sqrt 2)^10 (as E-SLF-0188
// Q1), read and reported (not a gate)
function lineOrders(): number[] {
  const ring = levelRing({ twoPower: 10, odd: 1 })
  const product = (g: Int32Array, t: Int32Array): Int32Array => {
    const out = new Int32Array(50)

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let sa = 0
        let sb = 0

        for (let l = 0; l < 5; l++) {
          sa += g[i * 5 + l]! * t[l * 5 + j]! + 2 * g[25 + i * 5 + l]! * t[25 + l * 5 + j]!
          sb += g[i * 5 + l]! * t[25 + l * 5 + j]! + g[25 + i * 5 + l]! * t[l * 5 + j]!
        }

        out[i * 5 + j] = sa % ring.modA
        out[25 + i * 5 + j] = sb % ring.modB
      }
    }

    return out
  }

  return LINE_FIRSTS.map(slot => {
    const k = reduceToLevel(exactCell().transports[slot]!, ring)
    const one = new Int32Array(50)

    for (let i = 0; i < 5; i++) {
      one[i * 5 + i] = 1 % ring.modA
    }

    let g = k
    let p = 1

    while (g.some((v, i) => v !== one[i]) && p < 1 << 12) {
      g = product(g, k)
      p++
    }

    return p
  })
}

const f4 = (x: number): string => (Number.isFinite(x) ? x.toFixed(4) : String(x))
const e2 = (x: number): string => (Number.isFinite(x) ? x.toExponential(2) : String(x))

// X3: a merge at full rank leaves F and the configuration distribution unchanged
function mergeCheck(start: Amp, reader: ReturnType<typeof lineReader>): { F: number; dist: number } {
  const e = lineEngine(L, 3, true)
  // lineBeat passes the phase and the coin over its input in place, so every beat runs on a copy
  const copy = (v: Amp): Amp => ({ re: Float64Array.from(v.re), im: Float64Array.from(v.im) })
  const cols: Amp[] = [copy(start)]

  for (let i = 1; i < 6; i++) {
    const out = emptyAmp(start.re.length)

    lineBeat(e, copy(cols[i - 1]!), out, false)
    cols.push(out)
  }

  const scaled = cols.map((v, i) => {
    const s = Math.sqrt((i + 1) / 21)

    return { re: v.re.map(x => x * s), im: v.im.map(x => x * s) }
  })
  const F = (cs: Amp[]): number => cs.reduce((s, v) => s + boundCount(e, reader, v), 0)
  const diag = (cs: Amp[]): Float64Array => {
    const p = new Float64Array(start.re.length)

    for (const v of cs) {
      for (let u = 0; u < p.length; u++) {
        p[u]! += v.re[u]! ** 2 + v.im[u]! ** 2
      }
    }

    return p
  }
  const before = { F: F(scaled), p: diag(scaled) }
  const c = { cols: scaled, orth: 0 }

  mergeColumns(c, 6)

  const after = { F: F(c.cols), p: diag(c.cols) }
  let dist = 0

  for (let u = 0; u < before.p.length; u++) {
    dist = Math.max(dist, Math.abs(before.p[u]! - after.p[u]!))
  }

  return { F: Math.abs(before.F - after.F), dist }
}

type Read = {
  name: string
  run: RunResult
  F0: number
  R: (t: number) => number
  Rup: (t: number) => number
  at: (t: number) => RunResult['readings'][number] | undefined
  I: (t: number) => number
}

function readRun(name: string, run: RunResult): Read {
  const F0 = run.readings.find(r => r.beat === 0)!.F
  const at = (t: number) => run.readings.find(r => r.beat === t)

  return {
    name,
    run,
    F0,
    at,
    R: t => (at(t)?.F ?? NaN) / F0,
    Rup: t => {
      const r = at(t)

      return r ? (r.F + FMAX * (r.trunc + r.cap) + FBROKEN * r.broken) / F0 : NaN
    },
    I: t => run.tv.find(x => x.beat === t)?.mean ?? NaN,
  }
}

export default experiment({
  id: 'selves/error-boundary',
  // the gate names E-SLF-0195, which store-parity took the same hour; the code is E-SLF-0196 (logged as a deviation)
  code: 'E-SLF-0196',
  title:
    "a boundary that hands only errors outward: an opt-in exactly reversible piece that hands a love with no other love within 8 docks to the passing vacuum, around B1's self on the 32-dock quotient line under bath arrivals, against a plain swap, no boundary and a copy-out (controlled shift mod 3) variant, read for retention at 80, 200 and 1000 beats, outflow against arrivals and interior change",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.BOUNDARY_SWEEP === 'full' ? FULL : SMOKE
    const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

    // ---- C1, the level ----
    const basis = lineBasis({ flavors: [0, 0, 0], statistics: 'fermion', D: 3, box: 12, unit: 0 })
    const level = lineLightest(basis, wholeBasis(basis)).lightest
    const placed = levelPlacement(basis, level.cre, level.cim)
    const levelOff = Math.abs(level.unwrapped - RECORDED.energy)
    const gC1 = levelOff <= 1e-9
    const fit = fitRing(placed, L).kept
    // B1's start: the level at total momentum 0 over every anchor (0023: retention_inf 1.0000 on this ring)
    const start = lineStart({ e: lineEngine(L, 3, true), W: L, placed: fit, bath: [], lift: false, offset: 0 }).amp
    const reader = lineReader(placed, L, READ, true)

    const orders = lineOrders()

    log(`C1; quotient line orders ${orders.join(',')}`)

    // ---- X1: the pieces are signed permutations, order free ----
    const checks = [
      { what: 'boundary L 32 n 2', ...checkPiece(L, 2, D, true) },
      { what: 'boundary L 32 n 3', ...checkPiece(L, 3, D, true) },
      { what: 'boundary L 16 n 4 d 3', ...checkPiece(16, 4, 3, true) },
      { what: 'swap L 32 n 3', ...checkPiece(L, 3, D, false) },
    ]
    const gX1 = checks.every(c => c.orderFree && c.injective && c.signs)

    log('X1')

    // ---- X3: merge exact at full rank ----
    const m = mergeCheck(start, reader)
    const gX3 = m.F <= 1e-12 && m.dist <= 1e-12

    log('X3')

    // ---- the arms ----
    const reads = new Map<string, Read>()

    for (const spec of setting.runs) {
      const run = runBoundary(
        {
          L,
          d: D,
          nMax: spec.nMax,
          arm: spec.arm,
          arrivals: spec.arrivals ? ARRIVALS : [],
          beats: spec.beats,
          cap: CAP,
          keep: KEEP,
          floor: FLOOR,
          readAt: setting.readAt(spec.beats),
          tvAt: setting.tvAt(spec.beats),
          tvWindow: 10,
          every: 50,
          byteBudget: spec.budget,
        },
        start,
        reader,
        log,
      )

      reads.set(spec.name, readRun(spec.name, run))
      log(`arm ${spec.name} done, ${run.seconds.toFixed(0)} s`)
    }

    // ---- X2, X4 ----
    const all = [...reads.values()]
    const gX2 = all.every(r => r.run.traceOff <= TRACE && r.run.mergeOff <= MERGE)
    const B = reads.get('B')!
    const last = (r: Read) => r.run.readings[r.run.readings.length - 1]!
    const bDrop = last(B).trunc + last(B).cap
    const gX4 = bDrop <= DROP

    // ---- the gates on B ----
    const Tend = setting.name === 'full' ? 1000 : 30
    const g1Beats = setting.name === 'full' ? [80, 200, 1000] : [10, 20, 30]
    const [t1, t2, t3] = g1Beats as [number, number, number]
    // decided pass on the pessimistic reading (R low where it must be high, R_up where it is subtracted); decided fail
    // when even the optimistic reading fails; otherwise undecided (the verdict is open)
    const g1Pass =
      B.R(t1) >= HOLD && B.R(t2) >= B.Rup(t1) - LEVEL && B.R(t3) >= B.Rup(t2) - LEVEL && B.R(t3) >= HOLD
    const g1Fail =
      B.Rup(t1) < HOLD || B.Rup(t2) < B.R(t1) - LEVEL || B.Rup(t3) < B.R(t2) - LEVEL || B.Rup(t3) < HOLD
    const gG1 = g1Pass
    const g1Decided = g1Pass || g1Fail
    const outflow = (t: number): number => {
      const r = B.at(t)

      return r ? r.exported - r.entered : NaN
    }
    const g2Beats = setting.name === 'full' ? [200, 1000] : [30]
    const gG2 = g2Beats.every(t => Math.abs(outflow(t)) <= OUTFLOW)
    const tvBeats = setting.name === 'full' ? [80, 200, 1000] : [20, 30]
    const gG3 = tvBeats.every(t => B.I(t) >= CHANGE)

    const instrument = gC1 && gX1 && gX2 && gX3
    const status: 'pass' | 'fail' | 'open' = !instrument
      ? 'fail'
      : setting.name === 'smoke' || !gX4 || !g1Decided
        ? 'open'
        : gG1 && gG2 && gG3
          ? 'pass'
          : 'fail'

    const row = (r: Read): string => {
      const pts = r.run.readings.map(x => `${x.beat}:${f4(x.F / r.F0)}`).join(' ')
      const end = last(r)

      return `${r.name}: R ${pts}; R_up at ${end.beat} ${f4(r.Rup(end.beat))}; at ${end.beat} loves ${f4(end.loves)} entered ${f4(end.entered)} exported ${f4(end.exported)} copies ${f4(end.copies)} broken ${e2(end.broken)} (holding ${f4(end.brokenLoves)} loves) trunc ${e2(end.trunc)} (by n ${end.truncBy.map(e2).join(',')}) cap ${e2(end.cap)}; I ${r.run.tv.map(x => `${x.beat}:${e2(x.mean)}`).join(' ')}; reach ${r.run.reach}, max columns ${r.run.maxColumns}, ${r.run.seconds.toFixed(0)} s`
    }

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_X1: gX1 ? 1 : 0,
      gate_X2: gX2 ? 1 : 0,
      gate_X3: gX3 ? 1 : 0,
      gate_X4: gX4 ? 1 : 0,
      gate_G1: gG1 ? 1 : 0,
      g1_decided: g1Decided ? 1 : 0,
      gate_G2: gG2 ? 1 : 0,
      gate_G3: gG3 ? 1 : 0,
      levelOff,
      quotientLineOrdersAll32: orders.every(p => p === L) ? 1 : 0,
      F0: B.F0,
      mergeF: m.F,
      mergeDist: m.dist,
      traceOff: Math.max(...all.map(r => r.run.traceOff)),
      mergeOff: Math.max(...all.map(r => r.run.mergeOff)),
      bDrop,
      seconds: (Date.now() - started) / 1000,
    }

    for (const r of all) {
      for (const t of [1, 2, 80, 99, 200, 1000, Tend]) {
        if (r.at(t)) {
          metrics[`${r.name}_R${t}`] = r.R(t)
          metrics[`${r.name}_Rup${t}`] = r.Rup(t)
          metrics[`${r.name}_EminusA${t}`] = r.at(t)!.exported - r.at(t)!.entered
          metrics[`${r.name}_loves${t}`] = r.at(t)!.loves
          metrics[`${r.name}_broken${t}`] = r.at(t)!.broken
        }
      }

      metrics[`${r.name}_reach`] = r.run.reach

      for (const x of r.run.tv) {
        metrics[`${r.name}_I${x.beat}`] = x.mean
      }
    }

    return verdict({
      status,
      claim: `${setting.name} setting, ring of ${L} (periodic grade), radius ${D}. ${all.map(row).join(' || ')}. Gates on B: G1 retention levels off ${gG1}, G2 outflow equals arrivals ${gG2} (E - A ${g2Beats.map(t => `${t}: ${f4(outflow(t))}`).join(', ')}), G3 interior changes ${gG3}`,
      metrics,
      notes: `L2. Gate in the item's what (vibe-roadmap-grounding-0024). Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. C1 ${gC1} (level off ${e2(levelOff)}). X1 ${gX1} (${checks.map(c => `${c.what}: ${c.configurations} configurations, order free ${c.orderFree}, injective ${c.injective}, signs ${c.signs}`).join('; ')}). X2 ${gX2} (trace off ${e2(metrics.traceOff!)}, merge off ${e2(metrics.mergeOff!)}). X3 ${gX3} (F ${e2(m.F)}, distribution ${e2(m.dist)}). X4 ${gX4} (B dropped ${e2(bDrop)} against ${DROP}). Opt-in: adoption is the author's base change.`,
    })
  },
})
