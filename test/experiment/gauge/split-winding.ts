// DOES THE LIGHT'S SPLIT CARRY AN INTEGER? (E-FRC-0276, OPEN-LGT-02). The husk light's split rho = f / s (the force's
// share over the drift's, at fixed coupling kappa = s f, code/measure/light-split-origin) is undecided between the
// average reading 0.4613818 and the worst-register reading 0.4146386 (E-FRC-0269), and Planck could not pick one by
// root (E-FRC-0269), ratio (E-FRC-0270) or spectral flow (E-FRC-0275). The guess tested here: at exactly one of the two
// the light has an integer topological invariant, or the two have different ones.
//
// WHICH INVARIANT, AND WHY (read off the light's construction before choosing).
//  - THE LIGHT. Linearized, the husk light is a leapfrog per wave vector k (code/rule/trit-column, code/measure/
//    husk-balance): drift x <- x + s e on the 9 husk links, kick e <- e - f K(k) x with K = C^dag N C W (C the husk
//    curl, plaquettes by links; N the triangle multiplicities; W the link weights). One beat is the 18 x 18 matrix
//    T(k) = [[1, s], [-f K, 1 - kappa K]] on (x, e). K is similar to the Hermitian G = W^(1/2) C^dag N C W^(1/2), whose
//    eigenvalues mu >= 0 are 0 on the gauge line and positive on the 8 moving links; each moving mode is a 2 x 2 block
//    with eigenvalues l, conj(l) on the unit circle, l^2 - (2 - kappa mu) l + 1 = 0, while kappa mu < 4.
//  - THE INVARIANT. The light is a real, linear, gapped (away from k = 0) family of beat maps over the husk Brillouin
//    zone, the 3-torus. Its integer band invariants are the Chern numbers of a band bundle on closed 2d slices of the
//    torus; a 1d winding of a band (its Berry phase) is not an integer without a further symmetry, and the 3d winding
//    of a unitary needs the beat to be unitary in a k-independent metric. So this file computes the first Chern number
//    of (a) E+, the span of the 8 positive-frequency eigenvectors of T(k) (Im l > 0), and (b) the photon's own pair (the
//    two lowest moving modes) where it is gapped from the rest, on six slices that avoid k = 0 (where the photon's
//    frequency closes on the gauge line), by the Fukui-Hatsugai-Suzuki link method on the beat's own eigenvectors,
//    each eigenvector checked against T(k) itself.
//
// DERIVED BEFORE THE RUN.
//  1. THE SPLIT IS A CHANGE OF UNITS. With x = sqrt(s) a and e = b / sqrt(s) the beat is [[1, 1], [-kappa K, 1 - kappa
//     K]] on (a, b), which holds kappa and not rho. So T at rho1 equals M T at rho2 M^(-1) with the CONSTANT M =
//     diag(sqrt(s1 / s2), sqrt(s2 / s1)): the same eigenvalues at every k, and eigenvectors mapped by one fixed matrix.
//     Every homotopy invariant of the band family (every Chern number, every winding) is therefore THE SAME at every
//     split. The split enters only the ratio of the e and x amplitudes in a mode, |e|^2 / |x|^2 = rho |l - 1|^2 /
//     kappa: how the energy is shared between the two registers, which is what E-FRC-0269's fills are about.
//  2. THE NUMBERS ARE 0. E+ is homotopic (through (u, t (l - 1) u / s), t in [0, 1]) to the moving-link bundle range(G),
//     the complement of the gauge line ker(G), which is spanned by the lattice gradient, a section with no zero on any
//     slice that avoids k = 0: a trivial line, so Chern(E+) = -Chern(ker) = 0. And G(-k) = conj G(k) (a real light):
//     a slice through k3 = 0 or pi is its own time reverse, so any gapped band on it has Chern 0, and a slice at k3 = c
//     has the opposite Chern of the slice at -c, so a band gapped from c through pi to -c has Chern 0 on all of them.
//  PREDICTED: every Chern number read is 0, at both splits, both couplings and both grids. The guess FAILS: the two
//  splits carry the same integer, and no integer of this light can single out a split.
//
// HYPOTHESES (the brief's), written before any run of this file.
//  H  THE SPLIT HAS AN INTEGER: on some slice, the Chern number of E+ or of the photon pair differs between rho =
//     0.4613818 and rho = 0.4146386, or exactly one of the two is an integer.
//  P  FALSIFIER: both splits give the same integer on every slice read (predicted).
// GATES (an instrument or gate failure makes the verdict partial).
//  D1 THE CONJUGATION: at 64 Weyl momenta || T(rho1) - M T(rho2) M^(-1) ||_max <= 1e-13 for both couplings.
//  D2 THE EIGENVECTORS ARE THE BEAT'S: every basis vector of E+ at every grid point satisfies || T v - l v || <= 1e-10
//     || v ||, |l| = 1 within 1e-12, Im l > 0.
//  D3 WELL DEFINED: on every slice and grid the moving links number 8 at every point with the least mu at least 1e-3,
//     and kappa mu_max < 4 (stable); the photon pair is read only on slices where mu_3 - mu_2 >= 1e-3 everywhere (the
//     count of such slices is reported, not gated).
//  D4 INTEGRAL AND RESOLVED: every Chern sum is within 1e-9 of an integer, the two grids (24 and 32 a side) agree, and
//     the least |det| of a link overlap is at least 0.1 (the grid resolves the bundle).
// CONTROLS. C1 the same link method on the Qi-Wu-Zhang band h(k) = sin k1 X + sin k2 Y + (m + cos k1 + cos k2) Z
//  gives lower-band Chern of magnitude 1 at m = 1 and at m = -1 with opposite signs, and 0 at m = 3: the instrument
//  can read a nonzero integer, and one that changes with a parameter. C2 at rho = 1 (s = f) every number equals the
//  splits' (a third point on the line).
// READ: the e / x energy ratio of the lowest mode at one k at each split (their quotient is rho1 / rho2 = 1.1127 by
// item 1), and the photon pair's slices.
// VERDICT, fixed before the run: FAIL (as derived) when D1 to D4 and the controls hold and the splits agree on every
// slice; PASS when D1 to D4 and the controls hold and H holds; PARTIAL when a gate or control fails.
//
// FIRST RUN (tmp/np-gate-E-FRC-0276.log, 8 s): FAIL, as derived. Every gate and control held, no gate moved and none
// was rerun.
//  - D1: T at the average split equals M T at the worst-register split M^-1 to 8.9e-16 at 64 momenta, both couplings.
//  - D2, D3: every E+ vector is the beat's own to 5.7e-15, |l| = 1 to 2.2e-16, least Im l 0.17; 8 moving links at
//    every grid point of every slice, least mu 0.475, largest kappa mu 3.5 (stable).
//  - D4 and H: all 72 slice readings (6 slices, 2 couplings, 3 splits, 2 grids) are within 4.3e-16 of the integer 0,
//    least link |det| 0.907; the 24 comparisons of the two splits differ in 0. The photon pair touches the next band on
//    every slice (mu_3 - mu_2 down to 0), so no photon-only Chern number exists to read there.
//  - C1: the Qi-Wu-Zhang band reads +1, -1 and 0 at m = 1, -1, 3. C2: rho = 1 reads the same 0.
//  - READ: the lowest mode's e / x energy ratio is 1.516 at the average split and 1.363 at the worst-register split,
//    quotient 1.112733 = rho1 / rho2 exactly, as item 1 says: the split moves the share of energy between the two
//    registers and nothing else.
// WHAT IT MEANS for OPEN-LGT-02: no topological invariant of the classical husk light can pick 0.4614 or 0.4146, by a
// theorem (the split is a constant change of units at fixed kappa), and the one this light has is 0 at both. The split
// is a statement about how energy fills the link and plaquette registers, which is where E-FRC-0269's seam argument
// put it; the decision has to come from the registers' seams (the quantum light), not from band topology.
//
// Depth L1 (the conjugation and the vanishing are derived; the link method confirms them on the light's own beat).
// The kappa used is in the units of G as huskLight builds it (mu_max = 32): 1/16 and 7/64 (kappa mu_max = 2 and 3.5),
// both stable; the light's physical kappa is not fixed here, and item 1 makes the split's answer the same at every
// stable kappa. DETERMINISM: no random numbers; grids and Weyl sequences.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { curlAt, huskLight } from '@/code/measure/husk-balance'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'

