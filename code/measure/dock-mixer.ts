// THE DOCK-WIDE PAULI-BLOCKED MIXER (E-SPN-0140). note/project/vibe/roadmap/research/remaining-pieces.md, "Gravity's sign and
// the mixer's cone": E-SPN-0130's fermionic mixer acts on one frame (8 slots), so a hole moves only among its frame's
// four lines, and E-SPN-0136 found its group velocity confined to that frame's cross-polytope (0.5 c along other
// frames' roots). The fix proposed there: mix all 24 slots of a dock. On a love sea every dock is full, so a fermionic
// mixer over the whole dock is still exactly blocked on the vacuum.
//
// THE PIECE, on one dock (24 slots, the knit's mode order code/rule/coined-locked-knit modeIndex):
//     M = exp(i theta N_U),   N_U = c_U^dag c_U = (1/24) sum_(i, j in the dock) c_i^dag c_j,
// the second-quantized lift of the one-vibe m = I + (e^(i theta) - 1) J / 24. N_U takes the values 0 and 1, so
// M = 1 + (e^(i theta) - 1) N_U: on a dock of n vibes of one content it keeps with 1 + (e^(i theta) - 1) n / 24 or takes
// ONE vibe to one empty slot with (e^(i theta) - 1) / 24 times the fermion sign of the hop (hopSign). A full dock takes
// det m = e^(i theta), an empty one 1: PAULI BLOCKED. m is covariant under every permutation of the 24 slots, so under
// W(F4). At theta = 2 pi / 3 the hop is (w - 1) / 24, and (w - 1) / 3 is not in Z[w][1/2] (3 = -w^2 (1 - w)^2), so the
// piece needs 1/3: it is exact in Z[w][1/6], not in the rule's ring (E-SPN-0094: no W(F4)-covariant unitary in Z[w][1/2]
// reaches a slot at inner product +-1). Exact branches are kept in Z[w][1/2] by carrying a global 3 per dock per beat
// (`scale3`): 3 M has keep (24 + n (w - 1)) / 8 and hop (w - 1) / 8, and a full dock 3 w.
//
// THE LONE HOLE. In the hole basis |h> = the full dock minus slot h (the configuration, no sign), Gamma(m) acts as
// det(m) Z conj(m) Z, Z_h = (-1)^(modeIndex h) (+1 on a line's first slot, -1 on its second): the hole's own mixer phases
// the STAGGERED vector z, which is antisymmetric on every line. The coin on the hole's line is C itself (the vibe
// crosses into the hole), and each of the eleven full lines gives det C = zeta. So a hole's dock matrix is
//     P_hole = zeta^11 C_n e^(i theta) (I + (e^(-i theta) - 1) z z^T / 24),   P_vibe = C_n m,
// and ruleDockMatrix reads it from the rule (dockMixBranch then coinBranch) to check the float form.
//
// DETERMINISM: no random numbers; a keyed path's choice is the key's integer. EXACT: the Fock checks and the walk are
// Eisenstein integers; the band is floats, as measurement. NOTHING MOVES: a hop hands a vibe's value, point and open bit
// to an empty slot of its own dock; the stream takes it one dock along.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { rootsD4 as systemRootsD4 } from '@/code/algebra/group/root-system'
import {
  complexEigenvalues,
  complexEigenvector,
} from '@/code/algebra/linear/complex-eigen'
import {
  coinBranch,
  hopSign,
  LINE_SECONDS,
  modeIndex,
} from '@/code/rule/coined-locked-knit'
import {
  cloneConfiguration,
  times,
  type Branch,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import { LINE_FIRSTS } from '@/code/rule/isometric-knit'
import {
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { starBeat, type KEvent } from '@/code/measure/hub-star'
import {
  newFermionTally,
  type FermionTally,
} from '@/code/measure/pauli-mixer'
import { symmetricEigen } from '@/code/measure/line-class-metric'
import {
  d4BoxCell,
  d4BoxCoordinates,
  d4Coordinates,
} from '@/code/substrate/d4-box-integer'

const ROOTS = rootsD4()

// the 24 roots, slot order (slot d streams one dock along ROOTS[d])
export const DOCK_ROOTS: readonly (readonly number[])[] = ROOTS

// the two root tables in the code agree slot for slot
export const rootTablesAgree = (): boolean =>
  systemRootsD4().every((r, d) => r.every((x, k) => x === ROOTS[d]![k]))

// z_d = (-1)^(modeIndex d): +1 on a line's first slot, -1 on its second
export const MODE_SIGN: readonly number[] = Array.from(
  { length: 24 },
  (_, d) => (modeIndex(d) % 2 === 0 ? 1 : -1),
)

// ---- the dock's occupation ----

export type DockHold = {
  held: number
  mask: number
  oneContent: boolean
}

// the slots of dock x that hold a vibe (a bit mask), and whether they carry one content (value and point), all open
export function dockHold(c: Configuration, x: number): DockHold {
  let held = 0
  let mask = 0
  let oneContent = true
  let first = -1

  for (let d = 0; d < 24; d++) {
    const i = x * 24 + d

    if (c.vibe[i] === 0) {
      continue
    }

    held++
    mask |= 1 << d

    if (!c.open[i]) {
      oneContent = false
    }

    if (first < 0) {
      first = i
    } else if (
      c.vibe[i] !== c.vibe[first] ||
      c.point[i] !== c.point[first]
    ) {
      oneContent = false
    }
  }

  return { held, mask, oneContent }
}

const cloneBr = (b: Branch): Branch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
})

function hop(b: Configuration, from: number, to: number): void {
  b.vibe[to] = b.vibe[from]!
  b.point[to] = b.point[from]!
  b.open[to] = b.open[from]!
  b.vibe[from] = 0
  b.point[from] = 0
  b.open[from] = 0
}

