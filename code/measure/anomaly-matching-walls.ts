// 'T HOOFT MATCHING ON BOTH WALLS OF THE CHIRAL SLAB (E-FRC-0290, moving-matter item 0028, route 1 of
// research/charge-one-after-anomaly.md). E-FRC-0289 (code/measure/anomaly-matching) matched one face with a typed hand,
// both tones in colour 3 and a one-wall member number. This module reads every one of those inputs from the rule and
// holds the pieces for the two-wall set S4 = U(1)_Q x SU(2)_A x SU(2)_B x U(1)_V:
//
//   wallGeometry       the slab's spacetime: the root dimension, the depth axis, the tangent axes the wall's Weyl cone
//                      is read along, plus the cycle's time
//   chiralSlab         E-FRC-0267's slab (L depth classes, Wilson mixers on half 0, ringUnit(-2, 5)), its piece sets and
//                      ranges per half
//   faceSpans          the in-gap levels at husk k = 0 split between the walls by the depth projector (as wallChirality
//                      does), returned as vectors, with the in-gap phases and the largest entry of [U_gap, Pi_A] (the
//                      one-wall number's commutator with the cycle on the light levels)
//   faceIsospin        SU(2)+ = right multiplication by e_0k on half + (E-FRC-0268), compressed to one face: the span's
//                      invariance residual and the Casimir -sum G_k^2 (3 for doublets)
//   ruleExactness      the largest entry of [q, X] over the rule's pieces (24 Q_S, 48 Q_D, 96 Q_D P+, 48 Q_S P+, 2 P+)
//                      for X = J (N+, the half number) and Y_k = R(e_0k) (1 + J) (SU(2)+): integer matrices, exact
//   colourRead         Sigma(648) on the role (code/measure/role-register sigmaReading: whether the unlike singlet is
//                      kept by g (x) conj g), and the colour invariants of three members per symmetry type (Schur
//                      characters averaged over the 648 elements) and for mixed tones
//   wallComposites     the J = 1/2 colour-singlet three-member multiplets on one wall: for each colour symmetry type
//                      lambda with m_lambda invariants, the spin x isospin part is the conjugate type lambda' (Fermi
//                      statistics), split into (2J, 2T) irreps by highest weight
//   traces4            every S4 coefficient, scaled to an integer, and the colour traces 2 Tr X C^2
//   search4            integer index assignments |l| <= bound over the composites matching a target's coefficients
//
// DETERMINISM: no random numbers. EXACT: rule pieces, J, the R(e_B) and every trace are integers; the slab spectrum, the
// face vectors and the group characters are floats, as measurement, each rounded only behind a stated residual.

import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import { SU3_SUBGROUPS } from '@/code/algebra/group/su3-subgroups'
import { generateGroup, multiply3 } from '@/code/dynamics/finite-gauge'
import { DOCK_ROOTS, wrap, type CMatrix } from '@/code/measure/dock-mixer'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import {
  EVEN,
  matMul,
  partnerProjector48,
  rangeBasis,
  scaled,
  singletProjector24,
} from '@/code/measure/spinor-register'
import {
  chirality2,
  sectorBasis,
  sectorBlock,
  volumeRight,
} from '@/code/measure/chiral-register'
import { halfPieces } from '@/code/measure/chiral-flow'
import {
  slabReduced,
  unitaryEigen,
  wilsonSchedule,
  type CVec,
  type HalfSet,
  type Slab,
} from '@/code/measure/wilson-register'
import {
  evenBlade,
  IDENTITY_SLOTS,
  leftMultiplication,
  registerGap,
  rightMultiplication,
} from '@/code/measure/register-symmetry'
import { sigmaReading } from '@/code/measure/role-register'
import type { MemberWeights } from '@/code/measure/anomaly-matching'

const HALF_MODES = 96
const HALF_REG = 4
const HEAVY: readonly [number, number] = [-2, 5]

// ---- the slab's spacetime ----

