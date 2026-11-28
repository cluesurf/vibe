// A BOUNDARY THAT HANDS ONLY ERRORS OUTWARD (self-structures-and-experience.md,
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
// SETTINGS. Default SMOKE (30 beats, nMax 4; proves the file runs, open by rule). BOUNDARY_SWEEP=full for a large machine.
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
import { runClassStore } from '@/code/measure/class-store'

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
// dense: the (love number, residue) pairs the class store holds as density matrices (the scoped setting only)
type ArmRun = {
  name: string
  arm: Arm
  beats: number
  arrivals: boolean
  nMax: number
  budget?: number
  dense?: readonly (readonly [number, number])[]
}

type Setting = {
  name: 'smoke' | 'full' | 'scoped' | 'scoped-smoke'
  runs: readonly ArmRun[]
  readAt: (beats: number) => number[]
  tvAt: (beats: number) => number[]
  // the stream path of code/measure/error-boundary, or the class store of code/measure/class-store
  engine: 'stream' | 'class'
  arrivals: readonly Arrival[]
  cap: readonly number[]
  keep: readonly number[]
  // the beats G1 chains (R(t1) >= HOLD, then R(t_i+1) >= R_up(t_i) - LEVEL), and whether the last must also hold HOLD
  g1Beats: readonly number[]
  holdLast: boolean
  g2Beats: readonly number[]
  tvBeats: readonly number[]
  end: number
  // log every beat with the run's allocation, and every merge's total (the scoped run, watched on a large machine)
  verbose: boolean
}

const ARRIVALS: Arrival[] = Array.from({ length: 24 }, (_, k) => ({ beat: 20 + 40 * k, dock: (16 + 7 * k) % L, label: k % 2 }))

// columns per sector: merge past cap, keep keep (n = 0 .. 5; 0 and 1 are never followed)
const CAP = [0, 0, 128, 128, 24, 8]
const KEEP = [0, 0, 64, 64, 12, 4]

// The scoped run (gate 7934f4e93d0a): k = 0 and 1 only, caps 64/1024/1280/8 keeping
// 32/512/1024/4 for 2/3/4/5 loves, dense 2- and 3-love residues for B, S and A0, none for A1 and N
const ARRIVALS_TWO: Arrival[] = ARRIVALS.slice(0, 2)
const CAP_SCOPED = [0, 0, 64, 1024, 1280, 8]
const KEEP_SCOPED = [0, 0, 32, 512, 1024, 4]
const DENSE_ALL: (readonly [number, number])[] = [
  [2, 0],
  [2, 1],
  [2, 2],
  [3, 0],
  [3, 1],
  [3, 2],
]
const CHOLESKY = 1e-14

