// THE PAULI-BLOCKED FRAME MIXER (E-SPN-0130). note/project/vibe/roadmap/research/remaining-pieces.md, "Six angles on 3d
// motion" and E-SPN-0121: every added line mixer so far cascades the working vacuum. The idea tested here is the Dirac
// sea's: a FERMIONIC mixer, second-quantized with the knit's fermion sign, leaves a completely filled or completely
// empty set of modes alone up to a phase (its determinant), so on a vacuum whose frames are all full or all empty it
// would turn matter and leave the vacuum exactly alone.
//
// THE PIECE, on one frame (the four mutually orthogonal lines of a dock, eight slots, code/rule/coined-locked-knit):
//     M = exp(i theta N_u),   N_u = c_u^dag c_u = (1/8) sum_(i, j in the frame) c_i^dag c_j,
// the second-quantized lift of the one-vibe M_theta = I + (e^(i theta) - 1) J / 8 of E-SPN-0121. N_u takes the values 0
// and 1, so M = 1 + (e^(i theta) - 1) N_u, and on a frame of n vibes it keeps with 1 + (e^(i theta) - 1) n / 8 or takes
// ONE vibe to one empty slot of the frame with (e^(i theta) - 1) / 8 times the fermion sign of the hop (code/rule/
// coined-locked-knit hopSign, the knit's mode order). No term moves two vibes. Since Gamma(G) = (-1)^(N_u) (E-SPN-0096),
//     M = (1 + e^(i theta)) / 2 + (1 - e^(i theta)) / 2 Gamma(G),
// and at theta = 2 pi / 3 every entry lies in Z[w] / 8: keep (8 - n + n w) / 8, hop (w - 1) / 8.
//   a full frame (n = 8)    N_u = 1: the phase e^(i theta), no hop (no slot is empty): PAULI BLOCKED
//   an empty frame          the identity
//   a lone vibe (n = 1)     M_theta itself; a lone hole (n = 7) det(M) conj(M_theta) on the hole, the particle-hole
//                           image: the hole walks the frame as a vibe does
// WHERE IT ACTS: a frame whose vibes all carry ONE content (value and point) and are all open, with 1 to 7 of them; a
// full frame of any contents takes the phase (it has no hop, so the content never enters); a frame of two or more
// contents and 1 to 7 vibes is left alone. E-SPN-0096: carrying two contents through the hop is not unitary, so the
// gate is required, and it is kept (a hop carries a vibe's content with it, so the content multiset and n are kept).
// The piece is a controlled unitary, block diagonal in (content multiset, n).
//
// ON A KEYED PATH (code/measure/full-key-paths): the Born weights are exact in 1/64 at theta = 2 pi / 3: each hop
// |w - 1|^2 / 64 = 3 / 64, the keep the rest, 64 - 3 n (8 - n) bins (at least 16). The key's frame bin b = key / 1024
// keeps below that; above it, hop number floor((b - keep) / 3) in the order (o = 1 .. 7, then the four pairs
// {q, q XOR o} by their smaller slot). For n = 1 and n = 7 every o holds exactly one eligible pair, so the hop is
// q -> q XOR o, an involution on the path; for 2 to 6 it is a Born unraveling, not an involution.
//
// DETERMINISM: no random numbers; the key is integer arithmetic. EXACT: the Fock checks below are integer arithmetic in
// Z[w]; the band is floats, as measurement. NOTHING MOVES: a hop hands a vibe's value, point and open bit to an empty
// slot of its own frame on its own dock; the stream takes it one dock along.

