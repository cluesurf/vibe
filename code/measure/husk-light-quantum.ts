// Measurement for the husk light's quantum sector in its metaplectic (Gaussian) reading, with matter coupled through
// its Peierls shift and an energy ledger (the experiment in test/experiment/quantum/husk-light-quantum, E-FRC-0292,
// OPEN-LGT-12, OPEN-LGT-22). Doubles throughout (a symbol on a grid of wave vectors, Householder and QL), no draw.
//
// THE LIGHT. code/measure/husk-balance's husk light: 9 link directions a dock (code/rule/trit-column's
// TRIT_HUSK_VECTORS, weights 1 on an axis and 2 on a face diagonal), 20 triangle types with multiplicities n_P, curl
// C(k). The beat is the leapfrog y' = y + s pi, pi' = pi - f A y' with y = W^(1/2) x, pi = W^(1/2) e, A(k) =
// W^(1/2) C^dag N C W^(1/2) (code/measure/husk-light-seam). Per eigenmode (A v = lambda v) the beat is the 2 x 2
// symplectic M = [[1, s], [-f lambda, 1 - s f lambda]], 2 - 2 cos omega = s f lambda. Away from a register's seam the
// rule's drift and force phases are exact quadratic maps (E-FRC-0231, 0282), so this is the light's quantum sector
// exactly there; the seam's weight is E-FRC-0282's reading and is not redone here.
//
// THE MODE OPERATORS. With [y_l(k), pi_m(k)^dag] = i hbar delta_lm, a = l1 y + l2 pi (per mode, along v) evolves as
// a' = e^(-i omega) a when (l1, l2) is M's left eigenvector at e^(-i omega): l2 = l1 (1 - e^(-i omega)) / (f lambda),
// normalized so [a, a^dag] = i hbar (l1 conj l2 - l2 conj l1) = 1. The ledger is H = sum omega (a^dag a + 1/2): every
// mode's omega is in (0, pi) because s f lambda < 4, so no energy is unwrapped (the seam criterion E-FRC-0269, 0270
// and 0275 lacked: the ledger counts quanta, it never takes a log of the beat).
//
// MATTER. The R* register member's band, E(K) = acos(cos M - 2 cos^2(M / 2) g^2(K)) (code/measure/spinor-register
// diracPhase, E-SPN-0160), couples to a uniform light A by the Peierls shift K -> K + q A, so the sea's ledger energy is
// sum_K E(K + q A) and the photon mass it induces is m^2 = q^2 sum_K d^2 E / dA^2 / V. For a gapped band on a torus that
// is a grid sum of a periodic function's derivative, zero up to aliasing; a metal (a band filled to a Fermi level)
// keeps a Drude term. seaStiffness reads both.
//
// THE PLATES. A z-periodic box of Lz husk layers, transverse momenta (kx, ky), and plates on planes where the in-plane
// links (directions with no z part) are held at zero, the conductor's tangential E = 0 (a principal submatrix of A).
// With two plates d and Lz - d apart, the bulk and the four faces are the same for every d, so the zero point
// E_0(d) = sum omega / 2 differs between separations only by the plates' interaction.

import { curlAt, type LightSymbol } from '@/code/measure/husk-balance'
import { TRIT_HUSK_VECTORS } from '@/code/rule/trit-column'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { hermitianEigenvaluesTridiagonal } from '@/code/algebra/linear/eig-hermitian-tridiagonal'
import { DOCK_ROOTS } from '@/code/measure/dock-mixer'

export type Light = { light: LightSymbol; w: number[]; n: number[] }

/** A complex Hermitian matrix, row-major. */
export type Herm = { n: number; re: Float64Array; im: Float64Array }

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)

