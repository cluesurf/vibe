// THE MOVING CLOCK READ AT TWICE THE RESOLUTION FROM THE SAME SOLVES (E-SPN-0219, OPEN-MOT-01,
// vibe-roadmap-moving-matter-0001). E-SPN-0217 read the register pair's 1s-2s clock from level-group centroids at three
// points near fixed coupling (m 0.284 a_B 12, m 0.380 a_B 10, m 0.427 a_B 7.5) and, with the Darwin exchange restored
// at S = 1 (E-SPN-0218: the rule's own light gives S = 0.992 to 0.999), extrapolated it to 0.25 +- 1.65 of relativity's.
// The error is the 2s level's curvature: its centroid moved 1.4e-4 to 1.9e-4 over the six settings, so each R_2s carried
// 0.018 to 0.027 and the continuum clock 1.65. E-SPN-0217 put the way out at a lighter, larger pair, m 0.18 a_B 19.
//
// THE DESIGN QUESTION, AND WHY NO NEW RUN IS NEEDED FIRST. What moves the 2s centroid with the setting is the Gaussian's
// own tail cut by the window's top edge, not the 3s line: with sigma 1.85e-3 the top edge sits 2.4 sigma (edge 0.5) or
// 1.9 sigma (edge 0.4) above the 2s peak, which lowers the centroid by sigma phi(2.4) = 4.1e-5 and sigma phi(1.9) =
// 1.2e-4, the shifts seen (4.2e-5 and 1.4e-4 at m 0.284 a_B 12). The cure is a smaller sigma. The 1e-12 lag taper floor
// set sigma n >= 7.43; a floor of 1e-4 sets sigma n >= 4.29, a sigma 1.73 times smaller from the SAME lags. The design
// probe (tmp/spn219-probe.ts in this worktree, reading only the three K = 0 correlations, which are 8,444 to 8,450 lags
// long; no K > 0 read was opened at the new floor) cut each to 4,400 lags and read it at floor 1e-4: the 2s centroid
// agrees with the full-length 1e-12 read at sigma 8.8e-4 to 2e-7, 0 and 8e-7, and its half-spread over the settings
// falls from 1.37e-4, 1.77e-4, 1.44e-4 to 1.65e-5, 2.89e-5, 1.87e-5. Longer solves (8,450 lags, a droplet run of about
// 60 hours at 3 threads for the three points) give 1.1e-5 to 2.1e-5, little more; a_B 19 (about 340,000 states, 2s-3s
// gap 0.002, so 15,000 lags) would cost about 4 times that. So the cheapest design is a re-read of the saved solves at
// the finer sigma, with the cut-taper read witnessed against the full-length fine read on the K = 0 correlations.
//
// THE INSTRUMENT. code/measure/clock-group-read on code/measure/level-group, E-SPN-0217's group rules (1s: lowest peak of
// weight >= 0.1; 2s: next peak of weight >= 0.01; window from 0.02 under the 1s peak, top edge `edge` of the way to the
// next peak of weight >= 0.01, or 0.006 above), now at sigma 1.05e-3, 1.25e-3, 1.48e-3 (sigma n = 4.30 at the shortest
// K read, 4,097 lags), each with edge 0.5 and 0.4, taper floor 1e-4. K reads 0.2, 0.35, 0.5 (E-SPN-0217's); K = 0 the
// full saved correlation.
//
// GATES (frozen 2026-10-23 before any K > 0 correlation was read at the new settings; the K = 0 numbers above are the
// only reads made):
//   R0  CONTROL: the same code at E-SPN-0217's own settings (sigma 1.85e-3, 2.2e-3, 2.6e-3, floor 1e-12) gives back its
//       recorded per-point Darwin-restored ratios and 0.2506 +- 1.6515 within 1e-9
//   W   WITNESS, at each point's K = 0 correlation: the floor-1e-4 read of its first n_K lags (n_K the length of that
//       point's K reads) at the main setting gives the 1s and 2s centroids within 5e-6 of the full-length read at
//       floor 1e-12 and sigma sqrt(2 ln 1e12) / (n - 1) (edge 0.5)
//   I   at every K of every point: weights at least 0.2 (1s) and 0.05 (2s), centroid half-spread over the six settings
//       at most 5e-5 (1s) and 6e-5 (2s)
//   THE CLOCK: E-SPN-0217's continuum extrapolation with each level's Darwin exchange restored at S = 1 (clockLimit,
//       darwin true): r = alpha_inf / alpha_SR +- sigma
//   RES   resolved: sigma <= 0.5 (so 0, no dilation, and 1 - 8/3, the static class, are each told from 1 at 2 sigma
//         or more)
//   REL   |r - 1| <= 2 sigma
//   DIL   r > 2 sigma (the moving clock runs slow)
//   NOTQ  |r - (1 - 8/3)| > 3 sigma
//   X     E-SPN-0217's X: r > 0, |r - 1| < 0.25 and sigma <= 0.25
//   Verdict: fail if R0, W or I fails, or not RES; pass if REL, DIL, NOTQ and X; partial if REL, DIL and NOTQ but not
//   X; fail otherwise (resolved and not relativity's). A pass here is a CONTINUUM-EXTRAPOLATED clock: the item's own
//   gate is per point on the raw engine, which E-SPN-0217 showed cannot pass at any size (the static class's 8/3).
//   STAGE 2 (registered now, run only if RES fails while R0, W and I hold): the three points' K reads again at 8,450
//   lags on the work droplet, read at sigma 5.3e-4 to 7.4e-4 (sigma n 4.29 at floor 1e-4), the same gates.
// PREDICTED (before the read): sigma between 0.15 and 0.45 (the 2s half-spreads' fall at K = 0, 6 to 8 times, carried
// to the K reads); r inside E-SPN-0217's own band, 0.25 +- 1.65.
//
// STAGE 1 RUN (2026-10-23, seconds, test/record/E-SPN-0219/spn219-verdict.log): FAIL, on I and RES. No gate moved.
//  - R0 holds (E-SPN-0217 reproduced) and W holds (the cut read within 1.5e-6 of the full-length read at K = 0).
//  - I fails at K > 0: the 2s half-spread is 2e-5 to 4e-5 at K = 0, as the probe said, but 6.8e-5 to 2.0e-4 at K 0.2
//    and 0.35 (and 8e-5 at K 0.5 at a_B 7.5). The prediction carried the K = 0 fall to the K reads and was wrong.
//  - The clock: per point (Darwin-restored) -0.47, -0.45, -1.65; extrapolated 0.18 +- 1.35 of relativity's (raw -2.56
//    +- 1.35): sigma fell only from 1.65 to 1.35, so RES fails; the prediction [0.15, 0.45] missed.
//  WHY (tmp/spn219-diagnose.ts, read after the verdict): at K > 0 the 2s group widens to 1.0e-3 to 1.9e-3 and the 3s
//  line, weight 0.009 to 0.010, is a separate peak at sigma 1.05e-3 but merges into the 2s's shoulder at 1.25e-3 and
//  1.48e-3. So the 2s window's top edge jumps between two rules (half way to the 3s, or 0.006 above the 2s) from one
//  setting to the next, moving the centroid by 1.5e-4 to 3e-4. A resolution limit after all, at K > 0, and a threshold
//  (next 0.01) at the 3s line's own weight. Lowering `next` alone does not cure it (the 3s is not a peak at all at the
//  larger sigmas; tmp/spn219-diagnose2.ts, instrument numbers only).
// STAGE 2, RE-REGISTERED (2026-10-23, after stage 1's verdict, before any stage-2 read existed; frozen in
// test/record/E-SPN-0219/gates-stage2.json). Stage 1's own trigger for stage 2 required I to hold; it failed, and the
// cause is the one stage 2 removes, so the stage is re-registered rather than dropped (a deviation, logged): the K
// reads 0.2, 0.35, 0.5 of m 0.284 a_B 12 and m 0.427 a_B 7.5 again at 6,800 lags (test/record/E-SPN-0219/run/
// spn219-part.ts, the same path as the saved reads, checked against their first 31 lags; m 0.380 a_B 10's saved reads
// are already 8,193 lags long and are read as they are), at sigma 6.35e-4, 7.56e-4, 8.92e-4 (sigma n 4.32 at
// floor 1e-4; the largest 15% under the 1.05e-3 at which the 3s was a peak in all three diagnosed cases) and with the
// next-peak threshold 0.005, clear of the 3s weight; the K = 0 reads the saved 8,444 to 8,450-lag ones. Every gate
// else as stage 1. Cost: 3 x 6,800 lags on 86,420 + 22,137 representatives, 2.2e9 representative-lags, about 60
// thread-hours at the droplet's assumed 1e-4 s each (to be measured from the run's probe), shared with E-MTR-0034 in
// three one-thread queues. PREDICTED: sigma in [0.15, 0.5], r in [-1.2, 1.5].
//
// Depth L2 (a two-body quantum walk on the husk quotient, read through saved correlations; relativity's alpha is the
// control). DETERMINISM: no random numbers, no engine run.

