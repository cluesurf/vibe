// READING A 4D MOTION AS A 3D DIRECTION: THE HOPF MAP AGAINST THE HUSK SHADOW (E-SPN-0158). A vibe's velocity is one of
// the 24 D4 roots (the stream takes a slot one dock along its root), and a band's group velocity is a convex mix of them.
// Physics is read on the 3d husk, so some map must send a 4d vector to a 3d one. Two candidates are compared here.
//
// - THE HOPF MAP. E-SPN-0152's isometry sends root r to the Hurwitz unit q = M r, 2 q = (r0 + r1, r0 - r1, r2 + r3,
//   r2 - r3), and q -> q i conj(q) sends the unit sphere onto the sphere of imaginary quaternions. On any vector it is the
//   quadratic form H(x) = (M x) i conj(M x) = ((x0^2 + x1^2 - x2^2 - x3^2) / 2, x0 x2 - x1 x3, -(x0 x3 + x1 x2)), with
//   |H(x)| = |x|^2 / 2 and H(-x) = H(x). Its differential at a unit q, dH_q(y) = (M y) i conj(q) + q i conj(M y), is
//   linear, kills the fiber line q i, and is twice an isometry on the rest.
// - THE HUSK SHADOW. At a dock touching a cusp, the horosphere's horizontal directions are the tangent space orthogonal
//   to the direction u of the cusp (an ideal vertex of the dock, a unit of the dual lattice D4*), so the shadow of a
//   vector is its orthogonal projection G_u(x) = x - (x . u) u, read in the cubic frame the tilted roots' shadows span.
//   The flat box's husk (drop coordinate 3) is G_u at u = e3.
//
// Every reading is returned in a cubic frame of its own (axes, face diagonals and body diagonals are then comparable),
// and read out by orientation-free moments: A2 = (3/2) tr T^2 - 1/2 of the trace-one second moment T (0 isotropic, 1 one
// axis), and A4, the l = 4 power of the |x|^4-weighted direction distribution, (35 |Q4|^2 - 30 |Q2|^2 + 3) / 8 (0 for a
// 4-design, 7/12 for the octahedron's six corners, 1 for one axis).
//
// DETERMINISM: no random numbers. EXACT: the Hopf corners, the rotations and the differential on the roots are doubled
// integer quaternions; the geometry is floats read against integer predictions.

import { ROOTS } from '@/code/measure/swap-sector'
import { qmul, rootToDoubled } from '@/code/measure/hurwitz-gauge'
import { horosphericalChart } from '@/code/measure/hyperbolic-lines'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import { rootsD4 as labelRoots } from '@/code/algebra/group/root-system'
import {
  baseCellVertices,
  cuspLayer,
  frameInverse,
  labelTransports,
  type LabelledCoin,
} from '@/code/substrate/coxeter/label-transport'
import {
  innerJ,
  matMul,
  matVec,
  type Vec,
} from '@/code/substrate/coxeter/minkowski'

const UNIT_I = [0, 1, 0, 0]
const conj = (q: readonly number[]): number[] => [
  q[0]!,
  -q[1]!,
  -q[2]!,
  -q[3]!,
]
const imag = (q: readonly number[]): number[] => [q[1]!, q[2]!, q[3]!]
const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

// ---- exact, on doubled Hurwitz units ----

// the six corners of the octahedron, +-i, +-j, +-k
export const CORNERS: readonly (readonly number[])[] = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
]
export const CORNER_NAMES: readonly string[] = [
  '+i',
  '-i',
  '+j',
  '-j',
  '+k',
  '-k',
]

// Q i conj(Q) for a doubled unit Q (|Q|^2 = 4): four times the Hopf image, real part 0 (returned as the fourth entry)
export function doubledHopf(Q: readonly number[]): {
  imag: number[]
  real: number
} {
  const p = qmul(qmul(Q, UNIT_I), conj(Q))

  return { imag: imag(p), real: p[0]! }
}

// the corner a root lands on (index into CORNERS), or -1
export function hopfCorner(root: readonly number[]): number {
  const h = doubledHopf(rootToDoubled(root))

  if (h.real !== 0) {
    return -1
  }

  return CORNERS.findIndex(c => c.every((x, k) => 4 * x === h.imag[k]))
}