/** A(k) = W^(1/2) C^dag N C W^(1/2), 9 x 9. */
export function huskSymbol({ light, w, n }: Light, k: readonly number[]): Herm {
  const L = w.length
  const P = n.length
  const { re: cr, im: ci } = curlAt(light, k)
  const sw = w.map(Math.sqrt)
  const re = new Float64Array(L * L)
  const im = new Float64Array(L * L)

  for (let r = 0; r < L; r++) {
    for (let c = 0; c < L; c++) {
      let sr = 0
      let si = 0

      for (let t = 0; t < P; t++) {
        // conj(C_tr) C_tc
        sr += n[t]! * (cr[t]![r]! * cr[t]![c]! + ci[t]![r]! * ci[t]![c]!)
        si += n[t]! * (cr[t]![r]! * ci[t]![c]! - ci[t]![r]! * cr[t]![c]!)
      }

      re[r * L + c] = sw[r]! * sw[c]! * sr
      im[r * L + c] = sw[r]! * sw[c]! * si
    }
  }

  return { n: L, re, im }
}

export const omegaOf = (lambda: number, sf: number): number =>
  Math.acos(1 - (sf * Math.max(lambda, 0)) / 2)

/** The symbol's eigenvalues at k, ascending, with the number of gauge (lambda ~ 0) directions. */
export function branchesAt(
  light: Light,
  k: readonly number[],
): { values: number[]; gauge: number } {
  const a = huskSymbol(light, k)
  const values = hermitianEigenvaluesTridiagonal(a.n, a.re, a.im).sort(
    (x, y) => x - y,
  )
  const top = Math.max(1, ...values.map(Math.abs))

  return { values, gauge: values.filter(x => x <= 1e-9 * top).length }
}

// ---- the mode operators and their commutators ----

export type Commutators = {
  /** largest |[a_i(k), a_j(k)^dag] - delta_ij| */
  normal: number
  /** largest |[a_i(k), a_j(-k)]| */
  anomalous: number
  /** largest |l M - e^(-i omega) l| over modes (the a' = e^(-i omega) a law) */
  evolution: number
  modes: number
  momenta: number
  gauge: number
}

type ModeSet = {
  lambda: number[]
  vRe: number[][]
  vIm: number[][]
  l1: [number, number][]
  l2: [number, number][]
  gauge: number
}

function modeSet(
  light: Light,
  k: readonly number[],
  s: number,
  f: number,
  hbar: number,
): ModeSet & { evolution: number } {
  const a = huskSymbol(light, k)
  const eig = hermitianEigenRows(a.n, a.re, a.im)
  const top = Math.max(1, ...Array.from(eig.values, Math.abs))
  const out: ModeSet & { evolution: number } = {
    lambda: [],
    vRe: [],
    vIm: [],
    l1: [],
    l2: [],
    gauge: 0,
    evolution: 0,
  }

  for (let i = 0; i < a.n; i++) {
    const lambda = eig.values[i]!

    if (lambda <= 1e-9 * top) {
      out.gauge++
      continue
    }

    const omega = omegaOf(lambda, s * f)
    // l1 = 1, l2 = (1 - e^(-i omega)) / (f lambda), then scale so i hbar (l1 l2* - l2 l1*) = 1
    const mr = Math.cos(omega)
    const mi = -Math.sin(omega)
    let l2: [number, number] = [(1 - mr) / (f * lambda), -mi / (f * lambda)]
    let l1: [number, number] = [1, 0]
    // i hbar (l1 l2* - l2 l1*) = i hbar (2 i Im(l1 l2*)) = -2 hbar Im(l1 l2*) = 2 hbar Im(l2) for l1 = 1
    const norm = 2 * hbar * l2[1]
    const sc = 1 / Math.sqrt(norm)

    l1 = [sc, 0]
    l2 = [l2[0] * sc, l2[1] * sc]

    // l M = mu l with M = [[1, s], [-f lambda, 1 - s f lambda]]
    const r1: [number, number] = [
      l1[0] - f * lambda * l2[0] - (mr * l1[0] - mi * l1[1]),
      l1[1] - f * lambda * l2[1] - (mr * l1[1] + mi * l1[0]),
    ]
    const g = 1 - s * f * lambda
    const r2: [number, number] = [
      s * l1[0] + g * l2[0] - (mr * l2[0] - mi * l2[1]),
      s * l1[1] + g * l2[1] - (mr * l2[1] + mi * l2[0]),
    ]

    out.evolution = Math.max(
      out.evolution,
      Math.hypot(...r1, ...r2) / Math.hypot(...l1, ...l2),
    )
    out.lambda.push(lambda)
    out.vRe.push(
      Array.from({ length: a.n }, (_, b) => eig.vectorsRe[i * a.n + b]!),
    )
    out.vIm.push(
      Array.from({ length: a.n }, (_, b) => eig.vectorsIm[i * a.n + b]!),
    )
    out.l1.push(l1)
    out.l2.push(l2)
  }

  return out
}

