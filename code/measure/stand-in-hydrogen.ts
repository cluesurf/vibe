// The stand-in hydrogen: a fear-walk token with an Eisenstein charge on the husk, in the static Coulomb field
// of a fixed source. A STAND-IN: it plays the electron the model has not produced (E-FRC-0171, E-SPN-0044),
// and nothing measured with it is an L3 derivation.
//
// The token. The fear walk (code/rule/fear-walk, E-QTM-0103) is the cube-root swap phase on a line's two slots,
// U = a + b SWAP, 2 a = 1 + omega, 2 b = 1 - omega. On two slots SWAP is the Grover reflection 2 |s><s| - I with
// s = (1, 1) / sqrt 2. On a dock with N slots the only direction-mixing involution that every turn of the dock
// leaves alone (every permutation of the slots commutes with it) is that reflection, with s uniform. So the
// fear walk's coin on a dock is
//
//   C = a + b (2 |s><s| - I) = omega + (1 - omega) |s><s|
//
// and a beat is C at every dock, then the stream copies slot d one dock along its direction r_d, then the
// potential's phase e^(-i q phi) at every dock (the time-link phase, as E-FRC-0176 put the space-link phase on
// every crossing). C^3 = I exactly: the rest eigenvalues are 1 (on s) and omega (on everything orthogonal to it).
// On two slots this is the fear walk bit for bit.
//
// The husk. The bulk runs the knit on D4, 24 slots per dock along the 24 roots. A state constant along the
// depth (k4 = 0, the column sum of code/measure/photon-husk) is run by the same walk with each root's slot
// streaming along its shadow on the cubic husk: 12 roots shadow the 6 axis directions (two each) and 12 the
// 12 face diagonals (one each). With s uniform over the 24 slots (s_d = 1 / sqrt 24) every coin entry is in
// Z[omega] / 24, so the token's weights after t beats are Eisenstein integers over 24^t: 'depth24'. The two
// slots on one axis shadow stream together, so their difference never meets s and decouples, and the sum
// is one husk slot with s-weight sqrt(2 / 24): 'husk18', the 9 husk directions with both orientations and
// s_d = sqrt(w_d / 24), w the husk weights 2 and 1 of E-FRC-0179. The long runs use husk18 in floats, and it
// is checked against depth24.
//
// The free token's mass, derived. Near k = 0 the eigenvalue on s is 1 - i <K^2> / (2 sqrt 3) + O(k^4), with
// K = k . r_d and <.> the mean over the slots: first order in C gives 1 - <K^2>/2, second order through the
// omega space gives -omega / (1 - omega) <K^2> = (1/2 - i / (2 sqrt 3)) <K^2>. So E(k) = <K^2> / (2 sqrt 3),
// and with <K^2> = mu |k|^2 / N (mu the second moment of the directions, sum_d r_d r_d^T = mu I) the mass is
//
//   m* = sqrt 3 N / mu
//
// Two slots on a line: N = 2, mu = 2, m* = sqrt 3 = tan(pi / 3), the fear walk's own mass (E-MTH-0009).
// The husk: N = 24, mu = 12 (the D4 roots' second moment 12 I restricted to k4 = 0), m* = 2 sqrt 3.
// The plain cubic control (6 axis slots): N = 6, mu = 2, m* = 3 sqrt 3.
//
// The Coulomb field. The source's potential is the husk lattice Green's function (huskCoulomb, E-FRC-0179):
// sum over husk links of w (phi_y - phi_z) = delta, so phi -> 1 / (24 pi r) far away. On a torus the Green's
// function carries a neutralizing background; here it is solved on a torus of side at least twice the walk's
// and the background removed exactly (the weighted Laplacian of r^2 is -36 at every dock), leaving the
// infinite husk's G up to a constant fixed from its 1 / (24 pi r) tail. The coupling g gives V = -g G and
// alpha = g / (24 pi) as the far-field strength, so Ry = m* alpha^2 / 2 and a = 1 / (m* alpha).
//
// Nothing moves. A beat is a rule that copies each slot's value one dock along its direction: the "token" is a
// pattern of weights the stream copies, and its center moves while no vibe does.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { HUSK_VECTORS, HUSK_WEIGHTS } from '@/code/measure/photon-husk'
import { hermitianEigen } from '@/code/measure/photon-modes'
import { plus, times, turn, type Eisenstein } from '@/code/rule/fear-walk'