export type WallGeometry = {
  rootDimension: number
  depthAxis: number
  // the axes other than the depth along which some root steps: the wall's space
  tangentAxes: number[]
  // the cycle U is one unitary step: one time axis
  time: number
}

export function wallGeometry(depthAxis = 3): WallGeometry {
  const rootDimension = DOCK_ROOTS[0]!.length
  const tangentAxes = Array.from({ length: rootDimension }, (_, k) => k).filter(
    k => k !== depthAxis && DOCK_ROOTS.some(r => r[k] !== 0),
  )

  return { rootDimension, depthAxis, tangentAxes, time: 1 }
}

// ---- the chiral slab (E-FRC-0267) ----

export type ChiralSlab = {
  slab: Slab
  sets: HalfSet[][]
  ranges: { sR: number[][]; dR: number[][] }[]
  aDepths: Set<number>
  basis: number[][]
}

export function chiralSlab(L: number): ChiralSlab {
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const J = volumeRight()
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const basis = sectorBasis(J)
  const t = unitAngle(ringUnit(HEAVY[0], HEAVY[1]))
  const u: [number, number] = [Math.cos(t), Math.sin(t)]
  const trivial = wilsonSchedule(qS, qD, u, { wilson: false })
  const chiral = wilsonSchedule(qS, qD, u, {
    wilson: true,
    half: scaled(chirality2(J, 1), 2),
  })
  const setsOf = (P: CMatrix[], half: 0 | 1): HalfSet[] => [
    { pieces: halfPieces(trivial, basis, half).pieces },
    { pieces: halfPieces(P, basis, half).pieces },
  ]
  const rangeOf = (q: Float64Array, half: 0 | 1): number[][] =>
    rangeBasis(
      sectorBlock({ re: q, im: new Float64Array(q.length) }, basis, half).block
        .re,
      HALF_MODES,
    )
  const slab: Slab = {
    L,
    qa: 1,
    p: 0,
    profile: Array.from({ length: L }, (_, c) => (c < L / 2 ? 1 : 0)),
  }
  // E-FRC-0267's wall-A window: six classes centred on the Wilson/plain boundary at L / 2
  const aDepths = new Set(
    [-3, -2, -1, 0, 1, 2].map(x => (((L / 2 + x) % L) + L) % L),
  )

  return {
    slab,
    sets: [setsOf(chiral, 0), setsOf(chiral, 1)],
    ranges: [
      { sR: rangeOf(qS, 0), dR: rangeOf(qD, 0) },
      { sR: rangeOf(qS, 1), dR: rangeOf(qD, 1) },
    ],
    aDepths,
    basis,
  }
}

// ---- the faces as vectors ----

export type FaceSpans = {
  // eps = -wrap(phase - pi) of every in-gap level
  eps: number[]
  // [A, B]: orthonormal vectors of each wall's in-gap span
  faces: CVec[][]
  // the depth projector's eigenvalues in the in-gap span
  weights: number[]
  // max |[U_gap, Pi_A]_ab| = |e^(i phi_a) - e^(i phi_b)| |<a| Pi_A |b>| over the in-gap eigenvectors
  commutatorA: number
  leak: number
}

const inner = (a: CVec, b: CVec): [number, number] => {
  let r = 0
  let i = 0

  for (let k = 0; k < a.re.length; k++) {
    r += a.re[k]! * b.re[k]! + a.im[k]! * b.im[k]!
    i += a.re[k]! * b.im[k]! - a.im[k]! * b.re[k]!
  }

  return [r, i]
}