import { rootsD4 } from '@/code/algebra/group/integer-roots'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import {
  cloneConfiguration,
  type Branch,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  FRAME_LINES,
  FRAME_SLOTS,
  hopSign,
  liftBranch,
} from '@/code/rule/coined-locked-knit'
import { LINE_FIRSTS, LINE_OF } from '@/code/rule/isometric-knit'
import {
  starBeat,
  singlesAt,
  type KEvent,
} from '@/code/measure/hub-star'
import {
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { symmetricEigen } from '@/code/measure/line-class-metric'

const ROOTS = rootsD4()

// ---- the frame's occupation ----

export type FrameHold = {
  held: number[]
  oneContent: boolean
  full: boolean
}

// the frame slots q of frame f at dock x that hold a vibe, and whether they carry one content, all open
export function frameHold(
  c: Configuration,
  x: number,
  f: number,
): FrameHold {
  const ss = FRAME_SLOTS[f]!
  const held: number[] = []

  let oneContent = true
  let first = -1

  for (let q = 0; q < 8; q++) {
    const i = x * 24 + ss[q]!

    if (c.vibe[i] === 0) {
      continue
    }

    held.push(q)

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

  return { held, oneContent, full: held.length === 8 }
}

// the eligible hops of a frame occupation (held as a bit mask over q), in the path's order: [from q, to q]
export function hopOrder(mask: number): [number, number][] {
  const out: [number, number][] = []

  for (let o = 1; o < 8; o++) {
    for (let q = 0; q < 8; q++) {
      const r = q ^ o

      if (r < q) {
        continue
      }

      const a = (mask >> q) & 1
      const b = (mask >> r) & 1

      if (a === b) {
        continue
      }

      out.push(a ? [q, r] : [r, q])
    }
  }

  return out
}

// keep bins of 64 for n vibes of one content at theta = 2 pi / 3
export const keepBins = (n: number): number => 64 - 3 * n * (8 - n)

export type FermionTally = {
  gated: number
  moved: number
  blockedFull: number
  twoContent: number
  nonInvolutive: number
}

export const newFermionTally = (): FermionTally => ({
  gated: 0,
  moved: 0,
  blockedFull: 0,
  twoContent: 0,
  nonInvolutive: 0,
})

// THE KEYED PIECE at theta = 2 pi / 3 on every frame of every dock (`on` false is theta = 0, the identity)
export function keyedFermionMix(
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
    for (let f = 0; f < 3; f++) {
      const h = frameHold(c, x, f)
      const n = h.held.length

      if (n === 0) {
        continue
      }

      if (n === 8) {
        tally.blockedFull++
        continue
      }

      if (!h.oneContent) {
        tally.twoContent++
        continue
      }

      tally.gated++

      if (n !== 1 && n !== 7) {
        tally.nonInvolutive++
      }

      const b = Math.floor(key.frame(t, x, f) / 1024)
      const keep = keepBins(n)

      if (b < keep) {
        continue
      }

      const mask = h.held.reduce((m, q) => m | (1 << q), 0)
      const [from, to] = hopOrder(mask)[Math.floor((b - keep) / 3)]!
      const ss = FRAME_SLOTS[f]!
      const i = x * 24 + ss[from]!
      const j = x * 24 + ss[to]!

      c.vibe[j] = c.vibe[i]!
      c.point[j] = c.point[i]!
      c.open[j] = c.open[i]!
      c.vibe[i] = 0
      c.point[i] = 0
      c.open[i] = 0
      tally.moved++
    }
  }
}

// ---- the exact Fock checks ----

// Eisenstein integers a + b w, w^2 = -1 - w
export type Eis = [number, number]

const eMul = (x: Eis, y: Eis): Eis => [
  x[0] * y[0] - x[1] * y[1],
  x[0] * y[1] + x[1] * y[0] - x[1] * y[1],
]
const eConj = (x: Eis): Eis => [x[0] - x[1], -x[1]]

// a frame state: per frame slot 0 (empty), 1 (content A) or 2 (content B); `contents` 1 uses masks only
export type FockOptions = {
  readonly contents: 1 | 2
  readonly signed: boolean
  readonly adjoint: boolean
}

// the matrix of M (numerators over 8) as columns: source index -> [target index, amplitude]
export function fockColumns(o: FockOptions): {
  size: number
  n: number[]
  columns: [number, Eis][][]
} {
  const size = o.contents === 1 ? 256 : 6561

  const decode = (s: number): number[] => {
    const out: number[] = []

    for (let q = 0; q < 8; q++) {
      if (o.contents === 1) {
        out.push((s >> q) & 1)
      } else {
        out.push(s % 3)
        s = Math.floor(s / 3)
      }
    }

    return out
  }

  const encode = (v: readonly number[]): number =>
    o.contents === 1
      ? v.reduce((m, x, q) => m | (x << q), 0)
      : v.reduceRight((m, x) => m * 3 + x, 0)
  // e^(i theta) - 1 over 8: w - 1, or its conjugate w^2 - 1 = -2 - w
  const hop: Eis = o.adjoint ? [-2, -1] : [-1, 1]
  const ss = FRAME_SLOTS[0]!
  const scratch: Configuration = {
    vibe: new Int8Array(24),
    point: new Int8Array(24),
    open: new Uint8Array(24),
    store: new Int8Array(12),
    spoint: new Int8Array(12),
    sopen: new Uint8Array(12),
  }
  const nOf: number[] = []
  const columns: [number, Eis][][] = []

  for (let s = 0; s < size; s++) {
    const v = decode(s)
    const n = v.filter(x => x !== 0).length
    const col: [number, Eis][] = []

    nOf.push(n)
    // keep 1 + (e^(i theta) - 1) n / 8
    col.push([s, [8 + n * hop[0], n * hop[1]]])
    scratch.vibe.fill(0)
    v.forEach((x, q) => (scratch.vibe[ss[q]!] = x === 0 ? 0 : 1))

    for (let q = 0; q < 8; q++) {
      if (v[q] === 0) {
        continue
      }

      for (let r = 0; r < 8; r++) {
        if (v[r] !== 0) {
          continue
        }

        const sign = o.signed ? hopSign(scratch, 0, ss[q]!, ss[r]!) : 1
        const u = v.slice()

        u[r] = u[q]!
        u[q] = 0
        col.push([encode(u), [sign * hop[0], sign * hop[1]]])
      }
    }

    columns.push(col)
  }

  return { size, n: nOf, columns }
}

// the entries of A^dag B off the identity (numerators over 64), and the particle numbers n whose sectors hold one, for
// two column lists on one basis
export function productDefects(
  a: [number, Eis][][],
  b: [number, Eis][][],
  nOf: readonly number[],
): { entries: number; sectors: number[] } {
  const byTarget = new Map<number, { s: number; x: Eis; y: Eis }[]>()
  const add = (cols: [number, Eis][][], which: 'x' | 'y'): void =>
    cols.forEach((col, s) => {
      for (const [t, amp] of col) {
        let list = byTarget.get(t)

        if (!list) {
          list = []
          byTarget.set(t, list)
        }

        let e = list.find(z => z.s === s)

        if (!e) {
          e = { s, x: [0, 0], y: [0, 0] }
          list.push(e)
        }

        e[which] = [e[which][0] + amp[0], e[which][1] + amp[1]]
      }
    })

  add(a, 'x')
  add(b, 'y')

  const sum = new Map<string, Eis>()

  for (const list of byTarget.values()) {
    for (const p of list) {
      for (const q of list) {
        const z = eMul(eConj(p.x), q.y)

        if (z[0] === 0 && z[1] === 0) {
          continue
        }

        const k = `${p.s},${q.s}`
        const old = sum.get(k) ?? [0, 0]

        sum.set(k, [old[0] + z[0], old[1] + z[1]])
      }
    }
  }

  let entries = 0

  const sectors = new Set<number>()

  for (let s = 0; s < a.length; s++) {
    const d = sum.get(`${s},${s}`) ?? [0, 0]

    if (d[0] !== 64 || d[1] !== 0) {
      entries++
      sectors.add(nOf[s]!)
    }
  }

  for (const [k, z] of sum) {
    const [s, r] = k.split(',').map(Number) as [number, number]

    if (s === r || (z[0] === 0 && z[1] === 0)) {
      continue
    }

    entries++
    sectors.add(nOf[s]!)
  }

  return { entries, sectors: [...sectors].sort((x, y) => x - y) }
}

// the entries of A B off the identity (numerators over 64): the reversal, A the inverse piece and B the piece
export function composeDefects(
  a: [number, Eis][][],
  b: [number, Eis][][],
  nOf: readonly number[],
): { entries: number; sectors: number[] } {
  let entries = 0

  const sectors = new Set<number>()

  b.forEach((col, s) => {
    const sum = new Map<number, Eis>()

    for (const [m, y] of col) {
      for (const [t, x] of a[m]!) {
        const z = eMul(x, y)
        const old = sum.get(t) ?? [0, 0]

        sum.set(t, [old[0] + z[0], old[1] + z[1]])
      }
    }

    for (const [t, z] of sum) {
      const want = t === s ? 64 : 0

      if (z[0] !== want || z[1] !== 0) {
        entries++
        sectors.add(nOf[s]!)
      }
    }

    if (!sum.has(s)) {
      entries++
      sectors.add(nOf[s]!)
    }
  })

  return { entries, sectors: [...sectors].sort((x, y) => x - y) }
}

// the columns of M computed from the rule's own Gamma(G) (liftBranch on one dock, frame 0, one content):
// M = (1 + w)/2 + (1 - w)/2 Gamma(G), numerators over 8; and the entries where they differ from fockColumns
export function liftAgreement(): { differ: number; checked: number } {
  const mine = fockColumns({
    contents: 1,
    signed: true,
    adjoint: false,
  }).columns
  const ss = FRAME_SLOTS[0]!

  let differ = 0
  let checked = 0

  for (let s = 0; s < 256; s++) {
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

    for (let q = 0; q < 8; q++) {
      if ((s >> q) & 1) {
        br.vibe[ss[q]!] = 1
        br.open[ss[q]!] = 1
      }
    }

    const out = new Map<number, Eis>()

    for (const r of liftBranch(1, br)) {
      let mask = 0

      for (let q = 0; q < 8; q++) {
        if (r.vibe[ss[q]!] !== 0) {
          mask |= 1 << q
        }
      }

      // g = (a + b w) / 2^k as a numerator over 4
      const scale = 4 / 2 ** r.k
      const g: Eis = [Number(r.a) * scale, Number(r.b) * scale]
      // over 8: (1 - w) g, (1 - w)(a + b w) = (a + b) + (2 b - a) w
      const m: Eis = [g[0] + g[1], 2 * g[1] - g[0]]
      const old = out.get(mask) ?? [0, 0]

      out.set(mask, [old[0] + m[0], old[1] + m[1]])
    }

    // the identity's share, 4 (1 + w) over 8, on the frame's own occupation (Gamma(G) keeps n = 4 with 0, so no branch
    // of liftBranch lands there then)
    const own = out.get(s) ?? [0, 0]

    out.set(s, [own[0] + 4, own[1] + 4])

    const col = mine[s]!
    const want = new Map<number, Eis>(col.map(([t, a]) => [t, a]))

    for (const t of new Set([...out.keys(), ...want.keys()])) {
      const x = out.get(t) ?? [0, 0]
      const y = want.get(t) ?? [0, 0]

      checked++

      if (x[0] !== y[0] || x[1] !== y[1]) {
        differ++
      }
    }
  }

  return { differ, checked }
}

// ---- the band of one vibe (or, by particle-hole, one hole) on its frame ----

const W_RE = -0.5
const W_IM = Math.sqrt(3) / 2

// the one-vibe beat on frame f at Cartesian momentum K: U = S(K) C M_theta (the mixer, then the coin, then the stream;
// the meeting, the pair move and the bounce leave a lone vibe where it is), row-major re and im, 8 x 8
export function frameBloch(
  f: number,
  K: readonly number[],
  theta: number,
): { re: Float64Array; im: Float64Array } {
  const ss = FRAME_SLOTS[f]!
  const n = 8
  // M = I + (e^(i theta) - 1) J / 8
  const mRe = new Float64Array(n * n)
  const mIm = new Float64Array(n * n)
  const er = (Math.cos(theta) - 1) / 8
  const ei = Math.sin(theta) / 8

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      mRe[i * n + j] = (i === j ? 1 : 0) + er
      mIm[i * n + j] = ei
    }
  }

  // C on each line's pair of frame slots (q = 2a, 2a + 1): keep (1 + w)/2, cross (1 - w)/2
  const cRe = new Float64Array(n * n)
  const cIm = new Float64Array(n * n)

  for (let a = 0; a < 4; a++) {
    for (const [i, j] of [
      [2 * a, 2 * a],
      [2 * a + 1, 2 * a + 1],
    ] as const) {
      cRe[i * n + j] = (1 + W_RE) / 2
      cIm[i * n + j] = W_IM / 2
    }

    for (const [i, j] of [
      [2 * a, 2 * a + 1],
      [2 * a + 1, 2 * a],
    ] as const) {
      cRe[i * n + j] = (1 - W_RE) / 2
      cIm[i * n + j] = -W_IM / 2
    }
  }

  // C M
  const pRe = new Float64Array(n * n)
  const pIm = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let r = 0
      let m = 0

      for (let k = 0; k < n; k++) {
        const ar = cRe[i * n + k]!
        const ai = cIm[i * n + k]!
        const br = mRe[k * n + j]!
        const bi = mIm[k * n + j]!

        r += ar * br - ai * bi
        m += ar * bi + ai * br
      }

      pRe[i * n + j] = r
      pIm[i * n + j] = m
    }
  }

  // S(K): slot d streams along its root, phase e^(-i K . r_d)
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)

  for (let i = 0; i < n; i++) {
    const r = ROOTS[ss[i]!]!
    const phase = -r.reduce((s, x, k) => s + x * K[k]!, 0)
    const cr = Math.cos(phase)
    const ci = Math.sin(phase)

    for (let j = 0; j < n; j++) {
      re[i * n + j] = cr * pRe[i * n + j]! - ci * pIm[i * n + j]!
      im[i * n + j] = cr * pIm[i * n + j]! + ci * pRe[i * n + j]!
    }
  }

  return { re, im }
}

