// Measurement for E-SPN-0091: three coined loves of the knit whose husk shadows lie on ONE husk line, at total
// momentum K, in relative coordinates, as configurations (second quantized). Floats stand for the exact numbers; the
// exact rule (code/rule/coined-locked-knit) is checked against the ring form of this operator in the experiment.
//
// THE SECTORS. A love on an axis bulk line (root r with a depth component, e.g. (1, 0, 0, 1)) copies one husk step a
// beat along r's shadow. The coin keeps it on its line, the lone-bounce collision keeps a lone vibe and flips a full
// line, so a set of loves on lines of ONE root class is closed. Lines of one root through different depth offsets are
// PARALLEL: they share the husk line and never share a dock, so loves on them never meet and never exclude each other.
// Each love carries a FLAVOR, the bulk line it is on, and
//   [0, 0, 0]  three loves on one bulk line           (identical: exclusion, meeting, statistics)
//   [0, 0, 1]  two on one line, one on a parallel line
//   [0, 1, 2]  one on each of three parallel lines     (distinguishable: the depth lifts Pauli)
// The drift cost reads the husk flux, so it is the same function (the husk span) in every sector.
//
// ONE BEAT (all pieces before the stream keep positions, so their order among themselves does not matter on these
// sectors): the drift cost zeta_(2N)^(-span); the coin (a lone love of its flavor on its dock: keep (1 + w)/2, cross
// to the other slot (1 - w)/2; two of one flavor on one dock: det C = w); the meeting (two of one flavor on one dock:
// w, all points equal); the collision's flip of a full line (a sign: -1 in 'fermion', +1 otherwise); the stream (label
// 0 one dock forward, label 1 one back) with the reordering sign of each flavor's modes in 'fermion' and 'token'.
//   'fermion'  the coined knit with the canonical fermion sign (code/rule/coined-locked-knit, fermion: true)
//   'native'   the coined knit's literal configuration code (fermion: false): no sign anywhere
//   'token'    the stand-in token of E-SPN-0086, 0087 (fermions, no flip), the instrument's calibration
// THE BOX (measurement, E-SPN-0087's): a configuration whose span would pass S is not copied; every label flips in
// place (with its reordering sign where signs are kept).

import { unitaryEigen, type Vec } from '@/code/measure/quantum-ladder'
import { blochSpace, branchReader, quartetShare, stringMoments, type Bloch } from '@/code/measure/flux-store-bloch'
import { boxSpec, inverseIterate, lightN, tailWeight } from '@/code/measure/drift-cost-bloch'
import { complexEigenvalues, complexEigenvector } from '@/code/algebra/linear/complex-eigen'

export type Statistics = 'fermion' | 'native' | 'token'
export type Flavors = readonly [number, number, number]
// `unit` (E-SPN-0093): the like contact's lift on a full line as the sixth root e^(i pi unit / 3), in place of the
// statistics' own (fermion: 3, the bounce's -1; native and token: 0). The passing knit is 'fermion' with unit 0.
// `mix` (E-SPN-0095): the frame mixer G of E-SPN-0094 (code/rule/coined-locked-knit mixBranch) COMPRESSED to the
// sector. A love alone on its dock is alone in its frame (a parallel line never shares a dock), so G acts on it: it is
// kept with 3/4, taken to the other slot of its line with -1/4, and taken to each of the six orthogonal slots with
// -1/4, which leave the sector and are dropped; a full line (two loves of one flavor) is a frame of two and is left
// alone. G and the coin are both diagonal on the line's P+- (G: 1/2 and 1 there), so their order does not matter. The
// operator is then NOT unitary: its norm loss is what leaves the bulk line. A lone love needs at least three mixer
// steps to come back to its own bulk line (off to an orthogonal line, back to the opposite slot of it, back onto the
// line), so the compression is the exact rule for the first two beats of any run.
// `lift` (E-SPN-0097, with `mix`): the lifted mixer Gamma(G) (code/rule/coined-locked-knit liftBranch) compressed the
// same way: a lone love as `mix`, and a full line (a frame of two of one content) kept with 1/2 (Gamma(G)'s keep,
// (4 - n)/4), its twelve one-vibe hops leaving the sector.
// `slant` (E-SPN-0106): the drift cost read after the coin, a gap's links not charged on a beat when its two end docks
// each hold one love with the same coined label (code/rule/bound-line-pieces slantLinks, on the line's span).
// `area` (E-SPN-0106): the cost split into half before the coin (the span before the beat) and half after the stream
// (the span after it): the trapezoid a string sweeps in one beat. It is V^(1/2) U' V^(1/2) where the plain cost is
// U' V, a conjugate, so it has the same spectrum; it is the instrument's check of that.
// `fine` (E-SPN-0107): the fine coin of code/rule/fine-coin, zeta = e^(2 pi i/(3 fine)) in place of w in the coin: keep
// (1 + zeta)/2, cross (1 - zeta)/2, det C zeta (the meeting keeps its own w). fine = 1 is the working coin. Not with `mix`.
// `fullDock` (E-SPN-0108, with `fine`): the full-dock correction (code/rule/fine-coin), det C on a full dock kept at w.
export type LineSector = { readonly flavors: Flavors; readonly statistics: Statistics; readonly D: number; readonly box: number; readonly unit?: number; readonly mix?: boolean; readonly lift?: boolean; readonly slant?: boolean; readonly area?: boolean; readonly fine?: number; readonly fullDock?: boolean }