const cmul = (
  a: readonly [number, number],
  b: readonly [number, number],
): [number, number] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const cconj = (a: readonly [number, number]): [number, number] => [a[0], -a[1]]

/**
 * Every mode of the side-g box (k = 2 pi j / g): a_i(k) = sum_l conj(v_il) (l1 y_l(k) + l2 pi_l(k)). With
 * [y_l(k), pi_m(k)^dag] = i hbar delta and the real field's y(k)^dag = y(-k):
 *   [a_i(k), a_j(k)^dag] = i hbar <v_i, v_j> (l1_i conj l2_j - l2_i conj l1_j)
 *   [a_i(k), a_j(-k)]    = i hbar sum_l conj(v_il(k)) conj(v_jl(-k)) (l1_i l2_j - l2_i l1_j)
 * with v(-k) diagonalized on its own (no conjugation assumed).
 */
export function modeCommutators(
  light: Light,
  split: { s: number; f: number; n: number },
  g: number,
): Commutators {
  const hbar = split.n / (2 * Math.PI)
  const out: Commutators = {
    normal: 0,
    anomalous: 0,
    evolution: 0,
    modes: 0,
    momenta: 0,
    gauge: 0,
  }
  const kOf = (j: number[]): number[] => j.map(x => (2 * Math.PI * x) / g)

  for (let i = 0; i < g ** 3; i++) {
    const j = [i % g, Math.floor(i / g) % g, Math.floor(i / g / g)]
    const jm = j.map(x => (g - x) % g)
    const A = modeSet(light, kOf(j), split.s, split.f, hbar)
    const B = modeSet(light, kOf(jm), split.s, split.f, hbar)

    out.momenta++
    out.modes += A.lambda.length
    out.gauge += A.gauge
    out.evolution = Math.max(out.evolution, A.evolution)

    for (let p = 0; p < A.lambda.length; p++) {
      for (let q = 0; q < A.lambda.length; q++) {
        // <v_p, v_q> = sum conj(v_p) v_q
        let ir = 0
        let ii = 0

        for (let l = 0; l < A.vRe[p]!.length; l++) {
          const ar = A.vRe[p]![l]!
          const ai = -A.vIm[p]![l]!
          const br = A.vRe[q]![l]!
          const bi = A.vIm[q]![l]!

          ir += ar * br - ai * bi
          ii += ar * bi + ai * br
        }

        const x = cmul(A.l1[p]!, cconj(A.l2[q]!))
        const y = cmul(A.l2[p]!, cconj(A.l1[q]!))
        // i hbar <v_p, v_q> (x - y)
        const t = cmul([ir, ii], [x[0] - y[0], x[1] - y[1]])
        const c: [number, number] = [-hbar * t[1], hbar * t[0]]
        const dev = Math.hypot(c[0] - (p === q ? 1 : 0), c[1])

        out.normal = Math.max(out.normal, dev)
      }

      for (let q = 0; q < B.lambda.length; q++) {
        // sum_l conj(v_p(k)) conj(v_q(-k))
        let ir = 0
        let ii = 0

        for (let l = 0; l < A.vRe[p]!.length; l++) {
          const ar = A.vRe[p]![l]!
          const ai = -A.vIm[p]![l]!
          const br = B.vRe[q]![l]!
          const bi = -B.vIm[q]![l]!

          ir += ar * br - ai * bi
          ii += ar * bi + ai * br
        }

        const x = cmul(A.l1[p]!, B.l2[q]!)
        const y = cmul(A.l2[p]!, B.l1[q]!)
        const t = cmul([ir, ii], [x[0] - y[0], x[1] - y[1]])

        out.anomalous = Math.max(out.anomalous, hbar * Math.hypot(...t))
      }
    }
  }

  return out
}