// the eigenphases of the one-vibe beat nearest 0 (the band edge the coin puts at 0), `count` of them, ascending
export function edgePhases(
  f: number,
  K: readonly number[],
  theta: number,
  count: number,
): number[] {
  const u = frameBloch(f, K, theta)
  const e = complexEigenvalues({ re: u.re, im: u.im, n: 8 })
  const phases = e.re.map((r, k) => Math.atan2(e.im[k]!, r))

  return phases
    .sort((x, y) => Math.abs(x) - Math.abs(y))
    .slice(0, count)
    .sort((x, y) => x - y)
}

// the curvature 2 lambda of each edge branch along the unit direction `dir` (epsilon = lambda kappa^2), by a
// Richardson-extrapolated second difference at kappa and kappa / 2
export function edgeCurvatures(
  f: number,
  dir: readonly number[],
  theta: number,
  count: number,
  kappa = 0.02,
): number[] {
  const at = (k: number): number[] =>
    edgePhases(
      f,
      dir.map(x => x * k),
      theta,
      count,
    ).map(e => (2 * e) / (k * k))
  const a = at(kappa)
  const b = at(kappa / 2)

  return b.map((x, i) => (4 * x - a[i]!) / 3)
}

// THE EFFECTIVE QUADRATIC FORM on the edge level, derived: at K = 0 the frame's four line-symmetric states sit at 0
// (the coin's 1), the antisymmetric ones at 2 pi / 3 (its w), and M moves the uniform one to theta; to second order in
// K the level is c (K . r_l)^2 on line l's symmetric state, projected on the states orthogonal to the uniform one (for
// theta not 0), where c is one line's curvature. Returns 2 x its eigenvalues (the curvatures 2 lambda) and each
// eigenvector's largest weight on one line
export function edgeForm(
  f: number,
  dir: readonly number[],
  c: number,
  mixed: boolean,
): { curvatures: number[]; lineWeight: number[] } {
  const d = FRAME_LINES[f]!.map(l => {
    const r = ROOTS[LINE_FIRSTS[l]!]!
    const kr = r.reduce((s, x, k) => s + x * dir[k]!, 0)

    return c * kr * kr
  })

  if (!mixed) {
    return {
      curvatures: d.map(x => 2 * x).sort((x, y) => x - y),
      lineWeight: d.map(() => 1),
    }
  }

  // D on the three states orthogonal to the uniform one, in an orthonormal basis V of them: V^T D V
  const V = [
    [1, -1, 0, 0].map(x => x / Math.SQRT2),
    [1, 1, -2, 0].map(x => x / Math.sqrt(6)),
    [1, 1, 1, -3].map(x => x / Math.sqrt(12)),
  ]
  const m = V.map(a =>
    V.map(b =>
      [0, 1, 2, 3].reduce((s, k) => s + a[k]! * d[k]! * b[k]!, 0),
    ),
  )
  const e = symmetricEigen(m)
  const keep = e.vectors.map((y, i) => ({
    v: [0, 1, 2, 3].map(k =>
      V.reduce((s, row, j) => s + row[k]! * y[j]!, 0),
    ),
    x: e.values[i]!,
  }))

  keep.sort((p, q) => p.x - q.x)

  return {
    curvatures: keep.map(p => 2 * p.x),
    lineWeight: keep.map(p => Math.max(...p.v.map(y => y * y))),
  }
}

