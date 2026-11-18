// THE STATIC FIELD BELOW A CUSP WITH DEPTH-WEIGHTED COLUMNS (E-GRV-0154, item vibe-roadmap-board-0049, gap B-52,
// future-models.md family 3). E-GRV-0150 found that the true mesh's own graph Laplacian, read on the husk, is screened
// along the husk: the bulk below a cusp is the side that grows, a sink and not a shortcut. Family 3 reads the husk as a
// brane at the cusp, as in Randall-Sundrum II, where each column is weighted by a warp factor that falls with depth
// instead of summed flat. This file solves that static problem and reads whether a point source on the husk gives 1/r
// without a floor. The gates were fixed in the item's `what` (gate 9352f87a80ac) before this file was written.
//
// WHAT IS SOLVED. The cells of the mesh at Busemann level at most F (the husk at level 1, odd levels, E-CSM-0060),
// taken modulo the cusp's cubic translations (one husk window), as in code/measure/cusp-green buildCuspQuotient, which
// is copied here only to also keep each floor link's far level. A cell at level l gets weight w(l) = l^-p, a link the
// geometric mean c = sqrt(w(la) w(lb)), and the field the energy sum over links c (phi_a - phi_b)^2. The cusp's Z^3
// translations reduce the static problem to one column per husk momentum k: all the cells of one husk window down to
// the floor, with the Bloch phase e^(ik.shift) on every link that crosses the window. DIRICHLET: a link below the floor
// ends on a cell held at 0 (its c on the diagonal). REFLECTING: the truncated weighted Laplacian.
//
// THE WEIGHTS. p = 0 FLAT (the control, E-GRV-0150's operator 24 - A). p = 1 WARP: in the depth y = ln l below the
// husk the true mesh's metric is e^(2y) dx^2 + dy^2 (curvature 1), a warp e^y = l that grows; the RS-II warp falls,
// e^(-y) = 1/l, and the column is weighted by it. p = 3 AREA: the horosphere at level l has area l^3 a husk window
// exactly (B(c, v) scales as 1/z), so each horosphere is counted once. p = 2, 4, 6: a sweep, not derived. Chosen, not
// derived: the power law on cells, the geometric-mean link, isotropy (one weight for every link direction), and the
// brane at level 1.
//
// DERIVED BEFORE THE CODE. In the continuum the weighted energy has horizontal density e^((1 - p) y) and vertical
// density e^((3 - p) y). So the husk stiffness K = integral of the first is finite iff p > 1, and the column's
// resistance to the floor, integral of the inverse of the second, diverges with depth iff p >= 3, growing as
// F^(p - 3) (as ln F at p = 3). A finite resistance R is a screening mass 1/R on the husk, so the infinite mesh is
// unscreened, 1/(4 pi K r) at long range, iff p >= 3, and the length xi = sqrt(K R) a floor at F allows grows as
// F^((p - 3) / 2). The horosphere area sits exactly on the threshold.
//
// THE BRACKET (a theorem the instrument checks). For every k, the Dirichlet column's Schur complement on the husk is
// at least the infinite mesh's and the reflecting one's at most, so G_D(k; F) <= G_inf(k) <= G_R(k; F), G_D rises with F.
//
// GATES (fixed in the item before code, never moved): I1 to I6 instrument, C control, B1 to B3 the pass bar, read off
// below where each is computed. VERDICT: open if I1 to I6 or C fail; pass if WARP or AREA meets B1, B2 and B3; partial
// if WARP or AREA meets B1 and B2 but not B3, or only a sweep exponent meets all three; fail otherwise.
//
// Depth L1: exact linear algebra on the true mesh against a derived prediction; no rule is run.
// DETERMINISM: the mesh, its quotients and the momentum grid are fixed; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import {
  besselLatticeGreen,
  buildCuspQuotient,
  fieldAt,
  huskTransform,
  type HuskField,
} from '@/code/measure/cusp-green'
import { buildExactCusp } from '@/code/substrate/coxeter/exact-cusp'
import {
  labelledCoin,
  labelTransports,
} from '@/code/substrate/coxeter/label-transport'
import { buildLabelledRegion } from '@/code/substrate/coxeter/labelled-region'
import { horosphericalChart } from '@/code/measure/hyperbolic-lines'
import {
  identity,
  matMul,
  matVec,
} from '@/code/substrate/coxeter/minkowski'

const SLOTS = 24

export type DepthPlan = {
  floors: number[]
  // the floors whose R enter the exponent q, in order
  qFloors: [number, number, number]
  read: number
  bracket: number
  side: number
  exponents: { name: string; p: number; derived: boolean }[]
  bracketExponents: number[]
  // the I2 neighbourhood: graph depth and period of the exact cusp
  exactDepth: number
}

export const GATE_PLAN: DepthPlan = {
  floors: [9, 17, 33, 49],
  qFloors: [17, 33, 49],
  read: 49,
  bracket: 33,
  side: 16,
  exponents: [
    { name: 'FLAT', p: 0, derived: true },
    { name: 'WARP', p: 1, derived: true },
    { name: 'p2', p: 2, derived: false },
    { name: 'AREA', p: 3, derived: true },
    { name: 'p4', p: 4, derived: false },
    { name: 'p6', p: 6, derived: false },
  ],
  bracketExponents: [3, 6],
  exactDepth: 2,
}

// E-CSM-0060's window counts per odd level, 1 to 33 (as E-GRV-0150)
const WINDOW_COUNTS = [
  1, 12, 30, 56, 108, 132, 182, 360, 306, 380, 672, 552, 750, 972, 870,
  992, 1584,
]

// E-GRV-0150's printed values, the control
const CONTROL_AXIS = [0.04359, 1.927e-3, 8.583e-5, 3.854e-6, 1.744e-7]
const CONTROL_K: Record<number, number> = {
  17: 10.701,
  33: 20.229,
  49: 29.823,
}

// ---------------------------------------------------------------------------------------------------------------
// the column quotient, as buildCuspQuotient, with each floor link's far level kept