// ---- the Weyl pair on one register, exact, and the Heisenberg form's deficit ----

/**
 * The clock Z|x> = zeta^x |x> and shift X|x> = |x + 1> on Z_N: Z X |x> = zeta^(x + 1) |x + 1>, X Z |x> = zeta^x |x + 1>,
 * so Z X = zeta X Z holds when the exponent difference is 1 mod N at every x. Integers only. Returns the number of x
 * where it fails (0 is exact).
 */
type Monomial = { to: Int32Array; exp: Int32Array } // |x> -> zeta^exp[x] |to[x]>

const compose = (a: Monomial, b: Monomial, N: number): Monomial => {
  // (a b)|x> = a (zeta^b.exp[x] |b.to[x]>)
  const to = new Int32Array(N)
  const exp = new Int32Array(N)

  for (let x = 0; x < N; x++) {
    const y = b.to[x]!

    to[x] = a.to[y]!
    exp[x] = (b.exp[x]! + a.exp[y]!) % N
  }

  return { to, exp }
}

export function weylFailures(N: number): number {
  const Z: Monomial = {
    to: Int32Array.from({ length: N }, (_, x) => x),
    exp: Int32Array.from({ length: N }, (_, x) => x),
  }
  const X: Monomial = {
    to: Int32Array.from({ length: N }, (_, x) => (x + 1) % N),
    exp: new Int32Array(N),
  }
  const zx = compose(Z, X, N)
  const xz = compose(X, Z, N)
  let bad = 0

  for (let x = 0; x < N; x++) {
    if (zx.to[x] !== xz.to[x] || (zx.exp[x]! - xz.exp[x]! - 1 + 2 * N) % N !== 0) {
      bad++
    }
  }

  // Z^N = X^N = 1
  let zn = Z
  let xn = X

  for (let i = 1; i < N; i++) {
    zn = compose(zn, Z, N)
    xn = compose(xn, X, N)
  }

  for (let x = 0; x < N; x++) {
    if (zn.to[x] !== x || zn.exp[x] !== 0 || xn.to[x] !== x || xn.exp[x] !== 0) {
      bad++
    }
  }

  return bad
}

/**
 * The Heisenberg pair on Z_N: x = diag(bal(x)), p = F^dag diag(bal(m)) F, F the unitary DFT. On a finite register
 * Tr [x, p] = 0, so [x, p] = i hbar (hbar = N / (2 pi)) can hold only on states away from the seam. For the discrete
 * Gaussian psi(x) ~ exp(-x^2 / (4 sigma2)) returns 1 - Im <psi|[x, p]|psi> / hbar.
 */