// M at theta = 2 pi / 3 (or its adjoint) on one branch, every dock: a full dock takes w (adjoint w^2), an empty dock or
// one of two contents is left alone, a dock of one content and 1 to 23 vibes keeps (24 + n (w - 1)) / 24 or hops one
// vibe with (w - 1) / 24 times the hop's sign. That needs 1/3: with `scale3` every dock's piece is multiplied by 3 (a
// global 3^cells per call, the same on every branch), so the amplitudes stay in Z[w][1/2]; without it a partial dock
// of one content throws
export function dockMixBranch(
  cells: number,
  br: Branch,
  adjoint: boolean,
  scale3: boolean,
  guard = 1 << 16,
): Branch[] {
  const [hu, hv] = adjoint ? [-2n, -1n] : [-1n, 1n]
  const [pu, pv] = adjoint ? [-1n, -1n] : [0n, 1n]

  let branches: Branch[] = [br]

  for (let x = 0; x < cells; x++) {
    const next: Branch[] = []

    for (const b of branches) {
      const h = dockHold(b, x)
      const n = h.held

      if (n === 24) {
        times(b, pu, pv)

        if (scale3) {
          times(b, 3n, 0n)
        }

        next.push(b)
        continue
      }

      if (n === 0 || !h.oneContent) {
        if (scale3) {
          times(b, 3n, 0n)
        }

        next.push(b)
        continue
      }

      if (!scale3) {
        throw new Error(
          `dock-mixer: a partial dock of one content (${n} vibes) needs 1/3, outside Z[w][1/2]`,
        )
      }

      const N = BigInt(n)
      const keep = cloneBr(b)

      times(keep, 24n + N * hu, N * hv)
      keep.k += 3
      next.push(keep)

      for (let from = 0; from < 24; from++) {
        if (!((h.mask >> from) & 1)) {
          continue
        }

        for (let to = 0; to < 24; to++) {
          if ((h.mask >> to) & 1) {
            continue
          }

          const k = cloneBr(b)
          const sign = BigInt(
            hopSign(k, x * 24, x * 24 + from, x * 24 + to),
          )

          hop(k, x * 24 + from, x * 24 + to)
          times(k, sign * hu, sign * hv)
          k.k += 3
          next.push(k)
        }
      }
    }

    branches = next

    if (branches.length > guard) {
      throw new Error(
        `dock-mixer: ${branches.length} branches, over the guard ${guard}`,
      )
    }
  }

  return branches
}

// ---- the exact Fock checks, one dock ----

export type EisN = [number, number]

const nMul = (x: EisN, y: EisN): EisN => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]

const popcount = (m: number): number => {
  let c = 0

  for (let v = m; v; v &= v - 1) {
    c++
  }

  return c
}

// the masks of the 24 slots holding exactly n vibes
export function sectorStates(n: number): number[] {
  const out: number[] = []

  const build = (from: number, left: number, mask: number): void => {
    if (left === 0) {
      out.push(mask)

      return
    }

    for (let d = from; d <= 24 - left; d++) {
      build(d + 1, left - 1, mask | (1 << d))
    }
  }

  build(0, n, 0)

  return out
}

// the columns of 24 M (numerators over 24) on the n-vibe sector: source index -> [target index, amplitude]; `signed`
// false drops the fermion sign (the control), `adjoint` conjugates every entry
export function dockFockColumns(
  n: number,
  signed: boolean,
  adjoint: boolean,
): { states: number[]; columns: [number, EisN][][] } {
  const states = sectorStates(n)
  const index = new Map<number, number>(states.map((s, i) => [s, i]))
  const h: EisN = adjoint ? [-2, -1] : [-1, 1]
  const scratch: Configuration = {
    vibe: new Int8Array(24),
    point: new Int8Array(24),
    open: new Uint8Array(24),
    store: new Int8Array(12),
    spoint: new Int8Array(12),
    sopen: new Uint8Array(12),
  }
  const columns: [number, EisN][][] = []

  for (const s of states) {
    const col: [number, EisN][] = [
      [index.get(s)!, [24 + n * h[0], n * h[1]]],
    ]

    for (let d = 0; d < 24; d++) {
      scratch.vibe[d] = (s >> d) & 1
    }

    for (let from = 0; from < 24; from++) {
      if (!((s >> from) & 1)) {
        continue
      }

      for (let to = 0; to < 24; to++) {
        if ((s >> to) & 1) {
          continue
        }

        const sign = signed ? hopSign(scratch, 0, from, to) : 1

        col.push([
          index.get((s & ~(1 << from)) | (1 << to))!,
          [sign * h[0], sign * h[1]],
        ])
      }
    }

    columns.push(col)
  }

  return { states, columns }
}

// the entries of A B off 576 I (A the adjoint piece, B the piece, both over 24): 0 means B is unitary and A its inverse
export function composeOff(
  a: [number, EisN][][],
  b: [number, EisN][][],
): number {
  let off = 0

  b.forEach((col, s) => {
    const sum = new Map<number, EisN>()

    for (const [m, y] of col) {
      for (const [t, x] of a[m]!) {
        const z = nMul(x, y)
        const o = sum.get(t) ?? [0, 0]

        sum.set(t, [o[0] + z[0], o[1] + z[1]])
      }
    }

    if (!sum.has(s)) {
      off++
    }

    for (const [t, z] of sum) {
      if (z[0] !== (t === s ? 576 : 0) || z[1] !== 0) {
        off++
      }
    }
  })

  return off
}

// the entries where B is not symmetric (B[t][s] against B[s][t]); 0 means the adjoint piece is B's conjugate transpose
export function asymmetry(b: [number, EisN][][]): number {
  const at = b.map(
    col => new Map<number, EisN>(col.map(([t, x]) => [t, x])),
  )

  let off = 0

  at.forEach((col, s) => {
    for (const [t, x] of col) {
      const y = at[t]!.get(s)

      if (y?.[0] !== x[0] || y[1] !== x[1]) {
        off++
      }
    }
  })

  return off
}