// the rotation x -> q x conj(q) of a doubled unit, as an exact 3 x 3 matrix (column c the image of i, j, k), and whether
// every entry was an integer after dividing by 4
export function rotationOfDoubled(Q: readonly number[]): {
  R: number[][]
  exact: boolean
} {
  const cols = [
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ].map(e => imag(qmul(qmul(Q, e), conj(Q))))
  const exact = cols.every(c => c.every(x => x % 4 === 0))
  const R = [0, 1, 2].map(r => [0, 1, 2].map(c => cols[c]![r]! / 4))

  return { R, exact }
}

// the numerator of the Hopf differential at the doubled unit Q on the doubled vector Y: Y i conj(Q) + Q i conj(Y), whose
// quarter is dH_q(M y) (imaginary part; the real part is returned to confirm it is 0)
export function doubledDifferential(
  Q: readonly number[],
  Y: readonly number[],
): { imag: number[]; real: number } {
  const a = qmul(qmul(Y, UNIT_I), conj(Q))
  const b = qmul(qmul(Q, UNIT_I), conj(Y))
  const p = a.map((x, k) => x + b[k]!)

  return { imag: imag(p), real: p[0]! }
}

// ---- readings (floats) ----

export type Reading = {
  name: string
  family: 'shadow' | 'hopf' | 'hopf-differential'
  read: (x: readonly number[]) => number[]
  axesOk: boolean
}

const half = (x: readonly number[]): number[] =>
  rootToDoubled(x).map(v => v / 2)

// the Hopf map on any vector, H(x) = (M x) i conj(M x), in (i, j, k)
export function hopfReading(): Reading {
  return {
    name: 'hopf',
    family: 'hopf',
    read: x => {
      const X = half(x)

      return imag(qmul(qmul(X, UNIT_I), conj(X)))
    },
    axesOk: true,
  }
}

// the Hopf differential at the unit of root index q (linear, kernel the fiber line q i), in (i, j, k)
export function hopfDifferentialReading(q: number): Reading {
  const Q = half(ROOTS[q] as number[])

  return {
    name: `hopf-d ${q}`,
    family: 'hopf-differential',
    read: x => {
      const X = half(x)
      const a = qmul(qmul(X, UNIT_I), conj(Q))
      const b = qmul(qmul(Q, UNIT_I), conj(X))

      return imag(a.map((v, k) => v + b[k]!))
    },
    axesOk: true,
  }
}

// the shadow along a unit u of D4*: G_u(x) = x - (x . u) u, in the cubic frame of the tilted roots' shadows (sorted by
// the coordinate each is largest in, each oriented so that coordinate is positive)
export function shadowReading(
  u: readonly number[],
  name: string,
): Reading {
  const axes: number[][] = []

  for (const r of ROOTS) {
    const c = dot(r, u)

    if (Math.abs(c) < 1e-9) {
      continue
    }

    const s = r.map((x, k) => x - c * u[k]!)
    const n = Math.hypot(...s)
    const a = s.map(x => x / n)

    if (!axes.some(b => Math.abs(Math.abs(dot(a, b)) - 1) < 1e-9)) {
      axes.push(a)
    }
  }

  const lead = (a: readonly number[]): number =>
    a.reduce(
      (m, x, k) => (Math.abs(x) > Math.abs(a[m]!) + 1e-12 ? k : m),
      0,
    )
  const oriented = axes
    .map(a => (a[lead(a)]! < 0 ? a.map(x => -x) : a))
    .sort((a, b) => lead(a) - lead(b))
  const axesOk =
    oriented.length === 3 &&
    oriented.every(
      (a, i) =>
        oriented.every(
          (b, j) => Math.abs(dot(a, b) - (i === j ? 1 : 0)) < 1e-12,
        ) && Math.abs(dot(a, u)) < 1e-12,
    )

  return {
    name,
    family: 'shadow',
    read: x => oriented.map(a => dot(a, x)),
    axesOk,
  }
}

// the 24 units of D4* (the directions of a dock's 24 ideal vertices, when its facet normals are the roots)
export function dualUnits(): number[][] {
  const out: number[][] = []

  for (let k = 0; k < 4; k++) {
    for (const s of [1, -1]) {
      out.push([0, 1, 2, 3].map(i => (i === k ? s : 0)))
    }
  }

  for (let m = 0; m < 16; m++) {
    out.push([0, 1, 2, 3].map(i => ((m >> i) & 1 ? -0.5 : 0.5)))
  }

  return out
}

