// The geometric phase of a role turned round a closed loop by the rule's links (OPEN-QTM-12). A role is a line of the
// 3 x 3 grid of points; its state is the line's stabilizer state, the rank-one projector (1/3) sum of the phase points on
// the line (code/measure/holonomy-caging phasePoints, exact in Q(zeta_9)). A link turns a role by its grid move lifted to
// Sigma(648) (holonomy-caging gridLifts). A closed loop of roles l_0 -> l_1 -> ... -> l_0, each step between lines of
// different directions (overlap 1/3, the slowest turn the group has: lines of one direction are orthogonal), has the
// Pancharatnam-Bargmann phase gamma = -arg prod <l_k | l_(k+1)>, which depends only on the rays.
//
//   gridLines         the 12 lines: direction (1,0), (0,1), (1,1), (1,2) (role, tilt and the two others), offset, points
//   lineStates        each line's projector and ket, exact; rank one and trace one checked
//   lineOverlaps      <l_a | l_b> for every pair, exact (kets unnormalized; the phase does not care)
//   exactPhase        gamma of a product as an exact multiple of pi/18: the float angle picks j, then B^2 = |B|^2 zeta_18^j is
//                     checked in the field
//   lineImage         the line a grid move carries a line to
//   pencilPermutations how the moves fixing a point permute the 4 lines through it
//   doubletBloch      the 4 lines through a point q lie in the +1 eigenspace of the phase point A(q), a 2-dim space: their
//                     Bloch vectors in an orthonormal basis of it (floats)
//   signedSolidAngle  the signed solid angle of a spherical polygon (fan of Van Oosterom-Strackee triangles)
//   coherentHalf, coherentOne spin-1/2 and spin-1 coherent states along a direction (the instrument's controls)
//   floatBargmannPhase -arg prod <psi_k|psi_(k+1)> on float kets
//   geodesicRefine    the geodesic between two rays of one 2-dim space split into k steps (float)
//
// EXACT: the lines, the overlaps, the phases (multiples of pi/18 checked in Q(zeta_9)). FLOAT: Bloch vectors and solid
// angles. DETERMINISM: no random numbers.

import {
  add,
  conj,
  equals,
  isZero,
  matMul,
  mul,
  sameMatrix,
  scale,
  toComplex,
  trace,
  zetaPower,
  dagger,
  ONE,
  ZERO,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'
import { phasePoints } from '@/code/measure/holonomy-caging'
import { type GridMoves } from '@/code/rule/vibe-weave'

export const DIRECTIONS: readonly (readonly [number, number])[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, 2],
]

const mod3 = (x: number): number => ((x % 3) + 3) % 3
const gridPoint = (x: number, y: number): number => mod3(x) + 3 * mod3(y)

export type GridLine = {
  direction: number
  offset: number
  points: number[]
}

// line index = direction * 3 + offset; the line of direction d with offset o passes through (0, o) for d != 1 and (o, 0)
// for d = 1
export function gridLines(): GridLine[] {
  const out: GridLine[] = []

  DIRECTIONS.forEach(([vx, vy], direction) => {
    for (let offset = 0; offset < 3; offset++) {
      const [bx, by] = direction === 1 ? [offset, 0] : [0, offset]
      const points = [0, 1, 2]
        .map(t => gridPoint(bx + t * vx, by + t * vy))
        .sort((a, b) => a - b)

      out.push({ direction, offset, points })
    }
  })

  return out
}

export const lineKey = (points: readonly number[]): string =>
  [...points].sort((a, b) => a - b).join(',')

export type LineState = {
  projector: Ninth[][]
  ket: Ninth[]
  rankOne: boolean
}

export function lineStates(lines: readonly GridLine[]): LineState[] {
  const A = phasePoints()
  // grid point x + 3 y is phase point 3 x + y
  const phaseOf = (p: number): number => 3 * (p % 3) + Math.floor(p / 3)

  return lines.map(line => {
    let projector: Ninth[][] = [0, 1, 2].map(() => [ZERO, ZERO, ZERO])

    for (const p of line.points) {
      const a = A[phaseOf(p)]!

      projector = projector.map((row, i) =>
        row.map((x, j) => add(x, scale(a[i]![j]!, 1, 3))),
      )
    }

    const column = [0, 1, 2].find(j => !isZero(projector[j]![j]!))!
    const ket = [0, 1, 2].map(i => projector[i]![column]!)

    return {
      projector,
      ket,
      rankOne:
        sameMatrix(matMul(projector, projector), projector) &&
        equals(trace(projector), ONE),
    }
  })
}