export function faceSpans(cs: ChiralSlab, half: 0 | 1, window = 0.1): FaceSpans {
  const { slab: s, aDepths } = cs
  const sets = cs.sets[half]!
  const { sR, dR } = cs.ranges[half]!
  const red = slabReduced(s, sets, [0, 0, 0, 0], DOCK_ROOTS, sR, dR)
  const e = unitaryEigen(red.U, red.d)
  const gap = e.phases
    .map((p, k) => ({ p, k }))
    .filter(x => Math.abs(wrap(x.p - Math.PI)) < window)
  const N = red.N
  const lift = (k: number): CVec => {
    const x: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (let j = 0; j < red.d; j++) {
      const yr = e.vre[j * red.d + k]!
      const yi = e.vim[j * red.d + k]!
      const b = red.basis[j]!

      for (let i = 0; i < N; i++) {
        x.re[i]! += b.re[i]! * yr - b.im[i]! * yi
        x.im[i]! += b.re[i]! * yi + b.im[i]! * yr
      }
    }

    return x
  }
  const onA = (x: CVec): CVec => {
    const y: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

    for (const c of aDepths) {
      const off = c * HALF_MODES

      for (let i = 0; i < HALF_MODES; i++) {
        y.re[off + i] = x.re[off + i]!
        y.im[off + i] = x.im[off + i]!
      }
    }

    return y
  }
  const vecs = gap.map(g => lift(g.k))
  const m = vecs.length
  const G = makeComplexMatrix({ rows: m, cols: m })

  let commutatorA = 0

  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) {
      const [r, i] = inner(vecs[a]!, onA(vecs[b]!))
      const dphi = Math.hypot(
        Math.cos(gap[a]!.p) - Math.cos(gap[b]!.p),
        Math.sin(gap[a]!.p) - Math.sin(gap[b]!.p),
      )

      G.re[a * m + b] = r
      G.im[a * m + b] = i
      commutatorA = Math.max(commutatorA, dphi * Math.hypot(r, i))
    }
  }

  const faces: CVec[][] = [[], []]
  let weights: number[] = []

  if (m > 0) {
    const g = eigHermitian({ matrix: G })

    weights = [...g.values]

    for (let c = 0; c < m; c++) {
      const z: CVec = { re: new Float64Array(N), im: new Float64Array(N) }

      for (let a = 0; a < m; a++) {
        const cr = g.vectorsRe[a * m + c]!
        const ci = g.vectorsIm[a * m + c]!
        const x = vecs[a]!

        for (let i = 0; i < N; i++) {
          z.re[i]! += x.re[i]! * cr - x.im[i]! * ci
          z.im[i]! += x.re[i]! * ci + x.im[i]! * cr
        }
      }

      faces[g.values[c]! > 0.5 ? 0 : 1]!.push(z)
    }
  }

  return {
    eps: gap.map(g => -wrap(g.p - Math.PI)),
    faces,
    weights,
    commutatorA,
    leak: red.leak,
  }
}

// ---- SU(2)+ on a face ----

// R(e_0k) on half `half` of the register, in the sector basis the slab uses (basis rows 4 h .. 4 h + 3)
export function halfGenerators(basis: readonly (readonly number[])[], half: 0 | 1): number[][][] {
  const idx = (b: string): number => EVEN.findIndex(x => x.join(',') === b)

  return ['0,1', '0,2', '0,3'].map(b => {
    const R = rightMultiplication(evenBlade(idx(b)))

    return Array.from({ length: HALF_REG }, (_, x) =>
      Array.from({ length: HALF_REG }, (_, y) => {
        const bx = basis[half * HALF_REG + x]!
        const by = basis[half * HALF_REG + y]!

        let s = 0

        for (let a = 0; a < bx.length; a++) {
          for (let c = 0; c < by.length; c++) {
            s += bx[a]! * R[a]![c]! * by[c]!
          }
        }

        return s
      }),
    )
  })
}

const applyLocal = (Y: readonly (readonly number[])[], v: CVec): CVec => {
  const out: CVec = {
    re: new Float64Array(v.re.length),
    im: new Float64Array(v.re.length),
  }

  for (let off = 0; off < v.re.length; off += HALF_REG) {
    for (let x = 0; x < HALF_REG; x++) {
      let r = 0
      let i = 0

      for (let y = 0; y < HALF_REG; y++) {
        r += Y[x]![y]! * v.re[off + y]!
        i += Y[x]![y]! * v.im[off + y]!
      }

      out.re[off + x] = r
      out.im[off + x] = i
    }
  }

  return out
}