// ---- the rule's own dock matrix of a lone excitation ----

export type EisB = [bigint, bigint]

// P[to][from], numerators over 48: dockMixBranch (scaled, so 3 M) then coinBranch on one dock, for a lone hole in an
// otherwise full love dock or a lone love on an empty dock; the full lines' determinants are read in
export function ruleDockMatrix(hole: boolean): EisB[][] {
  const P: EisB[][] = Array.from({ length: 24 }, () =>
    Array.from({ length: 24 }, (): EisB => [0n, 0n]),
  )

  for (let q = 0; q < 24; q++) {
    const br: Branch = {
      vibe: new Int8Array(24),
      point: new Int8Array(24),
      open: new Uint8Array(24),
      store: new Int8Array(12),
      spoint: new Int8Array(12),
      sopen: new Uint8Array(12),
      a: 1n,
      b: 0n,
      k: 0,
    }

    if (hole) {
      br.vibe.fill(1)
      br.open.fill(1)
    }

    br.vibe[q] = hole ? 0 : 1
    br.open[q] = hole ? 0 : 1

    for (const o of dockMixBranch(1, br, false, true).flatMap(b =>
      coinBranch(1, b, false),
    )) {
      const at = Array.from({ length: 24 }, (_, d) => d).filter(
        d => (o.vibe[d] !== 0) !== hole,
      )

      if (at.length !== 1) {
        throw new Error(
          `dock-mixer: a branch left the one-excitation sector (${at.length})`,
        )
      }

      if (o.k > 4) {
        throw new Error(`dock-mixer: a branch over 2^${o.k}`)
      }

      const scale = 1n << BigInt(4 - o.k)
      const r = at[0]!
      const old = P[r]![q]!

      P[r]![q] = [old[0] + o.a * scale, old[1] + o.b * scale]
    }
  }

  return P
}

// ---- the float dock matrix for any theta and fine coin n ----

export type CMatrix = { re: Float64Array; im: Float64Array }

function cmul(a: CMatrix, b: CMatrix, n: number): CMatrix {
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const ar = a.re[i * n + k]!
      const ai = a.im[i * n + k]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        const br = b.re[k * n + j]!
        const bi = b.im[k * n + j]!

        re[i * n + j]! += ar * br - ai * bi
        im[i * n + j]! += ar * bi + ai * br
      }
    }
  }

  return { re, im }
}

// the coin C_n on every line of one dock, zeta = e^(2 pi i / (3 n)): keep (1 + zeta) / 2, cross (1 - zeta) / 2
export function dockCoin(n: number): CMatrix {
  const z = [
    Math.cos((2 * Math.PI) / (3 * n)),
    Math.sin((2 * Math.PI) / (3 * n)),
  ] as const
  const re = new Float64Array(576)
  const im = new Float64Array(576)

  for (let l = 0; l < 12; l++) {
    const a = LINE_FIRSTS[l]!
    const b = LINE_SECONDS[l]!

    for (const [i, j] of [
      [a, a],
      [b, b],
    ] as const) {
      re[i * 24 + j] = (1 + z[0]) / 2
      im[i * 24 + j] = z[1] / 2
    }

    for (const [i, j] of [
      [a, b],
      [b, a],
    ] as const) {
      re[i * 24 + j] = (1 - z[0]) / 2
      im[i * 24 + j] = -z[1] / 2
    }
  }

  return { re, im }
}

// the one-body mixer: a vibe's m = I + (e^(i theta) - 1) J / 24, a hole's e^(i theta) (I + (e^(-i theta) - 1) z z^T / 24)
export function dockMixMatrix(theta: number, hole: boolean): CMatrix {
  const re = new Float64Array(576)
  const im = new Float64Array(576)
  const c = Math.cos(theta)
  const s = Math.sin(theta)

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 24; j++) {
      const d = i === j ? 1 : 0

      if (!hole) {
        re[i * 24 + j] = d + (c - 1) / 24
        im[i * 24 + j] = s / 24
        continue
      }

      const zz = MODE_SIGN[i]! * MODE_SIGN[j]!

      // e^(i theta) d + (1 - e^(i theta)) zz / 24
      re[i * 24 + j] = c * d + ((1 - c) * zz) / 24
      im[i * 24 + j] = s * d - (s * zz) / 24
    }
  }

  return { re, im }
}

// P = C_n m (a vibe) or zeta^11 C_n (the hole's mixer) (a hole), row-major P[to * 24 + from]
export function dockMatrix(
  theta: number,
  n: number,
  hole: boolean,
): CMatrix {
  const p = cmul(dockCoin(n), dockMixMatrix(theta, hole), 24)

  if (!hole) {
    return p
  }

  const ph = (11 * 2 * Math.PI) / (3 * n)
  const c = Math.cos(ph)
  const s = Math.sin(ph)

  return {
    re: p.re.map((x, i) => c * x - s * p.im[i]!),
    im: p.im.map((y, i) => c * y + s * p.re[i]!),
  }
}

// the largest entry gap between the rule's exact matrix (over `over`) and a float one, and the Eisenstein unit it is
// read up to (index into UNITS_B, -1 when none fits to 1e-9)
export const UNITS_B: readonly EisB[] = [
  [1n, 0n],
  [0n, 1n],
  [-1n, -1n],
  [-1n, 0n],
  [0n, -1n],
  [1n, 1n],
]