export type Column = {
  readonly cells: number
  readonly floor: number
  readonly level: Int32Array
  // 24 per cell: the neighbour's index, -1 below the floor (or missing)
  readonly neighbour: Int32Array
  // 72 per cell: the integer lattice shift of each link's far end
  readonly shift: Int32Array
  // 72 per cell: each link's horizontal displacement
  readonly step: Float64Array
  // 24 per cell: the far end's level, for kept and floor links alike (0 when missing)
  readonly farLevel: Int32Array
  readonly missing: number
  readonly floorLinks: number
  readonly offInteger: number
  readonly inconsistent: number
  // every floor link's far level is above the floor
  readonly floorBelow: boolean
}

export function buildColumn(floor: number): Column {
  const coin = labelledCoin()
  const chart = horosphericalChart(coin)
  const tau = labelTransports({ coin, kind: 'antipodal' })
  const c0 = coin.frame.center
  const levelOf = (p: number[]): number =>
    chart.level(p) / chart.layerLevel
  const region = buildLabelledRegion({
    coin,
    seeds: [identity(c0.length)],
    radius: 1_000_000,
    accept: g => {
      const p = matVec(g, c0)
      const l = levelOf(p)

      if (l > floor + 1e-9) {
        return false
      }

      const margin = 0.5 + 2 / Math.max(l, 1)

      return chart.coordinates(p).every(v => Math.abs(v) <= margin)
    },
  })
  const position = region.frames.map(g => {
    const p = matVec(g, c0)

    return { l: levelOf(p), x: chart.coordinates(p) }
  })

  let offInteger = 0

  const wrap = (v: number): number => v - Math.floor(v + 0.5)
  const roundLevel = (l: number): number => {
    const k = Math.round(l)

    if (Math.abs(l - k) > 1e-7) {
      offInteger++
    }

    return k
  }
  const keyOf = (l: number, x: number[]): string =>
    `${roundLevel(l)}|${x.map(v => Math.round(wrap(v) * 1e6)).join(',')}`
  const inWindow = (x: number[]): boolean =>
    x.every(v => v >= -0.5 - 1e-9 && v < 0.5 - 1e-9)
  const window: number[] = []
  const index = new Map<string, number>()

  position.forEach((p, i) => {
    if (inWindow(p.x)) {
      index.set(keyOf(p.l, p.x), window.length)
      window.push(i)
    }
  })

  const cells = window.length
  const level = new Int32Array(cells)
  const neighbour = new Int32Array(SLOTS * cells).fill(-1)
  const shift = new Int32Array(3 * SLOTS * cells)
  const step = new Float64Array(3 * SLOTS * cells)
  const farLevel = new Int32Array(SLOTS * cells)

  let missing = 0
  let floorLinks = 0
  let floorBelow = true

  window.forEach((i, a) => {
    const here = position[i]!

    level[a] = roundLevel(here.l)

    for (let d = 0; d < SLOTS; d++) {
      const j = region.neighbour[i * SLOTS + d]!

      if (j < 0) {
        const p = matVec(matMul(region.frames[i]!, tau[d]!), c0)
        const l = levelOf(p)

        if (l > floor + 1e-9) {
          floorLinks++

          const far = roundLevel(l)

          farLevel[SLOTS * a + d] = far
          floorBelow &&= far > floor
        } else {
          missing++
        }

        continue
      }

      const there = position[j]!
      const b = index.get(keyOf(there.l, there.x))

      if (b === undefined) {
        missing++
        continue
      }

      neighbour[SLOTS * a + d] = b
      farLevel[SLOTS * a + d] = roundLevel(there.l)

      for (let c = 0; c < 3; c++) {
        shift[3 * (SLOTS * a + d) + c] = Math.floor(there.x[c]! + 0.5)
        step[3 * (SLOTS * a + d) + c] = there.x[c]! - here.x[c]!
      }
    }
  })

  return {
    cells,
    floor,
    level,
    neighbour,
    shift,
    step,
    farLevel,
    missing,
    floorLinks,
    offInteger,
    inconsistent: region.inconsistentSteps,
    floorBelow,
  }
}

// ---------------------------------------------------------------------------------------------------------------
// weighted periodic graphs

export type FloorKind = 'dirichlet' | 'reflecting'

export type WeightedGraph = {
  readonly cells: number
  // 24 per cell, -1 for none
  readonly neighbour: Int32Array
  readonly shift: Int32Array
  readonly step: Float64Array
  // 24 per cell: the link's weight (kept links)
  readonly weight: Float64Array
  readonly diagonal: Float64Array
  // the diagonal's floor part: the summed weights of the links that end on the Dirichlet floor (0 when reflecting)
  readonly floorWeight: Float64Array
}

const cellWeight = (p: number) => (l: number): number => l ** -p
const linkWeight = (w: (l: number) => number) => (la: number, lb: number): number =>
  Math.sqrt(w(la) * w(lb))

// the column as a weighted graph, links weighted by the levels of their two ends
export function weightedColumn(
  q: Column,
  c: (la: number, lb: number) => number,
  kind: FloorKind,
): WeightedGraph {
  const weight = new Float64Array(SLOTS * q.cells)
  const diagonal = new Float64Array(q.cells)
  const floorWeight = new Float64Array(q.cells)

  for (let a = 0; a < q.cells; a++) {
    let s = 0
    let f = 0

    for (let d = 0; d < SLOTS; d++) {
      const e = SLOTS * a + d
      const far = q.farLevel[e]!

      if (far === 0) {
        continue
      }

      const v = c(q.level[a]!, far)

      if (q.neighbour[e]! >= 0) {
        weight[e] = v
        s += v
      } else if (kind === 'dirichlet') {
        f += v
      }
    }

    diagonal[a] = s + f
    floorWeight[a] = f
  }

  return {
    cells: q.cells,
    neighbour: q.neighbour,
    shift: q.shift,
    step: q.step,
    weight,
    diagonal,
    floorWeight,
  }
}

// each cell's graph distance from the husk (level 1), over the kept links of the column
export function columnDepth(q: Column): Int32Array {
  const depth = new Int32Array(q.cells).fill(-1)
  const queue: number[] = []

  for (let a = 0; a < q.cells; a++) {
    if (q.level[a] === 1) {
      depth[a] = 0
      queue.push(a)
    }
  }

  for (let head = 0; head < queue.length; head++) {
    const a = queue[head]!

    for (let d = 0; d < SLOTS; d++) {
      const b = q.neighbour[SLOTS * a + d]!

      if (b >= 0 && depth[b] === -1) {
        depth[b] = depth[a]! + 1
        queue.push(b)
      }
    }
  }

  return depth
}

