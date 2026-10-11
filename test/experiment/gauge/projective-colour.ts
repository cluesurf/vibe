// PROJECTIVE COLOUR: DOES A LINK THAT MOVES ONLY TRIALITY-0 CONTENT GIVE A CONSISTENT WALK? (E-FRC-0312, item 0098 of
// vibe/roadmap/moving-matter, research/confinement-many-walker.md section 3, candidate P; decisions 020 and 021).
// Explores whether confinement could be a selection rule forced by the base's own link data. Each R* link holds one of the
// 216 ASL(2, 3) grid moves, and its lift to Sigma(648) (U, omega U or omega^2 U) is a choice the rule does not make
// (code/measure/holonomy-caging.ts:9-14, Sigma(648) non-split). Lambda^k(omega I) = omega^k, so only triality-0 content
// (leptons Lambda^0 and Lambda^3, q-qbar, qqq) carries a linear representation of the link group.
//
// STEP 1 (exact, Q(zeta_9)). Lambda^k(omega I) = omega^k I for k 0..3 on love, omega^(-k) I on fear (Lambda^k(conj R)).
// The centre of Sigma(648) is {I, omega I, omega^2 I}. Non-split: a complement H (order 216, H meets the centre in I)
// maps isomorphically onto Sigma(648)/Z3, so it holds exactly one lift of each of the four generators' images, and those
// lifts generate it. The 81 lift choices omega^(j_i) G_i of the four published generators therefore reach every complement;
// each is closed exactly (cappedClosure) and none may be a complement.
//
// STEP 2 (R* as built, side 4 bulk box, the 'weyl' section). The one-body cycle of the cage engine (holonomy-caging
// cagingBeat, the operator of E-SPN-0196 and E-FRC-0304) with the link carried as Lambda^k(R) on love and Lambda^k(conj R) on
// fear. Its spectrum is read EXACTLY through E-FRC-0304's reduction (hash-localization.ts:7-20, witnessed there): the cycle
// is 1 off span(S, F) and e^(+-i eps) on it with cos eps = cos mu + sigma^2 (1 - cos mu), sigma^2 the levels of H = X X^dag,
// X(x, y) = sum over d with y + r_d = x of G_d (x) Lambda^k(R(y, d)), and one register irrep copy carries every level of H
// once. So the cycle's spectrum, flat multiplicity included, is a monotone function of H's sorted levels, and two cycles
// have equal spectra iff their H have. The sector and the operator are copied from hash-localization (an experiment never
// imports another). Fields: 'base' (R*'s hash), 'onelink' (ONE link's lift times omega, its reverse times omega^-1, so a
// link and its reverse stay inverse), 'control' (a pure-gauge Z3 site transform R'(x, d) = omega^(h(x + r_d) - h(x)) R(x, d),
// h(x) = linkStart(x, 3, 5)).
//
// STEP 3 (the lift-free rule on the 1d line of E-FRC-0307, both coins: hadamard and R*'s line coin Q0, Q1). Walkers are
// distinguishable (colour labels; the line carries no colour links, so a colour-antisymmetric hadron evolves as its
// distinguishable labels do), each with a two-state coin (its direction of motion, + or -) and a triality t in Z3. One beat:
// the coin on each walker, then the move. At each link (x, x + 1) the walkers in the two facing slots, (x, +) and (x + 1, -),
// carry the ORIENTED triality flux F = sum t forward - sum t backward (research 3a, 3c: the lift phase of a group crossing
// link l is omega^(z_l F_l)). If F = 0 mod 3 every facing walker crosses ('free' motion); otherwise
//   reflect   every facing walker stays at its site with its slot turned round (as at R*'s hard walls), and
//   stay      every facing walker stays with its slot unchanged (the other completion, read ungated),
//   free      (control) every walker always crosses.
// Each is a bijection on configurations (the post-move pair at a link fixes which branch ran, since a swap keeps F = 0 and a
// reflection keeps F != 0), hence unitary; read as an exact permutation check on every configuration of the relative sector.
// Ring of 2048 sites. Starts, each the internally mixed start (I / 2^n over the coin basis) at one site:
//   lone      one t 1 walker
//   meson     t 1 and t 2 co-located
//   baryon    three t 1 co-located (the colour-antisymmetric qqq: Pauli holds per walker over colour x coin)
//   lepton    one t 0 walker, which must equal the free walk to 1e-12
// READS to t 1e4: norm drift; each walker's rms from the cluster centre (minimum image); the centre of mass's rms from the
// start, its exponent (log rms against log t over the last decade before any weight reaches within 32 sites of the
// antipode, edge 1e-12) and speed (rms / t there). The mirror: trace moments t_m = tr U^m, m = 1..M cycles, over the
// WHOLE total-momentum-0 sector (relative coordinates, the last walker at 0), |t_m - conj t_m| / dim, as E-FRC-0308; on the
// 2048 ring for one and two walkers, and for three walkers on rings 12, 18 and 24 (the 2048 ring's three-walker sector,
// 3.4e7 states, is out of reach; LIMIT), plus the co-located cluster block, which is closed and the same on every ring.
// J (rstar coin): J = (P_S^(x)n)^dag K with U = (T' P_D T') P_S, T' = move after the coin swap X, an involution (checked),
// |U J U phi - J phi| / |phi| on a hashed phi, against J0 = K alone (teeth). On the hadamard coin U is real, so K alone is
// its mirror and J is not read. UNGATED, the mirror across momenta: on the rstar coin K Q0 K = -Z Q1 Z (Z = diag(1, -1)),
// and Z commutes with a crossing but anticommutes with a reflection's slot flip, so the reflect rule's mirror operator is
// Z (-1)^x a walker and maps total momentum K to K + n pi: read max_m |t_m(0) - conj t_m(pi)| / dim. The stay rule is not
// a permutation on three walkers (a staying group and a crossing group can land in one slot from two configurations), so
// the relative beat adds into its image, and the stay rule's whole-sector reads are of that non-unitary map.
//
// GATES (fixed 2026-10-10 in the item, before any read):
//   VIABLE  STEP 1 and STEP 2 hold as stated (Lambda^0, Lambda^3 unchanged to 1e-12 under both changes; Lambda^1, Lambda^2
//           unchanged under the control to 1e-12 and changed above 1e-6 under the one-link change; read on both tones),
//           and the reflect rule is unitary to 1e-12, mirror symmetric to 1e-10, the lone third's rms <= 2 sites to t 1e4,
//           the lepton control exact, and the meson and the baryon each move with exponent >= 0.9 or speed >= 0.05 site a
//           beat (on both coins)
//   KILL    STEP 2 shows Lambda^1 lift-independent, or no cluster moves (speed < 1e-3), or the reflect rule breaks the
//           mirror above 1e-6 and so does stay
//   OPEN    otherwise, naming the clause
// UNGATED: meson and baryon speed over the lepton's; the stay rule's reads.
// Lead's prediction: VIABLE.
//
// DETERMINISM: no random numbers (hashed vectors from a murmur3 finalizer). EXACT: STEP 1. FLOAT: STEPS 2 and 3, each
// verdict a number against a fixed tolerance.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { linkStart } from '@/code/rule/vibe-weave'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { partnerBasis } from '@/code/measure/register-meson'
import { hermitianEigenRows } from '@/code/algebra/linear/eig-hermitian-householder'
import { reverseGap, ruleField, sigmaTable } from '@/code/measure/color-gates'
import { bulkBox } from '@/code/measure/color-slab'
import { SIGMA_GENERATORS_EXACT, sigmaElements } from '@/code/measure/holonomy-caging'
import {
  cappedClosure,
  conj,
  det3,
  equals,
  identityMatrix,
  matrixKey,
  mul,
  ONE,
  scaleMatrix,
  sub,
  ZERO,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'

const SLOTS = 24
const REG = 8
const ORDER = 648

export const SIDE = 4
export const RING = 2048
export const T_MAX = 10000
export const EDGE = 32
export const EDGE_TOL = 1e-12
export const MOMENTS = 16
export const RINGS3 = [12, 18, 24] as const
export const EXACT = 1e-12
export const CHANGED = 1e-6
export const MIRROR_HOLDS = 1e-10
export const MIRROR_FAILS = 1e-6
export const LONE_RMS = 2
export const EXPONENT_GATE = 0.9
export const SPEED_GATE = 0.05
export const STILL = 1e-3
export const TEETH = 1e-3

const MU = unitAngle(ringUnit(-1, 4))

const fmix = (h0: number): number => {
  let h = h0 | 0

  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16

  return (h >>> 0) / 4294967296 - 0.5
}

// ---- STEP 1, exact ----

const SUBSETS: number[][][] = [[[]], [[0], [1], [2]], [[0, 1], [0, 2], [1, 2]], [[0, 1, 2]]]

function detExact(m: Ninth[][]): Ninth {
  if (m.length === 0) {
    return ONE
  }

  if (m.length === 1) {
    return m[0]![0]!
  }

  if (m.length === 2) {
    return sub(mul(m[0]![0]!, m[1]![1]!), mul(m[0]![1]!, m[1]![0]!))
  }

  return det3(m)
}

// Lambda^k of a 3 x 3 matrix: entry (I, J) the minor on rows I, columns J
export function exteriorExact(g: NinthMatrix, k: number): Ninth[][] {
  const S = SUBSETS[k]!

  return S.map(I => S.map(J => detExact(I.map(i => J.map(j => g[i]![j]!)))))
}

const omegaPower = (k: number): Ninth => zetaPower(3 * (((k % 3) + 3) % 3))
const scalarMatrix = (n: number, x: Ninth): Ninth[][] => scaleMatrix(identityMatrix(n), x)
const sameExact = (a: NinthMatrix, b: NinthMatrix): boolean =>
  a.length === b.length && a.every((row, i) => row.every((x, j) => equals(x, b[i]![j]!)))

export type Step1 = {
  // [tone][k]: Lambda^k(omega I) = omega^(+-k) I exactly
  exterior: boolean[][]
  // Lambda^k(omega g) = omega^(+-k) Lambda^k(g) on every element, both tones
  exteriorAll: boolean
  order: number
  centre: number
  omegaIn: boolean
  // the 81 lift choices of the four generators
  choices: number
  orders: Record<string, number>
  complements: number
  seconds: number
}

export function step1(): Step1 {
  const t0 = Date.now()
  const { elements, closed } = sigmaElements()
  const w = scalarMatrix(3, omegaPower(1))
  const exterior = [0, 1].map(tone =>
    [0, 1, 2, 3].map(k => {
      const m = tone === 0 ? w : w.map(r => r.map(conj))
      const n = SUBSETS[k]!.length

      return sameExact(exteriorExact(m, k), scalarMatrix(n, omegaPower(tone === 0 ? k : -k)))
    }),
  )
  let exteriorAll = true

  for (const g of elements) {
    const wg = scaleMatrix(g, omegaPower(1))

    for (let tone = 0; tone < 2 && exteriorAll; tone++) {
      const a = tone === 0 ? g : g.map(r => r.map(conj))
      const b = tone === 0 ? wg : wg.map(r => r.map(conj))

      for (let k = 0; k < 4 && exteriorAll; k++) {
        exteriorAll = sameExact(exteriorExact(b, k), scaleMatrix(exteriorExact(a, k), omegaPower(tone === 0 ? k : -k)))
      }
    }
  }

  const scalar = (g: NinthMatrix): boolean =>
    g.every((row, i) => row.every((x, j) => (i === j ? equals(x, g[0]![0]!) : equals(x, ZERO))))
  const centre = elements.filter(scalar).length
  const keys = new Set(elements.map(matrixKey))
  const omegaKey = matrixKey(w)
  const orders: Record<string, number> = {}
  let complements = 0

  for (let c = 0; c < 81; c++) {
    const js = [0, 1, 2, 3].map(i => Math.floor(c / 3 ** i) % 3)
    const gens = SIGMA_GENERATORS_EXACT.map((g, i) => scaleMatrix(g, omegaPower(js[i]!)))
    const cl = cappedClosure(gens, ORDER)
    const has = cl.elements.some(e => matrixKey(e) === omegaKey)
    const n = cl.closed ? cl.elements.length : -1

    orders[String(n)] = (orders[String(n)] ?? 0) + 1

    if (cl.closed && n === ORDER / 3 && !has) {
      complements++
    }
  }

  return {
    exterior,
    exteriorAll,
    order: closed ? elements.length : -1,
    centre,
    omegaIn: keys.has(omegaKey),
    choices: 81,
    orders,
    complements,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- STEP 2: R*'s one-body cycle, Lambda^k carriage, through E-FRC-0304's reduction ----

// Lambda^k of a float 3 x 3 complex matrix (18 numbers, re/im interleaved), optionally conjugated first
export function exteriorFloat(m: Float64Array, k: number, conjugate: boolean): Float64Array {
  const S = SUBSETS[k]!
  const n = S.length
  const out = new Float64Array(2 * n * n)
  const at = (i: number, j: number): [number, number] => [m[2 * (3 * i + j)]!, conjugate ? -m[2 * (3 * i + j) + 1]! : m[2 * (3 * i + j) + 1]!]
  const cm = (a: [number, number], b: [number, number]): [number, number] => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
  const det = (rows: number[], cols: number[]): [number, number] => {
    if (rows.length === 0) {
      return [1, 0]
    }

    if (rows.length === 1) {
      return at(rows[0]!, cols[0]!)
    }

    if (rows.length === 2) {
      const p = cm(at(rows[0]!, cols[0]!), at(rows[1]!, cols[1]!))
      const q = cm(at(rows[0]!, cols[1]!), at(rows[1]!, cols[0]!))

      return [p[0] - q[0], p[1] - q[1]]
    }

    let r: [number, number] = [0, 0]

    for (let c = 0; c < 3; c++) {
      const minor = det([1, 2], cols.filter(x => x !== c))
      const t = cm(at(0, c), minor)
      const s = c % 2 === 0 ? 1 : -1

      r = [r[0] + s * t[0], r[1] + s * t[1]]
    }

    return r
  }

  S.forEach((I, a) =>
    S.forEach((J, b) => {
      const [re, im] = det(I, J)

      out[2 * (a * n + b)] = re
      out[2 * (a * n + b) + 1] = im
    }),
  )

  return out
}

const gBlock = (E: Float64Array, d: number): number[][] =>
  Array.from({ length: REG }, (_, a) =>
    Array.from({ length: REG }, (_, e) => E[(OPPOSITE[d]! * REG + a) * REG + e]! / Math.sqrt(SLOTS)),
  )

// the commutant of the 24 real register blocks and their transposes (copied from hash-localization.ts:82-159)
function commutantBasis(Gs: number[][][]): number[][] {
  const n = 64
  const rows: number[][] = []

  for (const G of Gs) {
    for (const M of [G, G.map((_, i) => G.map(r => r[i]!))]) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const row = Array<number>(n).fill(0)

          for (let l = 0; l < 8; l++) {
            row[i * 8 + l]! += M[l]![j]!
            row[l * 8 + j]! -= M[i]![l]!
          }

          rows.push(row)
        }
      }
    }
  }

  const A = rows.map(r => r.slice())
  const pivots: number[] = []
  let rank = 0

  for (let c = 0; c < n; c++) {
    let p = -1
    let best = 1e-9

    for (let r = rank; r < A.length; r++) {
      if (Math.abs(A[r]![c]!) > best) {
        best = Math.abs(A[r]![c]!)
        p = r
      }
    }

    if (p < 0) {
      continue
    }

    ;[A[rank], A[p]] = [A[p]!, A[rank]!]

    const pv = A[rank]![c]!

    for (let q = 0; q < n; q++) {
      A[rank]![q]! /= pv
    }

    for (let r = 0; r < A.length; r++) {
      if (r !== rank) {
        const f = A[r]![c]!

        if (f !== 0) {
          for (let q = 0; q < n; q++) {
            A[r]![q]! -= f * A[rank]![q]!
          }
        }
      }
    }

    pivots.push(c)
    rank++
  }

  return Array.from({ length: n }, (_, c) => c)
    .filter(c => !pivots.includes(c))
    .map(f => {
      const v = Array<number>(n).fill(0)

      v[f] = 1
      pivots.forEach((c, r) => {
        v[c] = -A[r]![f]!
      })

      return v
    })
}