export function exactGap(
  exact: EisB[][],
  m: CMatrix,
  over: number,
): number {
  const wi = Math.sqrt(3) / 2
  const n = exact.length

  let gap = 0

  for (let r = 0; r < n; r++) {
    for (let q = 0; q < n; q++) {
      const [a, b] = exact[r]![q]!
      const x = (Number(a) - Number(b) / 2) / over
      const y = (Number(b) * wi) / over

      gap = Math.max(
        gap,
        Math.hypot(x - m.re[r * n + q]!, y - m.im[r * n + q]!),
      )
    }
  }

  return gap
}

// ---- the band ----

// U(K) = S(K) P, S = diag(e^(-i K . r_d)), for P of size roots.length
export function blochMatrix(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  K: readonly number[],
): CMatrix {
  const n = roots.length
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let r = 0; r < n; r++) {
    const ph = -roots[r]!.reduce((s, x, k) => s + x * K[k]!, 0)
    const c = Math.cos(ph)
    const s = Math.sin(ph)

    for (let q = 0; q < n; q++) {
      const a = P.re[r * n + q]!
      const b = P.im[r * n + q]!

      re[r * n + q] = c * a - s * b
      im[r * n + q] = c * b + s * a
    }
  }

  return { re, im }
}

export const eigenphases = (
  P: CMatrix,
  roots: readonly (readonly number[])[],
  K: readonly number[],
): number[] => {
  const u = blochMatrix(P, roots, K)
  const e = complexEigenvalues({ re: u.re, im: u.im, n: roots.length })

  return e.re.map((x, i) => Math.atan2(e.im[i]!, x))
}

// the eigenphases of U(K) and each eigenvector's group velocity dE/dK = sum_q |psi_q|^2 r_q (Hellmann-Feynman, E = -phase)
export function bandAt(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  K: readonly number[],
): { phase: number[]; velocity: number[][] } {
  const n = roots.length
  const u = blochMatrix(P, roots, K)
  const e = complexEigenvalues({ re: u.re, im: u.im, n })
  const phase: number[] = []
  const velocity: number[][] = []

  e.re.forEach((x, i) => {
    const y = e.im[i]!
    const psi = complexEigenvector({
      re: u.re,
      im: u.im,
      n,
      value: [x, y],
    })
    const v = [0, 0, 0, 0]

    for (let q = 0; q < n; q++) {
      const w = psi.re[q]! ** 2 + psi.im[q]! ** 2

      for (let k = 0; k < 4; k++) {
        v[k]! += w * roots[q]![k]!
      }
    }

    phase.push(Math.atan2(y, x))
    velocity.push(v)
  })

  return { phase, velocity }
}

// bandAt with each eigenvector's slot weights |psi_q|^2 as well (the velocity is sum_q weight_q r_q)
export function bandSlots(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  K: readonly number[],
): { phase: number[]; velocity: number[][]; weight: Float64Array[] } {
  const n = roots.length
  const u = blochMatrix(P, roots, K)
  const e = complexEigenvalues({ re: u.re, im: u.im, n })
  const phase: number[] = []
  const velocity: number[][] = []
  const weight: Float64Array[] = []

  e.re.forEach((x, i) => {
    const y = e.im[i]!
    const psi = complexEigenvector({
      re: u.re,
      im: u.im,
      n,
      value: [x, y],
    })
    const w = new Float64Array(n)
    const v = [0, 0, 0, 0]

    for (let q = 0; q < n; q++) {
      w[q] = psi.re[q]! ** 2 + psi.im[q]! ** 2

      for (let k = 0; k < 4; k++) {
        v[k]! += w[q]! * roots[q]![k]!
      }
    }

    phase.push(Math.atan2(y, x))
    velocity.push(v)
    weight.push(w)
  })

  return { phase, velocity, weight }
}

export const wrap = (x: number): number =>
  Math.atan2(Math.sin(x), Math.cos(x))

const dot = (a: readonly number[], b: readonly number[]): number =>
  a.reduce((s, x, k) => s + x * b[k]!, 0)

// the Hellmann-Feynman u . v against a central difference of the eigenphases along u, matched by phase: the largest gap
export function velocityGap(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  K: readonly number[],
  u: readonly number[],
  h = 1e-5,
): number {
  const b = bandAt(P, roots, K)
  const plus = eigenphases(
    P,
    roots,
    K.map((x, k) => x + h * u[k]!),
  )
  const minus = eigenphases(
    P,
    roots,
    K.map((x, k) => x - h * u[k]!),
  )

  let gap = 0

  b.phase.forEach((p, i) => {
    const near = (list: number[]): number =>
      list.reduce(
        (m, x) =>
          Math.abs(wrap(x - p)) < Math.abs(wrap(m - p)) ? x : m,
        list[0]!,
      )
    const fd = -wrap(near(plus) - near(minus)) / (2 * h)

    gap = Math.max(gap, Math.abs(fd - dot(u, b.velocity[i]!)))
  })

  return gap
}

// the top group speed along u over c = sqrt 2 at K = kappa u: max over bands of u . v / sqrt 2; and the root mean
// square of u . v / sqrt 2 over the bands, leaving out the `skip` band nearest phase `skipPhase` (the mixer's own mode)
export function speedsAt(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  u: readonly number[],
  kappa: number,
  skipPhase?: number,
): { top: number; rms: number } {
  const b = bandAt(
    P,
    roots,
    u.map(x => x * kappa),
  )
  const along = b.velocity.map(v => dot(u, v) / Math.SQRT2)

  let skip = -1

  if (skipPhase !== undefined) {
    skip = b.phase.reduce(
      (m, p, i) =>
        Math.abs(wrap(p - skipPhase)) <
        Math.abs(wrap(b.phase[m]! - skipPhase))
          ? i
          : m,
      0,
    )
  }

  const kept = along.filter((_, i) => i !== skip)

  return {
    top: Math.max(...along),
    rms: Math.sqrt(kept.reduce((s, x) => s + x * x, 0) / kept.length),
  }
}

