// Light meets the stand-in (E-FRC-0190 to 0194): the stand-in atom's transition currents, their golden-rule
// emission into the photons of the EXACTLY LINEAR husk leapfrog (E-FRC-0179, read through
// code/measure/husk-emission), the single-excitation dynamics of one emitter with every photon mode of a husk
// torus, and the same emitter coupled minimally to the linear leapfrog in real space with Gauss's law exact.
// The emitter is a STAND-IN: a two-dock dimer (a charge hopping on one husk link, the simplest minimal
// coupling there is) or the stand-in atom of code/measure/stand-in-atom. Neither is the electron.
//
// THE CURRENT. A charge q with band T(p) couples to the husk angle through T(p - q A). To first order the
// coupling is -sum_links j_link a_link, with the Cartesian transition current density
//
//   J_ge(x) = (q / 2) [ psi_g(x)* (v psi_e)(x) + ((v psi_g)(x))* psi_e(x) ],  v = grad T(p)
//
// (the symmetrized velocity). A Cartesian current is carried onto the husk links by the uniform lift
// j_h = w_h (J . u_h) / 6, which is the one that gives sum_h j_h u_h = J (sum_h w_h u_h u_h^T = 6 I); a
// lift is a choice below the photon wavelength and is stated as one. A husk angle is a column sum, w_h times
// the line integral of A, so the charge's Peierls phase is q a / w and the coupling per unit angle is
// F_h = j_h / w_h = (J . u_h) / 6. The dimer needs no lift: its current lives on its one link, F = <g| dH/da |e>
// = i q omega0 / (2 w), which is (link current) / w.
//
// THE GOLDEN RULE. A photon (k, b) of the Hermitian husk symbol (eigenvector u_b(k), leapfrog frequency
// 4 sin^2(omega / 2) = kappa mu) is emitted with amplitude sum_h sqrt(w_h) conj(u_bh) e^(-i k . u_h / 2)
// jtilde_h(k), jtilde the link current's Fourier transform, and the vacuum variance of its angle is
// 1 / (2 sin omega) (code/measure/husk-emission's derivation of h = (omega / sin omega) Q), so
//
//   A = 2 pi int d^3k / (2 pi)^3 sum_b |amplitude|^2 / (2 sin omega_b) delta(omega - omega_b(k))
//
// evaluated on rays exactly as husk-emission's goldenRule does, with an amplitude function in place of a link
// list.
//
// THE CONTINUUM ANSWER, derived before any rate is computed: photons of speed c = sqrt(2 kappa / 3)
// (lambda / k^2 = 2/3, E-FRC-0179) and field energy 1/2 sum e^2 / w, whose long-wave permittivity is
// eps0 = 6, give A = omega^3 |d|^2 / (3 pi eps0 c^3) = omega^3 |d|^2 / (18 pi c^3) on the husk. In the D4
// bulk (4 space dimensions, 3 polarizations, sum over the 12 root directions r r^T = 6 I, so eps0 = 6 again)
// the same derivation gives A = omega^4 |d|^2 / (64 pi c^4): a bulk rate scales as omega^4, a husk rate as
// omega^3. The husk exponent is the physical one.

import { hermitianEigen } from '@/code/measure/photon-modes'
import { curlSymbol, plaquetteShapes } from '@/code/measure/photon-symbol'
import { photonLatticeD4 } from '@/code/rule/photon-links'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { HUSK_KAPPA, H, eigenSmall, leapfrogMu, readHuskStencil, hermitianHuskSymbol, type HuskStencil, type RayGrid, type Symbolizer } from '@/code/measure/husk-emission'
import { fft3 } from '@/code/measure/standin-chemistry'
import { fearBand, type Atom } from '@/code/measure/stand-in-atom'

// a complex 3-vector (or 4-vector) amplitude as parallel re and im arrays
export type VectorAmplitude = { readonly re: number[]; readonly im: number[] }

// ---------------------------------------------------------------------------------------------------------
// the golden rule with a Cartesian current amplitude