export type Sector = { P: Float64Array; G: Float64Array[]; invarianceGap: number; commutantDim: number }

// one copy of one register irrep (copied from hash-localization.ts:161-260, which = 0)
export function registerSector(): Sector {
  const E = partnerBasis()
  const Gs = Array.from({ length: SLOTS }, (_, d) => gBlock(E, d))
  const nulls = commutantBasis(Gs)
  const Jr = new Float64Array(64)
  const Ji = new Float64Array(64)

  nulls.forEach((v, i) =>
    v.forEach((x, q) => {
      Jr[q]! += Math.sin(1.3 * i + 0.7) * x
      Ji[q]! += Math.cos(2.1 * i + 0.3) * x
    }),
  )

  const Hr = new Float64Array(64)
  const Hi = new Float64Array(64)

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      Hr[i * 8 + j] = (Jr[i * 8 + j]! + Jr[j * 8 + i]!) / 2
      Hi[i * 8 + j] = (Ji[i * 8 + j]! - Ji[j * 8 + i]!) / 2
    }
  }

  const eig = hermitianEigenRows(8, Hr, Hi)
  const P = new Float64Array(32)

  for (let v = 0; v < 2; v++) {
    for (let a = 0; a < 8; a++) {
      P[(v * 8 + a) * 2] = eig.vectorsRe[v * 8 + a]!
      P[(v * 8 + a) * 2 + 1] = eig.vectorsIm[v * 8 + a]!
    }
  }

  const gp = (M: number[][], a: number, v: number): [number, number] => {
    let r = 0
    let m = 0

    for (let b = 0; b < 8; b++) {
      r += M[a]![b]! * P[(v * 8 + b) * 2]!
      m += M[a]![b]! * P[(v * 8 + b) * 2 + 1]!
    }

    return [r, m]
  }
  let gap = 0

  const G = Gs.map(Gd => {
    const out = new Float64Array(8)

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        let r = 0
        let m = 0

        for (let a = 0; a < 8; a++) {
          const [xr, xi] = gp(Gd, a, j)
          const pr = P[(i * 8 + a) * 2]!
          const pi = -P[(i * 8 + a) * 2 + 1]!

          r += pr * xr - pi * xi
          m += pr * xi + pi * xr
        }

        out[2 * (2 * i + j)] = r
        out[2 * (2 * i + j) + 1] = m
      }
    }

    const GT = Gd.map((_, i) => Gd.map(row => row[i]!))

    for (let a = 0; a < 8; a++) {
      for (let j = 0; j < 2; j++) {
        const [xr, xi] = gp(Gd, a, j)
        const [yr, yi] = gp(GT, a, j)
        let pr = 0
        let pm = 0
        let qr = 0
        let qm = 0

        for (let i = 0; i < 2; i++) {
          const ar = P[(i * 8 + a) * 2]!
          const ai = P[(i * 8 + a) * 2 + 1]!
          const gr = out[2 * (2 * i + j)]!
          const gi = out[2 * (2 * i + j) + 1]!
          const hr = out[2 * (2 * j + i)]!
          const hi = -out[2 * (2 * j + i) + 1]!

          pr += ar * gr - ai * gi
          pm += ar * gi + ai * gr
          qr += ar * hr - ai * hi
          qm += ar * hi + ai * hr
        }

        gap = Math.max(gap, Math.hypot(xr - pr, xi - pm), Math.hypot(yr - qr, yi - qm))
      }
    }

    return out
  })

  return { P, G, invarianceGap: gap, commutantDim: nulls.length }
}

