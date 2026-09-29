// THE FREEZING WINDOW OF A FINITE SUBGROUP OF SU(2) ON ANY PERIODIC 4d LATTICE (E-SPN-0153). A finite gauge group G
// behaves like SU(2) at strong and intermediate coupling and freezes at weak coupling, where the link values collapse onto
// pure gauge. Whether a tension that falls well below its strong-coupling value is reached before freezing depends on where
// the freezing point sits against SU(2)'s own scaling. This module reads both from Gaussian fluctuation integrals over the
// Brillouin zone, for a lattice given by its link vectors and plaquettes (squares, triangles, any closed cycle):
//
//   lattices      the hypercubic lattice in d dimensions, and the husk times the beat: the 3d husk (6 cubic axes and 12
//                 face diagonals, 9 links a dock; code/measure/photon-husk) with its 20 triangles a dock, times a time
//                 direction with one square per husk link, spatial weight 1 / xi and temporal weight xi
//   Gaussian      the one-loop (Gaussian) free energy of SU(2) on the lattice: the curl operator M(k) of the plaquettes,
//                 the gradient g(k), and c_L = <2 ln|g|^2 - ln det(M + g g^dagger)> over the zone, which carries the
//                 whole lattice dependence of the SU(2) weak-coupling free energy per dock
//   frozen        the frozen branch of the finite group: pure gauge plus a dilute gas of single links moved to another
//                 element, each turning its plaquettes
//   freezing      the crossing of the two branches (the entropy argument of Bhanot and Rebbi 1981, made exact at one loop
//                 on each lattice by the zone sum)
//   plaquettes    the one-loop plaquette deficit of each plaquette, the equipartition sum rule it obeys, the mean link u0
//                 and the tadpole-improved coupling (Lepage and Mackenzie 1993)
//   continuum     the classical continuum limit: the plaquettes' area bivectors in physical coordinates give the tensor
//                 K on the six planes (K = kappa I when the lattice is isotropic), and 1 / (2 g^2) = beta kappa / 8
//   SU(2) scaling the two-loop asymptotic-scaling function, and SU(2)'s string tension on the hypercubic lattice from
//                 published Monte Carlo values (a table) extended by two-loop scaling in the tadpole-improved coupling
//
// DETERMINISM: the zone sums are midpoint sums on an N^d torus of momenta (exact for that torus; the limit is read by
// raising N), no random numbers anywhere. These are ESTIMATORS: the one-loop branch is exact only as beta goes to
// infinity, and the matching between lattices assumes the tadpole-improved Lambda parameters agree. Their errors are
// calibrated on the hypercubic lattice, where the freezing points and SU(2)'s tension are known.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import {
  characterWeights,
  huskVectors,
  type GaugeGroup,
} from '@/code/measure/hurwitz-gauge'

// ---- lattices ----

export type Step = { link: number; sign: 1 | -1; base: number[] }

export type Plaquette = {
  kind: string
  weight: number
  vertices: number[][]
  steps: Step[]
}

export type GaugeLattice = {
  name: string
  dim: number
  // one vector per link type (a dock has one link of each type leaving it)
  links: number[][]
  plaquettes: Plaquette[]
  // physical coordinates: x_phys[a] = sum_b physical[a][b] x[b]
  physical: number[][]
}

const key = (v: readonly number[]): string => v.join(',')
const sub = (a: readonly number[], b: readonly number[]): number[] =>
  a.map((x, i) => x - b[i]!)

// the steps of a closed vertex cycle, each a link type with its sign and the dock it is based at
export function cycleSteps(
  links: readonly (readonly number[])[],
  vertices: readonly (readonly number[])[],
): Step[] {
  const index = new Map(links.map((v, i) => [key(v), i]))
  const out: Step[] = []

  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i] as number[]
    const b = vertices[(i + 1) % vertices.length] as number[]
    const d = sub(b, a)
    const plus = index.get(key(d))
    const minus = index.get(key(d.map(x => -x)))

    if (plus !== undefined) {
      out.push({ link: plus, sign: 1, base: [...a] })
    } else if (minus !== undefined) {
      out.push({ link: minus, sign: -1, base: [...b] })
    } else {
      throw new Error(`gauge-window: the step ${key(d)} is no link`)
    }
  }

  return out
}

const plaquette = (
  links: readonly (readonly number[])[],
  kind: string,
  weight: number,
  vertices: number[][],
): Plaquette => ({
  kind,
  weight,
  vertices,
  steps: cycleSteps(links, vertices),
})