import { existsSync, readFileSync } from 'node:fs'
import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { clockFromGroups, clockLimit, levelPairAt, type ClockInstrument, type ClockPoint } from '@/code/measure/clock-group-read'
import { groupOverSettings, type Correlation, type GroupSetting } from '@/code/measure/level-group'
import { thresholdRise } from '@/code/measure/pair-boost'
import { setupFor } from '@/code/measure/register-track'
import { readVerdictLog } from '@/code/tool/verdict-log'

const RECORD = `${import.meta.dirname}/../../record`
const CLOCK_LOG = `${RECORD}/E-SPN-0217/clock-verdict.log`
const FINE_REACH = Math.sqrt(2 * Math.log(1e12))

// every gate and setting of a stage comes from its frozen pre-registration file
type Gates = {
  instrument: {
    sigmaMain: number
    sigmaFactors: number[]
    edges: number[]
    taperFloor: number
    least: number
    next: number
    below: number
    above: number
    momenta: number[]
  }
  savedPoints?: string[]
  R0: { control: number }
  W: { witness: number }
  I: { weight1s: number; weight2s: number; stable1s: number; stable2s: number }
  clock: { resolved: number; relSigmas: number; dilSigmas: number; staticSigmas: number; staticLimit: number; band: number }
}

export type Stage = { stage: 1 | 2; gates: Gates; fine: ClockInstrument; old: ClockInstrument; file: (p: Point, K: number) => string }