export type Tone = 'love' | 'fear'
export type FieldName = 'base' | 'onelink' | 'control'

// the three link fields on the side-4 bulk box (element indices into sigmaTable's lifts)
export function step2Fields(): { fields: Record<FieldName, Int32Array>; reverse: Record<FieldName, number>; nb: Int32Array; cells: number; changedLinks: number; controlLinks: number } {
  const box = bulkBox(SIDE)
  const t = sigmaTable()
  const f = t.lifts.floats
  const scalarIndex = (j: number): number =>
    f.findIndex(m => {
      const th = (2 * Math.PI * j) / 3

      // element positions: diagonal (0, 0), (1, 1), (2, 2) = 0, 4, 8; off-diagonal 1, 2, 3, 5, 6, 7
      return [0, 4, 8].every(i => Math.abs(m[2 * i]! - Math.cos(th)) < 1e-12 && Math.abs(m[2 * i + 1]! - Math.sin(th)) < 1e-12) &&
        [1, 2, 3, 5, 6, 7].every(i => Math.abs(m[2 * i]!) < 1e-12 && Math.abs(m[2 * i + 1]!) < 1e-12)
    })
  const z = [0, 1, 2].map(scalarIndex)

  if (z.some(e => e < 0) || z[0] !== t.identity) {
    throw new Error(`step2Fields: centre elements not found (${z.join(',')}, identity ${t.identity})`)
  }

  const base = ruleField('weyl').on(box, 'bulk')
  const onelink = Int32Array.from(base)
  const l0 = 0
  const back = box.nb[l0]! * SLOTS + OPPOSITE[0]!
  const e1 = t.mul[z[1]! * ORDER + base[l0]!]!

  onelink[l0] = e1
  onelink[back] = t.inverse[e1]!

  const control = new Int32Array(base.length)
  const h = (x: number): number => linkStart(x, 3, 5)

  for (let x = 0; x < box.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const l = x * SLOTS + d
      const left = t.mul[z[h(box.nb[l]!)]! * ORDER + base[l]!]!

      control[l] = t.mul[left * ORDER + z[(3 - h(x)) % 3]!]!
    }
  }

  const fields = { base, onelink, control }
  const count = (a: Int32Array): number => a.reduce((s, v, i) => s + (v === base[i] ? 0 : 1), 0)

  return {
    fields,
    reverse: { base: reverseGap(box, base), onelink: reverseGap(box, onelink), control: reverseGap(box, control) },
    nb: box.nb,
    cells: box.cells,
    changedLinks: count(onelink),
    controlLinks: count(control),
  }
}