// ---- the track: a start beside a reference in lockstep, the mixer first in each beat ----

export type FermionTrack = {
  // per beat (index t is after beat t + 1): readings differing from the reference, docks holding one
  wake: number[]
  footprint: number[]
  // mesh lines that held a difference at some beat, docks that did
  linesTouched: number
  docksTouched: number
  // the mixer's tallies on the start and on the reference, K firings on each
  tally: FermionTally
  referenceTally: FermionTally
  kEvents: number
  referenceKEvents: number
  // slots where the keyed piece applied twice differs from the configuration before it, summed over beats
  reversalDiffer: number
  // readings where the reference differs from its own start, summed over beats (a stationary sea reads 0)
  referenceDrift: number
  last: Configuration
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

function readingsApart(
  a: Configuration,
  b: Configuration,
  cells: number,
  lines?: MeshLines,
  touched?: Set<number>,
  docks?: Set<number>,
): { wake: number; footprint: number } {
  let wake = 0
  let footprint = 0

  for (let x = 0; x < cells; x++) {
    let here = 0

    for (let d = 0; d < 24; d++) {
      if (sameSlot(a, b, x * 24 + d)) {
        continue
      }

      here++

      if (lines && touched) {
        touched.add(lines.lineOf[x * 24 + d]!)
      }
    }

    for (let l = 0; l < 12; l++) {
      if (sameStore(a, b, x * 12 + l)) {
        continue
      }

      here++

      if (lines && touched) {
        touched.add(lines.lineOf[x * 24 + LINE_FIRSTS[l]!]!)
      }
    }

    if (here === 0) {
      continue
    }

    wake += here
    footprint++

    if (docks) {
      docks.add(x)
    }
  }

  return { wake, footprint }
}

// `referenceOn` (default `on`): whether the reference run carries the piece too; false compares against the rule
// without it
export function fermionTrack(input: {
  tables: LockedTables
  reference: Configuration
  start: Configuration
  key: PathKey
  threshold: number
  beats: number
  on: boolean
  referenceOn?: boolean
  lines?: MeshLines
}): FermionTrack {
  const {
    tables,
    reference,
    start,
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
  const docks = new Set<number>()
  const out = {
    wake: [] as number[],
    footprint: [] as number[],
    reversalDiffer: 0,
    referenceDrift: 0,
  }

  for (let t = 0; t < beats; t++) {
    const twice = cloneConfiguration(a)
    const scratch = newFermionTally()

    keyedFermionMix(tables, twice, key, t, on, scratch)
    keyedFermionMix(tables, twice, key, t, on, scratch)

    for (let i = 0; i < a.vibe.length; i++) {
      if (!sameSlot(a, twice, i)) {
        out.reversalDiffer++
      }
    }

    keyedFermionMix(tables, a, key, t, on, tally)
    keyedFermionMix(tables, p, key, t, referenceOn, referenceTally)
    starBeat(tables, a, b, key, threshold, t, events)
    starBeat(tables, p, q, key, threshold, t, referenceEvents)
    ;[a, b] = [b, a]
    ;[p, q] = [q, p]

    const r = readingsApart(a, p, tables.cells, lines, touched, docks)

    out.wake.push(r.wake)
    out.footprint.push(r.footprint)
    out.referenceDrift += readingsApart(p, reference, tables.cells).wake
  }

  return {
    ...out,
    linesTouched: touched.size,
    docksTouched: docks.size,
    tally,
    referenceTally,
    kEvents: events.length,
    referenceKEvents: referenceEvents.length,
    last: a,
  }
}

// ---- the seas ----

// a configuration of `cells` docks with every slot holding `vibe` (1 a love sea, -1 a fear sea) at point 0, open, and
// no store; 0 gives the empty mesh
export function seaConfiguration(
  cells: number,
  vibe: number,
): Configuration {
  return {
    vibe: new Int8Array(cells * 24).fill(vibe),
    point: new Int8Array(cells * 24),
    open: new Uint8Array(cells * 24).fill(vibe === 0 ? 0 : 1),
    store: new Int8Array(cells * 12),
    spoint: new Int8Array(cells * 12),
    sopen: new Uint8Array(cells * 12),
  }
}

// the sea with each listed slot set: vibe 0 a hole, -1 a fear in a love sea, 1 a love in the empty mesh (open)
export function placeInSea(
  sea: Configuration,
  marks: readonly { dock: number; slot: number; vibe: number }[],
): Configuration {
  const c = cloneConfiguration(sea)

  for (const { dock, slot, vibe } of marks) {
    c.vibe[dock * 24 + slot] = vibe
    c.point[dock * 24 + slot] = 0
    c.open[dock * 24 + slot] = vibe === 0 ? 0 : 1
  }

  return c
}

// a sea with every slot held and every line's store holding a unit: each line a love on its first slot and a fear on
// its second, point 0, open; `stored` false leaves the stores empty (the pair move then unmakes every line)
export function neutralSea(
  cells: number,
  stored: boolean,
): Configuration {
  const c = seaConfiguration(cells, 0)

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const i = x * 24 + LINE_FIRSTS[l]!

      c.vibe[i] = 1
      c.open[i] = 1

      if (stored) {
        c.store[x * 12 + l] = 1
        c.sopen[x * 12 + l] = 3
      }
    }
  }

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      if (c.vibe[x * 24 + d] !== 0) {
        continue
      }

      c.vibe[x * 24 + d] = -1
      c.open[x * 24 + d] = 1
    }
  }

  return c
}