// THE DERIVED MASSLESS SPEEDS: as the coin's mass goes to 0 the dock matrix tends to the mixer alone, whose 23 modes
// off its own sit at one phase; to first order in K the group velocity along u is an eigenvalue of Q D Q, D = diag(u . r_d),
// Q the projector off the uniform vector. Returns its eigenvalues over sqrt 2 (the top one, and the root mean square
// over the 23)
export function derivedMasslessSpeeds(u: readonly number[]): {
  top: number
  rms: number
} {
  const d = ROOTS.map(r => dot(u, r))
  const m = d.map((x, i) =>
    d.map(
      (y, j) =>
        (i === j ? x : 0) -
        x / 24 -
        y / 24 +
        d.reduce((s, z) => s + z, 0) / 576,
    ),
  )
  const e = symmetricEigen(m)
  const trace2 = m.reduce(
    (s, row, i) => s + row.reduce((t, x, j) => t + x * m[j]![i]!, 0),
    0,
  )

  return {
    top: Math.max(...e.values) / Math.SQRT2,
    rms: Math.sqrt(trace2 / 23) / Math.SQRT2,
  }
}

// ---- the multiplets at K = 0 and their bands ----

export type Multiplet = { center: number; size: number }

// the eigenphases of P at K = 0 grouped within `tol` (circular), each group's center its first member
export function multipletsOf(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  tol = 1e-9,
): Multiplet[] {
  const ph = eigenphases(P, roots, [0, 0, 0, 0]).sort((a, b) => a - b)
  const out: Multiplet[] = []

  for (const p of ph) {
    const m = out.find(g => Math.abs(wrap(p - g.center)) <= tol)

    if (m) {
      m.size++
    } else {
      out.push({ center: p, size: 1 })
    }
  }

  return out
}

// per multiplet, its members' phase offsets wrap(phase - center) at K, sorted; each eigenphase goes to its nearest
// center, and a count that does not match the multiplet's size throws
export function multipletPhases(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  K: readonly number[],
  ms: readonly Multiplet[],
): number[][] {
  const out: number[][] = ms.map(() => [])

  for (const p of eigenphases(P, roots, K)) {
    let best = 0

    ms.forEach((m, i) => {
      if (
        Math.abs(wrap(p - m.center)) <
        Math.abs(wrap(p - ms[best]!.center))
      ) {
        best = i
      }
    })
    out[best]!.push(wrap(p - ms[best]!.center))
  }

  out.forEach((list, i) => {
    if (list.length !== ms[i]!.size) {
      throw new Error(
        `dock-mixer: multiplet ${i} holds ${list.length} phases at K, ${ms[i]!.size} at 0`,
      )
    }

    list.sort((a, b) => a - b)
  })

  return out
}

const mean = (xs: readonly number[]): number =>
  xs.reduce((s, x) => s + x, 0) / xs.length

// each multiplet's mean curvature 2 f / kappa^2 along u (f its mean offset), Richardson over kappa and kappa / 2
export function meanCurvatures(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  ms: readonly Multiplet[],
  u: readonly number[],
  kappa: number,
): number[] {
  const at = (k: number): number[] =>
    multipletPhases(
      P,
      roots,
      u.map(x => x * k),
      ms,
    ).map(l => (2 * mean(l)) / (k * k))
  const a = at(kappa)
  const b = at(kappa / 2)

  return b.map((x, i) => (4 * x - a[i]!) / 3)
}

// each multiplet's 4 x 4 mean inverse mass tensor: A_ii along e_i, A_ij from (e_i + e_j) / sqrt 2
export function meanTensors(
  P: CMatrix,
  roots: readonly (readonly number[])[],
  ms: readonly Multiplet[],
  kappa: number,
): number[][][] {
  const e = (i: number): number[] =>
    [0, 1, 2, 3].map(k => (k === i ? 1 : 0))
  const diag = [0, 1, 2, 3].map(i =>
    meanCurvatures(P, roots, ms, e(i), kappa),
  )

  return ms.map((_, m) =>
    [0, 1, 2, 3].map(i =>
      [0, 1, 2, 3].map(j => {
        if (i === j) {
          return diag[i]![m]!
        }

        const u = [0, 1, 2, 3].map(k =>
          k === i || k === j ? Math.SQRT1_2 : 0,
        )

        return (
          meanCurvatures(P, roots, ms, u, kappa)[m]! -
          diag[i]![m]! / 2 -
          diag[j]![m]! / 2
        )
      }),
    ),
  )
}

// the isotropy defect of a 4 x 4 tensor: max |A - a I| / |a|, a its mean diagonal
export function tensorDefect(A: readonly (readonly number[])[]): {
  a: number
  defect: number
} {
  const a =
    [0, 1, 2, 3].reduce((s, i) => s + (A[i] as number[])[i]!, 0) / 4

  let off = 0

  A.forEach((row, i) =>
    row.forEach(
      (x, j) => (off = Math.max(off, Math.abs(x - (i === j ? a : 0)))),
    ),
  )

  return { a, defect: off / Math.abs(a) }
}

// the 24-cell's sixth moment along a unit u, sum_d (u . r_d)^6 / 16: 3/4 on an axis, 9/8 on a face diagonal, 11/12 on
// a body diagonal of the husk (E-SPN-0126's M_6)
export const sixthMoment = (u: readonly number[]): number =>
  ROOTS.reduce((s, r) => s + dot(u, r) ** 6, 0) / 16

// the cone bound along a unit u over c: max_d (r_d . u) / sqrt 2 (the 24-cell's support)
export const dockConeBound = (u: readonly number[]): number =>
  Math.max(...ROOTS.map(r => dot(r, u))) / Math.SQRT2