// the dense H = X X^dag of the Lambda^k carriage on one tone, its levels ascending
export function step2Levels(input: { link: Int32Array; nb: Int32Array; cells: number; sector: Sector; k: number; tone: Tone }): Float64Array {
  const { link, nb, cells, sector, k, tone } = input
  const kc = SUBSETS[k]!.length
  const dim = 2 * kc
  const n = cells * dim
  const mats = sigmaTable().lifts.floats.map(m => exteriorFloat(m, k, tone === 'fear'))
  const bs = dim * dim * 2
  const blk = new Float64Array(cells * SLOTS * bs)

  for (let y = 0; y < cells; y++) {
    for (let d = 0; d < SLOTS; d++) {
      const l = y * SLOTS + d
      const G = sector.G[d]!
      const R = mats[link[l]!]!
      const o = l * bs

      for (let r = 0; r < 2; r++) {
        for (let r2 = 0; r2 < 2; r2++) {
          const gr = G[2 * (2 * r + r2)]!
          const gi = G[2 * (2 * r + r2) + 1]!

          for (let a = 0; a < kc; a++) {
            for (let b = 0; b < kc; b++) {
              const rr = R[2 * (kc * a + b)]!
              const ri = R[2 * (kc * a + b) + 1]!
              const row = r * kc + a
              const col = r2 * kc + b

              blk[o + 2 * (row * dim + col)] = gr * rr - gi * ri
              blk[o + 2 * (row * dim + col) + 1] = gr * ri + gi * rr
            }
          }
        }
      }
    }
  }

  // X^dag column by column, then X: H[:, j] = X X^dag e_j
  const re = new Float64Array(n * n)
  const im = new Float64Array(n * n)
  const tr = new Float64Array(n)
  const ti = new Float64Array(n)

  for (let j = 0; j < n; j++) {
    tr.fill(0)
    ti.fill(0)

    // (X^dag e_j)(y) = sum over d with nb(y, d) = dock(j) of blk(y, d)^dag e_j
    const xj = Math.floor(j / dim)
    const ij = j % dim

    for (let y = 0; y < cells; y++) {
      for (let d = 0; d < SLOTS; d++) {
        const l = y * SLOTS + d

        if (nb[l] !== xj) {
          continue
        }

        const o = l * bs

        for (let c = 0; c < dim; c++) {
          // conj blk[ij][c]
          tr[y * dim + c]! += blk[o + 2 * (ij * dim + c)]!
          ti[y * dim + c]! -= blk[o + 2 * (ij * dim + c) + 1]!
        }
      }
    }

    for (let y = 0; y < cells; y++) {
      for (let d = 0; d < SLOTS; d++) {
        const l = y * SLOTS + d
        const dst = nb[l]! * dim
        const o = l * bs

        for (let i = 0; i < dim; i++) {
          let r = 0
          let m = 0

          for (let c = 0; c < dim; c++) {
            const br = blk[o + 2 * (i * dim + c)]!
            const bi = blk[o + 2 * (i * dim + c) + 1]!
            const xr = tr[y * dim + c]!
            const xi = ti[y * dim + c]!

            r += br * xr - bi * xi
            m += br * xi + bi * xr
          }

          re[(dst + i) * n + j]! += r
          im[(dst + i) * n + j]! += m
        }
      }
    }
  }

  // the default shift 1: H holds a cluster of exact zeros, where an unshifted QL does not converge
  return Float64Array.from(hermitianEigenRows(n, re, im).values).sort()
}

export type Step2Read = {
  tone: Tone
  k: number
  n: number
  // max |level - base level| over the sorted levels
  onelink: number
  control: number
  top: number
  seconds: number
}

export type Step2Witness = { reverse: Record<FieldName, number>; changedLinks: number; controlLinks: number; invarianceGap: number; commutantDim: number }

export function step2(tone: Tone, k: number): { read: Step2Read; witness: Step2Witness } {
  const t0 = Date.now()
  const F = step2Fields()
  const sector = registerSector()
  const lv = (name: FieldName): Float64Array => step2Levels({ link: F.fields[name], nb: F.nb, cells: F.cells, sector, k, tone })
  const b = lv('base')
  const gap = (a: Float64Array): number => Math.max(...Array.from(a, (x, i) => Math.abs(x - b[i]!)))

  return {
    read: { tone, k, n: b.length, onelink: gap(lv('onelink')), control: gap(lv('control')), top: b[b.length - 1]!, seconds: (Date.now() - t0) / 1000 },
    witness: { reverse: F.reverse, changedLinks: F.changedLinks, controlLinks: F.controlLinks, invarianceGap: sector.invarianceGap, commutantDim: sector.commutantDim },
  }
}

// ---- STEP 3: the lift-free rule on the line ----

export type CoinName = 'hadamard' | 'rstar'
export type RuleName = 'reflect' | 'stay' | 'free'
export type StartName = 'lone' | 'meson' | 'baryon' | 'lepton'

export const TRIALITY: Record<StartName, number[]> = { lone: [1], meson: [1, 2], baryon: [1, 1, 1], lepton: [0] }

// a 2 x 2 coin, row-major: new[c] = sum_c' C[c][c'] old[c'], c = 0 moves +1, c = 1 moves -1
type C2 = { re: number[]; im: number[] }

export function coinsOf(coin: CoinName): C2[] {
  if (coin === 'hadamard') {
    const h = Math.SQRT1_2

    return [{ re: [h, h, h, -h], im: [0, 0, 0, 0] }]
  }

  const ur = Math.cos(MU)
  const ui = Math.sin(MU)

  // E-FRC-0307's line coin (string-localize.ts:113-134): Q0 = X P_S, Q1 = X P_D
  return [
    { re: [(ur - 1) / 2, (ur + 1) / 2, (ur + 1) / 2, (ur - 1) / 2], im: [ui / 2, ui / 2, ui / 2, ui / 2] },
    { re: [(1 - ur) / 2, (1 + ur) / 2, (1 + ur) / 2, (1 - ur) / 2], im: [ui / 2, -ui / 2, -ui / 2, ui / 2] },
  ]
}

const mod = (a: number, m: number): number => ((a % m) + m) % m

// the move of one configuration: pos (n sites), coins (bit i = walker i's slot, 1 moves -1); writes out, returns coins
export function moveConfig(S: number, t: readonly number[], pos: ArrayLike<number>, coins: number, rule: RuleName, out: Int32Array): number {
  const n = t.length
  let next = coins

  for (let i = 0; i < n; i++) {
    const back = (coins >> i) & 1
    const p = pos[i]!
    const link = back ? mod(p - 1, S) : p
    let F = 0

    for (let j = 0; j < n; j++) {
      const bj = (coins >> j) & 1
      const lj = bj ? mod(pos[j]! - 1, S) : pos[j]!

      if (lj === link) {
        F += bj ? -t[j]! : t[j]!
      }
    }

    if (rule === 'free' || mod(F, 3) === 0) {
      out[i] = mod(p + (back ? -1 : 1), S)
    } else if (rule === 'reflect') {
      out[i] = p
      next ^= 1 << i
    } else {
      out[i] = p
    }
  }

  return next
}

