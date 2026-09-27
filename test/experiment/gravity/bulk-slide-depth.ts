// The piece E-GRV-0142 left open (note/research/vibe/roadmap/remaining-pieces.md, "Randall-Sundrum with the tensor"):
// its massive Kaluza-Klein gravitons exchange with Einstein-Hilbert's five-dimensional factor, 1 - 1/(D - 2) = 2/3,
// which ASSUMES the bulk's depth direction carries Einstein-Hilbert. E-GRV-0141 derived Einstein-Hilbert only on the
// 3+1 husk, from the slide of its unlabeled docks in space and time. The bulk's docks are unlabeled too, so a slide
// along the depth, xi^w, is also a redundancy of the rule's bookkeeping. This repeats E-GRV-0141 in 4+1 with the depth
// w as a fifth coordinate.
//
// THE DERIVATION, before computing (code/measure/bulk-slide holds it in full). Fields: g_MN = eta_MN + H_MN in
// X = (c t, x, y, z, b w), split along the depth into the husk metric H_mn (m, n < 4), the graviphoton A_m = H_m4 and
// the radion phi = H_44 (the axial variables; RS's axial gauge is A = phi = 0). The 5d slide is the Lie derivative,
// exact on H at every order:
//   delta H_MN = eta_NN D_M xi^N + eta_MM D_N xi^M + xi^R D_R H_MN + H_RN D_M xi^R + H_MR D_N xi^R
// whose depth parts are delta A_m = D_m xi^4 + D_4 xi_m (+ transport) and delta phi = 2 D_4 xi^4 (+ transport). So at
// depth momentum k_4 != 0, A and phi are pure gauge (eaten by the massive graviton, which then carries 5 = 2 + 2 + 1
// polarizations); at k_4 = 0 A is a Maxwell field with gauge xi^4, and phi is gauge-inert (a massless scalar). The
// Noether conditions delta0 S2 = total derivative and delta0 S3 + delta1 S2 = total derivative (E-GRV-0141's pair)
// should force linearized 5d Einstein-Hilbert (Fierz-Pauli with D = 5), in which the w-w block on the husk metric is
// -(1/2)(H'.H' - lambda_5 (tr H')^2) with lambda_5 = 1, and then a static T_00 at 5-momentum (0, p, 0, 0, m) exchanges
// with tensor factor 2/3 for every m, the massive 4d graviton's; at m = 0 it also reads 2/3, the radion adding 1/6 to
// the 4d graviton's 1/2.
//
// THE ANSATZ. Every O_h-invariant sum of dH dH and H dH dH, O_h acting on the husk's x, y, z only: neither isotropy
// between the husk and the depth, nor w -> -w, nor time reversal is put in, and the depth stiffness is a free coupling.
// 1486 columns in five dimensions (138 quadratic). Everything exact over GF(p), two primes.
//
// THE GATES, fixed before computing:
//   B1  full 5d slide at cubic order: the metric kernel has rank 1 and holds the 5d Fierz-Pauli form (its w-w block on
//       the husk metric nonzero, equal to Fierz-Pauli's with no residual, lambda_5 = 1 read off exactly)
//   B2  the static exchange factor of a massive KK mode, read from the DERIVED kernel (not the transcribed form), is
//       2/3 at every (p, m) tried, with de Donder weights 1 and 2 agreeing, and W (p^2 + m^2) one value (the KK mass
//       is the depth momentum)
//   B3  the depth components come out as the flat-bulk KK spectrum RS builds on: at k_4 != 0 the kernel's null space is
//       5 gauge directions whose depth projection has rank 5 (graviphoton and radion pure gauge); at k_4 = 0 it is 5
//       again with depth projection rank 1 (only A ~ k, the graviphoton's own gauge), the graviphoton block is Maxwell
//       (rank 3 of 4, decoupled from the husk metric and the radion), and the radion is physical and massless (W p^2
//       one value at k_4 = 0, and the full exchange exceeds the husk-metric-only one)
//   controls
//     C1  E-GRV-0141 reproduced as the depth-independent sector: in four dimensions the same code (covariant variables)
//         gives metric kernel rank 1 with 4d Fierz-Pauli in it and rank 2 under the linear slide, and the 5d kernel
//         restricted to the husk metric and husk derivatives is 4d Fierz-Pauli's, exactly (stacked rank 1)
//     C2  a slide in the 4d directions only (xi^w = 0) leaves the 5d couplings free: metric kernel rank >= 2
//     C3  the gate can fail: at c = 2 and depth scale b = 3 the kernel holds Fierz-Pauli at (2, 3) and NOT at (1, 1)
//     the two primes agree on every count and every residue
// Status: pass if B1, B2, B3 and the controls hold; partial if the controls and B1 hold and B2 or B3 fails; fail else.
// Variants, gating nothing: the linear 5d slide (order 1 alone); the depth foliation xi^w = f(w).
//
// WHAT IS PUT IN. The Lie derivative of the 5d metric (the slide of unlabeled docks in time, husk and depth, with the
// light's c and a depth scale b); the flat bulk (no warp: on AdS the action's coefficients depend on w and a
// zero-derivative term enters, which a constant-coefficient two-derivative ansatz cannot hold, so this is the limit of
// momenta far above the AdS curvature); an O_h-symmetric local two-derivative action. L1: the Deser / Wald bootstrap in
// five dimensions, and the textbook KK reduction.
//
// WHAT CAME OUT (2026-09-27). Pass on every gate, both primes agreeing, 4.6 s.
//   B1  full 5d slide: 331 invariant (1 genuine modulo total derivatives), metric kernel rank 1 with 5d Fierz-Pauli
//       in it; the w-w block on the husk metric rank 1, residual 0 against Fierz-Pauli's, lambda_5 = 1 on every member,
//       (mu, gamma_w) rank 1 with gamma_w b^2 + mu c^2 = 0
//   B2  from the derived kernel: 2/3 at all six massive points, de Donder 1 and 2 agreeing, W (p^2 + m^2) one value;
//       the same at c = 2, b = 3 with W (p^2 + (m / b)^2) one value
//   B3  null space 5 at k_4 = 3 with depth projection 5; null space 5 at k_4 = 0 with depth projection 1, graviphoton
//       block rank 3, 0 mixing entries; zero mode 2/3 with the radion, 1/2 on the husk metric alone, W p^2 one value
//   C1  4d: 257 columns, 49 invariant, 1 genuine, kernel rank 1 and Fierz-Pauli; linear rank 2. The 5d kernel on the
//       husk (48 keys) stacked with 4d Fierz-Pauli has rank 1
//   C2  husk-only slide (xi^w = 0): kernel rank 7, lambda_5 pair 2, (mu, gamma_w) 2, depth couplings rank 6; FP5 plus
//       each of its 7 basis members gives 6 distinct massive factors, 2 of them 2/3 (reported, added after run 1)
//   C3  at c = 2, b = 3: Fierz-Pauli at (2, 3) in the span, at (1, 1) not
//   variants: the linear 5d slide leaves rank 5 (lambda_5 = 1 on the xx, yy against xy pair already, but the w-w block
//   rank 2 and the depth stiffness free, as E-GRV-0139's speed was along t); the depth foliation
//   xi^w = f(w) leaves rank 4, the depth's own Horava count (E-GRV-0141's foliation also left 4)
//
// DETERMINISM: nothing is drawn. Every count is an exact rank, every factor an exact residue.