// ---- the exact walk of a lone excitation ----

const bMul = (x: EisB, y: EisB): EisB => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const bZero = (x: EisB): boolean => x[0] === 0n && x[1] === 0n

export const bNorm = (x: EisB): bigint =>
  x[0] * x[0] - x[0] * x[1] + x[1] * x[1]

export type WalkSite = { v: number[]; amp: EisB[] }

// the exact amplitude on the D4 lattice under U = S P from one slot at the origin, P's numerators given; `each` sees the
// sites after beat t (1-based)
export function exactDockWalk(
  P: EisB[][],
  roots: readonly (readonly number[])[],
  startSlot: number,
  beats: number,
  each: (t: number, sites: Map<string, WalkSite>) => void,
): void {
  const n = roots.length

  let sites = new Map<string, WalkSite>()

  const origin: EisB[] = Array.from({ length: n }, (): EisB => [0n, 0n])

  origin[startSlot] = [1n, 0n]
  sites.set('0,0,0,0', { v: [0, 0, 0, 0], amp: origin })

  for (let t = 1; t <= beats; t++) {
    const next = new Map<string, WalkSite>()

    for (const s of sites.values()) {
      const held = s.amp
        .map((a, q) => (bZero(a) ? -1 : q))
        .filter(q => q >= 0)

      for (let r = 0; r < n; r++) {
        let x: EisB = [0n, 0n]

        for (const q of held) {
          const p = P[r]![q]!

          if (!bZero(p)) {
            const z = bMul(p, s.amp[q]!)

            x = [x[0] + z[0], x[1] + z[1]]
          }
        }

        if (bZero(x)) {
          continue
        }

        const v = s.v.map((c, k) => c + roots[r]![k]!)
        const key = v.join(',')

        let site = next.get(key)

        if (!site) {
          site = {
            v,
            amp: Array.from({ length: n }, (): EisB => [0n, 0n]),
          }
          next.set(key, site)
        }

        const o = site.amp[r]!

        site.amp[r] = [o[0] + x[0], o[1] + x[1]]
      }
    }

    for (const [k, s] of next) {
      if (s.amp.every(bZero)) {
        next.delete(k)
      }
    }

    sites = next
    each(t, sites)
  }
}

// the walk folded onto a side-`side` D4 box from dock `from`: `${cell},${slot}` -> amplitude
export function foldDockWalk(
  sites: Map<string, WalkSite>,
  side: number,
  from: number,
): Map<string, EisB> {
  const c0 = d4BoxCoordinates({ cell: from, side })
  const m = new Map<string, EisB>()

  for (const s of sites.values()) {
    const cell = d4BoxCell({
      coordinates: d4Coordinates(s.v).map((x, k) => x + c0[k]!),
      side,
    })

    s.amp.forEach((a, q) => {
      if (bZero(a)) {
        return
      }

      const key = `${cell},${q}`
      const o = m.get(key) ?? [0n, 0n]

      m.set(key, [o[0] + a[0], o[1] + a[1]])
    })
  }

  for (const [k, a] of m) {
    if (bZero(a)) {
      m.delete(k)
    }
  }

  return m
}

// ---- the keyed piece and a lockstep track ----

// Born bins at theta = 2 pi / 3: each hop |w - 1|^2 / 576 = 1 / 192, the keep 192 - n (24 - n) (at least 48)
export const DOCK_BINS = 192
export const dockKeepBins = (n: number): number =>
  DOCK_BINS - n * (24 - n)

// the eligible hops of a dock occupation (a mask over 24), in the path's order: from each held slot ascending, to each
// empty slot ascending
export function dockHopOrder(mask: number): [number, number][] {
  const out: [number, number][] = []

  for (let from = 0; from < 24; from++) {
    if (!((mask >> from) & 1)) {
      continue
    }

    for (let to = 0; to < 24; to++) {
      if (!((mask >> to) & 1)) {
        out.push([from, to])
      }
    }
  }

  return out
}

// THE KEYED PIECE on every dock: the key's frame-0 number (0 .. 65,535) read as one of 192 bins (floor(key 192 / 65536),
// so a bin holds 341 or 342 keys: the Born weights to 1 part in 341); a full dock is blocked, a dock of two contents or
// none is left alone, a dock of one content keeps below its keep bins or makes the hop the bin names
export function keyedDockMix(
  tables: LockedTables,
  c: Configuration,
  key: PathKey,
  t: number,
  on: boolean,
  tally: FermionTally,
): void {
  if (!on) {
    return
  }

  for (let x = 0; x < tables.cells; x++) {
    const h = dockHold(c, x)
    const n = h.held

    if (n === 0) {
      continue
    }

    if (n === 24) {
      tally.blockedFull++
      continue
    }

    if (!h.oneContent) {
      tally.twoContent++
      continue
    }

    tally.gated++

    const b = Math.floor((key.frame(t, x, 0) * DOCK_BINS) / 65536)
    const keep = dockKeepBins(n)

    if (b < keep) {
      continue
    }

    const [from, to] = dockHopOrder(h.mask)[b - keep]!

    hop(c, x * 24 + from, x * 24 + to)
    tally.moved++
  }
}

const sameSlot = (
  p: Configuration,
  q: Configuration,
  i: number,
): boolean =>
  p.vibe[i] === q.vibe[i] &&
  (p.vibe[i] === 0 ||
    (p.point[i] === q.point[i] && p.open[i] === q.open[i]))
const sameStore = (
  p: Configuration,
  q: Configuration,
  s: number,
): boolean =>
  p.store[s] === q.store[s] &&
  (p.store[s] === 0 ||
    (p.spoint[s] === q.spoint[s] && p.sopen[s] === q.sopen[s]))

