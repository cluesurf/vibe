// Where the doublet's two components can live as slots of their own. Built for E-MTR-0021 and E-MTR-0022.
//
// The exclusion is the slot's: a slot holds one vibe. E-MTR-0018 read it on the husk, where the moving token's copy
// along +a (the part Gamma_a = +1) is a rank-2 space, so one slot held a two-dimensional label and the rule forbade
// pairs Pauli allows. This module holds what the two follow-ups need:
//
// 1. THE ROLE'S END PROJECTORS. On the role qutrit, the lift of each order-4 turn q_a of Q8 inside SL(2, 3) (the
//    pi turn about husk axis a; code/algebra/weil-representation) has eigenvalues +i and -i on the parity-even
//    doublet about the origin and +1 on the odd line (Q8 is the commutator subgroup, so every one-dimensional
//    character is 1 there). Its two doublet eigenlines, displaced to a point x, are Pi(x, a, +-): rank one, inside
//    Q_x = (1 + A(x)) / 2, summing to Q_x. roleEndCovariance asks every frame move D(v) L(M) (the 216 of them, 9
//    translations times the 24 lifted turns) whether it carries the six projectors about x onto the six about the
//    moved point M x + v, and whether the 2 pi turn about x is -1 on each.
// 2. THE TWO-COMPONENT TOKEN (weylSubsteps): the doublet alone, copied along +a where sigma_a = +1 and along -a
//    where sigma_a = -1. Its direction projectors are rank one, so the slot rule and the component rule coincide.
// 3. ANTICOMMUTANTS: the dimension of the space of matrices anticommuting with each of a set, the room for a mass
//    term (a Dirac mass anticommutes with every copy generator).
// 4. THE BULK: the husk shadow of each of the 24 D4 roots (drop the depth e4), and the root of each component of the
//    four-component token under the bulk reading: component (tau, sigma_a = s) is the root tau (s e_a + e4).
//
// Floating linear algebra on matrices of size 2 to 4, exact integer vectors for the roots. Nothing random.

import { type ComplexMatrix, complexIdentity, complexMultiply } from '@/code/algebra/linear/complex-matrix'
import { daggerMatrix, displacementMatrix, gridOrder, matrixDistance, phasePointMatrix, weilLifts, type GridMatrix } from '@/code/algebra/weil-representation'
import { internalFrom, type Complex, type Substep, type TokenStep } from '@/code/measure/moving-exclusion'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { binaryTetrahedralGroup, vectorAction, type Quaternion } from '@/code/algebra/binary-tetrahedral'

const add = (a: ComplexMatrix, b: ComplexMatrix, s = 1): ComplexMatrix => ({
  n: a.n,
  re: Float64Array.from(a.re, (x, i) => x + s * (b.re[i] as number)),
  im: Float64Array.from(a.im, (x, i) => x + s * (b.im[i] as number)),
})

const scale = (a: ComplexMatrix, s: number): ComplexMatrix => ({ n: a.n, re: Float64Array.from(a.re, x => x * s), im: Float64Array.from(a.im, x => x * s) })

// ---------------------------------------------------------------------------------------------------------
// 1. the role's end projectors

export type RoleEnds = {
  // projector[x][a][0 for +i, 1 for -i], x = 3 a1 + a2 on the grid
  readonly projector: ComplexMatrix[][][]
  readonly q: ComplexMatrix[]
  readonly doublet: ComplexMatrix[]
}

// the eigenprojector of a unitary u (3 x 3) for eigenvalue lambda, as a polynomial in u: the product over the other
// eigenvalues mu of (u - mu) / (lambda - mu)
function eigenprojector(u: ComplexMatrix, lambda: Complex, others: readonly Complex[]): ComplexMatrix {
  let out = complexIdentity(u.n)

  for (const mu of others) {
    const shifted = add(u, { n: u.n, re: complexIdentity(u.n).re.map(x => x * mu[0]), im: complexIdentity(u.n).re.map(x => x * mu[1]) }, -1)
    const dr = lambda[0] - mu[0]
    const di = lambda[1] - mu[1]
    const d2 = dr * dr + di * di
    // divide by (lambda - mu): multiply by conj / |.|^2
    const factor: ComplexMatrix = {
      n: u.n,
      re: Float64Array.from(shifted.re, (x, i) => (x * dr + (shifted.im[i] as number) * di) / d2),
      im: Float64Array.from(shifted.im, (x, i) => (x * dr - (shifted.re[i] as number) * di) / d2),
    }

    out = complexMultiply(out, factor)
  }

  return out
}

