// THE REGISTER RULE ON A GROWING REGION (E-FND-0167). The wake (E-GRV-0066, code/measure/gated-wake) gives every dock a
// birth beat and takes no state; the adopted knit has no rule for the growing edge. The only growing dynamics written in
// code is the lattice gas's (code/rule/lattice-gas growingBeat, E-FND-0086): an unborn dock holds peace, the frontier
// REFLECTS (a slot whose source dock is unborn takes its own dock's opposite slot, so the map stays a bijection on the
// born slots), and a born dock enters in the state it was written in. The register rule (E-SPN-0175's one-body pieces)
// has no growth rule at all. This module ports the lattice gas's to it, the least rule consistent with its pieces:
//
//   the wake        on the register torus (code/measure/register-sea torus, the D4 lattice mod L, L^4 / 2 docks): one
//                   seed dock born at beat 0, every other dock born at its graph distance from the seed in D4 root
//                   steps, one shell a beat, the plain wake of E-GRV-0066
//   the beat        at beat t the docks of shell t are born first, then the beat's one-body piece X (1 + (w - 1) Q) acts
//                   at every born dock (beat 1 at even t: Q_S and w = u; beat 2 at odd t: Q_D and conj u, E-SPN-0160's
//                   schedule), then the stream with the reflecting frontier on the born docks
//   the write       a born dock enters in a fixed dock state chi. Adding modes in a fixed state is an isometry and the
//                   reflecting stream is a bijection on the born modes, so the growing rule is reversible from birth; it
//                   reads only a dock and its root neighbors, so it is local; and a chi that is one Fock state keeps the
//                   region one Slater determinant (one branch)
//
// A SLATER STATE IS RUN THROUGH ITS MINORITY ORBITALS. The rule is one-body, so a Slater determinant stays one. Relative
// to a reference sea (the full sea, or the empty mesh) the state is spanned by the orbitals where it differs: holes of
// the full sea, or members on the empty mesh. A dock written in the reference state adds no orbital, so the grown region
// costs only what its seed carries: 48 holes, 192 members. Each orbital is a vector over the region's 192 N modes.
//
//   torusWake            the birth beat of every dock of a torus from a seed
//   growthBeat           one beat on orbitals, in place, with births up to the beat's time and the reflecting frontier
//   isospinGenerators    T_k = (i / 2) A_k P+ on a register (A_k the right multiplications of code/measure/register-link-
//                        field registerGauge, P+ = (1 + J) / 2), Hermitian, T_k^2 = P+ / 4: the SU(2)+ of E-FRC-0268
//   isospinRead          <T_k> and the total Casimir <T^2> of a Slater state given by its minority orbitals
//   sectorCount          the minority weight in a sector (S at a cycle boundary, D after beat 1), summed over the docks
//   bandRead             the minority weight in the flat and the moving states and in the cycle's positive-phase band,
//                        through E-FND-0161's frame (code/measure/register-holes holeFrame), at a cycle boundary
//   spanResidual         the part of a cycle's image of the orbitals outside their span (0: the Slater state is
//                        stationary)
//   registerCommutant    the real dimension of the dock-local operators 1 (x) M (M on the 8 register components) that
//                        commute with every piece's sector projector, by Gram-Schmidt with the gap disclosed
//
// DETERMINISM: no random numbers; every start is a fixed local basis. FLOATS: the pieces are the exact projectors of
// code/measure/spinor-register times ring units; amplitudes are floats, as measurement. NOTHING MOVES: the stream copies
// each slot's content one dock along its root.

import { DOCK_ROOTS } from '@/code/measure/dock-mixer'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { MODES, type Torus } from '@/code/measure/register-sea'
import {
  lineScratch,
  toClasses,
  type HoleFrame,
} from '@/code/measure/register-holes'

const REG = 8
const SLOTS = 24

// ---- the orbitals ----

export type Orbital = { re: Float64Array; im: Float64Array }

export const newOrbital = (N: number): Orbital => ({
  re: new Float64Array(N * MODES),
  im: new Float64Array(N * MODES),
})

export const copyOrbital = (o: Orbital): Orbital => ({
  re: Float64Array.from(o.re),
  im: Float64Array.from(o.im),
})

// one orbital per given 192-vector, placed at dock x
export function localOrbitals(
  N: number,
  x: number,
  vectors: readonly Orbital[],
): Orbital[] {
  return vectors.map(v => {
    const o = newOrbital(N)

    o.re.set(v.re, x * MODES)
    o.im.set(v.im, x * MODES)

    return o
  })
}