export function hypercubicGauge(d: number): GaugeLattice {
  const links = [...Array(d).keys()].map(m =>
    [...Array(d).keys()].map(j => (j === m ? 1 : 0)),
  )
  const plaquettes: Plaquette[] = []

  for (let m = 0; m < d; m++) {
    for (let n = m + 1; n < d; n++) {
      const a = links[m] as number[]
      const b = links[n] as number[]

      plaquettes.push(
        plaquette(links, 'square', 1, [
          new Array<number>(d).fill(0),
          a,
          a.map((x, i) => x + b[i]!),
          b,
        ]),
      )
    }
  }

  return {
    name: `hypercubic ${d}d`,
    dim: d,
    links,
    plaquettes,
    physical: links.map(r => [...r]),
  }
}

// tau0^2 = 3 / 5: the time step, in units of the husk's axis link, at which xi = 1 (every plaquette at one beta) gives an
// isotropic classical continuum limit (spatial triangles give 3 |B|^2 a dock, temporal squares 5 tau^2 |E|^2)
export const HUSK_TAU0 = Math.sqrt(3 / 5)

// the husk (3d, 9 link types) times the beat: 10 link types in 4d coordinates, the 20 triangles a dock of the husk, and a
// square per husk link along time
export function huskTimeGauge(xi = 1): GaugeLattice {
  const R = huskVectors()
  const has = new Set(R.map(key))
  const links: number[][] = []

  for (const r of R) {
    if (!links.some(l => key(l) === key([...r.map(x => -x), 0]))) {
      links.push([...r, 0])
    }
  }

  if (links.length !== 9) {
    throw new Error(
      `gauge-window: the husk has ${links.length} link types, not 9`,
    )
  }

  const time = [0, 0, 0, 1]

  links.push(time)

  // triangles {0, u, v}, each once up to translation and orientation
  const seen = new Set<string>()
  const plaquettes: Plaquette[] = []

  for (const u of R) {
    for (const v of R) {
      if (!has.has(key(sub(v, u)))) {
        continue
      }

      const pts = [[0, 0, 0], u, v]
      const lo = pts.reduce(
        (m, p) => (key(p) < key(m) ? p : m),
        pts[0]!,
      )
      const canon = pts
        .map(p => key(sub(p, lo)))
        .sort()
        .join('|')

      if (seen.has(canon)) {
        continue
      }

      seen.add(canon)
      plaquettes.push(
        plaquette(links, 'triangle', 1 / xi, [
          [0, 0, 0, 0],
          [...u, 0],
          [...v, 0],
        ]),
      )
    }
  }

  for (let l = 0; l < 9; l++) {
    const a = links[l]!

    plaquettes.push(
      plaquette(links, 'temporal square', xi, [
        [0, 0, 0, 0],
        a,
        a.map((x, i) => x + time[i]!),
        time,
      ]),
    )
  }

  const tau = HUSK_TAU0 / xi

  return {
    name: `husk x beat (xi ${xi})`,
    dim: 4,
    links,
    plaquettes,
    physical: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, tau],
    ],
  }
}

// plaquettes on one link of each type (the weighted count n_l and the plain count)
export function plaquettesPerLink(L: GaugeLattice): {
  weighted: number[]
  count: number[]
} {
  const weighted = new Array<number>(L.links.length).fill(0)
  const count = new Array<number>(L.links.length).fill(0)

  for (const p of L.plaquettes) {
    for (const s of p.steps) {
      weighted[s.link] = weighted[s.link]! + p.weight
      count[s.link] = count[s.link]! + 1
    }
  }

  return { weighted, count }
}

// ---- small complex linear algebra (Hermitian positive definite) ----

type CM = { n: number; re: Float64Array; im: Float64Array }

// Cholesky L L^dagger in place (lower triangle), returns ln det, or NaN when not positive definite
function cholesky(A: CM): number {
  const { n, re, im } = A

  let lnDet = 0

  for (let j = 0; j < n; j++) {
    let d = re[j * n + j]!

    for (let k = 0; k < j; k++) {
      d -= re[j * n + k]! ** 2 + im[j * n + k]! ** 2
    }

    if (!(d > 0)) {
      return NaN
    }

    const ljj = Math.sqrt(d)

    re[j * n + j] = ljj
    im[j * n + j] = 0
    lnDet += 2 * Math.log(ljj)

    for (let i = j + 1; i < n; i++) {
      let sr = re[i * n + j]!
      let si = im[i * n + j]!

      // subtract sum_k L_ik conj(L_jk)
      for (let k = 0; k < j; k++) {
        const ar = re[i * n + k]!
        const ai = im[i * n + k]!
        const br = re[j * n + k]!
        const bi = -im[j * n + k]!

        sr -= ar * br - ai * bi
        si -= ar * bi + ai * br
      }

      re[i * n + j] = sr / ljj
      im[i * n + j] = si / ljj
    }
  }

  return lnDet
}