export function roleEnds(): RoleEnds {
  const lift = weilLifts(3)[0]

  if (!lift) {
    throw new Error('no Weil lift for p = 3')
  }

  // the three order-4 subgroups of Q8: one representative each
  const orderFour = lift.elements.filter(e => gridOrder(3, e.grid) === 4)
  const reps: ComplexMatrix[] = []
  const grids: GridMatrix[] = []

  for (const e of orderFour) {
    const inverse = grids.some(g => {
      const product = [(g[0] * e.grid[0] + g[1] * e.grid[2]) % 3, (g[0] * e.grid[1] + g[1] * e.grid[3]) % 3, (g[2] * e.grid[0] + g[3] * e.grid[2]) % 3, (g[2] * e.grid[1] + g[3] * e.grid[3]) % 3]

      return product.join(',') === '1,0,0,1'
    })

    if (!inverse) {
      reps.push(e.unitary)
      grids.push(e.grid)
    }
  }

  const plusI: Complex = [0, 1]
  const minusI: Complex = [0, -1]
  const one: Complex = [1, 0]
  const origin = reps.map(u => [eigenprojector(u, plusI, [minusI, one]), eigenprojector(u, minusI, [plusI, one])])
  const projector: ComplexMatrix[][][] = []
  const doublet: ComplexMatrix[] = []

  for (let a1 = 0; a1 < 3; a1++) {
    for (let a2 = 0; a2 < 3; a2++) {
      const d = displacementMatrix(3, a1, a2)
      const dd = daggerMatrix(d)

      projector.push(origin.map(pair => pair.map(p => complexMultiply(complexMultiply(d, p), dd))))
      doublet.push(scale(add(complexIdentity(3), phasePointMatrix(3, a1, a2)), 0.5))
    }
  }

  return { projector, q: reps, doublet }
}

export type RoleCovariance = {
  // how many of the 216 x 9 x 6 images landed on one of the six projectors about the moved point
  readonly carried: number
  readonly checks: number
  // the largest |Pi(x, a, +) + Pi(x, a, -) - Q_x| and |rank - 1| (trace), and |Pi R_x Pi + Pi| for the 2 pi turn
  readonly sumToDoublet: number
  readonly rankOne: number
  readonly twoPiSign: number
  // how many moves send an axis's pair of lines to a pair of lines with the two ends exchanged
  readonly swaps: number
}

