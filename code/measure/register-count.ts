// GRAVITY'S COUNT FIELD UNDER THE REGISTER RULE (E-GRV-0146). The depth is sourced by the rule's own counts (E-GRV-0119,
// E-GRV-0144). Under the many-body register rule (E-SPN-0175) the count that may source it is the beat's SECTOR count
// counted from the sea, so a hole is one unit and the sea none, and the depth acts back on a hole as a sector pair piece:
// the pair angle at relative dock y is the depth's own kernel, the depth difference between contact and the column of y
// on the husk. This module holds what the experiment needs beyond code/measure/register-sea:
//
//   huskKernel     the depth a unit column source makes on the side-L husk (code/measure/energy-lines staticDepth,
//                  E-GRV-0090's rule), read as a pair angle per relative dock of a register-sea torus: 0 at contact,
//                  1 at the nearest column, rising to its far value as 1/r falls off
//   restGap        the rest half gap M of E-SPN-0160's band for a mixer angle (the moving cycle phases at K = 0 sit at
//                  pi -+ M), so which way a pair angle moves the mass can be read before any run
//   one hole       a single member (one hole of the sea is the member, E-SPN-0163) on the D4 torus of side L with the
//                  full 192-mode state, the member mixers, the swap coin and the stream, and its count fields per dock:
//                  the sector count (sum over the sector's 8 coordinates) and the dock count (every mode)
//
// DETERMINISM: no random numbers; starts are fixed modes. FLOATS are measurement on exact pieces, and the kernel is a
// float depth (the depth register's stand-in reading, as in every earlier gravity experiment).

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { cyclePhases } from '@/code/measure/swap-cone'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import {
  partnerProjector48,
  REGISTER_ROOTS,
  registerPiece,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import { staticDepth } from '@/code/measure/energy-lines'
import {
  projected,
  type Kind,
  type Moving,
  type Torus,
} from '@/code/measure/register-sea'

const REG = 8
const MODES = 24 * REG
const NR = 24

const mod = (x: number, L: number): number => ((x % L) + L) % L

// the husk column of a D4 point on the side-L torus: its first three coordinates, as code/measure/causal-components
// boxHusk numbers them
export const columnOf = (p: readonly number[], L: number): number =>
  mod(p[0]!, L) + L * mod(p[1]!, L) + L * L * mod(p[2]!, L)

// the depth of a unit source on column 0 of the side-L husk (the torus mean removed), per column
export function pointDepth(L: number): Float64Array {
  const rho = new Float64Array(L ** 3)

  rho[0] = 1

  return staticDepth(L, rho).depth
}

export type HuskKernel = {
  // per relative dock of the torus: (x(0) - x(column)) / (x(0) - x(nearest column))
  kernel: Float64Array
  // the same per column, and the unit it is divided by
  column: Float64Array
  unit: number
}

export function huskKernel(t: Torus): HuskKernel {
  const L = t.L
  const { column, unit } = columnKernel(L)
  const kernel = Float64Array.from(t.sites, p => column[columnOf(p, L)]!)

  return { kernel, column, unit }
}

// the depth kernel per husk column of the side-L husk, k = (x(0) - x(column)) / (x(0) - x(nearest column)), and its unit
export function columnKernel(L: number): { column: Float64Array; unit: number } {
  const x = pointDepth(L)
  const unit = x[0]! - x[1]!

  return { column: Float64Array.from(x, v => (x[0]! - v) / unit), unit }
}

// THE RAW COUNT'S HARTREE ANGLE on the side-L torus. Written on raw sector counts, the pair piece theta k(x - y) N_x N_y
// becomes (8 - n_x)(8 - n_y) theta k: the hole pair piece plus a one-body phase on each hole's sector mixer, the whole
// sea's 8 members a dock times the kernel summed over every dock, 8 theta sum_y k(y) (E-SPN-0175 point 2). Each husk
// column holds L / 2 docks, so the sum is L / 2 times the column sum
export function hartreeAngle(L: number, theta: number): number {
  const x = pointDepth(L)
  const unit = x[0]! - x[1]!

  let s = 0

  for (const v of x) {
    s += (x[0]! - v) / unit
  }

  return 8 * theta * (L / 2) * s
}

// the rest half gap: the moving cycle phases at K = 0 are pi -+ M
export function restGap(theta: number): number {
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const u: [number, number] = [Math.cos(theta), Math.sin(theta)]
  const Ps = [registerPiece(qS, u), registerPiece(qD, [u[0], -u[1]])]

  let M = Infinity

  for (const p of cyclePhases(Ps, REGISTER_ROOTS, [0, 0, 0, 0])) {
    if (Math.abs(p) > 1e-6) {
      M = Math.min(M, Math.PI - Math.abs(p))
    }
  }

  return M
}

// ---- one hole on the torus ----

export type OneTorus = {
  L: number
  sites: number[][]
  // neighbor[i * 24 + d]: the site of sites[i] + r_d
  neighbor: Int32Array
  // the husk column of each site
  column: Int32Array
  origin: number
}

// the D4 torus of side L in the three husk coordinates and side wSide in the fourth (both even). With wSide = 2 it is
// the SLAB: one dock a husk column, and it holds exactly the states the infinite lattice evolves that repeat under
// w -> w + 2 (a D4 vector), which the dynamics keeps because it commutes with every translation; a state uniform down
// each column is one of them, so a column packet runs on the slab with no approximation
export function oneTorus(L: number, wSide = L): OneTorus {
  if (L % 2 !== 0 || L < 2 || wSide % 2 !== 0 || wSide < 2) {
    throw new Error(
      `register-count: the torus sides must be even, got ${L} and ${wSide}`,
    )
  }

  const sites: number[][] = []
  const sides = [L, L, L, wSide]

  for (let a = 0; a < L; a++) {
    for (let b = 0; b < L; b++) {
      for (let c = 0; c < L; c++) {
        for (let e = 0; e < wSide; e++) {
          if ((a + b + c + e) % 2 === 0) {
            sites.push([a, b, c, e])
          }
        }
      }
    }
  }

  const key = (p: readonly number[]): string =>
    p.map((v, k) => mod(v, sides[k]!)).join(',')
  const index = new Map(sites.map((p, i) => [key(p), i]))
  const neighbor = new Int32Array(sites.length * NR)

  sites.forEach((p, i) => {
    for (let d = 0; d < NR; d++) {
      const r = DOCK_ROOTS[d]!

      neighbor[i * NR + d] = index.get(key(p.map((v, k) => v + r[k]!)))!
    }
  })

  return {
    L,
    sites,
    neighbor,
    column: Int32Array.from(sites, p => columnOf(p, L)),
    origin: index.get(key([0, 0, 0, 0]))!,
  }
}

export type OneState = { re: Float64Array; im: Float64Array }

export const newOne = (o: OneTorus): OneState => ({
  re: new Float64Array(o.sites.length * MODES),
  im: new Float64Array(o.sites.length * MODES),
})

// the singlet state S_a on one dock: 1 / sqrt 24 on every slot's register component a (it lies in the moving block W at
// every momentum, E-SPN-0175 I2, so it is a moving member)
export function singletStart(o: OneTorus, dock: number, a: number): OneState {
  const s = newOne(o)

  for (let d = 0; d < NR; d++) {
    s.re[dock * MODES + d * REG + a] = 1 / Math.sqrt(24)
  }

  return s
}

// one member whose Fourier components are P_kind(q) e_m at every momentum of a register-sea torus of the same side (a
// mode at the origin, projected on the moving block W or on the flats F), normalized; the one torus must be built with
// the same side, so the two list their sites in the same order
export function projectedStart(
  o: OneTorus,
  t: Torus,
  mv: Moving,
  kind: Kind,
  m: number,
): OneState {
  if (o.L !== t.L || o.sites.length !== t.sites.length) {
    throw new Error('register-count: the one torus and the pair torus differ')
  }

  const s = newOne(o)
  const N = t.sites.length

  t.momenta.forEach((q, j) => {
    const v = projected(mv, j, kind, m)

    t.sites.forEach((y, i) => {
      const ph = q[0]! * y[0]! + q[1]! * y[1]! + q[2]! * y[2]! + q[3]! * y[3]!
      const c = Math.cos(ph) / N
      const sn = Math.sin(ph) / N
      const off = i * MODES

      for (let k = 0; k < MODES; k++) {
        s.re[off + k]! += c * v.re[k]! - sn * v.im[k]!
        s.im[off + k]! += c * v.im[k]! + sn * v.re[k]!
      }
    })
  })

  let n = 0

  for (let k = 0; k < s.re.length; k++) {
    n += s.re[k]! ** 2 + s.im[k]! ** 2
  }

  n = Math.sqrt(n)

  for (let k = 0; k < s.re.length; k++) {
    s.re[k]! /= n
    s.im[k]! /= n
  }

  return s
}

// one beat: at every dock psi <- psi + (w - 1) E E^T psi, then the swap coin and the stream (slot d at dock x + r_d
// takes slot opposite(d) at x), written into `out`. With `angle`, dock i's unit is w e^(i angle[i]): a static source's
// sector pair piece felt by one hole (the pair angle times the source's count in the beat's sector, E-GRV-0147)
export function oneBeat(
  o: OneTorus,
  E: Float64Array,
  w: readonly [number, number],
  s: OneState,
  out: OneState,
  angle?: Float64Array,
): void {
  const N = o.sites.length
  const cr = new Float64Array(REG)
  const ci = new Float64Array(REG)

  let ar = w[0] - 1
  let ai = w[1]

  for (let i = 0; i < N; i++) {
    const off = i * MODES

    if (angle) {
      const c = Math.cos(angle[i]!)
      const sn = Math.sin(angle[i]!)

      ar = w[0] * c - w[1] * sn - 1
      ai = w[0] * sn + w[1] * c
    }

    cr.fill(0)
    ci.fill(0)

    for (let m = 0; m < MODES; m++) {
      const xr = s.re[off + m]!
      const xi = s.im[off + m]!

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let z = 0; z < REG; z++) {
        const e = E[m * REG + z]!

        cr[z]! += e * xr
        ci[z]! += e * xi
      }
    }

    for (let z = 0; z < REG; z++) {
      const r = cr[z]!
      const im = ci[z]!

      cr[z] = ar * r - ai * im
      ci[z] = ar * im + ai * r
    }

    for (let m = 0; m < MODES; m++) {
      let dr = 0
      let di = 0

      for (let z = 0; z < REG; z++) {
        const e = E[m * REG + z]!

        dr += e * cr[z]!
        di += e * ci[z]!
      }

      s.re[off + m]! += dr
      s.im[off + m]! += di
    }
  }

  for (let i = 0; i < N; i++) {
    for (let d = 0; d < NR; d++) {
      const src = i * MODES + OPPOSITE[d]! * REG
      const dst = o.neighbor[i * NR + d]! * MODES + d * REG

      for (let a = 0; a < REG; a++) {
        out.re[dst + a] = s.re[src + a]!
        out.im[dst + a] = s.im[src + a]!
      }
    }
  }
}

