// THE WORST REGISTER NEVER WRAPS (E-FRC-0286, OPEN-LGT-02; the route "the worst register never wraps" in
// routes/mind-whole-engine-techniques.md, section "Q · no free parameters"). The husk light's split rho = f / s is
// undecided between the average reading 0.4613818 (E-FRC-0262) and the worst-register reading 0.4146386 (E-FRC-0269).
// The route: the split at which the most-filled register just stays inside its range is an integer condition, not an
// energy, so count wraps per register class at both splits on the carried light; killed if both splits wrap equally.
//
// WHAT IS RUN.
//  THE CARRIED LIGHT WITH A SEAM ON EACH SIDE (code/measure/split-wraps). E-FRC-0265 showed the trit rule's own light
//  has a seam on the magnetic side only (|e| ran past D on 65 percent of link-beats), and at fixed kappa its split is
//  a change of units (E-FRC-0276): with no electric seam the split cannot enter. So the light run here is the husk
//  light of E-FRC-0262 (9 links a dock, w = 1 on the 3 axes and 2 on the 6 face diagonals; 20 triangles a dock, n_P =
//  1 on 8 and 2 on 12) with BOTH shares carried as integers and BOTH registers read balanced in -D .. D: the drift x'
//  = x + s e and the force e' = e - f C^T N B, s = c / q and f = r / q, each paid through a remainder counter (first
//  form, "carry, never round", E-FRC-0214), B = C W x read modulo N = 2D + 1, e kept balanced modulo N. This is the
//  classical counterpart of E-FRC-0269's quantum light, where one modulus reaches every register. It is a bijection
//  of the integer state and keeps the divergence of e modulo N.
//  THE STATE. Side-8 husk torus (the route's box: 4,608 links, 10,240 triangles), D = 16 (N = 33), kappa = s f = 1 / N
//  exactly (E-FRC-0282 point 2: the trit light's kappa = 2 / N on M_h is 1 / N in these variables; kappa lambda_max =
//  32/33). The start is the Gibbs state of the leapfrog's own conserved quadratic form at temperature T (per mode the
//  covariance T M^(-1), M = [[f lambda, f lambda s / 2], [f lambda s / 2, s]]), drawn with Weyl normals per momentum
//  of the box and rounded to integers. T is fixed by the worst-register split: the axis links' model variance there
//  puts the seam D + 1/2 at z = 3 and at z = 4 standard deviations (two temperatures). The same T and the same Weyl
//  stream (1) at every split, so the splits are compared on paired starts. 16,000 beats per run.
//  THE COUNT. A register wraps when its unwrapped new value leaves -D .. D: a link's e at the kick, a triangle's B at
//  the drift (the angle x itself is bookkeeping, E-FRC-0265). Wraps are counted per class: axis links, diagonal
//  links, n_P = 1 triangles, n_P = 2 triangles, per register and beat. THE CONDITION, stated: at a fixed temperature
//  the split at which the most-wrapping link class and the most-wrapping triangle class wrap at one rate, R(rho) =
//  max(link class rates) / max(triangle class rates) = 1; on each side of it one side's worst register wraps first.
//  rho* is read by linear interpolation of ln R in ln rho over the scan rho_j = 0.4146386 x 1.1127^(j/2), j = -3 .. 4
//  (each realised as the carried split nearest it with kappa = 1 / N exact, m <= 3000).
//
// DERIVED BEFORE THE GATE RUN.
//  1. THE FILLS. At fixed T and kappa a link's variance is (T / s) a_h and a triangle's (T / f) b_t, so links grow as
//     rho^(1/2) and triangles fall as rho^(-1/2) (s = (kappa / rho)^(1/2), f = (kappa rho)^(1/2)). Where wraps are rare
//     the wrap rate is a Gaussian tail, exp(-(D + 1/2)^2 / (2 sigma^2)) times a prefactor set by the lag-one
//     correlation, so R = 1 sits where the most-filled link class and the most-filled triangle class have nearly
//     equal variance: the worst-register balance (axis against n_P = 1), moved only by the prefactors' ratio over
//     z^2 / 2. As T falls (z grows) rho* tends to that balance exactly. So THE CONDITION IS THE WORST-REGISTER READING
//     RESTATED IN INTEGERS: a min-max of the fills. Nothing in it reads the average fill, and no wrap condition does
//     (an average of wrap rates is dominated by the worst class).
//  2. ON THIS BOX. The fills here are the leapfrog's (each mode weighted by 1 / (1 - kappa lambda / 4)) on the
//     side-8 grid, not E-FRC-0262's continuous-time, infinite-grid ones. Their balances, computed by the model: axis
//     0.98425, diagonal 0.52836 (per T / s); n_P = 1 0.40126, n_P = 2 0.25345 (per T / f); worst-register balance
//     0.40769, average 0.45946 (1.7 and 0.4 percent below 0.4146386 and 0.4613818). Lag-one correlations: axis 0.7036,
//     diagonal 0.7289, n_P = 1 0.7323, n_P = 2 0.7149.
//  3. THE GAUSSIAN WRAP MODEL (bivariate normal per class, variance and lag-one correlation from point 2, seam at
//     D + 1/2): rho* = 0.40497 at z = 3 and 0.40669 at z = 4; R(0.4146386) = 1.118 and 1.176, R(0.4613818) = 1.854 and
//     2.874. So the condition is predicted to separate the two candidates (ln R moves by 0.51 and 0.89 between them)
//     and to pick the worst-register side, landing 2.3 and 1.9 percent below 0.4146386, at the box's own worst-
//     register balance. The axis links and the n_P = 1 triangles carry the worst wraps at every split scanned; the
//     diagonal links and n_P = 2 triangles wrap 16 to 1,300 times less.
//  4. WHAT A PASS WOULD AND WOULD NOT MEAN: by point 1, the condition picks the worst register because it IS the
//     worst-register statistic; it does not show that the light must keep its most-filled register inside its range,
//     which is the physical premise the route adds. The route can fail only if the carried light's wraps do not
//     follow its fills (non-Gaussian seams, heating by the carries) so that both splits wrap alike.
//
// PROBES BEFORE THE GATES, DISCLOSED. tmp/sw-probe1.ts (tmp/sw-probe1.log): the box built from husk-balance's symbol
// equals the trit bulk's side-8 husk triangles (10,240, with n_P); the Gaussian model of points 2 and 3 (every number
// there is from this probe, before any gate was written); the carried splits chosen (0.4144620 = 5577 / 13456 at q =
// 49764 and 0.4616719 = 1331 / 2883 at q = 11253; the null control's second representations 0.4148485 and 0.4609091);
// timing (the Gibbs start 0.44 s, 500 beats 0.49 s). No wrap of the carried light was counted or printed before the
// gate run.
//
// HYPOTHESES AND GATES, fixed before the gate run, never moved.
//  I1 INSTRUMENT: (a) the side-8 box built from the symbol has exactly the trit bulk's husk triangles and n_P (the
//     Gibbs modes are this box's modes); (b) from the z = 3 start at both candidate splits, 100 beats forward and 100
//     inverse return every register and counter exactly, and after the forward beats B equals bal(C W x); (c) the
//     divergence of e modulo N is unchanged at every dock at every beat of every husk run; (d) on every husk run the
//     measured class variances (over all beats) are within 10 percent of the model's (T / s) a_h + 1/12 on links and
//     (T / f) b_t + sum w^2 / 12 on triangles (the rounding of the start).
//  C1 CONTROL, the instrument reads equal wraps where the two sides are alike: the massless ring (E-FRC-0236's closed
//     ladder: one link class, one plaquette class, 4,096 squares, B_p = x_p - x_(p+1)), whose link and plaquette
//     registers have identical Gibbs statistics at rho = 1. At the carried split nearest 1, R is within [0.8, 1.25]
//     at both temperatures (z fixed by the ring's own link variance at rho = 1), and at the split nearest 1.1127, R >=
//     1.3 at both (the other outcome).
//  C0 NULL SPREAD (read, enters P1): the average split in its second representation with Weyl stream 2; delta(z) =
//     |ln R(second) - ln R(first)|.
//  G1 THE DERIVATION (point 3): (i) at both candidate splits and both temperatures, every class with at least 100
//     wraps has a measured rate within a factor 1.5 of the bivariate-Gaussian crossing from its own measured variance
//     and lag-one correlation; (ii) the measured rho* is within 3 percent of the model's at each z.
//  H1 THE ROUTE: at both temperatures R crosses 1 exactly once on the scan, at a rho* on the worst-register side of
//     the geometric midpoint 0.43737 (nearer 0.4146386 than 0.4613818 in ln), and the largest class wrap rate at the
//     worst-register split is below the one at the average split.
//  P1 THE FALSIFIER (the route's kill): at either temperature |ln R(0.4613818) - ln R(0.4146386)| <= max(0.05,
//     3 delta(z)): both splits wrap alike.
// READ: per class wrap rates, variances and lag-one correlations at every split; R and the largest class rate along
// the scan (the min-max split of the scan); the first and second halves' axis-link rates (heating by the carries);
// wraps per register class in the trit-rule sense of E-FRC-0265 (fraction of link-beats past the seam is 0 by
// construction here).
// VERDICT: fail if P1 fires or I1 or C1 fails; pass if I1, C1, G1 and H1 hold and P1 does not; partial otherwise.
//
// WHAT THIS CAN AND CANNOT SHOW. Exact: the carried light's integer dynamics (a bijection, Gauss modulo N) and its
// wrap counts on one Weyl start per temperature. Floats: the Gibbs start before rounding, the model and the Gaussian
// crossing integrals. It can show whether the integer condition separates the two candidates on the classical
// carried light with both seams, and which one it lies nearer. It cannot show that the light's split is fixed by the
// condition (point 4), it does not run the quantum light (OPEN-LGT-12), the start is one quasi-random Gibbs draw per
// temperature, and its rho* is the side-8, kappa = 1/33 box's, not the infinite husk's.
//
// Depth L2: the model's light run as integers with counted wraps, with a float Gibbs start and a Gaussian model.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { huskLight, type LightSymbol } from '@/code/measure/husk-balance'
import { buildTritBulk, TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import {
  boxModes,
  buildBox,
  carriedBeat,
  carriedFrom,
  carriedInverseBeat,
  carriedSplit,
  copyCarried,
  crossing,
  divergence,
  emptyTally,
  fieldOf,
  gibbsFields,
  gibbsModel,
  plaquetteKeys,
  sameCarried,
  type Box,
  type BoxMode,
  type CarriedSplit,
  type GibbsModel,
  type Tally,
} from '@/code/measure/split-wraps'

const RHO_AVERAGE = 0.4613818
const RHO_WORST = 0.4146386
const MIDPOINT = Math.sqrt(RHO_AVERAGE * RHO_WORST)
const DEPTH = 16
const MODULUS = 2 * DEPTH + 1
const KAPPA = 1 / MODULUS
const SIDE = 8
const BEATS = 16000
const M_MAX = 3000
const ZS = [3, 4]
const SCAN = Array.from(
  { length: 8 },
  (_, i) => RHO_WORST * (RHO_AVERAGE / RHO_WORST) ** ((i - 3) / 2),
)
const RING_SIDE = 4096
const MODEL_RHO_STAR: Record<number, number> = { 3: 0.40497, 4: 0.40669 }

type ClassRead = {
  rate: number
  variance: number
  corr: number
  wraps: number
}

type Run = {
  rho: number
  classes: Record<string, ClassRead>
  linkMax: number
  plaqMax: number
  R: number
  gauss: boolean
  firstAxis: number
  secondAxis: number
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((a, b) => a + b, 0) / xs.length

function classesOf(
  box: Box,
  light: LightSymbol,
): { links: Record<string, number[]>; plaqs: Record<string, number[]> } {
  if (box.linkTypes === 1) {
    return { links: { link: [0] }, plaqs: { plaquette: [0] } }
  }

  const types = (n: number): number[] =>
    light.plaquettes.map((p, t) => (p.n === n ? t : -1)).filter(t => t >= 0)

  return {
    links: { axis: [0, 1, 2], diagonal: [3, 4, 5, 6, 7, 8] },
    plaqs: { n1: types(1), n2: types(2) },
  }
}

function readTally(
  box: Box,
  light: LightSymbol,
  tally: Tally,
): Record<string, ClassRead> {
  const { links, plaqs } = classesOf(box, light)
  const out: Record<string, ClassRead> = {}
  const per = box.docks * tally.beats

  for (const [name, idx] of Object.entries(links)) {
    const wraps = idx.reduce((a, h) => a + tally.linkWraps[h]!, 0)
    const sq = idx.reduce((a, h) => a + tally.linkSq[h]!, 0)
    const lag = idx.reduce((a, h) => a + tally.linkLag[h]!, 0)

    out[name] = {
      rate: wraps / (idx.length * per),
      variance: sq / (idx.length * per),
      corr: lag / sq,
      wraps,
    }
  }

  for (const [name, idx] of Object.entries(plaqs)) {
    const wraps = idx.reduce((a, t) => a + tally.plaqWraps[t]!, 0)
    const sq = idx.reduce((a, t) => a + tally.plaqSq[t]!, 0)
    const lag = idx.reduce((a, t) => a + tally.plaqLag[t]!, 0)

    out[name] = {
      rate: wraps / (idx.length * per),
      variance: sq / (idx.length * per),
      corr: lag / sq,
      wraps,
    }
  }

  return out
}

function addTally(a: Tally, b: Tally): Tally {
  const sum = (x: Float64Array, y: Float64Array): Float64Array =>
    Float64Array.from(x, (v, i) => v + y[i]!)

  return {
    linkWraps: sum(a.linkWraps, b.linkWraps),
    plaqWraps: sum(a.plaqWraps, b.plaqWraps),
    linkSq: sum(a.linkSq, b.linkSq),
    linkLag: sum(a.linkLag, b.linkLag),
    plaqSq: sum(a.plaqSq, b.plaqSq),
    plaqLag: sum(a.plaqLag, b.plaqLag),
    beats: a.beats + b.beats,
  }
}

function runLight(input: {
  box: Box
  light: LightSymbol
  modes: readonly BoxMode[]
  split: CarriedSplit
  T: number
  stream: number
  beats: number
  checkGauss: boolean
}): Run {
  const { box, light, modes, split, T, stream, beats } = input
  const s = split.c / split.q
  const f = split.r / split.q
  const state = carriedFrom(
    box,
    DEPTH,
    split,
    gibbsFields(box, modes, { s, f }, T, stream),
  )
  const div0 = input.checkGauss ? divergence(state) : undefined
  const first = emptyTally(box)
  const second = emptyTally(box)

  let gauss = true

  for (let t = 0; t < beats; t++) {
    carriedBeat(state, t < beats / 2 ? first : second)

    if (div0) {
      const div = divergence(state)

      gauss &&= div.every((v, i) => v === div0[i])
    }
  }

  const classes = readTally(box, light, addTally(first, second))
  const firstRead = readTally(box, light, first)
  const secondRead = readTally(box, light, second)
  const { links, plaqs } = classesOf(box, light)
  const linkMax = Math.max(...Object.keys(links).map(k => classes[k]!.rate))
  const plaqMax = Math.max(...Object.keys(plaqs).map(k => classes[k]!.rate))
  const hot = Object.keys(links)[0]!

  return {
    rho: split.r / split.c,
    classes,
    linkMax,
    plaqMax,
    R: linkMax / plaqMax,
    gauss,
    firstAxis: firstRead[hot]!.rate,
    secondAxis: secondRead[hot]!.rate,
  }
}

// the model's class variances at a split, with the start's rounding
function modelVariances(
  box: Box,
  light: LightSymbol,
  model: GibbsModel,
  split: CarriedSplit,
  T: number,
): Record<string, number> {
  const s = split.c / split.q
  const f = split.r / split.q
  const { links, plaqs } = classesOf(box, light)
  const out: Record<string, number> = {}

  for (const [name, idx] of Object.entries(links)) {
    out[name] = mean(idx.map(h => (T / s) * model.linkVar[h]!)) + 1 / 12
  }

  for (const [name, idx] of Object.entries(plaqs)) {
    out[name] = mean(
      idx.map(t => {
        const rounding =
          light.plaquettes[t]!.links.reduce(
            (a, x) => a + light.linkWeights[x.link]! ** 2,
            0,
          ) / 12

        return (T / f) * model.plaqVar[t]! + rounding
      }),
    )
  }

  return out
}

// the crossing of ln R = 0 along the scan (linear in ln rho), NaN unless exactly one sign change
function crossingOf(runs: readonly Run[]): number {
  const sorted = [...runs].sort((a, b) => a.rho - b.rho)
  const changes: number[] = []

  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1]!
    const b = sorted[i]!
    const la = Math.log(a.R)
    const lb = Math.log(b.R)

    if (la === 0) {
      changes.push(a.rho)
    } else if (la * lb < 0) {
      const t = la / (la - lb)

      changes.push(Math.exp(Math.log(a.rho) + t * Math.log(b.rho / a.rho)))
    }
  }

  return changes.length === 1 ? changes[0]! : Number.NaN
}

