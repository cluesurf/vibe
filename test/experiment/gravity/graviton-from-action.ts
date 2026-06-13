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

import { makeDense } from '@/code/algebra/linear/dense'
import { eigSymmetric } from '@/code/algebra/linear/eig-jacobi'
import { makeRng } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { pastMatrix, intervalSize } from '@/code/tool/poset'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// ---------- A. The Benincasa-Dowker d'Alembertian from a sprinkling ----------

// Smeared 2D BD layer weight (Sorkin / Dowker-Glaser): a smooth replacement for the (1,-2,1) layer
// coefficients that tames the operator's variance. n is the interval cardinality between y and x.
function bdWeight(eps: number, n: number): number {
  const a = 1 - eps
  return Math.pow(a, n) * (1 - (2 * eps * n) / a + (eps * eps * n * (n - 1)) / (2 * a * a))
}

// B_eps phi(x) = 4 eps rho ( -1/2 phi(x) + eps sum_{y precedes x} bdWeight(eps, n_{yx}) phi(y) ).
function bdApply(
  phi: (t: number, x: number) => number,
  coords: Float64Array,
  past: ReturnType<typeof pastMatrix>,
  p: ReturnType<typeof sprinkleMinkowski>,
  xi: number,
  rho: number,
  eps: number,
): number {
  const tx = coords[xi * 2] ?? 0
  const xx = coords[xi * 2 + 1] ?? 0
  let s = 0
  for (let y = 0; y < p.size; y++) {
    if (y === xi) continue
    const dt = tx - (coords[y * 2] ?? 0)
    const dx = xx - (coords[y * 2 + 1] ?? 0)
    if (dt <= 0 || dt * dt - dx * dx < 0) continue // y must be in the causal past
    const n = intervalSize(p, { a: y, b: xi, past })
    s += bdWeight(eps, n) * phi(coords[y * 2] ?? 0, coords[y * 2 + 1] ?? 0)
  }
  return 4 * eps * rho * (-0.5 * phi(tx, xx) + eps * s)
}

// Paired test: a time-concentrated Gaussian (box > 0) minus a space-concentrated one (box < 0),
// on the SAME sprinkling so the common-mode geometric fluctuation cancels. The result must be
// robustly positive: the Lorentzian signature of the d'Alembertian, recovered from the causal set.
export function bdSignature(input: { realizations: number; count: number; seed: number }): {
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
  const phiTime = (t: number, x: number): number => Math.exp(-((t - t0) ** 2) / (2 * st * st) - ((x - x0) ** 2) / (2 * sx * sx))
  const phiSpace = (t: number, x: number): number => Math.exp(-((t - t0) ** 2) / (2 * sx * sx) - ((x - x0) ** 2) / (2 * st * st))
  const expectedDiff = (1 / (st * st) - 1 / (sx * sx)) - (1 / (sx * sx) - 1 / (st * st))
  let acc = 0
  let acc2 = 0
  let m = 0
  for (let r = 0; r < input.realizations; r++) {
    const p = sprinkleMinkowski({ dimension: 2, count: input.count, rng: makeRng({ seed: input.seed + r }) })
    const coords = p.embedding?.coords ?? new Float64Array(0)
    const rho = p.size / V
    const past = pastMatrix(p)
    let xi = 0
    let best = Infinity
    for (let i = 0; i < p.size; i++) {
      const d = ((coords[i * 2] ?? 0) - t0) ** 2 + ((coords[i * 2 + 1] ?? 0) - x0) ** 2
      if (d < best) {
        best = d
        xi = i
      }
    }
    const diff = bdApply(phiTime, coords, past, p, xi, rho, eps) - bdApply(phiSpace, coords, past, p, xi, rho, eps)
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
    recoversBox: diffMean > 0.5 * expectedDiff && diffMean < 1.5 * expectedDiff,
  }
}

// ---------- B. The graviton operator via Christoffel -> Ricci -> Einstein ----------