// omega and 1 - omega as complex numbers
export const OMEGA_RE = -0.5
export const OMEGA_IM = Math.sqrt(3) / 2
const REST_RE = 1.5
const REST_IM = -Math.sqrt(3) / 2

// a set of slots per dock: each slot's direction on the lattice and its component of s
export type SlotSet = {
  readonly name: string
  readonly dimension: number
  // the direction of each slot, dimension numbers per slot
  readonly directions: readonly (readonly number[])[]
  readonly s: Float64Array
}

// the 9 husk directions, both orientations, s_d = sqrt(w_d / 24)
export function husk18(): SlotSet {
  const directions: number[][] = []
  const s: number[] = []

  HUSK_VECTORS.forEach((u, i) => {
    for (const sign of [1, -1]) {
      directions.push(u.map(x => sign * x))
      s.push(Math.sqrt((HUSK_WEIGHTS[i] ?? 0) / 24))
    }
  })

  return { name: 'husk18', dimension: 3, directions, s: Float64Array.from(s) }
}

// the 24 D4 roots +-e_i +-e_j, each slot streaming along its shadow on the husk (the bulk at k4 = 0)
export function depth24(): SlotSet {
  const directions: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const a of [1, -1]) {
        for (const b of [1, -1]) {
          const r = [0, 0, 0, 0]

          r[i] = a
          r[j] = b
          directions.push(r.slice(0, 3))
        }
      }
    }
  }

  return { name: 'depth24', dimension: 3, directions, s: new Float64Array(24).fill(1 / Math.sqrt(24)) }
}

// the 24 D4 roots in the bulk itself, four dimensions
export function bulk24(): SlotSet {
  const directions: number[][] = []

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const a of [1, -1]) {
        for (const b of [1, -1]) {
          const r = [0, 0, 0, 0]

          r[i] = a
          r[j] = b
          directions.push(r)
        }
      }
    }
  }

  return { name: 'bulk24', dimension: 4, directions, s: new Float64Array(24).fill(1 / Math.sqrt(24)) }
}

// the plain cubic control: the 6 axis directions, equal weights, no diagonals
export function cubic6(): SlotSet {
  return {
    name: 'cubic6',
    dimension: 3,
    directions: [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ],
    s: new Float64Array(6).fill(1 / Math.sqrt(6)),
  }
}

// the fear walk's own line: two slots, one each way
export function line2(): SlotSet {
  return { name: 'line2', dimension: 1, directions: [[1], [-1]], s: new Float64Array(2).fill(1 / Math.sqrt(2)) }
}

// the derived mass m* = sqrt 3 N / mu, mu from sum_d r_d r_d^T = mu I (checked isotropic)
export function derivedMass(slots: SlotSet): { mass: number; secondMoment: number; anisotropy: number } {
  const n = slots.dimension
  const m = Array.from({ length: n }, () => new Array<number>(n).fill(0))

  for (const r of slots.directions) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        m[i]![j] = (m[i]![j] ?? 0) + (r[i] ?? 0) * (r[j] ?? 0)
      }
    }
  }

  const mu = m.reduce((s, row, i) => s + (row[i] ?? 0), 0) / n
  let anisotropy = 0

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      anisotropy = Math.max(anisotropy, Math.abs((m[i]?.[j] ?? 0) - (i === j ? mu : 0)) / mu)
    }
  }

  return { mass: (Math.sqrt(3) * slots.directions.length) / mu, secondMoment: mu, anisotropy }
}

// The free symbol U(k) = S(k) C as a dense complex matrix, S_dd = e^(-i k . r_d)
export function freeSymbol(slots: SlotSet, k: readonly number[]): { re: Float64Array; im: Float64Array } {
  const n = slots.directions.length
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    const r = slots.directions[i] ?? []
    const phase = -r.reduce((acc, x, a) => acc + x * (k[a] ?? 0), 0)
    const zr = Math.cos(phase)
    const zi = Math.sin(phase)

    for (let j = 0; j < n; j++) {
      const ss = (slots.s[i] ?? 0) * (slots.s[j] ?? 0)
      const cr = (i === j ? OMEGA_RE : 0) + REST_RE * ss
      const ci = (i === j ? OMEGA_IM : 0) + REST_IM * ss

      re[i * n + j] = zr * cr - zi * ci
      im[i * n + j] = zr * ci + zi * cr
    }
  }

  return { re, im }
}