// apply one coin per walker to a block of 2^n amplitudes (in place)
function coinBlock(n: number, C: C2, re: Float64Array, im: Float64Array, o: number): void {
  const B = 1 << n
  const [a0r, a1r, a2r, a3r] = C.re as [number, number, number, number]
  const [a0i, a1i, a2i, a3i] = C.im as [number, number, number, number]

  for (let i = 0; i < n; i++) {
    const bit = 1 << i

    for (let c = 0; c < B; c++) {
      if (c & bit) {
        continue
      }

      const p = o + c
      const q = o + (c | bit)
      const xr = re[p]!
      const xi = im[p]!
      const yr = re[q]!
      const yi = im[q]!

      re[p] = a0r * xr - a0i * xi + a1r * yr - a1i * yi
      im[p] = a0r * xi + a0i * xr + a1r * yi + a1i * yr
      re[q] = a2r * xr - a2i * xi + a3r * yr - a3i * yi
      im[q] = a2r * xi + a2i * xr + a3r * yi + a3i * yr
    }
  }
}

// ---- the relative (total momentum 0) sector, dense: the last walker at site 0 ----

export type RelSector = {
  n: number
  S: number
  B: number
  // relative position blocks S^(n-1), each B amplitudes
  blocks: number
  D: number
  // perm[i]: the image of basis state i under the move (translated back so the last walker sits at 0)
  perm: Int32Array
  // total momentum pi (an ungated diagnostic): the sign (-1)^s of the last walker's step s; null at momentum 0
  sign: Float64Array | null
}

export function relSector(S: number, t: readonly number[], rule: RuleName, kPi = false): RelSector {
  const n = t.length
  const B = 1 << n
  const blocks = S ** (n - 1)
  const D = blocks * B
  const perm = new Int32Array(D)
  const sign = kPi ? new Float64Array(D) : null
  const pos = new Int32Array(n)
  const out = new Int32Array(n)

  for (let b = 0; b < blocks; b++) {
    for (let i = 0; i < n - 1; i++) {
      pos[i] = Math.floor(b / S ** i) % S
    }

    pos[n - 1] = 0

    for (let c = 0; c < B; c++) {
      const c2 = moveConfig(S, t, pos, c, rule, out)
      const shift = out[n - 1]!
      let b2 = 0

      for (let i = 0; i < n - 1; i++) {
        b2 += mod(out[i]! - shift, S) * S ** i
      }

      perm[b * B + c] = b2 * B + c2

      if (sign) {
        sign[b * B + c] = shift === 0 ? 1 : -1
      }
    }
  }

  return { n, S, B, blocks, D, perm, sign }
}

// the number of basis states hit twice (0 for a permutation)
export function permDefect(perm: Int32Array): number {
  const hit = new Uint8Array(perm.length)
  let bad = 0

  for (const j of perm) {
    if (hit[j]) {
      bad++
    }

    hit[j] = 1
  }

  return bad
}

// T' = move after the all-walker slot swap X: an involution (its square fixes every state) is a symmetric permutation
export function involutionDefect(rs: RelSector): number {
  const { D, B, perm } = rs
  const T = (i: number): number => perm[(i - (i % B)) + ((B - 1) ^ (i % B))]!
  let bad = 0

  for (let i = 0; i < D; i++) {
    if (T(T(i)) !== i) {
      bad++
    }
  }

  return bad
}

// one beat in place: coin on every block, then the permutation (into the scratch arrays, swapped back)
function relBeat(rs: RelSector, C: C2, s: { re: Float64Array; im: Float64Array; sr: Float64Array; si: Float64Array }): void {
  const { n, B, blocks, D, perm, sign } = rs

  for (let b = 0; b < blocks; b++) {
    coinBlock(n, C, s.re, s.im, b * B)
  }

  s.sr.fill(0)
  s.si.fill(0)

  for (let i = 0; i < D; i++) {
    const g = sign ? sign[i]! : 1

    // += : the stay rule is not a permutation on three walkers (permDefect), and is then read as the linear map it is
    s.sr[perm[i]!]! += g * s.re[i]!
    s.si[perm[i]!]! += g * s.im[i]!
  }

  s.re.set(s.sr)
  s.im.set(s.si)
}

export type Moments = { dim: number; re: number[]; im: number[]; mirror: number; closedLeak: number }

// a vector evolved over its support only (blocks touched), the same beat as relBeat
type Active = {
  re: Float64Array
  im: Float64Array
  sr: Float64Array
  si: Float64Array
  mark: Int32Array
  stamp: number
  list: Int32Array
  next: Int32Array
  count: number
}

function sparseBeat(rs: RelSector, C: C2, a: Active): void {
  const { n, B, perm, sign } = rs

  a.stamp++

  let nc = 0

  for (let q = 0; q < a.count; q++) {
    const b = a.list[q]!

    coinBlock(n, C, a.re, a.im, b * B)

    for (let c = 0; c < B; c++) {
      const i = b * B + c
      const vr = a.re[i]!
      const vi = a.im[i]!

      a.re[i] = 0
      a.im[i] = 0

      if (vr === 0 && vi === 0) {
        continue
      }

      const j = perm[i]!
      const bj = (j / B) | 0
      const g = sign ? sign[i]! : 1

      a.sr[j]! += g * vr
      a.si[j]! += g * vi

      if (a.mark[bj] !== a.stamp) {
        a.mark[bj] = a.stamp
        a.next[nc++] = bj
      }
    }
  }

  for (let q = 0; q < nc; q++) {
    const b = a.next[q]!

    for (let c = 0; c < B; c++) {
      const i = b * B + c

      a.re[i] = a.sr[i]!
      a.im[i] = a.si[i]!
      a.sr[i] = 0
      a.si[i] = 0
    }
  }

  const t = a.list

  a.list = a.next
  a.next = t
  a.count = nc
}

// t_m = tr U^m over the whole sector (only = undefined) or over the co-located block (only = 0), m = 1..M cycles
export function traceMoments(rs: RelSector, coin: CoinName, M: number, only?: number): Moments {
  const coins = coinsOf(coin)
  const starts = only === undefined ? Array.from({ length: rs.D }, (_, i) => i) : Array.from({ length: rs.B }, (_, c) => only * rs.B + c)
  const tre = Array<number>(M).fill(0)
  const tim = Array<number>(M).fill(0)
  const a: Active = {
    re: new Float64Array(rs.D),
    im: new Float64Array(rs.D),
    sr: new Float64Array(rs.D),
    si: new Float64Array(rs.D),
    mark: new Int32Array(rs.blocks).fill(-1),
    stamp: 0,
    list: new Int32Array(rs.blocks),
    next: new Int32Array(rs.blocks),
    count: 0,
  }
  let closedLeak = 0

  for (const i of starts) {
    a.re[i] = 1
    a.list[0] = (i / rs.B) | 0
    a.count = 1

    for (let m = 0; m < M; m++) {
      for (const C of coins) {
        sparseBeat(rs, C, a)
      }

      tre[m]! += a.re[i]!
      tim[m]! += a.im[i]!
    }

    let w = 0

    for (let q = 0; q < a.count; q++) {
      const b = a.list[q]!

      for (let c = 0; c < rs.B; c++) {
        const j = b * rs.B + c

        if (only !== undefined && b !== only) {
          w += a.re[j]! ** 2 + a.im[j]! ** 2
        }

        a.re[j] = 0
        a.im[j] = 0
      }
    }

    closedLeak = Math.max(closedLeak, w)
  }

  const dim = starts.length
  const mirror = Math.max(...tim.map(x => (2 * Math.abs(x)) / dim))

  return { dim, re: tre, im: tim, mirror, closedLeak }
}