export type FaceIsospin = {
  states: number
  // max |Y_k z - Z G_k| over the face's vectors: 0 when the span is an SU(2)+ representation
  invariance: number
  // max |C - 3 I| for C = - sum G_k^2 (4 T (T + 1) = 3: every state in a doublet)
  casimirGap: number
  casimir: number
}

export function faceIsospin(
  zs: readonly CVec[],
  Y: readonly (readonly (readonly number[])[])[],
): FaceIsospin {
  const n = zs.length

  if (n === 0) {
    return { states: 0, invariance: 0, casimirGap: 0, casimir: Number.NaN }
  }

  let invariance = 0
  const C = { re: Array<number>(n * n).fill(0), im: Array<number>(n * n).fill(0) }

  for (const Yk of Y) {
    const Yz = zs.map(z => applyLocal(Yk, z))
    const Gre = Array<number>(n * n).fill(0)
    const Gim = Array<number>(n * n).fill(0)

    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        const [r, i] = inner(zs[a]!, Yz[b]!)

        Gre[a * n + b] = r
        Gim[a * n + b] = i
      }
    }

    for (let b = 0; b < n; b++) {
      const res = { re: Float64Array.from(Yz[b]!.re), im: Float64Array.from(Yz[b]!.im) }

      for (let a = 0; a < n; a++) {
        const gr = Gre[a * n + b]!
        const gi = Gim[a * n + b]!

        for (let k = 0; k < res.re.length; k++) {
          res.re[k]! -= zs[a]!.re[k]! * gr - zs[a]!.im[k]! * gi
          res.im[k]! -= zs[a]!.re[k]! * gi + zs[a]!.im[k]! * gr
        }
      }

      let r2 = 0

      for (let k = 0; k < res.re.length; k++) {
        r2 += res.re[k]! ** 2 + res.im[k]! ** 2
      }

      invariance = Math.max(invariance, Math.sqrt(r2))
    }

    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        let r = 0
        let i = 0

        for (let c = 0; c < n; c++) {
          r += Gre[a * n + c]! * Gre[c * n + b]! - Gim[a * n + c]! * Gim[c * n + b]!
          i += Gre[a * n + c]! * Gim[c * n + b]! + Gim[a * n + c]! * Gre[c * n + b]!
        }

        C.re[a * n + b]! -= r
        C.im[a * n + b]! -= i
      }
    }
  }

  let casimirGap = 0

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      casimirGap = Math.max(
        casimirGap,
        Math.hypot(C.re[a * n + b]! - (a === b ? 3 : 0), C.im[a * n + b]!),
      )
    }
  }

  return {
    states: n,
    invariance,
    casimirGap,
    casimir: C.re.reduce((s, x, k) => s + (k % (n + 1) === 0 ? x : 0), 0) / n,
  }
}

// ---- exactness on R* ----

export type RuleExactness = {
  pieces: number
  // the largest entry of [q, 1 (x) J] and of [q, 1 (x) Y_k] over the pieces (exact: integer matrices)
  halfNumberGap: number
  su2Gap: number
  // teeth: the left multiplications by the bivectors fail to commute with 48 Q_D (smallest gap among them)
  leftTeeth: number
}