// the sector count per dock, sum_z |(E^T psi_x)_z|^2
export function sectorCount(
  o: OneTorus,
  E: Float64Array,
  s: OneState,
): Float64Array {
  const N = o.sites.length
  const out = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    const off = i * MODES

    let t = 0

    for (let z = 0; z < REG; z++) {
      let r = 0
      let im = 0

      for (let m = 0; m < MODES; m++) {
        const e = E[m * REG + z]!

        if (e !== 0) {
          r += e * s.re[off + m]!
          im += e * s.im[off + m]!
        }
      }

      t += r * r + im * im
    }

    out[i] = t
  }

  return out
}

// the dock count per dock, sum over all 192 modes of |psi|^2
export function dockCount(o: OneTorus, s: OneState): Float64Array {
  const N = o.sites.length
  const out = new Float64Array(N)

  for (let i = 0; i < N; i++) {
    const off = i * MODES

    let t = 0

    for (let m = 0; m < MODES; m++) {
      t += s.re[off + m]! ** 2 + s.im[off + m]! ** 2
    }

    out[i] = t
  }

  return out
}

// a per-dock field summed down each husk column
export function columnSums(o: OneTorus, perDock: Float64Array): Float64Array {
  const out = new Float64Array(o.L ** 3)

  for (let i = 0; i < perDock.length; i++) {
    out[o.column[i]!]! += perDock[i]!
  }

  return out
}