// the column cut to graph depth at most `max`, links weighted by the depths of their two ends, Dirichlet below
export function depthColumn(
  q: Column,
  depth: Int32Array,
  max: number,
  c: (da: number, db: number) => number,
): { graph: WeightedGraph; counts: number[]; complete: boolean; husk: number } {
  const newOf = new Int32Array(q.cells).fill(-1)
  const kept: number[] = []

  for (let a = 0; a < q.cells; a++) {
    if (depth[a]! >= 0 && depth[a]! <= max) {
      newOf[a] = kept.length
      kept.push(a)
    }
  }

  const n = kept.length
  const neighbour = new Int32Array(SLOTS * n).fill(-1)
  const shift = new Int32Array(3 * SLOTS * n)
  const step = new Float64Array(3 * SLOTS * n)
  const weight = new Float64Array(SLOTS * n)
  const diagonal = new Float64Array(n)
  const floorWeight = new Float64Array(n)
  const counts: number[] = []

  let complete = true

  kept.forEach((a, x) => {
    counts[depth[a]!] = (counts[depth[a]!] ?? 0) + 1

    for (let d = 0; d < SLOTS; d++) {
      const e = SLOTS * a + d
      const b = q.neighbour[e]!

      // a link the column lacks leads below its level floor; with every cell of depth <= max present (counts), it can
      // only come from a depth-max cell and end at depth max + 1, a floor link of the cut
      if (b < 0) {
        if (depth[a] === max) {
          diagonal[x] = diagonal[x]! + c(max, max + 1)
          floorWeight[x] = floorWeight[x]! + c(max, max + 1)
        } else {
          complete = false
        }

        continue
      }

      const v = c(depth[a]!, depth[b]!)

      diagonal[x] = diagonal[x]! + v

      if (newOf[b]! < 0) {
        floorWeight[x] = floorWeight[x]! + v
      } else {
        const f = SLOTS * x + d

        neighbour[f] = newOf[b]!
        weight[f] = v

        for (let k = 0; k < 3; k++) {
          shift[3 * f + k] = q.shift[3 * e + k]!
          step[3 * f + k] = q.step[3 * e + k]!
        }
      }
    }
  })

  const husk = kept.findIndex(a => q.level[a] === 1)

  return {
    graph: { cells: n, neighbour, shift, step, weight, diagonal, floorWeight },
    counts,
    complete,
    husk,
  }
}

const huskOf = (q: Column): number => Array.from(q.level).indexOf(1)

// ---------------------------------------------------------------------------------------------------------------
// solvers

export type Solve = {
  readonly re: Float64Array
  readonly im: Float64Array
  readonly iterations: number
  readonly residual: number
}

// x = H(k)^-1 e_source, H(k)_ab = D_a delta_ab - sum over links a -> b of c e^(i k . shift), by conjugate gradient
// preconditioned with the diagonal (H is Hermitian, positive definite on a Dirichlet floor and for k != 0)
export function blochWeighted(
  g: WeightedGraph,
  k: readonly number[],
  source: number,
  tolerance = 1e-14,
  maxIterations = 400_000,
): Solve {
  const n = g.cells
  const links = g.neighbour.length
  const cr = new Float64Array(links)
  const ci = new Float64Array(links)
  const floorPart = g.floorWeight

  for (let e = 0; e < links; e++) {
    if (g.neighbour[e]! < 0) {
      continue
    }

    const t =
      k[0]! * g.shift[3 * e]! +
      k[1]! * g.shift[3 * e + 1]! +
      k[2]! * g.shift[3 * e + 2]!

    cr[e] = Math.cos(t)
    ci[e] = Math.sin(t)
  }

  // in Laplacian form, sum over links c (x_a - phase x_b) plus the floor part, so a field that is large and nearly
  // constant (a deep Dirichlet column at k = 0) keeps its residual at the float floor of its differences
  const apply = (
    xr: Float64Array,
    xi: Float64Array,
    yr: Float64Array,
    yi: Float64Array,
  ): void => {
    for (let a = 0; a < n; a++) {
      const ar = xr[a]!
      const ai = xi[a]!

      let sr = floorPart[a]! * ar
      let si = floorPart[a]! * ai

      for (let d = 0; d < SLOTS; d++) {
        const e = a * SLOTS + d
        const b = g.neighbour[e]!

        if (b < 0) {
          continue
        }

        const ur = xr[b]!
        const ui = xi[b]!
        const c = g.weight[e]!

        sr += c * (ar - (cr[e]! * ur - ci[e]! * ui))
        si += c * (ai - (cr[e]! * ui + ci[e]! * ur))
      }

      yr[a] = sr
      yi[a] = si
    }
  }

  const xr = new Float64Array(n)
  const xi = new Float64Array(n)
  const rr = new Float64Array(n)
  const ri = new Float64Array(n)

  rr[source] = 1

  const zr = new Float64Array(n)
  const zi = new Float64Array(n)
  const pr = new Float64Array(n)
  const pi = new Float64Array(n)
  const wr = new Float64Array(n)
  const wi = new Float64Array(n)

  let rz = 0

  for (let a = 0; a < n; a++) {
    zr[a] = rr[a]! / g.diagonal[a]!
    zi[a] = ri[a]! / g.diagonal[a]!
    pr[a] = zr[a]!
    pi[a] = zi[a]!
    rz += rr[a]! * zr[a]! + ri[a]! * zi[a]!
  }

  let iterations = 0
  let norm = 1

  while (iterations < maxIterations && norm >= tolerance) {
    apply(pr, pi, wr, wi)

    let pw = 0

    for (let a = 0; a < n; a++) {
      pw += pr[a]! * wr[a]! + pi[a]! * wi[a]!
    }

    const alpha = rz / pw

    let next = 0
    let rn = 0

    for (let a = 0; a < n; a++) {
      xr[a] = xr[a]! + alpha * pr[a]!
      xi[a] = xi[a]! + alpha * pi[a]!
      rr[a] = rr[a]! - alpha * wr[a]!
      ri[a] = ri[a]! - alpha * wi[a]!
      zr[a] = rr[a]! / g.diagonal[a]!
      zi[a] = ri[a]! / g.diagonal[a]!
      next += rr[a]! * zr[a]! + ri[a]! * zi[a]!
      rn += rr[a]! * rr[a]! + ri[a]! * ri[a]!
    }

    iterations++
    norm = Math.sqrt(rn)

    const beta = next / rz

    rz = next

    for (let a = 0; a < n; a++) {
      pr[a] = zr[a]! + beta * pr[a]!
      pi[a] = zi[a]! + beta * pi[a]!
    }
  }

  apply(xr, xi, wr, wi)
  wr[source] = wr[source]! - 1

  let residual = 0

  for (let a = 0; a < n; a++) {
    residual += wr[a]! * wr[a]! + wi[a]! * wi[a]!
  }

  return { re: xr, im: xi, iterations, residual: Math.sqrt(residual) }
}

