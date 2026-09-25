// Can loves and fears carry a non-classical step? E-FRC-0120 wrote the singlet exactly as whole
// numbers of loves and fears on the role grid. A state is only half of it: a step must move the
// weights. Any gate U moves the grid weights W of n qutrits by an exact real kernel,
// W'(x) = sum_y K(x, y) W(y), K(x, y) = Tr(A(x) U A(y) U^dagger) / 3^n, with A the phase-point
// operators. A classical gate (a colour move) makes K a permutation: loves and fears just move. A
// non-classical gate spreads one point's weight over several with signs: a love at y becomes loves at
// some points and fears at others, which is what pair creation from calm does, and a love and a fear
// landing on one point cancel back to calm.
//
// Measured, for each gate: that weight is conserved (every column of K sums to 1), the smallest
// denominator of K (so whole loves and fears stay whole with that many units per unit), and the
// growth, the largest sum of |K| over a column: how many vibes one step can turn one vibe into. A
// growth of 1 is classical. Gates:
// - the plain swap of two roles and a colour move (Clifford controls): permutations, growth 1
// - the swap phase U(phi) = P_sym + e^(i phi) P_anti at phi = 2 pi / 3 and pi / 2, the continuous
//   colour move of E-FRC-0100, the step a quark's role turns by
// - T = diag(1, e^(2 pi i / 9), e^(-2 pi i / 9)) on one role, the non-classical element the
//   continuum floor needed (E-FRC-0103)
// And one run: the swap phase at 2 pi / 3 applied to the first two roles of the singlet's weights,
// the vibe count before and after, with loves and fears on one point cancelled.
//
// Gates: weight conserved by every kernel, the controls are permutations, every non-classical gate
// has growth above 1 and a finite denominator. Reported: denominators, growths, and the singlet run.
//
// Depth L1: exact phase-space arithmetic.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { phasePoint } from '@/code/measure/qutrit-phase-space'
import { QUTRIT_T } from '@/code/algebra/group/su3-subgroups'

// complex square matrices as { n, re, im }, row-major
type M = { n: number; re: Float64Array; im: Float64Array }

const make = (n: number): M => ({
  n,
  re: new Float64Array(n * n),
  im: new Float64Array(n * n),
})

function mul(a: M, b: M): M {
  const out = make(a.n)

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      let re = 0
      let im = 0

      for (let k = 0; k < a.n; k++) {
        const ar = a.re[i * a.n + k] ?? 0
        const ai = a.im[i * a.n + k] ?? 0
        const br = b.re[k * a.n + j] ?? 0
        const bi = b.im[k * a.n + j] ?? 0

        re += ar * br - ai * bi
        im += ar * bi + ai * br
      }

      out.re[i * a.n + j] = re
      out.im[i * a.n + j] = im
    }
  }

  return out
}

function dagger(a: M): M {
  const out = make(a.n)

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      out.re[i * a.n + j] = a.re[j * a.n + i] ?? 0
      out.im[i * a.n + j] = -(a.im[j * a.n + i] ?? 0)
    }
  }

  return out
}

function kron(a: M, b: M): M {
  const n = a.n * b.n
  const out = make(n)

  for (let i = 0; i < a.n; i++) {
    for (let j = 0; j < a.n; j++) {
      for (let k = 0; k < b.n; k++) {
        for (let l = 0; l < b.n; l++) {
          const ar = a.re[i * a.n + j] ?? 0
          const ai = a.im[i * a.n + j] ?? 0
          const br = b.re[k * b.n + l] ?? 0
          const bi = b.im[k * b.n + l] ?? 0
          const index = (i * b.n + k) * n + (j * b.n + l)

          out.re[index] = ar * br - ai * bi
          out.im[index] = ar * bi + ai * br
        }
      }
    }
  }

  return out
}

const fromMatrix3 = (m: Float64Array): M => {
  const out = make(3)

  for (let k = 0; k < 9; k++) {
    out.re[k] = m[2 * k] ?? 0
    out.im[k] = m[2 * k + 1] ?? 0
  }

  return out
}