// ---- the charges of one band (E-GRV-0147) ----

export type BandCharges = {
  // the band's weight in Q_S at the start of beat 1 (s) and in Q_D at the start of beat 2 (d), per state, the mean over
  // the band's 8 states, read as Hellmann-Feynman derivatives of the band's phase sum: the S unit u e^(i dS) moves a
  // cycle phase by s dS, the D unit conj(u) e^(-i dD) by -d dD (U = U2 U1, dU1 = U1 i Q_S dS, dU2 = -i dD Q_D U2)
  s: [number, number]
  d: [number, number]
  // the band energies measured from pi: E_A = pi + phase (the band below 0), E_B = pi - phase (the band above 0), the
  // mean over each band's 8 states, and the spread inside each band (0 for a degenerate band)
  E: [number, number]
  spread: [number, number]
  // how many phases each band and the flats hold
  counts: [number, number, number]
}

// the moving phases split by sign (band A below 0, band B above), the flats within 1e-6 of 0
function bandPhases(
  theta: number,
  K: readonly number[],
  dS: number,
  dD: number,
): { A: number[]; B: number[]; flat: number } {
  const qS = scaled(singletProjector24(), 24)
  const qD = scaled(partnerProjector48(), 48)
  const Ps = [
    registerPiece(qS, [Math.cos(theta + dS), Math.sin(theta + dS)]),
    registerPiece(qD, [Math.cos(theta + dD), -Math.sin(theta + dD)]),
  ]
  const ph = cyclePhases(Ps, REGISTER_ROOTS, K)

  return {
    A: ph.filter(p => p < -1e-6),
    B: ph.filter(p => p > 1e-6),
    flat: ph.filter(p => Math.abs(p) <= 1e-6).length,
  }
}