export function ruleExactness(): RuleExactness {
  const S24 = singletProjector24()
  const D48 = partnerProjector48()
  const J = volumeRight()
  const chi2 = chirality2(J, 1)
  const qS = scaled(S24, 24)
  const qD = scaled(D48, 48)
  const pieces = [qS, qD, matMul(qD, chi2), matMul(qS, chi2), chi2]
  const idx = (b: string): number => EVEN.findIndex(x => x.join(',') === b)
  const I8 = J.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)))
  const onePlus = I8.map((row, i) => row.map((x, j) => x + J[i]![j]!))
  const Y = ['0,1', '0,2', '0,3'].map(b => {
    const R = rightMultiplication(evenBlade(idx(b)))

    return R.map(row =>
      onePlus[0]!.map((_, j) => row.reduce((s, x, k) => s + x * onePlus[k]![j]!, 0)),
    )
  })
  const halfNumberGap = Math.max(
    ...pieces.map(q => registerGap(q, IDENTITY_SLOTS, J)),
  )
  const su2Gap = Math.max(
    ...pieces.flatMap(q => Y.map(y => registerGap(q, IDENTITY_SLOTS, y))),
  )
  const leftTeeth = Math.min(
    ...EVEN.map((b, i) => ({ b, i }))
      .filter(x => x.b.length === 2)
      .map(x => registerGap(qD, IDENTITY_SLOTS, leftMultiplication(evenBlade(x.i)))),
  )

  return { pieces: pieces.length, halfNumberGap, su2Gap, leftTeeth }
}

// ---- colour ----

export type ColourRead = {
  order: number
  // [g (x) conj g, V] and [g (x) g, V] (role-register sigmaReading): the unlike singlet is kept only by g (x) conj g
  singletConjugate: number
  singletSame: number
  // the fear tone carries the conjugate representation
  conjugate: boolean
  // invariants of three like members per S3 type of the colour part: (3) symmetric, (2,1) mixed, (1,1,1) antisymmetric
  like: { sym: number; mixed: number; anti: number }
  // invariants in 3 (x) 3 (x) 3-bar and 3 (x) 3-bar (x) 3-bar
  mixedTone: [number, number]
  // the largest distance of any average from its rounded integer
  roundGap: number
}

const cmul = (a: [number, number], b: [number, number]): [number, number] => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
]

const trace3 = (g: Float64Array): [number, number] => [
  g[0]! + g[8]! + g[16]!,
  g[1]! + g[9]! + g[17]!,
]

export function colourRead(): ColourRead {
  const s = sigmaReading((2 * Math.PI) / 3)
  const group = generateGroup({ generators: SU3_SUBGROUPS.sigma648.generators })
  const acc = { sym: [0, 0], mixed: [0, 0], anti: [0, 0], m1: [0, 0], m2: [0, 0] }

  for (const g of group.matrices) {
    const g2 = multiply3(g, g)
    const g3 = multiply3(g2, g)
    const p1 = trace3(g)
    const p2 = trace3(g2)
    const p3 = trace3(g3)
    const c1: [number, number] = [p1[0], -p1[1]]
    const p1c = cmul(cmul(p1, p1), p1)
    const p12 = cmul(p1, p2)
    const add = (k: keyof typeof acc, v: [number, number]): void => {
      acc[k][0]! += v[0]
      acc[k][1]! += v[1]
    }

    add('sym', [(p1c[0] + 3 * p12[0] + 2 * p3[0]) / 6, (p1c[1] + 3 * p12[1] + 2 * p3[1]) / 6])
    add('anti', [(p1c[0] - 3 * p12[0] + 2 * p3[0]) / 6, (p1c[1] - 3 * p12[1] + 2 * p3[1]) / 6])
    add('mixed', [(p1c[0] - p3[0]) / 3, (p1c[1] - p3[1]) / 3])
    add('m1', cmul(cmul(p1, p1), c1))
    add('m2', cmul(cmul(p1, c1), c1))
  }

  let roundGap = 0
  const count = (v: number[]): number => {
    const re = v[0]! / group.order
    const im = v[1]! / group.order

    roundGap = Math.max(roundGap, Math.abs(re - Math.round(re)), Math.abs(im))

    return Math.round(re)
  }

  return {
    order: group.order,
    singletConjugate: s.singletConjugate,
    singletSame: s.singletSame,
    conjugate: s.singletConjugate < 1e-9 && s.singletSame > 1e-6,
    like: { sym: count(acc.sym), mixed: count(acc.mixed), anti: count(acc.anti) },
    mixedTone: [count(acc.m1), count(acc.m2)],
    roundGap,
  }
}