export function roleEndCovariance(ends: RoleEnds): RoleCovariance {
  const lift = weilLifts(3)[0]

  if (!lift) {
    throw new Error('no Weil lift for p = 3')
  }

  const minusI = lift.elements.find(e => e.grid.join(',') === '2,0,0,2')?.unitary as ComplexMatrix
  let carried = 0
  let checks = 0
  let sumToDoublet = 0
  let rankOne = 0
  let twoPiSign = 0
  let swaps = 0

  for (let x = 0; x < 9; x++) {
    const d = displacementMatrix(3, Math.floor(x / 3), x % 3)
    const turn = complexMultiply(complexMultiply(d, minusI), daggerMatrix(d))

    for (let a = 0; a < 3; a++) {
      const [p, m] = (ends.projector[x] as ComplexMatrix[][])[a] as ComplexMatrix[]

      sumToDoublet = Math.max(sumToDoublet, matrixDistance(add(p as ComplexMatrix, m as ComplexMatrix), ends.doublet[x] as ComplexMatrix))

      for (const pi of [p, m] as ComplexMatrix[]) {
        let trace = 0

        for (let i = 0; i < 3; i++) {
          trace += pi.re[4 * i] as number
        }

        rankOne = Math.max(rankOne, Math.abs(trace - 1))
        twoPiSign = Math.max(twoPiSign, matrixDistance(complexMultiply(complexMultiply(pi, turn), pi), scale(pi, -1)))
      }
    }
  }

  for (let v1 = 0; v1 < 3; v1++) {
    for (let v2 = 0; v2 < 3; v2++) {
      const dv = displacementMatrix(3, v1, v2)

      for (const e of lift.elements) {
        const u = complexMultiply(dv, e.unitary)
        const ud = daggerMatrix(u)
        const [m0, m1, m2, m3] = e.grid

        for (let x = 0; x < 9; x++) {
          const x1 = Math.floor(x / 3)
          const x2 = x % 3
          const y = 3 * ((m0 * x1 + m1 * x2 + v1) % 3) + ((m2 * x1 + m3 * x2 + v2) % 3)
          const targets = (ends.projector[y] as ComplexMatrix[][]).flat()

          for (let a = 0; a < 3; a++) {
            const images = ((ends.projector[x] as ComplexMatrix[][])[a] as ComplexMatrix[]).map(pi => complexMultiply(complexMultiply(u, pi), ud))
            const found = images.map(img => targets.findIndex(t => matrixDistance(img, t) < 1e-9))

            images.forEach((_, s) => {
              checks++
              carried += (found[s] as number) >= 0 ? 1 : 0
            })

            // the + line of axis a lands on the - line of some axis: the move exchanges the ends
            swaps += (found[0] as number) >= 0 && (found[0] as number) % 2 === 1 ? 1 : 0
          }
        }
      }
    }
  }

  return { carried, checks, sumToDoublet, rankOne, twoPiSign, swaps }
}

// ---------------------------------------------------------------------------------------------------------
// 2. the two-component token

const PAULI: Record<'x' | 'y' | 'z', Complex[]> = {
  x: [
    [0, 0],
    [1, 0],
    [1, 0],
    [0, 0],
  ],
  y: [
    [0, 0],
    [0, -1],
    [0, 1],
    [0, 0],
  ],
  z: [
    [1, 0],
    [0, 0],
    [0, 0],
    [-1, 0],
  ],
}

// the substeps of the doublet-only token: copy along +a where sigma_a = +1, along -a where -1, no coin (a coin
// commuting with the doublet's turns is a scalar, which the kept space cannot see). Every substep is checked with
// the slot rule, P+ x P+ + P- x P-, which with rank-one P+- is the component rule too
export function weylSubsteps(schedule: readonly TokenStep[]): Substep[] {
  return schedule.map(step => {
    const axis = step === 'x' ? 0 : step === 'y' ? 1 : 2
    const sigma = PAULI[step === 'x' || step === 'y' || step === 'z' ? step : 'z']
    const identity: Complex[] = [
      [1, 0],
      [0, 0],
      [0, 0],
      [1, 0],
    ]
    const plus: Complex[] = identity.map((v, i) => [(v[0] + (sigma[i] as Complex)[0]) / 2, (v[1] + (sigma[i] as Complex)[1]) / 2])
    const minus: Complex[] = identity.map((v, i) => [(v[0] - (sigma[i] as Complex)[0]) / 2, (v[1] - (sigma[i] as Complex)[1]) / 2])

    return { axis, coin: internalFrom(2, identity), plus: internalFrom(2, plus), minus: internalFrom(2, minus), checked: true }
  })
}

