// A causal-set action: a real-valued functional of the order, the weight
// exponent in the sum over histories. The flagship is the Benincasa-Dowker
// action, the discrete analogue of the Einstein-Hilbert action whose continuum
// limit recovers the Ricci scalar curvature.
// and Benincasa & Dowker, "The Scalar Curvature of a Causal Set" (2010).

import {
  Poset,
  pastMatrix,
  relationCount,
  intervalSize,
} from '@/code/tool/poset'
import { forEachSetBit } from '@/code/tool/bitset'
import { myrheimMeyerDimension } from '@/code/measure/dimension'

export interface Action {
  readonly form: 'action'
  readonly name: string
  readonly epsilon: number
  value(input: { poset: Poset }): number
}

// Cap on the number of ordered related pairs we walk when accumulating the
// interval-abundance histogram. The action is dominated by small intervals
// (k <= 3), so for large posets we sample a bounded subset of related pairs and
// rescale, keeping cost O(PAIR_CAP * size / 32) instead of O(relations * size).
const PAIR_CAP = 200000

// Number of interval-abundance bins we track. The 4D combination needs k=0..3,
// the 2D combination needs k=0..2. We always fill 0..3.
const BIN_COUNT = 4

// Accumulate N_k = number of ordered related pairs (a precedes b) whose
// Alexandrov interval A(a,b) = { c : a < c < b } has exactly k elements, for
// k = 0..BIN_COUNT-1. Returns the bins, the total related-pair count, and the
// scale factor applied if we sampled rather than enumerated every pair.
function intervalAbundance(input: { poset: Poset }): {
  bins: Float64Array
  relations: number
} {
  const p = input.poset
  const past = pastMatrix(p)
  const relations = relationCount(p)
  const bins = new Float64Array(BIN_COUNT)

  // If the number of related pairs is within budget, enumerate all of them.
  // Otherwise subsample deterministically with a fixed stride (every Nth pair),
  // then rescale the histogram back up to the full count. A fixed stride keeps
  // the action a pure function of the poset (no hidden rng), so the whole chain
  // stays reproducible from one seed.
  const stride =
    relations > PAIR_CAP ? Math.ceil(relations / PAIR_CAP) : 1

  let index = 0
  let seen = 0

  for (let a = 0; a < p.size; a++) {
    forEachSetBit(p.future, {
      row: a,
      visit: b => {
        const take = index % stride === 0
        index += 1

        if (!take) {
          return
        }

        seen += 1
        const k = intervalSize(p, { a, b, past })

        if (k < BIN_COUNT) {
          bins[k] = (bins[k] ?? 0) + 1
        }
      },
    })
  }

  // Rescale a sampled histogram up to the full relation count so the action is
  // an unbiased estimate of the all-pairs value.
  if (seen > 0 && seen < relations) {
    const scale = relations / seen

    for (let k = 0; k < BIN_COUNT; k++) {
      bins[k] = (bins[k] ?? 0) * scale
    }
  }

  return { bins, relations }
}

// The Benincasa-Dowker discrete scalar-curvature action.
//
// The dimensionless combination is  S/hbar ~ N - sum_k c_k * N_k  where N is the
// number of elements, N_k the interval-abundance counts, and c_k the
// dimension-dependent coefficients fixed so the continuum limit yields the Ricci
// scalar. We use the standard published coefficients:
//
//   2D:  c0 = 1,  c1 = -2,  c2 = 1          (over k = 0..2)
//   4D:  c0 = 1,  c1 = -9,  c2 = 16, c3 = -8 (over k = 0..3)
//
// Here N is taken as the total related-pair count (relationCount), the natural
// extensive quantity the abundances refine. The epsilon nonlocality dial scales
// the whole combination as a smearing factor (1 = sharp / unsmeared); larger
// epsilon would mix in a wider order-interval kernel. We ship the sharp factor.
export function benincasaDowkerAction(input: {
  epsilon: number
  dimension: number
}): Action {
  const coefficients: ReadonlyArray<number> =
    input.dimension <= 2 ? [1, -2, 1] : [1, -9, 16, -8]

  return {
    form: 'action',
    name: `benincasa-dowker-${input.dimension}d`,
    epsilon: input.epsilon,
    value: ({ poset }) => {
      const { bins, relations } = intervalAbundance({ poset })

      let combination = relations

      for (let k = 0; k < coefficients.length; k++) {
        combination -= (coefficients[k] ?? 0) * (bins[k] ?? 0)
      }

      // epsilon-smearing factor: sharp kernel = 1. Kept explicit so the dial
      // is a visible scalar in the returned action rather than hidden.
      const smearing = 1

      return smearing * combination
    },
  }
}