export const inner = (a: readonly Ninth[], b: readonly Ninth[]): Ninth =>
  a.reduce((s, x, i) => add(s, mul(conj(x), b[i]!)), ZERO)

export function lineOverlaps(states: readonly LineState[]): Ninth[][] {
  return states.map(a => states.map(b => inner(a.ket, b.ket)))
}

// zeta_18^j = (-1)^j zeta_9^(5 j)
const zeta18 = (j: number): Ninth => {
  const z = zetaPower(5 * j)

  return j % 2 === 0 ? z : scale(z, -1)
}

export type ExactPhase = {
  // gamma = -arg B in units of pi/18, 0 .. 35
  units: number
  exact: boolean
  // |B|^2 as a float, for display
  size: number
}

export function exactPhase(B: Ninth): ExactPhase {
  const [re, im] = toComplex(B)
  const arg = Math.atan2(im, re)
  const j = (((Math.round((arg * 18) / Math.PI) % 36) + 36) % 36)
  const N = mul(B, conj(B))
  const exact =
    !isZero(B) && equals(mul(B, B), mul(N, zeta18(j % 18)))

  return { units: (36 - j) % 36, exact, size: re * re + im * im }
}

export function lineImage(
  moves: GridMoves,
  m: number,
  line: GridLine,
  index: ReadonlyMap<string, number>,
): number {
  return index.get(lineKey(line.points.map(p => moves.act[m]![p]!))) ?? -1
}

// for each point q: the distinct permutations of the 4 lines through q made by the moves fixing q, and their parities
export function pencilPermutations(
  moves: GridMoves,
  lines: readonly GridLine[],
  q: number,
): { stabilizer: number; images: number; allEven: boolean; kernel: number } {
  const index = new Map(lines.map((l, i) => [lineKey(l.points), i]))
  const pencil = lines
    .map((l, i) => (l.points.includes(q) ? i : -1))
    .filter(i => i >= 0)
  const seen = new Set<string>()

  let stabilizer = 0
  let allEven = true
  let kernel = 0

  moves.act.forEach((act, m) => {
    if (act[q] !== q) {
      return
    }

    stabilizer++

    const perm = pencil.map(i =>
      pencil.indexOf(lineImage(moves, m, lines[i]!, index)),
    )

    seen.add(perm.join(''))

    if (perm.every((v, k) => v === k)) {
      kernel++
    }

    let inversions = 0

    for (let a = 0; a < 4; a++) {
      for (let b = a + 1; b < 4; b++) {
        if (perm[a]! > perm[b]!) {
          inversions++
        }
      }
    }

    allEven &&= inversions % 2 === 0
  })

  return { stabilizer, images: seen.size, allEven, kernel }
}

type Complex3 = [number, number][]

const floatKet = (ket: readonly Ninth[]): Complex3 => {
  const v = ket.map(toComplex)
  const n = Math.sqrt(v.reduce((s, [a, b]) => s + a * a + b * b, 0))

  return v.map(([a, b]) => [a / n, b / n] as [number, number])
}

const cInner = (a: Complex3, b: Complex3): [number, number] =>
  a.reduce<[number, number]>(
    (s, [ar, ai], i) => {
      const [br, bi] = b[i]!

      return [s[0] + ar * br + ai * bi, s[1] + ar * bi - ai * br]
    },
    [0, 0],
  )

export type Vector3 = [number, number, number]