// the emission amplitude into photon column `column` of the eigen decomposition at k, from a Cartesian
// current amplitude J(k) lifted uniformly onto the links
export function liftedModeAmplitude(input: { symbol: Symbolizer; k: readonly number[]; current: VectorAmplitude; ure: ArrayLike<number>; uim: ArrayLike<number>; column: number; lift: number }): [number, number] {
  const { symbol, k, current, ure, uim, column, lift } = input
  const n = symbol.size
  let re = 0
  let im = 0

  for (let h = 0; h < n; h++) {
    const v = symbol.vector(h)
    const w = symbol.weight(h)
    let proj = 0
    let projIm = 0
    let half = 0

    for (let i = 0; i < symbol.dimension; i++) {
      proj += (current.re[i] ?? 0) * (v[i] ?? 0)
      projIm += (current.im[i] ?? 0) * (v[i] ?? 0)
      half += ((k[i] ?? 0) * (v[i] ?? 0)) / 2
    }

    // the link current is j_h = w (J . u_h) / lift, and a husk angle holds w times the line integral (the column
    // sum), so the charge's phase is q a / w and the coupling per unit angle is j_h / w = (J . u_h) / lift
    const jr = proj / lift
    const ji = projIm / lift
    // sqrt(w) conj(u) e^(-i k . u / 2) j
    const ur = ure[h * n + column] ?? 0
    const ui = -(uim[h * n + column] ?? 0)
    const cr = Math.cos(half)
    const ci = -Math.sin(half)
    const pr = ur * cr - ui * ci
    const pi = ur * ci + ui * cr
    const sw = Math.sqrt(w)

    re += sw * (pr * jr - pi * ji)
    im += sw * (pr * ji + pi * jr)
  }

  return [re, im]
}

export type CurrentRule = {
  // A for each current, in the continuous-time golden rule, per beat
  readonly rates: number[]
  readonly crossings: number
  readonly multiple: number
}

// the golden rule on rays for currents given as amplitude functions k -> J(k); the same scan, bisection and
// measure as husk-emission's goldenRule
export function goldenRuleCurrents(input: {
  symbol: Symbolizer
  currents: readonly ((k: readonly number[]) => VectorAmplitude)[]
  omega: number
  grid: RayGrid
  lift: number
  kappa?: number
  scan?: number
  cap?: { c0: number; factor: number }
}): CurrentRule {
  const { symbol, currents, omega, grid, lift } = input
  const kappa = input.kappa ?? HUSK_KAPPA
  const scan = input.scan ?? 48
  const target = leapfrogMu(kappa, omega)
  const d = symbol.dimension
  const rates = currents.map(() => 0)
  let crossings = 0
  let multiple = 0
  const muAt = (r: readonly number[], s: number, b: number): number => eigenSmall(symbol.matrix(r.map(x => x * s)), false).values[b] ?? 0

  grid.directions.forEach((r, ray) => {
    const top = input.cap ? Math.min(symbol.exit(r), (input.cap.factor * omega) / input.cap.c0) : symbol.exit(r)
    const step = top / scan
    const table = Array.from({ length: scan + 1 }, (_, i) => (i === 0 ? null : eigenSmall(symbol.matrix(r.map(x => x * i * step)), false).values))

    for (let b = symbol.first; b < symbol.first + symbol.photons; b++) {
      let previous = -target
      let found = 0

      for (let i = 1; i <= scan; i++) {
        const value = (table[i]?.[b] ?? 0) - target

        if (previous < 0 !== value < 0) {
          found += 1

          const rising = previous < 0
          let lo = (i - 1) * step
          let hi = i * step

          for (let it = 0; it < 60 && hi - lo > 1e-15 * hi; it++) {
            const mid = (lo + hi) / 2

            if ((muAt(r, mid, b) < target) === rising) {
              lo = mid
            } else {
              hi = mid
            }
          }

          const s = (lo + hi) / 2
          const h = 1e-6 * s
          const slope = (muAt(r, s + h, b) - muAt(r, s - h, b)) / (2 * h)
          const domega = (kappa / (2 * Math.sin(omega))) * slope
          const k = r.map(x => x * s)
          const e = hermitianEigen(symbol.matrix(k))
          // hermitianEigen's columns in ascending order of value
          const order = Array.from(e.values, (_, j) => j).sort((p, q) => e.values[p]! - e.values[q]!)
          const column = order[b]!
          const measure = ((grid.weights[ray] ?? 0) * s ** (d - 1)) / Math.abs(domega)

          currents.forEach((current, c) => {
            const [gr, gi] = liftedModeAmplitude({ symbol, k, current: current(k), ure: e.vectorsRe, uim: e.vectorsIm, column, lift })

            rates[c] = rates[c]! + (measure * (gr * gr + gi * gi)) / (2 * Math.sin(omega))
          })
          crossings += 1
        }

        previous = value
      }

      if (found > 1) {
        multiple += 1
      }
    }
  })

  const norm = (2 * Math.PI) / (2 * Math.PI) ** d

  return { rates: rates.map(v => v * norm), crossings, multiple }
}