// the 192 unit vectors of one dock: every mode of a full dock
export function dockModes(): Orbital[] {
  return Array.from({ length: MODES }, (_, m) => {
    const v = { re: new Float64Array(MODES), im: new Float64Array(MODES) }

    v.re[m] = 1

    return v
  })
}

// ---- the wake on the torus ----

// the torus's root neighbors, nb[x * 24 + d] = the dock of sites[x] + r_d
export function torusNeighbors(t: Torus): Int32Array {
  const nb = new Int32Array(t.sites.length * SLOTS)
  const mod = (v: number): number => ((v % t.L) + t.L) % t.L

  t.sites.forEach((p, x) => {
    DOCK_ROOTS.forEach((r, d) => {
      nb[x * SLOTS + d] = t.index.get(
        p.map((c, k) => mod(c + r[k]!)).join(','),
      )!
    })
  })

  return nb
}

// the plain wake: every dock's graph distance from the seed in root steps, which is its birth beat (E-GRV-0066's rule
// with every wait 0)
export function torusWake(nb: Int32Array, N: number, seed: number): Int32Array {
  const birth = new Int32Array(N).fill(-1)
  let front = [seed]

  birth[seed] = 0

  for (let b = 1; front.length > 0; b++) {
    const next: number[] = []

    for (const x of front) {
      for (let d = 0; d < SLOTS; d++) {
        const y = nb[x * SLOTS + d]!

        if (birth[y] === -1) {
          birth[y] = b
          next.push(y)
        }
      }
    }

    front = next
  }

  return birth
}

// ---- the beat ----

export type GrowthBeat = {
  nb: Int32Array
  birth: Int32Array
  // the beat's sector basis, 192 x 8 real, row-major [m * 8 + eta] (Q = E E^T)
  E: Float64Array
  // the beat's mixer unit w (u in beat 1, conj u in beat 2)
  w: readonly [number, number]
  // the beat's time: docks with birth <= time are born
  time: number
  // CONTROL: false replaces the reflecting frontier by a plain stream that reads an unborn dock as empty (E-GRV-0066's
  // "the knit unchanged on a growing region"), which is not a bijection
  reflect: boolean
}

export type GrowthScratch = { re: Float64Array; im: Float64Array }

export const growthScratch = (N: number): GrowthScratch => ({
  re: new Float64Array(N * MODES),
  im: new Float64Array(N * MODES),
})

// the largest weight any orbital holds on docks not yet born at `time` (0 when the frontier holds)
export function unbornWeight(
  orbitals: readonly Orbital[],
  birth: Int32Array,
  time: number,
): number {
  let worst = 0

  for (const o of orbitals) {
    let w = 0

    for (let x = 0; x < birth.length; x++) {
      if (birth[x]! <= time) {
        continue
      }

      for (let k = x * MODES; k < (x + 1) * MODES; k++) {
        w += o.re[k]! ** 2 + o.im[k]! ** 2
      }
    }

    worst = Math.max(worst, w)
  }

  return worst
}

// one beat on every orbital, in place: the piece at every born dock, then the stream with the frontier
export function growthBeat(
  g: GrowthBeat,
  orbitals: readonly Orbital[],
  s: GrowthScratch,
): void {
  const N = g.birth.length
  const [wr0, wi] = g.w
  const wr = wr0 - 1
  const cr = new Float64Array(REG)
  const ci = new Float64Array(REG)
  const vr = new Float64Array(MODES)
  const vi = new Float64Array(MODES)

  for (const o of orbitals) {
    // the piece and the coin, dock by dock, into the scratch
    for (let x = 0; x < N; x++) {
      const base = x * MODES

      if (g.birth[x]! > g.time) {
        s.re.fill(0, base, base + MODES)
        s.im.fill(0, base, base + MODES)
        continue
      }

      cr.fill(0)
      ci.fill(0)

      for (let m = 0; m < MODES; m++) {
        const xr = o.re[base + m]!
        const xi = o.im[base + m]!

        if (xr === 0 && xi === 0) {
          continue
        }

        for (let eta = 0; eta < REG; eta++) {
          const e = g.E[m * REG + eta]!

          if (e !== 0) {
            cr[eta]! += e * xr
            ci[eta]! += e * xi
          }
        }
      }

      for (let m = 0; m < MODES; m++) {
        let pr = 0
        let pi = 0

        for (let eta = 0; eta < REG; eta++) {
          const e = g.E[m * REG + eta]!

          if (e !== 0) {
            pr += e * cr[eta]!
            pi += e * ci[eta]!
          }
        }

        // v' = v + (w - 1) Q v
        vr[m] = o.re[base + m]! + wr * pr - wi * pi
        vi[m] = o.im[base + m]! + wr * pi + wi * pr
      }

      // the swap coin: slot d takes its opposite's register
      for (let d = 0; d < SLOTS; d++) {
        const from = OPPOSITE[d]! * REG

        for (let a = 0; a < REG; a++) {
          s.re[base + d * REG + a] = vr[from + a]!
          s.im[base + d * REG + a] = vi[from + a]!
        }
      }
    }

    // the stream: slot d at y takes slot d of y - r_d, or, when that dock is unborn, the reflecting frontier's own
    // opposite slot (the control reads the unborn dock as empty)
    for (let y = 0; y < N; y++) {
      const base = y * MODES

      if (g.birth[y]! > g.time) {
        o.re.fill(0, base, base + MODES)
        o.im.fill(0, base, base + MODES)
        continue
      }

      for (let d = 0; d < SLOTS; d++) {
        const src = g.nb[y * SLOTS + OPPOSITE[d]!]!
        const born = g.birth[src]! <= g.time
        const from = born
          ? src * MODES + d * REG
          : g.reflect
            ? base + OPPOSITE[d]! * REG
            : -1

        for (let a = 0; a < REG; a++) {
          o.re[base + d * REG + a] = from < 0 ? 0 : s.re[from + a]!
          o.im[base + d * REG + a] = from < 0 ? 0 : s.im[from + a]!
        }
      }
    }
  }
}

