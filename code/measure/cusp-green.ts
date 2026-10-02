// THE BULK GRAPH GREEN'S FUNCTION READ ON THE HUSK, on the true {3,4,3,4} mesh below one cusp. Written for
// E-GRV-0150 (routes H3b, I11a, I12b); each piece is general.
//
// - buildCuspQuotient: the cells of the mesh at Busemann level at most `floor` (the husk at level 1, every center at an
//   odd level, E-CSM-0060), taken modulo the cusp's cubic translations. One window of the husk's cubic lattice
//   (horizontal chart coordinates in [-1/2, 1/2)^3) holds one representative of each class; every link carries the
//   integer lattice shift of its far end and its exact horizontal displacement. Links to cells below the floor are
//   counted and dropped. The region is grown with a horizontal margin of 1/2 + 2/level about the window, wider than
//   the largest horizontal step a cell at that level takes (1/level, measured), and every in-range neighbour of a
//   window cell must be found in it (`missing` counts the failures).
// - blochSolve: one column of (D - A(k))^-1 on a quotient, by conjugate gradient (the operator is Hermitian and
//   positive definite for any k on a Dirichlet floor, and for k != 0 on a reflecting one). D is 24 on every cell
//   (DIRICHLET: a link below the floor ends on a cell held at 0) or each cell's count of kept links (REFLECTING: the
//   truncated graph's own Laplacian, a floor nothing crosses).
// - huskTransform: G(r) for every husk offset r in an N^3 box, from G_husk(k) on the N^3 momentum grid, solving only
//   the k in the cubic wedge 0 <= k1 <= k2 <= k3 <= pi (the husk's {4,3,4} symmetry) and summing a separable cosine
//   transform.
// - stiffness: the long-wavelength stiffness K of a reflecting quotient along one husk axis, exactly, by second-order
//   perturbation of its zero mode: K = sum over links of dx^2 - b^T L^+ b, b_a = sum of a's link displacements. Then
//   G_husk(k) -> 1 / (K k^2) and G(r) -> 1 / (4 pi K r) on the husk; the cubic lattice alone has K = 1.
// - besselLatticeGreen: the Green's function of (m - A) on the simple cubic lattice, m > 6, as the integral over t of
//   e^(-m t) I_x(2t) I_y(2t) I_z(2t), the closed form the control is held to.
//
// MEASUREMENT: frames are floats (coordinates in Z[sqrt 2]); levels are matched to integers at 1e-7, shifts are
// integers, and the solves are floats with their residuals reported. No random numbers.

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

export type CuspQuotient = {
  readonly cells: number
  readonly floor: number
  readonly level: Int32Array
  // 3 per cell, in [-1/2, 1/2)
  readonly coord: Float64Array
  // 24 per cell: the neighbour's index, -1 below the floor
  readonly neighbour: Int32Array
  // 72 per cell: the integer lattice shift of each link's far end
  readonly shift: Int32Array
  // 72 per cell: each link's horizontal displacement, far center minus near center
  readonly step: Float64Array
  readonly regionCells: number
  readonly missing: number
  readonly floorLinks: number
  readonly offInteger: number
  readonly inconsistent: number
  // the largest horizontal step (largest coordinate) of a link whose shallower end is at level l, times l
  readonly worstStepTimesLevel: Map<number, number>
}

