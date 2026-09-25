// Is the signed weight the base lacks already in it, as the vibe? A qutrit's quantum state can be
// written exactly as real weights on the 9 points of the role grid, its discrete Wigner function,
// summing to 1. When every weight is at least 0 the state is classical, and the color group moves it
// by permuting points (E-FRC-0104). Negative weights are what makes a state non-classical, its magic.
// A set of vibes on grid points is already a signed weighting: love +1, fear -1. So the question is
// whether the states color needs can be written as whole numbers of loves and fears on the grid,
// with fear doing the work the missing amplitude was supposed to do.
//
// Three states of three qutrits, on the 9^3 = 729 points of their grid:
// - the singlet epsilon, the whole of three different roles (antisymmetric), the state no classical
//   configuration reaches (E-FRC-0101)
// - the whole of three equal roles, (|000> + |111> + |222>) / sqrt 3, symmetric
// - the product |000>, a plain classical state, the control
// For each: the Wigner function W(x) = <psi| A(x1) A(x2) A(x3) |psi> / 27 with the phase-point
// operators of code/measure/qutrit-phase-space, the smallest number of units N that makes every
// N W(x) a whole number, and how many of those units are loves and how many fears.
//
// Gates:
// - every W sums to 1, and the marginal over the tilts reproduces each state's role probabilities
//   (1/6 on each of the six all-different role triples for the singlet)
// - the product state and the all-same whole need no fear
// - the singlet needs fear, and is written exactly by whole numbers of loves and fears
//
// Depth L1: exact phase-space arithmetic.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { phasePoint } from '@/code/measure/qutrit-phase-space'

type State = { re: Float64Array; im: Float64Array }

const POINTS: readonly [number, number][] = [0, 1, 2].flatMap(a =>
  [0, 1, 2].map(b => [a, b] as [number, number]),
)

// the 3 x 3 operator on one factor of a 27-dimensional three-qutrit vector
function applyOn(
  op: Float64Array,
  factor: number,
  state: State,
): State {
  const re = new Float64Array(27)
  const im = new Float64Array(27)
  const stride = 3 ** (2 - factor)

  for (let index = 0; index < 27; index++) {
    const digit = Math.floor(index / stride) % 3
    const base = index - digit * stride

    for (let k = 0; k < 3; k++) {
      const sr = state.re[base + k * stride] ?? 0
      const si = state.im[base + k * stride] ?? 0
      const or = op[2 * (3 * digit + k)] ?? 0
      const oi = op[2 * (3 * digit + k) + 1] ?? 0

      re[index] = (re[index] ?? 0) + or * sr - oi * si
      im[index] = (im[index] ?? 0) + or * si + oi * sr
    }
  }

  return { re, im }
}

function wigner(state: State): number[] {
  const operators = POINTS.map(([a, b]) => phasePoint(a, b))
  const out: number[] = []

  for (let x = 0; x < 729; x++) {
    const [p1, p2, p3] = [0, 1, 2].map(
      k => Math.floor(x / 81 ** 0 / 9 ** (2 - k)) % 9,
    )

    let moved = applyOn(
      operators[p3 ?? 0] ?? new Float64Array(18),
      2,
      state,
    )

    moved = applyOn(
      operators[p2 ?? 0] ?? new Float64Array(18),
      1,
      moved,
    )

    moved = applyOn(
      operators[p1 ?? 0] ?? new Float64Array(18),
      0,
      moved,
    )

    let value = 0

    for (let i = 0; i < 27; i++) {
      value +=
        (state.re[i] ?? 0) * (moved.re[i] ?? 0) +
        (state.im[i] ?? 0) * (moved.im[i] ?? 0)
    }

    out.push(value / 27)
  }

  return out
}

function stateOf(
  amplitudes: [number, number, number, number][],
): State {
  const re = new Float64Array(27)
  const im = new Float64Array(27)

  for (const [i, j, k, amplitude] of amplitudes) {
    re[9 * i + 3 * j + k] = amplitude
  }

  return { re, im }
}

// the smallest N up to a limit making every N W a whole number, and the love and fear units
function units(w: readonly number[]): {
  n: number
  loves: number
  fears: number
} {
  for (let n = 1; n <= 5000; n++) {
    if (w.every(x => Math.abs(n * x - Math.round(n * x)) < 1e-7)) {
      const counts = w.map(x => Math.round(n * x))

      return {
        n,
        loves: counts.filter(c => c > 0).reduce((a, b) => a + b, 0),
        fears: -counts.filter(c => c < 0).reduce((a, b) => a + b, 0),
      }
    }
  }

  return { n: -1, loves: -1, fears: -1 }
}