// solve (L L^dagger) x = b with the factor from cholesky
function cholSolve(
  L: CM,
  br: Float64Array,
  bi: Float64Array,
): { re: Float64Array; im: Float64Array } {
  const n = L.n
  const yr = new Float64Array(n)
  const yi = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    let sr = br[i]!
    let si = bi[i]!

    for (let k = 0; k < i; k++) {
      const ar = L.re[i * n + k]!
      const ai = L.im[i * n + k]!

      sr -= ar * yr[k]! - ai * yi[k]!
      si -= ar * yi[k]! + ai * yr[k]!
    }

    yr[i] = sr / L.re[i * n + i]!
    yi[i] = si / L.re[i * n + i]!
  }

  const xr = new Float64Array(n)
  const xi = new Float64Array(n)

  for (let i = n - 1; i >= 0; i--) {
    let sr = yr[i]!
    let si = yi[i]!

    // L^dagger_ik = conj(L_ki)
    for (let k = i + 1; k < n; k++) {
      const ar = L.re[k * n + i]!
      const ai = -L.im[k * n + i]!

      sr -= ar * xr[k]! - ai * xi[k]!
      si -= ar * xi[k]! + ai * xr[k]!
    }

    xr[i] = sr / L.re[i * n + i]!
    xi[i] = si / L.re[i * n + i]!
  }

  return { re: xr, im: xi }
}

// ---- the Gaussian (one-loop) data of a lattice ----

export type GaussianData = {
  lattice: string
  N: number
  links: number
  // c_L = <2 ln|g|^2 - ln det(M + g g^dagger)> over the zone (per dock)
  cL: number
  // per plaquette (in lattice order): k_p = <c_p^T M^+ conj(c_p)>, so the one-loop deficit is 1 - <q0(U_p)> = 3 k_p / (2 beta_p)
  kappaP: number[]
  // equipartition: sum_p w_p k_p = links - 1 (the transverse modes a dock), read against it
  equipartition: number
  // the smallest eigenvalue proxy: the least Cholesky pivot of M + g g^dagger seen over the zone, relative to |g|^2
  leastPivot: number
  // Cholesky failures (a zero mode other than the gradient)
  failures: number
}

// the zone sum on the midpoint N^d torus of momenta
export function gaussianData(L: GaugeLattice, N: number): GaussianData {
  const d = L.dim
  const n = L.links.length
  const P = L.plaquettes.length
  const total = N ** d
  const k = new Float64Array(d)
  const A: CM = {
    n,
    re: new Float64Array(n * n),
    im: new Float64Array(n * n),
  }
  const cr = new Float64Array(P * n)
  const ci = new Float64Array(P * n)
  const gr = new Float64Array(n)
  const gi = new Float64Array(n)
  const kappa = new Float64Array(P)

  let cL = 0
  let failures = 0
  let leastPivot = Infinity

  for (let t = 0; t < total; t++) {
    let r = t

    for (let a = 0; a < d; a++) {
      k[a] = (2 * Math.PI * ((r % N) + 0.5)) / N
      r = Math.floor(r / N)
    }

    const dot = (v: readonly number[]): number => {
      let s = 0

      for (let a = 0; a < d; a++) {
        s += k[a]! * v[a]!
      }

      return s
    }

    let g2 = 0

    for (let l = 0; l < n; l++) {
      const ph = dot(L.links[l]!)

      gr[l] = Math.cos(ph) - 1
      gi[l] = Math.sin(ph)
      g2 += gr[l]! ** 2 + gi[l]! ** 2
    }

    cr.fill(0)
    ci.fill(0)

    for (let p = 0; p < P; p++) {
      for (const s of L.plaquettes[p]!.steps) {
        const ph = dot(s.base)

        cr[p * n + s.link] = cr[p * n + s.link]! + s.sign * Math.cos(ph)
        ci[p * n + s.link] = ci[p * n + s.link]! + s.sign * Math.sin(ph)
      }
    }

    // M + g g^dagger, M = sum_p w_p conj(c_p) c_p^T
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // g g^dagger: g_i conj(g_j)
        let sr = gr[i]! * gr[j]! + gi[i]! * gi[j]!
        let si = gi[i]! * gr[j]! - gr[i]! * gi[j]!

        for (let p = 0; p < P; p++) {
          const w = L.plaquettes[p]!.weight
          // conj(c_i) c_j
          const ar = cr[p * n + i]!
          const ai = -ci[p * n + i]!
          const br = cr[p * n + j]!
          const bi = ci[p * n + j]!

          sr += w * (ar * br - ai * bi)
          si += w * (ar * bi + ai * br)
        }

        A.re[i * n + j] = sr
        A.im[i * n + j] = si
      }
    }

    const lnDet = cholesky(A)

    if (!Number.isFinite(lnDet)) {
      failures++
      continue
    }

    for (let i = 0; i < n; i++) {
      leastPivot = Math.min(leastPivot, A.re[i * n + i]! ** 2 / g2)
    }

    cL += 2 * Math.log(g2) - lnDet

    // k_p: c_p^T x with x = (M + g g^dagger)^-1 conj(c_p) (c_p is orthogonal to g, so this is M^+)
    for (let p = 0; p < P; p++) {
      const br = cr.slice(p * n, p * n + n)
      const bi = ci.slice(p * n, p * n + n).map(x => -x)
      const x = cholSolve(A, br, bi)

      let s = 0

      for (let l = 0; l < n; l++) {
        s += cr[p * n + l]! * x.re[l]! - ci[p * n + l]! * x.im[l]!
      }

      kappa[p] = kappa[p]! + s
    }
  }

  const kappaP = Array.from(kappa, x => x / (total - failures))
  const equipartition = kappaP.reduce(
    (s, x, p) => s + x * L.plaquettes[p]!.weight,
    0,
  )

  return {
    lattice: L.name,
    N,
    links: n,
    cL: cL / (total - failures),
    kappaP,
    equipartition,
    leastPivot,
    failures,
  }
}