// the contact unit a sector uses: its own, or its statistics' default
export const contactUnit = (sector: LineSector): number => sector.unit ?? (sector.statistics === 'fermion' ? 3 : 0)

// a token: position, label (0 forward, 1 back), flavor
type Token = { x: number; j: number; f: number }

const THREE = ['love', 'love', 'love'] as const
const SQ = Math.sqrt(3) / 2
type C = [number, number]
const cmul = (x: C, y: C): C => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]]
const OMEGA: C = [-0.5, SQ]
const KEEP: C = [0.25, SQ / 2]
const CROSS: C = [0.75, -SQ / 2]
// the coin after the compressed mixer on a lone love: keep 3/4 KEEP - 1/4 CROSS, cross 3/4 CROSS - 1/4 KEEP
const MIX_KEEP: C = [0.75 * KEEP[0] - 0.25 * CROSS[0], 0.75 * KEEP[1] - 0.25 * CROSS[1]]
const MIX_CROSS: C = [0.75 * CROSS[0] - 0.25 * KEEP[0], 0.75 * CROSS[1] - 0.25 * KEEP[1]]
// the fine coin's entries (code/rule/fine-coin): keep (1 + zeta)/2, cross (1 - zeta)/2, det zeta, zeta = e^(2 pi i/(3n))
export const fineCoin = (n: number): { keep: C; cross: C; det: C } => {
  const z: C = [Math.cos((2 * Math.PI) / (3 * n)), Math.sin((2 * Math.PI) / (3 * n))]

  return { keep: [(1 + z[0]) / 2, z[1] / 2], cross: [(1 - z[0]) / 2, -z[1] / 2], det: z }
}

// the order of one flavor's modes: by position, and at one dock the back slot (label 1) first
const keyOf = (t: Token): number => 2 * t.x + (t.j === 0 ? 1 : 0)

const canonical = (ts: Token[]): Token[] => ts.slice().sort((p, q) => p.f - q.f || keyOf(p) - keyOf(q))

const keyString = (ts: readonly Token[]): string => ts.map(t => `${t.x},${t.j},${t.f}`).join('|')

const spanOf = (ts: readonly Token[]): number => Math.max(...ts.map(t => t.x)) - Math.min(...ts.map(t => t.x))

// the span's links charged by the slant cost: every gap between consecutive occupied positions, except a gap whose two
// end positions each hold one token and the two carry the same (coined) label
function slantSpan(ts: readonly Token[]): number {
  const xs = [...new Set(ts.map(t => t.x))].sort((a, b) => a - b)
  let n = 0

  for (let i = 0; i + 1 < xs.length; i++) {
    const a = ts.filter(t => t.x === xs[i])
    const b = ts.filter(t => t.x === xs[i + 1])
    const comove = a.length === 1 && b.length === 1 && a[0]!.j === b[0]!.j

    if (!comove) n += xs[i + 1]! - xs[i]!
  }

  return n
}

// the parity of the reordering each flavor's modes undergo when every token i moves from `before[i]` to `after[i]`
function reorderSign(before: readonly Token[], after: readonly Token[]): number {
  let inversions = 0

  for (let p = 0; p < before.length; p++) {
    for (let q = p + 1; q < before.length; q++) {
      if (before[p]!.f !== before[q]!.f) continue

      const b = keyOf(before[p]!) - keyOf(before[q]!)
      const a = keyOf(after[p]!) - keyOf(after[q]!)

      if (b * a < 0) inversions++
    }
  }

  return inversions % 2 === 0 ? 1 : -1
}

