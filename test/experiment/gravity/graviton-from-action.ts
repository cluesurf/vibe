// P24: the graviton operator DERIVED from the action, not typed in.
// The earlier version typed in the linearized Einstein operator's momentum-space formula. This
// version derives it two genuine ways, both from the action rather than asserted:
//
//   A. From the discrete causal-set (Benincasa-Dowker) action on an actual SPRINKLING. The
//      smeared BD d'Alembertian B_eps, built only from the causal order of a Poisson sprinkling,
//      recovers the field d'Alembertian box = -d_t^2 + d_x^2 in the mean. We show its Lorentzian
//      signature robustly: a time-concentrated test function gives box > 0 and a space-concentrated
//      one gives box < 0, and the paired difference (same sprinkling, so the geometric fluctuations
//      cancel) is positive at many sigma and matches the continuum value. So the kinetic operator
//      of the field action emerges from the discrete substrate.
//
//   B. The linearized graviton (spin-2) operator is built through the geometric pipeline
//      Christoffel -> Ricci -> Einstein from the metric perturbation, NOT typed as a formula. From
//      that derived operator, two facts come out with no projector imposed: pure-gauge
//      perturbations h = k xi + xi k are annihilated (diffeomorphism invariance), and the physical
//      spectrum is exactly TWO massless modes at eigenvalue (1/2)|k|^2 (the graviton polarizations).
// Run: npx tsx code/experiment/p24-graviton-from-action.ts

import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { pastMatrix } from '@/code/tool/poset'
import { benincasaDowkerDalembertian } from '@/code/operator/benincasa-dowker'
import { gravitonFromAction } from '@/code/operator/graviton'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ---------- A. The Benincasa-Dowker d'Alembertian from a sprinkling ----------

// B_eps phi at point xi on the sprinkling, the smeared causal-set d'Alembertian.
function bdApply(
  phi: (t: number, x: number) => number,
  coords: Float64Array,
  past: ReturnType<typeof pastMatrix>,
  p: ReturnType<typeof sprinkleMinkowski>,
  xi: number,
  rho: number,
  eps: number,
): number {
  return benincasaDowkerDalembertian({
    phi,
    coords,
    poset: p,
    past,
    index: xi,
    density: rho,
    epsilon: eps,
  })
}

// Paired test: a time-concentrated Gaussian (box > 0) minus a space-concentrated one (box < 0),
// on the SAME sprinkling so the common-mode geometric fluctuation cancels. The result must be
// robustly positive: the Lorentzian signature of the d'Alembertian, recovered from the causal set.
export function bdSignature(input: {
  realizations: number
  count: number
  seed: number
}): {
  diffMean: number
  diffSem: number
  expectedDiff: number
  robustlyPositive: boolean
  recoversBox: boolean
} {
  const t0 = 0.7
  const x0 = 0
  const V = 0.5
  const st = 0.1
  const sx = 0.3
  const eps = 0.1
  const phiTime = (t: number, x: number): number =>
    Math.exp(
      -((t - t0) ** 2) / (2 * st * st) - (x - x0) ** 2 / (2 * sx * sx),
    )
  const phiSpace = (t: number, x: number): number =>
    Math.exp(
      -((t - t0) ** 2) / (2 * sx * sx) - (x - x0) ** 2 / (2 * st * st),
    )
  const expectedDiff =
    1 / (st * st) - 1 / (sx * sx) - (1 / (sx * sx) - 1 / (st * st))
  let acc = 0
  let acc2 = 0
  let m = 0
  for (let r = 0; r < input.realizations; r++) {
    const p = sprinkleMinkowski({
      dimension: 2,
      count: input.count,
      rng: makeRng({ seed: input.seed + r }),
    })
    const coords = p.embedding?.coords ?? new Float64Array(0)
    const rho = p.size / V
    const past = pastMatrix(p)
    let xi = 0
    let best = Infinity
    for (let i = 0; i < p.size; i++) {
      const d =
        ((coords[i * 2] ?? 0) - t0) ** 2 +
        ((coords[i * 2 + 1] ?? 0) - x0) ** 2
      if (d < best) {
        best = d
        xi = i
      }
    }

    const diff =
      bdApply(phiTime, coords, past, p, xi, rho, eps) -
      bdApply(phiSpace, coords, past, p, xi, rho, eps)
    acc += diff
    acc2 += diff * diff
    m += 1
  }

  const diffMean = acc / m
  const sd = Math.sqrt(Math.max(0, acc2 / m - diffMean * diffMean))
  const diffSem = sd / Math.sqrt(m)

  return {
    diffMean,
    diffSem,
    expectedDiff,
    robustlyPositive: diffMean > 10 * diffSem,
    // within the (real, large) BD bias-and-fluctuation, the mean is the right sign and order
    recoversBox:
      diffMean > 0.5 * expectedDiff && diffMean < 1.5 * expectedDiff,
  }
}

// ---------- B. The graviton operator via Christoffel -> Ricci -> Einstein ----------
// The derived operator (einsteinOp) and gravitonFromAction now live in code/operator/graviton.ts.

export default experiment({
  id: 'gravity/graviton-from-action',
  title: 'graviton operator derived from the action, not typed in',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = gravitonFromAction({ k: [1, 1, 1] })
    const bd = bdSignature({ realizations: 24, count: 700, seed: 1 })
    const ok =
      r.gravitonModes === 2 &&
      r.diffeoResidual < 1e-10 &&
      Math.abs(r.gravitonEigenvalue - 0.5 * r.k2) < 1e-9 &&
      bd.robustlyPositive &&
      bd.recoversBox

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Benincasa-Dowker d Alembertian recovers the box from a sprinkling and the pipeline gives diffeomorphism invariance with two graviton modes',
      metrics: {
        gravitonModes: r.gravitonModes,
        diffeoResidual: r.diffeoResidual,
        gravitonEigenvalue: r.gravitonEigenvalue,
        boxDifferenceMean: bd.diffMean,
        boxDifferenceStandardError: bd.diffSem,
      },
    })
  },
})