// ---- the two branches and the freezing point ----

export const SU2_VOLUME = 16 * Math.PI * Math.PI

// ln Z per dock minus beta sum_p w_p, on each branch
export function gaussianBranch(G: GaussianData, beta: number): number {
  const f = G.links - 1

  return (
    -f * Math.log(SU2_VOLUME) +
    1.5 * f * Math.log((8 * Math.PI) / beta) +
    1.5 * G.cL
  )
}

export function frozenBranch(
  g: GaugeGroup,
  L: GaugeLattice,
  beta: number,
): { value: number; dilute: number } {
  const n = L.links.length
  const { weighted } = plaquettesPerLink(L)

  let dilute = 0

  for (let l = 0; l < n; l++) {
    let z = 0

    for (let x = 0; x < g.order; x++) {
      z += Math.exp(-beta * weighted[l]! * (1 - g.q0[x]!))
    }

    dilute += Math.log(z)
  }

  return { value: -(n - 1) * Math.log(g.order) + dilute, dilute }
}

export type Freezing = {
  beta: number
  dilute: number
  gaussian: number
  frozen: number
  crossings: number
}

// the freezing point: the LAST beta on the scan where the frozen branch overtakes the Gaussian one (past it the frozen
// branch stays above to betaMax), by bisection. At small beta the frozen branch's link gas is not dilute (every link
// free, sum_l ln z_l near links x ln |G|), which makes a spurious early crossing for the larger groups; the dilute
// correction at the returned point is the estimator's own validity figure
export function freezingPoint(
  g: GaugeGroup,
  L: GaugeLattice,
  G: GaussianData,
  betaMin = 0.05,
  betaMax = 40,
  step = 0.01,
): Freezing | null {
  const diff = (b: number): number =>
    frozenBranch(g, L, b).value - gaussianBranch(G, b)

  let prev = diff(betaMin)
  let last: [number, number] | null = null
  let crossings = 0

  for (let k = 1; betaMin + k * step <= betaMax; k++) {
    const b = betaMin + k * step
    const cur = diff(b)

    if (prev < 0 !== cur < 0) {
      crossings++
    }

    if (prev < 0 && cur >= 0) {
      last = [b - step, b]
    }

    prev = cur
  }

  if (!last || prev < 0) {
    return null
  }

  let [a, c] = last

  for (let i = 0; i < 80; i++) {
    const m = (a + c) / 2

    if (diff(m) >= 0) {
      c = m
    } else {
      a = m
    }
  }

  const beta = (a + c) / 2
  const fz = frozenBranch(g, L, beta)

  return {
    beta,
    dilute: fz.dilute,
    gaussian: gaussianBranch(G, beta),
    frozen: fz.value,
    crossings,
  }
}

// ---- plaquettes, the mean link, the continuum coupling ----

// one-loop <q0(U_p)> per plaquette at coupling beta (plaquette p at beta w_p)
export function plaquetteMeans(
  L: GaugeLattice,
  G: GaussianData,
  beta: number,
): number[] {
  return L.plaquettes.map(
    (p, i) => 1 - (1.5 * G.kappaP[i]!) / (beta * p.weight),
  )
}

// the mean link u0: ln u0 = sum_p ln <q0(U_p)> / sum_p perimeter_p
export function meanLink(
  L: GaugeLattice,
  G: GaussianData,
  beta: number,
): number {
  const q = plaquetteMeans(L, G, beta)

  let s = 0
  let m = 0

  for (let i = 0; i < q.length; i++) {
    s += Math.log(q[i]!)
    m += L.plaquettes[i]!.steps.length
  }

  return Math.exp(s / m)
}

const PLANES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
  [2, 3],
]

// the area bivector of a plaquette in physical coordinates, on the six planes
export function areaBivector(L: GaugeLattice, p: Plaquette): number[] {
  const x = p.vertices.map(v =>
    L.physical.map(row => row.reduce((s, c, j) => s + c * v[j]!, 0)),
  )

  return PLANES.map(([a, b]) => {
    let s = 0

    for (let i = 0; i < x.length; i++) {
      const u = x[i]!
      const w = x[(i + 1) % x.length]!

      s += u[a]! * w[b]! - u[b]! * w[a]!
    }

    return s / 2
  })
}