// The eigenphases of a unitary n x n matrix and its eigenvectors: hermitianEigen (code/measure/photon-modes,
// the degenerate-safe solver; E-FRC-0178 found the older eigHermitian loses degenerate eigenvectors) on
// Re(e^(i t) U), then each phase from the Rayleigh quotient of U. The shift t is fixed and generic so that no
// two phases fold onto one cosine
const FOLD_SHIFT = 0.371

export function unitaryPhases(u: { re: Float64Array; im: Float64Array }, n: number): { phases: number[]; vectorsRe: Float64Array; vectorsIm: Float64Array } {
  const h = makeComplexMatrix({ rows: n, cols: n })
  const c = Math.cos(FOLD_SHIFT)
  const s = Math.sin(FOLD_SHIFT)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const ar = c * (u.re[i * n + j] ?? 0) - s * (u.im[i * n + j] ?? 0)
      const ai = c * (u.im[i * n + j] ?? 0) + s * (u.re[i * n + j] ?? 0)
      const br = c * (u.re[j * n + i] ?? 0) - s * (u.im[j * n + i] ?? 0)
      const bi = c * (u.im[j * n + i] ?? 0) + s * (u.re[j * n + i] ?? 0)

      h.re[i * n + j] = (ar + br) / 2
      h.im[i * n + j] = (ai - bi) / 2
    }
  }

  const e = hermitianEigen(h)
  const phases: number[] = []

  for (let col = 0; col < n; col++) {
    let lr = 0
    let li = 0

    for (let i = 0; i < n; i++) {
      let wr = 0
      let wi = 0

      for (let j = 0; j < n; j++) {
        const vr = e.vectorsRe[j * n + col] ?? 0
        const vi = e.vectorsIm[j * n + col] ?? 0

        wr += (u.re[i * n + j] ?? 0) * vr - (u.im[i * n + j] ?? 0) * vi
        wi += (u.re[i * n + j] ?? 0) * vi + (u.im[i * n + j] ?? 0) * vr
      }

      const vr = e.vectorsRe[i * n + col] ?? 0
      const vi = e.vectorsIm[i * n + col] ?? 0

      lr += vr * wr + vi * wi
      li += vr * wi - vi * wr
    }

    phases.push(Math.atan2(li, lr))
  }

  return { phases, vectorsRe: e.vectorsRe, vectorsIm: e.vectorsIm }
}

// E(k) of the particle band, the band through eigenvalue 1 at k = 0, E = -phase (U = e^(-i E))
export function particleEnergy(slots: SlotSet, k: readonly number[]): number {
  const n = slots.directions.length
  const { phases } = unitaryPhases(freeSymbol(slots, k), n)
  const near = phases.reduce((best, p) => (Math.abs(p) < Math.abs(best) ? p : best), Math.PI)

  return -near
}


// ---------------------------------------------------------------------------------------------------------
// The walk on a torus of side L (a cube of L^dimension docks), in floats. A state is one flat array, dock
// major: the value of slot d at dock i is (re, im) at 2 (i n + d)

export type Torus = {
  readonly slots: SlotSet
  readonly side: number
  readonly docks: number
  readonly n: number
  // the dock one step along slot d's direction from dock i, at i n + d
  readonly next: Int32Array
}

export function makeTorus(slots: SlotSet, side: number): Torus {
  const dim = slots.dimension
  const docks = side ** dim
  const n = slots.directions.length
  const next = new Int32Array(docks * n)

  for (let i = 0; i < docks; i++) {
    for (let d = 0; d < n; d++) {
      const r = slots.directions[d] ?? []
      let rest = i
      let target = 0
      let stride = 1

      for (let a = 0; a < dim; a++) {
        const c = rest % side

        rest = Math.floor(rest / side)
        target += ((((c + (r[a] ?? 0)) % side) + side) % side) * stride
        stride *= side
      }

      next[i * n + d] = target
    }
  }

  return { slots, side, docks, n, next }
}

