// CALM ROOM (item vibe-roadmap-grounding-0058; B3 refiled by grounding decision 016, superseding item 0007; decisions
// 002 and 004). Does B1's cluster (E-SLF-0182, E-SPN-0093's level) keep more of itself, long after its bath has spread,
// when the bath can spread into calm docks than on B1's closed ring, which keeps throwing the bath back?
//
// WHY A RING OF L. E-SLF-0188 and 0193 found the lone cluster's retention is 1 for ever under B1's rule, so every loss
// is the bath's, and once the bath has spread the excess g levels off at the share that survived. The open line's own
// level is out of reach in time (E-SLF-0184 reaches 11 beats at W 12), so the calm is given as room: the same start
// lifted onto a closed ring of L docks, L - W of them calm (cut trit 0, as E-SLF-0184's E2). A ring of L is the open
// line exactly until a love can wrap (gate E), and a finite ring has a long-time level a time mean reaches (gate X).
// The open line is the limit L to infinity, which this item does not reach.
//
// SEEN BEFORE THE GATE: every reading of E-SLF-0183 and 0184 and B1's long-time fractions (0.16 to 0.40).
//
// GATES, frozen in the item's what before this file existed (gate e8bffe0ed109, 2026-11-18): C1, E, R, I4, X, C2, the
// window [8L, 16L] read every 8 (from the light cone), s(W, L) the window mean of g, P(W): s(W, 32) >= 1.25 s(W, W)
// and s(W, 32) - s(W, W) >= 0.05. Verdict: fail if C1, E, R or I4 fails; else fail if X holds everywhere and P fails
// at every W; pass if X and C2 hold everywhere and P holds at every W; open otherwise. Smoke is no evidence.
//
// PREDICTION (before any probe): s(W, 32) is 1.5 to 2 times s(W, W), and P holds at both W.
//
// SETTINGS. Default SMOKE (box-8 level, W 10 k 3 start 0, rings 10, 20, 22, window [4L, 8L] every 4, E and R on ring
// 22). CALM_SWEEP=full for the M3 (box 12, W 12 on rings 12, 28, 32 with starts 0 to 2, W 15 on rings 15, 28, 32 with
// starts 0 to 1, window [8L, 16L] every 8, E and R on ring 32).
//
// Depth L2: B1's rule in floats on one sector; the line law rests on E-SLF-0183's exact ball checks and E-SLF-0198's
// exact tube.

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
  lineEngine,
  lineReader,
  lineStart,
  thermal,
  type LineEngine,
} from '@/code/measure/cold-line'
import { coneStart } from '@/code/measure/cone-line'
import {
  lockstep,
  ringReversal,
  ringRun,
  windowBeats,
  windowStats,
  wrapBeat,
  type Lockstep,
  type RingRun,
  type WindowStats,
} from '@/code/measure/calm-room'

// E-SLF-0184's RECORDED level (box 12)
const RECORDED = {
  energy: 0.33001851839229945,
  share: 0.9823600683345252,
}

const EXACT = 1e-12
const REVERSED = 1e-10
const REVERSE_BEATS = 12
const DRIFT = 0.02
const HOLD = 0.9
const RATIO = 1.25
const GAIN = 0.05
const HALF = 0.5
const K = 3

type Case = { W: number; starts: number; rings: readonly number[] }

type Setting = {
  name: 'smoke' | 'full'
  box: number
  levelBar: number
  cases: readonly Case[]
  // the window factor f: reads at f L + f j, j = 0..L
  f: number
  // the ring E and R run on
  checkRing: number
  cap: number
}

const SMOKE: Setting = {
  name: 'smoke',
  box: 8,
  levelBar: 1e-4,
  cases: [{ W: 10, starts: 1, rings: [10, 20, 22] }],
  f: 4,
  checkRing: 22,
  cap: 1e7,
}