const RHO_AVERAGE = 0.4613818491
const RHO_WORST = 0.4146386
const KAPPAS = [1 / 16, 7 / 64]
const GRIDS = [24, 32]
const GAP = 1e-3
const MOVING = 8
const ZERO = 1e-9
const TWO_PI = 2 * Math.PI

type Slice = { name: string; fixed: number; value: number }

// the slices: the two free axes are the others, each over [0, 2 pi)
const SLICES: Slice[] = [
  { name: 'k3 = pi/2', fixed: 2, value: Math.PI / 2 },
  { name: 'k3 = pi', fixed: 2, value: Math.PI },
  { name: 'k3 = 0.6', fixed: 2, value: 0.6 },
  { name: 'k1 = pi', fixed: 0, value: Math.PI },
  { name: 'k1 = 1.1', fixed: 0, value: 1.1 },
  { name: 'k2 = pi/2', fixed: 1, value: Math.PI / 2 },
]

const flag = (b: boolean): number => (b ? 1 : 0)

export default experiment({
  id: 'gauge/split-winding',
  code: 'E-FRC-0276',
  title:
    "no integer of the husk light singles out a split, fail as derived: at fixed coupling kappa = s f the split rho = f / s is a constant change of units, x = sqrt(s) a and e = b / sqrt(s), so the beat at 0.4614 equals the beat at 0.4146 conjugated by one fixed matrix (to 8.9e-16 at 64 momenta) and every band invariant is the same at both; the Chern number of the positive-frequency bundle of the beat's own eigenvectors, read by the link method on six slices avoiding k = 0 at two couplings and two grids, is 0 at both splits and at rho = 1 (72 readings within 4.3e-16 of 0), as the gauge line's trivial section and time reversal require; the photon pair touches the next band on every slice, so it has no Chern number of its own; control: the same instrument reads the Qi-Wu-Zhang band as +1, -1 and 0; what the split does change is the e / x energy share of a mode, by exactly rho1 / rho2 = 1.1127",
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return splitWindingRun()
  },
})