// ---- the readers ----

// <a|b> over the whole region
export function orbitalInner(a: Orbital, b: Orbital): [number, number] {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

// the largest |<a|b> - delta_ab| over the orbitals: they stay orthonormal under a unitary rule
export function gramGap(orbitals: readonly Orbital[]): number {
  let worst = 0

  orbitals.forEach((a, i) => {
    for (let j = i; j < orbitals.length; j++) {
      const [r, m] = orbitalInner(a, orbitals[j]!)

      worst = Math.max(worst, Math.hypot(r - (i === j ? 1 : 0), m))
    }
  })

  return worst
}

// the total weight of the orbitals (the number of minority particles, for orthonormal orbitals)
export function orbitalWeight(orbitals: readonly Orbital[]): number {
  let w = 0

  for (const o of orbitals) {
    for (let k = 0; k < o.re.length; k++) {
      w += o.re[k]! ** 2 + o.im[k]! ** 2
    }
  }

  return w
}

// the orbitals' weight on one dock
export function dockWeight(orbitals: readonly Orbital[], x: number): number {
  let w = 0

  for (const o of orbitals) {
    for (let k = x * MODES; k < (x + 1) * MODES; k++) {
      w += o.re[k]! ** 2 + o.im[k]! ** 2
    }
  }

  return w
}

// the minority weight in a sector, sum over docks and orbitals of |E^T phi(x)|^2
export function sectorCount(
  orbitals: readonly Orbital[],
  E: Float64Array,
): number {
  let n = 0

  for (const o of orbitals) {
    const N = o.re.length / MODES

    for (let x = 0; x < N; x++) {
      const base = x * MODES

      for (let eta = 0; eta < REG; eta++) {
        let r = 0
        let i = 0

        for (let m = 0; m < MODES; m++) {
          const e = E[m * REG + eta]!

          if (e !== 0) {
            r += e * o.re[base + m]!
            i += e * o.im[base + m]!
          }
        }

        n += r * r + i * i
      }
    }
  }

  return n
}

// SU(2)+ on one register: T_k = (i / 2) A_k P+, as re and im 8 x 8 (the real part is 0: A_k P+ is real)
export type Isospin = { im: number[][][] }

export function isospinGenerators(
  units: readonly (readonly (readonly number[])[])[],
  J: readonly (readonly number[])[],
): Isospin {
  const Pp = J.map((row, i) => row.map((x, j) => ((i === j ? 1 : 0) + x) / 2))

  return {
    im: units.map(A =>
      A.map(row =>
        Array.from({ length: REG }, (_, j) =>
          row.reduce((s, x, k) => s + (x * Pp[k]![j]!) / 2, 0),
        ),
      ),
    ),
  }
}

// T_k applied to an orbital, slot by slot: (i / 2) A_k P+ phi, so re' = -(G phi_im), im' = G phi_re with G = A_k P+ / 2
function applyIsospin(G: readonly (readonly number[])[], o: Orbital): Orbital {
  const out = { re: new Float64Array(o.re.length), im: new Float64Array(o.im.length) }

  for (let base = 0; base < o.re.length; base += REG) {
    for (let a = 0; a < REG; a++) {
      let r = 0
      let i = 0

      for (let b = 0; b < REG; b++) {
        const g = G[a]![b]!

        if (g !== 0) {
          r += g * o.re[base + b]!
          i += g * o.im[base + b]!
        }
      }

      out.re[base + a] = -i
      out.im[base + a] = r
    }
  }

  return out
}

export type IsospinReading = {
  // <T_k> of the state, k = 1, 2, 3
  mean: number[]
  // the total Casimir <T^2>
  casimir: number
}

// <T_k> and <T^2> of a Slater state from its orthonormal minority orbitals. `holes`: the orbitals are holes of the full
// sea (every generator is traceless, so <T_k> = -tr(H T_k)); otherwise members on the empty mesh (<T_k> = tr(rho T_k)).
// Either way <T^2> = sum_k <T_k>^2 + tr(H T_k^2) - tr(H T_k H T_k), with T_k^2 = P+ / 4
export function isospinRead(
  orbitals: readonly Orbital[],
  T: Isospin,
  holes: boolean,
): IsospinReading {
  const n = orbitals.length
  const mean: number[] = []

  let casimir = 0

  for (const G of T.im) {
    const images = orbitals.map(o => applyIsospin(G, o))

    let trace = 0
    let square = 0

    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        const [r, i] = orbitalInner(orbitals[a]!, images[b]!)

        if (a === b) {
          trace += r
        }

        square += r * r + i * i
      }
    }

    // tr(H T_k^2) = sum_a <phi_a|T_k^2|phi_a> = sum_a |T_k phi_a|^2
    let t2 = 0

    for (const im of images) {
      for (let k = 0; k < im.re.length; k++) {
        t2 += im.re[k]! ** 2 + im.im[k]! ** 2
      }
    }

    const m = holes ? -trace : trace

    mean.push(m)
    casimir += m * m + t2 - square
  }

  return { mean, casimir }
}