// real symmetric positive (semi)definite solve A x = b by diagonal-preconditioned conjugate gradient
function realPcg(
  n: number,
  apply: (x: Float64Array, y: Float64Array) => void,
  diagonal: Float64Array,
  b: Float64Array,
  tolerance: number,
  maxIterations: number,
): { x: Float64Array; iterations: number; residual: number } {
  const x = new Float64Array(n)
  const r = Float64Array.from(b)
  const z = new Float64Array(n)
  const p = new Float64Array(n)
  const w = new Float64Array(n)
  const scale = Math.sqrt(b.reduce((s, v) => s + v * v, 0))

  let rz = 0

  for (let a = 0; a < n; a++) {
    z[a] = r[a]! / diagonal[a]!
    p[a] = z[a]!
    rz += r[a]! * z[a]!
  }

  let iterations = 0
  let norm = scale

  while (iterations < maxIterations && norm > tolerance * scale) {
    apply(p, w)

    let pw = 0

    for (let a = 0; a < n; a++) {
      pw += p[a]! * w[a]!
    }

    const alpha = rz / pw

    let next = 0
    let rn = 0

    for (let a = 0; a < n; a++) {
      x[a] = x[a]! + alpha * p[a]!
      r[a] = r[a]! - alpha * w[a]!
      z[a] = r[a]! / diagonal[a]!
      next += r[a]! * z[a]!
      rn += r[a]! * r[a]!
    }

    iterations++
    norm = Math.sqrt(rn)

    const beta = next / rz

    rz = next

    for (let a = 0; a < n; a++) {
      p[a] = z[a]! + beta * p[a]!
    }
  }

  apply(x, w)

  let residual = 0

  for (let a = 0; a < n; a++) {
    residual += (w[a]! - b[a]!) ** 2
  }

  return { x, iterations, residual: Math.sqrt(residual) / scale }
}

// the husk-axis stiffness of a reflecting weighted column: K = sum over links c dx^2 - b^T L^+ b, b_a = sum c dx
export function weightedStiffness(
  g: WeightedGraph,
  axis: number,
): { K: number; bare: number; iterations: number; residual: number } {
  const n = g.cells
  const b = new Float64Array(n)

  let bare = 0

  for (let a = 0; a < n; a++) {
    for (let d = 0; d < SLOTS; d++) {
      const e = SLOTS * a + d

      if (g.neighbour[e]! < 0) {
        continue
      }

      const dx = g.step[3 * e + axis]!
      const c = g.weight[e]!

      bare += (c * dx * dx) / 2
      b[a] = b[a]! + c * dx
    }
  }

  const apply = (x: Float64Array, y: Float64Array): void => {
    for (let a = 0; a < n; a++) {
      let s = g.diagonal[a]! * x[a]!

      for (let d = 0; d < SLOTS; d++) {
        const e = SLOTS * a + d
        const j = g.neighbour[e]!

        if (j >= 0) {
          s -= g.weight[e]! * x[j]!
        }
      }

      y[a] = s
    }
  }

  const s = realPcg(n, apply, g.diagonal, b, 1e-13, 2_000_000)

  let relaxation = 0

  for (let a = 0; a < n; a++) {
    relaxation += b[a]! * s.x[a]!
  }

  return {
    K: bare - relaxation,
    bare,
    iterations: s.iterations,
    residual: s.residual,
  }
}

// ---------------------------------------------------------------------------------------------------------------
// the lattice Green's function (mu - A)^-1 on Z^3, mu >= 6: integral over t of e^(-(mu - 6) t) prod_i e^(-2t) I_n(2t)

function scaledBessel(n: number, x: number): number {
  if (x <= 100) {
    const h = x / 2

    let term = 1

    for (let j = 1; j <= n; j++) {
      term *= h / j
    }

    let sum = term

    for (let m = 1; m < 2000; m++) {
      term *= (h * h) / (m * (m + n))
      sum += term

      if (term < 1e-18 * sum) {
        break
      }
    }

    return sum * Math.exp(-x)
  }

  // the asymptotic series, which converges well here (n <= 8, x > 100)
  const mu = 4 * n * n

  let term = 1
  let sum = 1

  for (let k = 1; k < 60; k++) {
    const next = (-term * (mu - (2 * k - 1) ** 2)) / (8 * k * x)

    if (Math.abs(next) > Math.abs(term)) {
      break
    }

    term = next
    sum += term

    if (Math.abs(term) < 1e-18) {
      break
    }
  }

  return sum / Math.sqrt(2 * Math.PI * x)
}

const GL_NODES = [
  -0.9894009349916499, -0.9445750230732326, -0.8656312023878318,
  -0.755404408355003, -0.6178762444026438, -0.4580167776572274,
  -0.2816035507792589, -0.0950125098376374, 0.0950125098376374,
  0.2816035507792589, 0.4580167776572274, 0.6178762444026438,
  0.755404408355003, 0.8656312023878318, 0.9445750230732326,
  0.9894009349916499,
]
const GL_WEIGHTS = [
  0.0271524594117541, 0.0622535239386479, 0.0951585116824928,
  0.1246289712555339, 0.1495959888165767, 0.1691565193950025,
  0.1826034150449236, 0.1894506104550685, 0.1894506104550685,
  0.1826034150449236, 0.1691565193950025, 0.1495959888165767,
  0.1246289712555339, 0.0951585116824928, 0.0622535239386479,
  0.0271524594117541,
]