const instrumentOf = (g: Gates): ClockInstrument => {
  const ins = g.instrument

  return {
    settings: ins.sigmaFactors.flatMap(f => ins.edges.map((edge): GroupSetting => ({ sigma: ins.sigmaMain * f, edge, floor: ins.taperFloor }))),
    least: ins.least,
    next: ins.next,
    below: ins.below,
    above: ins.above,
  }
}

export function stageOf(stage: 1 | 2): Stage {
  const gates: Gates = JSON.parse(readFileSync(`${RECORD}/E-SPN-0219/${stage === 1 ? 'gates.json' : 'gates-stage2.json'}`, 'utf8'))
  const fine = instrumentOf(gates)
  const first: Gates = stage === 1 ? gates : JSON.parse(readFileSync(`${RECORD}/E-SPN-0219/gates.json`, 'utf8'))

  return {
    stage,
    gates,
    fine,
    // E-SPN-0217's own instrument (the control R0, on E-SPN-0217's own reads at every stage)
    old: { ...instrumentOf(first), settings: [0.00185, 0.0022, 0.0026].flatMap(sigma => [0.5, 0.4].map(edge => ({ sigma, edge }))) },
    file:
      stage === 1
        ? (p, K) => p.file(K)
        : (p, K) => ((gates.savedPoints ?? []).includes(p.name) ? p.file(K) : `${RECORD}/E-SPN-0219/spn219-${p.name}-K${K}.json`),
  }
}