// J = (P_S^(x)n)^dag K on the rstar coin (P_S = X Q0), read |U J U phi - J phi| / |phi|, and J0 = K alone
export function jRead(rs: RelSector): { residual: number; control: number; involution: number } {
  const [q0, q1] = coinsOf('rstar') as [C2, C2]
  // P_S[c][c'] = Q0[1 - c][c'], its dagger
  const ps: C2 = { re: [q0.re[2]!, q0.re[3]!, q0.re[0]!, q0.re[1]!], im: [q0.im[2]!, q0.im[3]!, q0.im[0]!, q0.im[1]!] }
  const psd: C2 = { re: [ps.re[0]!, ps.re[2]!, ps.re[1]!, ps.re[3]!], im: [-ps.im[0]!, -ps.im[2]!, -ps.im[1]!, -ps.im[3]!] }
  const D = rs.D
  const cycle = (re: Float64Array, im: Float64Array): void => {
    const s = { re, im, sr: new Float64Array(D), si: new Float64Array(D) }

    relBeat(rs, q0, s)
    relBeat(rs, q1, s)
  }
  const J = (re: Float64Array, im: Float64Array, withB: boolean): void => {
    for (let i = 0; i < D; i++) {
      im[i] = -im[i]!
    }

    if (withB) {
      for (let b = 0; b < rs.blocks; b++) {
        coinBlock(rs.n, psd, re, im, b * rs.B)
      }
    }
  }
  const read = (withB: boolean): number => {
    const pr = Float64Array.from({ length: D }, (_, i) => fmix(7 * i + 3))
    const pi = Float64Array.from({ length: D }, (_, i) => fmix(7 * i + 4))
    const ar = Float64Array.from(pr)
    const ai = Float64Array.from(pi)

    // a = U J U phi
    cycle(ar, ai)
    J(ar, ai, withB)
    cycle(ar, ai)

    const br = Float64Array.from(pr)
    const bi = Float64Array.from(pi)

    J(br, bi, withB)

    let num = 0
    let den = 0

    for (let i = 0; i < D; i++) {
      num += (ar[i]! - br[i]!) ** 2 + (ai[i]! - bi[i]!) ** 2
      den += pr[i]! ** 2 + pi[i]! ** 2
    }

    return Math.sqrt(num / den)
  }

  return { residual: read(true), control: read(false), involution: involutionDefect(rs) }
}

export type MirrorRead = {
  coin: CoinName
  rule: RuleName
  start: StartName
  S: number
  dim: number
  permDefect: number
  mirror: number
  // the co-located block's own moments (closed: its leak), the same on every ring
  cluster: number
  clusterLeak: number
  // ungated: the mirror taken across to total momentum pi, max_m |t_m(0) - conj t_m(pi)| / dim (whole, cluster)
  piWhole: number
  piCluster: number
  j?: { residual: number; control: number; involution: number }
  seconds: number
}

const crossGap = (a: Moments, b: Moments): number =>
  Math.max(...a.re.map((x, m) => Math.hypot(x - b.re[m]!, a.im[m]! + b.im[m]!) / a.dim))