// Bloch vectors of the given line states in the 2-dim space the first two span; `inSpace` the smallest norm kept
export function doubletBloch(states: readonly LineState[]): {
  bloch: Vector3[]
  inSpace: number
} {
  const kets = states.map(s => floatKet(s.ket))
  const e1 = kets[0]!
  const [or, oi] = cInner(e1, kets[1]!)
  const raw = kets[1]!.map(
    ([a, b], i) =>
      [
        a - (or * e1[i]![0] - oi * e1[i]![1]),
        b - (or * e1[i]![1] + oi * e1[i]![0]),
      ] as [number, number],
  )
  const rn = Math.sqrt(raw.reduce((s, [a, b]) => s + a * a + b * b, 0))
  const e2 = raw.map(([a, b]) => [a / rn, b / rn] as [number, number])

  let inSpace = Infinity

  const bloch = kets.map(psi => {
    const [c1r, c1i] = cInner(e1, psi)
    const [c2r, c2i] = cInner(e2, psi)
    const w1 = c1r * c1r + c1i * c1i
    const w2 = c2r * c2r + c2i * c2i

    inSpace = Math.min(inSpace, w1 + w2)

    // conj(c1) c2
    const xr = c1r * c2r + c1i * c2i
    const xi = c1r * c2i - c1i * c2r

    return [2 * xr, 2 * xi, w1 - w2] as Vector3
  })

  return { bloch, inSpace }
}

const dot = (a: Vector3, b: Vector3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vector3, b: Vector3): Vector3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

export function signedSolidAngle(n: readonly Vector3[]): number {
  let omega = 0

  for (let k = 1; k + 1 < n.length; k++) {
    const a = n[0]!
    const b = n[k]!
    const c = n[k + 1]!

    omega +=
      2 *
      Math.atan2(
        dot(a, cross(b, c)),
        1 + dot(a, b) + dot(b, c) + dot(c, a),
      )
  }

  return omega
}

export const angleOf = (v: Vector3): { theta: number; phi: number } => ({
  theta: Math.acos(Math.max(-1, Math.min(1, v[2]))),
  phi: Math.atan2(v[1], v[0]),
})

export function coherentHalf(v: Vector3): Complex3 {
  const { theta, phi } = angleOf(v)

  return [
    [Math.cos(theta / 2), 0],
    [Math.sin(theta / 2) * Math.cos(phi), Math.sin(theta / 2) * Math.sin(phi)],
  ]
}

export function coherentOne(v: Vector3): Complex3 {
  const { theta, phi } = angleOf(v)
  const c = Math.cos(theta / 2)
  const s = Math.sin(theta / 2)

  return [
    [c * c, 0],
    [Math.SQRT2 * s * c * Math.cos(phi), Math.SQRT2 * s * c * Math.sin(phi)],
    [s * s * Math.cos(2 * phi), s * s * Math.sin(2 * phi)],
  ]
}

// -arg prod <psi_k | psi_(k+1)>, cyclic, in (-pi, pi]
export function floatBargmannPhase(kets: readonly Complex3[]): number {
  let re = 1
  let im = 0

  for (let k = 0; k < kets.length; k++) {
    const [a, b] = cInner(kets[k]!, kets[(k + 1) % kets.length]!)

    ;[re, im] = [re * a - im * b, re * b + im * a]
  }

  return -Math.atan2(im, re)
}

// the geodesic from ray a to ray b (any dimension) in k equal steps, the endpoints excluded at the far end
export function geodesicRefine(
  a: Complex3,
  b: Complex3,
  k: number,
): Complex3[] {
  const [or, oi] = cInner(a, b)
  const r = Math.hypot(or, oi)
  // b rephased so <a|b'> = r > 0
  const bb = b.map(
    ([x, y]) =>
      [(x * or + y * oi) / r, (y * or - x * oi) / r] as [number, number],
  )
  const theta = Math.acos(Math.min(1, r))
  const out: Complex3[] = []

  for (let s = 0; s < k; s++) {
    const t = s / k
    const ca = Math.sin((1 - t) * theta) / Math.sin(theta)
    const cb = Math.sin(t * theta) / Math.sin(theta)

    out.push(
      a.map(
        ([x, y], i) =>
          [ca * x + cb * bb[i]![0], ca * y + cb * bb[i]![1]] as [
            number,
            number,
          ],
      ),
    )
  }

  return out
}

export const lineFloatKet = (s: LineState): Complex3 => floatKet(s.ket)

// U Pi U^dagger
export const conjugateProjector = (
  U: NinthMatrix,
  P: NinthMatrix,
): Ninth[][] => matMul(matMul(U, P), dagger(U))

// U v
export const applyMatrix = (U: NinthMatrix, v: readonly Ninth[]): Ninth[] =>
  U.map(row => row.reduce((s, x, j) => add(s, mul(x, v[j]!)), ZERO))