export function buildCuspQuotient(floor: number): CuspQuotient {
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

  const keyOf = (l: number, x: number[]): string => {
    const k = Math.round(l)

    if (Math.abs(l - k) > 1e-7) {
      offInteger++
    }

    return `${k}|${x.map(v => Math.round(wrap(v) * 1e6)).join(',')}`
  }

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
  const coord = new Float64Array(3 * cells)
  const neighbour = new Int32Array(SLOTS * cells).fill(-1)
  const shift = new Int32Array(3 * SLOTS * cells)
  const step = new Float64Array(3 * SLOTS * cells)
  const worstStepTimesLevel = new Map<number, number>()

  let missing = 0
  let floorLinks = 0

  window.forEach((i, a) => {
    const here = position[i]!

    level[a] = Math.round(here.l)

    for (let c = 0; c < 3; c++) {
      coord[3 * a + c] = here.x[c]!
    }

    for (let d = 0; d < SLOTS; d++) {
      const j = region.neighbour[i * SLOTS + d]!

      if (j < 0) {
        const p = matVec(matMul(region.frames[i]!, tau[d]!), c0)

        if (levelOf(p) > floor + 1e-9) {
          floorLinks++
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

      let worst = 0

      for (let c = 0; c < 3; c++) {
        const dx = there.x[c]! - here.x[c]!

        shift[3 * (SLOTS * a + d) + c] = Math.floor(there.x[c]! + 0.5)
        step[3 * (SLOTS * a + d) + c] = dx
        worst = Math.max(worst, Math.abs(dx))
      }

      const shallow = Math.round(Math.min(here.l, there.l))

      worstStepTimesLevel.set(
        shallow,
        Math.max(
          worstStepTimesLevel.get(shallow) ?? 0,
          worst * shallow,
        ),
      )
    }
  })

  return {
    cells,
    floor,
    level,
    coord,
    neighbour,
    shift,
    step,
    regionCells: region.cells,
    missing,
    floorLinks,
    offInteger,
    inconsistent: region.inconsistentSteps,
    worstStepTimesLevel,
  }
}

export type FloorKind = 'dirichlet' | 'reflecting'

// a periodic graph in the form the solver reads: `width` link slots per cell, -1 for none
export type PeriodicGraph = {
  readonly cells: number
  readonly width: number
  readonly neighbour: Int32Array
  readonly shift: Int32Array
  readonly diagonal: Float64Array
}

export function quotientGraph(
  q: CuspQuotient,
  kind: FloorKind,
): PeriodicGraph {
  const diagonal = new Float64Array(q.cells)

  for (let a = 0; a < q.cells; a++) {
    let kept = 0

    for (let d = 0; d < SLOTS; d++) {
      if (q.neighbour[SLOTS * a + d]! >= 0) {
        kept++
      }
    }

    diagonal[a] = kind === 'dirichlet' ? SLOTS : kept
  }

  return {
    cells: q.cells,
    width: SLOTS,
    neighbour: q.neighbour,
    shift: q.shift,
    diagonal,
  }
}

// the simple cubic lattice as a periodic graph of one cell, with `mass` on the diagonal (6 is the bare Laplacian)
export function cubicGraph(mass: number): PeriodicGraph {
  return {
    cells: 1,
    width: 6,
    neighbour: new Int32Array(6).fill(0),
    shift: Int32Array.from([
      1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1,
    ]),
    diagonal: Float64Array.from([mass]),
  }
}

export type BlochColumn = {
  readonly re: Float64Array
  readonly im: Float64Array
  readonly iterations: number
  readonly residual: number
}

// x = (D - A(k))^-1 e_source, A(k)_ab = sum over links a -> b of e^(i k . shift)
export function blochSolve(
  g: PeriodicGraph,
  k: readonly number[],
  source: number,
  tolerance = 1e-14,
  maxIterations = 200_000,
): BlochColumn {
  const { cells: n, width, neighbour, shift, diagonal } = g
  const links = neighbour.length
  const pr = new Float64Array(links)
  const pi = new Float64Array(links)

  for (let e = 0; e < links; e++) {
    const t =
      k[0]! * shift[3 * e]! +
      k[1]! * shift[3 * e + 1]! +
      k[2]! * shift[3 * e + 2]!

    pr[e] = Math.cos(t)
    pi[e] = Math.sin(t)
  }

  const apply = (
    xr: Float64Array,
    xi: Float64Array,
    yr: Float64Array,
    yi: Float64Array,
  ): void => {
    for (let a = 0; a < n; a++) {
      let sr = diagonal[a]! * xr[a]!
      let si = diagonal[a]! * xi[a]!

      for (let d = 0; d < width; d++) {
        const e = a * width + d
        const b = neighbour[e]!

        if (b < 0) {
          continue
        }

        const cr = pr[e]!
        const ci = pi[e]!
        const ur = xr[b]!
        const ui = xi[b]!

        sr -= cr * ur - ci * ui
        si -= cr * ui + ci * ur
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

  const qr = Float64Array.from(rr)
  const qi = Float64Array.from(ri)
  const wr = new Float64Array(n)
  const wi = new Float64Array(n)

  let rho = 1
  let iterations = 0

  while (iterations < maxIterations && Math.sqrt(rho) >= tolerance) {
    apply(qr, qi, wr, wi)

    let qw = 0

    for (let a = 0; a < n; a++) {
      qw += qr[a]! * wr[a]! + qi[a]! * wi[a]!
    }

    const alpha = rho / qw

    let next = 0

    for (let a = 0; a < n; a++) {
      xr[a] = xr[a]! + alpha * qr[a]!
      xi[a] = xi[a]! + alpha * qi[a]!
      rr[a] = rr[a]! - alpha * wr[a]!
      ri[a] = ri[a]! - alpha * wi[a]!
      next += rr[a]! * rr[a]! + ri[a]! * ri[a]!
    }

    iterations++

    const beta = next / rho

    rho = next

    for (let a = 0; a < n; a++) {
      qr[a] = rr[a]! + beta * qr[a]!
      qi[a] = ri[a]! + beta * qi[a]!
    }
  }

  // the true residual, recomputed
  apply(xr, xi, wr, wi)
  wr[source] = wr[source]! - 1

  let residual = 0

  for (let a = 0; a < n; a++) {
    residual += wr[a]! * wr[a]! + wi[a]! * wi[a]!
  }

  return { re: xr, im: xi, iterations, residual: Math.sqrt(residual) }
}

export type HuskField = {
  readonly side: number
  // G at offset (x, y, z), each in [0, side), index (x * side + y) * side + z
  readonly values: Float64Array
  readonly solves: number
  readonly worstResidual: number
  readonly worstImaginary: number
  readonly iterations: number
}

// G(r) on the N^3 husk box from G_husk(k) on the N^3 momentum grid; G_husk(k) is real and even in each component
export function huskTransform(
  side: number,
  value: (k: number[]) => {
    re: number
    im: number
    residual: number
    iterations: number
  },
): HuskField {
  const N = side
  const cache = new Map<string, number>()

  let solves = 0
  let worstResidual = 0
  let worstImaginary = 0
  let iterations = 0

  const spectrum = new Float64Array(N * N * N)

  for (let a = 0; a < N; a++) {
    for (let b = 0; b < N; b++) {
      for (let c = 0; c < N; c++) {
        const folded = [a, b, c]
          .map(v => Math.min(v, N - v))
          .sort((x, y) => x - y)
        const key = folded.join(',')

        let v = cache.get(key)

        if (v === undefined) {
          const s = value(folded.map(x => (2 * Math.PI * x) / N))

          v = s.re
          cache.set(key, v)
          solves++
          worstResidual = Math.max(worstResidual, s.residual)
          worstImaginary = Math.max(worstImaginary, Math.abs(s.im))
          iterations += s.iterations
        }

        spectrum[(a * N + b) * N + c] = v
      }
    }
  }

  const cosine = new Float64Array(N * N)

  for (let k = 0; k < N; k++) {
    for (let r = 0; r < N; r++) {
      cosine[k * N + r] = Math.cos((2 * Math.PI * ((k * r) % N)) / N)
    }
  }

  let current = spectrum

  for (let axis = 0; axis < 3; axis++) {
    const next = new Float64Array(N * N * N)

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        for (let r = 0; r < N; r++) {
          let s = 0

          for (let k = 0; k < N; k++) {
            const at =
              axis === 0
                ? (k * N + i) * N + j
                : axis === 1
                  ? (i * N + k) * N + j
                  : (i * N + j) * N + k

            s += current[at]! * cosine[k * N + r]!
          }

          const out =
            axis === 0
              ? (r * N + i) * N + j
              : axis === 1
                ? (i * N + r) * N + j
                : (i * N + j) * N + r

          next[out] = s
        }
      }
    }

    current = next
  }

  for (let i = 0; i < current.length; i++) {
    current[i] = current[i]! / (N * N * N)
  }

  return {
    side: N,
    values: current,
    solves,
    worstResidual,
    worstImaginary,
    iterations,
  }
}

export const fieldAt = (
  f: HuskField,
  x: number,
  y: number,
  z: number,
): number => {
  const N = f.side
  const w = (v: number): number => ((v % N) + N) % N

  return f.values[(w(x) * N + w(y)) * N + w(z)]!
}

// the stiffness along husk axis `axis` of a reflecting quotient
export function stiffness(
  q: CuspQuotient,
  axis: number,
  tolerance = 1e-12,
  maxIterations = 500_000,
): {
  K: number
  bare: number
  relaxation: number
  iterations: number
  residual: number
} {
  const n = q.cells
  const b = new Float64Array(n)
  const degree = new Float64Array(n)

  let bare = 0

  for (let a = 0; a < n; a++) {
    for (let d = 0; d < SLOTS; d++) {
      if (q.neighbour[SLOTS * a + d]! < 0) {
        continue
      }

      const dx = q.step[3 * (SLOTS * a + d) + axis]!

      // every undirected link is seen twice
      bare += (dx * dx) / 2
      b[a] = b[a]! + dx
      degree[a] = degree[a]! + 1
    }
  }

  // solve L x = b on the mean-zero subspace (b sums to 0: each link's two directions cancel)
  const apply = (x: Float64Array, y: Float64Array): void => {
    for (let a = 0; a < n; a++) {
      let s = degree[a]! * x[a]!

      for (let d = 0; d < SLOTS; d++) {
        const j = q.neighbour[SLOTS * a + d]!

        if (j >= 0) {
          s -= x[j]!
        }
      }

      y[a] = s
    }
  }

  let mean = 0

  for (let a = 0; a < n; a++) {
    mean += b[a]!
  }

  mean /= n

  const r = Float64Array.from(b, v => v - mean)
  const x = new Float64Array(n)
  const p = Float64Array.from(r)
  const w = new Float64Array(n)

  let rho = r.reduce((s, v) => s + v * v, 0)
  let iterations = 0

  const scale = Math.sqrt(rho)

  while (
    iterations < maxIterations &&
    Math.sqrt(rho) > tolerance * scale
  ) {
    apply(p, w)

    let pw = 0

    for (let a = 0; a < n; a++) {
      pw += p[a]! * w[a]!
    }

    const alpha = rho / pw

    let next = 0

    for (let a = 0; a < n; a++) {
      x[a] = x[a]! + alpha * p[a]!
      r[a] = r[a]! - alpha * w[a]!
      next += r[a]! * r[a]!
    }

    iterations++

    const beta = next / rho

    rho = next

    for (let a = 0; a < n; a++) {
      p[a] = r[a]! + beta * p[a]!
    }
  }

  apply(x, w)

  let residual = 0
  let relaxation = 0

  for (let a = 0; a < n; a++) {
    residual += (w[a]! - (b[a]! - mean)) ** 2
    relaxation += b[a]! * x[a]!
  }

  return {
    K: bare - relaxation,
    bare,
    relaxation,
    iterations,
    residual: Math.sqrt(residual) / scale,
  }
}

// I_n(x) by its power series (x <= 20 here)
function besselI(n: number, x: number): number {
  const h = x / 2

  let term = 1

  for (let j = 1; j <= n; j++) {
    term *= h / j
  }

  let sum = term

  for (let m = 1; m < 400; m++) {
    term *= (h * h) / (m * (m + n))
    sum += term

    if (term < 1e-18 * sum) {
      break
    }
  }

  return sum
}

// (m - A)^-1 at offset (x, y, z) on the simple cubic lattice, m > 6, by Gauss-Legendre panels on [0, T]
export function besselLatticeGreen(
  m: number,
  x: number,
  y: number,
  z: number,
): number {
  const nodes = [
    -0.9602898564975363, -0.7966664774136267, -0.525532409916329,
    -0.1834346424956498, 0.1834346424956498, 0.525532409916329,
    0.7966664774136267, 0.9602898564975363,
  ]
  const weights = [
    0.1012285362903763, 0.2223810344533745, 0.3137066458778873,
    0.362683783378362, 0.362683783378362, 0.3137066458778873,
    0.2223810344533745, 0.1012285362903763,
  ]
  // the integrand falls as e^(-(m - 6) t); stop where it is below 1e-20 of its start
  const end = 46 / (m - 6)
  const panels = 4000
  const h = end / panels

  let sum = 0

  for (let p = 0; p < panels; p++) {
    const mid = (p + 0.5) * h

    for (let i = 0; i < nodes.length; i++) {
      const t = mid + (nodes[i]! * h) / 2
      const f =
        Math.exp(-m * t) *
        besselI(Math.abs(x), 2 * t) *
        besselI(Math.abs(y), 2 * t) *
        besselI(Math.abs(z), 2 * t)

      sum += (weights[i]! * h * f) / 2
    }
  }

  return sum
}