export const FINE: ClockInstrument = stageOf(1).fine

type Point = { name: string; unit: readonly [number, number]; aB: number; zero: () => Correlation | null; file: (K: number) => string }

const load = (path: string, pick: (j: any) => Correlation): Correlation | null =>
  existsSync(path) ? pick(JSON.parse(readFileSync(path, 'utf8'))) : null

export const POINTS: readonly Point[] = [
  {
    name: 'm0284a12',
    unit: [-7, 2],
    aB: 12,
    zero: () => load(`${RECORD}/E-SPN-0212/spn-light-m0284-a12.json`, j => j.zero.x),
    file: K => `${RECORD}/E-MTR-0031/mtr-light-K${K}.json`,
  },
  {
    name: 'm0380a10',
    unit: [-2, 5],
    aB: 10,
    zero: () => load(`${RECORD}/E-MTR-0032/mtr-fade-m0380a10-zero.json`, j => j.x),
    file: K => `${RECORD}/E-MTR-0032/mtr-fade-m0380a10-K${K}.json`,
  },
  {
    name: 'm0427a7.5',
    unit: [-5, 1],
    aB: 7.5,
    zero: () => load(`${RECORD}/E-SPN-0214/spn-cleanclock-zero-7.5.json`, j => j.x),
    file: K => `${RECORD}/E-SPN-0217/clock-c7.5-K${K}.json`,
  },
]

const flag = (b: boolean): number => (b ? 1 : 0)
const cut = (x: Correlation, n: number): Correlation => ({ re: Array.from(x.re).slice(0, n), im: Array.from(x.im).slice(0, n) })

type PointRead = { clock: ClockPoint; old: ClockPoint; W: boolean; I: boolean; offW1: number; offW2: number; metrics: Record<string, number> }