// ---------------------------------------------------------------------------------------------------------
// the bulk symbol, for the bulk rate beside the husk one

export function bulkSymbolizer(): Symbolizer {
  const bulk = photonLatticeD4({ side: 6 })
  const shapes = plaquetteShapes(bulk)
  const vectors = bulk.firsts.map(d => bulk.vectors[d] ?? [0, 0, 0, 0])

  return {
    dimension: 4,
    size: bulk.firsts.length,
    matrix: k => curlSymbol(bulk, shapes, k),
    weight: () => 1,
    vector: h => vectors[h] ?? [0, 0, 0, 0],
    // the scan is always capped for the bulk (small omega): the exit is only a bound
    exit: () => Math.PI,
    first: 1,
    photons: 3,
  }
}

// ---------------------------------------------------------------------------------------------------------
// the stand-in atom's transition current

// grad T on the FFT grid of the atom's torus, one Float64Array per axis
export function bandGradient(atom: Atom): Float64Array[] {
  const side = atom.side
  const step = (2 * Math.PI) / side
  const out = [0, 1, 2].map(() => new Float64Array(side ** 3))
  const slope = (q: number): number => Math.sin(q) / Math.sqrt(4 - Math.cos(q) ** 2)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const k = [x * step, y * step, z * step]
        const i = x + side * (y + side * z)

        if (atom.kind.lattice === 'husk') {
          for (let h = 0; h < HUSK_VECTORS.length; h++) {
            const u = HUSK_VECTORS[h]!
            const s = ((HUSK_WEIGHTS[h] ?? 0) / 6) * slope(u[0]! * k[0]! + u[1]! * k[1]! + u[2]! * k[2]!)

            for (let a = 0; a < 3; a++) {
              out[a]![i] = out[a]![i]! + s * u[a]!
            }
          }
        } else {
          for (let a = 0; a < 3; a++) {
            out[a]![i] = slope(k[a]!)
          }
        }
      }
    }
  }

  return out
}

// f with v psi = i f for a real psi (v psi is purely imaginary: grad T is odd and real), one axis
export function velocityImage(atom: Atom, gradient: Float64Array, psi: Float64Array): Float64Array {
  const { re, im, side } = atom

  re.set(psi)
  im.fill(0)
  fft3(re, im, side, false)

  for (let i = 0; i < re.length; i++) {
    re[i] = re[i]! * gradient[i]!
    im[i] = im[i]! * gradient[i]!
  }

  fft3(re, im, side, true)

  // (v psi) = re + i im with re ~ 0; return im
  return Float64Array.from(im)
}

// the transition current density J_ge(x) = i (q / 2) (psi_g f_e - f_g psi_e) for real states, as three real
// arrays C_a with J_a = i C_a
export function transitionCurrent(atom: Atom, gradient: Float64Array[], g: Float64Array, e: Float64Array, charge = 1): Float64Array[] {
  return gradient.map(grad => {
    const fe = velocityImage(atom, grad, e)
    const fg = velocityImage(atom, grad, g)

    return Float64Array.from(g, (x, i) => (charge / 2) * (x * fe[i]! - fg[i]! * e[i]!))
  })
}