export type LineBasis = { sector: LineSector; configs: Token[][]; index: Map<string, number> }

// every configuration with its least position at 0 and span at most the box
export function lineBasis(sector: LineSector): LineBasis {
  const S = sector.box
  const modes: { x: number; j: number }[] = []

  for (let x = 0; x <= S; x++) for (let j = 0; j < 2; j++) modes.push({ x, j })

  const seen = new Map<string, number>()
  const configs: Token[][] = []
  const [f0, f1, f2] = sector.flavors

  for (let a = 0; a < modes.length; a++) {
    for (let b = 0; b < modes.length; b++) {
      for (let c = 0; c < modes.length; c++) {
        const ts: Token[] = [
          { ...modes[a]!, f: f0 },
          { ...modes[b]!, f: f1 },
          { ...modes[c]!, f: f2 },
        ]
        // one mode of one flavor holds one love
        let clash = false

        for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) if (ts[p]!.f === ts[q]!.f && ts[p]!.x === ts[q]!.x && ts[p]!.j === ts[q]!.j) clash = true

        if (clash) continue
        if (Math.min(...ts.map(t => t.x)) !== 0 || spanOf(ts) > S) continue

        const cs = canonical(ts)
        const key = keyString(cs)

        if (seen.has(key)) continue

        seen.set(key, configs.length)
        configs.push(cs)
      }
    }
  }

  return { sector, configs, index: seen }
}

export type Image = { index: number; re: number; im: number }

// the pieces before the stream, on one configuration: the list of (tokens, amplitude) it becomes
function preStream(sector: LineSector, ts: readonly Token[], withCost: boolean): { ts: Token[]; amp: C }[] {
  const N = lightN(sector.D)
  let amp: C = [1, 0]

  if (withCost && !sector.slant) {
    const th = ((sector.area ? -0.5 : -1) * Math.PI * spanOf(ts)) / N

    amp = [Math.cos(th), Math.sin(th)]
  }

  // docks holding two loves of one flavor
  const lone: number[] = []

  for (let p = 0; p < 3; p++) {
    let partner = -1

    for (let q = 0; q < 3; q++) if (q !== p && ts[q]!.f === ts[p]!.f && ts[q]!.x === ts[p]!.x) partner = q

    if (partner < 0) lone.push(p)
    else if (p < partner) {
      // det C, the meeting, the flip
      amp = cmul(amp, sector.fine === undefined || sector.fullDock ? OMEGA : fineCoin(sector.fine).det)
      amp = cmul(amp, OMEGA)

      const u = contactUnit(sector) % 6

      if (u === 3) amp = [-amp[0], -amp[1]]
      else if (u !== 0) amp = cmul(amp, [Math.cos((Math.PI * u) / 3), Math.sin((Math.PI * u) / 3)])
      if (sector.mix && sector.lift) amp = [amp[0] / 2, amp[1] / 2]
    }
  }

  const out: { ts: Token[]; amp: C }[] = []
  if (sector.mix && sector.fine !== undefined) throw new Error('coined-line-bloch: the fine coin is not written with the mixer')

  const keep = sector.mix ? MIX_KEEP : sector.fine === undefined ? KEEP : fineCoin(sector.fine).keep
  const cross = sector.mix ? MIX_CROSS : sector.fine === undefined ? CROSS : fineCoin(sector.fine).cross

  for (let mask = 0; mask < 1 << lone.length; mask++) {
    const next = ts.map(t => ({ ...t }))
    let a = amp

    lone.forEach((p, n) => {
      if ((mask >> n) & 1) {
        next[p]!.j = 1 - next[p]!.j
        a = cmul(a, cross)
      } else a = cmul(a, keep)
    })

    if (withCost && sector.slant) {
      const th = (-Math.PI * slantSpan(next)) / N

      a = cmul(a, [Math.cos(th), Math.sin(th)])
    }

    out.push({ ts: next, amp: a })
  }

  return out
}

const signed = (sector: LineSector): boolean => sector.statistics !== 'native'