const det4 = (m: number[][]): number => {
  const a = m.map(r => [...r])

  let d = 1

  for (let c = 0; c < 4; c++) {
    let piv = c

    for (let r = c + 1; r < 4; r++) {
      if (Math.abs(a[r]![c]!) > Math.abs(a[piv]![c]!)) {
        piv = r
      }
    }

    if (piv !== c) {
      ;[a[piv], a[c]] = [a[c]!, a[piv]!]
      d = -d
    }

    const pc = a[c]![c]!

    if (pc === 0) {
      return 0
    }

    d *= pc

    for (let r = c + 1; r < 4; r++) {
      const f = a[r]![c]! / pc

      for (let j = c; j < 4; j++) {
        a[r]![j] = a[r]![j]! - f * a[c]![j]!
      }
    }
  }

  return d
}

// K on the six planes: sum_p w_p s_p A_p A_p^T / cell volume, with s_p = u0^perimeter for the tadpole-improved form (1
// for the bare one). kappa = trace / 6, and the anisotropy max |K - kappa I| / kappa
export function continuumTensor(
  L: GaugeLattice,
  u0 = 1,
): { kappa: number; anisotropy: number; K: number[][] } {
  if (L.dim !== 4) {
    throw new Error(
      'gauge-window: the continuum tensor is written for 4d',
    )
  }

  const vol = Math.abs(det4(L.physical))
  const K = PLANES.map(() => new Array(6).fill(0) as number[])

  for (const p of L.plaquettes) {
    const A = areaBivector(L, p)
    const s = p.weight * u0 ** p.steps.length

    for (let a = 0; a < 6; a++) {
      for (let b = 0; b < 6; b++) {
        K[a]![b] = K[a]![b]! + (s * A[a]! * A[b]!) / vol
      }
    }
  }

  const kappa = K.reduce((s, r, a) => s + r[a]!, 0) / 6

  let anisotropy = 0

  for (let a = 0; a < 6; a++) {
    for (let b = 0; b < 6; b++) {
      anisotropy = Math.max(
        anisotropy,
        Math.abs(K[a]![b]! - (a === b ? kappa : 0)) / kappa,
      )
    }
  }

  return { kappa, anisotropy, K }
}

// the tadpole-improved coupling g_TI^2 = 4 / (beta kappa_TI) at coupling beta
export function tadpoleCoupling(
  L: GaugeLattice,
  G: GaussianData,
  beta: number,
): { g2: number; u0: number; kappa: number; anisotropy: number } {
  const u0 = meanLink(L, G, beta)
  const t = continuumTensor(L, u0)

  return {
    g2: 4 / (beta * t.kappa),
    u0,
    kappa: t.kappa,
    anisotropy: t.anisotropy,
  }
}

// ---- SU(2) scaling ----

export const B0_SU2 = (11 * 2) / (3 * 16 * Math.PI * Math.PI)
export const B1_SU2 = ((34 / 3) * 4) / (16 * Math.PI * Math.PI) ** 2

// a Lambda at coupling g^2, two loops
export const twoLoop = (g2: number): number =>
  (B0_SU2 * g2) ** (-B1_SU2 / (2 * B0_SU2 * B0_SU2)) *
  Math.exp(-1 / (2 * B0_SU2 * g2))

// the modified Bessel function I_n by its series (for SU(2)'s character coefficients)
export function besselI(n: number, x: number): number {
  let term = (x / 2) ** n

  for (let k = 1; k <= n; k++) {
    term /= k
  }

  let s = term

  for (let k = 1; k < 400; k++) {
    term *= (x * x) / 4 / (k * (k + n))
    s += term

    if (term < s * 1e-17) {
      break
    }
  }

  return s
}

// SU(2)'s u = a_(1/2) / (2 a_0) = I_2(beta) / I_1(beta)
export const su2U = (beta: number): number =>
  besselI(2, beta) / besselI(1, beta)

// the leading strong-coupling tension per plaquette of a group at beta: -ln u, u = <q0> in the weight e^(beta q0)
export const strongTension = (
  g: GaugeGroup | null,
  beta: number,
): number => -Math.log(g ? characterWeights(g, beta).u : su2U(beta))

export type ScalingTable = { beta: number; sqrtSigma: number }[]