// the current's Fourier amplitude J(k) = sum_x J(x) e^(-i k . (x - center)), exact, as a separable sum: the
// phase factors along each axis are tabled once per k and the x sum is taken first
export function currentAmplitude(side: number, current: Float64Array[]): (k: readonly number[]) => VectorAmplitude {
  const h = side / 2
  const tr = [0, 1, 2].map(() => new Float64Array(side))
  const ti = [0, 1, 2].map(() => new Float64Array(side))
  const pr = new Float64Array(side * side)
  const pi = new Float64Array(side * side)

  return k => {
    for (let a = 0; a < 3; a++) {
      for (let x = 0; x < side; x++) {
        tr[a]![x] = Math.cos(-(k[a] ?? 0) * (x - h))
        ti[a]![x] = Math.sin(-(k[a] ?? 0) * (x - h))
      }
    }

    const re = [0, 0, 0]
    const im = [0, 0, 0]

    current.forEach((c, a) => {
      // P(y, z) = sum_x C e^(-i kx x)
      for (let yz = 0; yz < side * side; yz++) {
        let sr = 0
        let si = 0
        const base = yz * side

        for (let x = 0; x < side; x++) {
          const v = c[base + x]!

          sr += v * tr[0]![x]!
          si += v * ti[0]![x]!
        }

        pr[yz] = sr
        pi[yz] = si
      }

      let totalR = 0
      let totalI = 0

      for (let z = 0; z < side; z++) {
        let sr = 0
        let si = 0

        for (let y = 0; y < side; y++) {
          const r = pr[y + side * z]!
          const m = pi[y + side * z]!

          sr += r * tr[1]![y]! - m * ti[1]![y]!
          si += r * ti[1]![y]! + m * tr[1]![y]!
        }

        totalR += sr * tr[2]![z]! - si * ti[2]![z]!
        totalI += sr * ti[2]![z]! + si * tr[2]![z]!
      }

      // J = i C, so J(k) = i (totalR + i totalI) = -totalI + i totalR
      re[a] = -totalI
      im[a] = totalR
    })

    return { re, im }
  }
}

// ---------------------------------------------------------------------------------------------------------
// the photon modes of a husk torus, for the single-excitation dynamics

export type PhotonModes = {
  // per mode: frequency and the coupling to the emitter (complex), for the 2 photon branches of every k != 0
  readonly omega: Float64Array
  readonly gRe: Float64Array
  readonly gIm: Float64Array
  readonly side: number
}

// every photon mode (k, b) of the side^3 husk torus with its coupling to a link-current emitter:
// g = amplitude / sqrt(2 V sin omega), amplitude from `amplitude(k, ure, uim, column)`
export function huskPhotonModes(input: { stencil: HuskStencil; side: number; kappa?: number; amplitude: (k: readonly number[], ure: ArrayLike<number>, uim: ArrayLike<number>, column: number) => [number, number] }): PhotonModes {
  const { stencil, side } = input
  const kappa = input.kappa ?? HUSK_KAPPA
  const volume = side ** 3
  const omega: number[] = []
  const gRe: number[] = []
  const gIm: number[] = []
  const step = (2 * Math.PI) / side
  const signed = (m: number): number => (m >= side / 2 ? m - side : m)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        if (x + y + z === 0) {
          continue
        }

        const k = [signed(x) * step, signed(y) * step, signed(z) * step]
        const e = hermitianEigen(hermitianHuskSymbol(stencil, k))
        const order = Array.from(e.values, (_, j) => j).sort((p, q) => e.values[p]! - e.values[q]!)

        for (let b = 1; b <= 2; b++) {
          const column = order[b]!
          const mu = e.values[column] ?? 0
          const w = 2 * Math.asin(Math.min(1, Math.sqrt(kappa * Math.max(0, mu)) / 2))
          const [ar, ai] = input.amplitude(k, e.vectorsRe, e.vectorsIm, column)
          const f = 1 / Math.sqrt(2 * volume * Math.sin(w))

          omega.push(w)
          gRe.push(ar * f)
          gIm.push(ai * f)
        }
      }
    }
  }

  return { omega: Float64Array.from(omega), gRe: Float64Array.from(gRe), gIm: Float64Array.from(gIm), side }
}