function readPoint(p: Point, st: Stage): PointRead | null {
  const su = setupFor(p.unit)
  const zero = p.zero()
  const momenta = st.gates.instrument.momenta
  const files = momenta.map(K => ({ K, f: st.file(p, K) }))
  const oldFiles = momenta.map(K => ({ K, f: p.file(K) }))

  if (!zero || ![...files, ...oldFiles].every(r => existsSync(r.f))) return null

  const xs = files.map(({ K, f }) => ({ K, x: load(f, j => j)! }))
  const oldXs = oldFiles.map(({ K, f }) => ({ K, x: load(f, j => j)! }))
  const nK = Math.min(...xs.map(r => r.x.re.length))
  const rules = { least: st.fine.least, next: st.fine.next, below: st.fine.below, above: st.fine.above }
  const I_ = st.gates.I

  // W: the cut, floor-1e-4 read against the full-length fine read, K = 0
  const rise = thresholdRise(su, 0)
  const range = { lo: 2 * su.M0 - 0.08 + 0.3 * rise, hi: 2 * su.M0 + 1.2 * rise + 0.03, ...rules }
  const fine = [{ sigma: (FINE_REACH / (zero.re.length - 1)) * 1.0001, edge: 0.5 }]
  const cutRead = levelPairAt(su, cut(zero, nK), 0, { ...st.fine, settings: [st.fine.settings[0]!] })
  const full1 = groupOverSettings({ x: zero, ...range, settings: fine, rank: 0 })
  const full2 = groupOverSettings({ x: zero, ...range, settings: fine, rank: 1 })
  const offW1 = (cutRead.one.main?.centroid ?? NaN) - (full1.main?.centroid ?? NaN)
  const offW2 = (cutRead.two.main?.centroid ?? NaN) - (full2.main?.centroid ?? NaN)
  const W = Math.abs(offW1) <= st.gates.W.witness && Math.abs(offW2) <= st.gates.W.witness

  const read = (ins: ClockInstrument, reads: { K: number; x: Correlation }[]) =>
    clockFromGroups({ name: p.name, su, aB: p.aB, zero: levelPairAt(su, zero, 0, ins), reads: reads.map(({ K, x }) => ({ K, g: levelPairAt(su, x, K, ins) })) })
  const clock = read(st.fine, xs)
  const old = read(st.old, oldXs)
  const metrics: Record<string, number> = { nK, offW1, offW2 }
  let I = true

  for (const { K, g } of clock.groups) {
    I &&=
      g.one.main !== null &&
      g.two.main !== null &&
      g.one.main.weight >= I_.weight1s &&
      g.two.main.weight >= I_.weight2s &&
      g.one.half <= I_.stable1s &&
      g.two.half <= I_.stable2s
    metrics[`K${K}_c1`] = g.one.main?.centroid ?? NaN
    metrics[`K${K}_c2`] = g.two.main?.centroid ?? NaN
    metrics[`K${K}_W1`] = g.one.main?.weight ?? NaN
    metrics[`K${K}_W2`] = g.two.main?.weight ?? NaN
    metrics[`K${K}_half1`] = g.one.half
    metrics[`K${K}_half2`] = g.two.half
  }

  Object.assign(metrics, {
    W: flag(W),
    I: flag(I),
    E1: clock.E1,
    E2: clock.E2,
    R1: clock.R1,
    R2: clock.R2,
    sigmaR1: clock.sigmaR1,
    sigmaR2: clock.sigmaR2,
    ratio: clock.ratio,
    sigmaRatio: clock.sigmaRatio,
    Q: clock.Q,
    Qstatic: clock.Qstatic,
    R1full: clock.R1full,
    R2full: clock.R2full,
    ratioDarwin: clock.ratioDarwin,
    oldRatioDarwin: old.ratioDarwin,
  })

  return { clock, old, W, I, offW1, offW2, metrics }
}