export function latticeGreen(
  mu: number,
  x: number,
  y: number,
  z: number,
): number {
  const m = mu - 6
  const f = (t: number): number =>
    Math.exp(-m * t) *
    scaledBessel(Math.abs(x), 2 * t) *
    scaledBessel(Math.abs(y), 2 * t) *
    scaledBessel(Math.abs(z), 2 * t)
  const edges = [0]

  for (let t = 0.25; t < 1e14; t *= 1.25) {
    edges.push(t)

    if (m * t > 50) {
      break
    }
  }

  let sum = 0

  for (let i = 0; i + 1 < edges.length; i++) {
    const a = edges[i]!
    const b = edges[i + 1]!
    const half = (b - a) / 2
    const mid = (a + b) / 2

    for (let j = 0; j < GL_NODES.length; j++) {
      sum += GL_WEIGHTS[j]! * half * f(mid + half * GL_NODES[j]!)
    }
  }

  const T = edges[edges.length - 1]!

  // the tail past T, where each factor is (4 pi t)^(-1/2) to leading order: only when m T is small
  if (m * T < 50) {
    sum += (2 * Math.exp(-m * T)) / ((4 * Math.PI) ** 1.5 * Math.sqrt(T))
  }

  return sum
}

// ---------------------------------------------------------------------------------------------------------------
// the run

const relative = (a: number, b: number): number =>
  Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b))

const axisEps = (k: number): number => 2 - 2 * Math.cos(k)

// q solving (49^q - 33^q) / (33^q - 17^q) = rho (q = 0 by logs), by bisection; -Infinity when rho <= 0
export function exponentOf(
  floors: [number, number, number],
  rho: number,
): number {
  const [a, b, c] = floors
  const h = (q: number): number =>
    Math.abs(q) < 1e-12
      ? Math.log(c / b) / Math.log(b / a)
      : (c ** q - b ** q) / (b ** q - a ** q)

  if (!(rho > 0)) {
    return Number.NEGATIVE_INFINITY
  }

  let lo = -12
  let hi = 12

  if (rho <= h(lo)) {
    return lo
  }

  if (rho >= h(hi)) {
    return hi
  }

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2

    if (h(mid) < rho) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return (lo + hi) / 2
}

type WeightReading = {
  name: string
  p: number
  derived: boolean
  R: Map<number, number>
  GDk1: Map<number, number>
  GRk1: Map<number, number>
  KR: Map<number, number>
  KD: Map<number, number>
  xi: Map<number, number>
  q: number
  // real space, Dirichlet, by floor: axis r = 0..side/2
  axis: Map<number, number[]>
  b1: boolean
  b2: boolean
  b3: boolean
  // the longest run of axis r within 10 percent of 1 / (4 pi K_R r), by floor
  range: Map<number, [number, number]>
}

// how I3 gates a Bloch solve's residual: 'absolute' is board-0049's registered gate (E-GRV-0154), 'relative' is
// board-0052's (E-GRV-0155), the residual over the largest modulus of the solved field
export type ResidualGate = 'absolute' | 'relative'