// the dimer's amplitude on one link (x = 0, direction h): F sqrt(w) conj(u_h) e^(-i k . u_h / 2), F = i f
export function dimerAmplitude(h: number, f: number): (k: readonly number[], ure: ArrayLike<number>, uim: ArrayLike<number>, column: number) => [number, number] {
  const u = HUSK_VECTORS[h]!
  const w = HUSK_WEIGHTS[h]!

  return (k, ure, uim, column) => {
    const half = (k[0]! * u[0]! + k[1]! * u[1]! + k[2]! * u[2]!) / 2
    const ur = ure[h * H + column] ?? 0
    const ui = -(uim[h * H + column] ?? 0)
    const cr = Math.cos(half)
    const ci = -Math.sin(half)
    const pr = ur * cr - ui * ci
    const pi = ur * ci + ui * cr
    const sw = Math.sqrt(w)

    // i f (pr + i pi) sqrt(w)
    return [-f * pi * sw, f * pr * sw]
  }
}

export type Emission = {
  // |c_e|^2 at each recorded time
  readonly excited: Float64Array
  // the recorded times (beats)
  readonly times: Float64Array
  // the final photon amplitudes
  readonly bRe: Float64Array
  readonly bIm: Float64Array
  // the norm drift over the run
  readonly normDrift: number
}

// The single-excitation dynamics (rotating wave): i c' = omega0 c + sum g b, i b_j' = omega_j b_j + g_j* c,
// in the frame rotating at omega0, by classical RK4 at step dt (beats), from c = 1 or from a given state.
// `occupation` multiplies each mode's coupling by sqrt(n_j + 1) (emission into a mode holding n_j photons in the
// one-flip sector) when given
export function emit(input: { modes: PhotonModes; omega0: number; beats: number; dt: number; every: number; occupation?: Float64Array; start?: { c: [number, number]; bRe: Float64Array; bIm: Float64Array } }): Emission {
  const { modes, omega0, beats, dt, every } = input
  const n = modes.omega.length
  const detune = Float64Array.from(modes.omega, w => w - omega0)
  const gr = Float64Array.from(modes.gRe, (g, j) => g * Math.sqrt((input.occupation?.[j] ?? 0) + 1))
  const gi = Float64Array.from(modes.gIm, (g, j) => g * Math.sqrt((input.occupation?.[j] ?? 0) + 1))
  let cr = input.start?.c[0] ?? 1
  let ci = input.start?.c[1] ?? 0
  const br = input.start ? Float64Array.from(input.start.bRe) : new Float64Array(n)
  const bi = input.start ? Float64Array.from(input.start.bIm) : new Float64Array(n)
  const kbr = [0, 1, 2, 3].map(() => new Float64Array(n))
  const kbi = [0, 1, 2, 3].map(() => new Float64Array(n))
  const kcr = [0, 0, 0, 0]
  const kci = [0, 0, 0, 0]
  const tbr = new Float64Array(n)
  const tbi = new Float64Array(n)
  const steps = Math.round(beats / dt)
  const excited: number[] = []
  const times: number[] = []
  const norm0 = cr * cr + ci * ci + br.reduce((s, x, j) => s + x * x + bi[j]! * bi[j]!, 0)

  // derivatives at (c, b): c' = -i sum g b, b' = -i detune b - i g* c
  const derive = (ccr: number, cci: number, bbr: Float64Array, bbi: Float64Array, stage: number): void => {
    let sr = 0
    let si = 0
    const outr = kbr[stage]!
    const outi = kbi[stage]!

    for (let j = 0; j < n; j++) {
      const xr = bbr[j]!
      const xi = bbi[j]!

      // g b
      sr += gr[j]! * xr - gi[j]! * xi
      si += gr[j]! * xi + gi[j]! * xr
      // -i (detune b + conj(g) c)
      const yr = detune[j]! * xr + (gr[j]! * ccr + gi[j]! * cci)
      const yi = detune[j]! * xi + (gr[j]! * cci - gi[j]! * ccr)

      outr[j] = yi
      outi[j] = -yr
    }

    // -i (s)
    kcr[stage] = si
    kci[stage] = -sr
  }

  for (let step = 0; step <= steps; step++) {
    if (step % Math.max(1, Math.round(every / dt)) === 0) {
      excited.push(cr * cr + ci * ci)
      times.push(step * dt)
    }

    if (step === steps) {
      break
    }

    derive(cr, ci, br, bi, 0)

    for (const [stage, factor] of [
      [1, dt / 2],
      [2, dt / 2],
      [3, dt],
    ] as const) {
      const pbr = kbr[stage - 1]!
      const pbi = kbi[stage - 1]!

      for (let j = 0; j < n; j++) {
        tbr[j] = br[j]! + factor * pbr[j]!
        tbi[j] = bi[j]! + factor * pbi[j]!
      }

      derive(cr + factor * kcr[stage - 1]!, ci + factor * kci[stage - 1]!, tbr, tbi, stage)
    }

    for (let j = 0; j < n; j++) {
      br[j] = br[j]! + (dt / 6) * (kbr[0]![j]! + 2 * kbr[1]![j]! + 2 * kbr[2]![j]! + kbr[3]![j]!)
      bi[j] = bi[j]! + (dt / 6) * (kbi[0]![j]! + 2 * kbi[1]![j]! + 2 * kbi[2]![j]! + kbi[3]![j]!)
    }

    cr += (dt / 6) * (kcr[0]! + 2 * kcr[1]! + 2 * kcr[2]! + kcr[3]!)
    ci += (dt / 6) * (kci[0]! + 2 * kci[1]! + 2 * kci[2]! + kci[3]!)
  }

  const norm1 = cr * cr + ci * ci + br.reduce((s, x, j) => s + x * x + bi[j]! * bi[j]!, 0)

  return { excited: Float64Array.from(excited), times: Float64Array.from(times), bRe: br, bIm: bi, normDrift: Math.abs(norm1 - norm0) }
}