// the eigenphases of the doublet-only token's symbol at wave vector k: U(k) = product of (cos k_a - i sin k_a sigma_a)
export function weylBand(schedule: readonly TokenStep[], k: readonly number[]): [number, number] {
  let u: ComplexMatrix = complexIdentity(2)

  for (const step of schedule) {
    const a = step === 'x' ? 0 : step === 'y' ? 1 : 2
    const sigma = PAULI[step === 'x' || step === 'y' || step === 'z' ? step : 'z']
    const c = Math.cos(k[a] ?? 0)
    const s = Math.sin(k[a] ?? 0)
    const m: ComplexMatrix = {
      n: 2,
      re: Float64Array.from([0, 1, 2, 3], i => (i % 3 === 0 ? c : 0) + s * (sigma[i] as Complex)[1]),
      im: Float64Array.from([0, 1, 2, 3], i => -s * (sigma[i] as Complex)[0]),
    }

    u = complexMultiply(m, u)
  }

  // eigenvalues of a 2 x 2 unitary: tr / 2 +- sqrt((tr / 2)^2 - det)
  const tr: Complex = [(u.re[0] as number) + (u.re[3] as number), (u.im[0] as number) + (u.im[3] as number)]
  const det: Complex = [
    (u.re[0] as number) * (u.re[3] as number) - (u.im[0] as number) * (u.im[3] as number) - ((u.re[1] as number) * (u.re[2] as number) - (u.im[1] as number) * (u.im[2] as number)),
    (u.re[0] as number) * (u.im[3] as number) + (u.im[0] as number) * (u.re[3] as number) - ((u.re[1] as number) * (u.im[2] as number) + (u.im[1] as number) * (u.re[2] as number)),
  ]
  const h: Complex = [tr[0] / 2, tr[1] / 2]
  const disc: Complex = [h[0] * h[0] - h[1] * h[1] - det[0], 2 * h[0] * h[1] - det[1]]
  const r = Math.hypot(disc[0], disc[1])
  const root: Complex = [Math.sqrt((r + disc[0]) / 2), Math.sign(disc[1] || 1) * Math.sqrt(Math.max(0, (r - disc[0]) / 2))]
  const e1 = Math.atan2(h[1] + root[1], h[0] + root[0])
  const e2 = Math.atan2(h[1] - root[1], h[0] - root[0])

  return [e1, e2]
}

// ---------------------------------------------------------------------------------------------------------
// 3. anticommutants

// the dimension (over the reals, divided by 2 for a complex space) of {X : X G + G X = 0 for every G in the set}
export function anticommutantDimension(generators: readonly ComplexMatrix[]): number {
  const n = generators[0]?.n ?? 0
  const unknowns = 2 * n * n
  const rows: number[][] = []

  for (const g of generators) {
    // (X G + G X)_ij = sum_k X_ik G_kj + G_ik X_kj, real and imaginary parts, X = A + i B
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const re = new Array<number>(unknowns).fill(0)
        const im = new Array<number>(unknowns).fill(0)

        for (let k = 0; k < n; k++) {
          const gr = g.re[k * n + j] as number
          const gi = g.im[k * n + j] as number
          // X_ik G_kj: (A + iB)(gr + i gi)
          re[i * n + k] = (re[i * n + k] as number) + gr
          re[n * n + i * n + k] = (re[n * n + i * n + k] as number) - gi
          im[i * n + k] = (im[i * n + k] as number) + gi
          im[n * n + i * n + k] = (im[n * n + i * n + k] as number) + gr

          const hr = g.re[i * n + k] as number
          const hi = g.im[i * n + k] as number
          // G_ik X_kj
          re[k * n + j] = (re[k * n + j] as number) + hr
          re[n * n + k * n + j] = (re[n * n + k * n + j] as number) - hi
          im[k * n + j] = (im[k * n + j] as number) + hi
          im[n * n + k * n + j] = (im[n * n + k * n + j] as number) + hr
        }

        rows.push(re, im)
      }
    }
  }

  return (unknowns - rank(rows, unknowns)) / 2
}

function rank(rows: number[][], columns: number): number {
  const m = rows.map(r => [...r])
  let r = 0

  for (let c = 0; c < columns && r < m.length; c++) {
    let pivot = -1
    let best = 1e-10

    for (let i = r; i < m.length; i++) {
      if (Math.abs((m[i] as number[])[c] as number) > best) {
        best = Math.abs((m[i] as number[])[c] as number)
        pivot = i
      }
    }

    if (pivot < 0) {
      continue
    }

    ;[m[r], m[pivot]] = [m[pivot] as number[], m[r] as number[]]

    const row = m[r] as number[]

    for (let i = 0; i < m.length; i++) {
      if (i === r) {
        continue
      }

      const f = ((m[i] as number[])[c] as number) / (row[c] as number)

      if (f !== 0) {
        for (let k = c; k < columns; k++) {
          ;(m[i] as number[])[k] = ((m[i] as number[])[k] as number) - f * (row[k] as number)
        }
      }
    }

    r++
  }

  return r
}