export function cuspDepthWeightedRun(
  plan: DepthPlan,
  residualGate: ResidualGate = 'absolute',
): Verdict {
  const started = Date.now()
  const log = (what: string): void =>
    console.error(
      `${what} ${Math.round((Date.now() - started) / 1000)}s`,
    )

  let worstResidual = 0
  let worstRelativeResidual = 0
  let worstStiffResidual = 0
  let worstImaginary = 0
  let solves = 0
  let iterationsTotal = 0

  const note = (s: Solve, at: number): number => {
    solves++
    iterationsTotal += s.iterations
    worstResidual = Math.max(worstResidual, s.residual)

    let field = 0

    for (let a = 0; a < s.re.length; a++) {
      field = Math.max(field, Math.hypot(s.re[a]!, s.im[a]!))
    }

    worstRelativeResidual = Math.max(worstRelativeResidual, s.residual / field)
    worstImaginary = Math.max(
      worstImaginary,
      Math.abs(s.im[at]!) / Math.abs(s.re[at]!),
    )

    return s.re[at]!
  }

  // ---- I1: the columns ----
  const columns = new Map<number, Column>()

  for (const f of plan.floors) {
    columns.set(f, buildColumn(f))
    log(`column ${f}: ${columns.get(f)!.cells} cells`)
  }

  let columnsExact = true

  for (const [f, q] of columns) {
    const counts = new Map<number, number>()

    for (const l of q.level) {
      counts.set(l, (counts.get(l) ?? 0) + 1)
    }

    const countsAgree = WINDOW_COUNTS.every(
      (c, i) => 2 * i + 1 > f || counts.get(2 * i + 1) === c,
    )

    columnsExact &&=
      q.missing === 0 &&
      q.inconsistent === 0 &&
      q.offInteger === 0 &&
      q.floorBelow &&
      countsAgree
  }

  const copyFloor = 17
  const reference = buildCuspQuotient(copyFloor)
  const mine = columns.get(copyFloor)!
  const copyAgrees =
    reference.cells === mine.cells &&
    reference.level.every((l, i) => l === mine.level[i]) &&
    reference.neighbour.every((b, i) => b === mine.neighbour[i]) &&
    reference.shift.every((s, i) => s === mine.shift[i]) &&
    reference.step.every((s, i) => s === mine.step[i])
  const i1 = columnsExact && copyAgrees

  log('I1')

  // ---- I2: the reduction against a direct solve on the exact cusp ----
  const deep = columns.get(plan.read)!
  const depth = columnDepth(deep)
  const exact = buildExactCusp({ period: 2, floor: plan.exactDepth })
  const exactPerCell = exact.depthCounts.map(c => c / 8)
  const depthWeights: { name: string; c: (a: number, b: number) => number }[] =
    [
      { name: 'flat', c: () => 1 },
      { name: 'depth', c: (a, b) => 3 ** -(a + b) },
    ]

  let reductionGap = 0
  let reductionCounts = true
  let reductionComplete = true
  let exactResidual = 0

  // the layer docks of the exact cusp by layer graph distance from the base dock
  const layerDistance = new Int32Array(exact.cells).fill(-1)

  layerDistance[0] = 0

  {
    const queue = [0]

    for (let head = 0; head < queue.length; head++) {
      const x = queue[head]!

      for (let k = 0; k < SLOTS; k++) {
        const y = exact.table[x * SLOTS + k]!

        if (y >= 0 && exact.depth[y] === 0 && layerDistance[y] === -1) {
          layerDistance[y] = layerDistance[x]! + 1
          queue.push(y)
        }
      }
    }
  }

  const layerDocks = Array.from(layerDistance)
    .map((d, x) => ({ d, x }))
    .filter(v => v.d >= 0)

  for (const dw of depthWeights) {
    const cut = depthColumn(deep, depth, plan.exactDepth, dw.c)

    reductionCounts &&=
      cut.counts.length === exactPerCell.length &&
      cut.counts.every((c, i) => c === exactPerCell[i])
    reductionComplete &&= cut.complete

    const Gk = new Map<string, number>()

    for (const a of [0, 1]) {
      for (const b of [0, 1]) {
        for (const c of [0, 1]) {
          const s = blochWeighted(
            cut.graph,
            [a, b, c].map(v => v * Math.PI),
            cut.husk,
          )

          Gk.set(`${a}${b}${c}`, note(s, cut.husk))
        }
      }
    }

    const predicted = [0, 1, 2, 3].map(dist => {
      const r = [0, 1, 2].map(i => (i < dist ? 1 : 0))

      let s = 0

      for (const [key, v] of Gk) {
        const k = key.split('').map(Number)
        const phase = k.reduce((t, ki, i) => t + ki * r[i]!, 0)

        s += (phase % 2 === 0 ? 1 : -1) * v
      }

      return s / 8
    })

    // the direct solve on the exact cusp, Dirichlet below its floor
    const n = exact.cells
    const weight = new Float64Array(n * SLOTS)
    const diagonal = new Float64Array(n)

    for (let x = 0; x < n; x++) {
      for (let k = 0; k < SLOTS; k++) {
        const y = exact.table[x * SLOTS + k]!
        const v = dw.c(exact.depth[x]!, y >= 0 ? exact.depth[y]! : plan.exactDepth + 1)

        weight[x * SLOTS + k] = v
        diagonal[x] = diagonal[x]! + v
      }
    }

    const apply = (u: Float64Array, w: Float64Array): void => {
      for (let x = 0; x < n; x++) {
        let s = diagonal[x]! * u[x]!

        for (let k = 0; k < SLOTS; k++) {
          const y = exact.table[x * SLOTS + k]!

          if (y >= 0) {
            s -= weight[x * SLOTS + k]! * u[y]!
          }
        }

        w[x] = s
      }
    }

    const b = new Float64Array(n)

    b[0] = 1

    const direct = realPcg(n, apply, diagonal, b, 1e-15, 1_000_000)

    exactResidual = Math.max(exactResidual, direct.residual)

    for (const { d, x } of layerDocks) {
      reductionGap = Math.max(
        reductionGap,
        relative(direct.x[x]!, predicted[d]!),
      )
    }
  }

  const i2 =
    reductionCounts &&
    reductionComplete &&
    layerDocks.length === 8 &&
    reductionGap < 1e-10 &&
    exactResidual < 1e-12

  log(`I2 gap ${reductionGap.toExponential(2)}`)

  // ---- the floor scan, per weighting ----
  const k1 = (2 * Math.PI) / plan.side
  const readings: WeightReading[] = []

  let bracketHolds = true
  let risesWithFloor = true

  for (const ex of plan.exponents) {
    const c = linkWeight(cellWeight(ex.p))
    const R = new Map<number, number>()
    const GDk1 = new Map<number, number>()
    const GRk1 = new Map<number, number>()
    const KR = new Map<number, number>()
    const KD = new Map<number, number>()
    const xi = new Map<number, number>()

    for (const f of plan.floors) {
      const q = columns.get(f)!
      const husk = huskOf(q)
      const gD = weightedColumn(q, c, 'dirichlet')
      const gR = weightedColumn(q, c, 'reflecting')
      const r0 = note(blochWeighted(gD, [0, 0, 0], husk), husk)
      const d1 = note(blochWeighted(gD, [k1, 0, 0], husk), husk)
      const r1 = note(blochWeighted(gR, [k1, 0, 0], husk), husk)
      const stiff = weightedStiffness(gR, 0)

      worstStiffResidual = Math.max(worstStiffResidual, stiff.residual)

      const kd = (1 / d1 - 1 / r0) / axisEps(k1)

      R.set(f, r0)
      GDk1.set(f, d1)
      GRk1.set(f, r1)
      KR.set(f, stiff.K)
      KD.set(f, kd)
      xi.set(f, Math.sqrt(kd * r0))
      bracketHolds &&= d1 <= r1 * (1 + 1e-12)
    }

    plan.floors.forEach((f, i) => {
      if (i > 0) {
        risesWithFloor &&= R.get(f)! > R.get(plan.floors[i - 1]!)!
      }
    })

    const [fa, fb, fc] = plan.qFloors
    const rho =
      (R.get(fc)! - R.get(fb)!) / (R.get(fb)! - R.get(fa)!)
    const q = exponentOf(plan.qFloors, rho)

    readings.push({
      name: ex.name,
      p: ex.p,
      derived: ex.derived,
      R,
      GDk1,
      GRk1,
      KR,
      KD,
      xi,
      q,
      axis: new Map(),
      b1: false,
      b2: false,
      b3: false,
      range: new Map(),
    })
    log(`scan p ${ex.p}: q ${q.toFixed(3)}, xi(49) ${xi.get(plan.read)!.toFixed(3)}`)
  }

  // ---- real space, Dirichlet, by subtraction ----
  const half = plan.side / 2
  const transform = (
    reading: WeightReading,
    f: number,
  ): { subtracted: number[]; plain: number[]; field: HuskField } => {
    const q = columns.get(f)!
    const husk = huskOf(q)
    const gD = weightedColumn(q, linkWeight(cellWeight(reading.p)), 'dirichlet')
    const r0 = reading.R.get(f)!
    const kd = reading.KD.get(f)!
    const m2 = 1 / r0
    const cache = new Map<string, number>()
    const gOf = (k: number[]): number => {
      const key = k.join(',')
      let v = cache.get(key)

      if (v === undefined) {
        v = note(blochWeighted(gD, k, husk), husk)
        cache.set(key, v)
      }

      return v
    }
    const eps = (k: number[]): number =>
      axisEps(k[0]!) + axisEps(k[1]!) + axisEps(k[2]!)
    const gc = (k: number[]): number => 1 / (m2 + kd * eps(k))
    const delta = huskTransform(plan.side, k => ({
      re: gOf(k) - gc(k),
      im: 0,
      residual: 0,
      iterations: 0,
    }))
    const field = huskTransform(plan.side, k => ({
      re: gOf(k),
      im: 0,
      residual: 0,
      iterations: 0,
    }))
    const mu = 6 + m2 / kd
    const subtracted = Array.from(
      { length: half + 1 },
      (_, r) => latticeGreen(mu, r, 0, 0) / kd + fieldAt(delta, r, 0, 0),
    )
    const plain = Array.from({ length: half + 1 }, (_, r) =>
      fieldAt(field, r, 0, 0),
    )

    return { subtracted, plain, field }
  }

  let flatSubGap = 0
  let flatPlain: number[] = []
  let symmetryGap = 0

  for (const reading of readings) {
    const floors = [
      plan.read,
      ...(plan.bracketExponents.includes(reading.p) ? [plan.bracket] : []),
    ]

    for (const f of floors) {
      const t = transform(reading, f)

      reading.axis.set(f, t.subtracted)

      if (reading.p === 0 && f === plan.read) {
        flatPlain = t.plain
        flatSubGap = Math.max(
          ...[0, 1, 2, 3, 4].map(r =>
            relative(t.subtracted[r]!, t.plain[r]!),
          ),
        )
      }

      log(`transform p ${reading.p} floor ${f}`)
    }

    // ---- I4 on AREA ----
    if (reading.p === 3) {
      const q = columns.get(plan.read)!
      const husk = huskOf(q)
      const g = weightedColumn(q, linkWeight(cellWeight(3)), 'dirichlet')
      const unit = (2 * Math.PI) / plan.side
      const wedge = note(
        blochWeighted(g, [1, 3, 5].map(v => v * unit), husk),
        husk,
      )
      const off = [
        [5, -3, 1],
        [-1, 5, 3],
        [3, 1, -5],
        [-5, -1, -3],
        [1, -5, 3],
        [3, -5, -1],
      ].map(m =>
        note(
          blochWeighted(g, m.map(v => v * unit), husk),
          husk,
        ),
      )

      symmetryGap = Math.max(...off.map(v => relative(v, wedge)))
    }
  }

  // ---- B1, B2, B3 ----
  for (const reading of readings) {
    const K49 = reading.KR.get(plan.read)!
    const K33 = reading.KR.get(plan.bracket)!

    reading.b1 = K49 / K33 - 1 < 0.02
    reading.b2 = reading.q >= -0.5

    const band = (f: number): boolean[] => {
      const a = reading.axis.get(f)!
      const K = reading.KR.get(f)!

      return a.map((v, r) => r > 0 && Math.abs(4 * Math.PI * K * r * v - 1) <= 0.1)
    }

    reading.b3 = band(plan.read).every((ok, r) => r < 4 || ok)

    for (const f of reading.axis.keys()) {
      const ok = band(f)

      let best: [number, number] = [0, -1]
      let start = -1

      ok.forEach((v, r) => {
        if (v && start < 0) {
          start = r
        }

        if (v && r - start > best[1] - best[0]) {
          best = [start, r]
        }

        if (!v) {
          start = -1
        }
      })

      reading.range.set(f, best)
    }
  }

  // ---- I3, I5, I6, C ----
  const blochHolds =
    residualGate === 'absolute'
      ? worstResidual < 1e-12
      : worstRelativeResidual <= 1e-12
  const i3 =
    blochHolds &&
    worstStiffResidual < 1e-12 &&
    worstImaginary < 1e-12
  const i4 = symmetryGap < 1e-10
  const i5 = bracketHolds && risesWithFloor
  const besselGap = Math.max(
    ...[0, 1, 2, 3, 4].map(r =>
      relative(latticeGreen(24, r, 0, 0), besselLatticeGreen(24, r, 0, 0)),
    ),
  )
  const i6 = besselGap < 1e-10 && flatSubGap < 1e-8

  const flat = readings.find(r => r.p === 0)!
  const controlAxisGap = Math.max(
    ...CONTROL_AXIS.map((v, r) => relative(flatPlain[r]!, v)),
  )
  const controlKGap = Math.max(
    ...Object.entries(CONTROL_K).map(([f, v]) =>
      relative(flat.KR.get(Number(f))!, v),
    ),
  )
  const control =
    controlAxisGap < 5e-4 && controlKGap < 1e-4 && flat.q < -0.5

  const instrument = i1 && i2 && i3 && i4 && i5 && i6 && control
  const derived = readings.filter(r => r.derived && r.p > 0)
  const sweep = readings.filter(r => !r.derived)
  const status: Verdict['status'] = !instrument
    ? 'open'
    : derived.some(r => r.b1 && r.b2 && r.b3)
      ? 'pass'
      : derived.some(r => r.b1 && r.b2) || sweep.some(r => r.b1 && r.b2 && r.b3)
        ? 'partial'
        : 'fail'

  const metrics: Record<string, number> = {
    gate_I1: i1 ? 1 : 0,
    gate_I2: i2 ? 1 : 0,
    gate_I3: i3 ? 1 : 0,
    i3_absolute_reading: worstResidual < 1e-12 ? 1 : 0,
    gate_I4: i4 ? 1 : 0,
    gate_I5: i5 ? 1 : 0,
    gate_I6: i6 ? 1 : 0,
    gate_C: control ? 1 : 0,
    copyAgrees: copyAgrees ? 1 : 0,
    reductionGap,
    exactResidual,
    exactDocks: exact.cells,
    worstResidual,
    worstRelativeResidual,
    worstStiffResidual,
    worstImaginary,
    symmetryGap,
    besselGap,
    flatSubGap,
    controlAxisGap,
    controlKGap,
    solves,
    iterations: iterationsTotal,
    seconds: 0,
  }

  for (const r of readings) {
    const tag = r.name
    metrics[`${tag}_B1`] = r.b1 ? 1 : 0
    metrics[`${tag}_B2`] = r.b2 ? 1 : 0
    metrics[`${tag}_B3`] = r.b3 ? 1 : 0
    metrics[`${tag}_q`] = r.q

    for (const f of plan.floors) {
      metrics[`${tag}_R${f}`] = r.R.get(f)!
      metrics[`${tag}_KR${f}`] = r.KR.get(f)!
      metrics[`${tag}_KD${f}`] = r.KD.get(f)!
      metrics[`${tag}_xi${f}`] = r.xi.get(f)!
      metrics[`${tag}_GDk1_${f}`] = r.GDk1.get(f)!
      metrics[`${tag}_GRk1_${f}`] = r.GRk1.get(f)!
    }

    for (const [f, a] of r.axis) {
      const K = r.KR.get(f)!

      a.forEach((v, i) => {
        metrics[`${tag}_F${f}_G${i}`] = v
        metrics[`${tag}_F${f}_newton${i}`] = 4 * Math.PI * K * i * v
      })
      metrics[`${tag}_F${f}_rangeStart`] = r.range.get(f)![0]
      metrics[`${tag}_F${f}_rangeEnd`] = r.range.get(f)![1]
    }
  }

  for (const [f, q] of columns) {
    metrics[`cells_floor${f}`] = q.cells
  }

  metrics.seconds = (Date.now() - started) / 1000

  const area = readings.find(r => r.name === 'AREA')!
  const warp = readings.find(r => r.name === 'WARP')!
  const say = (r: WeightReading): string =>
    `${r.name} (p = ${r.p}): K_R ${plan.floors.map(f => r.KR.get(f)!.toPrecision(5)).join(', ')}, column resistance R ${plan.floors.map(f => r.R.get(f)!.toPrecision(6)).join(', ')}, q ${r.q.toFixed(2)}, xi ${plan.floors.map(f => r.xi.get(f)!.toPrecision(3)).join(', ')} at floors ${plan.floors.join(', ')}; 4 pi K r G(r) at F = ${plan.read}: ${r.axis
      .get(plan.read)!
      .slice(1)
      .map((v, i) => (4 * Math.PI * r.KR.get(plan.read)! * (i + 1) * v).toFixed(3))
      .join(', ')} (B1 ${r.b1}, B2 ${r.b2}, B3 ${r.b3})`

  return verdict({
    status,
    claim: `the husk field of a point source below a cusp with depth-weighted columns (cell weight l^-p at Busemann level l, ${solves} Bloch solves on columns to level ${plan.read}): ${readings.map(say).join('; ')}`,
    metrics,
    control: {
      controlAxisGap,
      controlKGap,
      flat_q: flat.q,
      flat_xi49: flat.xi.get(plan.read)!,
    },
    notes: `L1. Gates I1 ${i1} (columns ${columnsExact}, copy ${copyAgrees}), I2 ${i2} (gap ${reductionGap.toExponential(2)} over ${layerDocks.length} layer docks, exact cusp ${exact.cells} docks, depth counts ${exactPerCell.join('/')}, direct residual ${exactResidual.toExponential(2)}), I3 ${i3} (${residualGate} gate, Bloch residual ${worstResidual.toExponential(2)} absolute, ${worstRelativeResidual.toExponential(2)} relative to its field, stiffness residual ${worstStiffResidual.toExponential(2)}, imaginary ${worstImaginary.toExponential(2)}), I4 ${i4} (${symmetryGap.toExponential(2)}), I5 ${i5} (bracket ${bracketHolds}, rises ${risesWithFloor}), I6 ${i6} (Bessel ${besselGap.toExponential(2)}, subtraction ${flatSubGap.toExponential(2)}), C ${control} (axis ${controlAxisGap.toExponential(2)}, K ${controlKGap.toExponential(2)}, flat q ${flat.q.toFixed(2)}). WARP B1 ${warp.b1} B2 ${warp.b2} B3 ${warp.b3}; AREA B1 ${area.b1} B2 ${area.b2} B3 ${area.b3}. 1/r ranges (r from, to, within 10 percent) ${readings.map(r => `${r.name} ${[...r.range].map(([f, v]) => `F${f} ${v[0]}-${v[1]}`).join(' ')}`).join('; ')}. Columns ${[...columns].map(([f, q]) => `${f}: ${q.cells} cells, ${q.floorLinks} floor links`).join('; ')}. ${metrics.seconds.toFixed(0)} s.`,
  })
}