// ---------------------------------------------------------------------------------------------------------
// the dimer coupled to the linear husk leapfrog in real space

export type RealSpace = {
  readonly side: number
  readonly stencil: HuskStencil
  // for each stencil entry, the dock it writes from each dock: to (dock) = neighbor of x by shift
  readonly targets: Int32Array[]
  readonly kappa: number
}

export function makeRealSpace(stencil: HuskStencil, side: number, kappa = HUSK_KAPPA): RealSpace {
  const docks = side ** 3
  const targets = stencil.entries.map(entry => {
    const t = new Int32Array(docks)

    for (let z = 0; z < side; z++) {
      for (let y = 0; y < side; y++) {
        for (let x = 0; x < side; x++) {
          const w = (c: number, s: number): number => (((c + s) % side) + side) % side

          t[x + side * (y + side * z)] = w(x, entry.shift[0]) + side * (w(y, entry.shift[1]) + side * w(z, entry.shift[2]))
        }
      }
    }

    return t
  })

  return { side, stencil, targets, kappa }
}

// (M_h a) into out
export function applyHuskCurl(space: RealSpace, a: Float64Array, out: Float64Array): void {
  out.fill(0)

  const docks = space.side ** 3

  space.stencil.entries.forEach((entry, j) => {
    const t = space.targets[j]!
    const to = entry.to
    const from = entry.from
    const value = entry.value

    for (let x = 0; x < docks; x++) {
      out[t[x]! * H + to] = out[t[x]! * H + to]! + value * a[x * H + from]!
    }
  })
}

// the divergence of a husk link field (outflow sum, E-FRC-0168's convention)
export function linkDivergence(side: number, e: Float64Array): Float64Array {
  const docks = side ** 3
  const out = new Float64Array(docks)

  for (let z = 0; z < side; z++) {
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const i = x + side * (y + side * z)

        for (let h = 0; h < H; h++) {
          const u = HUSK_VECTORS[h]!
          const j = ((x + u[0]! + side) % side) + side * (((y + u[1]! + side) % side) + side * ((z + u[2]! + side) % side))
          const v = e[i * H + h]!

          out[i] = out[i]! + v
          out[j] = out[j]! - v
        }
      }
    }
  }

  return out
}

export type DimerState = {
  // the link field: angle and flux, H per dock
  readonly a: Float64Array
  readonly e: Float64Array
  // the dimer's two amplitudes (site 0 at the link's tail, site 1 at its head)
  c0r: number
  c0i: number
  c1r: number
  c1i: number
}