// one beat of the Bloch operator at momentum K on one basis configuration
export function lineColumn(basis: LineBasis, K: number, col: number, withCost = true): Image[] {
  const { sector } = basis
  const S = sector.box
  const acc = new Map<number, C>()

  for (const { ts, amp } of preStream(sector, basis.configs[col]!, withCost)) {
    let moved = ts.map(t => ({ ...t, x: t.x + (t.j === 0 ? 1 : -1) }))
    let a = amp

    if (spanOf(moved) > S) moved = ts.map(t => ({ ...t, j: 1 - t.j }))

    if (withCost && sector.area && !sector.slant) {
      const th = (-0.5 * Math.PI * spanOf(moved)) / lightN(sector.D)

      a = cmul(a, [Math.cos(th), Math.sin(th)])
    }

    if (signed(sector)) {
      const s = reorderSign(ts, moved)

      if (s < 0) a = [-a[0], -a[1]]
    }

    const shift = Math.min(...moved.map(t => t.x))
    const anchored = canonical(moved.map(t => ({ ...t, x: t.x - shift })))
    const at = basis.index.get(keyString(anchored))

    if (at === undefined) throw new Error('coined-line-bloch: an image left the basis')

    a = cmul(a, [Math.cos(-K * shift), Math.sin(-K * shift)])

    const o = acc.get(at)

    acc.set(at, o ? [o[0] + a[0], o[1] + a[1]] : a)
  }

  return [...acc].map(([index, [re, im]]) => ({ index, re, im }))
}

// ---- the ring form (no box, no K, positions mod L), for the comparison with the exact knit ----

export type RingState = Map<string, { ts: Token[]; amp: C }>

export function ringBeat(sector: LineSector, L: number, state: RingState): RingState {
  const out: RingState = new Map()

  for (const { ts, amp } of state.values()) {
    for (const piece of preStream(sector, ts, false)) {
      const moved = piece.ts.map(t => ({ ...t, x: (((t.x + (t.j === 0 ? 1 : -1)) % L) + L) % L }))
      let a = cmul(amp, piece.amp)

      if (signed(sector) && reorderSign(piece.ts, moved) < 0) a = [-a[0], -a[1]]

      const cs = canonical(moved)
      const key = keyString(cs)
      const o = out.get(key)

      out.set(key, o ? { ts: cs, amp: [o.amp[0] + a[0], o.amp[1] + a[1]] } : { ts: cs, amp: a })
    }
  }

  return out
}

// NOTE: the ring's sign is the reordering sign by position in [0, L); for three loves the wrap is periodic, and any
// other order of modes differs by a fixed sign per configuration, so probabilities are order-free.
export const ringKey = (ts: readonly { x: number; j: number; f: number }[]): string => keyString(canonical(ts.map(t => ({ ...t }))))

// ---- the reduced operator on a subspace of the configuration basis ----

export type SubBasis = { vectors: { idx: number[]; c: number[] }[]; owner: Map<number, { a: number; c: number }[]> }

export function wholeBasis(basis: LineBasis): SubBasis {
  const vectors = basis.configs.map((_, i) => ({ idx: [i], c: [1] }))
  const owner = new Map<number, { a: number; c: number }[]>()

  basis.configs.forEach((_, i) => owner.set(i, [{ a: i, c: 1 }]))

  return { vectors, owner }
}

// the flavor-permutation sectors of [0, 1, 2]: 'sym' ([3]), 'anti' ([1,1,1]), 'mixed' (one copy of [2,1]: the
// (01)-even part of its isotypic component). The anchor (least position) is flavor-blind, so a permutation of flavors
// acts on the basis with no phase.
const PERMS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [1, 0, 2],
  [2, 1, 0],
  [0, 2, 1],
  [1, 2, 0],
  [2, 0, 1],
]
const PARITY = [1, -1, -1, -1, 1, 1]

function actFlavors(basis: LineBasis, i: number, p: readonly number[]): number {
  const ts = basis.configs[i]!.map(t => ({ ...t, f: p[t.f]! }))
  const at = basis.index.get(keyString(canonical(ts)))

  if (at === undefined) throw new Error('coined-line-bloch: a flavor permutation left the basis')

  return at
}