const FULL: Setting = {
  name: 'full',
  box: 12,
  levelBar: 1e-9,
  cases: [
    { W: 12, starts: 3, rings: [12, 28, 32] },
    { W: 15, starts: 2, rings: [15, 28, 32] },
  ],
  f: 8,
  checkRing: 32,
  cap: 1.5e8,
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((s, x) => s + x, 0) / xs.length

// the docks B1's start spans once lifted (T-0007a)
const widthOf = (W: number, fit: readonly Placed[]): number =>
  W + Math.max(...fit.flatMap(p => p.ts.map(t => t[0])))

type Check = { what: string; diffs: number[]; start: number }

type RingResult = {
  L: number
  offset: number
  beats: number[]
  g: number[]
  s: number
  x: { g: WindowStats; lone: WindowStats; bath: WindowStats }
  xHolds: boolean
  c2: number
  outside: number
  normOff: number
  checks: Check[]
  reversal: number
  // B1's reading every 8 (ring W only, full)
  b1F: number[]
  b1Tau: number
  seconds: number
}

function runRing(input: {
  W: number
  L: number
  setting: Setting
  placed: readonly Placed[]
  fit: readonly Placed[]
  width: number
  starts: number
  log: (what: string) => void
}): RingResult {
  const { W, L, setting, placed, fit, width, starts, log } = input
  const started = Date.now()
  const closed = L === W
  const offset = closed ? 0 : Math.floor((L - width) / 2)
  const read = Math.floor((W - 1) / 2)
  const f = setting.f
  const window = windowBeats(L, f)
  const windowSet = new Set(window)
  const beats = window[window.length - 1]!
  const readAt = (t: number): boolean =>
    windowSet.has(t) || (closed && t % 8 === 0)
  const rd = lineReader(placed, L, read, true)
  const span: readonly [number, number] | undefined = closed
    ? undefined
    : [offset, offset + width - 1]
  const check = L === setting.checkRing && !closed
  const tw = wrapBeat(L, offset, width)
  const shift = tw + 2

  const startOf = (
    e: LineEngine,
    bath: readonly (readonly [number, number])[],
    withCluster: boolean,
  ) =>
    lineStart({
      e,
      W,
      placed: withCluster ? fit : undefined,
      bath,
      lift: !closed,
      offset,
    }).amp

  const checks: Check[] = []
  const stepper = (
    what: string,
    e: LineEngine,
    dense: ReturnType<typeof startOf>,
    bath: readonly (readonly [number, number])[],
    withCluster: boolean,
  ): Lockstep | undefined => {
    if (!check) {
      return undefined
    }

    const sparse = coneStart({
      n: e.sp.n,
      line: L + 2 * shift,
      cap: setting.cap,
      W,
      placed: withCluster ? fit : undefined,
      bath,
      offset: offset + shift,
    }).store
    const ls = lockstep({ e, dense, sparse, shift, until: tw - 1 })

    checks.push({ what, diffs: ls.diffs, start: ls.start })

    return ls
  }

  let normOff = 0

  const keep = (r: RingRun): RingRun => {
    normOff = Math.max(normOff, r.normOff)

    return r
  }

  // the lone cluster and the bath alone (3 loves)
  const e3 = lineEngine(L, 3, true)
  const loneStart = startOf(e3, [], true)
  const loneStep = stepper('n 3 lone', e3, loneStart, [], true)
  const lone = keep(
    ringRun({ e: e3, start: loneStart, rd, beats, readAt, observe: loneStep?.observe }),
  )

  log(`W ${W} ring ${L} lone (${lone.seconds}s)`)

  const baths: RingRun[] = []

  for (let s = 0; s < starts; s++) {
    const bath = bathLoves(W, read, K, s)
    const st = startOf(e3, bath, false)
    const step = s === 0 ? stepper('n 3 bath start 0', e3, st, bath, false) : undefined

    baths.push(keep(ringRun({ e: e3, start: st, rd, beats, readAt, observe: step?.observe })))
  }

  log(`W ${W} ring ${L} baths`)

  // the cluster with its bath (6 loves)
  const e6 = lineEngine(L, 3 + K, true)

  log(`W ${W} ring ${L} engine n 6 (${e6.sp.count} configurations)`)

  const clusters: RingRun[] = []
  let reversal = NaN

  for (let s = 0; s < starts; s++) {
    const bath = bathLoves(W, read, K, s)
    const st = startOf(e6, bath, true)

    if (s === 0 && check) {
      reversal = ringReversal(e6, st, REVERSE_BEATS)
      log(`W ${W} ring ${L} R ${reversal.toExponential(2)}`)
    }

    const step =
      s === 0 ? stepper('n 6 cluster + bath start 0', e6, st, bath, true) : undefined

    clusters.push(
      keep(ringRun({ e: e6, start: st, rd, beats, readAt, observe: step?.observe, span })),
    )
    log(`W ${W} ring ${L} cluster start ${s} (${clusters[s]!.seconds}s)`)
  }

  const F0 = lone.reads.get(0)!
  const Fk = (t: number): number => mean(clusters.map(r => r.reads.get(t)!))
  const Fb = (t: number): number => mean(baths.map(r => r.reads.get(t)!))
  const g = window.map(t => (Fk(t) - Fb(t)) / lone.reads.get(t)!)
  const loneSeries = window.map(t => lone.reads.get(t)! / F0)
  const bathSeries = window.map(t => Fb(t) / F0)
  const x = {
    g: windowStats(g),
    lone: windowStats(loneSeries),
    bath: windowStats(bathSeries),
  }

  let b1F: number[] = []
  let b1Tau = Infinity

  if (closed) {
    const eights = [...lone.reads.keys()].filter(t => t % 8 === 0).sort((a, b) => a - b)

    b1F = eights.map(
      t => (Fk(t) - thermal(W, 3 + K)) / (lone.reads.get(t)! - thermal(W, 3)),
    )

    const at = b1F.findIndex(v => v < HALF)

    b1Tau = at < 0 ? Infinity : eights[at]!
  }

  return {
    L,
    offset,
    beats: window,
    g,
    s: x.g.mean,
    x,
    xHolds: x.g.drift <= DRIFT && x.lone.drift <= DRIFT && x.bath.drift <= DRIFT,
    c2: x.lone.mean,
    outside: span ? mean(clusters.map(r => r.outside)) : NaN,
    normOff,
    checks,
    reversal,
    b1F,
    b1Tau,
    seconds: (Date.now() - started) / 1000,
  }
}

type CaseResult = {
  W: number
  width: number
  rings: RingResult[]
  ratio: number
  gain: number
  p: boolean
}

export default experiment({
  id: 'selves/calm-room',
  code: 'E-SLF-0200',
  title:
    "calm room (B3 refiled): B1's bound cluster and bath, the start lifted onto closed rings with calm docks beside it, the long-time surviving share read over a light-cone window against B1's closed ring",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const setting = process.env.CALM_SWEEP === 'full' ? FULL : SMOKE
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

    // ---- the cases ----
    const cases: CaseResult[] = setting.cases.map(c => {
      const fit = fitRing(placed, c.W).kept
      const width = widthOf(c.W, fit)
      const rings = c.rings.map(L =>
        runRing({
          W: c.W,
          L,
          setting,
          placed,
          fit,
          width,
          starts: c.starts,
          log,
        }),
      )
      const own = rings.find(r => r.L === c.W)!
      const big = rings[rings.length - 1]!

      return {
        W: c.W,
        width,
        rings,
        ratio: big.s / own.s,
        gain: big.s - own.s,
        p: big.s >= RATIO * own.s && big.s - own.s >= GAIN,
      }
    })

    // ---- gates ----
    const allRings = cases.flatMap(c => c.rings)
    const checks = allRings.flatMap(r => r.checks)
    const eWorst = Math.max(0, ...checks.flatMap(q => [...q.diffs, q.start]))
    const eBeats = checks.reduce((n, q) => n + q.diffs.length, 0)
    const gE = checks.length > 0 && eBeats > 0 && eWorst <= EXACT
    const reversals = allRings.filter(r => !Number.isNaN(r.reversal)).map(r => r.reversal)
    const normOff = Math.max(...allRings.map(r => r.normOff))
    const gR =
      reversals.length === cases.length &&
      reversals.every(v => v <= REVERSED) &&
      normOff <= REVERSED
    const w12 = cases.find(c => c.W === 12)
    const gI4 =
      setting.name === 'smoke'
        ? true
        : w12
          ? w12.rings.find(r => r.L === 12)!.b1Tau === 8
          : false
    const gX = allRings.every(r => r.xHolds)
    const gC2 = allRings.every(r => r.c2 >= HOLD)
    const instrumentOk = gC1 && gE && gR && gI4
    const pAll = cases.every(c => c.p)
    const pNone = cases.every(c => !c.p)
    const status: 'pass' | 'fail' | 'open' = !instrumentOk
      ? 'fail'
      : setting.name === 'smoke'
        ? 'open'
        : gX && pNone
          ? 'fail'
          : gX && gC2 && pAll
            ? 'pass'
            : 'open'

    const f4 = (v: number): string =>
      Number.isFinite(v) ? v.toFixed(4) : String(v)
    const ringRow = (r: RingResult): string =>
      `ring ${r.L} (offset ${r.offset}): s ${f4(r.s)}; X g ${f4(r.x.g.first)}/${f4(r.x.g.last)} lone ${f4(r.x.lone.first)}/${f4(r.x.lone.last)} bath ${f4(r.x.bath.first)}/${f4(r.x.bath.last)} (${r.xHolds ? 'level reached' : 'NOT reached'}); C2 ${f4(r.c2)}; loves outside the start span ${f4(r.outside)}; g at the window ${r.g.map(f4).join(' ')}${r.b1F.length ? `; B1 reading every 8 ${r.b1F.slice(0, 8).map(f4).join(' ')} (tau ${r.b1Tau})` : ''}; ${Math.round(r.seconds)} s`
    const caseRow = (c: CaseResult): string =>
      `W ${c.W} (width ${c.width}): ${c.rings.map(ringRow).join('; ')}; ratio s(big)/s(W) ${f4(c.ratio)}, gain ${f4(c.gain)}, P ${c.p}`

    const metrics: Record<string, number> = {
      gate_C1: gC1 ? 1 : 0,
      gate_E: gE ? 1 : 0,
      gate_R: gR ? 1 : 0,
      gate_I4: gI4 ? 1 : 0,
      gate_X: gX ? 1 : 0,
      gate_C2: gC2 ? 1 : 0,
      levelOff,
      eWorst,
      eBeats,
      reversal: Math.max(0, ...reversals),
      normOff,
      seconds: (Date.now() - started) / 1000,
    }

    for (const c of cases) {
      metrics[`W${c.W}_ratio`] = c.ratio
      metrics[`W${c.W}_gain`] = c.gain
      metrics[`W${c.W}_P`] = c.p ? 1 : 0

      for (const r of c.rings) {
        metrics[`W${c.W}_L${r.L}_s`] = r.s
        metrics[`W${c.W}_L${r.L}_drift`] = Math.max(
          r.x.g.drift,
          r.x.lone.drift,
          r.x.bath.drift,
        )
        metrics[`W${c.W}_L${r.L}_c2`] = r.c2
      }
    }

    return verdict({
      status,
      claim: `${setting.name} setting: E-SPN-0093's cluster (E ${level.unwrapped.toFixed(5)}, box ${setting.box}) and B1's k 3 baths on B1's closed ring and on rings with calm docks, the long-time share over the window [${setting.f}L, ${2 * setting.f}L]: ${cases.map(caseRow).join(' || ')}`,
      metrics,
      notes: `L2. Setting ${setting.name}${setting.name === 'smoke' ? ' (proves the file runs; not evidence, status open by rule)' : ''}. Gates C1 ${gC1} (level off ${levelOff.toExponential(1)}), E ${gE} (${checks.map(q => `${q.what}: start ${q.start.toExponential(1)}, beats ${q.diffs.map(d => d.toExponential(1)).join(' ')}`).join('; ')}), R ${gR} (${REVERSE_BEATS} beats back ${reversals.map(v => v.toExponential(1)).join(' ')}, norm ${normOff.toExponential(1)}), I4 ${gI4}, X ${gX}, C2 ${gC2}. The rule is B1's line sector in floats with the split coin.`,
    })
  },
})