export function mirrorRead(coin: CoinName, rule: RuleName, start: StartName, S: number): MirrorRead {
  const t0 = Date.now()
  const rs = relSector(S, TRIALITY[start], rule)
  const whole = traceMoments(rs, coin, MOMENTS)
  const block = traceMoments(rs, coin, MOMENTS, 0)
  const rsPi = relSector(S, TRIALITY[start], rule, true)
  const wholePi = traceMoments(rsPi, coin, MOMENTS)
  const blockPi = traceMoments(rsPi, coin, MOMENTS, 0)

  return {
    piWhole: crossGap(whole, wholePi),
    piCluster: crossGap(block, blockPi),
    coin,
    rule,
    start,
    S,
    dim: rs.D,
    permDefect: permDefect(rs.perm),
    mirror: whole.mirror,
    cluster: block.mirror,
    clusterLeak: block.closedLeak,
    j: coin === 'rstar' && S === (TRIALITY[start].length === 3 ? RINGS3[0] : RING) ? jRead(rs) : undefined,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- the dynamics on the ring, sparse over configurations ----

type Sparse = { keys: Map<number, number>; pos: Int32Array; re: Float64Array; im: Float64Array; count: number }

const newSparse = (n: number, cap: number): Sparse => ({
  keys: new Map(),
  pos: new Int32Array(cap * n),
  re: new Float64Array(cap * (1 << n)),
  im: new Float64Array(cap * (1 << n)),
  count: 0,
})

function blockOf(sp: Sparse, n: number, S: number, pos: ArrayLike<number>): { sp: Sparse; b: number } {
  let key = 0

  for (let i = n - 1; i >= 0; i--) {
    key = key * S + pos[i]!
  }

  const hit = sp.keys.get(key)

  if (hit !== undefined) {
    return { sp, b: hit }
  }

  let s = sp
  const B = 1 << n

  if (s.count * n >= s.pos.length) {
    const cap = 2 * s.count
    const g: Sparse = { keys: s.keys, pos: new Int32Array(cap * n), re: new Float64Array(cap * B), im: new Float64Array(cap * B), count: s.count }

    g.pos.set(s.pos)
    g.re.set(s.re)
    g.im.set(s.im)
    s = g
  }

  const b = s.count++

  for (let i = 0; i < n; i++) {
    s.pos[b * n + i] = pos[i]!
  }

  s.keys.set(key, b)

  return { sp: s, b }
}

export type DynRead = {
  coin: CoinName
  rule: RuleName
  start: StartName
  S: number
  T: number
  // |norm - 1| at the worst beat (rounding accumulates over 1e4 beats), and the worst change of the norm in one beat
  normDrift: number
  beatDrift: number
  // the last beat with edge weight <= EDGE_TOL, and the centre of mass there
  tEdge: number
  comRms: number
  exponent: number
  speed: number
  // max over all beats of each walker's rms from the cluster centre, and of the centre's rms from the start (lone reads)
  spreadMax: number
  rmsMax: number
  // final amplitudes, for the lepton control (key -> [re, im] per coin state)
  final?: Record<string, number[]>
  curve: [number, number][]
  seconds: number
}

const READ_TIMES = ((): Set<number> => {
  const s = new Set<number>()

  for (let e = 0; e <= 4; e += 0.02) {
    s.add(Math.round(10 ** e))
  }

  return s
})()

// the mixed start I / 2^n at site 0, run to T beats, every coin basis start in turn
export function dynRead(coin: CoinName, rule: RuleName, start: StartName, S = RING, T = T_MAX, keepFinal = false): DynRead {
  const t0 = Date.now()
  const t = TRIALITY[start]
  const n = t.length
  const B = 1 << n
  const coins = coinsOf(coin)
  const half = S / 2
  const mi = (d: number): number => mod(d + half, S) - half
  const com2 = new Float64Array(T + 1)
  const edge = new Float64Array(T + 1)
  let normDrift = 0
  let beatDrift = 0
  let spreadMax = 0
  let rmsMax = 0
  const final: Record<string, number[]> = {}
  const out = new Int32Array(n)
  const rel = new Float64Array(n)

  for (let c0 = 0; c0 < B; c0++) {
    let sp = newSparse(n, 64)
    const r0 = blockOf(sp, n, S, Array<number>(n).fill(0))

    sp = r0.sp
    sp.re[r0.b * B + c0] = 1

    let last = 1

    for (let beat = 1; beat <= T; beat++) {
      const C = coins[(beat - 1) % coins.length]!

      for (let b = 0; b < sp.count; b++) {
        coinBlock(n, C, sp.re, sp.im, b * B)
      }

      let next = newSparse(n, Math.max(64, sp.count))

      for (let b = 0; b < sp.count; b++) {
        const pos = sp.pos.subarray(b * n, b * n + n)

        for (let c = 0; c < B; c++) {
          const ar = sp.re[b * B + c]!
          const ai = sp.im[b * B + c]!

          if (ar === 0 && ai === 0) {
            continue
          }

          const c2 = moveConfig(S, t, pos, c, rule, out)
          const r = blockOf(next, n, S, out)

          next = r.sp
          next.re[r.b * B + c2]! += ar
          next.im[r.b * B + c2]! += ai
        }
      }

      sp = next

      // reads
      let norm = 0
      let w2 = 0
      let s2 = 0
      let e = 0

      for (let b = 0; b < sp.count; b++) {
        let p = 0

        for (let c = 0; c < B; c++) {
          p += sp.re[b * B + c]! ** 2 + sp.im[b * B + c]! ** 2
        }

        if (p === 0) {
          continue
        }

        norm += p

        const p0 = sp.pos[b * n]!
        let mean = 0
        let far = false

        for (let i = 0; i < n; i++) {
          rel[i] = mi(sp.pos[b * n + i]! - p0)
          mean += rel[i]! / n

          if (Math.abs(mi(sp.pos[b * n + i]!)) >= half - EDGE) {
            far = true
          }
        }

        const cm = mi(p0) + mean
        let sp2 = 0

        for (let i = 0; i < n; i++) {
          sp2 += (rel[i]! - mean) ** 2 / n
        }

        w2 += p * cm * cm
        s2 += p * sp2

        if (far) {
          e += p
        }
      }

      normDrift = Math.max(normDrift, Math.abs(norm - 1))
      beatDrift = Math.max(beatDrift, Math.abs(norm - last))
      last = norm
      com2[beat]! += w2 / B
      edge[beat]! += e / B
      spreadMax = Math.max(spreadMax, Math.sqrt(s2))
      rmsMax = Math.max(rmsMax, Math.sqrt(w2))
    }

    if (keepFinal) {
      for (let b = 0; b < sp.count; b++) {
        const key = `${c0}:${Array.from(sp.pos.subarray(b * n, b * n + n)).join(',')}`

        final[key] = Array.from({ length: 2 * B }, (_, q) => (q % 2 === 0 ? sp.re[b * B + (q >> 1)]! : sp.im[b * B + (q >> 1)]!))
      }
    }
  }

  let tEdge = 0

  for (let beat = 1; beat <= T && edge[beat]! <= EDGE_TOL; beat++) {
    tEdge = beat
  }

  const curve: [number, number][] = []

  for (let beat = 1; beat <= T; beat++) {
    if (READ_TIMES.has(beat) || beat === tEdge) {
      curve.push([beat, Math.sqrt(com2[beat]!)])
    }
  }

  // log rms against log t over [tEdge / 10, tEdge], every beat
  const xs: number[] = []
  const ys: number[] = []

  for (let beat = Math.max(10, Math.floor(tEdge / 10)); beat <= tEdge; beat++) {
    const r = Math.sqrt(com2[beat]!)

    if (r > 0) {
      xs.push(Math.log(beat))
      ys.push(Math.log(r))
    }
  }

  const mx = xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length)
  const my = ys.reduce((a, b) => a + b, 0) / Math.max(1, ys.length)
  let sxy = 0
  let sxx = 0

  xs.forEach((x, i) => {
    sxy += (x - mx) * (ys[i]! - my)
    sxx += (x - mx) ** 2
  })

  const comRms = tEdge > 0 ? Math.sqrt(com2[tEdge]!) : 0

  return {
    coin,
    rule,
    start,
    S,
    T,
    normDrift,
    beatDrift,
    tEdge,
    comRms,
    exponent: sxx > 0 ? sxy / sxx : 0,
    speed: tEdge > 0 ? comRms / tEdge : 0,
    spreadMax,
    rmsMax,
    final: keepFinal ? final : undefined,
    curve,
    seconds: (Date.now() - t0) / 1000,
  }
}

// max |a - b| over the union of two final-amplitude maps
export function finalGap(a: Record<string, number[]>, b: Record<string, number[]>): number {
  let g = 0

  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k]
    const y = b[k]
    const len = Math.max(x?.length ?? 0, y?.length ?? 0)

    for (let q = 0; q < len; q++) {
      g = Math.max(g, Math.abs((x?.[q] ?? 0) - (y?.[q] ?? 0)))
    }
  }

  return g
}

// ---- the plan and the verdict ----

export const COINS: readonly CoinName[] = ['hadamard', 'rstar']
export const STARTS: readonly StartName[] = ['lone', 'meson', 'baryon', 'lepton']
export const RULES: readonly RuleName[] = ['reflect', 'stay']

export type LeptonRead = { coin: CoinName; gap: number; normDrift: number }

export type Reads = {
  step1: Step1
  step2: { read: Step2Read; witness: Step2Witness }[]
  mirrors: MirrorRead[]
  dyn: DynRead[]
  leptons: LeptonRead[]
}

export function leptonRead(coin: CoinName): LeptonRead {
  const a = dynRead(coin, 'reflect', 'lepton', RING, T_MAX, true)
  const b = dynRead(coin, 'free', 'lepton', RING, T_MAX, true)

  return { coin, gap: finalGap(a.final!, b.final!), normDrift: Math.max(a.beatDrift, b.beatDrift) }
}

export function mirrorPlan(): { coin: CoinName; rule: RuleName; start: StartName; S: number }[] {
  const out: { coin: CoinName; rule: RuleName; start: StartName; S: number }[] = []

  for (const coin of COINS) {
    for (const rule of RULES) {
      for (const start of STARTS) {
        for (const S of TRIALITY[start].length === 3 ? RINGS3 : [RING]) {
          out.push({ coin, rule, start, S })
        }
      }
    }
  }

  return out
}

const fmt = (x: number): string => (Math.abs(x) < 1e-3 && x !== 0 ? x.toExponential(2) : x.toFixed(4))