export default experiment({
  id: 'gauge/fear-is-negativity',
  code: 'E-FRC-0120',
  title:
    'the singlet can be written exactly as whole numbers of loves and fears on the grid of three roles, and needs fears, while the whole of three equal roles and a plain classical state need none: the signed weight color lacks is the vibe, with fear as the negativity',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const s6 = 1 / Math.sqrt(6)
    const s3 = 1 / Math.sqrt(3)
    const states: [string, State][] = [
      [
        'singlet',
        stateOf([
          [0, 1, 2, s6],
          [1, 2, 0, s6],
          [2, 0, 1, s6],
          [0, 2, 1, -s6],
          [2, 1, 0, -s6],
          [1, 0, 2, -s6],
        ]),
      ],
      [
        'allSame',
        stateOf([
          [0, 0, 0, s3],
          [1, 1, 1, s3],
          [2, 2, 2, s3],
        ]),
      ],
      ['product', stateOf([[0, 0, 0, 1]])],
    ]

    // which first coordinate of a phase point marks basis state j: the marginal over the second
    // coordinate of the one-qutrit Wigner function of |j> is 1 there
    const basisOf = [0, 1, 2].map(j => {
      const single = stateOf([[j, 0, 0, 1]])
      const w = wigner(single)

      return [0, 1, 2].findIndex(a => {
        let total = 0

        for (let x = 0; x < 729; x++) {
          const p1 = Math.floor(x / 81)

          total += Math.floor(p1 / 3) === a ? (w[x] ?? 0) : 0
        }

        return Math.abs(total - 1) < 1e-9
      })
    })

    const results = states.map(([name, state]) => {
      const w = wigner(state)
      const total = w.reduce((a, b) => a + b, 0)

      // role probabilities from the marginal over the tilts
      let marginalOk = true

      for (let r = 0; r < 27; r++) {
        const roles = [Math.floor(r / 9), Math.floor(r / 3) % 3, r % 3]

        let p = 0

        for (let x = 0; x < 729; x++) {
          const ps = [Math.floor(x / 81), Math.floor(x / 9) % 9, x % 9]

          if (
            ps.every(
              (q, k) => basisOf[roles[k] ?? 0] === Math.floor(q / 3),
            )
          ) {
            p += w[x] ?? 0
          }
        }

        const amplitude =
          state.re[
            9 * (roles[0] ?? 0) + 3 * (roles[1] ?? 0) + (roles[2] ?? 0)
          ] ?? 0

        marginalOk = marginalOk && Math.abs(p - amplitude ** 2) < 1e-9
      }

      return {
        name,
        total,
        marginalOk,
        ...units(w),
        negative: w.filter(x => x < -1e-12).length,
      }
    })

    const by = (name: string): (typeof results)[number] | undefined =>
      results.find(r => r.name === name)
    const ok =
      results.every(
        r => Math.abs(r.total - 1) < 1e-9 && r.marginalOk,
      ) &&
      by('product')?.fears === 0 &&
      by('allSame')?.fears === 0 &&
      (by('singlet')?.fears ?? 0) > 0 &&
      (by('singlet')?.n ?? -1) > 0

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the Wigner functions of the three states sum to 1 and give back their role probabilities, the product state and the all-same whole need no fear, and the singlet is written exactly by whole numbers of loves and fears with fears present',
      metrics: {
        ...Object.fromEntries(
          results.flatMap(r => [
            [`${r.name}Units`, r.n],
            [`${r.name}Loves`, r.loves],
            [`${r.name}Fears`, r.fears],
            [`${r.name}NegativePoints`, r.negative],
            [`${r.name}MarginalOk`, r.marginalOk ? 1 : 0],
          ]),
        ),
      },
      control: {
        points: 729,
        basisCoordinateIsIdentity: basisOf.every((a, j) => a === j)
          ? 1
          : 0,
      },
      notes:
        'L1, exact. Units: the smallest N making N W whole on every point, so a state is N units of weight, loves minus fears = N. Loves and fears count positive and negative units. A state with no fear is a classical mixture on the grid, and color moves only permute its points.',
    })
  },
})