type C = [number, number]
type Vec = { re: Float64Array; im: Float64Array }

const LIGHT = huskLight()
const L = LIGHT.w.length
const P = LIGHT.n.length

// G(k) = W^(1/2) C^dag N C W^(1/2) and K(k) = C^dag N C W, row-major re and im
function operators(k: readonly number[]): { G: Vec; K: Vec } {
  const { re, im } = curlAt(LIGHT.light, k)
  const G = { re: new Float64Array(L * L), im: new Float64Array(L * L) }
  const K = { re: new Float64Array(L * L), im: new Float64Array(L * L) }

  for (let i = 0; i < L; i++) {
    for (let j = 0; j < L; j++) {
      let sr = 0
      let si = 0

      for (let t = 0; t < P; t++) {
        const n = LIGHT.n[t]!

        sr += n * (re[t]![i]! * re[t]![j]! + im[t]![i]! * im[t]![j]!)
        si += n * (re[t]![i]! * im[t]![j]! - im[t]![i]! * re[t]![j]!)
      }

      G.re[i * L + j] = Math.sqrt(LIGHT.w[i]!) * sr * Math.sqrt(LIGHT.w[j]!)
      G.im[i * L + j] = Math.sqrt(LIGHT.w[i]!) * si * Math.sqrt(LIGHT.w[j]!)
      K.re[i * L + j] = sr * LIGHT.w[j]!
      K.im[i * L + j] = si * LIGHT.w[j]!
    }
  }

  return { G, K }
}