export function flavorSector(basis: LineBasis, kind: 'sym' | 'anti' | 'mixed'): SubBasis {
  const done = new Uint8Array(basis.configs.length)
  const vectors: { idx: number[]; c: number[] }[] = []
  const owner = new Map<number, { a: number; c: number }[]>()
  const addVector = (m: Map<number, number>): void => {
    const idx: number[] = []
    const c: number[] = []

    for (const [i, v] of m) {
      if (Math.abs(v) < 1e-12) continue
      idx.push(i)
      c.push(v)
    }

    if (idx.length === 0) return

    const a = vectors.length

    vectors.push({ idx, c })
    idx.forEach((i, n) => owner.set(i, [...(owner.get(i) ?? []), { a, c: c[n]! }]))
  }

  for (let i = 0; i < basis.configs.length; i++) {
    if (done[i]) continue

    const orbit = PERMS.map(p => actFlavors(basis, i, p))

    for (const o of orbit) done[o] = 1

    if (kind === 'sym' || kind === 'anti') {
      const m = new Map<number, number>()

      orbit.forEach((o, k) => m.set(o, (m.get(o) ?? 0) + (kind === 'sym' ? 1 : PARITY[k]!)))

      let n2 = 0

      for (const v of m.values()) n2 += v * v
      if (n2 < 1e-18) continue

      const f = 1 / Math.sqrt(n2)

      for (const [o, v] of m) m.set(o, v * f)
      addVector(m)
      continue
    }

    // mixed: Q = (1 + s)(2 e - c - c^2) on each orbit element, Gram-Schmidt. s = (01), c = the 3-cycle (1 2 0)
    const s = [1, 0, 2]
    const c = [1, 2, 0]
    const c2 = [2, 0, 1]
    const kept: Map<number, number>[] = []

    for (const start of orbit) {
      const w = new Map<number, number>()
      const add = (at: number, v: number): void => void w.set(at, (w.get(at) ?? 0) + v)

      add(start, 2)
      add(actFlavors(basis, start, c), -1)
      add(actFlavors(basis, start, c2), -1)

      const u = new Map<number, number>()

      for (const [at, v] of w) {
        u.set(at, (u.get(at) ?? 0) + v)

        const sat = actFlavors(basis, at, s)

        u.set(sat, (u.get(sat) ?? 0) + v)
      }

      for (const k of kept) {
        let dot = 0

        for (const [at, v] of u) dot += v * (k.get(at) ?? 0)
        for (const [at, v] of k) u.set(at, (u.get(at) ?? 0) - dot * v)
      }

      let n2 = 0

      for (const v of u.values()) n2 += v * v
      if (n2 < 1e-12) continue

      const f = 1 / Math.sqrt(n2)

      for (const [at, v] of u) u.set(at, v * f)
      kept.push(u)
    }

    for (const k of kept) addVector(k)
  }

  return { vectors, owner }
}

export type LineReduced = { dim: number; re: Float64Array; im: Float64Array; leak: number; unitarity: number }

export function lineReduced(basis: LineBasis, sub: SubBasis, K: number): LineReduced {
  const dim = sub.vectors.length
  const re = new Float64Array(dim * dim)
  const im = new Float64Array(dim * dim)
  let leak = 0
  let unitarity = 0

  sub.vectors.forEach((v, col) => {
    const acc = new Map<number, C>()

    v.idx.forEach((i, m) => {
      for (const img of lineColumn(basis, K, i)) {
        const w: C = [img.re * v.c[m]!, img.im * v.c[m]!]
        const o = acc.get(img.index)

        acc.set(img.index, o ? [o[0] + w[0], o[1] + w[1]] : w)
      }
    })

    let total = 0

    for (const [i, w] of acc) {
      total += w[0] * w[0] + w[1] * w[1]

      for (const { a, c } of sub.owner.get(i) ?? []) {
        re[a * dim + col] = re[a * dim + col]! + c * w[0]
        im[a * dim + col] = im[a * dim + col]! + c * w[1]
      }
    }

    let inside = 0

    for (let a = 0; a < dim; a++) inside += re[a * dim + col]! ** 2 + im[a * dim + col]! ** 2

    leak = Math.max(leak, total - inside)
    unitarity = Math.max(unitarity, Math.abs(total - 1))
  })

  return { dim, re, im, leak, unitarity }
}

// ---- the first-quantized reading (E-SPN-0087's instruments), at K = 0 ----

export function readingBloch(sector: LineSector): Bloch {
  return blochSpace(boxSpec(THREE, sector.D, sector.box))
}

const ASSIGN3 = PERMS