// SU(2)'s hypercubic string tension sigma a^2 at beta: the table (log-linear in a sqrt(sigma)) inside its range, two-loop
// scaling in the tadpole-improved coupling from the table's last point above it, NaN below it
export function hypercubicTension(
  table: ScalingTable,
  beta: number,
  gTI: (b: number) => number,
): number {
  const first = table[0] as { beta: number; sqrtSigma: number }
  const last = table[table.length - 1] as {
    beta: number
    sqrtSigma: number
  }

  if (beta < first.beta) {
    return NaN
  }

  if (beta >= last.beta) {
    const r = twoLoop(gTI(beta)) / twoLoop(gTI(last.beta))

    return (last.sqrtSigma * r) ** 2
  }

  for (let i = 0; i + 1 < table.length; i++) {
    const a = table[i] as { beta: number; sqrtSigma: number }
    const b = table[i + 1] as { beta: number; sqrtSigma: number }

    if (beta >= a.beta && beta <= b.beta) {
      const t = (beta - a.beta) / (b.beta - a.beta)

      return Math.exp(
        2 *
          ((1 - t) * Math.log(a.sqrtSigma) + t * Math.log(b.sqrtSigma)),
      )
    }
  }

  return NaN
}

// the beta on lattice L whose tadpole-improved coupling is g2 (g_TI^2 falls monotonically with beta where the one-loop
// mean link is positive), by bisection on [lo, hi]
export function matchCoupling(
  L: GaugeLattice,
  G: GaussianData,
  g2: number,
  lo = 0.5,
  hi = 200,
): number {
  const f = (b: number): number => tadpoleCoupling(L, G, b).g2 - g2

  if (!(g2 > 0) || !Number.isFinite(g2)) {
    return NaN
  }

  let a = lo
  let c = hi

  while (
    a < hi &&
    (!(meanLink(L, G, a) > 0) || !Number.isFinite(f(a)))
  ) {
    a *= 1.1
  }

  if (!(a < hi) || f(a) < 0 || f(c) > 0) {
    return NaN
  }

  for (let i = 0; i < 100; i++) {
    const m = (a + c) / 2

    if (f(m) > 0) {
      a = m
    } else {
      c = m
    }
  }

  return (a + c) / 2
}

// ---- 2I's characters over Z[phi] ----

export const PHI = (1 + Math.sqrt(5)) / 2

// v = a + b phi with a, b in (1/2) Z (every q0 of 2I and every character value is of this form), or null
export function goldenParts(
  v: number,
): { a: number; b: number } | null {
  for (let b2 = -24; b2 <= 24; b2++) {
    const a = v - (b2 / 2) * PHI

    if (Math.abs(2 * a - Math.round(2 * a)) < 1e-9) {
      return { a: Math.round(2 * a) / 2, b: b2 / 2 }
    }
  }

  return null
}

// the Galois conjugate phi -> 1 - phi
export const goldenConjugate = (v: number): number => {
  const p = goldenParts(v)

  if (!p) {
    throw new Error(`gauge-window: ${v} is not in (1/2) Z[phi]`)
  }

  return p.a + p.b * (1 - PHI)
}

// the Chebyshev U_n(x): the spin n/2 character of SU(2) at q0 = x
export function chebyshevU(n: number, x: number): number {
  let a = 1
  let b = 2 * x

  if (n === 0) {
    return 1
  }

  for (let k = 1; k < n; k++) {
    ;[a, b] = [b, 2 * x * b - a]
  }

  return b
}

export type GroupCharacters = {
  names: string[]
  dims: number[]
  // chars[R][g], floats
  chars: number[][]
  // sum_g chi_R chi_S / |G| against delta_RS, the worst entry
  orthogonality: number
  // every value a + b phi with a, b INTEGERS (Z[phi])
  integral: boolean
}

// 2I's nine irreps: the SU(2) spins 0 to 5/2 restricted (dims 1 to 6, the 4 faithful), the Galois conjugates of the
// spins 1/2 and 1 (2', 3'), and 2 x 2' (the 4 of A5, not faithful). Spin 3/2 is its own Galois conjugate (its character
// is rational), so it gives no new irrep. Read off the element's q0 (every character of an SU(2) subgroup is a function
// of q0)
export function icosianCharacters(g: GaugeGroup): GroupCharacters {
  const n = g.order
  const spins = [0, 1, 2, 3, 4, 5]
  const conj = [1, 2]
  const chars: number[][] = [
    ...spins.map(s => Array.from(g.q0, x => chebyshevU(s, x))),
    ...conj.map(s =>
      Array.from(g.q0, x => chebyshevU(s, goldenConjugate(x))),
    ),
    Array.from(
      g.q0,
      x => chebyshevU(1, x) * chebyshevU(1, goldenConjugate(x)),
    ),
  ]
  const names = ['1', '2', '3', '4', '5', '6', "2'", "3'", '4 (of A5)']
  const dims = [1, 2, 3, 4, 5, 6, 2, 3, 4]

  let orthogonality = 0

  for (let R = 0; R < chars.length; R++) {
    for (let S = 0; S < chars.length; S++) {
      let s = 0

      for (let x = 0; x < n; x++) {
        s += chars[R]![x]! * chars[S]![x]!
      }

      orthogonality = Math.max(
        orthogonality,
        Math.abs(s / n - (R === S ? 1 : 0)),
      )
    }
  }

  const integral = chars.every(row =>
    row.every(v => {
      const p = goldenParts(v)

      return !!p && Number.isInteger(p.a) && Number.isInteger(p.b)
    }),
  )

  return { names, dims, chars, orthogonality, integral }
}