export function pcolVerdict(r: Reads): Verdict {
  const s1 = r.step1
  const step1Holds = s1.exterior.every(row => row.every(Boolean)) && s1.exteriorAll && s1.order === ORDER && s1.centre === 3 && s1.omegaIn && s1.complements === 0
  const s2 = r.step2.map(x => x.read)
  const linear = s2.filter(x => x.k === 0 || x.k === 3)
  const proj = s2.filter(x => x.k === 1 || x.k === 2)
  const witnessOk = r.step2.every(x => x.witness.reverse.base === 0 && x.witness.reverse.onelink === 0 && x.witness.reverse.control === 0 && x.witness.changedLinks === 2)
  const step2Holds =
    s2.length === 8 &&
    witnessOk &&
    linear.every(x => x.onelink <= EXACT && x.control <= EXACT) &&
    proj.every(x => x.control <= EXACT && x.onelink > CHANGED)
  const liftFree1 = s2.some(x => x.k === 1 && x.onelink <= CHANGED)
  const mir = (rule: RuleName): number => Math.max(...r.mirrors.filter(m => m.rule === rule).map(m => Math.max(m.mirror, m.cluster)))
  const mirrorReflect = mir('reflect')
  const mirrorStay = mir('stay')
  const dyn = (coin: CoinName, rule: RuleName, start: StartName): DynRead => r.dyn.find(d => d.coin === coin && d.rule === rule && d.start === start)!
  const reflect = r.dyn.filter(d => d.rule === 'reflect')
  const unitary =
    r.mirrors.filter(m => m.rule === 'reflect').every(m => m.permDefect === 0) &&
    reflect.every(d => d.beatDrift <= EXACT) &&
    r.leptons.every(l => l.normDrift <= EXACT)
  const lone = COINS.every(c => dyn(c, 'reflect', 'lone').rmsMax <= LONE_RMS)
  const lepton = r.leptons.every(l => l.gap <= EXACT)
  const moves = (d: DynRead): boolean => d.exponent >= EXPONENT_GATE || d.speed >= SPEED_GATE
  const clustersMove = COINS.every(c => moves(dyn(c, 'reflect', 'meson')) && moves(dyn(c, 'reflect', 'baryon')))
  const allStill = COINS.every(c => dyn(c, 'reflect', 'meson').speed < STILL && dyn(c, 'reflect', 'baryon').speed < STILL)
  const clauses: string[] = []

  if (!step1Holds) {
    clauses.push('STEP 1')
  }

  if (!step2Holds) {
    clauses.push('STEP 2')
  }

  if (!unitary) {
    clauses.push('unitarity')
  }

  if (mirrorReflect > MIRROR_HOLDS) {
    const where = r.mirrors
      .filter(m => m.rule === 'reflect' && Math.max(m.mirror, m.cluster) > MIRROR_HOLDS)
      .map(m => `${m.coin} ${m.start} S ${m.S} whole ${m.mirror.toExponential(2)} cluster ${m.cluster.toExponential(2)}`)

    clauses.push(`reflect mirror at K 0 ${mirrorReflect.toExponential(2)} (${where.join('; ')})`)
  }

  if (!lone) {
    clauses.push('lone third rms')
  }

  if (!lepton) {
    clauses.push('lepton control')
  }

  if (!clustersMove) {
    clauses.push('cluster motion')
  }

  const kill = liftFree1 || allStill || (mirrorReflect > MIRROR_FAILS && mirrorStay > MIRROR_FAILS)
  const viable = clauses.length === 0
  const word = viable ? 'VIABLE' : kill ? 'KILL' : `OPEN (${clauses.join(', ')})`
  const status: Verdict['status'] = viable ? 'pass' : kill ? 'fail' : 'open'
  const odd = (m: MirrorRead): boolean => TRIALITY[m.start].length % 2 === 1
  const reflectOddPi = Math.max(...r.mirrors.filter(m => m.rule === 'reflect' && odd(m)).map(m => Math.max(m.piWhole, m.piCluster)))
  const stayPermDefect = r.mirrors.filter(m => m.rule === 'stay').reduce((a, m) => a + m.permDefect, 0)
  const metrics: Record<string, number> = {
    complements: s1.complements,
    centre: s1.centre,
    mirrorReflect,
    mirrorStay,
    reflectOddPi,
    stayPermDefect,
  }

  for (const x of s2) {
    metrics[`s2_${x.tone}_${x.k}_onelink`] = x.onelink
    metrics[`s2_${x.tone}_${x.k}_control`] = x.control
  }

  for (const d of r.dyn) {
    const key = `${d.coin}_${d.rule}_${d.start}`

    metrics[`${key}_exponent`] = d.exponent
    metrics[`${key}_speed`] = d.speed
    metrics[`${key}_spreadMax`] = d.spreadMax
    metrics[`${key}_normDrift`] = d.normDrift
    metrics[`${key}_beatDrift`] = d.beatDrift
  }

  for (const c of COINS) {
    const lep = dyn(c, 'reflect', 'lepton').speed

    metrics[`${c}_mesonOverLepton`] = dyn(c, 'reflect', 'meson').speed / lep
    metrics[`${c}_baryonOverLepton`] = dyn(c, 'reflect', 'baryon').speed / lep
  }

  r.leptons.forEach(l => {
    metrics[`${l.coin}_leptonGap`] = l.gap
  })

  const js = r.mirrors.filter(m => m.j)
  const line = (c: CoinName, rule: RuleName): string =>
    STARTS.map(s => {
      const d = dyn(c, rule, s)

      return `${s} speed ${fmt(d.speed)} exp ${fmt(d.exponent)} spread ${fmt(d.spreadMax)}`
    }).join(', ')

  return verdict({
    status,
    claim: `projective-colour ${word}: STEP 1 Lambda^k(omega I) = omega^(+-k) exact ${step1Holds ? 'yes' : 'no'}, ${s1.complements} complements of order 216 among ${s1.choices} lift choices (closure orders ${JSON.stringify(s1.orders)}); STEP 2 ${s2.map(x => `${x.tone} L${x.k} onelink ${x.onelink.toExponential(2)} control ${x.control.toExponential(2)}`).join('; ')}; STEP 3 reflect: hadamard ${line('hadamard', 'reflect')}; rstar ${line('rstar', 'reflect')}; mirror reflect ${mirrorReflect.toExponential(2)}, stay ${mirrorStay.toExponential(2)}; lepton gap ${r.leptons.map(l => l.gap.toExponential(2)).join('/')}.`,
    metrics,
    control: {
      step2ControlMax: Math.max(...s2.map(x => x.control)),
      jResidualMax: Math.max(0, ...js.map(m => m.j!.residual)),
      jControlMin: Math.min(...js.map(m => m.j!.control)),
      involutionDefects: js.reduce((a, m) => a + m.j!.involution, 0),
    },
    notes: `Ungated: the reflect rule's mirror taken across to total momentum pi on odd walker numbers, max |t_m(0) - conj t_m(pi)| / dim ${reflectOddPi.toExponential(2)} (the slot flip anticommutes with the coin-side Z of the mirror, so the mirror operator carries (-1)^x a walker and maps K to K + n pi). The stay rule is not a permutation on three walkers (${stayPermDefect} states hit twice over the read rings), though it is on the co-located block. Stay rule: hadamard ${line('hadamard', 'stay')}; rstar ${line('rstar', 'stay')}. LIMIT: the three-walker whole-sector mirror is read on rings ${RINGS3.join(', ')}, not 2048; the co-located block is ring-independent. The flux is oriented (forward minus backward), research 3a.`,
  })
}

export function allReads(): Reads {
  return {
    step1: step1(),
    step2: (['love', 'fear'] as const).flatMap(tone => [0, 1, 2, 3].map(k => step2(tone, k))),
    mirrors: mirrorPlan().map(p => mirrorRead(p.coin, p.rule, p.start, p.S)),
    dyn: COINS.flatMap(coin => RULES.flatMap(rule => STARTS.map(start => dynRead(coin, rule, start)))),
    leptons: COINS.map(leptonRead),
  }
}

export default experiment({
  id: 'gauge/projective-colour',
  code: 'E-FRC-0312',
  title: 'explores whether a link that moves only triality-0 content, forced by the unforced lift of R*s links, could leave lone thirds still while colour-neutral clusters move',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return pcolVerdict(allReads())
  },
})