// a configuration vector (in the configuration basis) as a first-quantized vector on E-SPN-0087's basis: each
// configuration spread over the assignments of its tokens to token slots 0, 1, 2 that keep each flavor's tokens
// among themselves, with the statistics sign
export function firstQuantized(basis: LineBasis, b: Bloch, cre: Float64Array, cim: Float64Array): Vec {
  const v = { re: new Float64Array(b.size), im: new Float64Array(b.size) }
  const fl = basis.sector.flavors
  const assignments = ASSIGN3.map((p, k) => ({ p, sign: PARITY[k]! })).filter(({ p }) => p.every((q, t) => fl[q] === fl[t]))
  const weight = 1 / Math.sqrt(assignments.length)
  const sign = basis.sector.statistics !== 'native'

  basis.configs.forEach((ts, i) => {
    const zr = cre[i]!
    const zi = cim[i]!

    if (zr === 0 && zi === 0) return

    for (const { p, sign: s } of assignments) {
      // token slot t holds configuration token p[t]
      const xs = [0, 1, 2].map(t => ts[p[t]!]!.x)
      const js = [0, 1, 2].map(t => ts[p[t]!]!.j)
      const d = xs.map(x => x - xs[0]!)
      const c = b.configOf(d)

      if (c < 0) throw new Error('coined-line-bloch: a first-quantized configuration is outside the reading box')

      const at = b.index(c, js[0]! * 4 + js[1]! * 2 + js[2]!)
      const f = (sign ? s : 1) * weight

      v.re[at] = v.re[at]! + f * zr
      v.im[at] = v.im[at]! + f * zi
    }
  })

  return v
}

// the contact energy of one full dock (the principal value of its non-kinetic phase: the meeting, and the flip's
// sign in 'fermion'), times the weight on full docks
export function contactPhase(statistics: Statistics): number {
  return statistics === 'fermion' ? Math.PI / 3 : (-2 * Math.PI) / 3
}

// the same for a sector with its contact unit: the principal value of -(2 pi/3 + pi unit/3) (fermion: pi/3, token and
// native: -2 pi/3, as contactPhase)
export function contactEnergy(sector: LineSector): number {
  return wrapE((2 * Math.PI) / 3 + (Math.PI * contactUnit(sector)) / 3)
}

function fullDocks(ts: readonly Token[]): number {
  let n = 0

  for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) if (ts[p]!.f === ts[q]!.f && ts[p]!.x === ts[q]!.x) n++

  return n
}

export type LineLevel = { unwrapped: number; energy: number; reference: number; even: number; spinHalf: number; mean: number; tailN: number; contact: number; cre: Float64Array; cim: Float64Array }

export type LineLightest = { lightest: LineLevel; next: number; particleLevels: number; worstOffset: number; dim: number; residual: number; leak: number; unitarity: number }

const wrapE = (phase: number): number => {
  let e = -phase

  while (e <= -Math.PI) e += 2 * Math.PI
  while (e > Math.PI) e -= 2 * Math.PI

  return e
}

export type LevelReading = { even: number; kinetic: number; spinHalf: number; mean: number; tailN: number; contact: number }

// the first-quantized readings of one configuration vector: the particle reading (even) and its kinetic energy, the
// spin one half share, the mean string, the tail beyond N, and the weight on full docks (the vector need not be
// normalized; the contact weight is divided by its norm, the others are E-SPN-0087's readers)
function levelReading(basis: LineBasis, b: Bloch, read: ReturnType<typeof branchReader>, cre: Float64Array, cim: Float64Array): LevelReading {
  const v = firstQuantized(basis, b, cre, cim)
  const reading = read(v)
  let contact = 0
  let total = 0

  basis.configs.forEach((ts, i) => {
    const p = cre[i]! ** 2 + cim[i]! ** 2

    total += p
    contact += p * fullDocks(ts)
  })
  contact /= total

  return { even: reading.even, kinetic: reading.kinetic, spinHalf: 1 - quartetShare(b, v), mean: stringMoments(b, v).mean, tailN: tailWeight(b, v, lightN(basis.sector.D)), contact }
}

// E-SPN-0076's lightest level on a sector's subspace at K = 0: levels of the particle sector (branch reading at least
// 1/2 even), each unwrapped to the representative nearest its reference energy (kinetic + sigma <l> + contact)
export function lineLightest(basis: LineBasis, sub: SubBasis): LineLightest {
  const all = lineLevels(basis, sub)
  let best: LineLevel | undefined
  let next = Number.NaN
  let worstOffset = 0

  for (const level of all.levels) {
    const { unwrapped } = level

    worstOffset = Math.max(worstOffset, Math.abs(unwrapped - level.reference))

    if (!best || unwrapped < best.unwrapped) {
      if (best) next = Number.isNaN(next) ? best.unwrapped : Math.min(next, best.unwrapped)
      best = level
    } else if (Number.isNaN(next) || unwrapped < next) next = unwrapped
  }

  if (!best) throw new Error('coined-line-bloch: no particle-sector level')

  return { lightest: best, next, particleLevels: all.levels.length, worstOffset, dim: all.dim, residual: all.residual, leak: all.leak, unitarity: all.unitarity }
}