export type Dimer = {
  readonly space: RealSpace
  // the link: its tail dock and direction
  readonly dock: number
  readonly h: number
  readonly omega0: number
  readonly charge: number
  readonly scratch: Float64Array
}

// one beat of the coupled system, exactly reversible as a map:
//   a <- a + e;  psi <- exp(-i H(theta)) psi, theta = q a_link / w;  e <- e - kappa M a - q (P1' - P1) on the link
// where P1' - P1 is the chance the dimer's step carried from site 0 to site 1: the flux takes exactly the
// charge that moved, so the husk divergence of e minus the charge is the same after the beat as before it
export function dimerBeat(d: Dimer, s: DimerState): void {
  const { space, dock, h, omega0, charge } = d
  const a = s.a
  const e = s.e
  const n = a.length

  for (let i = 0; i < n; i++) {
    a[i] = a[i]! + e[i]!
  }

  const w = HUSK_WEIGHTS[h]!
  const theta = (charge * a[dock * H + h]!) / w
  // H = -(omega0 / 2) (e^(-i theta) |1><0| + e^(i theta) |0><1|); exp(-i H) = cos(omega0/2) + i sin(omega0/2) X_theta
  const cs = Math.cos(omega0 / 2)
  const sn = Math.sin(omega0 / 2)
  const tr = Math.cos(theta)
  const ti = -Math.sin(theta)
  const before = s.c1r * s.c1r + s.c1i * s.c1i
  // c1' = cs c1 + i sn e^(-i theta) c0 ; c0' = cs c0 + i sn e^(i theta) c1
  const x0r = tr * s.c0r - ti * s.c0i
  const x0i = tr * s.c0i + ti * s.c0r
  const x1r = tr * s.c1r + ti * s.c1i
  const x1i = tr * s.c1i - ti * s.c1r
  const n1r = cs * s.c1r - sn * x0i
  const n1i = cs * s.c1i + sn * x0r
  const n0r = cs * s.c0r - sn * x1i
  const n0i = cs * s.c0i + sn * x1r

  s.c0r = n0r
  s.c0i = n0i
  s.c1r = n1r
  s.c1i = n1i

  const moved = n1r * n1r + n1i * n1i - before

  applyHuskCurl(space, a, d.scratch)

  for (let i = 0; i < n; i++) {
    e[i] = e[i]! - space.kappa * d.scratch[i]!
  }

  e[dock * H + h] = e[dock * H + h]! - charge * moved
}

// the exact inverse of dimerBeat
export function dimerBeatBack(d: Dimer, s: DimerState): void {
  const { space, dock, h, omega0, charge } = d
  const a = s.a
  const e = s.e
  const n = a.length
  const w = HUSK_WEIGHTS[h]!
  const theta = (charge * a[dock * H + h]!) / w
  const cs = Math.cos(omega0 / 2)
  const sn = Math.sin(omega0 / 2)
  const tr = Math.cos(theta)
  const ti = -Math.sin(theta)
  const after = s.c1r * s.c1r + s.c1i * s.c1i
  // the inverse step: cs c - i sn X c
  const x0r = tr * s.c0r - ti * s.c0i
  const x0i = tr * s.c0i + ti * s.c0r
  const x1r = tr * s.c1r + ti * s.c1i
  const x1i = tr * s.c1i - ti * s.c1r
  const n1r = cs * s.c1r + sn * x0i
  const n1i = cs * s.c1i - sn * x0r
  const n0r = cs * s.c0r + sn * x1i
  const n0i = cs * s.c0i - sn * x1r
  const moved = after - (n1r * n1r + n1i * n1i)

  applyHuskCurl(space, a, d.scratch)

  for (let i = 0; i < n; i++) {
    e[i] = e[i]! + space.kappa * d.scratch[i]!
  }

  e[dock * H + h] = e[dock * H + h]! + charge * moved
  s.c0r = n0r
  s.c0i = n0i
  s.c1r = n1r
  s.c1i = n1i

  for (let i = 0; i < n; i++) {
    a[i] = a[i]! - e[i]!
  }
}

export { readHuskStencil, fearBand }