// the Cayley-graph Laplacian on each irrep: C_R = sum over the nearest elements s of (1 - chi_R(s) / d_R)
export function cayleyCasimirs(
  g: GaugeGroup,
  c: GroupCharacters,
  nearestElements: readonly number[],
): number[] {
  return c.chars.map((row, R) =>
    nearestElements.reduce((s, x) => s + 1 - row[x]! / c.dims[R]!, 0),
  )
}

// ---- kept candidates and the one-face Floquet beat ----

// E = sum_R lambda_R P_R on one link: the kernel's value at the identity, e(1) = (1 / |G|) sum_R d_R^2 lambda_R, is the
// amplitude with which a link held at a definite value (the flat, pure-gauge register) keeps that value under one beat
export function flatSurvival(
  c: GroupCharacters,
  order: number,
  lambda: readonly [number, number][],
): number {
  let re = 0
  let im = 0

  for (let R = 0; R < c.dims.length; R++) {
    re += c.dims[R]! ** 2 * lambda[R]![0]
    im += c.dims[R]! ** 2 * lambda[R]![1]
  }

  return Math.hypot(re, im) / order
}

// the magnetic phase e^(-i theta (2 - chi_2(U_p))) on one face: the E = 0 register's kept weight (1 / |G|^2) |sum_g
// phase(g)|^2
export function emptyKeptWeight(g: GaugeGroup, theta: number): number {
  let re = 0
  let im = 0

  for (let x = 0; x < g.order; x++) {
    const a = -theta * (2 - 2 * g.q0[x]!)

    re += Math.cos(a)
    im += Math.sin(a)
  }

  return (re * re + im * im) / (g.order * g.order)
}

// one face with its three links as the whole register: gauge-invariant states are class functions of the holonomy h, the
// electric piece on each of the three links multiplies the chi_R component by lambda_R (so lambda_R^3), and the magnetic
// piece multiplies by e^(-i theta (2 - chi_2(h))). The beat F = E M on the class basis (b_c = [h in c] sqrt(|G| / |c|)),
// its eigenvectors, and for each the mean q0(h) and the weight on h = 1
export function faceFloquet(
  g: GaugeGroup,
  c: GroupCharacters,
  classes: readonly number[][],
  lambda: readonly [number, number][],
  theta: number,
): {
  phases: number[]
  q0: number[]
  identity: number[]
  unitarity: number
} {
  const K = classes.length
  const n = g.order

  if (K !== c.dims.length) {
    throw new Error('gauge-window: classes and irreps differ in number')
  }

  // T[R][c] = chi_R(c) sqrt(|c| / |G|), real (2I's characters are real)
  const T = c.chars.map(row =>
    classes.map(cl => row[cl[0]!]! * Math.sqrt(cl.length / n)),
  )
  const Fre = new Float64Array(K * K)
  const Fim = new Float64Array(K * K)

  for (let a = 0; a < K; a++) {
    for (let b = 0; b < K; b++) {
      // (T^T D_E T)_(a b), then the magnetic phase of class b applied first
      let sr = 0
      let si = 0

      for (let R = 0; R < K; R++) {
        const [lr, li] = lambda[R]!
        const l3r = lr * lr * lr - 3 * lr * li * li
        const l3i = 3 * lr * lr * li - li * li * li
        const t = T[R]![a]! * T[R]![b]!

        sr += t * l3r
        si += t * l3i
      }

      const q = g.q0[classes[b]![0]!]!
      const ang = -theta * (2 - 2 * q)
      const cr = Math.cos(ang)
      const ci = Math.sin(ang)

      Fre[a * K + b] = sr * cr - si * ci
      Fim[a * K + b] = sr * ci + si * cr
    }
  }

  // unitarity of F
  let unitarity = 0

  for (let a = 0; a < K; a++) {
    for (let b = 0; b < K; b++) {
      let sr = 0
      let si = 0

      for (let k = 0; k < K; k++) {
        sr +=
          Fre[a * K + k]! * Fre[b * K + k]! +
          Fim[a * K + k]! * Fim[b * K + k]!

        si +=
          Fim[a * K + k]! * Fre[b * K + k]! -
          Fre[a * K + k]! * Fim[b * K + k]!
      }

      unitarity = Math.max(
        unitarity,
        Math.hypot(sr - (a === b ? 1 : 0), si),
      )
    }
  }

  // eigenvectors of the normal F from the Hermitian H = (F + F^dag) / 2 + s (F - F^dag) / (2 i), s irrational
  const s = Math.SQRT2 - 1
  const H = makeComplexMatrix({ rows: K, cols: K })

  for (let a = 0; a < K; a++) {
    for (let b = 0; b < K; b++) {
      const fr = Fre[a * K + b]!
      const fi = Fim[a * K + b]!
      const tr = Fre[b * K + a]!
      const ti = -Fim[b * K + a]!

      // (F + F^dag)/2 + s (F - F^dag)/(2i); (x)/(2i) = -i x / 2
      const pr = (fr + tr) / 2
      const pi = (fi + ti) / 2
      const mr = fr - tr
      const mi = fi - ti

      H.re[a * K + b] = pr + (s * mi) / 2
      H.im[a * K + b] = pi - (s * mr) / 2
    }
  }

  const eig = eigHermitian({ matrix: H })
  const phases: number[] = []
  const q0: number[] = []
  const identity: number[] = []
  const idClass = classes.findIndex(cl => cl.includes(g.identity))

  for (let i = 0; i < K; i++) {
    const vr = Array.from(
      { length: K },
      (_, a) => eig.vectorsRe[a * K + i]!,
    )
    const vi = Array.from(
      { length: K },
      (_, a) => eig.vectorsIm[a * K + i]!,
    )

    // <v, F v>
    let zr = 0
    let zi = 0
    let mean = 0
    let norm = 0

    for (let a = 0; a < K; a++) {
      let wr = 0
      let wi = 0

      for (let b = 0; b < K; b++) {
        wr += Fre[a * K + b]! * vr[b]! - Fim[a * K + b]! * vi[b]!
        wi += Fre[a * K + b]! * vi[b]! + Fim[a * K + b]! * vr[b]!
      }

      zr += vr[a]! * wr + vi[a]! * wi
      zi += vr[a]! * wi - vi[a]! * wr

      const w = vr[a]! ** 2 + vi[a]! ** 2

      norm += w
      mean += w * g.q0[classes[a]![0]!]!
    }

    phases.push(Math.atan2(zi, zr))
    q0.push(mean / norm)
    identity.push((vr[idClass]! ** 2 + vi[idClass]! ** 2) / norm)
  }

  return { phases, q0, identity, unitarity }
}