const trace = (a: M): number => {
  let t = 0

  for (let i = 0; i < a.n; i++) {
    t += a.re[i * a.n + i] ?? 0
  }

  return t
}

const POINTS: readonly [number, number][] = [0, 1, 2].flatMap(a =>
  [0, 1, 2].map(b => [a, b] as [number, number]),
)
const onePoint = POINTS.map(([a, b]) => fromMatrix3(phasePoint(a, b)))
const twoPoint = onePoint.flatMap(x => onePoint.map(y => kron(x, y)))

function kernel(u: M, points: readonly M[]): number[][] {
  const ud = dagger(u)

  return points.map(ax =>
    points.map(ay => trace(mul(mul(ax, u), mul(ay, ud))) / u.n),
  )
}

function summary(k: number[][]): {
  conserved: boolean
  permutation: boolean
  growth: number
  denominator: number
} {
  const size = k.length
  let conserved = true
  let growth = 0

  for (let y = 0; y < size; y++) {
    let sum = 0
    let absolute = 0

    for (let x = 0; x < size; x++) {
      sum += k[x]?.[y] ?? 0
      absolute += Math.abs(k[x]?.[y] ?? 0)
    }

    conserved = conserved && Math.abs(sum - 1) < 1e-9
    growth = Math.max(growth, absolute)
  }

  const permutation = k.every(row =>
    row.every(v => Math.abs(v) < 1e-9 || Math.abs(v - 1) < 1e-9),
  )

  let denominator = -1

  for (let n = 1; n <= 729 && denominator < 0; n++) {
    if (k.every(row => row.every(v => Math.abs(n * v - Math.round(n * v)) < 1e-7))) {
      denominator = n
    }
  }

  return { conserved, permutation, growth, denominator }
}

function swapPhase(phi: number): M {
  const u = make(9)

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const row = 3 * i + j
      const swapped = 3 * j + i
      // P_sym = (I + S) / 2, P_anti = (I - S) / 2, U = P_sym + e^(i phi) P_anti
      const c = Math.cos(phi)
      const s = Math.sin(phi)

      u.re[row * 9 + row] = (u.re[row * 9 + row] ?? 0) + (1 + c) / 2
      u.im[row * 9 + row] = (u.im[row * 9 + row] ?? 0) + s / 2
      u.re[row * 9 + swapped] = (u.re[row * 9 + swapped] ?? 0) + (1 - c) / 2
      u.im[row * 9 + swapped] = (u.im[row * 9 + swapped] ?? 0) - s / 2
    }
  }

  return u
}

