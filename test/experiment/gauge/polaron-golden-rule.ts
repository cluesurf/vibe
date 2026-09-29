// Clean emission into the massless light in the polaron frame (E-FRC-0240): E-FRC-0237's STAND-IN atom beside a
// closed strip of 512 husk squares, run by the two-quantum restriction in the frames of E-FRC-0238 and held against
// the Debye-Waller-corrected golden rule; and the closed form that ties the split, the coupling and the column depth.
//
// DERIVED before the first run.
//   (1) the rate        In a frame gamma = lambda beta the Floquet golden rule is Gamma = 2 L |<g_r| M(k*) |e_r>|^2 / v_g
//                       at the frame's dressed gap (code/measure/polaron-frame framePrediction), every path through
//                       the dressed hop carrying the Debye-Waller factor e^(-W/2). Silbey-Harris (the part of the
//                       static field each mode can follow, W = 0.029 and 0.014 at N = 25, 49): Gamma_SH = 0.9840 and
//                       0.9913 of the bare golden rule. Lang-Firsov (the whole static field, W = 0.254 and 0.129, the
//                       slow modes' ln L included): 0.8526 and 0.9200. E-FRC-0237's lab restriction measured 0.860 and
//                       0.928, on Lang-Firsov's numbers, while leaking 15 and 7 percent of its norm
//   (2) the prediction  The dressing a mode can hold is the part it can follow (E-FRC-0239 V2 decides the sign on
//                       short rings); so the decay is predicted at Gamma_SH, not Lang-Firsov's, and the E-FRC-0237
//                       deficit is predicted to be an artifact of the leaking lab restriction
//   (3) the sector      In the Silbey-Harris frame the kick keeps sqrt K = 0.047 of its lab size 0.114 (N = 25) and
//                       the dressed hop drops ~ |b|^2 W^3 / 6 per beat: the norm should hold to well under 1 percent
//   (4) the closed form The harmonic reading of the rule is Kogut-Susskind's H = (A/2) sum e^2 + (B/2) sum theta^2 with
//                       A = 2 pi s / N, B = f N / (2 pi) (theta = 2 pi B_int / N, the square's angle), so the light
//                       speed is sqrt(A B) = sqrt(s f) = sqrt(kappa) and the lattice coupling is g_KS^2 = sqrt(A / B):
//                           alpha = g_KS^2 / (4 pi) = 1 / (2 N sqrt rho),    rho = f / s (the split)
//                       and the charge's coupling g = 4 pi c / M = 2 pi s / N = (2 pi / N) sqrt(2 / (N rho)). On the
//                       strip the long-wave golden rule is then Gamma -> 4 pi alpha d^2 omega, the 1D form of
//                       alpha omega^3 d^2. The column's Planck capacity (E-FRC-0230: the Bohr-Sommerfeld orbits inside
//                       the column's phase square) is n_cap = (pi / 4) N min(sqrt(rho / l), sqrt(l / rho)), l = links
//                       per square, so alpha n_cap = (pi / 8) min(1 / sqrt l, sqrt l / rho): at the balanced split
//                       (rho = l) coupling times capacity is pi / (8 sqrt l), the SAME at every depth. A PREDICTION ONLY:
//                       the relation fixes no N, and E-MTH-0024 (the E-MTH-0010 null at CODATA precision) admits no
//                       number-only identification of alpha, so no value of N is read off 1/137
//
// Gates, fixed before the first run (tmp/pol-derive.ts computed (1)'s numbers, formulas only, disclosed; no dynamics
// of this construction was run before this file):
// X1 the exponential: at N = 25 and 49 on L = 512 in the Silbey-Harris frame, ln P_e (lab frame) over beats
//    t in [1 / Gamma_SH, 4 / Gamma_SH] is linear with largest residual below 0.02, and the fitted rate is within 0.95
//    to 1.05 of Gamma_SH
// X2 the sector: the Silbey-Harris restriction's norm stays within 0.01 of 1 up to 4 / Gamma_SH at both N
// X3 the closed form: the strip golden rule (code/measure/few-quanta stripGoldenRule) at a gap of 1e-4 equals
//    4 pi alpha d^2 omega, alpha = 1 / (2 N sqrt rho), within 1e-3 at N = 25, 49, 121 (the realized integer splits)
// Reported: the Lang-Firsov and lab frames on the same fit (the lab frame through this file's code, a cross-check
//    of E-FRC-0237's 0.860 and 0.928); Gamma_SH / Gamma_GR; the intercepts; alpha, g and n_cap per N; husk first:
//    the strip is a line of husk squares and its light speed sqrt(kappa) becomes sqrt(2 kappa / 3) on the husk's own
//    axis (E-FRC-0235), whose coupling is not derived here.
// Status: pass if X1 to X3 pass; partial if X2 and X3 pass and X1's rate clause passes; fail otherwise.
// FIRST RUN 2026-09-26: fail (X1, X2), see notes: prediction (2) was wrong, the late-time floor is diagnosed.
//
// Depth L2: Wigner-Weisskopf decay of a STAND-IN atom into the model's massless light, two-quantum restriction in an
// exact frame; the closed form is L1.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  loopSplit,
  ringCurl,
  ringSpec,
  splitNear,
  type LoopSpec,
} from '@/code/rule/loop-ring'
import { atomBare } from '@/code/measure/quantum-ladder'
import {
  ringAtomSpec,
  stripGoldenRule,
} from '@/code/measure/few-quanta'
import {
  logFit,
  restrictedAtomRun,
  restrictedFrame,
} from '@/code/measure/polaron-runs'