// every dock's frames on a configuration: by held slots (0 .. 8), the partly filled ones of one content, the full
// ones of one content
export type Filling = {
  byHeld: number[]
  oneContentPartial: number
  oneContentFull: number
}

export function frameFilling(c: Configuration, cells: number): Filling {
  const out: Filling = {
    byHeld: new Array<number>(9).fill(0),
    oneContentPartial: 0,
    oneContentFull: 0,
  }

  for (let x = 0; x < cells; x++) {
    for (let f = 0; f < 3; f++) {
      const h = frameHold(c, x, f)
      const n = h.held.length

      out.byHeld[n]!++

      if (n > 0 && n < 8 && h.oneContent) {
        out.oneContentPartial++
      }

      if (n === 8 && h.oneContent) {
        out.oneContentFull++
      }
    }
  }

  return out
}

export type FillingRun = Filling & {
  partial: number
  storeChanges: number
  kEvents: number
  returnBeat: number
  fullOrEmptyEveryBeat: boolean
}

// a start run under the working beat (starBeat, no mixer), its frames read at the top of every beat (where the mixer
// acts), summed over beats; store trits changed beat to beat (the pair move's activity), K firings, the first beat the
// configuration returns to the start (-1 if never)
export function fillingRun(
  tables: LockedTables,
  start: Configuration,
  key: PathKey,
  threshold: number,
  beats: number,
): FillingRun {
  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)

  const out: FillingRun = {
    byHeld: new Array<number>(9).fill(0),
    oneContentPartial: 0,
    oneContentFull: 0,
    partial: 0,
    storeChanges: 0,
    kEvents: 0,
    returnBeat: -1,
    fullOrEmptyEveryBeat: true,
  }
  const events: KEvent[] = []

  for (let t = 0; t < beats; t++) {
    const fl = frameFilling(a, tables.cells)
    const partial = fl.byHeld.slice(1, 8).reduce((s, v) => s + v, 0)

    fl.byHeld.forEach((v, k) => (out.byHeld[k]! += v))
    out.oneContentPartial += fl.oneContentPartial
    out.oneContentFull += fl.oneContentFull
    out.partial += partial

    if (partial > 0) {
      out.fullOrEmptyEveryBeat = false
    }

    const stores = Int8Array.from(a.store)

    starBeat(tables, a, b, key, threshold, t, events)
    ;[a, b] = [b, a]

    for (let s = 0; s < stores.length; s++) {
      if (stores[s] !== a.store[s]) {
        out.storeChanges++
      }
    }

    if (
      out.returnBeat < 0 &&
      readingsApart(a, start, tables.cells).wake === 0
    ) {
      out.returnBeat = t + 1
    }
  }

  out.kEvents = events.length

  return out
}

