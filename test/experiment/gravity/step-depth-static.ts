// The bounded depth field, static (E-GRV-0090): can the radion's gravity (E-GRV-0079) be held with no unbounded register
// anywhere, the depth FOUND by summing steps rather than stored (note/research/vibe/roadmap/discrete-gravity.md, 5c)?
//
// THE CONSTRUCTION: code/rule/step-depth (its header gives every design choice and what was rejected), measured by
// code/measure/step-depth. Per husk link: a line trit f (content's lines of force, Gauss exact) and a step F (the depth's
// gradient, a trit plus three balanced base-297 digits, |F| < 3/2). Per husk dock: a rate v (the same shape) and a
// remainder R in -148 .. 148. No depth register and no content register: content is div f, depth is the sum of F / g.
// The beat is the radion's leapfrog in these variables, kappa = 2 / 297 at D 16 (waves at the light's c(D)). A STAND-IN,
// added by hand, as the radion is.
//
// DISCLOSED PROBE (tmp/bound-probe1.log, side 8, instrument only, no gate below read): Gauss 0 off, curl 0, the depth
// found by summation equal to E-GRV-0079's integer radion's x to 5.6e-17 over 64 beats, reversal and a hop's reversal
// exact, covariant under x <-> y.
//
// GATES, fixed before the first run of this file. D 16, three digits, side 16, 1024 beats a run (E-GRV-0079's):
//  S1 Gauss and summation: in every run, lines out minus lines in equals the content on every dock after every beat
//     (0 off), and the depth found by summing F / g is the same along every path (curl 0 on every check, every 64 beats
//     and the last).
//  S2 bounded: every register within its window (F and v: a trit and three digits; R in -H .. H), and no register ever
//     had to wrap in the S1 and S3 runs (the unwrapped value never left the trit's window): 0 wraps; every run reverses
//     bit for bit.
//  S3 attraction by the radion's energy (depth by summation): two content-4 sources at r = 1 .. 7 through E-GRV-0079's
//     six configurations: W rises with r at every step (they fall together); with c0 - k / r - b r^2 fitted on r = 2 .. 6,
//     W - c0 < 0 at every r (negative against its infinite-separation value, rising toward it); W equals the torus Green's
//     16 (pi / D)(G(0) - G(r)) to 1e-3 relative at every r, equals E-GRV-0079's recorded W (0.126582 .. 0.158656) to 1e-5,
//     and k is within 2 percent of sa sb / (24 D) = 0.041667 and within 1e-4 of E-GRV-0079's 0.0418217. CONTROL: the same
//     six configurations with the energy the lines' step count alone (tension, 1/2 sum f^2) must miss the Green's
//     prediction by more than 10 percent at some r (tmp/step-pair-probe: tension alone is not the radion's energy).
//  S4 the saturated core: on side 24 (sinks the M farthest docks, one unit each), M = 100, 400, 1600 units placed one at
//     a time at the dock nearest the center that can still send a line to a sink (code/measure/step-depth compressLump):
//     the densest lump one line a link allows. The rule's own count: C(r), the links crossing the sphere of radius r;
//     the prediction r_pred, the smallest dock radius with C(r) >= M (continuum sqrt(M / (4 pi sigma)), sigma = (3 + 6
//     sqrt 2) / 2 = 5.743 crossing links a unit area). Gates: every unit placed with Gauss exact; the content inside every
//     sphere is at most C(r) (content bounded by area); the lump's radius (its farthest content) within 1 dock of r_pred;
//     and some sphere of radius >= 1 is SATURATED (every crossing link carries an outward line). CONTROL: two lines a
//     link (capacity 2) gives a lump within 1 dock of its own prediction (2 C(r) >= M) and smaller than the trit's at
//     M = 1600.
// REPORTED (not gated): the dynamical horizon: the compressed M = 400 lump on side 16 run 512 beats on the trit window
// and on a wide window (2187 whole steps: the linear radion), side by side: where the demanded slope passes 3/2, whether
// and where the trit steps wrap (slip), and the run's reversal through its wraps.
// Verdict: pass if S1 to S4 hold with their controls; partial if a control fails; fail otherwise.
//
// FIRST RUN (tmp/grv90-run1.log, 174 s, the record): pass, no gate moved. S1: Gauss 0 off on 43,008 beat checks, curl 0
// on 672. S2: 0 wraps, largest step 0.461, largest rate 0.0168, every run reversed. S3: W = 0.126582, 0.145074,
// 0.151892, 0.155185, 0.157028, 0.158093, 0.158656 at r = 1 .. 7, E-GRV-0079's numbers to 2.7e-6 (its six-digit
// record) and the torus Green's to 1.3e-10; k = 0.0418217, E-GRV-0079's to 1.0e-7. The control's tension alone reads
// -136, -128 alternating with the parity of r (the six-configuration combination of an L1 count), no fall at all. S4:
// the densest lump has radius 1.41, 2.24, 4.69 against the crossing count's 1.73, 2.45, 4.69 (continuum 1.18, 2.35,
// 4.71), and inside it the content EQUALS the crossing links on every sphere (18, 90, 234, 282, 498, ... 1530 for M =
// 1600): the lump is saturated to 1.41, 2.24, 4.58, content bounded by area and filling it. Two lines a link: 1.00, 1.73,
// 3.32 against 1.00, 1.73, 3.46. REPORTED horizon (M = 400, side 16): the trit steps wrap from beat 5 (first at the
// center's links, 0.5), 125,296 step wraps and 494 rate wraps in 512 beats, out to 3.64, where the linear field's steps
// pass 3/2 out to 3.77 (largest 3.26); even its STATIC average passes 3/2 out to 2.69 (largest 2.05), beyond the lines'
// saturated sphere 2.24: the step window saturates before the lines do, because an axis link (weight 2) carries more
// flux than its share. The run reverses bit for bit through every wrap, but the energy climbs from 0 to 7,368 and the
// depth summed around a loop stops closing (found and local source terms 9.0 apart): the slipping shell is reversible
// and is not conservative. Title written after the run.
//
// Depth L2: a known construction (a massless scalar exchanged, written as a lattice flux with Gauss's law) run as an
// integer reversible rule, with a control that could fail. DETERMINISM: every start and source is placed; nothing is
// drawn. NOTHING MOVES: each value takes its new value by the rule.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fitPowers } from '@/code/measure/husk-coulomb'
import { huskGreenDifference } from '@/code/measure/trit-hop-light'
import { radionMesh } from '@/code/rule/trit-radion'
import { gaussOff, stepRule } from '@/code/rule/step-depth'
import { compressLump, CROSSING_DENSITY, distinctRadii, horizonRun, newRecord, pairStep, shells, torusDistance } from '@/code/measure/step-depth'