// the four-component token's copy generators tau_z sigma_a and its mass term tau_x (code/rule/spinor-token), 4 x 4,
// index 2 tau + sigma
export function diracGenerators(): { gammas: ComplexMatrix[]; mass: ComplexMatrix; chirality: ComplexMatrix } {
  const kron = (t: Complex[], s: Complex[]): ComplexMatrix => {
    const re = new Float64Array(16)
    const im = new Float64Array(16)

    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        for (let c = 0; c < 2; c++) {
          for (let d = 0; d < 2; d++) {
            const x = t[a * 2 + b] as Complex
            const y = s[c * 2 + d] as Complex

            re[(2 * a + c) * 4 + (2 * b + d)] = x[0] * y[0] - x[1] * y[1]
            im[(2 * a + c) * 4 + (2 * b + d)] = x[0] * y[1] + x[1] * y[0]
          }
        }
      }
    }

    return { n: 4, re, im }
  }
  const one: Complex[] = [
    [1, 0],
    [0, 0],
    [0, 0],
    [1, 0],
  ]
  const gammas = (['x', 'y', 'z'] as const).map(a => kron(PAULI.z, PAULI[a]))
  // chirality = -i Gamma_x Gamma_y Gamma_z
  const product = complexMultiply(complexMultiply(gammas[0] as ComplexMatrix, gammas[1] as ComplexMatrix), gammas[2] as ComplexMatrix)
  const chirality: ComplexMatrix = { n: 4, re: Float64Array.from(product.im), im: Float64Array.from(product.re, x => -x) }

  return { gammas, mass: kron(PAULI.x, one), chirality }
}

export function commutes(a: ComplexMatrix, b: ComplexMatrix, sign: 1 | -1): number {
  return matrixDistance(complexMultiply(a, b), scale(complexMultiply(b, a), sign))
}

// ---------------------------------------------------------------------------------------------------------
// 4. the bulk

// how many D4 roots cast each husk step (the first three coordinates), keyed by the husk vector
export function huskShadows(): Map<string, number[][]> {
  const out = new Map<string, number[][]>()

  for (const r of rootsD4()) {
    const key = r.slice(0, 3).join(',')

    out.set(key, [...(out.get(key) ?? []), r])
  }

  return out
}

// the root of component (tau, s) of axis a under the bulk reading: tau (s e_a + e4), tau = +1 for index 0
export function componentRoot(tau: number, s: number, a: number): number[] {
  const r = [0, 0, 0, tau]

  r[a] = tau * s

  return r
}

// the spin lift of a unit quaternion q = w + x i + y j + z k: w - i (x sigma_x + y sigma_y + z sigma_z), a
// homomorphism of 2T into SU(2) (i -> -i sigma_x and so on)
export function spinLift(q: Quaternion): ComplexMatrix {
  const [w, x, y, z] = q

  return { n: 2, re: Float64Array.from([w, -y, y, w]), im: Float64Array.from([-z, -x, -x, z]) }
}

// the component projector |tau><tau| (x) (1 + s sigma_a) / 2 on the four-component token (index 2 tau + sigma)
export function componentProjector(tau: number, s: number, a: number): ComplexMatrix {
  const sigma = PAULI[(['x', 'y', 'z'] as const)[a] as 'x' | 'y' | 'z']
  const t = tau > 0 ? 0 : 1
  const re = new Float64Array(16)
  const im = new Float64Array(16)

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      re[(2 * t + i) * 4 + (2 * t + j)] = ((i === j ? 1 : 0) + s * (sigma[i * 2 + j] as Complex)[0]) / 2
      im[(2 * t + i) * 4 + (2 * t + j)] = (s * (sigma[i * 2 + j] as Complex)[1]) / 2
    }
  }

  return { n: 4, re, im }
}

export type ComponentCovariance = {
  // of 24 units x 12 components: how many images are a component projector, and how many of those sit on the root
  // the husk turn sends the component's root to (depth kept, husk part rotated)
  readonly monomial: number
  readonly rootsAgree: number
  readonly checks: number
  // the husk rotations read from the units (vector action on i, j, k): how many are signed permutations with
  // determinant 1, and how many distinct
  readonly properSigned: number
  readonly distinct: number
  // |U(-1) + 1|: the 2 pi turn is -1 on the doublet
  readonly twoPi: number
}