export default experiment({
  id: 'gravity/cusp-depth-weighted',
  code: 'E-GRV-0154',
  title:
    "the static field below a cusp with depth-weighted columns (board-0049, gap B-52), open by the registered rule: one of 1415 Bloch solves (p = 6, k = 0, a field of 3.4e4) missed the 1e-12 residual gate at 8.0e-12, 2.4e-16 of its value, the float floor, while every other gate held (the column reduction equals a direct solve on the exact period-2 cusp to 2.1e-15, the flat control reproduces E-GRV-0150 to 1.9e-4); with cell weight l^-p at Busemann level l the column's resistance to the floor grows as F^q with q -3.51, -2.04, -0.85, 0.13, 1.09, 3.02 for p 0, 1, 2, 3, 4, 6, so the infinite mesh is unscreened iff p >= 3, as derived; the RS-II warp (p = 1) stays screened (xi 0.35 docks, K still rising), the horosphere-area weight (p = 3) sits on the threshold (K 1.143 converged, resistance growing as ln F, but xi only 1.43 docks at level 49, 4 pi K r G(r) 0.074 at r = 4), and only p = 6 gives 1/r over the whole read, r = 1 to 8 within 10 percent at levels 33 and 49 (xi 184)",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return cuspDepthWeightedRun(GATE_PLAN)
  },
})