// the part of each orbital outside the span of a set, summed: sum_a |v_a - sum_b <phi_b|v_a> phi_b|^2, phi orthonormal
export function spanResidual(
  span: readonly Orbital[],
  images: readonly Orbital[],
): number {
  let total = 0

  for (const v of images) {
    const w = copyOrbital(v)

    for (let pass = 0; pass < 2; pass++) {
      for (const p of span) {
        const [r, i] = orbitalInner(p, w)

        for (let k = 0; k < w.re.length; k++) {
          w.re[k]! -= r * p.re[k]! - i * p.im[k]!
          w.im[k]! -= r * p.im[k]! + i * p.re[k]!
        }
      }
    }

    total += orbitalWeight([w])
  }

  return total
}

// ---- the band read through E-FND-0161's frame ----

export type BandReading = {
  // the minority weight in all states, in the moving span W(q), in its positive-phase band, and in the flats
  total: number
  moving: number
  up: number
  flat: number
}

// read at a cycle boundary (the frame's W is beat 1's): each orbital's 192 components Fourier transformed over the torus,
// the moving part W(q)^dag c(q) and its band weight a^dag P_up a
export function bandRead(
  fr: HoleFrame,
  orbitals: readonly Orbital[],
): BandReading {
  const N = fr.fourier.N
  const f = fr.fiber
  const scratch = lineScratch(fr.fourier)
  const xr = new Float64Array(N)
  const xi = new Float64Array(N)
  const cr = new Float64Array(N * MODES)
  const ci = new Float64Array(N * MODES)

  let total = 0
  let moving = 0
  let up = 0

  for (const o of orbitals) {
    for (let m = 0; m < MODES; m++) {
      for (let x = 0; x < N; x++) {
        xr[x] = o.re[x * MODES + m]!
        xi[x] = o.im[x * MODES + m]!
      }

      toClasses(fr.fourier, xr, xi, scratch)

      for (let j = 0; j < N; j++) {
        cr[j * MODES + m] = xr[j]!
        ci[j * MODES + m] = xi[j]!
      }
    }

    for (let j = 0; j < N; j++) {
      const W = fr.W[j]!
      const ar = new Float64Array(f)
      const ai = new Float64Array(f)

      for (let m = 0; m < MODES; m++) {
        const yr = cr[j * MODES + m]!
        const yi = ci[j * MODES + m]!

        total += yr * yr + yi * yi

        for (let b = 0; b < f; b++) {
          // conj(W[m][b]) c[m]
          const wr = W.re[m * f + b]!
          const wi = W.im[m * f + b]!

          ar[b]! += wr * yr + wi * yi
          ai[b]! += wr * yi - wi * yr
        }
      }

      const P = fr.up[j]!

      for (let b = 0; b < f; b++) {
        moving += ar[b]! ** 2 + ai[b]! ** 2

        for (let c = 0; c < f; c++) {
          // conj(a_b) P[b][c] a_c
          const pr = P.re[b * f + c]!
          const pi = P.im[b * f + c]!
          const tr = pr * ar[c]! - pi * ai[c]!
          const ti = pr * ai[c]! + pi * ar[c]!

          up += ar[b]! * tr + ai[b]! * ti
        }
      }
    }
  }

  return { total, moving, up, flat: total - moving }
}