export function splitWrapsRun(): Verdict {
  const started = Date.now()
  const metrics: Record<string, number> = {}
  const notes: string[] = []

  // ---- the husk box and its modes
  const husk = huskLight()
  const box = buildBox(husk.light, SIDE, TRIT_HUSK_VECTORS)
  const bulk = buildTritBulk({ side: SIDE, depth: 2 })
  const reference: string[] = []

  for (let p = 0; p < bulk.huskTriangles; p++) {
    const e = [0, 1, 2]
      .map(
        j =>
          [bulk.huskTriLinks[p * 3 + j]!, bulk.huskTriSigns[p * 3 + j]!] as [
            number,
            number,
          ],
      )
      .sort((a, b) => a[0] - b[0])
    const o = e[0]![1]

    reference.push(
      `${e.map(([l, s]) => `${l}:${s * o}`).join(',')}|${bulk.multiplicity[p]}`,
    )
  }

  reference.sort()

  const keys = plaquetteKeys(box)
  const i1a =
    keys.length === reference.length && keys.every((k, i) => k === reference[i])

  metrics.boxTriangles = keys.length
  metrics.gateI1a = i1a ? 1 : 0

  const modes = boxModes(husk.light, SIDE)
  const model = gibbsModel(husk.light, modes, SIDE, KAPPA)
  const axisModel = mean(model.linkVar.slice(0, 3))
  const temperature = (z: number): number =>
    (((DEPTH + 0.5) / z) ** 2 * Math.sqrt(KAPPA / RHO_WORST)) / axisModel

  metrics.modelAxis = axisModel
  metrics.modelDiagonal = mean(model.linkVar.slice(3))

  // ---- the splits
  const scan = SCAN.map(rho => carriedSplit(MODULUS, rho, M_MAX))
  const worst = scan[3]!
  const average = scan[5]!
  const averageTwo = carriedSplit(MODULUS, RHO_AVERAGE, M_MAX, [average])

  scan.forEach((sp, j) => (metrics[`scanRho${j - 3}`] = sp.rho))
  metrics.nullRho = averageTwo.rho

  // ---- I1b: reversibility at both candidate splits, z = 3
  let i1b = true

  for (const sp of [worst, average]) {
    const s = sp.c / sp.q
    const f = sp.r / sp.q
    const start = carriedFrom(
      box,
      DEPTH,
      sp,
      gibbsFields(box, modes, { s, f }, temperature(3), 1),
    )
    const state = copyCarried(start)

    for (let t = 0; t < 100; t++) {
      carriedBeat(state)
    }

    const B = fieldOf(box, state.x, MODULUS)
    const fieldOk = B.every((v, i) => v === state.B[i])

    for (let t = 0; t < 100; t++) {
      carriedInverseBeat(state)
    }

    const back = sameCarried(state, start)

    metrics[`reversible_${sp === worst ? 'worst' : 'average'}`] = back ? 1 : 0
    metrics[`fieldConsistent_${sp === worst ? 'worst' : 'average'}`] = fieldOk
      ? 1
      : 0
    i1b &&= back && fieldOk
  }

  metrics.gateI1b = i1b ? 1 : 0

  // ---- the husk runs
  let i1c = true
  let i1d = true
  let g1 = true
  let h1 = true
  let p1 = false
  const scanRuns: Record<number, Run[]> = {}

  for (const z of ZS) {
    const T = temperature(z)
    const runs: Run[] = []

    metrics[`temperatureZ${z}`] = T

    scan.forEach((sp, j) => {
      const run = runLight({
        box,
        light: husk.light,
        modes,
        split: sp,
        T,
        stream: 1,
        beats: BEATS,
        checkGauss: true,
      })
      const tag = `z${z}_j${j - 3}`
      const expected = modelVariances(box, husk.light, model, sp, T)

      i1c &&= run.gauss

      for (const [name, c] of Object.entries(run.classes)) {
        metrics[`${tag}_${name}Rate`] = c.rate
        metrics[`${tag}_${name}Wraps`] = c.wraps
        metrics[`${tag}_${name}Var`] = c.variance
        metrics[`${tag}_${name}VarModel`] = expected[name]!
        metrics[`${tag}_${name}Corr`] = c.corr

        const ratio = c.variance / expected[name]!

        i1d &&= ratio >= 0.9 && ratio <= 1.1
      }

      metrics[`${tag}_R`] = run.R
      metrics[`${tag}_worstRate`] = Math.max(run.linkMax, run.plaqMax)
      metrics[`${tag}_axisFirstHalf`] = run.firstAxis
      metrics[`${tag}_axisSecondHalf`] = run.secondAxis
      runs.push(run)

      // G1 (i) at the candidate splits
      if (sp === worst || sp === average) {
        for (const [name, c] of Object.entries(run.classes)) {
          if (c.wraps < 100) {
            continue
          }

          const predicted = crossing(c.variance, c.corr, DEPTH)
          const ratio = c.rate / predicted

          metrics[`${tag}_${name}GaussRatio`] = ratio
          g1 &&= ratio >= 1 / 1.5 && ratio <= 1.5
        }
      }
    })

    scanRuns[z] = runs

    const rhoStar = crossingOf(runs)

    metrics[`rhoStarZ${z}`] = rhoStar
    g1 &&=
      Number.isFinite(rhoStar) &&
      Math.abs(rhoStar / MODEL_RHO_STAR[z]! - 1) <= 0.03

    const runWorst = runs[3]!
    const runAverage = runs[5]!
    const worstMaxW = Math.max(runWorst.linkMax, runWorst.plaqMax)
    const worstMaxA = Math.max(runAverage.linkMax, runAverage.plaqMax)

    h1 &&=
      Number.isFinite(rhoStar) &&
      rhoStar < MIDPOINT &&
      worstMaxW < worstMaxA

    // C0 null
    const nullRun = runLight({
      box,
      light: husk.light,
      modes,
      split: averageTwo,
      T,
      stream: 2,
      beats: BEATS,
      checkGauss: true,
    })

    i1c &&= nullRun.gauss

    const delta = Math.abs(Math.log(nullRun.R) - Math.log(runAverage.R))
    const separation = Math.abs(Math.log(runAverage.R) - Math.log(runWorst.R))

    metrics[`nullRZ${z}`] = nullRun.R
    metrics[`nullDeltaZ${z}`] = delta
    metrics[`separationZ${z}`] = separation
    p1 ||= separation <= Math.max(0.05, 3 * delta)

    // the min-max split of the scan
    const worstRates = runs.map(r => Math.max(r.linkMax, r.plaqMax))
    const best = worstRates.indexOf(Math.min(...worstRates))

    metrics[`minMaxRhoZ${z}`] = runs[best]!.rho
    notes.push(
      `z ${z}: R along the scan ${runs.map(r => `${r.rho.toFixed(4)}: ${r.R.toFixed(3)}`).join(', ')}; rho* ${rhoStar.toFixed(5)} (model ${MODEL_RHO_STAR[z]}); worst class rate ${worstMaxW.toExponential(3)} at 0.4146 against ${worstMaxA.toExponential(3)} at 0.4614; null R ${nullRun.R.toFixed(3)} (delta ${delta.toFixed(3)}), separation ${separation.toFixed(3)}`,
    )
  }

  metrics.gateI1c = i1c ? 1 : 0
  metrics.gateI1d = i1d ? 1 : 0

  // ---- C1: the ring
  const ring: LightSymbol = {
    dims: 1,
    linkWeights: [1],
    plaquettes: [
      {
        n: 1,
        links: [
          { link: 0, sign: 1, offset: [0] },
          { link: 0, sign: -1, offset: [1] },
        ],
      },
    ],
  }
  const ringBox = buildBox(ring, RING_SIDE, [[0]])
  const ringModes = boxModes(ring, RING_SIDE)
  const ringModel = gibbsModel(ring, ringModes, RING_SIDE, KAPPA)
  const ringOne = carriedSplit(MODULUS, 1, M_MAX)
  const ringOff = carriedSplit(MODULUS, RHO_AVERAGE / RHO_WORST, M_MAX)

  let c1 = true

  metrics.ringModelLink = ringModel.linkVar[0]!
  metrics.ringModelPlaquette = ringModel.plaqVar[0]!
  metrics.ringRhoOne = ringOne.rho
  metrics.ringRhoOff = ringOff.rho

  for (const z of ZS) {
    const T =
      (((DEPTH + 0.5) / z) ** 2 * Math.sqrt(KAPPA)) / ringModel.linkVar[0]!

    for (const [tag, sp] of [
      ['one', ringOne],
      ['off', ringOff],
    ] as const) {
      const run = runLight({
        box: ringBox,
        light: ring,
        modes: ringModes,
        split: sp,
        T,
        stream: 1,
        beats: BEATS,
        checkGauss: false,
      })

      metrics[`ring_z${z}_${tag}_R`] = run.R
      metrics[`ring_z${z}_${tag}_linkRate`] = run.classes.link!.rate
      metrics[`ring_z${z}_${tag}_plaquetteRate`] = run.classes.plaquette!.rate
      c1 &&=
        tag === 'one' ? run.R >= 0.8 && run.R <= 1.25 : run.R >= 1.3
    }
  }

  metrics.gateC1 = c1 ? 1 : 0

  const i1 = i1a && i1b && i1c && i1d
  const gates = { I1: i1, C1: c1, G1: g1, H1: h1, P1: p1 }

  for (const [k, v] of Object.entries(gates)) {
    metrics[`gate${k}`] = v ? 1 : 0
  }

  metrics.seconds = (Date.now() - started) / 1000

  const status =
    p1 || !i1 || !c1 ? 'fail' : g1 && h1 ? 'pass' : 'partial'

  const r = (z: number, j: number): string =>
    (metrics[`z${z}_j${j}_R`] ?? Number.NaN).toFixed(3)

  return verdict({
    status,
    claim: `the worst register never wraps, counted on the carried husk light with a seam on each side (side 8, D = 16, kappa = 1/33, Gibbs starts, ${BEATS} beats): R = (worst link class rate) / (worst triangle class rate) is ${r(3, 0)} at 0.4146 and ${r(3, 2)} at 0.4614 (z = 3), ${r(4, 0)} and ${r(4, 2)} (z = 4); it crosses 1 at rho* = ${metrics.rhoStarZ3!.toFixed(4)} and ${metrics.rhoStarZ4!.toFixed(4)} (Gaussian model ${MODEL_RHO_STAR[3]} and ${MODEL_RHO_STAR[4]}, the box's worst-register fill balance 0.4077); null spread ${metrics.nullDeltaZ3!.toFixed(3)} and ${metrics.nullDeltaZ4!.toFixed(3)} in ln R against separations ${metrics.separationZ3!.toFixed(3)} and ${metrics.separationZ4!.toFixed(3)}; ring control R ${metrics.ring_z3_one_R!.toFixed(3)}, ${metrics.ring_z4_one_R!.toFixed(3)} at rho = 1 and ${metrics.ring_z3_off_R!.toFixed(3)}, ${metrics.ring_z4_off_R!.toFixed(3)} at 1.1127`,
    metrics,
    control: {
      ringROneZ3: metrics.ring_z3_one_R!,
      ringROffZ3: metrics.ring_z3_off_R!,
      nullDeltaZ3: metrics.nullDeltaZ3!,
      nullDeltaZ4: metrics.nullDeltaZ4!,
    },
    notes: `L2. Gates ${JSON.stringify(gates)} (I1 a ${i1a}, b ${i1b}, c ${i1c}, d ${i1d}). ${notes.join('. ')}. By derivation the condition is the worst-register statistic restated in integers, so a pass picks 0.4146 among the two without showing the light must obey it.`,
  })
}

export default experiment({
  id: 'gauge/split-wraps',
  code: 'E-FRC-0286',
  title:
    'the worst register never wraps: wraps per register class on the carried husk light with a seam on each side, at the average and the worst-register splits',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return splitWrapsRun()
  },
})