// THE POINT FIELD A ONE-CONTENT SEA NEEDS: per frame, a point per dock that every one of the frame's eight slot moves
// carries onto the frame's point at the target dock. Returns, per frame, the fewest inconsistent (slot, dock) edges
// over the nine start points in each component of the frame's docks (0 everywhere: such a field exists)
export function pointFieldDefects(tables: LockedTables): number[][] {
  const cells = tables.cells
  const out: number[][] = []

  for (let f = 0; f < 3; f++) {
    const ss = FRAME_SLOTS[f]!
    const seen = new Uint8Array(cells)
    const per: number[] = []

    for (let x0 = 0; x0 < cells; x0++) {
      if (seen[x0]) {
        continue
      }

      let best = Infinity
      let members: number[] = []

      for (let p0 = 0; p0 < 9; p0++) {
        const p = new Int32Array(cells).fill(-1)
        const queue = [x0]

        let bad = 0

        p[x0] = p0

        for (let k = 0; k < queue.length; k++) {
          const x = queue[k]!

          for (const d of ss) {
            const slot = x * 24 + d
            const y = Math.floor(tables.target[slot]! / 24)
            const q = tables.move[slot * 9 + p[x]!]!

            if (p[y] === -1) {
              p[y] = q
              queue.push(y)
            } else if (p[y] !== q) {
              bad++
            }
          }
        }

        best = Math.min(best, bad)
        members = queue
      }

      for (const x of members) {
        seen[x] = 1
      }

      per.push(best)
    }

    out.push(per)
  }

  return out
}