// the coordinates of a dock relative to the center dock (side / 2 in every axis), in [-side/2, side/2)
export function offset(torus: Torus, dock: number): number[] {
  const out: number[] = []
  let rest = dock

  for (let a = 0; a < torus.slots.dimension; a++) {
    out.push((rest % torus.side) - Math.floor(torus.side / 2))
    rest = Math.floor(rest / torus.side)
  }

  return out
}

export function centerDock(torus: Torus): number {
  const h = Math.floor(torus.side / 2)
  let dock = 0
  let stride = 1

  for (let a = 0; a < torus.slots.dimension; a++) {
    dock += h * stride
    stride *= torus.side
  }

  return dock
}

export type Walk = Float64Array

export function emptyWalkOn(torus: Torus): Walk {
  return new Float64Array(2 * torus.docks * torus.n)
}

// the per-dock phase e^(-i V) of a potential V, V in radians per beat
export type Phase = { readonly cos: Float64Array; readonly sin: Float64Array }

export function phaseOf(potential: ArrayLike<number>): Phase {
  return {
    cos: Float64Array.from({ length: potential.length }, (_, i) => Math.cos(potential[i] ?? 0)),
    sin: Float64Array.from({ length: potential.length }, (_, i) => -Math.sin(potential[i] ?? 0)),
  }
}

export function zeroPhase(docks: number): Phase {
  return { cos: new Float64Array(docks).fill(1), sin: new Float64Array(docks) }
}

// One beat, from `w` into `out`: the coin at every dock, the stream copies slot d one dock along its direction,
// then the potential's phase at the dock it was copied to
export function beat(torus: Torus, w: Walk, out: Walk, phase: Phase): void {
  const n = torus.n
  const s = torus.slots.s
  const next = torus.next
  const cos = phase.cos
  const sin = phase.sin
  const docks = torus.docks

  for (let i = 0; i < docks; i++) {
    const base = 2 * i * n
    let fr = 0
    let fi = 0

    for (let d = 0; d < n; d++) {
      fr += s[d]! * w[base + 2 * d]!
      fi += s[d]! * w[base + 2 * d + 1]!
    }

    const gr = REST_RE * fr - REST_IM * fi
    const gi = REST_RE * fi + REST_IM * fr

    for (let d = 0; d < n; d++) {
      const xr = w[base + 2 * d]!
      const xi = w[base + 2 * d + 1]!
      const nr = OMEGA_RE * xr - OMEGA_IM * xi + s[d]! * gr
      const ni = OMEGA_RE * xi + OMEGA_IM * xr + s[d]! * gi
      const j = next[i * n + d]!
      const c = cos[j]!
      const sn = sin[j]!
      const at = 2 * (j * n + d)

      out[at] = nr * c - ni * sn
      out[at + 1] = nr * sn + ni * c
    }
  }
}

// <a | b>
export function inner(a: Walk, b: Walk): [number, number] {
  let re = 0
  let im = 0

  for (let i = 0; i < a.length; i += 2) {
    re += a[i]! * b[i]! + a[i + 1]! * b[i + 1]!
    im += a[i]! * b[i + 1]! - a[i + 1]! * b[i]!
  }

  return [re, im]
}

// the chance on each dock, summed over slots
export function density(torus: Torus, w: Walk): Float64Array {
  const out = new Float64Array(torus.docks)
  const n = torus.n

  for (let i = 0; i < torus.docks; i++) {
    let p = 0

    for (let k = 2 * i * n; k < 2 * (i + 1) * n; k++) {
      p += w[k]! * w[k]!
    }

    out[i] = p
  }

  return out
}

export function scaleWalk(w: Walk, factor: number): void {
  for (let i = 0; i < w.length; i++) {
    w[i] = w[i]! * factor
  }
}

// a state f(x) s: the scalar field on every dock times the slot vector s, normalized
export function scalarState(torus: Torus, field: (x: readonly number[]) => [number, number]): Walk {
  const w = emptyWalkOn(torus)
  const n = torus.n
  let norm = 0

  for (let i = 0; i < torus.docks; i++) {
    const [fr, fi] = field(offset(torus, i))

    for (let d = 0; d < n; d++) {
      w[2 * (i * n + d)] = torus.slots.s[d]! * fr
      w[2 * (i * n + d) + 1] = torus.slots.s[d]! * fi
    }

    norm += fr * fr + fi * fi
  }

  scaleWalk(w, 1 / Math.sqrt(norm))

  return w
}