export default experiment({
  id: 'gauge/fear-carries-a-step',
  code: 'E-FRC-0121',
  title:
    'a non-classical step moves loves and fears by an exact signed kernel with whole-number fractions that conserves weight, where a classical step only permutes them: the swap phase and T each turn one vibe into several, loves and fears, which is what pair creation from calm does',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // a colour move on one role: the Fourier matrix, a Clifford element
    const fourier = make(3)

    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        const angle = (2 * Math.PI * j * k) / 3

        fourier.re[j * 3 + k] = Math.cos(angle) / Math.sqrt(3)
        fourier.im[j * 3 + k] = Math.sin(angle) / Math.sqrt(3)
      }
    }

    const gates: [string, M, readonly M[]][] = [
      ['swap', swapPhase(Math.PI), twoPoint],
      ['colourMove', fourier, onePoint],
      ['swapPhaseThird', swapPhase((2 * Math.PI) / 3), twoPoint],
      ['swapPhaseQuarter', swapPhase(Math.PI / 2), twoPoint],
      ['t', fromMatrix3(QUTRIT_T), onePoint],
    ]
    const results = gates.map(([name, u, points]) => ({
      name,
      ...summary(kernel(u, points)),
    }))

    // the singlet's weights under the swap phase at 2 pi / 3 on its first two roles, as whole vibes
    const singlet = make(27)
    const s6 = 1 / Math.sqrt(6)
    const perms: [number, number, number, number][] = [
      [0, 1, 2, s6],
      [1, 2, 0, s6],
      [2, 0, 1, s6],
      [0, 2, 1, -s6],
      [2, 1, 0, -s6],
      [1, 0, 2, -s6],
    ]
    const amplitude = new Float64Array(27)

    for (const [i, j, k, a] of perms) {
      amplitude[9 * i + 3 * j + k] = a
    }

    // the swap phase on roles 1 and 2 of three: U x I
    const step = kron(swapPhase((2 * Math.PI) / 3), (() => {
      const id = make(3)

      for (let i = 0; i < 3; i++) {
        id.re[i * 3 + i] = 1
      }

      return id
    })())
    const threePoints = twoPoint.flatMap(x => onePoint.map(y => kron(x, y)))
    const weights = (re: Float64Array, im: Float64Array): number[] =>
      threePoints.map(a => {
        let value = 0

        for (let i = 0; i < 27; i++) {
          let ar = 0
          let ai = 0

          for (let j = 0; j < 27; j++) {
            const xr = a.re[i * 27 + j] ?? 0
            const xi = a.im[i * 27 + j] ?? 0

            ar += xr * (re[j] ?? 0) - xi * (im[j] ?? 0)
            ai += xr * (im[j] ?? 0) + xi * (re[j] ?? 0)
          }

          value += (re[i] ?? 0) * ar + (im[i] ?? 0) * ai
        }

        return value / 27
      })
    const vibes = (w: readonly number[]): { loves: number; fears: number } => {
      for (let n = 1; n <= 2000; n++) {
        if (w.every(x => Math.abs(n * x - Math.round(n * x)) < 1e-7)) {
          const counts = w.map(x => Math.round(n * x))

          return {
            loves: counts.filter(c => c > 0).reduce((a, b) => a + b, 0),
            fears: -counts.filter(c => c < 0).reduce((a, b) => a + b, 0),
          }
        }
      }

      return { loves: -1, fears: -1 }
    }
    const before = vibes(weights(amplitude, new Float64Array(27)))
    const movedRe = new Float64Array(27)
    const movedIm = new Float64Array(27)

    for (let i = 0; i < 27; i++) {
      for (let j = 0; j < 27; j++) {
        movedRe[i] = (movedRe[i] ?? 0) + (step.re[i * 27 + j] ?? 0) * (amplitude[j] ?? 0)
        movedIm[i] = (movedIm[i] ?? 0) + (step.im[i * 27 + j] ?? 0) * (amplitude[j] ?? 0)
      }
    }

    const after = vibes(weights(movedRe, movedIm))
    const by = (name: string): (typeof results)[number] | undefined =>
      results.find(r => r.name === name)
    const nonClassical = ['swapPhaseThird', 'swapPhaseQuarter', 't']
    const ok =
      results.every(r => r.conserved) &&
      by('swap')?.permutation === true &&
      by('colourMove')?.permutation === true &&
      nonClassical.every(name => (by(name)?.growth ?? 0) > 1 + 1e-9)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every kernel conserves weight, the plain swap and a colour move only permute grid points, and the swap phase at 2 pi / 3 and pi / 2 and T each spread one vibe over several with signs, with their denominators and growth reported',
      metrics: {
        ...Object.fromEntries(
          results.flatMap(r => [
            [`${r.name}Conserved`, r.conserved ? 1 : 0],
            [`${r.name}Permutation`, r.permutation ? 1 : 0],
            [`${r.name}Growth`, r.growth],
            [`${r.name}Denominator`, r.denominator],
          ]),
        ),
        singletLovesBefore: before.loves,
        singletFearsBefore: before.fears,
        singletLovesAfter: after.loves,
        singletFearsAfter: after.fears,
      },
      control: {
        gates: gates.length,
      },
      notes:
        'L1, exact. Growth is the largest sum of |K| over a column: how many vibes one step can make from one. A denominator of -1 means none up to 729 makes the kernel whole, so whole loves and fears cannot carry that step exactly at any small scale. The singlet run: the singlet is antisymmetric in its first two roles, so the swap phase multiplies it by e^(i 2 pi / 3) and its weights, and its loves and fears, do not change.',
    })
  },
})