const L = 512
const GATED = [25, 49]
const RESIDUAL = 0.02
const BAND = [0.95, 1.05] as const
const KEY = {
  lab: 'Lab',
  'lang-firsov': 'LF',
  'silbey-harris': 'SH',
} as const

const ladderShape = (spec: LoopSpec) => ({
  n: spec.n,
  plaquettes: spec.squares,
  root: spec.root,
  drift: spec.drift,
  force: spec.force,
  hop: spec.hop!,
})

export default experiment({
  id: 'gauge/polaron-golden-rule',
  code: 'E-FRC-0240',
  title:
    'clean emission into the massless light in the polaron frame: a STAND-IN atom beside a closed strip of 512 husk squares, two-quantum restriction in the Silbey-Harris frame, decays exponentially at the Debye-Waller-corrected golden rule with its norm held; and the split, the coupling and the column depth tie in alpha = 1 / (2 N sqrt rho), with coupling times Planck capacity the same at every depth',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const metrics: Record<string, number> = {}

    let x1 = true
    let x1rate = true
    let x2 = true

    for (const n of GATED) {
      const tag = `N${n}`
      const spec = ringAtomSpec(n, L)
      const { f, kappa } = loopSplit(spec)
      const bare = atomBare(ladderShape(spec))
      const g = (4 * Math.PI * spec.drift) / spec.root
      const gr = stripGoldenRule({
        n,
        f,
        kappa,
        g,
        dipole: bare.dipole,
        gap: bare.gap,
        curl: ringCurl,
        curlSlope: k => 2 * Math.sin(k),
      })

      metrics[`goldenRule${tag}`] = gr.rate
      metrics[`coupling${tag}`] = g

      for (const kind of [
        'silbey-harris',
        'lang-firsov',
        'lab',
      ] as const) {
        const key = KEY[kind]
        const choice = restrictedFrame(spec, bare.gap, kind)
        const rate = choice.prediction.rate
        const from = Math.ceil(1 / rate)
        const to = Math.floor(4 / rate)
        const run = restrictedAtomRun(
          choice,
          bare.excited,
          bare.excited,
          bare.ground,
          to,
        )
        const fit = logFit(run.population, from, to)

        let normWorst = 0

        for (let t = 0; t <= to; t++) {
          normWorst = Math.max(normWorst, Math.abs(run.norm[t]! - 1))
        }

        metrics[`predicted${key}${tag}`] = rate
        metrics[`predictedOverGolden${key}${tag}`] = rate / gr.rate
        metrics[`dressedGap${key}${tag}`] = choice.prediction.gap
        metrics[`W${key}${tag}`] = choice.frame.W
        metrics[`fitRate${key}${tag}`] = fit.rate
        metrics[`fitOverPredicted${key}${tag}`] = fit.rate / rate
        metrics[`fitOverGolden${key}${tag}`] = fit.rate / gr.rate
        metrics[`fitResidual${key}${tag}`] = fit.residual
        metrics[`fitIntercept${key}${tag}`] = Math.exp(fit.intercept)
        metrics[`normDrift${key}${tag}`] = normWorst
        metrics[`dropped${key}${tag}`] = run.dropped
        metrics[`fitFrom${key}${tag}`] = from
        metrics[`fitTo${key}${tag}`] = to

        if (kind === 'silbey-harris') {
          const ok =
            fit.rate / rate >= BAND[0] && fit.rate / rate <= BAND[1]

          x1 &&= ok && fit.residual < RESIDUAL
          x1rate &&= ok
          x2 &&= normWorst <= 0.01
        }
      }
    }

    // X3 and the closed form
    let x3 = true

    for (const n of [25, 49, 121]) {
      const tag = `N${n}`
      const split = splitNear(n, 1)
      const spec = ringSpec(n, L, split)
      const { s, f, kappa } = loopSplit(spec)
      const rho = f / s
      const alpha = 1 / (2 * n * Math.sqrt(rho))
      const g = (4 * Math.PI * spec.drift) / spec.root
      const d = 0.5
      const gap = 1e-4
      const gr = stripGoldenRule({
        n,
        f,
        kappa,
        g,
        dipole: d,
        gap,
        curl: ringCurl,
        curlSlope: k => 2 * Math.sin(k),
      })
      const ratio = gr.rate / (4 * Math.PI * alpha * d * d * gap)
      const capacity =
        (Math.PI / 4) * n * Math.min(Math.sqrt(rho), 1 / Math.sqrt(rho))

      metrics[`alpha${tag}`] = alpha
      metrics[`inverseAlpha${tag}`] = 1 / alpha
      metrics[`splitRatio${tag}`] = rho
      metrics[`couplingClosedForm${tag}`] =
        ((2 * Math.PI) / n) * Math.sqrt(2 / (n * rho))
      metrics[`couplingRule${tag}`] = g
      metrics[`longWaveRatio${tag}`] = ratio
      metrics[`planckCapacity${tag}`] = capacity
      metrics[`alphaTimesCapacity${tag}`] = alpha * capacity
      metrics[`huskLightSpeed${tag}`] = Math.sqrt((2 * kappa) / 3)
      metrics[`stripLightSpeed${tag}`] = Math.sqrt(kappa)
      metrics[`columnDepth${tag}`] = (n - 1) / 2
      x3 &&= Math.abs(ratio - 1) <= 1e-3
    }

    metrics.alphaCapacityBalanced = Math.PI / 8

    const gates = { X1: x1, X2: x2, X3: x3 }

    for (const [gate, ok] of Object.entries(gates)) {
      metrics[`gate${gate}`] = ok ? 1 : 0
    }

    const status =
      x1 && x2 && x3 ? 'pass' : x2 && x3 && x1rate ? 'partial' : 'fail'

    return verdict({
      status,
      claim: `husk strip of ${L} squares, STAND-IN atom, two-quantum restriction in the Silbey-Harris frame: P_e decays at ${metrics.fitOverPredictedSHN25!.toFixed(4)} and ${metrics.fitOverPredictedSHN49!.toFixed(4)} of the Debye-Waller-corrected golden rule (${metrics.predictedSHN25!.toFixed(5)}, ${metrics.predictedSHN49!.toFixed(5)} per beat at N = 25, 49; ${metrics.predictedOverGoldenSHN25!.toFixed(4)}, ${metrics.predictedOverGoldenSHN49!.toFixed(4)} of the bare rule), ln P_e linear over one to four lifetimes within ${metrics.fitResidualSHN25!.toFixed(4)} and ${metrics.fitResidualSHN49!.toFixed(4)}, norm held within ${metrics.normDriftSHN25!.toExponential(1)} and ${metrics.normDriftSHN49!.toExponential(1)}; the Lang-Firsov frame decays at ${metrics.fitOverGoldenLFN25!.toFixed(4)}, ${metrics.fitOverGoldenLFN49!.toFixed(4)} and the lab frame at ${metrics.fitOverGoldenLabN25!.toFixed(4)}, ${metrics.fitOverGoldenLabN49!.toFixed(4)} of the bare rule (norm drift ${metrics.normDriftLabN25!.toFixed(3)}, ${metrics.normDriftLabN49!.toFixed(3)}); closed form alpha = 1 / (2 N sqrt rho) (1 / alpha = ${metrics.inverseAlphaN25!.toFixed(2)}, ${metrics.inverseAlphaN49!.toFixed(2)}, ${metrics.inverseAlphaN121!.toFixed(2)} at N = 25, 49, 121), the long-wave rate 4 pi alpha d^2 omega within ${Math.max(...[25, 49, 121].map(n => Math.abs(metrics[`longWaveRatioN${n}`]! - 1))).toExponential(1)}, alpha times Planck capacity ${metrics.alphaTimesCapacityN25!.toFixed(4)} at every depth (pi / 8 = ${(Math.PI / 8).toFixed(4)} at a balanced split)`,
      metrics,
      control: {
        fitOverGoldenLabN25: metrics.fitOverGoldenLabN25!,
        normDriftLabN25: metrics.normDriftLabN25!,
      },
      notes:
        "L2 (the closed form L1). FIRST RUN 2026-09-26 (tmp/frc0240.log, 9.6 s), FAIL: X3 passes, X1 and X2 fail. No gate moved. X1: in the Silbey-Harris frame the fitted rate over [1/Gamma_SH, 4/Gamma_SH] is 0.849 and 0.928 of Gamma_SH (0.835 and 0.920 of the bare golden rule), residual 0.123 and 0.083 against 0.02. X2: the norm holds within 2.1e-2 (N = 25, fails 0.01) and 8.7e-3 (N = 49). REPORTED: the lab frame through this file's code gives 0.8598 and 0.9268 of the bare rule, E-FRC-0237's 0.860 and 0.928 reproduced (a code cross-check), with norm drift 0.120 and 0.052; Lang-Firsov gives 0.764 and 0.899, drift 0.049 and 0.018. X3: the strip golden rule's long-wave limit is 4 pi alpha d^2 omega within 7.2e-8, alpha = 1 / (2 N sqrt rho) (1/alpha = 50.5, 99.0, 248.9 at N = 25, 49, 121 with rho = 50/49, 50/49, 128/121), the rule's g equal to 2 pi s / N to 1e-16. PREDICTION (2) WAS WRONG: the frame cuts the norm leak six-fold (0.12 to 0.021 at N = 25) and the deficit does NOT go away, so E-FRC-0237's 0.86 was not a leak artifact. DIAGNOSED AFTER THE RUN (tmp/pol-probe1.ts, disclosed; local rate -d ln P_e / dt over one-lifetime windows, Silbey-Harris frame): the FIRST lifetime decays at 0.975, 0.996, 1.000, 0.993, 0.996 of the bare golden rule at N = 25, 49, 81, 121, 225, and P_e(1/Gamma) = 0.3735 against e^-1 = 0.3679 at N = 25; the slowing comes in the third and fourth lifetimes (0.821, 0.791 at N = 25; 0.939, 0.826, 0.725 at N = 49) and moves later as N grows. That is the signature of a FLOOR under the bare-state population: the dressed ground state keeps a bare-e admixture of order sum |d alpha|^2 / (4 sin^2((theta + omega)/2)), about 7e-3 at N = 25 (it falls as g^2 ~ N^-3), not small beside e^-4 = 0.018 at the end of the fitted window. So the rate IS the golden rule (to 2.5 percent at N = 25, 0.4 percent at N = 49, from the first lifetime), and the gate's window over one to four lifetimes of the BARE population measured the floor, not the rate. Also refuted, by E-FRC-0239 V2: the Debye-Waller-corrected golden rule read off either frame's zeroth order. The physical dressed gap is the second-order level repulsion, which neither zeroth order has. A gate on the dressed-state population, or on the first two lifetimes, is the next file, not a moved gate here. The closed form is a prediction only: it fixes no N, and E-MTH-0024 admits no number-only identification of alpha.",
    })
  },
})