// ---- multiplets on two walls ----

export type Wall = 'A' | 'B'

export type WallMultiplet = {
  name: string
  wall: Wall
  // 3Q
  charge3: number
  // N_V
  v: number
  twoT: number
  twoT3: number[]
  // colour dimension (3 for a member, 1 for a singlet)
  copies: number
  // read: +1 or -1 per Weyl copy
  hand: number
  coloured: boolean
}

const fullWeights = (twoT: number): number[] =>
  Array.from({ length: twoT + 1 }, (_, i) => twoT - 2 * i)

export type Constituent = { tone: number; charge3: number; conj: boolean }

export function wallConstituents(
  wall: Wall,
  hand: number,
  tones: readonly Constituent[],
  colourDimension: number,
  twoT: number,
): WallMultiplet[] {
  return tones.map(t => ({
    name: `wall ${wall} tone ${t.tone} (${t.conj ? '3-bar' : '3'})`,
    wall,
    charge3: t.charge3,
    v: 1,
    twoT,
    twoT3: fullWeights(twoT),
    copies: colourDimension,
    hand,
    coloured: true,
  }))
}

// ---- composites ----

export type Irrep = { twoJ: number; twoT: number; count: number }

// the weights (2 Jz, 2 T3) of a Schur functor of the member's spin x isospin space over its weight labels
function schurWeights(
  labels: readonly [number, number][],
  shape: 'sym' | 'anti' | 'mixed',
): Map<string, number> {
  const m = new Map<string, number>()
  const n = labels.length
  const add = (a: number, b: number, c: number): void => {
    const k = `${labels[a]![0] + labels[b]![0] + labels[c]![0]},${labels[a]![1] + labels[b]![1] + labels[c]![1]}`

    m.set(k, (m.get(k) ?? 0) + 1)
  }

  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      for (let c = 0; c < n; c++) {
        const keep =
          shape === 'sym'
            ? a <= b && b <= c
            : shape === 'anti'
              ? a < b && b < c
              : // semistandard tableau [[a, b], [c]]: a <= b, a < c
                a <= b && a < c

        if (keep) {
          add(a, b, c)
        }
      }
    }
  }

  return m
}

export function peel(m: Map<string, number>): { irreps: Irrep[]; ok: boolean } {
  const irreps: Irrep[] = []

  for (;;) {
    const live = [...m].filter(([, x]) => x !== 0)

    if (live.length === 0) {
      return { irreps, ok: true }
    }

    if (live.some(([, x]) => x < 0)) {
      return { irreps, ok: false }
    }

    const pts = live.map(([k]) => k.split(',').map(Number) as [number, number])
    const [twoJ, twoT] = pts.reduce((p, x) =>
      x[0] > p[0] || (x[0] === p[0] && x[1] > p[1]) ? x : p,
    )
    const c = m.get(`${twoJ},${twoT}`)!

    if (twoJ < 0 || twoT < 0) {
      return { irreps, ok: false }
    }

    for (const jz of fullWeights(twoJ)) {
      for (const t3 of fullWeights(twoT)) {
        const k = `${jz},${t3}`

        m.set(k, (m.get(k) ?? 0) - c)
      }
    }

    irreps.push({ twoJ, twoT, count: c })
  }
}