const DEPTH = 16
const LEVELS = 3
const SIDE = 16
const BEATS = 1024
const CONTENT = 4
const LIKE_R: readonly number[] = [1, 2, 3, 4, 5, 6, 7]
const FIT_R: readonly number[] = [2, 3, 4, 5, 6]
const RECORDED_0079_W: readonly number[] = [0.126582, 0.145074, 0.151892, 0.155185, 0.157028, 0.158093, 0.158656]
const RECORDED_0079_K = 0.0418217
const CORE_SIDE = 24
const CORE_M: readonly number[] = [100, 400, 1600]
const CORE_LIMIT = 9
const HORIZON_SIDE = 16
const HORIZON_M = 400
const HORIZON_BEATS = 512

type Core = { m: number; capacity: number; placed: boolean; gauss: number; bounded: boolean; rLump: number; rPred: number; rSat: number; continuum: number; profile: string; seconds: number }

function core(m: number, capacity: number): Core {
  const mesh = radionMesh([CORE_SIDE, CORE_SIDE, CORE_SIDE])
  const center = [CORE_SIDE / 2, CORE_SIDE / 2, CORE_SIDE / 2]
  const radii = distinctRadii(mesh, center, CORE_LIMIT)

  try {
    const lump = compressLump(mesh, center, m, capacity)
    const sh = shells(mesh, lump.line, lump.content, center, radii)
    let rLump = 0

    for (let y = 0; y < mesh.docks; y++) if (lump.content[y]! > 0) rLump = Math.max(rLump, torusDistance(mesh, y, center))

    const rPred = sh.find(s => capacity * s.crossing >= m)?.r ?? Infinity
    const saturated = sh.filter(s => s.r >= 1 && s.crossing > 0 && s.outward === capacity * s.crossing)
    const rSat = saturated.length > 0 ? Math.max(...saturated.map(s => s.r)) : 0

    return {
      m,
      capacity,
      placed: true,
      gauss: gaussOff(mesh, lump.line, lump.content),
      bounded: sh.every(s => s.inside <= capacity * s.crossing),
      rLump,
      rPred,
      rSat,
      continuum: Math.sqrt(m / (4 * Math.PI * CROSSING_DENSITY * capacity)),
      profile: sh
        .filter(s => s.r <= rLump + 1.5)
        .map(s => `${s.r.toFixed(2)}:${s.inside}/${s.outward}/${capacity * s.crossing}`)
        .join(' '),
      seconds: lump.seconds,
    }
  } catch {
    return { m, capacity, placed: false, gauss: -1, bounded: false, rLump: Infinity, rPred: Infinity, rSat: 0, continuum: 0, profile: '', seconds: 0 }
  }
}