const SMOKE: Setting = {
  name: 'smoke',
  engine: 'stream',
  arrivals: ARRIVALS,
  cap: CAP,
  keep: KEEP,
  g1Beats: [10, 20, 30],
  holdLast: true,
  g2Beats: [30],
  tvBeats: [20, 30],
  end: 30,
  verbose: false,
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
  engine: 'stream',
  arrivals: ARRIVALS,
  cap: CAP,
  keep: KEEP,
  g1Beats: [80, 200, 1000],
  holdLast: true,
  g2Beats: [200, 1000],
  tvBeats: [80, 200, 1000],
  end: 1000,
  verbose: false,
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
// an earlier step's gated run (BOUNDARY_SWEEP=scoped): the arms in the gate's stated order, each to beat 200, on the class
// store; G1 on 80 and 200, G2 at 200, G3 at 80 and 200, X4 at 200
const SCOPED: Setting = {
  name: 'scoped',
  engine: 'class',
  arrivals: ARRIVALS_TWO,
  cap: CAP_SCOPED,
  keep: KEEP_SCOPED,
  g1Beats: [80, 200],
  holdLast: false,
  g2Beats: [200],
  tvBeats: [80, 200],
  end: 200,
  verbose: true,
  runs: [
    { name: 'B', arm: 'boundary', beats: 200, arrivals: true, nMax: 5, dense: DENSE_ALL },
    { name: 'A0', arm: 'boundary', beats: 200, arrivals: false, nMax: 3, dense: DENSE_ALL },
    { name: 'A1', arm: 'none', beats: 200, arrivals: false, nMax: 3, dense: [] },
    { name: 'S', arm: 'swap', beats: 200, arrivals: true, nMax: 5, dense: DENSE_ALL },
    { name: 'N', arm: 'none', beats: 200, arrivals: true, nMax: 5, dense: [] },
  ],
  readAt: beats => [0, 1, 2, 4, 10, 20, 40, 60, 80, 100, 120, 160, 200].filter(t => t <= beats),
  tvAt: beats => [80, 200].filter(t => t <= beats),
}

// a SMOKE of the scoped path only, never the gated run: BOUNDARY_SMOKE_GATES="a,b" (a < b) runs every scoped arm to
// beat b, reads G1 on a and b, G2 at b, G3 at a and b and X4 at b, so the end-of-run reading is run once before the
// 28 h launch. Without it the scoped setting is the frozen one; tmp/m3-eb39-launch.sh never sets it
function smokeScoped(gates: string | undefined): Setting {
  if (gates === undefined) {
    return SCOPED
  }

  const [a, b] = gates.split(',').map(Number)

  if (!Number.isInteger(a) || !Number.isInteger(b) || a! < 1 || b! <= a!) {
    throw new Error(`BOUNDARY_SMOKE_GATES must be "a,b" with 1 <= a < b, got ${gates}`)
  }

  const reads = [...new Set([0, 1, 2, 4, 10, 20, 40, 60, 80, 100, 120, 160, 200, a!, b!])].sort((x, y) => x - y)

  return {
    ...SCOPED,
    name: 'scoped-smoke',
    g1Beats: [a!, b!],
    g2Beats: [b!],
    tvBeats: [a!, b!],
    end: b!,
    runs: SCOPED.runs.map(r => ({ ...r, beats: b! })),
    readAt: beats => reads.filter(t => t <= beats),
    tvAt: beats => [a!, b!].filter(t => t <= beats),
  }
}

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
    const sweep = process.env.BOUNDARY_SWEEP
    const setting = sweep === 'full' ? FULL : sweep === 'scoped' ? smokeScoped(process.env.BOUNDARY_SMOKE_GATES) : SMOKE
    // the allocation is V8's heap used plus external, which holds every typed array (T-0041a: never rss)
    const alloc = (): string => {
      const m = process.memoryUsage()

      return setting.verbose ? ` alloc ${((m.heapUsed + m.external) / 2 ** 30).toFixed(2)} GiB` : ''
    }
    const log = (what: string): void =>
      console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s${alloc()}`)

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
      log(`arm ${spec.name} start`)

      const base = {
        L,
        d: D,
        nMax: spec.nMax,
        arm: spec.arm,
        arrivals: spec.arrivals ? setting.arrivals : [],
        beats: spec.beats,
        cap: setting.cap,
        keep: setting.keep,
        floor: FLOOR,
        readAt: setting.readAt(spec.beats),
        tvAt: setting.tvAt(spec.beats),
        tvWindow: 10,
        every: setting.verbose ? 1 : 50,
        byteBudget: spec.budget,
      }
      const run =
        setting.engine === 'class'
          ? runClassStore(
              {
                ...base,
                dense: spec.dense ?? [],
                cholesky: CHOLESKY,
                spectrum: (n, beat, values) => {
                  const total = values.reduce((s, x) => s + Math.max(0, x), 0)

                  log(`merge ${spec.name} n ${n} beat ${beat} k ${values.length} total ${e2(total)}`)
                },
              },
              start,
              reader,
              log,
            )
          : runBoundary(base, start, reader, log)

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
    const Tend = setting.end
    const g1Beats = setting.g1Beats
    const t1 = g1Beats[0]!
    const tLast = g1Beats[g1Beats.length - 1]!
    const steps = g1Beats.slice(1).map((t, i) => [g1Beats[i]!, t] as const)
    // decided pass on the pessimistic reading (R low where it must be high, R_up where it is subtracted); decided fail
    // when even the optimistic reading fails; otherwise undecided (the verdict is open)
    const g1Pass =
      B.R(t1) >= HOLD &&
      steps.every(([a, b]) => B.R(b) >= B.Rup(a) - LEVEL) &&
      (!setting.holdLast || B.R(tLast) >= HOLD)
    const g1Fail =
      B.Rup(t1) < HOLD ||
      steps.some(([a, b]) => B.Rup(b) < B.R(a) - LEVEL) ||
      (setting.holdLast && B.Rup(tLast) < HOLD)
    const gG1 = g1Pass
    const g1Decided = g1Pass || g1Fail
    const outflow = (t: number): number => {
      const r = B.at(t)

      return r ? r.exported - r.entered : NaN
    }
    const g2Beats = setting.g2Beats
    const gG2 = g2Beats.every(t => Math.abs(outflow(t)) <= OUTFLOW)
    const tvBeats = setting.tvBeats
    const gG3 = tvBeats.every(t => B.I(t) >= CHANGE)

    const instrument = gC1 && gX1 && gX2 && gX3
    const status: 'pass' | 'fail' | 'open' = !instrument
      ? 'fail'
      : setting.name === 'smoke' || setting.name === 'scoped-smoke' || !gX4 || !g1Decided
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
      notes: `L2. Gate registered before the run (${setting.name === 'scoped' ? 'gate 7934f4e93d0a, class store' : 'the registered gate'}). Setting ${setting.name}${setting.name === 'smoke' || setting.name === 'scoped-smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. C1 ${gC1} (level off ${e2(levelOff)}). X1 ${gX1} (${checks.map(c => `${c.what}: ${c.configurations} configurations, order free ${c.orderFree}, injective ${c.injective}, signs ${c.signs}`).join('; ')}). X2 ${gX2} (trace off ${e2(metrics.traceOff!)}, merge off ${e2(metrics.mergeOff!)}). X3 ${gX3} (F ${e2(m.F)}, distribution ${e2(m.dist)}). X4 ${gX4} (B dropped ${e2(bDrop)} against ${DROP}). Opt-in: adoption is the author's base change.`,
    })
  },
})