export function bandCharges(
  theta: number,
  K: readonly number[],
  h: number,
): BandCharges {
  const sum = (x: number[]): number => x.reduce((a, v) => a + v, 0)
  const b = bandPhases(theta, K, 0, 0)
  const sp = bandPhases(theta, K, h, 0)
  const sm = bandPhases(theta, K, -h, 0)
  const dp = bandPhases(theta, K, 0, h)
  const dm = bandPhases(theta, K, 0, -h)
  const nA = b.A.length
  const nB = b.B.length
  const EA = b.A.map(p => Math.PI + p)
  const EB = b.B.map(p => Math.PI - p)

  return {
    s: [
      (sum(sp.A) - sum(sm.A)) / (2 * h * nA),
      (sum(sp.B) - sum(sm.B)) / (2 * h * nB),
    ],
    d: [
      -(sum(dp.A) - sum(dm.A)) / (2 * h * nA),
      -(sum(dp.B) - sum(dm.B)) / (2 * h * nB),
    ],
    E: [sum(EA) / nA, sum(EB) / nB],
    spread: [
      Math.max(...EA) - Math.min(...EA),
      Math.max(...EB) - Math.min(...EB),
    ],
    counts: [nA, nB, b.flat],
  }
}

// ---- a column packet and its readout (E-GRV-0147) ----

// the minimal-image offset of column coordinate v from c on a side-L husk
const wrapOffset = (v: number, c: number, L: number): number => {
  const d = mod(v - c, L)

  return d > L / 2 ? d - L : d
}