// every particle-sector level at K = 0 (branch reading at least 1/2 even), in the eigensolver's order, each unwrapped as
// lineLightest unwraps it (E-SPN-0107 reads the most tightly held one, the least mean string, where the unwrapping's
// reference, written for the working coin, no longer ranks the levels)
export function lineLevels(basis: LineBasis, sub: SubBasis): { levels: LineLevel[]; dim: number; residual: number; leak: number; unitarity: number } {
  const red = lineReduced(basis, sub, 0)
  const eig = unitaryEigen(red.dim, red.re, red.im)
  const b = readingBloch(basis.sector)
  const read = branchReader(b, 2 * basis.sector.box + 6)
  const N = lightN(basis.sector.D)
  const sigma = Math.PI / N
  const ec = contactEnergy(basis.sector)
  const levels: LineLevel[] = []

  eig.phases.forEach((ph, k) => {
    const cv = eig.vectors[k]!
    const cre = new Float64Array(basis.configs.length)
    const cim = new Float64Array(basis.configs.length)

    sub.vectors.forEach((bv, a) => {
      const xr = cv.re[a]!
      const xi = cv.im[a]!

      bv.idx.forEach((i, m) => {
        cre[i] = cre[i]! + bv.c[m]! * xr
        cim[i] = cim[i]! + bv.c[m]! * xi
      })
    })

    const r = levelReading(basis, b, read, cre, cim)

    if (r.even < 0.5) return

    const energy = wrapE(ph)
    const reference = r.kinetic + sigma * r.mean + ec * r.contact
    const unwrapped = energy + 2 * Math.PI * Math.round((reference - energy) / (2 * Math.PI))

    levels.push({ unwrapped, energy, reference, even: r.even, spinHalf: r.spinHalf, mean: r.mean, tailN: r.tailN, contact: r.contact, cre, cim })
  })

  return { levels, dim: red.dim, residual: eig.residual, leak: red.leak, unitarity: red.unitarity }
}

// the whole spectrum's quasi-energies at K, sorted (for the calibration against E-SPN-0087's operator)
export function lineSpectrum(basis: LineBasis, sub: SubBasis, K: number): number[] {
  const red = lineReduced(basis, sub, K)

  return unitaryEigen(red.dim, red.re, red.im)
    .phases.map(wrapE)
    .sort((a, b) => a - b)
}

// the level followed from K = 0 to pi in `steps` steps by inverse iteration from the previous vector (E-SPN-0087's
// followBand, on this operator): consecutive overlaps, and the quasi-energy unwrapped by continuity
export function followLine(basis: LineBasis, sub: SubBasis, start: LineLevel, steps: number): { energies: number[]; bandwidth: number; velocity: number; minOverlap: number; worstResidual: number } {
  const dim = sub.vectors.length
  let prev: Vec = { re: new Float64Array(dim), im: new Float64Array(dim) }

  sub.vectors.forEach((bv, a) => {
    let r = 0
    let i = 0

    bv.idx.forEach((ci, m) => {
      r += bv.c[m]! * start.cre[ci]!
      i += bv.c[m]! * start.cim[ci]!
    })
    prev.re[a] = r
    prev.im[a] = i
  })

  const energies = [start.unwrapped]
  let minOverlap = 1
  let worstResidual = 0

  for (let s = 1; s <= steps; s++) {
    const K = (Math.PI * s) / steps
    const red = lineReduced(basis, sub, K)
    const it = inverseIterate(red, prev, 6)
    let r = 0
    let i = 0
    let n1 = 0
    let n2 = 0

    for (let a = 0; a < dim; a++) {
      r += prev.re[a]! * it.vector.re[a]! + prev.im[a]! * it.vector.im[a]!
      i += prev.re[a]! * it.vector.im[a]! - prev.im[a]! * it.vector.re[a]!
      n1 += prev.re[a]! ** 2 + prev.im[a]! ** 2
      n2 += it.vector.re[a]! ** 2 + it.vector.im[a]! ** 2
    }

    minOverlap = Math.min(minOverlap, Math.hypot(r, i) / Math.sqrt(n1 * n2))
    worstResidual = Math.max(worstResidual, it.residual)

    const last = energies[energies.length - 1]!

    energies.push(it.energy + 2 * Math.PI * Math.round((last - it.energy) / (2 * Math.PI)))
    prev = it.vector
  }

  let velocity = 0

  for (let s = 1; s < energies.length; s++) velocity = Math.max(velocity, Math.abs(energies[s]! - energies[s - 1]!) / (Math.PI / steps))

  return { energies, bandwidth: Math.max(...energies) - Math.min(...energies), velocity, minOverlap, worstResidual }
}