// The 2D smeared kernel. n is the order-interval cardinality between a past
// element and x. epsilon in (0,1) sets the nonlocality: the kernel spreads over
// about 1/epsilon layers with geometric decay and alternating signs. At epsilon
// near 1 only n = 0 (links) survives, recovering the sharp action.
export function smearedKernel2D(input: {
  n: number
  epsilon: number
}): number {
  const e = input.epsilon
  const n = input.n
  const oneMinus = 1 - e

  if (oneMinus <= 0) {
    return n === 0 ? 1 : 0
  }

  const base = Math.pow(oneMinus, n)
  const term =
    1 -
    (2 * e * n) / oneMinus +
    (e * e * n * (n - 1)) / (2 * oneMinus * oneMinus)

  return base * term
}

// The smeared Benincasa-Dowker action in 2D, the literature mechanism for taming
// the action fluctuations and exposing a manifold phase. S_eps = -N/2 + eps *
// The 4D smeared kernel. The coefficients (1, -9, 16, -8) are the 4D Benincasa-Dowker
// layer weights, smeared the same way as 2D: f4(n,e) = (1-e)^n sum_k c_k C(n,k)
// (e/(1-e))^k, where C(n,k) is the binomial coefficient.
function smearedKernel4D(input: {
  n: number
  epsilon: number
}): number {
  const e = input.epsilon
  const n = input.n
  const oneMinus = 1 - e

  if (oneMinus <= 0) {
    return n === 0 ? 1 : 0
  }

  const r = e / oneMinus
  const c1 = n
  const c2 = (n * (n - 1)) / 2
  const c3 = (n * (n - 1) * (n - 2)) / 6
  const term = 1 - 9 * c1 * r + 16 * c2 * r * r - 8 * c3 * r * r * r

  return Math.pow(oneMinus, n) * term
}

// sum over related pairs (y < x) of f_d(n_yx, eps), the smeared d-dimensional
// Benincasa-Dowker action. Implemented for dimension 2 and 4 (their smeared kernels).
// Other dimensions fall back to the sharp action.
export function smearedBenincasaDowker(input: {
  epsilon: number
  dimension: number
}): Action {
  if (input.dimension !== 2 && input.dimension !== 4) {
    return benincasaDowkerAction(input)
  }

  const kernel =
    input.dimension === 4 ? smearedKernel4D : smearedKernel2D

  return {
    form: 'action',
    name: `smeared-benincasa-dowker-${input.dimension}d-eps${input.epsilon}`,
    epsilon: input.epsilon,
    value: ({ poset }) => {
      const past = pastMatrix(poset)
      const relations = relationCount(poset)
      const stride =
        relations > PAIR_CAP ? Math.ceil(relations / PAIR_CAP) : 1

      let index = 0
      let seen = 0
      let sum = 0

      for (let a = 0; a < poset.size; a++) {
        forEachSetBit(poset.future, {
          row: a,
          visit: b => {
            const take = index % stride === 0
            index += 1

            if (!take) {
              return
            }

            seen += 1
            const n = intervalSize(poset, { a, b, past })
            sum += kernel({ n, epsilon: input.epsilon })
          },
        })
      }

      if (seen > 0 && seen < relations) {
        sum *= relations / seen
      }

      return -poset.size / 2 + input.epsilon * sum
    },
  }
}

// A constructed manifold-favoring action: penalise the squared deviation of the
// Myrheim-Meyer dimension from a target. Minimising it drives the ensemble to a
// chosen dimension. The positive control that tests whether the Monte Carlo can
// reach manifold-like orders when an action rewards them.
export function dimensionTargetAction(input: {
  target: number
}): Action {
  return {
    form: 'action',
    name: `dimension-target-${input.target}`,
    epsilon: 0,
    value: ({ poset }) => {
      const d = myrheimMeyerDimension({ poset })
      const delta = d - input.target

      return delta * delta
    },
  }
}