export const isDualUnit = (u: readonly number[], tol = 1e-9): boolean =>
  (u.filter(x => Math.abs(Math.abs(x) - 1) < tol).length === 1 &&
    u.filter(x => Math.abs(x) < tol).length === 3) ||
  u.every(x => Math.abs(Math.abs(x) - 0.5) < tol)

// ---- orientation-free statistics of a weighted 3d point set ----

export type Point3 = { w: number; x: readonly number[] }
export type Moments = {
  A2: number
  A4: number
  T: number[][]
  nullShare: number
}

export function readingMoments(
  points: readonly Point3[],
  tol = 1e-12,
): Moments {
  let total = 0
  let scale = 0

  for (const p of points) {
    total += p.w
    scale = Math.max(scale, Math.hypot(...p.x))
  }

  const T = [0, 1, 2].map(() => [0, 0, 0])
  const Q2 = [0, 1, 2].map(() => [0, 0, 0])
  const Q4 = new Float64Array(81)

  let s2 = 0
  let s4 = 0
  let nulls = 0

  for (const p of points) {
    const r2 = dot(p.x, p.x)

    if (Math.sqrt(r2) <= tol * scale) {
      nulls += p.w
      continue
    }

    s2 += p.w * r2
    s4 += p.w * r2 * r2
  }

  for (const p of points) {
    const r2 = dot(p.x, p.x)

    if (Math.sqrt(r2) <= tol * scale) {
      continue
    }

    const n = p.x.map(v => v / Math.sqrt(r2))
    const w4 = (p.w * r2 * r2) / s4

    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        T[a]![b]! += (p.w * p.x[a]! * p.x[b]!) / s2
        Q2[a]![b]! += w4 * n[a]! * n[b]!

        for (let c = 0; c < 3; c++) {
          for (let d = 0; d < 3; d++) {
            Q4[((a * 3 + b) * 3 + c) * 3 + d]! +=
              w4 * n[a]! * n[b]! * n[c]! * n[d]!
          }
        }
      }
    }
  }

  const frob = (m: number[][]): number =>
    m.reduce((s, row) => s + row.reduce((t, v) => t + v * v, 0), 0)
  const q4 = Q4.reduce((s, v) => s + v * v, 0)

  return {
    A2: 1.5 * frob(T) - 0.5,
    A4: (35 * q4 - 30 * frob(Q2) + 3) / 8,
    T,
    nullShare: total > 0 ? nulls / total : 0,
  }
}

// the seven directions of E-SPN-0136 in a reading's cubic frame: e1, e2, e3, e12, e13, e23, e123
export const SUPPORT_DIRECTIONS: readonly {
  name: string
  n: number[]
}[] = [
  ['e1', [1, 0, 0]],
  ['e2', [0, 1, 0]],
  ['e3', [0, 0, 1]],
  ['e12', [1, 1, 0]],
  ['e13', [1, 0, 1]],
  ['e23', [0, 1, 1]],
  ['e123', [1, 1, 1]],
].map(([name, n]) => ({
  name: name as string,
  n: (n as number[]).map(v => v / Math.hypot(...(n as number[]))),
}))

// the four wave directions of E-SPN-0157 in a reading's cubic frame
export const WAVE_DIRECTIONS: readonly { name: string; n: number[] }[] =
  [
    ['axis', [1, 0, 0]],
    ['face', [1, 1, 0]],
    ['body', [1, 1, 1]],
    ['generic', [2, 1, 0]],
  ].map(([name, n]) => ({
    name: name as string,
    n: (n as number[]).map(v => v / Math.hypot(...(n as number[]))),
  }))

// the largest n . x over the points, per direction, and the largest over the least
export function supportSpread(
  points: readonly Point3[],
  dirs: readonly { n: readonly number[] }[],
): { top: number[]; spread: number } {
  const top = dirs.map(d =>
    points.reduce(
      (m, p) => (p.w > 0 ? Math.max(m, dot(d.n, p.x)) : m),
      Number.NEGATIVE_INFINITY,
    ),
  )
  const least = Math.min(...top)

  return {
    top,
    spread:
      least > 0 ? Math.max(...top) / least : Number.POSITIVE_INFINITY,
  }
}