export default experiment({
  id: 'gravity/step-depth-static',
  code: 'E-GRV-0090',
  title:
    "the radion's gravity fits in bounded registers with the depth found by summing steps, and one line a link bounds a lump's content by its area, pass: no depth or content stored, Gauss exact on 43,008 beat checks, the summed depth path independent, no register wraps, W = 0.1266 .. 0.1587 at r = 1 .. 7 rising (E-GRV-0079 to 2.7e-6, k = 0.0418217 to 1e-7) where tension alone gives -136, -128 with no fall; the densest lumps of 100, 400, 1600 units fill spheres whose content equals their crossing links, radius 1.41, 2.24, 4.69 against the count's 1.73, 2.45, 4.69; run as a field the M = 400 lump's steps pass 3/2 out to 3.6 and the reversible wrap (125,296 slips in 512 beats) keeps neither its energy (0 to 7,368) nor a single-valued depth",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const started = Date.now()
    const mesh = radionMesh([SIDE, SIDE, SIDE])
    const rule = stepRule(DEPTH, LEVELS)
    const record = newRecord()
    const pairs = LIKE_R.map(r => {
      const p = pairStep(mesh, rule, r, CONTENT, CONTENT, BEATS, record)

      console.error(`pair r ${r} ${(Date.now() - started) / 1000}s`)

      return p
    })
    const like = pairs.map(p => p.w)
    const tensionW = pairs.map(p => p.tensionW)
    const predicted = LIKE_R.map(r => CONTENT * CONTENT * (Math.PI / DEPTH) * huskGreenDifference(SIDE, [r, 0, 0]))
    const [c0, c1, c2] = fitPowers(FIT_R, FIT_R.map(r => like[LIKE_R.indexOf(r)]!), [1, -2]) as [number, number, number]
    const fitK = -c1
    const kWant = (CONTENT * CONTENT) / (24 * DEPTH)

    // S1, S2
    const s1 = record.gaussOff === 0 && record.curl === 0
    const wraps = record.wraps.fWraps + record.wraps.vWraps
    const s2 = wraps === 0 && record.maxStep < 1.5 && record.maxRate < 1.5 && record.maxRest <= rule.h && record.reversed

    // S3
    const rising = like.every((w, i) => i === 0 || w > like[i - 1]!)
    const below = like.every(w => w - c0 < 0)
    const agree = Math.max(...like.map((w, i) => Math.abs(w / predicted[i]! - 1)))
    const recorded = Math.max(...like.map((w, i) => Math.abs(w / RECORDED_0079_W[i]! - 1)))
    const kRecorded = Math.abs(fitK / RECORDED_0079_K - 1)
    const s3 = rising && below && agree <= 1e-3 && recorded <= 1e-5 && fitK > 0 && Math.abs(fitK / kWant - 1) <= 0.02 && kRecorded <= 1e-4
    const tensionMiss = Math.max(...tensionW.map((w, i) => Math.abs(w / predicted[i]! - 1)))
    const controlS3 = tensionMiss > 0.1

    // S4
    const trit = CORE_M.map(m => {
      const c = core(m, 1)

      console.error(`core M ${m} ${(Date.now() - started) / 1000}s`)

      return c
    })
    const two = CORE_M.map(m => core(m, 2))
    const s4 = trit.every(c => c.placed && c.gauss === 0 && c.bounded && Math.abs(c.rLump - c.rPred) <= 1 && c.rSat >= 1)
    const lastTrit = trit[trit.length - 1]!
    const lastTwo = two[two.length - 1]!
    const controlS4 = two.every(c => c.placed && c.gauss === 0 && c.bounded && Math.abs(c.rLump - c.rPred) <= 1) && lastTwo.rLump < lastTrit.rLump

    // the dynamical horizon (reported)
    const hz = horizonRun(HORIZON_SIDE, DEPTH, LEVELS, HORIZON_M, HORIZON_BEATS)

    console.error(`horizon ${(Date.now() - started) / 1000}s`)

    const hzCore = (() => {
      const m2 = radionMesh([HORIZON_SIDE, HORIZON_SIDE, HORIZON_SIDE])
      const center = [HORIZON_SIDE / 2, HORIZON_SIDE / 2, HORIZON_SIDE / 2]
      const lump = compressLump(m2, center, HORIZON_M, 1)
      const sh = shells(m2, lump.line, lump.content, center, distinctRadii(m2, center, 6))
      const sat = sh.filter(s => s.r >= 1 && s.crossing > 0 && s.outward === s.crossing)

      return sat.length > 0 ? Math.max(...sat.map(s => s.r)) : 0
    })()

    const status = !(controlS3 && controlS4) ? 'partial' : s1 && s2 && s3 && s4 ? 'pass' : 'fail'
    const f = (x: number): string => x.toPrecision(6)
    const e = (x: number): string => x.toExponential(2)
    const metrics: Record<string, number> = {
      gate_S1: s1 ? 1 : 0,
      gate_S2: s2 ? 1 : 0,
      gate_S3: s3 ? 1 : 0,
      gate_S4: s4 ? 1 : 0,
      control_S3: controlS3 ? 1 : 0,
      control_S4: controlS4 ? 1 : 0,
      depth: DEPTH,
      levels: LEVELS,
      runs: record.runs,
      beats: record.beats,
      gaussOff: record.gaussOff,
      gaussChecks: record.gaussChecks,
      curl: record.curl,
      curlChecks: record.curlChecks,
      wraps,
      maxStep: record.maxStep,
      maxRate: record.maxRate,
      maxRest: record.maxRest,
      fitK,
      kWant,
      fitC0: c0,
      fitB: -c2,
      agree,
      recorded0079: recorded,
      kRecorded0079: kRecorded,
      tensionMiss,
      horizonVWraps: hz.vWraps,
      horizonFWraps: hz.fWraps,
      horizonFirstWrap: hz.firstWrap,
      horizonFarthestWrap: hz.farthestWrap,
      horizonReversed: hz.reversed ? 1 : 0,
      horizonWideMax: hz.wideMax,
      horizonWideFarthestOver: hz.wideFarthestOver,
      horizonStaticMax: hz.staticMax,
      horizonStaticFarthestOver: hz.staticFarthestOver,
      horizonStaticFarthestHalf: hz.staticFarthestHalf,
      horizonLinesSaturated: hzCore,
      horizonEnergyEnd: hz.energyEnd,
      horizonSourceGap: hz.sourceGap,
      seconds: (Date.now() - started) / 1000,
    }

    LIKE_R.forEach((r, i) => {
      metrics[`W_r${r}`] = like[i]!
      metrics[`Wpredicted_r${r}`] = predicted[i]!
      metrics[`Wtension_r${r}`] = tensionW[i]!
    })
    trit.forEach(c => {
      metrics[`core_M${c.m}_rLump`] = c.rLump
      metrics[`core_M${c.m}_rPred`] = c.rPred
      metrics[`core_M${c.m}_rSat`] = c.rSat
      metrics[`core_M${c.m}_continuum`] = c.continuum
    })
    two.forEach(c => {
      metrics[`core2_M${c.m}_rLump`] = c.rLump
      metrics[`core2_M${c.m}_rPred`] = c.rPred
    })

    return verdict({
      status,
      claim: `the radion on bounded registers (a line trit and a step of a trit and ${LEVELS} base-${rule.q} digits per link, a rate and a remainder per dock, no depth stored, D ${DEPTH}): Gauss off on ${record.gaussOff} of ${record.gaussChecks} beat checks, curl ${record.curl} on ${record.curlChecks}, ${wraps} wraps, largest step ${f(record.maxStep)}; two content-4 sources have W(r) = ${like.map(f).join(', ')} at r = ${LIKE_R.join(', ')} (${rising ? 'rising' : 'NOT rising'}), the torus Green's to ${e(agree)}, E-GRV-0079's record to ${e(recorded)}, fit k = ${f(fitK)} (E-GRV-0079 ${RECORDED_0079_K}, sa sb / 24D ${f(kWant)}); tension alone gives ${tensionW.map(f).join(', ')} (misses by ${f(tensionMiss)}); the densest lump one line a link allows has radius ${trit.map(c => f(c.rLump)).join(', ')} for M = ${CORE_M.join(', ')} against the crossing count's ${trit.map(c => f(c.rPred)).join(', ')} (continuum ${trit.map(c => f(c.continuum)).join(', ')}), saturated spheres to ${trit.map(c => f(c.rSat)).join(', ')}; two lines a link: ${two.map(c => f(c.rLump)).join(', ')} against ${two.map(c => f(c.rPred)).join(', ')}; the M = ${HORIZON_M} lump run on the trit window wraps ${hz.fWraps} steps and ${hz.vWraps} rates (first at beat ${hz.firstWrap}, at link distances ${hz.firstWrapDistances.join(', ')}; farthest ${f(hz.farthestWrap)}), the linear field's steps pass 3/2 out to ${f(hz.wideFarthestOver)} (largest ${f(hz.wideMax)}; static largest ${f(hz.staticMax)}, past 3/4 out to ${f(hz.staticFarthestHalf)}), the lines saturate to ${f(hzCore)}, reversal ${hz.reversed}`,
      metrics,
      control: { tensionMiss, controlS3: controlS3 ? 1 : 0, controlS4: controlS4 ? 1 : 0 },
      notes: `L2. Gates S1 ${s1}, S2 ${s2}, S3 ${s3} (rising ${rising}, below c0 ${below}), S4 ${s4}; controls S3 ${controlS3}, S4 ${controlS4}. Fit on r = ${FIT_R.join(', ')}: c0 ${f(c0)}, k ${f(fitK)}, b ${e(-c2)}. Core profiles (r:inside/outward/capacity x crossing): ${trit.map(c => `M ${c.m} [${c.profile}] ${c.seconds.toFixed(1)} s`).join('; ')}. Capacity 2: ${two.map(c => `M ${c.m} rSat ${f(c.rSat)} [${c.profile}]`).join('; ')}. Horizon run: energy ${e(hz.energyStart)} to ${e(hz.energyEnd)}, found against local source ${e(hz.sourceGap)}, ${hz.seconds.toFixed(1)} s. Every run reverses: ${record.reversed}.`,
    })
  },
})