export function heisenbergDeficit(N: number, sigma2: number): number {
  const bal = (x: number): number => (x > (N - 1) / 2 ? x - N : x)
  const psi = new Float64Array(N)
  let nn = 0

  for (let x = 0; x < N; x++) {
    psi[x] = Math.exp(-(bal(x) ** 2) / (4 * sigma2))
    nn += psi[x]! ** 2
  }

  for (let x = 0; x < N; x++) {
    psi[x]! /= Math.sqrt(nn)
  }

  // p_xy = (1/N) sum_m bal(m) e^(2 pi i m (x - y) / N), Hermitian
  const pRe = new Float64Array(N * N)
  const pIm = new Float64Array(N * N)

  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      let sr = 0
      let si = 0

      for (let m = 0; m < N; m++) {
        const ph = (2 * Math.PI * m * (x - y)) / N

        sr += bal(m) * Math.cos(ph)
        si += bal(m) * Math.sin(ph)
      }

      pRe[x * N + y] = sr / N
      pIm[x * N + y] = si / N
    }
  }

  // <psi|[x, p]|psi> = sum_xy psi_x psi_y (bal(x) - bal(y)) p_xy (psi real)
  let cr = 0
  let ci = 0

  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) {
      const w = psi[x]! * psi[y]! * (bal(x) - bal(y))

      cr += w * pRe[x * N + y]!
      ci += w * pIm[x * N + y]!
    }
  }

  const hbar = N / (2 * Math.PI)

  void cr

  return 1 - ci / hbar
}

// ---- the dispersion ----

export type Branch = { lambda: number; omega: number; speed: number }

/** The photon branches at k: every positive lambda below `photonCut` (the massive branches sit near 24). */
export function photonAt(
  light: Light,
  k: readonly number[],
  sf: number,
  photonCut = 6,
): { photons: Branch[]; gauge: number; massive: number } {
  const { values, gauge } = branchesAt(light, k)
  const top = Math.max(1, ...values.map(Math.abs))
  const kk = Math.hypot(...k)
  const positive = values.filter(x => x > 1e-9 * top)
  const photons = positive
    .filter(x => x < photonCut)
    .map(lambda => {
      const omega = omegaOf(lambda, sf)

      return { lambda, omega, speed: omega / kk }
    })

  return { photons, gauge, massive: positive.length - photons.length }
}

// ---- the thermal ledger: Stefan-Boltzmann, by spherical quadrature ----

/** Gauss-Legendre nodes and weights on [-1, 1] (Newton on P_n). */
export function gaussLegendre(n: number): { x: number[]; w: number[] } {
  const x: number[] = []
  const w: number[] = []

  for (let i = 0; i < n; i++) {
    let t = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    let dp = 1

    for (let it = 0; it < 100; it++) {
      let p0 = 1
      let p1 = t

      for (let k = 2; k <= n; k++) {
        const p2 = ((2 * k - 1) * t * p1 - (k - 1) * p0) / k

        p0 = p1
        p1 = p2
      }

      dp = (n * (t * p1 - p0)) / (t * t - 1)
      const dt = p1 / dp

      t -= dt

      if (Math.abs(dt) < 1e-15) {
        break
      }
    }

    x.push(t)
    w.push(2 / ((1 - t * t) * dp * dp))
  }

  return { x, w }
}

export type ThermalGrid = {
  /** per quadrature point: the weight of d^3k / (2 pi)^3 and every positive omega there */
  weight: number[]
  omegas: number[][]
}

/** omega of every positive mode on a ball of radius kMax, Gauss-Legendre in k and cos(theta), uniform in phi. */
export function thermalGrid(
  light: Light,
  sf: number,
  kMax: number,
  nk: number,
  nt: number,
  np: number,
): ThermalGrid {
  const gk = gaussLegendre(nk)
  const gt = gaussLegendre(nt)
  const weight: number[] = []
  const omegas: number[][] = []

  for (let a = 0; a < nk; a++) {
    const k = (kMax * (gk.x[a]! + 1)) / 2
    const wk = (kMax / 2) * gk.w[a]! * k * k

    for (let b = 0; b < nt; b++) {
      const ct = gt.x[b]!
      const st = Math.sqrt(1 - ct * ct)

      for (let c = 0; c < np; c++) {
        const ph = (2 * Math.PI * (c + 0.5)) / np
        const kv = [k * st * Math.cos(ph), k * st * Math.sin(ph), k * ct]
        const { values } = branchesAt(light, kv)
        const top = Math.max(1, ...values.map(Math.abs))

        weight.push((wk * gt.w[b]! * (2 * Math.PI)) / np / (2 * Math.PI) ** 3)
        omegas.push(values.filter(x => x > 1e-9 * top).map(x => omegaOf(x, sf)))
      }
    }
  }

  return { weight, omegas }
}