export function componentCovariance(): ComponentCovariance {
  const units = binaryTetrahedralGroup()
  const components: { tau: number; s: number; a: number; p: ComplexMatrix }[] = []

  for (const tau of [1, -1]) {
    for (const s of [1, -1]) {
      for (let a = 0; a < 3; a++) {
        components.push({ tau, s, a, p: componentProjector(tau, s, a) })
      }
    }
  }

  let monomial = 0
  let rootsAgree = 0
  let checks = 0
  let properSigned = 0
  const distinct = new Set<string>()
  let twoPi = 0

  for (const q of units) {
    const u = spinLift(q)
    const u4 = kronIdentity2(u)
    const u4d = daggerMatrix(u4)
    // the husk rotation: column b is the image of the b-th imaginary unit
    const rotation = [0, 1, 2].map(b => {
      const e: Quaternion = [0, 0, 0, 0]

      e[b + 1] = 1

      return vectorAction(q, e).slice(1).map(v => Math.round(v))
    })
    const signed = rotation.every(col => col.filter(v => v !== 0).length === 1)
    const det =
      (rotation[0]?.[0] ?? 0) * ((rotation[1]?.[1] ?? 0) * (rotation[2]?.[2] ?? 0) - (rotation[2]?.[1] ?? 0) * (rotation[1]?.[2] ?? 0)) -
      (rotation[1]?.[0] ?? 0) * ((rotation[0]?.[1] ?? 0) * (rotation[2]?.[2] ?? 0) - (rotation[2]?.[1] ?? 0) * (rotation[0]?.[2] ?? 0)) +
      (rotation[2]?.[0] ?? 0) * ((rotation[0]?.[1] ?? 0) * (rotation[1]?.[2] ?? 0) - (rotation[1]?.[1] ?? 0) * (rotation[0]?.[2] ?? 0))

    properSigned += signed && det === 1 ? 1 : 0
    distinct.add(rotation.flat().join(','))

    if (q[0] === -1) {
      twoPi = matrixDistance(u, scale(complexIdentity(2), -1))
    }

    for (const c of components) {
      const image = complexMultiply(complexMultiply(u4, c.p), u4d)
      const target = components.find(d => matrixDistance(d.p, image) < 1e-12)

      checks++

      if (!target) {
        continue
      }

      monomial++

      const root = componentRoot(c.tau, c.s, c.a)
      const moved = [0, 1, 2].map(i => [0, 1, 2].reduce((sum, b) => sum + (rotation[b]?.[i] ?? 0) * (root[b] ?? 0), 0))

      rootsAgree += [...moved, root[3]].join(',') === componentRoot(target.tau, target.s, target.a).join(',') ? 1 : 0
    }
  }

  return { monomial, rootsAgree, checks, properSigned, distinct: distinct.size, twoPi }
}

function kronIdentity2(u: ComplexMatrix): ComplexMatrix {
  const re = new Float64Array(16)
  const im = new Float64Array(16)

  for (let t = 0; t < 2; t++) {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        re[(2 * t + i) * 4 + (2 * t + j)] = u.re[i * 2 + j] as number
        im[(2 * t + i) * 4 + (2 * t + j)] = u.im[i * 2 + j] as number
      }
    }
  }

  return { n: 4, re, im }
}

// a pair of four-component tokens both in one uniform k = 0 orbital, the slot part in the coin eigenvector
// tau_x = sign for each, the spin part the singlet (label 'singlet') or the triplet's m = 0 member ('triplet'), as a
// 16-vector (index 4 first + second)
export function orbitalPair(sign: 1 | -1, spin: 'singlet' | 'triplet'): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(16)
  const im = new Float64Array(16)
  const slot = [Math.SQRT1_2, sign * Math.SQRT1_2]
  const other = spin === 'singlet' ? -1 : 1

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const si = i % 2
      const sj = j % 2
      const label = si === 0 && sj === 1 ? Math.SQRT1_2 : si === 1 && sj === 0 ? other * Math.SQRT1_2 : 0

      re[i * 4 + j] = (slot[Math.floor(i / 2)] as number) * (slot[Math.floor(j / 2)] as number) * label
    }
  }

  return { re, im }
}