export function runClockFine(stage: 1 | 2): Verdict {
  const st = stageOf(stage)
  const G = st.gates.clock
  const recorded = readVerdictLog(CLOCK_LOG)
  const reads = POINTS.map(p => readPoint(p, st))

  if (!recorded || reads.some(r => r === null)) {
    return verdict({ status: 'open', claim: `stage ${stage}: a saved correlation or E-SPN-0217's verdict log is missing`, metrics: {} })
  }

  const rs = reads as PointRead[]
  const cm = recorded.metrics
  const CONTROL = st.gates.R0.control
  const oldLimit = clockLimit(rs.map(r => r.old), true)
  const R0 =
    POINTS.every((p, i) => Math.abs(rs[i]!.old.ratioDarwin - cm[`${p.name}_ratioDarwin`]!) <= CONTROL) &&
    Math.abs(oldLimit.ratioInf - cm.ratioInfDarwin!) <= CONTROL &&
    Math.abs(oldLimit.sigmaInf - cm.sigmaInfDarwin!) <= CONTROL
  const W = rs.every(r => r.W)
  const I = rs.every(r => r.I)
  const lim = clockLimit(rs.map(r => r.clock), true)
  const raw = clockLimit(rs.map(r => r.clock), false)
  const r = lim.ratioInf
  const s = lim.sigmaInf
  const RES = s <= G.resolved
  const REL = Math.abs(r - 1) <= G.relSigmas * s
  const DIL = r > G.dilSigmas * s
  const NOTQ = Math.abs(r - G.staticLimit) > G.staticSigmas * s
  const X = r > 0 && Math.abs(r - 1) < G.band && s <= G.band
  const status: Verdict['status'] = !(R0 && W && I && RES) ? 'fail' : REL && DIL && NOTQ ? (X ? 'pass' : 'partial') : 'fail'
  const metrics: Record<string, number> = {}

  for (const p of rs) for (const [k, v] of Object.entries(p.metrics)) metrics[`${p.clock.name}_${k}`] = v
  Object.assign(metrics, {
    R0: flag(R0),
    W: flag(W),
    I: flag(I),
    RES: flag(RES),
    REL: flag(REL),
    DIL: flag(DIL),
    NOTQ: flag(NOTQ),
    X: flag(X),
    ratioInfDarwin: r,
    sigmaInfDarwin: s,
    C1full: lim.C1,
    Cdeltafull: lim.Cdelta,
    sigmaCdeltafull: lim.sigmaCdelta,
    chi2deltafull: lim.chi2delta,
    Lambda: lim.Lambda,
    ratioInfRaw: raw.ratioInf,
    sigmaInfRaw: raw.sigmaInf,
    oldRatioInfDarwin: oldLimit.ratioInf,
    oldSigmaInfDarwin: oldLimit.sigmaInf,
  })

  return verdict({
    status,
    claim: `stage ${stage}: the 1s-2s clock read at sigma ${st.gates.instrument.sigmaMain.toExponential(2)} (lag taper floor ${st.gates.instrument.taperFloor}, ${stage === 1 ? "E-SPN-0217's saved solves" : `${st.gates.instrument.momenta.length} K reads of ${(rs[0]!.metrics.nK ?? NaN).toFixed(0)} lags`}): per point ${rs.map(p => `${p.clock.ratio.toFixed(3)} +- ${p.clock.sigmaRatio.toFixed(3)} raw, ${p.clock.ratioDarwin.toFixed(3)} Darwin-restored at m ${p.clock.m.toFixed(3)} a_B ${p.clock.aB} (R ${p.clock.R1.toFixed(4)} +- ${p.clock.sigmaR1.toFixed(4)}, ${p.clock.R2.toFixed(4)} +- ${p.clock.sigmaR2.toFixed(4)})`).join('; ')}; extrapolated with the Darwin exchange restored at S = 1: ${r.toFixed(3)} +- ${s.toFixed(3)} of relativity's (raw ${raw.ratioInf.toFixed(3)} +- ${raw.sigmaInf.toFixed(3)}; E-SPN-0217's settings ${oldLimit.ratioInf.toFixed(3)} +- ${oldLimit.sigmaInf.toFixed(3)}); RES ${RES} REL ${REL} DIL ${DIL} NOTQ ${NOTQ} X ${X}; control R0 ${R0}, witness W ${W} (worst ${Math.max(...rs.map(p => Math.max(Math.abs(p.offW1), Math.abs(p.offW2)))).toExponential(1)}), instrument I ${I}`,
    metrics,
    control: { R0: flag(R0) },
    notes: `L2. ${rs.map(p => `${p.clock.name}: ${p.clock.groups.map(({ K, g }) => `K ${K} 1s ${(g.one.main?.centroid ?? NaN).toFixed(7)} (half ${g.one.half.toExponential(1)}) 2s ${(g.two.main?.centroid ?? NaN).toFixed(7)} (W ${(g.two.main?.weight ?? NaN).toFixed(3)}, half ${g.two.half.toExponential(1)})`).join(', ')}`).join(' | ')}`,
  })
}

export default experiment({
  id: 'spin/register-pair-clock-fine',
  code: 'E-SPN-0219',
  title:
    "explores whether the register pair's 1s-2s clock, read at a finer level-group resolution (the lag taper cut at 1e-4, witnessed against the full-length reads), resolves E-SPN-0217's continuum extrapolation: stage 1 (the saved solves) fails, the 2s window jumping with the setting at K > 0 where the 3s merges into it, 0.18 +- 1.35 of relativity's; stage 2 (6,800-lag reads) is on the work droplet",
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // stage 2 once its reads exist, else stage 1 (the stage-1 verdict stands in test/record/E-SPN-0219/spn219-verdict.log)
    const two = runClockFine(2)

    return two.status === 'open' ? runClockFine(1) : two
  },
})