// the colour-singlet content of three like members: colour type lambda with m_lambda invariants pairs with the
// conjugate type of spin x isospin (the whole state is antisymmetric)
export function likeContent(
  w: MemberWeights,
  like: ColourRead['like'],
): { irreps: Irrep[]; ok: boolean; states: number } {
  const labels: [number, number][] = []

  for (const x of w.weights) {
    for (let k = 0; k < x.multiplicity; k++) {
      labels.push([x.twoJz, x.twoT3])
    }
  }

  const total = new Map<string, number>()
  const addAll = (src: Map<string, number>, times: number): void => {
    for (const [k, x] of src) {
      total.set(k, (total.get(k) ?? 0) + times * x)
    }
  }

  // colour anti -> spin x isospin sym; colour sym -> anti; mixed -> mixed
  addAll(schurWeights(labels, 'sym'), like.anti)
  addAll(schurWeights(labels, 'anti'), like.sym)
  addAll(schurWeights(labels, 'mixed'), like.mixed)

  const states = [...total.values()].reduce((s, x) => s + x, 0)

  return { ...peel(total), states }
}

// the J = 1/2 composites of each tone on one wall, hand read from Lorentz content: three Weyl spinors of hand h hold
// only (j, 0) of that hand, so a J = 1/2 composite has the wall's hand
export function wallComposites(
  wall: Wall,
  hand: number,
  tones: readonly Constituent[],
  irreps: readonly Irrep[],
): WallMultiplet[] {
  const out: WallMultiplet[] = []

  for (const t of tones) {
    for (const r of irreps.filter(x => x.twoJ === 1)) {
      for (let k = 0; k < r.count; k++) {
        out.push({
          name: `wall ${wall} Q ${3 * t.charge3}/3 (1/2, ${r.twoT}/2)${r.count > 1 ? ` #${k + 1}` : ''}`,
          wall,
          charge3: 3 * t.charge3,
          v: 3,
          twoT: r.twoT,
          twoT3: fullWeights(r.twoT),
          copies: 1,
          hand,
          coloured: false,
        })
      }
    }
  }

  return out
}

// ---- the coefficients ----

export const COEFFICIENTS4 = [
  'QQQ',
  'Q',
  'VVV',
  'V',
  'QQV',
  'QVV',
  'QTA',
  'VTA',
  'QTB',
  'VTB',
  'wittenA',
  'wittenB',
] as const

export type Coefficient4 = (typeof COEFFICIENTS4)[number]

export const SCALE4: Record<Coefficient4, number> = {
  QQQ: 27,
  Q: 3,
  VVV: 1,
  V: 1,
  QQV: 9,
  QVV: 3,
  QTA: 12,
  VTA: 4,
  QTB: 12,
  VTB: 4,
  wittenA: 1,
  wittenB: 1,
}

// which U(1) each coefficient needs (Q, V, or both)
export const NEEDS: Record<Coefficient4, ('Q' | 'V')[]> = {
  QQQ: ['Q'],
  Q: ['Q'],
  VVV: ['V'],
  V: ['V'],
  QQV: ['Q', 'V'],
  QVV: ['Q', 'V'],
  QTA: ['Q'],
  VTA: ['V'],
  QTB: ['Q'],
  VTB: ['V'],
  wittenA: [],
  wittenB: [],
}

const dynkinParity = (twoT: number): number =>
  ((twoT * (twoT + 1) * (twoT + 2)) / 6) % 2

const mod2 = (x: number): number => ((x % 2) + 2) % 2

export function traces4(ms: readonly WallMultiplet[]): Record<Coefficient4, number> {
  const out = Object.fromEntries(COEFFICIENTS4.map(c => [c, 0])) as Record<
    Coefficient4,
    number
  >

  for (const m of ms) {
    const q = m.charge3
    const v = m.v
    const w = m.hand * m.copies

    for (const t of m.twoT3) {
      out.QQQ += w * q * q * q
      out.Q += w * q
      out.VVV += w * v * v * v
      out.V += w * v
      out.QQV += w * q * q * v
      out.QVV += w * q * v * v

      if (m.wall === 'A') {
        out.QTA += w * q * t * t
        out.VTA += w * v * t * t
      } else {
        out.QTB += w * q * t * t
        out.VTB += w * v * t * t
      }
    }

    if (m.wall === 'A') {
      out.wittenA += Math.abs(m.hand) * m.copies * dynkinParity(m.twoT)
    } else {
      out.wittenB += Math.abs(m.hand) * m.copies * dynkinParity(m.twoT)
    }
  }

  out.wittenA = mod2(out.wittenA)
  out.wittenB = mod2(out.wittenB)

  return out
}

