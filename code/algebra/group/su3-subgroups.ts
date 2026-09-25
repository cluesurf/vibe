// Generators of the finite subgroups of SU(3) used here, as published, so each group is built by
// closure (generateGroup) and never typed in element by element. Symbols follow Grimus and Ludl,
// "Principal series of finite subgroups of SU(3)" (arXiv:1006.0098): omega = exp(2 pi i / 3),
// epsilon = exp(4 pi i / 9), mu1 = (-1 + sqrt 5) / 2, mu2 = (-1 - sqrt 5) / 2.
//
// | name | order | generators |
// | --- | --- | --- |
// | delta27 | 27 | the clock C = diag(1, omega, omega^2) and the shift E, the qutrit Heisenberg group |
// | sigma108 | 108 | C, E and V = (1 / (sqrt 3 i)) [omega^(jk)], the qutrit Fourier matrix, Sigma(36 x 3) |
// | sigma648 | 648 | C, E, V and D = diag(epsilon, epsilon, epsilon omega), Sigma(216 x 3), the Hessian group |
// | sigma60 | 60 | A = diag(1, -1, -1), E and W, the icosahedral group A5 inside SO(3) |
// | sigma1080 | 1080 | A, E, W and F, Sigma(360 x 3), the Valentiner group's triple cover |

import { Matrix3, matrix3 } from '@/code/dynamics/finite-gauge'

type C = [number, number]

const O: C = [0, 0]
const I: C = [1, 0]
const omega = (k: number): C => [Math.cos((2 * Math.PI * k) / 3), Math.sin((2 * Math.PI * k) / 3)]
const epsilon = (k: number): C => [Math.cos((4 * Math.PI * k) / 9), Math.sin((4 * Math.PI * k) / 9)]
const times = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const negate = (a: C): C => [-a[0], -a[1]]
const MU1 = (-1 + Math.sqrt(5)) / 2
const MU2 = (-1 - Math.sqrt(5)) / 2

export const CLOCK: Matrix3 = matrix3([
  [I, O, O],
  [O, omega(1), O],
  [O, O, omega(2)],
])

export const SHIFT: Matrix3 = matrix3([
  [O, I, O],
  [O, O, I],
  [I, O, O],
])

// V = (1 / (sqrt 3 i)) omega^(jk): the entry omega^(jk) times -i / sqrt 3
export const FOURIER: Matrix3 = matrix3(
  [0, 1, 2].map(j => [0, 1, 2].map(k => times(omega(j * k), [0, -1 / Math.sqrt(3)]))),
)

export const NINTH: Matrix3 = matrix3([
  [epsilon(1), O, O],
  [O, epsilon(1), O],
  [O, O, times(epsilon(1), omega(1))],
])

export const SIGN: Matrix3 = matrix3([
  [I, O, O],
  [O, [-1, 0], O],
  [O, O, [-1, 0]],
])

export const GOLDEN: Matrix3 = matrix3([
  [[-0.5, 0], [MU2 / 2, 0], [MU1 / 2, 0]],
  [[MU2 / 2, 0], [MU1 / 2, 0], [-0.5, 0]],
  [[MU1 / 2, 0], [-0.5, 0], [MU2 / 2, 0]],
])

export const VALENTINER: Matrix3 = matrix3([
  [[-1, 0], O, O],
  [O, O, negate(omega(1))],
  [O, negate(omega(2)), O],
])

export const SU3_SUBGROUPS = {
  delta27: { order: 27, generators: [CLOCK, SHIFT] },
  sigma108: { order: 108, generators: [CLOCK, SHIFT, FOURIER] },
  sigma648: { order: 648, generators: [CLOCK, SHIFT, FOURIER, NINTH] },
  sigma60: { order: 60, generators: [SIGN, SHIFT, GOLDEN] },
  sigma1080: { order: 1080, generators: [SIGN, SHIFT, GOLDEN, VALENTINER] },
} as const

export type Su3SubgroupName = keyof typeof SU3_SUBGROUPS