// a state f(x) e_d on one slot d: a token that starts in one direction
export function slotState(torus: Torus, slot: number, field: (x: readonly number[]) => [number, number]): Walk {
  const w = emptyWalkOn(torus)
  const n = torus.n
  let norm = 0

  for (let i = 0; i < torus.docks; i++) {
    const [fr, fi] = field(offset(torus, i))

    w[2 * (i * n + slot)] = fr
    w[2 * (i * n + slot) + 1] = fi
    norm += fr * fr + fi * fi
  }

  scaleWalk(w, 1 / Math.sqrt(norm))

  return w
}

// the chance-weighted mean position, relative to the center, with no wrap correction (a packet kept away
// from the torus seam)
export function meanPosition(torus: Torus, w: Walk): number[] {
  const rho = density(torus, w)
  const out = new Array<number>(torus.slots.dimension).fill(0)
  let total = 0

  for (let i = 0; i < torus.docks; i++) {
    const x = offset(torus, i)
    const p = rho[i]!

    total += p
    x.forEach((v, a) => {
      out[a] = (out[a] ?? 0) + p * v
    })
  }

  return out.map(v => v / total)
}

// ---------------------------------------------------------------------------------------------------------
// The exact Eisenstein walk (any slot set with s uniform, depth24 or line2): n psi' = n omega psi + (1 - omega)
// sum psi, so the weights stay Eisenstein integers, over n^t; a potential in thirds of a turn is omega^(-k)

export type ExactWalk = Eisenstein[]

export function exactBeat(torus: Torus, w: ExactWalk, thirds?: Int32Array): ExactWalk {
  const n = torus.n
  const out: ExactWalk = new Array<Eisenstein>(torus.docks * n).fill([0n, 0n])
  const oneMinusOmega: Eisenstein = [1n, -1n]
  const omegaTimesN: Eisenstein = [0n, BigInt(n)]

  for (let i = 0; i < torus.docks; i++) {
    let sum: Eisenstein = [0n, 0n]

    for (let d = 0; d < n; d++) {
      sum = plus(sum, w[i * n + d] ?? [0n, 0n])
    }

    const shared = times(oneMinusOmega, sum)

    for (let d = 0; d < n; d++) {
      const j = torus.next[i * n + d]!
      const value = plus(times(omegaTimesN, w[i * n + d] ?? [0n, 0n]), shared)

      out[j * n + d] = thirds ? turn(value, -(thirds[j] ?? 0)) : value
    }
  }

  return out
}
// ---------------------------------------------------------------------------------------------------------
// The husk's Coulomb Green's function, infinite-husk form, on a cube of side `side` centered on the source

// the weighted husk Laplacian solve on a torus of side n: sum_links w (phi_y - phi_z) = delta_0 - 1 / n^3,
// by conjugate gradients, the same equation huskCoulomb solves (E-FRC-0179)
export function huskGreenTorus(n: number): Float64Array {
  const cells = n ** 3
  const idx = (a: number, b: number, c: number): number => (((a % n) + n) % n) + n * ((((b % n) + n) % n) + n * (((c % n) + n) % n))
  const neighbours: Int32Array[] = HUSK_VECTORS.map(u => {
    const out = new Int32Array(cells)

    for (let c = 0; c < n; c++) {
      for (let b = 0; b < n; b++) {
        for (let a = 0; a < n; a++) {
          out[idx(a, b, c)] = idx(a + (u[0] ?? 0), b + (u[1] ?? 0), c + (u[2] ?? 0))
        }
      }
    }

    return out
  })
  const apply = (v: Float64Array, out: Float64Array): void => {
    out.fill(0)

    for (let k = 0; k < HUSK_VECTORS.length; k++) {
      const w = HUSK_WEIGHTS[k] ?? 0
      const nb = neighbours[k]!

      for (let y = 0; y < cells; y++) {
        const z = nb[y] ?? 0
        const e = w * ((v[y] ?? 0) - (v[z] ?? 0))

        out[y] = (out[y] ?? 0) + e
        out[z] = (out[z] ?? 0) - e
      }
    }
  }
  const b = new Float64Array(cells).fill(-1 / cells)

  b[0] = (b[0] ?? 0) + 1

  const phi = new Float64Array(cells)
  const r = Float64Array.from(b)
  const p = Float64Array.from(r)
  const ap = new Float64Array(cells)
  const dot = (u: Float64Array, v: Float64Array): number => {
    let s = 0

    for (let i = 0; i < u.length; i++) {
      s += (u[i] ?? 0) * (v[i] ?? 0)
    }

    return s
  }

  let rr = dot(r, r)

  for (let it = 0; it < 20 * n && rr > 1e-30; it++) {
    apply(p, ap)

    const step = rr / dot(p, ap)

    for (let i = 0; i < cells; i++) {
      phi[i] = (phi[i] ?? 0) + step * (p[i] ?? 0)
      r[i] = (r[i] ?? 0) - step * (ap[i] ?? 0)
    }

    const nextRr = dot(r, r)

    for (let i = 0; i < cells; i++) {
      p[i] = (r[i] ?? 0) + (nextRr / rr) * (p[i] ?? 0)
    }

    rr = nextRr
  }

  return phi
}