import { addScaled, nullSpaceOfRows, parseMono, type Poly } from '@/code/algebra/jet-polynomial'
import { inverseMod, mod, mulMod, nullSpaceMod, primeBelow, rankMod } from '@/code/algebra/linear/modular-linear'
import {
  type BulkAnsatz,
  bulkAnsatz,
  bulkContext,
  bulkFierzPauli,
  type BulkFrame,
  bulkFrame,
  bulkKernel,
  type BulkKind,
  bulkMonomialRows,
  depthFields,
  kernelExchange,
  kernelMatrix,
  restrictKernel,
} from '@/code/measure/bulk-slide'
import { kernelKey } from '@/code/measure/cubic-slide'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const PRIMES = [primeBelow(2 ** 25), primeBelow(2 ** 24)]
const FIVE = bulkFrame(5)
const FOUR = bulkFrame(4)

type Variant = { name: string; frame: BulkFrame; kind: BulkKind; scales: number[]; maxOrder: 1 | 2 }

const VARIANTS: readonly Variant[] = [
  { name: 'full', frame: FIVE, kind: 'full', scales: [1, 1, 1, 1, 1], maxOrder: 2 },
  { name: 'full c 2 b 3', frame: FIVE, kind: 'full', scales: [2, 1, 1, 1, 3], maxOrder: 2 },
  { name: 'husk', frame: FIVE, kind: 'husk', scales: [1, 1, 1, 1, 1], maxOrder: 2 },
  { name: 'linear', frame: FIVE, kind: 'full', scales: [1, 1, 1, 1, 1], maxOrder: 1 },
  { name: 'depth foliation', frame: FIVE, kind: 'depth-foliation', scales: [1, 1, 1, 1, 1], maxOrder: 2 },
  { name: '4d full', frame: FOUR, kind: 'full', scales: [1, 1, 1, 1], maxOrder: 2 },
  { name: '4d linear', frame: FOUR, kind: 'full', scales: [1, 1, 1, 1], maxOrder: 1 },
]