// the docks where two configurations differ, and the mesh lines of the differing slots added to `touched`
export function dockFootprint(
  a: Configuration,
  b: Configuration,
  cells: number,
  lines?: MeshLines,
  touched?: Set<number>,
): number {
  let footprint = 0

  for (let x = 0; x < cells; x++) {
    let here = false

    for (let d = 0; d < 24; d++) {
      if (sameSlot(a, b, x * 24 + d)) {
        continue
      }

      here = true

      if (lines && touched) {
        touched.add(lines.lineOf[x * 24 + d]!)
      }
    }

    for (let l = 0; l < 12; l++) {
      if (!sameStore(a, b, x * 12 + l)) {
        here = true
      }
    }

    if (here) {
      footprint++
    }
  }

  return footprint
}

export type DockTrack = {
  footprint: number[]
  linesTouched: number
  tally: FermionTally
  referenceTally: FermionTally
  kEvents: number
  referenceKEvents: number
}

// a start beside a reference in lockstep under the candidate beat (the keyed dock piece, then the working keyed beat
// code/measure/hub-star starBeat): per beat the docks where they differ; `referenceOn` (default `on`) runs the piece on
// the reference too
export function dockTrack(input: {
  tables: LockedTables
  start: Configuration
  reference: Configuration
  key: PathKey
  threshold: number
  beats: number
  on: boolean
  referenceOn?: boolean
  lines?: MeshLines
}): DockTrack {
  const {
    tables,
    start,
    reference,
    key,
    threshold,
    beats,
    on,
    lines,
    referenceOn = on,
  } = input

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)
  let p = cloneConfiguration(reference)
  let q = cloneConfiguration(reference)

  const events: KEvent[] = []
  const referenceEvents: KEvent[] = []
  const tally = newFermionTally()
  const referenceTally = newFermionTally()
  const touched = new Set<number>()
  const footprint: number[] = []

  for (let t = 0; t < beats; t++) {
    keyedDockMix(tables, a, key, t, on, tally)
    keyedDockMix(tables, p, key, t, referenceOn, referenceTally)
    starBeat(tables, a, b, key, threshold, t, events)
    starBeat(tables, p, q, key, threshold, t, referenceEvents)
    ;[a, b] = [b, a]
    ;[p, q] = [q, p]
    footprint.push(dockFootprint(a, p, tables.cells, lines, touched))
  }

  return {
    footprint,
    linesTouched: touched.size,
    tally,
    referenceTally,
    kEvents: events.length,
    referenceKEvents: referenceEvents.length,
  }
}

// ---- which covariant dock unitaries lie in the rule's ring ----

// the elements of a group of slot permutations that act on the coordinates as signed permutations with an even number
// of signs: W(D4) inside W(F4)
export function weylD4Of(
  group: readonly (readonly number[])[],
): number[][] {
  const slot = (v: readonly number[]): number =>
    ROOTS.findIndex(r => r.every((x, k) => x === v[k]))
  const pairs: [number, number, number][] = [
    [slot([1, 1, 0, 0]), slot([1, -1, 0, 0]), 1],
    [slot([1, 1, 0, 0]), slot([1, -1, 0, 0]), -1],
    [slot([0, 0, 1, 1]), slot([0, 0, 1, -1]), 1],
    [slot([0, 0, 1, 1]), slot([0, 0, 1, -1]), -1],
  ]

  return group
    .filter(g => {
      let negatives = 0

      for (const [a, b, s] of pairs) {
        const ra = ROOTS[g[a]!]!
        const rb = ROOTS[g[b]!]!
        const e = ra.map((x, k) => (x + s * rb[k]!) / 2)
        const nz = e.filter(x => x !== 0)

        if (nz.length !== 1 || Math.abs(nz[0]!) !== 1) {
          return false
        }

        if (nz[0]! < 0) {
          negatives++
        }
      }

      return negatives % 2 === 0
    })
    .map(g => [...g])
}

export type PairClasses = {
  classOf: Int32Array
  count: number
  valency: number[]
  inner: number[]
}

// the orbits of a group on ordered pairs of slots (the orbitals), with each one's valency and inner product
export function pairClasses(
  group: readonly (readonly number[])[],
): PairClasses {
  const classOf = new Int32Array(576).fill(-1)
  const valency: number[] = []
  const inner: number[] = []

  let count = 0

  for (let p = 0; p < 576; p++) {
    if (classOf[p] !== -1) {
      continue
    }

    const d = Math.floor(p / 24)
    const e = p % 24

    let members = 0

    for (const g of group) {
      const q = g[d]! * 24 + g[e]!

      if (classOf[q] === -1) {
        classOf[q] = count
        members++
      }
    }

    valency.push(members / 24)
    inner.push(dot(ROOTS[d]!, ROOTS[e]!))
    count++
  }

  return { classOf, count, valency, inner }
}

export type SchemeTable = {
  eigen: number[][]
  multiplicity: number[]
  exact: boolean
  commutative: boolean
}