// ---- the piece on the superposed state (exact, Z[w][1/2]) ----

const cloneBr = (b: Branch): Branch => ({
  ...cloneConfiguration(b),
  a: b.a,
  b: b.b,
  k: b.k,
})

// Eisenstein product on a branch's amplitude: (a + b w)(u + v w)
function timesBr(br: Branch, u: bigint, v: bigint): void {
  const a = br.a * u - br.b * v
  const b = br.a * v + br.b * u - br.b * v

  br.a = a
  br.b = b
}

// M at theta = 2 pi / 3 (or its adjoint) on one branch: the branches it becomes. Full frames take w (adjoint w^2),
// frames of one content and 1 to 7 vibes keep (8 - n + n w)/8 or hop one vibe with (w - 1)/8 times the hop's sign
// (adjoint (8 - 2 n - n w)/8, (-2 - w)/8), other frames are left alone
export function fermionMixBranch(
  cells: number,
  br: Branch,
  adjoint: boolean,
  guard = 1 << 16,
): Branch[] {
  let branches: Branch[] = [br]

  const [hu, hv] = adjoint ? [-2n, -1n] : [-1n, 1n]

  for (let x = 0; x < cells; x++) {
    for (let f = 0; f < 3; f++) {
      const next: Branch[] = []

      for (const b of branches) {
        const h = frameHold(b, x, f)
        const n = h.held.length

        if (n === 0 || (n < 8 && !h.oneContent)) {
          next.push(b)
          continue
        }

        if (n === 8) {
          if (adjoint) {
            timesBr(b, -1n, -1n)
          } else {
            timesBr(b, 0n, 1n)
          }

          next.push(b)
          continue
        }

        const ss = FRAME_SLOTS[f]!
        const keep = cloneBr(b)
        const N = BigInt(n)

        timesBr(keep, 8n + N * hu, N * hv)
        keep.k += 3
        next.push(keep)

        for (const q of h.held) {
          for (let r = 0; r < 8; r++) {
            if (h.held.includes(r)) {
              continue
            }

            const k = cloneBr(b)
            const from = x * 24 + ss[q]!
            const to = x * 24 + ss[r]!
            const sign = BigInt(hopSign(k, x * 24, from, to))

            k.vibe[to] = k.vibe[from]!
            k.point[to] = k.point[from]!
            k.open[to] = k.open[from]!
            k.vibe[from] = 0
            k.point[from] = 0
            k.open[from] = 0
            timesBr(k, sign * hu, sign * hv)
            k.k += 3
            next.push(k)
          }
        }
      }

      branches = next

      if (branches.length > guard) {
        throw new Error(
          `pauli-mixer: ${branches.length} branches, over the guard ${guard}`,
        )
      }
    }
  }

  return branches
}

// the dock singles of a configuration, summed (condition Z reads 0 on a vacuum)
export function singlesTotal(c: Configuration, cells: number): number {
  let n = 0

  for (let x = 0; x < cells; x++) {
    n += singlesAt(c, x)
  }

  return n
}

// the line of a slot (for readings)
export const lineOfSlot = (slot: number): number => LINE_OF[slot % 24]!