// a functional on the quadratic kernel: weighted kernel keys
type Functional = readonly (readonly [string, number])[]

type Reads = {
  columns: number
  rows: number
  invariant: number
  genuine: number
  metricKernel: number
  fierzPauliInSpan: boolean
  unitFierzPauliInSpan: boolean
  // the w-w block on the husk metric (five dimensions only)
  depthBlock: number
  depthResidual: number
  lambda5Pair: number
  lambda5IsOne: boolean
  depthPair: number
  depthTied: number
  // the kernel's keys that touch a depth component
  depthCouplings: number
  // the one kernel (the first member with a quadratic part), when the kernel has rank 1
  kernel: Poly | undefined
  // a basis of the family's kernels (members chosen greedily, each raising the rank)
  basisKernels: Poly[]
}

const ANSATZ = new Map<BulkFrame, BulkAnsatz>([
  [FIVE, bulkAnsatz(FIVE, true)],
  [FOUR, bulkAnsatz(FOUR, true)],
])

function analyse(v: Variant, p: number, eomRank: number): Reads {
  const { frame } = v
  const ansatz = ANSATZ.get(frame)!
  const width = ansatz.columns.length
  const ctx = bulkContext(frame, { kind: v.kind, scales: v.scales, p }, v.maxOrder)
  const memo = new Map<string, Poly>()
  const rows = new Map<string, Map<number, number>>()

  ansatz.columns.forEach((column, col) => {
    const total: Poly = new Map()

    for (const [key, coef] of column) {
      let r = memo.get(key)

      if (!r) {
        r = bulkMonomialRows(ctx, parseMono(key))
        memo.set(key, r)
      }
      addScaled(total, r, mod(coef, p), p)
    }
    for (const [rk, val] of total) {
      if (!rows.has(rk)) rows.set(rk, new Map())
      rows.get(rk)!.set(col, val)
    }
  })

  const { basis } = nullSpaceOfRows(rows.values(), width, p)
  const dim = basis.length
  const kernels = ansatz.columns.map((column, col) => {
    if (!ansatz.quadratic[col]) return new Map<string, number>()

    const modded: Poly = new Map()

    addScaled(modded, column, 1, p)

    return bulkKernel(frame, modded, p)
  })
  const members = basis.map(theta => {
    const out: Poly = new Map()

    theta.forEach((x, col) => x !== 0 && kernels[col]!.size > 0 && addScaled(out, kernels[col]!, x, p))

    return out
  })
  const value = (f: Functional, m: Poly): number => f.reduce((t, [key, w]) => mod(t + mulMod(m.get(key) ?? 0, mod(w, p), p), p), 0)
  const rank = (fs: readonly Functional[]): number => (dim === 0 || fs.length === 0 ? 0 : rankMod(fs.map(f => members.map(m => value(f, m))), dim, p))
  const one = (key: string): Functional => [[key, 1]]
  const fp = bulkKernel(frame, bulkFierzPauli(frame, v.scales, p), p)
  const unitFp = bulkKernel(frame, bulkFierzPauli(frame, v.scales.map(() => 1), p), p)
  const keys = [...new Set([...members.flatMap(m => [...m.keys()]), ...fp.keys(), ...unitFp.keys()])].sort()
  const matrix = keys.map(key => members.map(m => m.get(key) ?? 0))
  const metricKernel = dim === 0 ? 0 : rankMod(matrix, dim, p)
  const spanWith = (extra: Poly): boolean => rankMod(keys.map((key, i) => [...matrix[i]!, extra.get(key) ?? 0]), dim + 1, p) === metricKernel

  const five = frame.D === 5
  const husk = frame.comps.flatMap(([m, n], f) => (m < 4 && n < 4 ? [f] : []))
  const XY = frame.index(1, 2)
  const XX = frame.index(1, 1)
  const YY = frame.index(2, 2)
  const ww = (a: number, b: number): string => kernelKey(a, b, 4, 4)
  const huskPairs: [number, number][] = []

  for (let i = 0; i < husk.length; i++) for (let j = i; j < husk.length; j++) huskPairs.push([husk[i]!, husk[j]!])

  const refXY = fp.get(five ? ww(XY, XY) : '') ?? 0
  const depthBlock = five ? rank(huskPairs.map(([a, b]) => one(ww(a, b)))) : 0
  const depthResidual = five
    ? rank(
        huskPairs.map(([a, b]): Functional => [
          [ww(a, b), refXY],
          [ww(XY, XY), -(fp.get(ww(a, b)) ?? 0)],
        ]),
      )
    : 0
  const lambda5Pair = five ? rank([one(ww(XY, XY)), one(ww(XX, YY))]) : 0
  // lambda_5 = -q(xx, yy | ww) / q(xy, xy | ww), read on every member: -q(xx, yy) - q(xy, xy) = 0 on all of them
  const lambda5IsOne = five && depthBlock > 0 && rank([[[ww(XX, YY), 1], [ww(XY, XY), 1]]]) === 0
  const [c, b] = [v.scales[0]!, v.scales[frame.D - 1]!]
  const depthPair = five ? rank([one(kernelKey(XY, XY, 0, 0)), one(ww(XY, XY))]) : 0
  const depthTied = five
    ? rank([
        [
          [ww(XY, XY), b * b],
          [kernelKey(XY, XY, 0, 0), c * c],
        ],
      ])
    : 0
  const depth = new Set(depthFields(frame))
  const depthKeys = keys.filter(key => {
    const [a, bb] = key.split('|')[0]!.split(',').map(Number) as [number, number]

    return depth.has(a) || depth.has(bb)
  })

  return {
    columns: width,
    rows: rows.size,
    invariant: dim,
    genuine: dim - (width - eomRank),
    metricKernel,
    fierzPauliInSpan: spanWith(fp),
    unitFierzPauliInSpan: spanWith(unitFp),
    depthBlock,
    depthResidual,
    lambda5Pair,
    lambda5IsOne,
    depthPair,
    depthTied,
    depthCouplings: five ? rank(depthKeys.map(one)) : 0,
    kernel: metricKernel === 1 ? members.find(m => m.size > 0) : undefined,
    basisKernels: greedyBasis(members, keys, p),
  }
}