// the beat T = [[1, s], [-f K, 1 - kappa K]], 18 x 18
function beat(K: Vec, s: number, f: number): Vec {
  const n = 2 * L
  const T = { re: new Float64Array(n * n), im: new Float64Array(n * n) }

  for (let i = 0; i < L; i++) {
    T.re[i * n + i] = 1
    T.re[i * n + L + i] = s
    T.re[(L + i) * n + L + i] = 1

    for (let j = 0; j < L; j++) {
      T.re[(L + i) * n + j]! += -f * K.re[i * L + j]!
      T.im[(L + i) * n + j]! += -f * K.im[i * L + j]!
      T.re[(L + i) * n + L + j]! += -s * f * K.re[i * L + j]!
      T.im[(L + i) * n + L + j]! += -s * f * K.im[i * L + j]!
    }
  }

  return T
}

const matVec = (A: Vec, v: Vec, n: number): Vec => {
  const out = { re: new Float64Array(n), im: new Float64Array(n) }

  for (let i = 0; i < n; i++) {
    let sr = 0
    let si = 0

    for (let j = 0; j < n; j++) {
      sr += A.re[i * n + j]! * v.re[j]! - A.im[i * n + j]! * v.im[j]!
      si += A.re[i * n + j]! * v.im[j]! + A.im[i * n + j]! * v.re[j]!
    }

    out.re[i] = sr
    out.im[i] = si
  }

  return out
}

const norm = (v: Vec): number => Math.sqrt(v.re.reduce((s, x, i) => s + x * x + v.im[i]! ** 2, 0))

type Modes = {
  // the positive-frequency eigenvectors of T, one per moving link, mu ascending
  vectors: Vec[]
  mu: number[]
  residual: number
  modulus: number
  imaginary: number
  energyRatio: number
}

function positiveModes(k: readonly number[], kappa: number, rho: number): Modes {
  const s = Math.sqrt(kappa / rho)
  const f = Math.sqrt(kappa * rho)
  const { G, K } = operators(k)
  const eig = hermitianEigenRows(L, G.re, G.im)
  const T = beat(K, s, f)
  const vectors: Vec[] = []
  const mu: number[] = []

  let residual = 0
  let modulus = 0
  let imaginary = Infinity
  let energyRatio = 0

  for (let j = 0; j < L; j++) {
    const m = eig.values[j]!

    if (m <= ZERO) {
      continue
    }

    const c = 1 - (kappa * m) / 2
    const l: C = [c, Math.sqrt(Math.max(0, 1 - c * c))]
    // u = W^(-1/2) v, then (u, (l - 1) u / s)
    const v: Vec = { re: new Float64Array(2 * L), im: new Float64Array(2 * L) }

    for (let i = 0; i < L; i++) {
      const ur = eig.vectorsRe[j * L + i]! / Math.sqrt(LIGHT.w[i]!)
      const ui = eig.vectorsIm[j * L + i]! / Math.sqrt(LIGHT.w[i]!)

      v.re[i] = ur
      v.im[i] = ui
      v.re[L + i] = ((l[0] - 1) * ur - l[1] * ui) / s
      v.im[L + i] = ((l[0] - 1) * ui + l[1] * ur) / s
    }

    const Tv = matVec(T, v, 2 * L)
    const diff: Vec = {
      re: Tv.re.map((x, i) => x - (l[0] * v.re[i]! - l[1] * v.im[i]!)),
      im: Tv.im.map((x, i) => x - (l[0] * v.im[i]! + l[1] * v.re[i]!)),
    }

    residual = Math.max(residual, norm(diff) / norm(v))
    modulus = Math.max(modulus, Math.abs(Math.hypot(l[0], l[1]) - 1))
    imaginary = Math.min(imaginary, l[1])

    if (vectors.length === 0) {
      let ex = 0
      let ee = 0

      for (let i = 0; i < L; i++) {
        ex += v.re[i]! ** 2 + v.im[i]! ** 2
        ee += v.re[L + i]! ** 2 + v.im[L + i]! ** 2
      }

      energyRatio = ee / ex
    }

    vectors.push(v)
    mu.push(m)
  }

  return { vectors, mu, residual, modulus, imaginary, energyRatio }
}