/** The ledger's thermal energy per dock, sum omega n(omega), quantum (Bose) or classical (equipartition, T a mode). */
export function thermalEnergy(
  grid: ThermalGrid,
  T: number,
  quantum: boolean,
): number {
  let u = 0

  grid.weight.forEach((w, i) => {
    for (const om of grid.omegas[i]!) {
      u += w * (quantum ? om / Math.expm1(om / T) : T)
    }
  })

  return u
}

/**
 * The thermal Gaussian state of one mode, Gamma_T = coth(omega / 2T) Gamma_0 on (y, pi), Gamma_0 the beat's invariant
 * (hbar / 2 sin omega) [[s, -s f lambda / 2], [-s f lambda / 2, f lambda]] as husk-light-seam has it (up to the
 * off-diagonal's sign convention, which is fixed here by M Gamma M^T = Gamma). Returns its beat-invariance residual and
 * the occupation <a^dag a> = l Gamma l^dag - 1/2 read with the mode operator l of modeSet.
 */
export function thermalMode(
  lambda: number,
  s: number,
  f: number,
  hbar: number,
  T: number,
): { invariance: number; occupation: number; omega: number } {
  const omega = omegaOf(lambda, s * f)
  const sin = Math.sin(omega)
  const c = 1 / Math.tanh(omega / (2 * T))
  // invariant symmetric form of M = [[1, s], [-f lambda, 1 - s f lambda]]: solve M G M^T = G for G = [[a, b], [b, d]]
  // with the classical energy's covariance: a = s, d = f lambda, b = -s f lambda / 2 (checked by the residual)
  const g0 = (hbar / (2 * sin)) * c
  const G = [
    [g0 * s, -g0 * ((s * f * lambda) / 2)],
    [-g0 * ((s * f * lambda) / 2), g0 * f * lambda],
  ]
  const M = [
    [1, s],
    [-f * lambda, 1 - s * f * lambda],
  ]
  let inv = 0

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let x = 0

      for (let p = 0; p < 2; p++) {
        for (let q = 0; q < 2; q++) {
          x += M[i]![p]! * G[p]![q]! * M[j]![q]!
        }
      }

      inv = Math.max(inv, Math.abs(x - G[i]![j]!) / Math.abs(G[1]![1]!))
    }
  }

  // the mode operator: l1 = sc, l2 = sc (1 - e^(-i omega)) / (f lambda)
  const l2r = (1 - Math.cos(omega)) / (f * lambda)
  const l2i = Math.sin(omega) / (f * lambda)
  const sc = 1 / Math.sqrt(2 * hbar * l2i)
  const L = [
    [sc, 0],
    [sc * l2r, sc * l2i],
  ]
  // <a^dag a> = sym part: <a a^dag + a^dag a> / 2 = l Gamma l^dag (Gamma symmetrized), occupation = that - 1/2
  let quad = 0

  for (let p = 0; p < 2; p++) {
    for (let q = 0; q < 2; q++) {
      // Re(l_p conj(l_q)) G_pq
      quad += (L[p]![0]! * L[q]![0]! + L[p]![1]! * L[q]![1]!) * G[p]![q]!
    }
  }

  return { invariance: inv, occupation: quad - 0.5, omega }
}

// ---- matter: the sea's stiffness under a uniform light ----

const SQRT288 = Math.sqrt(288)