// members that each raise the rank of the kernels chosen so far
function greedyBasis(members: readonly Poly[], keys: readonly string[], p: number): Poly[] {
  const chosen: Poly[] = []

  for (const m of members) {
    if (m.size === 0) continue

    const next = [...chosen, m]

    if (rankMod(keys.map(key => next.map(n => n.get(key) ?? 0)), next.length, p) === next.length) chosen.push(m)
  }

  return chosen
}

// the rank of the Euler-Lagrange map on the ansatz: W minus it is the dimension of the total derivatives in the span
function equationRank(frame: BulkFrame, p: number): number {
  const ansatz = ANSATZ.get(frame)!
  const rows = new Map<string, Map<number, number>>()

  ansatz.columns.forEach((column, col) => {
    const total: Poly = new Map()

    for (const [key, coef] of column) addScaled(total, frame.space.equations(parseMono(key), p), mod(coef, p), p)
    for (const [rk, val] of total) {
      if (!rows.has(rk)) rows.set(rk, new Map())
      rows.get(rk)!.set(col, val)
    }
  })

  return nullSpaceOfRows(rows.values(), ansatz.columns.length, p).rank
}

// the exchange read from the derived kernel
type Exchange = {
  // B2: the factor at each massive point, for de Donder weights 1 and 2, and W (p^2 + (m / b)^2) at each
  massive: number[]
  massiveOtherGauge: number[]
  massScaled: number[]
  // at k_4 = 0: the full factor, W p^2 at p = 1, 2, 3, and the husk-metric-only factor
  zeroFull: number[]
  zeroScaled: number[]
  zeroHusk: number[]
  twoThirds: number
  half: number
}