// an orthonormal frame of the span (modified Gram-Schmidt, complex)
function frame(vs: readonly Vec[]): Vec[] {
  const out: Vec[] = []

  for (const v0 of vs) {
    const v = { re: Float64Array.from(v0.re), im: Float64Array.from(v0.im) }

    for (const q of out) {
      let cr = 0
      let ci = 0

      for (let i = 0; i < v.re.length; i++) {
        cr += q.re[i]! * v.re[i]! + q.im[i]! * v.im[i]!
        ci += q.re[i]! * v.im[i]! - q.im[i]! * v.re[i]!
      }

      for (let i = 0; i < v.re.length; i++) {
        v.re[i]! -= cr * q.re[i]! - ci * q.im[i]!
        v.im[i]! -= cr * q.im[i]! + ci * q.re[i]!
      }
    }

    const nv = norm(v)

    out.push({ re: v.re.map(x => x / nv), im: v.im.map(x => x / nv) })
  }

  return out
}

// det of a small complex matrix (Gaussian elimination with partial pivoting)
function det(re: number[][], im: number[][]): C {
  const n = re.length
  const a = re.map(r => [...r])
  const b = im.map(r => [...r])

  let dr = 1
  let di = 0

  for (let c = 0; c < n; c++) {
    let p = c

    for (let r = c + 1; r < n; r++) {
      if (Math.hypot(a[r]![c]!, b[r]![c]!) > Math.hypot(a[p]![c]!, b[p]![c]!)) {
        p = r
      }
    }

    if (p !== c) {
      ;[a[p], a[c]] = [a[c]!, a[p]!]
      ;[b[p], b[c]] = [b[c]!, b[p]!]
      dr = -dr
      di = -di
    }

    const pr = a[c]![c]!
    const pi = b[c]![c]!
    const nr = dr * pr - di * pi

    di = dr * pi + di * pr
    dr = nr

    const m2 = pr * pr + pi * pi

    if (m2 === 0) {
      return [0, 0]
    }

    for (let r = c + 1; r < n; r++) {
      // factor = a[r][c] / pivot
      const fr = (a[r]![c]! * pr + b[r]![c]! * pi) / m2
      const fi = (b[r]![c]! * pr - a[r]![c]! * pi) / m2

      for (let j = c; j < n; j++) {
        const xr = a[c]![j]!
        const xi = b[c]![j]!

        a[r]![j]! -= fr * xr - fi * xi
        b[r]![j]! -= fr * xi + fi * xr
      }
    }
  }

  return [dr, di]
}

// the U(1) link det(A^dag B) / |det| between two orthonormal frames, and |det|
function link(A: readonly Vec[], B: readonly Vec[]): { u: C; size: number } {
  const n = A.length
  const re = A.map(() => new Array<number>(n).fill(0))
  const im = A.map(() => new Array<number>(n).fill(0))

  A.forEach((a, i) =>
    B.forEach((b, j) => {
      let sr = 0
      let si = 0

      for (let t = 0; t < a.re.length; t++) {
        sr += a.re[t]! * b.re[t]! + a.im[t]! * b.im[t]!
        si += a.re[t]! * b.im[t]! - a.im[t]! * b.re[t]!
      }

      re[i]![j] = sr
      im[i]![j] = si
    }),
  )

  const d = det(re, im)
  const size = Math.hypot(d[0], d[1])

  return { u: [d[0] / size, d[1] / size], size }
}

const mulC = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const conjC = (a: C): C => [a[0], -a[1]]

// Fukui-Hatsugai-Suzuki: the Chern number of the bundle framed by `frames[i][j]` on an N x N periodic grid
function chern(frames: Vec[][][], N: number): { sum: number; least: number } {
  let total = 0
  let least = Infinity

  const U = (i: number, j: number, di: number, dj: number): C => {
    const l = link(frames[i]![j]!, frames[(i + di) % N]![(j + dj) % N]!)

    least = Math.min(least, l.size)

    return l.u
  }

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const p = mulC(mulC(U(i, j, 1, 0), U((i + 1) % N, j, 0, 1)), conjC(mulC(U(i, (j + 1) % N, 1, 0), U(i, j, 0, 1))))

      total += Math.atan2(p[1], p[0])
    }
  }

  return { sum: total / TWO_PI, least }
}