/** E(K) and d^2 E / dK_axis^2 of the R* member's band (diracPhase), analytic. */
export function memberBand(
  K: readonly number[],
  M: number,
  axis: number,
): { E: number; second: number } {
  const s = [0, 0, 0, 0]
  const ds = [0, 0, 0, 0]
  const dds = [0, 0, 0, 0]

  for (const r of DOCK_ROOTS) {
    const ph = dot(K, r)
    const sn = Math.sin(ph) / SQRT288
    const cs = Math.cos(ph) / SQRT288
    const ra = r[axis]!

    for (let i = 0; i < 4; i++) {
      s[i]! += r[i]! * sn
      ds[i]! += r[i]! * ra * cs
      dds[i]! -= r[i]! * ra * ra * sn
    }
  }

  const g2 = dot(s, s) / 4
  const dg2 = dot(s, ds) / 2
  const ddg2 = (dot(ds, ds) + dot(s, dds)) / 2
  const kap = 2 * Math.cos(M / 2) ** 2
  const x = Math.cos(M) - kap * g2
  const dx = -kap * dg2
  const ddx = -kap * ddg2
  const q = 1 - x * x

  return {
    E: Math.acos(x),
    second: -ddx / Math.sqrt(q) - (x * dx * dx) / q ** 1.5,
  }
}

export type Stiffness = {
  /** |sum_filled E''| / sum_filled |E''|, the sea's photon mass against its diamagnetic scale */
  ratio: number
  /** sum_filled E'' / V */
  perDock: number
  filled: number
  /** the band's least distance to 0 or pi on the grid (open gaps at both ends keep E analytic) */
  minGap: number
  /** the band's range on the grid */
  low: number
  high: number
}

/**
 * The sea on the side-L torus of Z^4 momenta K = 2 pi (j + 1/2) / L (the midpoint grid, so no K sits on a symmetry
 * point): a gapped sea fills the whole band; a metal fills K with E(K) < fermi.
 */
export function seaStiffness(
  M: number,
  L: number,
  axis: number,
  fermi?: number,
): Stiffness {
  let sum = 0
  let abs = 0
  let filled = 0
  let minGap = Infinity
  let low = Infinity
  let high = -Infinity

  for (let i = 0; i < L ** 4; i++) {
    const K = [
      i % L,
      Math.floor(i / L) % L,
      Math.floor(i / L ** 2) % L,
      Math.floor(i / L ** 3),
    ].map(j => (2 * Math.PI * (j + 0.5)) / L)
    const { E, second } = memberBand(K, M, axis)

    minGap = Math.min(minGap, E, Math.PI - E)
    low = Math.min(low, E)
    high = Math.max(high, E)

    if (fermi !== undefined && E >= fermi) {
      continue
    }

    sum += second
    abs += Math.abs(second)
    filled++
  }

  return {
    ratio: Math.abs(sum) / abs,
    perDock: sum / L ** 4,
    filled,
    minGap,
    low,
    high,
  }
}

// ---- the plates: the zero point of a z-periodic box with frozen in-plane links ----

/** Link types with no z part: the plate's tangential links. */
export const IN_PLANE: readonly number[] = TRIT_HUSK_VECTORS.flatMap((v, l) =>
  v[2] === 0 ? [l] : [],
)

/**
 * A(kx, ky) on Lz layers, the links of `frozen` layers' in-plane types removed (principal submatrix), as Herm. Link
 * (z, l) sits at row z * 9 + l before removal.
 */