const MASSIVE: readonly [number, number][] = [
  [1, 1],
  [1, 3],
  [3, 1],
  [2, 5],
  [1, 30],
  [30, 1],
]

function exchanges(kernel: Poly, scales: readonly number[], p: number): Exchange {
  const b = scales[4]!
  const binv = inverseMod(b, p)
  const at = (q: number, m: number): number[] => [0, q, 0, 0, m]
  const physical2 = (q: number, m: number): number => mod(q * q + mulMod(mulMod(m * m, binv, p), binv, p), p)
  const massive = MASSIVE.map(([q, m]) => kernelExchange(FIVE, kernel, at(q, m), scales, 1, p))
  const huskKernel = restrictKernel(FIVE, FOUR, kernel, p)

  return {
    massive: massive.map(e => e.factor),
    massiveOtherGauge: MASSIVE.map(([q, m]) => kernelExchange(FIVE, kernel, at(q, m), scales, 2, p).factor),
    massScaled: massive.map((e, i) => mulMod(e.staticW, physical2(...MASSIVE[i]!), p)),
    zeroFull: [1, 2, 3].map(q => kernelExchange(FIVE, kernel, at(q, 0), scales, 1, p).factor),
    zeroScaled: [1, 2, 3].map(q => mulMod(kernelExchange(FIVE, kernel, at(q, 0), scales, 1, p).staticW, q * q, p)),
    zeroHusk: [1, 2, 3].map(q => kernelExchange(FOUR, huskKernel, [0, q, 0, 0], scales.slice(0, 4), 1, p).factor),
    twoThirds: mulMod(2, inverseMod(3, p), p),
    half: inverseMod(2, p),
  }
}

// B3: the kernel's null space and blocks at an off-shell 5-momentum
type Spectrum = { nullity: number; depthProjection: number; graviphotonBlock: number; graviphotonMixing: number }

function spectrum(kernel: Poly, k: readonly number[], p: number): Spectrum {
  const M = kernelMatrix(FIVE, kernel, k, p)
  const nulls = nullSpaceMod(M, FIVE.F, p)
  const depth = depthFields(FIVE)
  const A = depth.filter(f => FIVE.comps[f]![0] < 4)
  const others = Array.from({ length: FIVE.F }, (_, f) => f).filter(f => !A.includes(f))

  return {
    nullity: nulls.length,
    depthProjection: nulls.length === 0 ? 0 : rankMod(nulls.map(v => depth.map(f => v[f]!)), depth.length, p),
    graviphotonBlock: rankMod(
      A.map(a => A.map(bb => M[a]![bb]!)),
      A.length,
      p,
    ),
    graviphotonMixing: A.reduce((t, a) => t + others.filter(o => M[a]![o] !== 0).length, 0),
  }
}