// 2 Tr X C^2 over the coloured multiplets (index 1/2 for 3 and for 3-bar), X = V, Q (as 3Q, so 6 Tr Q C^2) and the
// axial number A = N_A - N_B
export function colourTraces(ms: readonly WallMultiplet[]): {
  twiceVCC: number
  sixQCC: number
  twiceAxialCC: number
} {
  let twiceVCC = 0
  let sixQCC = 0
  let twiceAxialCC = 0

  for (const m of ms.filter(x => x.coloured)) {
    for (const _t of m.twoT3) {
      twiceVCC += m.hand * m.v
      sixQCC += m.hand * m.charge3
      twiceAxialCC += m.hand * m.v * (m.wall === 'A' ? 1 : -1)
    }
  }

  return { twiceVCC, sixQCC, twiceAxialCC }
}

export function asFraction4(c: Coefficient4, v: number): string {
  const d = SCALE4[c]
  const g = (a: number, b: number): number => (b === 0 ? a : g(b, a % b))
  const k = g(Math.abs(v), d) || 1

  return d / k === 1 ? `${v / k}` : `${v / k}/${d / k}`
}

export type Search4 = {
  tried: number
  matches: number
  // matches with a |Q| = 1 composite at nonzero index on wall A and one on wall B
  electronMatches: number
  // the matching assignments (one index per composite), up to 8
  examples: number[][]
}

export function search4(
  target: Record<Coefficient4, number>,
  composites: readonly WallMultiplet[],
  coefficients: readonly Coefficient4[],
  bound: number,
): Search4 {
  const linear = coefficients.filter(c => !c.startsWith('witten'))
  const parities = coefficients.filter(c => c.startsWith('witten'))
  const per = composites.map(m => traces4([m]))
  const vec = per.map(t => linear.map(c => t[c]))
  const goal = linear.map(c => target[c])
  const k = composites.length
  const l = Array<number>(k).fill(-bound)
  const electron = composites.map(m => Math.abs(m.charge3) === 3)
  let tried = 0
  let matches = 0
  let electronMatches = 0
  const examples: number[][] = []

  for (;;) {
    tried++

    let ok = true

    for (let c = 0; c < goal.length && ok; c++) {
      let s = 0

      for (let i = 0; i < k; i++) {
        s += l[i]! * vec[i]![c]!
      }

      ok = s === goal[c]
    }

    for (const p of parities) {
      if (!ok) {
        break
      }

      let w = 0

      for (let i = 0; i < k; i++) {
        w += Math.abs(l[i]!) * per[i]![p]!
      }

      ok = mod2(w) === target[p]
    }

    if (ok) {
      matches++

      if (examples.length < 8) {
        examples.push(l.slice())
      }

      const onWall = (wall: Wall): boolean =>
        l.some((x, i) => x !== 0 && electron[i] && composites[i]!.wall === wall)

      if (onWall('A') && onWall('B')) {
        electronMatches++
      }
    }

    let i = 0

    while (i < k && l[i] === bound) {
      l[i] = -bound
      i++
    }

    if (i === k) {
      break
    }

    l[i]!++
  }

  return { tried, matches, electronMatches, examples }
}

// the in-gap levels of a slab at k = 0 (both halves), for the leak table: eps of half 0, count in half 1
export function slabSplitting(L: number): {
  L: number
  eps: number[]
  otherHalf: number
  commutatorA: number
} {
  const cs = chiralSlab(L)
  const h0 = faceSpans(cs, 0)
  const h1 = faceSpans(cs, 1)

  return {
    L,
    eps: h0.eps,
    otherHalf: h1.eps.length,
    commutatorA: h0.commutatorA,
  }
}