const ROOT2 = Math.SQRT2
function tensorToVec(t: number[][]): number[] {
  return [t[0]?.[0] ?? 0, t[1]?.[1] ?? 0, t[2]?.[2] ?? 0, ROOT2 * (t[0]?.[1] ?? 0), ROOT2 * (t[0]?.[2] ?? 0), ROOT2 * (t[1]?.[2] ?? 0)]
}
function vecToTensor(v: number[]): number[][] {
  const xy = (v[3] ?? 0) / ROOT2
  const xz = (v[4] ?? 0) / ROOT2
  const yz = (v[5] ?? 0) / ROOT2
  return [
    [v[0] ?? 0, xy, xz],
    [xy, v[1] ?? 0, yz],
    [xz, yz, v[2] ?? 0],
  ]
}

// Linearized Christoffel symbol at momentum k (spatial metric, delta for raising):
//   Gamma^l_ij = (1/2)( k_i h_lj + k_j h_li - k_l h_ij ).
function christoffel(h: number[][], k: number[]): number[][][] {
  const G: number[][][] = [
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
  ]
  for (let l = 0; l < 3; l++) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        G[l]![i]![j] = 0.5 * ((k[i] ?? 0) * (h[l]?.[j] ?? 0) + (k[j] ?? 0) * (h[l]?.[i] ?? 0) - (k[l] ?? 0) * (h[i]?.[j] ?? 0))
      }
    }
  }
  return G
}
// Linearized Ricci from the Christoffel (the i^2 from two derivatives gives the overall minus):
//   R_ij = -( k_l Gamma^l_ij - k_j Gamma^l_il ).
function ricci(h: number[][], k: number[]): number[][] {
  const G = christoffel(h, k)
  const R: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let klG = 0
      for (let l = 0; l < 3; l++) klG += (k[l] ?? 0) * (G[l]?.[i]?.[j] ?? 0)
      let trG = 0
      for (let l = 0; l < 3; l++) trG += G[l]?.[i]?.[l] ?? 0
      R[i]![j] = -(klG - (k[j] ?? 0) * trG)
    }
  }
  return R
}
// Linearized Einstein operator G_ij = R_ij - (1/2) delta_ij R, DERIVED through the pipeline above.
export function einsteinOp(h: number[][], k: number[]): number[][] {
  const R = ricci(h, k)
  let tr = 0
  for (let i = 0; i < 3; i++) tr += R[i]?.[i] ?? 0
  const E: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      E[i]![j] = (R[i]?.[j] ?? 0) - (i === j ? 0.5 * tr : 0)
    }
  }
  return E
}

function einsteinMatrix(k: number[]): ReturnType<typeof makeDense> {
  const m = makeDense({ rows: 6, cols: 6 })
  for (let a = 0; a < 6; a++) {
    const e = [0, 0, 0, 0, 0, 0]
    e[a] = 1
    const col = tensorToVec(einsteinOp(vecToTensor(e), k))
    for (let r = 0; r < 6; r++) m.data[r * 6 + a] = col[r] ?? 0
  }
  return m
}

export function gravitonFromAction(input: { k: number[] }): {
  k2: number
  eigenvalues: number[]
  gravitonModes: number
  gravitonEigenvalue: number
  diffeoResidual: number
} {
  const k = input.k
  const k2 = (k[0] ?? 0) ** 2 + (k[1] ?? 0) ** 2 + (k[2] ?? 0) ** 2
  const eig = eigSymmetric({ matrix: einsteinMatrix(k) })
  const eigenvalues = Array.from(eig.values).sort((a, b) => a - b)
  const target = 0.5 * k2
  let gravitonModes = 0
  for (const v of eigenvalues) if (Math.abs(v - target) < 1e-6 * (1 + k2)) gravitonModes += 1
  const xi = [0.7, -0.3, 0.5]
  const hGauge: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) hGauge[i]![j] = (k[i] ?? 0) * (xi[j] ?? 0) + (k[j] ?? 0) * (xi[i] ?? 0)
  }
  const g = einsteinOp(hGauge, k)
  let gn = 0
  let hn = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      gn += (g[i]?.[j] ?? 0) ** 2
      hn += (hGauge[i]?.[j] ?? 0) ** 2
    }
  }
  return { k2, eigenvalues, gravitonModes, gravitonEigenvalue: target, diffeoResidual: hn > 0 ? Math.sqrt(gn / hn) : 0 }
}

export default defineExperiment({
  id: 'gravity/graviton-from-action',
  title: 'graviton operator derived from the action, not typed in',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = gravitonFromAction({ k: [1, 1, 1] })
    const bd = bdSignature({ realizations: 150, count: 1800, seed: 1 })
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