export type Green = {
  // G of the infinite husk at every offset in [-side/2, side/2)^3, dock order of a torus of that side
  readonly values: Float64Array
  readonly side: number
  // the constant fixed from the tail, and the tail's rms relative misfit over 6 <= r <= big / 4
  readonly constant: number
  readonly tailMisfit: number
}

// G_inf = G_torus(big) - r^2 / (36 big^3) - c, c from the 1 / (24 pi r) tail: the weighted Laplacian of
// r^2 is -36 at every dock, so subtracting r^2 / (36 big^3) removes the torus's uniform background exactly
export function huskGreen(side: number, big: number): Green {
  const g = huskGreenTorus(big)
  const cells = big ** 3
  const at = (x: number, y: number, z: number): number => {
    const i = ((x % big) + big) % big + big * ((((y % big) + big) % big) + big * (((z % big) + big) % big))

    return (g[i] ?? 0) - (x * x + y * y + z * z) / (36 * cells)
  }
  let sum = 0
  let count = 0
  const tail: [number, number][] = []

  for (let z = -Math.floor(big / 4); z <= Math.floor(big / 4); z++) {
    for (let y = -Math.floor(big / 4); y <= Math.floor(big / 4); y++) {
      for (let x = -Math.floor(big / 4); x <= Math.floor(big / 4); x++) {
        const r = Math.hypot(x, y, z)

        if (r >= 6 && r <= big / 4) {
          const v = at(x, y, z) - 1 / (24 * Math.PI * r)

          sum += v
          count++
          tail.push([r, at(x, y, z)])
        }
      }
    }
  }

  const constant = sum / count
  const tailMisfit = Math.sqrt(tail.reduce((s, [r, v]) => s + ((v - constant) * 24 * Math.PI * r - 1) ** 2, 0) / tail.length)
  const values = new Float64Array(side ** 3)
  const h = Math.floor(side / 2)

  for (let c = 0; c < side; c++) {
    for (let b = 0; b < side; b++) {
      for (let a = 0; a < side; a++) {
        values[a + side * (b + side * c)] = at(a - h, b - h, c - h) - constant
      }
    }
  }

  return { values, side, constant, tailMisfit }
}

// the Coulomb potential of a source at the torus center with coupling alpha (far field -alpha / r)
export function coulombPotential(green: Green, alpha: number): Float64Array {
  return Float64Array.from(green.values, v => -24 * Math.PI * alpha * v)
}

// ---------------------------------------------------------------------------------------------------------
// Spectral reading: the eigenphases of U in a symmetry sector, by filtered vectors and Rayleigh-Ritz.
// U = e^(-i E) on an eigenvector, so c(t) = <start | U^t start> = sum_j |a_j|^2 e^(-i E_j t)

export type Series = { re: Float64Array; im: Float64Array }

export function autocorrelation(torus: Torus, start: Walk, beats: number, phase: Phase): Series {
  const re = new Float64Array(beats)
  const im = new Float64Array(beats)
  let w = Float64Array.from(start)
  let spare = emptyWalkOn(torus)

  for (let t = 0; t < beats; t++) {
    const [cr, ci] = inner(start, w)

    re[t] = cr
    im[t] = ci
    beat(torus, w, spare, phase)
    ;[w, spare] = [spare, w]
  }

  return { re, im }
}