const OFF_SHELL_MASSIVE = [1, 2, 5, 0, 3]
const OFF_SHELL_ZERO = [1, 2, 5, 0, 0]

export default experiment({
  id: 'gravity/bulk-slide-depth',
  code: 'E-GRV-0143',
  title:
    "the full 5d dock slide at cubic order, with the depth w as a fifth coordinate, forces 5d Einstein-Hilbert and so derives the massive KK graviton's 2/3 that E-GRV-0142 assumed, pass at L1 (B1, B2, B3; flat bulk, continuum, covariant H_MN split into the husk metric, the graviphoton H_m4 and the radion H_44, O_h on the husk's x, y, z only): of 1486 cube-symmetric two-derivative Lagrangians quadratic plus cubic in H_MN (1156 Euler-Lagrange rank), 331 satisfy delta0 S2 and delta0 S3 + delta1 S2 = total derivative exactly over two primes, 1 genuine, and their metric kernel has rank 1 and holds 5d Fierz-Pauli: the w-w block on the husk metric is Fierz-Pauli's with lambda_5 = 1 and the depth stiffness tied to the inertia; read from that derived kernel with de Donder weights 1 and 2, a static T_00 at 5-momentum (0, p, 0, 0, m) has tensor factor exactly 2/3 at six (p, m) from (1, 30) to (30, 1) and W (p^2 + m^2) one value (the KK mass is the depth momentum), also at c = 2 and depth scale b = 3 (where Fierz-Pauli at unit scales is out of the span, so the depth stiffness is read, not assumed); the depth components are the flat-bulk KK spectrum: at k_4 != 0 the kernel's null space is 5 gauge directions spanning all 5 depth components (graviphoton and radion eaten), at k_4 = 0 the graviphoton is a decoupled Maxwell field (block rank 3 of 4, only A ~ k gauge) and the radion physical and massless (W p^2 one value), the zero mode reading 2/3 with it and 1/2 on the husk metric alone; the 4d rerun in covariant variables reproduces E-GRV-0141 (257 columns, 1 genuine, kernel rank 1 and Fierz-Pauli, rank 2 under the linear slide) and the 5d kernel restricted to the husk is 4d Fierz-Pauli exactly; a slide in the 4d directions only (xi^w = 0) leaves metric kernel rank 7 (lambda_5, the depth stiffness and 6 depth couplings free; FP5 plus each of its 7 members gives 6 distinct factors), the depth foliation xi^w = f(w) rank 4 and the linear slide rank 5; the warp, the orbifold that removes the graviphoton zero mode and the radion's stabilization are not derived",
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    const eom = new Map<BulkFrame, number[]>([
      [FIVE, PRIMES.map(p => equationRank(FIVE, p))],
      [FOUR, PRIMES.map(p => equationRank(FOUR, p))],
    ])
    const table = VARIANTS.map(v => ({ v, reads: PRIMES.map((p, i) => analyse(v, p, eom.get(v.frame)![i]!)) }))
    const read = (name: string, i = 0): Reads => table.find(t => t.v.name === name)!.reads[i]!
    const full = read('full')
    const scaled = read('full c 2 b 3')
    const husk = read('husk')
    const linear = read('linear')
    const foliation = read('depth foliation')
    const four = read('4d full')
    const fourLinear = read('4d linear')
    const strip = (r: Reads): Omit<Reads, 'kernel' | 'basisKernels'> => {
      const { kernel: _k, basisKernels: _b, ...rest } = r

      return rest
    }
    // reported, gating nothing (added after the first run): under the husk-only slide the exchange is not fixed. The
    // 5d Fierz-Pauli kernel plus each basis member of that family, at (p, m) = (1, 1): how many distinct factors
    const p0 = PRIMES[0]!
    const fp5 = bulkKernel(FIVE, bulkFierzPauli(FIVE, [1, 1, 1, 1, 1], p0), p0)
    const detuned = husk.basisKernels.map(member => {
      const sum: Poly = new Map()

      addScaled(sum, fp5, 1, p0)
      addScaled(sum, member, 1, p0)
      try {
        return kernelExchange(FIVE, sum, [0, 1, 0, 0, 1], [1, 1, 1, 1, 1], 1, p0).factor
      } catch {
        return -1
      }
    })
    const twoThirds0 = mulMod(2, inverseMod(3, p0), p0)
    const detunedDistinct = new Set(detuned.filter(f => f >= 0)).size
    const detunedAtTwoThirds = detuned.filter(f => f === twoThirds0).length
    const detunedSingular = detuned.filter(f => f < 0).length
    const countsAgree = table.every(({ reads }) => JSON.stringify(strip(reads[0]!)) === JSON.stringify(strip(reads[1]!)))

    // B2 and B3 on the derived kernel, at each prime
    const perPrime = PRIMES.map((p, i) => {
      const kernel = read('full', i).kernel
      const kernelScaled = read('full c 2 b 3', i).kernel

      if (!kernel || !kernelScaled) return undefined

      const fourFp = bulkKernel(FOUR, bulkFierzPauli(FOUR, [1, 1, 1, 1], p), p)
      const restricted = restrictKernel(FIVE, FOUR, kernel, p)
      const keys = [...new Set([...restricted.keys(), ...fourFp.keys()])]
      const stacked = rankMod(
        keys.map(key => [restricted.get(key) ?? 0, fourFp.get(key) ?? 0]),
        2,
        p,
      )

      return {
        exchange: exchanges(kernel, [1, 1, 1, 1, 1], p),
        exchangeScaled: exchanges(kernelScaled, [2, 1, 1, 1, 3], p),
        massive: spectrum(kernel, OFF_SHELL_MASSIVE, p),
        zero: spectrum(kernel, OFF_SHELL_ZERO, p),
        restrictedSize: restricted.size,
        restrictedStacked: stacked,
      }
    })
    const ok = perPrime.every(x => x !== undefined)
    const x = perPrime[0]
    // residues differ between primes; compare what each prime says about its own 2/3 and 1/2
    const exchangeGood = (e: Exchange): boolean =>
      e.massive.every(f => f === e.twoThirds) &&
      e.massiveOtherGauge.every(f => f === e.twoThirds) &&
      e.massScaled.every(w => w === e.massScaled[0]) &&
      e.zeroScaled.every(w => w === e.zeroScaled[0])
    const agree = countsAgree && ok && JSON.stringify(perPrime[0]!.massive) === JSON.stringify(perPrime[1]!.massive) && JSON.stringify(perPrime[0]!.zero) === JSON.stringify(perPrime[1]!.zero)

    const B1 = full.metricKernel === 1 && full.fierzPauliInSpan && full.depthBlock === 1 && full.depthResidual === 0 && full.lambda5IsOne
    const B2 = ok && perPrime.every(y => exchangeGood(y!.exchange) && exchangeGood(y!.exchangeScaled))
    const B3 =
      ok &&
      perPrime.every(
        y =>
          y!.massive.nullity === 5 &&
          y!.massive.depthProjection === 5 &&
          y!.zero.nullity === 5 &&
          y!.zero.depthProjection === 1 &&
          y!.zero.graviphotonBlock === 3 &&
          y!.zero.graviphotonMixing === 0 &&
          y!.exchange.zeroFull.every(f => f === y!.exchange.twoThirds) &&
          y!.exchange.zeroHusk.every(f => f === y!.exchange.half),
      )
    const C1 =
      four.metricKernel === 1 &&
      four.fierzPauliInSpan &&
      four.genuine === 1 &&
      fourLinear.metricKernel === 2 &&
      ok &&
      perPrime.every(y => y!.restrictedSize > 0 && y!.restrictedStacked === 1)
    const C2 = husk.metricKernel >= 2
    const C3 = scaled.metricKernel === 1 && scaled.fierzPauliInSpan && !scaled.unitFierzPauliInSpan
    const controls = C1 && C2 && C3 && agree
    const status = B1 && B2 && B3 && controls ? 'pass' : controls && B1 ? 'partial' : 'fail'
    const row = (r: Reads): string =>
      `columns ${r.columns}, rows ${r.rows}, invariant ${r.invariant} (genuine ${r.genuine}); metric kernel rank ${r.metricKernel} (Fierz-Pauli in span ${r.fierzPauliInSpan}, unit-scale Fierz-Pauli ${r.unitFierzPauliInSpan}); w-w block ${r.depthBlock}, residual ${r.depthResidual}, lambda_5 pair ${r.lambda5Pair}, lambda_5 = 1 ${r.lambda5IsOne}; (mu, gamma_w) ${r.depthPair}, tied ${r.depthTied}; depth couplings ${r.depthCouplings}`
    const ex = x?.exchange

    return verdict({
      status,
      claim: `B1 ${B1}, B2 ${B2}, B3 ${B3}; C1 ${C1}, C2 ${C2}, C3 ${C3}, primes agree ${agree}. ${table.map(({ v, reads }) => `${v.name}: ${row(reads[0]!)}`).join(' | ')}`,
      metrics: {
        columns: full.columns,
        invariant: full.invariant,
        genuine: full.genuine,
        metricKernel: full.metricKernel,
        depthBlock: full.depthBlock,
        depthResidual: full.depthResidual,
        lambda5Pair: full.lambda5Pair,
        depthTied: full.depthTied,
        massiveNullity: x?.massive.nullity ?? -1,
        massiveDepthProjection: x?.massive.depthProjection ?? -1,
        zeroNullity: x?.zero.nullity ?? -1,
        zeroDepthProjection: x?.zero.depthProjection ?? -1,
        graviphotonBlock: x?.zero.graviphotonBlock ?? -1,
        graviphotonMixing: x?.zero.graviphotonMixing ?? -1,
        massiveAtTwoThirds: ex ? ex.massive.filter(f => f === ex.twoThirds).length : -1,
        zeroFullAtTwoThirds: ex ? ex.zeroFull.filter(f => f === ex.twoThirds).length : -1,
        zeroHuskAtHalf: ex ? ex.zeroHusk.filter(f => f === ex.half).length : -1,
        huskMetricKernel: husk.metricKernel,
        huskLambda5Pair: husk.lambda5Pair,
        huskDepthPair: husk.depthPair,
        huskDepthCouplings: husk.depthCouplings,
        linearMetricKernel: linear.metricKernel,
        foliationMetricKernel: foliation.metricKernel,
        fourMetricKernel: four.metricKernel,
        fourGenuine: four.genuine,
        fourLinearMetricKernel: fourLinear.metricKernel,
        huskDetunedMembers: detuned.length,
        huskDetunedDistinct: detunedDistinct,
        huskDetunedAtTwoThirds: detunedAtTwoThirds,
        huskDetunedSingular: detunedSingular,
      },
      control: { huskMetricKernel: husk.metricKernel, scaledUnitInSpan: scaled.unitFierzPauliInSpan ? 1 : 0, fourLinearMetricKernel: fourLinear.metricKernel },
      notes: `primes ${PRIMES.join(', ')}. Euler-Lagrange rank 5d ${eom.get(FIVE)![0]}, 4d ${eom.get(FOUR)![0]}. Massive points (p, m) ${MASSIVE.map(([q, m]) => `(${q}, ${m})`).join(' ')}; off-shell momenta ${OFF_SHELL_MASSIVE.join(' ')} and ${OFF_SHELL_ZERO.join(' ')}. Residues at the first prime: 2/3 is ${ex?.twoThirds}, 1/2 is ${ex?.half}; massive factors ${ex?.massive.join(' ')}; zero-mode full ${ex?.zeroFull.join(' ')}, husk metric only ${ex?.zeroHusk.join(' ')}; W (p^2 + m^2) ${ex?.massScaled.join(' ')}; W p^2 at k_4 = 0 ${ex?.zeroScaled.join(' ')}. The 5d kernel restricted to the husk: ${x?.restrictedSize} keys, stacked with 4d Fierz-Pauli rank ${x?.restrictedStacked}.`,
    })
  },
})