export function slabSymbol(
  { light, w, n }: Light,
  kx: number,
  ky: number,
  Lz: number,
  frozen: readonly number[],
): Herm {
  const L = w.length
  const P = n.length
  const cols = Lz * L
  const keep: number[] = []
  const frozenSet = new Set(frozen.map(z => ((z % Lz) + Lz) % Lz))

  for (let z = 0; z < Lz; z++) {
    for (let l = 0; l < L; l++) {
      if (!(frozenSet.has(z) && IN_PLANE.includes(l))) {
        keep.push(z * L + l)
      }
    }
  }

  // C rows (z0, t), columns (z, l): sign e^(i (kx ox + ky oy)) at z = z0 + oz
  const cRe = new Float64Array(Lz * P * cols)
  const cIm = new Float64Array(Lz * P * cols)

  for (let z0 = 0; z0 < Lz; z0++) {
    light.plaquettes.forEach((pl, t) => {
      for (const { link, sign, offset } of pl.links) {
        const z = (((z0 + offset[2]!) % Lz) + Lz) % Lz
        const ph = kx * offset[0]! + ky * offset[1]!
        const at = (z0 * P + t) * cols + z * L + link

        cRe[at]! += sign * Math.cos(ph)
        cIm[at]! += sign * Math.sin(ph)
      }
    })
  }

  const m = keep.length
  const re = new Float64Array(m * m)
  const im = new Float64Array(m * m)
  const sw = keep.map(c => Math.sqrt(w[c % L]!))

  // A_ab = sw_a sw_b sum_rows n_t conj(C_ra) C_rb; each row touches only its 3 links, so loop rows
  for (let z0 = 0; z0 < Lz; z0++) {
    for (let t = 0; t < P; t++) {
      const row = (z0 * P + t) * cols
      const support: number[] = []

      keep.forEach((c, a) => {
        if (cRe[row + c] !== 0 || cIm[row + c] !== 0) {
          support.push(a)
        }
      })

      for (const a of support) {
        const ar = cRe[row + keep[a]!]!
        const ai = -cIm[row + keep[a]!]!

        for (const b of support) {
          const br = cRe[row + keep[b]!]!
          const bi = cIm[row + keep[b]!]!
          const x = n[t]! * sw[a]! * sw[b]!

          re[a * m + b]! += x * (ar * br - ai * bi)
          im[a * m + b]! += x * (ar * bi + ai * br)
        }
      }
    }
  }

  return { n: m, re, im }
}

/** The zero point per transverse dock, (1 / G^2) sum_(kx, ky) sum omega / 2, on the midpoint transverse grid. */
export function slabZeroPoint(
  light: Light,
  sf: number,
  Lz: number,
  frozen: readonly number[],
  G: number,
): { energy: number; gauge: number; modes: number } {
  let energy = 0
  let gauge = 0
  let modes = 0

  for (let a = 0; a < G; a++) {
    for (let b = 0; b < G; b++) {
      const kx = (2 * Math.PI * (a + 0.5)) / G - Math.PI
      const ky = (2 * Math.PI * (b + 0.5)) / G - Math.PI
      const A = slabSymbol(light, kx, ky, Lz, frozen)
      const values = hermitianEigenvaluesTridiagonal(A.n, A.re, A.im)
      const top = Math.max(1, ...values.map(Math.abs))

      for (const x of values) {
        if (x <= 1e-9 * top) {
          gauge++
          continue
        }

        energy += omegaOf(x, sf) / 2
        modes++
      }
    }
  }

  return { energy: energy / (G * G), gauge, modes }
}

/** The least-squares fit E(d) = a + C (d^p + (Lz - d)^p) over a scan of p; linear in (a, C) at each p. */
export function casimirFit(
  ds: readonly number[],
  es: readonly number[],
  Lz: number,
): { p: number; C: number; a: number; residual: number } {
  let best = { p: 0, C: 0, a: 0, residual: Infinity }

  for (let p = -6; p <= -1; p += 1e-4) {
    const x = ds.map(d => d ** p + (Lz - d) ** p)
    const n = ds.length
    const mx = x.reduce((s, v) => s + v, 0) / n
    const me = es.reduce((s, v) => s + v, 0) / n
    let sxx = 0
    let sxe = 0

    x.forEach((v, i) => {
      sxx += (v - mx) ** 2
      sxe += (v - mx) * (es[i]! - me)
    })

    const C = sxe / sxx
    const a = me - C * mx
    const residual = Math.sqrt(
      x.reduce((s, v, i) => s + (a + C * v - es[i]!) ** 2, 0) / n,
    )

    if (residual < best.residual) {
      best = { p, C, a, residual }
    }
  }

  return best
}