// a plane wave at momentum class j: phi(x) = e^(i q . x) v / sqrt N, v a 192-vector
export function planeWave(t: Torus, j: number, v: Orbital): Orbital {
  const N = t.sites.length
  const o = newOrbital(N)
  const q = t.momenta[j]!
  const k = 1 / Math.sqrt(N)

  t.sites.forEach((p, x) => {
    const ph = q.reduce((s, qq, i) => s + qq * p[i]!, 0)
    const c = Math.cos(ph) * k
    const sn = Math.sin(ph) * k

    for (let m = 0; m < MODES; m++) {
      const vr = v.re[m]!
      const vi = v.im[m]!

      o.re[x * MODES + m] = c * vr - sn * vi
      o.im[x * MODES + m] = c * vi + sn * vr
    }
  })

  return o
}

// ---- the dock-local commutant ----

export type Commutant = {
  // the real dimension of { M : [1 (x) M, Q] = 0 for every Q }
  dimension: number
  // Gram-Schmidt's smallest accepted and largest rejected residual (a clean rank has a wide gap)
  accepted: number
  rejected: number
}

// the commutators [1 (x) E_ab, Q] of the 64 register units with every projector Q (192 x 192, real, any scale), their
// rank by Gram-Schmidt, and the commutant's dimension 64 - rank
export function registerCommutant(Qs: readonly Float64Array[]): Commutant {
  const cols: Float64Array[] = []

  for (let a = 0; a < REG; a++) {
    for (let b = 0; b < REG; b++) {
      const v = new Float64Array(Qs.length * MODES * MODES)

      Qs.forEach((Q, k) => {
        const off = k * MODES * MODES

        // (1 (x) E_ab) Q: row (d, a) takes row (d, b) of Q; Q (1 (x) E_ab): column (e, b) takes column (e, a) of Q
        for (let d = 0; d < SLOTS; d++) {
          for (let col = 0; col < MODES; col++) {
            v[off + (d * REG + a) * MODES + col]! += Q[(d * REG + b) * MODES + col]!
          }
        }

        for (let row = 0; row < MODES; row++) {
          for (let e = 0; e < SLOTS; e++) {
            v[off + row * MODES + e * REG + b]! -= Q[row * MODES + e * REG + a]!
          }
        }
      })

      cols.push(v)
    }
  }

  const basis: Float64Array[] = []
  const dotR = (x: Float64Array, y: Float64Array): number => {
    let s = 0

    for (let k = 0; k < x.length; k++) {
      s += x[k]! * y[k]!
    }

    return s
  }

  let accepted = Infinity
  let rejected = 0

  for (const c of cols) {
    const w = Float64Array.from(c)
    const scale = Math.sqrt(dotR(c, c))

    for (let pass = 0; pass < 2; pass++) {
      for (const e of basis) {
        const s = dotR(e, w)

        for (let k = 0; k < w.length; k++) {
          w[k]! -= s * e[k]!
        }
      }
    }

    const r = Math.sqrt(dotR(w, w))
    // the residual relative to the column's own size (a zero column is rejected with residual 0)
    const rel = scale === 0 ? 0 : r / scale

    if (rel > 1e-6) {
      accepted = Math.min(accepted, rel)
      basis.push(w.map(x => x / r))
    } else {
      rejected = Math.max(rejected, rel)
    }
  }

  return { dimension: REG * REG - basis.length, accepted, rejected }
}

// the commutator gap of 1 (x) M with a 192 x 192 real Q: max |[1 (x) M, Q]| (M 8 x 8, any real entries)
export function registerCommutatorGap(
  M: readonly (readonly number[])[],
  Q: Float64Array,
): number {
  let worst = 0

  for (let row = 0; row < MODES; row++) {
    const d = Math.floor(row / REG)
    const a = row % REG

    for (let col = 0; col < MODES; col++) {
      const e = Math.floor(col / REG)
      const b = col % REG

      let left = 0
      let right = 0

      for (let c = 0; c < REG; c++) {
        left += M[a]![c]! * Q[(d * REG + c) * MODES + col]!
        right += Q[row * MODES + e * REG + c]! * M[c]![b]!
      }

      worst = Math.max(worst, Math.abs(left - right))
    }
  }

  return worst
}