// the power of c(t) at energy E with a Gaussian window of width sigma beats centered on the run's middle
export function spectrumAt(c: Series, energy: number, sigma: number): number {
  const n = c.re.length
  const mid = (n - 1) / 2
  let re = 0
  let im = 0

  for (let t = 0; t < n; t++) {
    const w = Math.exp(-(((t - mid) / sigma) ** 2) / 2)
    const cs = Math.cos(energy * t)
    const sn = Math.sin(energy * t)

    re += w * (c.re[t]! * cs - c.im[t]! * sn)
    im += w * (c.re[t]! * sn + c.im[t]! * cs)
  }

  return re * re + im * im
}

// the local maxima of the power over [from, to] on a grid, above `floor` of the largest there, refined by a
// parabola in log power
export function spectralPeaks(c: Series, from: number, to: number, step: number, sigma: number, floor: number): { energy: number; power: number }[] {
  const grid: number[] = []
  const power: number[] = []

  for (let e = from; e <= to; e += step) {
    grid.push(e)
    power.push(spectrumAt(c, e, sigma))
  }

  const top = Math.max(...power)
  const out: { energy: number; power: number }[] = []

  for (let i = 1; i < grid.length - 1; i++) {
    const p = power[i]!

    if (p > floor * top && p >= power[i - 1]! && p >= power[i + 1]!) {
      const a = Math.log(power[i - 1]!)
      const b = Math.log(p)
      const cc = Math.log(power[i + 1]!)
      const shift = (0.5 * (a - cc)) / (a - 2 * b + cc)

      out.push({ energy: grid[i]! + (Number.isFinite(shift) ? shift * step : 0), power: p })
    }
  }

  return out
}

export type RitzPair = { energy: number; residual: number; vector: Walk }