// the weight whose reading is perpendicular to kappa (a class that never moves along kappa), over the total
export function frozenShare(
  points: readonly Point3[],
  kappa: readonly number[],
  tol = 1e-12,
): number {
  let total = 0
  let frozen = 0

  for (const p of points) {
    total += p.w

    if (Math.abs(dot(kappa, p.x)) <= tol * (1 + Math.hypot(...p.x))) {
      frozen += p.w
    }
  }

  return frozen / total
}

// ---- the husk shadow of every line at the cusp-layer docks ----

export type LayerLine = {
  slot: number
  direction: number[]
  onLayer: number
}
export type LayerDock = {
  key: string
  skin: number
  cusp: number[]
  rootError: number
  lines: LayerLine[]
}

// the root coordinates of a tangent vector at the base center, read through the labelled facet directions (whose Gram
// matrix is the roots' up to one scale): x . r_k = (2 / s) <t, d_k>, x = (1/12) sum_k (x . r_k) r_k; and the largest
// disagreement of the reconstructed inner products (0 when t lies in the tangent space)
export function tangentRootCoordinates(
  coin: LabelledCoin,
  t: Vec,
): { x: number[]; error: number } {
  const { metric } = coin.frame
  const roots = labelRoots()
  const s = innerJ(coin.directions[0]!, coin.directions[0]!, metric)
  const along = coin.directions.map(d => (2 / s) * innerJ(t, d, metric))
  const x = [0, 1, 2, 3].map(
    i => roots.reduce((acc, r, k) => acc + along[k]! * r[i]!, 0) / 12,
  )
  const size = Math.max(...along.map(Math.abs), 1e-300)
  const error =
    Math.max(...roots.map((r, k) => Math.abs(dot(x, r) - along[k]!))) /
    size

  return { x, error }
}

// Every cusp-layer dock to the given skin: the direction u of the cusp from its center in root coordinates (unit), and
// for each of its 12 lines (first slot of each line) the husk-chart direction of the line's shadow, oriented along the
// slot's root (the chart position `trace` steps forward minus `trace` steps back), and how many of its docks lie on the
// layer (E-SPN-0156's H3' reading, made general).
export function layerShadows(
  coin: LabelledCoin,
  skin: number,
  trace = 6,
): { docks: LayerDock[]; axesError: number } {
  const { center, metric } = coin.frame
  const chart = horosphericalChart(coin)
  const antipodal = labelTransports({ coin, kind: 'antipodal' })
  const layer = cuspLayer({ coin, skinRadius: skin })
  const { vertex } = baseCellVertices(coin)
  const cc = innerJ(center, center, metric)
  const docks: LayerDock[] = []

  for (const m of layer.members) {
    let w = matVec(frameInverse(coin, m.frame), vertex)

    if (innerJ(w, center, metric) > 0) {
      w = w.map(v => -v)
    }

    const along = innerJ(w, center, metric) / cc
    const t = w.map((v, a) => v - along * center[a]!)
    const rc = tangentRootCoordinates(coin, t)
    const norm = Math.hypot(...rc.x)
    const lines: LayerLine[] = []

    for (const f of LINE_FIRSTS) {
      const forward: Vec[] = []
      const backward: Vec[] = []

      let g = m.frame
      let h = m.frame

      for (let n = 0; n <= trace; n++) {
        forward.push(matVec(g, center))
        backward.push(matVec(h, center))
        g = matMul(g, antipodal[f]!)
        h = matMul(h, antipodal[coin.opposite[f]!]!)
      }

      const points = [...backward.slice(1).reverse(), ...forward]
      const onLayer = points.filter(
        p =>
          Math.abs(chart.level(p) - chart.layerLevel) <
          1e-9 * chart.layerLevel,
      ).length
      const xs = points.map(chart.coordinates)
      const whole = xs[xs.length - 1]!.map((v, a) => v - xs[0]![a]!)
      const size = Math.hypot(...whole)

      lines.push({
        slot: f,
        direction: whole.map(v => v / size),
        onLayer,
      })
    }

    docks.push({
      key: m.key,
      skin: m.skin,
      cusp: rc.x.map(v => v / norm),
      rootError: rc.error,
      lines,
    })
  }

  return { docks, axesError: chart.axesError }
}