const sliceK = (slice: Slice, a: number, b: number, N: number): number[] => {
  const free = [0, 1, 2].filter(i => i !== slice.fixed)
  const k = [0, 0, 0]

  k[slice.fixed] = slice.value
  k[free[0]!] = (TWO_PI * a) / N
  k[free[1]!] = (TWO_PI * b) / N

  return k
}

type SliceReading = {
  slice: string
  kappa: number
  rho: number
  grid: number
  full: number
  photon: number | null
  least: number
  minMu: number
  maxKappaMu: number
  photonGap: number
  residual: number
  modulus: number
  imaginary: number
  moving: boolean
}

function readSlice(slice: Slice, kappa: number, rho: number, N: number): SliceReading {
  const full: Vec[][][] = []
  const pair: Vec[][][] = []

  let minMu = Infinity
  let maxKappaMu = 0
  let photonGap = Infinity
  let residual = 0
  let modulus = 0
  let imaginary = Infinity
  let moving = true

  for (let a = 0; a < N; a++) {
    full.push([])
    pair.push([])

    for (let b = 0; b < N; b++) {
      const m = positiveModes(sliceK(slice, a, b, N), kappa, rho)

      moving &&= m.vectors.length === MOVING
      minMu = Math.min(minMu, m.mu[0] ?? 0)
      maxKappaMu = Math.max(maxKappaMu, kappa * (m.mu[m.mu.length - 1] ?? 0))
      photonGap = Math.min(photonGap, (m.mu[2] ?? 0) - (m.mu[1] ?? 0))
      residual = Math.max(residual, m.residual)
      modulus = Math.max(modulus, m.modulus)
      imaginary = Math.min(imaginary, m.imaginary)
      full[a]!.push(frame(m.vectors))
      pair[a]!.push(frame(m.vectors.slice(0, 2)))
    }
  }

  const c = chern(full, N)
  const p = photonGap >= GAP ? chern(pair, N) : null

  return {
    slice: slice.name,
    kappa,
    rho,
    grid: N,
    full: c.sum,
    photon: p ? p.sum : null,
    least: Math.min(c.least, p ? p.least : Infinity),
    minMu,
    maxKappaMu,
    photonGap,
    residual,
    modulus,
    imaginary,
    moving,
  }
}

// the Qi-Wu-Zhang lower band's Chern number by the same link method
function qwz(m: number, N: number): number {
  const frames: Vec[][][] = []

  for (let a = 0; a < N; a++) {
    frames.push([])

    for (let b = 0; b < N; b++) {
      const k1 = (TWO_PI * a) / N
      const k2 = (TWO_PI * b) / N
      const hx = Math.sin(k1)
      const hy = Math.sin(k2)
      const hz = m + Math.cos(k1) + Math.cos(k2)
      const e = Math.hypot(hx, hy, hz)
      // lower band of [[hz, hx - i hy], [hx + i hy, -hz]]: (hx - i hy, -e - hz), or its alternative near hz = -e
      const v: Vec =
        hz <= 0
          ? { re: Float64Array.from([-e + hz, hx]), im: Float64Array.from([0, hy]) }
          : { re: Float64Array.from([hx, -e - hz]), im: Float64Array.from([-hy, 0]) }

      frames[a]!.push(frame([v]))
    }
  }

  return chern(frames, N).sum
}