// Rayleigh-Ritz in the span of filtered vectors psi_j = sum_t w(t) e^(i E_j t) U^t start, for the target
// energies E_j. The small problem is Hermitian: Im(U) = (U - U^dagger) / 2i has eigenvalue -sin E on every
// eigenvector, monotone for |E| < pi / 2. Each Ritz energy is then read from the Rayleigh quotient of U, with
// the residual |U v - e^(-i E) v| of its normalized vector: the honest measure of whether it is an eigenvector
export function ritzEnergies(torus: Torus, start: Walk, targets: readonly number[], beats: number, sigma: number, phase: Phase): RitzPair[] {
  const m = targets.length
  const size = start.length
  const filtered = targets.map(() => new Float64Array(size))
  let w = Float64Array.from(start)
  let spare = emptyWalkOn(torus)
  const mid = (beats - 1) / 2

  for (let t = 0; t < beats; t++) {
    const weight = Math.exp(-(((t - mid) / sigma) ** 2) / 2)

    if (weight > 1e-12) {
      for (let j = 0; j < m; j++) {
        const cr = weight * Math.cos(targets[j]! * t)
        const ci = weight * Math.sin(targets[j]! * t)
        const f = filtered[j]!

        for (let i = 0; i < size; i += 2) {
          f[i] = f[i]! + cr * w[i]! - ci * w[i + 1]!
          f[i + 1] = f[i + 1]! + cr * w[i + 1]! + ci * w[i]!
        }
      }
    }

    beat(torus, w, spare, phase)
    ;[w, spare] = [spare, w]
  }

  const images = filtered.map(f => {
    const out = emptyWalkOn(torus)

    beat(torus, f, out, phase)

    return out
  })
  const gram = makeComplexMatrix({ rows: m, cols: m })
  const sinMatrix = makeComplexMatrix({ rows: m, cols: m })

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      const [gr, gi] = inner(filtered[i]!, filtered[j]!)
      // (U - U^dagger) / 2i, entry (<i|U|j> - conj(<j|U|i>)) / 2i
      const [ar, ai] = inner(filtered[i]!, images[j]!)
      const [br, bi] = inner(filtered[j]!, images[i]!)

      gram.re[i * m + j] = gr
      gram.im[i * m + j] = gi
      sinMatrix.re[i * m + j] = (ai + bi) / 2
      sinMatrix.im[i * m + j] = -(ar - br) / 2
    }
  }

  // an orthonormal basis of the span: B = V diag(1 / sqrt l) over the Gram eigenvalues above 1e-10 of the top
  const g = hermitianEigen(gram)
  const top = Math.max(...Array.from(g.values))
  const keep = Array.from({ length: m }, (_, c) => c).filter(c => g.values[c]! > 1e-10 * top)
  const k = keep.length
  const bRe = new Float64Array(m * k)
  const bIm = new Float64Array(m * k)

  keep.forEach((c, a) => {
    const f = 1 / Math.sqrt(g.values[c]!)

    for (let i = 0; i < m; i++) {
      bRe[i * k + a] = g.vectorsRe[i * m + c]! * f
      bIm[i * k + a] = g.vectorsIm[i * m + c]! * f
    }
  })

  const reduced = makeComplexMatrix({ rows: k, cols: k })

  for (let a = 0; a < k; a++) {
    for (let b = 0; b < k; b++) {
      let re = 0
      let im = 0

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < m; j++) {
          const hr = sinMatrix.re[i * m + j]!
          const hi = sinMatrix.im[i * m + j]!
          const xr = bRe[j * k + b]!
          const xi = bIm[j * k + b]!
          const yr = hr * xr - hi * xi
          const yi = hr * xi + hi * xr
          const cr = bRe[i * k + a]!
          const ci = -bIm[i * k + a]!

          re += cr * yr - ci * yi
          im += cr * yi + ci * yr
        }
      }

      reduced.re[a * k + b] = re
      reduced.im[a * k + b] = im
    }
  }

  const r = hermitianEigen(reduced)
  const out: RitzPair[] = []

  for (let c = 0; c < k; c++) {
    const vector = new Float64Array(size)
    const image = new Float64Array(size)

    for (let i = 0; i < m; i++) {
      let cr = 0
      let ci = 0

      for (let a = 0; a < k; a++) {
        const br = bRe[i * k + a]!
        const bi = bIm[i * k + a]!
        const yr = r.vectorsRe[a * k + c]!
        const yi = r.vectorsIm[a * k + c]!

        cr += br * yr - bi * yi
        ci += br * yi + bi * yr
      }

      const f = filtered[i]!
      const u = images[i]!

      for (let x = 0; x < size; x += 2) {
        vector[x] = vector[x]! + cr * f[x]! - ci * f[x + 1]!
        vector[x + 1] = vector[x + 1]! + cr * f[x + 1]! + ci * f[x]!
        image[x] = image[x]! + cr * u[x]! - ci * u[x + 1]!
        image[x + 1] = image[x + 1]! + cr * u[x + 1]! + ci * u[x]!
      }
    }

    const [nn] = inner(vector, vector)
    const [ur, ui] = inner(vector, image)
    const energy = -Math.atan2(ui / nn, ur / nn)
    const lr = Math.cos(energy)
    const li = -Math.sin(energy)
    let res = 0

    for (let x = 0; x < size; x += 2) {
      const er = image[x]! - (lr * vector[x]! - li * vector[x + 1]!)
      const ei = image[x + 1]! - (lr * vector[x + 1]! + li * vector[x]!)

      res += er * er + ei * ei
    }

    scaleWalk(vector, 1 / Math.sqrt(nn))
    out.push({ energy, residual: Math.sqrt(res / nn), vector })
  }

  return out.sort((x, y) => x.energy - y.energy)
}

// the mean distance of a state's chance from the torus center, and its mean square
export function radialMoments(torus: Torus, w: Walk): { meanR: number; meanR2: number } {
  const rho = density(torus, w)
  let total = 0
  let r1 = 0
  let r2 = 0

  for (let i = 0; i < torus.docks; i++) {
    const r = Math.hypot(...offset(torus, i))

    total += rho[i]!
    r1 += rho[i]! * r
    r2 += rho[i]! * r * r
  }

  return { meanR: r1 / total, meanR2: r2 / total }
}

// |<v | U^t v>| for t up to `beats`: how much of a state is still itself, the survival of a level
export function survival(torus: Torus, v: Walk, beats: number, phase: Phase): Float64Array {
  const c = autocorrelation(torus, v, beats, phase)

  return Float64Array.from(c.re, (x, t) => Math.hypot(x, c.im[t]!))
}