// ---- the tension ratio at a coupling ----

export type Reference = {
  lattice: GaugeLattice
  data: GaussianData
  table: ScalingTable
}

export type TensionReading = {
  beta: number
  // the lattice's own tadpole-improved and bare continuum couplings, and the hypercubic betas that match each
  g2TI: number
  g2Bare: number
  matchTI: number
  matchBare: number
  // SU(2)'s sigma a^2 there (NaN below the table), in units of the lattice's axis link
  sigmaTI: number
  sigmaBare: number
  // the temporal plaquette's area in those units, and the group's strong-coupling tension -ln u(beta_t) per temporal
  // plaquette
  area: number
  strong: number
  // R = sigma area / strong (Infinity when sigma is not defined: the matched coupling lies below the table)
  ratioTI: number
  ratioBare: number
  // the one-loop plaquette deficits there (the largest), the validity figure of the whole chain
  deficit: number
}

// L's temporal plaquette is the last one whose kind names it temporal, or a square on the last axis for the hypercubic
// lattice; beta_t = beta times its weight
export function tensionReading(
  L: GaugeLattice,
  G: GaussianData,
  ref: Reference,
  g: GaugeGroup | null,
  beta: number,
): TensionReading {
  const tadpole = tadpoleCoupling(L, G, beta)
  const bare = continuumTensor(L, 1)
  const g2Bare = 4 / (beta * bare.kappa)
  const matchTI = matchCoupling(ref.lattice, ref.data, tadpole.g2)
  const matchBare = 4 / g2Bare
  const gRef = (b: number): number =>
    tadpoleCoupling(ref.lattice, ref.data, b).g2
  const sigmaTI = Number.isFinite(matchTI)
    ? hypercubicTension(ref.table, matchTI, gRef)
    : NaN
  const sigmaBare = hypercubicTension(ref.table, matchBare, gRef)
  const temporal =
    [...L.plaquettes]
      .reverse()
      .find(p => p.kind.startsWith('temporal')) ??
    L.plaquettes[L.plaquettes.length - 1]!
  const A = areaBivector(L, temporal)
  const area = Math.sqrt(A.reduce((s, x) => s + x * x, 0))
  const strong = strongTension(g, beta * temporal.weight)
  const ratio = (s: number): number =>
    Number.isFinite(s) ? (s * area) / strong : Infinity
  const deficit = Math.max(
    ...plaquetteMeans(L, G, beta).map(q => 1 - q),
  )

  return {
    beta,
    g2TI: tadpole.g2,
    g2Bare,
    matchTI,
    matchBare,
    sigmaTI,
    sigmaBare,
    area,
    strong,
    ratioTI: ratio(sigmaTI),
    ratioBare: ratio(sigmaBare),
    deficit,
  }
}