// the eigenvalue table P[k][j] (of class k's 0/1 matrix on eigenspace j) and the multiplicities, read numerically from a
// generic combination and rounded, then checked EXACTLY: the integer matrices L E_j = L (m_j / 24) sum_k (P[k][j] / v_k)
// A_k are idempotent (times L), pairwise orthogonal, sum to L I and carry P[k][j] under every A_k
export function schemeTable(pc: PairClasses): SchemeTable {
  const A = Array.from({ length: pc.count }, (_, k) =>
    Array.from({ length: 24 }, (__, d) =>
      Array.from({ length: 24 }, (___, e) =>
        pc.classOf[d * 24 + e] === k ? 1 : 0,
      ),
    ),
  )
  const matMul = (a: number[][], b: number[][]): number[][] =>
    a.map(row =>
      b[0]!.map((_, j) =>
        row.reduce((s, v, k) => s + v * b[k]![j]!, 0),
      ),
    )
  const same = (a: number[][], b: number[][]): boolean =>
    a.every((row, i) => row.every((x, j) => x === b[i]![j]))
  const commutative = A.every(a =>
    A.every(b => same(matMul(a, b), matMul(b, a))),
  )
  const G = A[0]!.map((row, d) =>
    row.map((_, e) =>
      A.reduce(
        (s, a, k) => s + Math.sqrt(k + 2) * (a[d] as number[])[e]!,
        0,
      ),
    ),
  )
  const sym = G.map((row, d) => row.map((x, e) => (x + G[e]![d]!) / 2))
  const eg = symmetricEigen(sym)
  const groups: { value: number; vectors: number[][] }[] = []

  eg.values.forEach((v, i) => {
    const g = groups.find(x => Math.abs(x.value - v) < 1e-7)

    if (g) {
      g.vectors.push(eg.vectors[i]!)
    } else {
      groups.push({ value: v, vectors: [eg.vectors[i]!] })
    }
  })

  const eigen = A.map(a =>
    groups.map(g => {
      const v = g.vectors[0]!
      const av = a.map(row =>
        row.reduce((s: number, x, e) => s + x * v[e]!, 0),
      )

      return Math.round(dot(v, av) / dot(v, v))
    }),
  )
  const multiplicity = groups.map(g => g.vectors.length)
  const L =
    24 *
    pc.valency.reduce((l, v) => {
      const gcd = (x: number, y: number): number =>
        y === 0 ? x : gcd(y, x % y)

      return (l * v) / gcd(l, v)
    }, 1)
  const E = groups.map((_, j) =>
    A[0]!.map((row, d) =>
      row.map((__, e) => {
        const k = pc.classOf[d * 24 + e]!

        return (
          (multiplicity[j]! * eigen[k]![j]! * L) / (24 * pc.valency[k]!)
        )
      }),
    ),
  )
  const integer = E.every(m =>
    m.every(row => row.every(x => Number.isInteger(x))),
  )
  const scaled = (m: number[][], s: number): number[][] =>
    m.map(row => row.map(x => x * s))

  let exact = integer && groups.length === pc.count

  E.forEach((ej, j) => {
    if (!same(matMul(ej, ej), scaled(ej, L))) {
      exact = false
    }

    E.forEach((ei, i) => {
      if (
        i !== j &&
        !matMul(ei, ej).every(row => row.every(x => x === 0))
      ) {
        exact = false
      }
    })

    A.forEach((a, k) => {
      if (!same(matMul(a, ej), scaled(ej, eigen[k]![j]!))) {
        exact = false
      }
    })
  })

  const sum = A[0]!.map((row, d) =>
    row.map((__, e) => E.reduce((s, m) => s + m[d]![e]!, 0)),
  )

  if (
    !same(
      sum,
      A[0]!.map((row, d) => row.map((__, e) => (d === e ? L : 0))),
    )
  ) {
    exact = false
  }

  return { eigen, multiplicity, exact, commutative }
}

const UNITS_N: readonly EisN[] = [
  [1, 0],
  [0, 1],
  [-1, -1],
  [-1, 0],
  [0, -1],
  [1, 1],
]

const oddPart = (x: number): number => {
  let y = x

  while (y % 2 === 0) {
    y /= 2
  }

  return y
}

export type RingCensus = {
  tried: number
  inRing: number
  reachInnerOne: number
  mixLines: number
  perInner: Record<string, number>
}

// every covariant unitary sum_j mu_j E_j with each mu_j a sixth root of unity (in Z[w][1/2] a unitary's eigenvalues are
// units, since 2 is inert), its coefficient on class k being sum_j mu_j m_j P[k][j] / (24 v_k); it lies in the ring when
// every numerator is divisible by the odd part of 24 v_k. Counts those, those with a nonzero coefficient on a class of
// inner product +-1, those that take a slot off its line at all, and per inner product the in-ring unitaries touching it
export function ringCensus(
  pc: PairClasses,
  table: SchemeTable,
): RingCensus {
  const r = table.multiplicity.length
  const out: RingCensus = {
    tried: 0,
    inRing: 0,
    reachInnerOne: 0,
    mixLines: 0,
    perInner: {},
  }
  const choice = new Array<number>(r).fill(0)

  for (let code = 0; code < 6 ** r; code++) {
    let c = code

    for (let j = 0; j < r; j++) {
      choice[j] = c % 6
      c = Math.floor(c / 6)
    }

    out.tried++

    let ok = true

    const nonzero: boolean[] = []

    for (let k = 0; k < pc.count && ok; k++) {
      let s: EisN = [0, 0]

      for (let j = 0; j < r; j++) {
        const u = UNITS_N[choice[j]!]!
        const f = table.multiplicity[j]! * table.eigen[k]![j]!

        s = [s[0] + f * u[0], s[1] + f * u[1]]
      }

      const q = oddPart(24 * pc.valency[k]!)

      if (s[0] % q !== 0 || s[1] % q !== 0) {
        ok = false
      }

      nonzero.push(s[0] !== 0 || s[1] !== 0)
    }

    if (!ok) {
      continue
    }

    out.inRing++

    let one = false
    let mix = false

    const inners = new Set<number>()

    nonzero.forEach((z, k) => {
      if (!z) {
        return
      }

      const ip = pc.inner[k]!

      if (Math.abs(ip) === 1) {
        one = true
      }

      if (Math.abs(ip) !== 2) {
        mix = true
      }

      inners.add(ip)
    })

    for (const ip of inners) {
      out.perInner[String(ip)] = (out.perInner[String(ip)] ?? 0) + 1
    }

    if (one) {
      out.reachInnerOne++
    }

    if (mix) {
      out.mixLines++
    }
  }

  return out
}