// a packet uniform down each column: amplitude e^(-rho^2 / (4 sigma^2)) (so each husk axis carries standard deviation
// sigma) on column distance rho from `center`, times the sector state E[:, a] on every dock, normalized
export function envelopeStart(
  o: OneTorus,
  E: Float64Array,
  a: number,
  center: readonly number[],
  sigma: number,
): OneState {
  const s = newOne(o)

  let n = 0

  o.sites.forEach((p, i) => {
    let rho2 = 0

    for (let k = 0; k < 3; k++) {
      rho2 += wrapOffset(p[k]!, center[k]!, o.L) ** 2
    }

    const f = Math.exp(-rho2 / (4 * sigma * sigma))

    for (let m = 0; m < MODES; m++) {
      const v = f * E[m * REG + a]!

      s.re[i * MODES + m] = v
      n += v * v
    }
  })

  n = Math.sqrt(n)

  for (let k = 0; k < s.re.length; k++) {
    s.re[k]! /= n
  }

  return s
}

// the dock-count weight and its mean minimal-image offset from `center` along the three husk axes
export function meanOffset(
  o: OneTorus,
  s: OneState,
  center: readonly number[],
): { weight: number; offset: [number, number, number] } {
  const d = dockCount(o, s)
  const offset: [number, number, number] = [0, 0, 0]

  let weight = 0

  o.sites.forEach((p, i) => {
    weight += d[i]!

    for (let k = 0; k < 3; k++) {
      offset[k]! += d[i]! * wrapOffset(p[k]!, center[k]!, o.L)
    }
  })

  return {
    weight,
    offset: [offset[0] / weight, offset[1] / weight, offset[2] / weight],
  }
}

// ONE HOLE IN A STATIC FIELD: a column packet of band A (S_0 at the start of beat 1) or band B (D_0 at the start of beat
// 2, the run starting with beat 2) around column (r, 0, 0), run for `cycles` cycles with the extra angles angleS on the
// S unit and angleD on the D unit at every dock (a static source's sector pair piece, oneBeat's `angle`); returns the
// mean offset along the first husk axis after each cycle and the largest norm drift
export function packetRun(input: {
  o: OneTorus
  band: 'A' | 'B'
  angleS: Float64Array
  angleD: Float64Array
  r: number
  sigma: number
  cycles: number
  theta: number
  bases: { S: Float64Array; D: Float64Array }
}): { x: number[]; drift: number } {
  const { o, band, angleS, angleD, r, sigma, cycles, theta, bases } = input
  const u: [number, number] = [Math.cos(theta), Math.sin(theta)]
  const uc: [number, number] = [u[0], -u[1]]
  const center = [r, 0, 0]
  const x: number[] = []

  let s = envelopeStart(o, band === 'A' ? bases.S : bases.D, 0, center, sigma)
  let t = newOne(o)
  let drift = 0

  for (let c = 0; c < cycles; c++) {
    for (const beat of band === 'A' ? [1, 2] : [2, 1]) {
      if (beat === 1) {
        oneBeat(o, bases.S, u, s, t, angleS)
      } else {
        oneBeat(o, bases.D, uc, s, t, angleD)
      }

      ;[s, t] = [t, s]
    }

    const m = meanOffset(o, s, center)

    drift = Math.max(drift, Math.abs(m.weight - 1))
    x.push(m.offset[0])
  }

  return { x, drift }
}

// the pair's weight per relative dock (the two holes' separation distribution) and its mean D4 string length
export function separation(
  t: Torus,
  s: { re: Float64Array; im: Float64Array },
): { meanV: number; contact: number; total: number } {
  const full = MODES * MODES

  let total = 0
  let meanV = 0
  let contact = 0

  for (let i = 0; i < t.sites.length; i++) {
    const o = i * full

    let w = 0

    for (let k = 0; k < full; k++) {
      w += s.re[o + k]! ** 2 + s.im[o + k]! ** 2
    }

    total += w
    meanV += w * t.V[i]!

    if (i === t.origin) {
      contact = w
    }
  }

  return { meanV: meanV / total, contact: contact / total, total }
}