// ---- the mixed sector (E-SPN-0095): one beat on a vector, the survival of a level, the longest-lived level ----

// one beat of the Bloch operator at K on a configuration vector (the sector's own images; with `mix` the part that
// leaves the bulk line is dropped; `withCost` false leaves out the drift cost, the stand-in's string, E-SPN-0102)
export function lineImage(basis: LineBasis, K: number, cre: Float64Array, cim: Float64Array, withCost = true): { re: Float64Array; im: Float64Array } {
  const re = new Float64Array(basis.configs.length)
  const im = new Float64Array(basis.configs.length)

  for (let i = 0; i < basis.configs.length; i++) {
    const zr = cre[i]!
    const zi = cim[i]!

    if (zr === 0 && zi === 0) continue

    for (const img of lineColumn(basis, K, i, withCost)) {
      re[img.index] = re[img.index]! + zr * img.re - zi * img.im
      im[img.index] = im[img.index]! + zr * img.im + zi * img.re
    }
  }

  return { re, im }
}

export type Survival = { amplitude: [number, number]; returned: number; onLine: number; energy: number }

// a level of an unmixed sector under one beat of `mixed` (the same flavors and box, so the same configuration basis):
// its return amplitude <v|U v> / <v|v>, the return probability |.|^2, the weight left in the sector ||U v||^2 / <v|v>,
// and the return phase's energy, unwrapped to the representative nearest the level's
export function lineSurvival(mixed: LineBasis, level: LineLevel): Survival {
  const w = lineImage(mixed, 0, level.cre, level.cim)
  let n = 0
  let r = 0
  let i = 0
  let out = 0

  for (let k = 0; k < mixed.configs.length; k++) {
    const vr = level.cre[k]!
    const vi = level.cim[k]!

    n += vr * vr + vi * vi
    r += vr * w.re[k]! + vi * w.im[k]!
    i += vr * w.im[k]! - vi * w.re[k]!
    out += w.re[k]! ** 2 + w.im[k]! ** 2
  }

  const e = wrapE(Math.atan2(i, r))

  return { amplitude: [r / n, i / n], returned: (r * r + i * i) / (n * n), onLine: out / n, energy: e + 2 * Math.PI * Math.round((level.unwrapped - e) / (2 * Math.PI)) }
}

export type LongestLived = { dim: number; modulus: number; energy: number; unwrapped: number; next: number; reading: LevelReading; overlap: number }

// the eigenvalue of largest modulus of the (compressed, not unitary) operator at K = 0, whole basis: its modulus (the
// amplitude kept per beat), its energy (unwrapped nearest `near`), the next largest modulus, its eigenvector's readings,
// and its overlap |<u|v>| with a given level
export function lineLongestLived(basis: LineBasis, near: number, level: LineLevel): LongestLived {
  const red = lineReduced(basis, wholeBasis(basis), 0)
  const eig = complexEigenvalues({ re: red.re, im: red.im, n: red.dim })
  const order = eig.re.map((x, k) => ({ k, m: Math.hypot(x, eig.im[k]!) })).sort((p, q) => q.m - p.m)
  const top = order[0]!
  const value: [number, number] = [eig.re[top.k]!, eig.im[top.k]!]
  const u = complexEigenvector({ re: red.re, im: red.im, n: red.dim, value })
  const e = wrapE(Math.atan2(value[1], value[0]))
  const b = readingBloch(basis.sector)
  const read = branchReader(b, 2 * basis.sector.box + 6)
  let r = 0
  let i = 0
  let nv = 0

  for (let k = 0; k < red.dim; k++) {
    r += u.re[k]! * level.cre[k]! + u.im[k]! * level.cim[k]!
    i += u.re[k]! * level.cim[k]! - u.im[k]! * level.cre[k]!
    nv += level.cre[k]! ** 2 + level.cim[k]! ** 2
  }

  return { dim: red.dim, modulus: top.m, energy: e, unwrapped: e + 2 * Math.PI * Math.round((near - e) / (2 * Math.PI)), next: order[1]?.m ?? 0, reading: levelReading(basis, b, read, u.re, u.im), overlap: Math.hypot(r, i) / Math.sqrt(nv) }
}