export function splitWindingRun(): Verdict {
  const started = Date.now()
  const log = (what: string): void => console.error(`${what} ${Math.round((Date.now() - started) / 1000)}s`)

  // ---------------- D1: the conjugation ----------------
  let conjugation = 0

  for (const kappa of KAPPAS) {
    const s1 = Math.sqrt(kappa / RHO_AVERAGE)
    const f1 = Math.sqrt(kappa * RHO_AVERAGE)
    const s2 = Math.sqrt(kappa / RHO_WORST)
    const f2 = Math.sqrt(kappa * RHO_WORST)
    const a = Math.sqrt(s1 / s2)

    for (let t = 1; t <= 64; t++) {
      const k = [0.7548776662 * t, 0.5698402910 * t, 0.4302597513 * t].map(x => TWO_PI * (x % 1))
      const { K } = operators(k)
      const T1 = beat(K, s1, f1)
      const T2 = beat(K, s2, f2)
      const n = 2 * L

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const scale = (i < L ? a : 1 / a) / (j < L ? a : 1 / a)

          conjugation = Math.max(
            conjugation,
            Math.abs(T1.re[i * n + j]! - scale * T2.re[i * n + j]!),
            Math.abs(T1.im[i * n + j]! - scale * T2.im[i * n + j]!),
          )
        }
      }
    }
  }

  const D1 = conjugation <= 1e-13

  log('D1')

  // ---------------- the slices ----------------
  const readings: SliceReading[] = []

  for (const kappa of KAPPAS) {
    for (const rho of [RHO_AVERAGE, RHO_WORST, 1]) {
      for (const N of GRIDS) {
        for (const slice of SLICES) {
          readings.push(readSlice(slice, kappa, rho, N))
        }
      }

      log(`kappa ${kappa} rho ${rho}`)
    }
  }

  const integral = (x: number): boolean => Math.abs(x - Math.round(x)) <= 1e-9
  const D2 = readings.every(r => r.residual <= 1e-10 && r.modulus <= 1e-12 && r.imaginary > 0)
  const D3 = readings.every(r => r.moving && r.minMu >= GAP && r.maxKappaMu < 4)
  const keyOf = (r: SliceReading): string => `${r.slice}|${r.kappa}|${r.rho}`
  const byGrid = new Map<string, SliceReading[]>()

  for (const r of readings) {
    byGrid.set(keyOf(r), [...(byGrid.get(keyOf(r)) ?? []), r])
  }

  const gridsAgree = [...byGrid.values()].every(
    list =>
      list.every(r => Math.round(r.full) === Math.round(list[0]!.full)) &&
      list.every(r => (r.photon === null ? list[0]!.photon === null : Math.round(r.photon) === Math.round(list[0]!.photon ?? NaN))),
  )
  const D4 =
    readings.every(r => integral(r.full) && (r.photon === null || integral(r.photon)) && r.least >= 0.1) && gridsAgree

  // ---------------- H: the splits compared ----------------
  const at = (slice: string, kappa: number, rho: number, N: number): SliceReading =>
    readings.find(r => r.slice === slice && r.kappa === kappa && r.rho === rho && r.grid === N)!

  let differ = 0
  let oneIntegral = 0
  let compared = 0

  for (const kappa of KAPPAS) {
    for (const N of GRIDS) {
      for (const slice of SLICES) {
        const a = at(slice.name, kappa, RHO_AVERAGE, N)
        const b = at(slice.name, kappa, RHO_WORST, N)

        compared++

        if (Math.round(a.full) !== Math.round(b.full) || (a.photon !== null && b.photon !== null && Math.round(a.photon) !== Math.round(b.photon)) || (a.photon === null) !== (b.photon === null)) {
          differ++
        }

        if (integral(a.full) !== integral(b.full)) {
          oneIntegral++
        }
      }
    }
  }

  const H = differ > 0 || oneIntegral > 0
  const values = [...new Set(readings.flatMap(r => [Math.round(r.full), ...(r.photon === null ? [] : [Math.round(r.photon)])]))]

  // ---------------- controls ----------------
  const q1 = qwz(1, 32)
  const qm1 = qwz(-1, 32)
  const q3 = qwz(3, 32)
  const C1 =
    integral(q1) && Math.abs(Math.round(q1)) === 1 && integral(qm1) && Math.round(qm1) === -Math.round(q1) && integral(q3) && Math.round(q3) === 0

  let C2 = true

  for (const kappa of KAPPAS) {
    for (const N of GRIDS) {
      for (const slice of SLICES) {
        const a = at(slice.name, kappa, RHO_AVERAGE, N)
        const c = at(slice.name, kappa, 1, N)

        C2 &&= Math.round(a.full) === Math.round(c.full) && (a.photon === null) === (c.photon === null) && (a.photon === null || Math.round(a.photon) === Math.round(c.photon!))
      }
    }
  }

  log('controls')

  // ---------------- read: the energy ratio ----------------
  const kRead = [0.9, 0.4, 1.3]
  const ratioAvg = positiveModes(kRead, KAPPAS[0]!, RHO_AVERAGE).energyRatio
  const ratioWorst = positiveModes(kRead, KAPPAS[0]!, RHO_WORST).energyRatio
  const photonSlices = [...new Set(readings.filter(r => r.photon !== null).map(r => r.slice))]

  const gates = D1 && D2 && D3 && D4 && C1 && C2
  const status: Verdict['status'] = !gates ? 'partial' : H ? 'pass' : 'fail'
  const e = (x: number): string => x.toExponential(2)
  const worst = <K extends keyof SliceReading>(key: K, pick: (a: number, b: number) => number, from: number): number =>
    readings.reduce((m, r) => pick(m, r[key] as number), from)

  return verdict({
    status,
    claim: `D1 ${D1} (T(rho avg) = M T(rho worst) M^-1 to ${e(conjugation)} at 64 k, both kappa); D2 ${D2} (eigen residual ${e(worst('residual', Math.max, 0))}, |l| - 1 ${e(worst('modulus', Math.max, 0))}, least Im l ${worst('imaginary', Math.min, Infinity).toFixed(6)}); D3 ${D3} (8 moving links at every point, least mu ${worst('minMu', Math.min, Infinity).toFixed(4)}, largest kappa mu ${worst('maxKappaMu', Math.max, 0).toFixed(3)}); D4 ${D4} (every sum within ${e(Math.max(...readings.flatMap(r => [Math.abs(r.full - Math.round(r.full)), r.photon === null ? 0 : Math.abs(r.photon - Math.round(r.photon))])))} of an integer, grids 24 and 32 agree ${gridsAgree}, least link |det| ${worst('least', Math.min, Infinity).toFixed(4)}); H ${H} (${compared} slice comparisons, ${differ} differ, ${oneIntegral} integral at one split only; every Chern number read: ${values.join(', ')}; photon pair gapped on ${photonSlices.length} of ${SLICES.length} slices); controls C1 ${C1} (QWZ m = 1: ${q1.toFixed(9)}, m = -1: ${qm1.toFixed(9)}, m = 3: ${q3.toFixed(9)}) C2 ${C2} (rho = 1 the same)`,
    metrics: {
      D1: flag(D1),
      D2: flag(D2),
      D3: flag(D3),
      D4: flag(D4),
      H: flag(H),
      C1: flag(C1),
      C2: flag(C2),
      conjugation,
      differ,
      oneIntegral,
      compared,
      distinctChern: values.length,
      chernValue: values[0] ?? NaN,
      photonSlices: photonSlices.length,
      qwzPlus: q1,
      qwzMinus: qm1,
      qwzTrivial: q3,
      energyRatioAverage: ratioAvg,
      energyRatioWorst: ratioWorst,
      energyRatioQuotient: ratioAvg / ratioWorst,
      seconds: (Date.now() - started) / 1000,
    },
    control: { qwzPlus: q1, qwzMinus: qm1, qwzTrivial: q3 },
    notes: `L1. Per slice (kappa 1/16, grid 32; avg / worst): ${SLICES.map(s => {
      const a = at(s.name, KAPPAS[0]!, RHO_AVERAGE, 32)
      const b = at(s.name, KAPPAS[0]!, RHO_WORST, 32)

      return `${s.name}: E+ ${a.full.toFixed(6)} / ${b.full.toFixed(6)}, photon ${a.photon === null ? 'not gapped' : a.photon.toFixed(6)} / ${b.photon === null ? 'not gapped' : b.photon.toFixed(6)} (gap ${a.photonGap.toExponential(2)}), least mu ${a.minMu.toFixed(4)}`
    }).join('; ')}. The lowest mode's e / x energy ratio at k = (${kRead.join(', ')}): ${ratioAvg.toFixed(6)} at the average split, ${ratioWorst.toFixed(6)} at the worst-register split, quotient ${(ratioAvg / ratioWorst).toFixed(6)} against rho1 / rho2 = ${(RHO_AVERAGE / RHO_WORST).toFixed(6)}. ${((Date.now() - started) / 1000).toFixed(0)} s.`,
  })
}
