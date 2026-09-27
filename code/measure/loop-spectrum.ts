// Measurement tools for the loop-register light (E-FRC-0234 to 0237): the column fills of a state (how far its
// link columns and its square columns are filled, the quantity whose ratio the virial theorem fixes), exact
// spectra of the massless ring by symmetry sector (translations and the uniform shift), its one-quantum band,
// and a spectral filter for boxes too large to diagonalize. Everything here is measurement (floats); the rule is
// code/rule/loop-ring (and code/rule/plaquette-ladder for the ladder).

import { bal } from '@/code/rule/lattice-qed'
import { fluxesOf, toAngleBasis, type LadderKernel } from '@/code/rule/plaquette-ladder'
import { inner, unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'
import {
  loopBeat,
  loopFluxes,
  loopHalf,
  loopInverseBeat,
  loopKernel,
  loopSplit,
  loopToAngle,
  loopTranslate,
  loopUniformShift,
  ringOmega,
  type LoopKernel,
  type LoopSpec,
} from '@/code/rule/loop-ring'

export type Field = { re: Float64Array; im: Float64Array }

// ---------------------------------------------------------------------------------------------------------
// the column fills: sum over links of <bal(e)^2> (split into edge links, read on one square, and shared links)
// and sum over squares of <bal(B)^2>. In the harmonic reading every stationary state of the light keeps
// s sum <e^2> = f sum <B^2> exactly, mode by mode (the leapfrog's invariant ellipse has covariance
// proportional to its inverse form), so the ratio of the two fills is fixed by the split alone

export type Fills = { links: number; edge: number; shared: number; squares: number; ratio: number }

export function ladderFillTables(kernel: LadderKernel): { edge: Float64Array; shared: Float64Array } {
  const { n, plaquettes: L } = kernel.spec
  const edge = new Float64Array(kernel.size)
  const shared = new Float64Array(kernel.size)

  for (let i = 0; i < kernel.size; i++) {
    const e = fluxesOf(kernel.spec, i)
    let a = 0
    let b = 0

    for (let l = 0; l < 2 * L; l++) a += bal(e[l]!, n) ** 2
    for (let l = 2 * L; l < 3 * L; l++) b += bal(e[l]!, n) ** 2

    edge[i] = a
    shared[i] = b
  }

  return { edge, shared }
}

export function ladderFills(kernel: LadderKernel, tables: { edge: Float64Array; shared: Float64Array }, v: Field): Fills {
  const { n, plaquettes: L, drift, force } = kernel.spec
  const half = n ** L
  let edge = 0
  let shared = 0

  for (let i = 0; i < kernel.size; i++) {
    const w = v.re[i]! ** 2 + v.im[i]! ** 2

    edge += w * tables.edge[i]!
    shared += w * tables.shared[i]!
  }

  const angle = toAngleBasis(kernel, v.re, v.im)
  let squares = 0

  for (let i = 0; i < kernel.size; i++) {
    const w = angle.re[i]! ** 2 + angle.im[i]! ** 2

    if (w === 0) continue

    let rest = i % half

    for (let p = 0; p < L; p++) {
      squares += w * bal(rest % n, n) ** 2
      rest = Math.floor(rest / n)
    }
  }

  // s / f = drift / force
  return { links: edge + shared, edge, shared, squares, ratio: (drift * (edge + shared)) / (force * squares) }
}

export function loopFills(kernel: LoopKernel, v: Field): Fills {
  const spec = kernel.spec
  const { n, squares: P } = spec
  const flux = new Int32Array(spec.links.length)
  let edge = 0
  let shared = 0

  for (let i = 0; i < kernel.size; i++) {
    const w = v.re[i]! ** 2 + v.im[i]! ** 2

    if (w === 0) continue

    loopFluxes(spec, i, flux)
    spec.links.forEach(([, b], l) => {
      if (b < 0) edge += w * flux[l]! ** 2
      else shared += w * flux[l]! ** 2
    })
  }

  const re = Float64Array.from(v.re)
  const im = Float64Array.from(v.im)

  loopToAngle(kernel, re, im, false)

  let squares = 0

  for (let i = 0; i < kernel.size; i++) {
    const w = re[i]! ** 2 + im[i]! ** 2

    if (w === 0) continue

    let rest = i % kernel.half

    for (let p = 0; p < P; p++) {
      squares += w * bal(rest % n, n) ** 2
      rest = Math.floor(rest / n)
    }
  }

  return { links: edge + shared, edge, shared, squares, ratio: (spec.drift * (edge + shared)) / (spec.force * squares) }
}

// ---------------------------------------------------------------------------------------------------------
// symmetry sectors of the ring's light (no atom): the group of translations (momentum q, k = 2 pi q / L) times
// the uniform shifts (charge 0, the physical states of the closed surface). A sector's basis vector is the
// normalized sum over the group of chi(g)* |g r>; a representative whose sum vanishes is not in the sector.

export type RingSector = {
  readonly q: number
  readonly dimension: number
  // per full index: the basis position of its orbit (-1: not in this sector) and its coefficient in that
  // basis vector
  readonly position: Int32Array
  readonly coRe: Float64Array
  readonly coIm: Float64Array
  // the indices of each basis vector (for building it)
  readonly members: Int32Array[]
}

export function ringOrbits(spec: LoopSpec): { rep: Int32Array; orbitOf: Int32Array[] } {
  const size = loopHalf(spec)
  const rep = new Int32Array(size).fill(-1)
  const orbitOf: Int32Array[] = []

  for (let i = 0; i < size; i++) {
    if (rep[i] !== -1) continue

    const members: number[] = []
    let t = i

    for (let a = 0; a < spec.squares; a++) {
      let u = t

      for (let j = 0; j < (spec.closed ? spec.n : 1); j++) {
        if (rep[u] === -1) {
          rep[u] = i
          members.push(u)
        }

        u = loopUniformShift(spec, u)
      }

      t = loopTranslate(spec, t)
    }

    orbitOf[i] = Int32Array.from(members)
  }

  return { rep, orbitOf }
}

export function ringSector(spec: LoopSpec, orbits: { rep: Int32Array; orbitOf: Int32Array[] }, q: number): RingSector {
  const size = loopHalf(spec)
  const L = spec.squares
  const k = (2 * Math.PI * q) / L
  const position = new Int32Array(size).fill(-1)
  const coRe = new Float64Array(size)
  const coIm = new Float64Array(size)
  const members: Int32Array[] = []
  const accRe = new Map<number, number>()
  const accIm = new Map<number, number>()

  for (let r = 0; r < size; r++) {
    if (orbits.rep[r] !== r) continue

    accRe.clear()
    accIm.clear()

    let t = r

    for (let a = 0; a < L; a++) {
      let u = t

      for (let j = 0; j < (spec.closed ? spec.n : 1); j++) {
        accRe.set(u, (accRe.get(u) ?? 0) + Math.cos(-k * a))
        accIm.set(u, (accIm.get(u) ?? 0) + Math.sin(-k * a))
        u = loopUniformShift(spec, u)
      }

      t = loopTranslate(spec, t)
    }

    let norm = 0

    for (const [u, x] of accRe) norm += x * x + accIm.get(u)! ** 2

    if (norm < 1e-9) continue

    const scale = 1 / Math.sqrt(norm)
    const at = members.length
    const list: number[] = []

    for (const [u, x] of accRe) {
      position[u] = at
      coRe[u] = x * scale
      coIm[u] = accIm.get(u)! * scale
      list.push(u)
    }

    members.push(Int32Array.from(list))
  }

  return { q, dimension: members.length, position, coRe, coIm, members }
}

// sector coefficients of a full vector: <b_a|v> = sum conj(co) v over the orbit
export function ringProject(sector: RingSector, v: Field): Vec {
  const out = { re: new Float64Array(sector.dimension), im: new Float64Array(sector.dimension) }

  for (let i = 0; i < sector.position.length; i++) {
    const a = sector.position[i]!

    if (a < 0) continue

    const cr = sector.coRe[i]!
    const ci = sector.coIm[i]!

    out.re[a] = out.re[a]! + cr * v.re[i]! + ci * v.im[i]!
    out.im[a] = out.im[a]! + cr * v.im[i]! - ci * v.re[i]!
  }

  return out
}

export function ringToFull(sector: RingSector, c: Vec): Field {
  const size = sector.position.length
  const out = { re: new Float64Array(size), im: new Float64Array(size) }

  for (let i = 0; i < size; i++) {
    const a = sector.position[i]!

    if (a < 0) continue

    const cr = sector.coRe[i]!
    const ci = sector.coIm[i]!

    out.re[i] = cr * c.re[a]! - ci * c.im[a]!
    out.im[i] = cr * c.im[a]! + ci * c.re[a]!
  }

  return out
}

// the beat's block in a sector, dense row-major
export function ringBlock(kernel: LoopKernel, sector: RingSector): { re: Float64Array; im: Float64Array } {
  const d = sector.dimension
  const re = new Float64Array(d * d)
  const im = new Float64Array(d * d)
  const size = kernel.half
  const vr = new Float64Array(size)
  const vi = new Float64Array(size)

  for (let col = 0; col < d; col++) {
    vr.fill(0)
    vi.fill(0)

    for (const u of sector.members[col]!) {
      vr[u] = sector.coRe[u]!
      vi[u] = sector.coIm[u]!
    }

    loopBeat(kernel, vr, vi)

    const c = ringProject(sector, { re: vr, im: vi })

    for (let row = 0; row < d; row++) {
      re[row * d + col] = c.re[row]!
      im[row * d + col] = c.im[row]!
    }
  }

  return { re, im }
}

// the generator's energy of a full vector (radians per beat): (pi / N)(s sum bal(e)^2 + f sum bal(B)^2)
export function loopEnergy(kernel: LoopKernel, v: Field): number {
  const f = loopFills(kernel, v)
  const { s, f: force } = loopSplit(kernel.spec)

  return (Math.PI / kernel.spec.n) * (s * f.links + force * f.squares)
}

export type RingLevel = { q: number; phase: number; vector: Vec }

// every level of the ring's light: phases by sector
export function ringSpectrum(spec: LoopSpec): { levels: RingLevel[]; sectors: RingSector[]; residual: number; kernel: LoopKernel } {
  const kernel = loopKernel(spec)
  const orbits = ringOrbits(spec)
  const levels: RingLevel[] = []
  const sectors: RingSector[] = []
  let residual = 0

  for (let q = 0; q < spec.squares; q++) {
    const sector = ringSector(spec, orbits, q)
    const block = ringBlock(kernel, sector)
    const eig = unitaryEigen(sector.dimension, block.re, block.im)

    residual = Math.max(residual, eig.residual)
    sectors.push(sector)
    eig.vectors.forEach((v, j) => levels.push({ q, phase: eig.phases[j]!, vector: v }))
  }

  return { levels, sectors, residual, kernel }
}

// the product trial of the ring's light: every register in the harmonic ground state of one register of
// stiffness 2 (a square and its two rungs), summed over the uniform shifts so it lies in the physical sector
export function ringTrial(spec: LoopSpec): Field {
  const { n, squares: L } = spec
  const { s, f } = loopSplit(spec)
  // f B^2 + 2 s m^2 in the harmonic reading: <m^2> = (N / 2 pi)(1/2) sqrt(f / 2 s)
  const width = (n / (2 * Math.PI)) * 0.5 * Math.sqrt(f / (2 * s))
  const g = Array.from({ length: n }, (_, d) => Math.exp(-(bal(d, n) ** 2) / (4 * width)))
  const size = loopHalf(spec)
  const light: LoopSpec = { ...spec, hop: undefined }
  const sum = { re: new Float64Array(size), im: new Float64Array(size) }

  for (let i = 0; i < size; i++) {
    let rest = i
    let p = 1

    for (let a = 0; a < L; a++) {
      p *= g[rest % n]!
      rest = Math.floor(rest / n)
    }

    let u = i

    for (let j = 0; j < n; j++) {
      sum.re[u] = sum.re[u]! + p
      u = loopUniformShift(light, u)
    }
  }

  normalizeField(sum)

  return sum
}

// the one-quantum band: the vacuum is the zero-momentum level of largest overlap with the product trial; in each sector
// q != 0 the one-quantum level is the one of largest overlap with E_k |vac>, E_k = L^-1/2 sum_p e^(-i k p) e_p
// (the rung fluxes, the ring's physical field; a register m_p alone is not invariant under the uniform shift)
export type RingBandPoint = { q: number; k: number; omega: number; classical: number; overlap: number }

export function ringBand(spec: LoopSpec): { band: RingBandPoint[]; levels: RingLevel[]; vacuum: number; vacuumOverlap: number; residual: number; vacuumFull: Field; kernel: LoopKernel } {
  const { levels, sectors, residual, kernel } = ringSpectrum(spec)
  const { kappa } = loopSplit(spec)
  const L = spec.squares
  const trial = ringProject(sectors[0]!, ringTrial(spec))
  let vacuum = -1
  let vacuumOverlap = 0

  levels.forEach((l, i) => {
    if (l.q !== 0) return

    const [r, s] = inner(l.vector, trial)

    if (r * r + s * s > vacuumOverlap) {
      vacuumOverlap = r * r + s * s
      vacuum = i
    }
  })

  const vfull = ringToFull(sectors[0]!, levels[vacuum]!.vector)
  const flux = new Int32Array(spec.links.length)
  const band: RingBandPoint[] = []

  for (let q = 1; q < L; q++) {
    const k = (2 * Math.PI * q) / L
    const tr = new Float64Array(kernel.half)
    const ti = new Float64Array(kernel.half)

    for (let i = 0; i < kernel.half; i++) {
      if (vfull.re[i] === 0 && vfull.im[i] === 0) continue

      loopFluxes(spec, i, flux)

      let sr = 0
      let si = 0

      for (let p = 0; p < L; p++) {
        sr += (flux[p]! * Math.cos(-k * p)) / Math.sqrt(L)
        si += (flux[p]! * Math.sin(-k * p)) / Math.sqrt(L)
      }

      tr[i] = sr * vfull.re[i]! - si * vfull.im[i]!
      ti[i] = sr * vfull.im[i]! + si * vfull.re[i]!
    }

    const t = ringProject(sectors[q]!, { re: tr, im: ti })
    let norm = 0

    for (let a = 0; a < t.re.length; a++) norm += t.re[a]! ** 2 + t.im[a]! ** 2

    let best = -1
    let bestWeight = 0

    levels.forEach((l, i) => {
      if (l.q !== q) return

      const [r, s] = inner(l.vector, t)
      const w = (r * r + s * s) / norm

      if (w > bestWeight) {
        bestWeight = w
        best = i
      }
    })

    const omega = best < 0 ? Number.NaN : (((levels[vacuum]!.phase - levels[best]!.phase) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    band.push({ q, k, omega, classical: ringOmega(kappa, k), overlap: bestWeight })
  }

  return { band, levels, vacuum, vacuumOverlap, residual, vacuumFull: vfull, kernel }
}

// ---------------------------------------------------------------------------------------------------------
// large boxes: a spectral filter on any beat (two-sided Fourier sum of the indicator of [a, b], Gaussian
// smoothed), the phase of <v|U|v> and its residual

export type Beat = { forward(re: Float64Array, im: Float64Array): void; backward(re: Float64Array, im: Float64Array): void }

export const loopBeats = (kernel: LoopKernel): Beat => ({
  forward: (re, im) => loopBeat(kernel, re, im),
  backward: (re, im) => loopInverseBeat(kernel, re, im),
})

export function normalizeField(v: Field): number {
  let s = 0

  for (let i = 0; i < v.re.length; i++) s += v.re[i]! ** 2 + v.im[i]! ** 2

  const norm = Math.sqrt(s)

  for (let i = 0; i < v.re.length; i++) {
    v.re[i] = v.re[i]! / norm
    v.im[i] = v.im[i]! / norm
  }

  return norm
}

export function phaseOf(beat: Beat, v: Field): { phase: number; residual: number } {
  const w = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

  beat.forward(w.re, w.im)

  const [r, i] = inner(v, w)
  const phase = Math.atan2(i, r)
  const c = Math.cos(phase)
  const s = Math.sin(phase)
  let res = 0

  for (let k = 0; k < v.re.length; k++) res += (w.re[k]! - (c * v.re[k]! - s * v.im[k]!)) ** 2 + (w.im[k]! - (c * v.im[k]! + s * v.re[k]!)) ** 2

  return { phase, residual: Math.sqrt(res) }
}

export function filterField(beat: Beat, v: Field, e0: number, a: number, b: number, sigma: number): Field {
  const T = Math.ceil(Math.sqrt(2 * 30) / sigma)
  const coefficient = (j: number): [number, number] => {
    const damp = Math.exp(-(sigma * sigma * j * j) / 2)

    if (j === 0) return [((b - a) / (2 * Math.PI)) * damp, 0]

    const xr = Math.cos(j * a) - Math.cos(j * b)
    const xi = -Math.sin(j * a) + Math.sin(j * b)

    return [(xi / (2 * Math.PI * j)) * damp, (-xr / (2 * Math.PI * j)) * damp]
  }
  const acc = { re: new Float64Array(v.re.length), im: new Float64Array(v.re.length) }
  const add = (w: Field, cr: number, ci: number): void => {
    for (let k = 0; k < w.re.length; k++) {
      acc.re[k] = acc.re[k]! + cr * w.re[k]! - ci * w.im[k]!
      acc.im[k] = acc.im[k]! + cr * w.im[k]! + ci * w.re[k]!
    }
  }

  add(v, ...coefficient(0))

  for (const direction of [1, -1]) {
    const w = { re: Float64Array.from(v.re), im: Float64Array.from(v.im) }

    for (let j = 1; j <= T; j++) {
      if (direction === 1) beat.backward(w.re, w.im)
      else beat.forward(w.re, w.im)

      const [hr, hi] = coefficient(direction * j)
      const t = -direction * j * e0
      const cr = hr * Math.cos(t) - hi * Math.sin(t)
      const ci = hr * Math.sin(t) + hi * Math.cos(t)

      add(w, cr, ci)
    }
  }

  return acc
}

// the ring's light vacuum on a box too large to diagonalize: the product of one register's ground state (a
// square with its two rungs, stiffness 2), summed over the uniform shifts (so it lies in the physical sector),
// filtered twice to relative energies within half the lowest photon energy
export function ringVacuum(spec: LoopSpec, passes = 2): { vacuum: Field; phase: number; residual: number } {
  const light: LoopSpec = { ...spec, hop: undefined }
  const kernel = loopKernel(light)
  const beat = loopBeats(kernel)
  const { kappa } = loopSplit(spec)
  const omegaMin = ringOmega(kappa, (2 * Math.PI) / spec.squares)
  const sigma = omegaMin / 8
  let w: Field = ringTrial(light)
  let phase = phaseOf(beat, w).phase

  for (let pass = 0; pass < passes; pass++) {
    w = filterField(beat, w, -phase, -omegaMin / 2, omegaMin / 2, sigma)
    normalizeField(w)
    phase = phaseOf(beat, w).phase
  }

  return { vacuum: w, phase, residual: phaseOf(beat, w).residual }
}
