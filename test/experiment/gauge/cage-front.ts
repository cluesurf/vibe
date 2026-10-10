// THE FRONT LEMMA: IS R*'S STRAIGHT-THROUGH TRANSFER NILPOTENT ON A LONE THIRD'S START? (note/project/vibe/roadmap/
// moving-matter item 0086, decision 019 point 3). Explores whether any colour field could cage a lone third on R*'s cycle.
// On the D4 box the farthest dock one cycle reaches along root d is x0 + 2d, by one path (out along d, straight through
// the hub x0 + d), so after n cycles x0 + 2n d holds (product of link unitaries) times N_d^n s0, with N_d the colour-free
// straight-through block: |front| = |N_d^n s0| for every colour field. If N_d^n s0 never vanishes, the support grows for
// ever and no colour field of any kind cages a lone third.
//
// THE WALKS. Every cycle here is U = T Q1 T Q0 with T slot-diagonal (slot a's content moves by one root and keeps its slot)
// and Q0, Q1 one-dock pieces. The CAGE ENGINE (holonomy-caging cagingBeat, 192 modes a dock, the cycle R*'s cage reads
// evolve) has V = T X with X the slot swap, so Q0 = X P_S, Q1 = X P_D. The SETS are E-FRC-0267's register walk (chiralSlab,
// 96 modes a dock), plain and Wilson, on half + and half -, whose colorPieces P already hold the swap: Q = P. So
//   N_a = Pi_a Q1 Pi_a Q0,   the front after n cycles  f_n = N_a^n s0 = A_a^(n - 1) f_1,   A_a = (Q1)_aa (Q0)_aa
// and N_a is the extremal Fourier block of U(theta): the coefficient of e^(-4 i t) on the line theta = t w_a,
// w_a . m_d = r_a . r_d, where only a = b = d reaches frequency 4. STEP 1 reads N_a both ways (the DFT is the instrument).
//
// GATES, fixed 2026-10-09 before any read (item 0086):
//   KILL-ALL   on both sets (plain and Wilson, each half), some d has N_d^n s0 nonzero (above 1e-12 relative to rho_d^n)
//              for every n up to 4 times the span dimension
//   NILPOTENT  on some set every N_d is nilpotent on the reachable span (then the next extremal displacements are reported)
//   OPEN       STEP 2 fails: the box front norm on identity, cf0 and R*'s hash (weyl section), side 20, must equal
//              |N_d^n s0| to 1e-12 relative wherever STEP 3 counts one cycle path to the front
// CONTROL that must not read KILL-ALL: 0074's pi-flux rhombic chain, whose two extremal paths A_0 -> B, C -> A_1 cancel.
//
// DETERMINISM: no random numbers. FLOAT: measurement; every verdict is a norm against a fixed tolerance or a count.

import { experiment } from '@/test/scaffold/suite'
import { verdict, type Verdict } from '@/test/scaffold/verdict'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { makeColorWeave } from '@/code/rule/color-weave'
import { ringUnit, unitAngle } from '@/code/measure/swap-string'
import { partnerBasis } from '@/code/measure/register-meson'
import { complexEigenvalues } from '@/code/algebra/linear/complex-eigen'
import { chiralSlab } from '@/code/measure/anomaly-matching-walls'
import { bulkBox, colorPieces } from '@/code/measure/color-slab'
import { identityField, ruleField, sigmaTable, type ColorField } from '@/code/measure/color-gates'
import { dockStart } from '@/code/measure/color-gates-cage'
import { centerField, enumerateCenterPatterns } from '@/code/measure/center-flux'
import { cageGeometry, fullBlock } from '@/code/measure/cage-velocity'
import { centerCellField, makeCell, setBlock } from '@/code/measure/cage-cells'
import { CAGING_REG, CAGING_SLOTS, cagingBeat, cagingEngine, type CagingState, type RoleLinks } from '@/code/measure/holonomy-caging'
import { buildHyperbolicBall, frameInverse, labelTransports, labelledCoin } from '@/code/substrate/coxeter/label-transport'
import { identity, matMul, matVec, pointKey, toPoincare, type Mat } from '@/code/substrate/coxeter/minkowski'

const SLOTS = CAGING_SLOTS
const TAU = 2 * Math.PI
const REL = 1e-12
const BOX_SIDE = 20
const BOX_CYCLES = 32

type C = { re: Float64Array; im: Float64Array }

// ---- small complex linear algebra ----

const cmat = (n: number): C => ({ re: new Float64Array(n * n), im: new Float64Array(n * n) })
const cvec = (n: number): C => ({ re: new Float64Array(n), im: new Float64Array(n) })

function mm(n: number, A: C, B: C): C {
  const O = cmat(n)

  for (let i = 0; i < n; i++) {
    for (let l = 0; l < n; l++) {
      const ar = A.re[i * n + l]!
      const ai = A.im[i * n + l]!

      if (ar === 0 && ai === 0) {
        continue
      }

      for (let j = 0; j < n; j++) {
        O.re[i * n + j]! += ar * B.re[l * n + j]! - ai * B.im[l * n + j]!
        O.im[i * n + j]! += ar * B.im[l * n + j]! + ai * B.re[l * n + j]!
      }
    }
  }

  return O
}

function mv(n: number, A: C, v: C): C {
  const o = cvec(n)

  for (let i = 0; i < n; i++) {
    let r = 0
    let s = 0

    for (let j = 0; j < n; j++) {
      const ar = A.re[i * n + j]!
      const ai = A.im[i * n + j]!

      r += ar * v.re[j]! - ai * v.im[j]!
      s += ar * v.im[j]! + ai * v.re[j]!
    }

    o.re[i] = r
    o.im[i] = s
  }

  return o
}

const vnorm = (v: C): number => {
  let s = 0

  for (let i = 0; i < v.re.length; i++) {
    s += v.re[i]! ** 2 + v.im[i]! ** 2
  }

  return Math.sqrt(s)
}

const frob = (A: C): number => vnorm(A)

// an orthonormal basis of the span of the given vectors (two-pass Gram-Schmidt, a vector kept above tol times the scale)
function spanBasis(vs: readonly C[], tol: number): C[] {
  const scale = Math.max(1e-300, ...vs.map(vnorm))
  const out: C[] = []

  for (const v0 of vs) {
    const v: C = { re: Float64Array.from(v0.re), im: Float64Array.from(v0.im) }

    for (let pass = 0; pass < 2; pass++) {
      for (const e of out) {
        let cr = 0
        let ci = 0

        for (let i = 0; i < v.re.length; i++) {
          // <e, v>
          cr += e.re[i]! * v.re[i]! + e.im[i]! * v.im[i]!
          ci += e.re[i]! * v.im[i]! - e.im[i]! * v.re[i]!
        }

        for (let i = 0; i < v.re.length; i++) {
          v.re[i]! -= cr * e.re[i]! - ci * e.im[i]!
          v.im[i]! -= cr * e.im[i]! + ci * e.re[i]!
        }
      }
    }

    const nv = vnorm(v)

    if (nv > tol * scale) {
      out.push({ re: v.re.map(x => x / nv), im: v.im.map(x => x / nv) })
    }
  }

  return out
}

// B^dag A B for an orthonormal basis B (as columns), k x k
function compress(n: number, A: C, B: readonly C[]): C {
  const k = B.length
  const O = cmat(k)
  const AB = B.map(b => mv(n, A, b))

  for (let i = 0; i < k; i++) {
    for (let j = 0; j < k; j++) {
      let r = 0
      let s = 0

      for (let q = 0; q < n; q++) {
        r += B[i]!.re[q]! * AB[j]!.re[q]! + B[i]!.im[q]! * AB[j]!.im[q]!
        s += B[i]!.re[q]! * AB[j]!.im[q]! - B[i]!.im[q]! * AB[j]!.re[q]!
      }

      O.re[i * k + j] = r
      O.im[i * k + j] = s
    }
  }

  return O
}

function spectralRadius(k: number, A: C): number {
  if (k === 0) {
    return 0
  }

  const e = complexEigenvalues({ re: A.re, im: A.im, n: k })

  return Math.max(...Array.from(e.re, (x, i) => Math.hypot(x, e.im[i]!)))
}

// ---- the front read: N, a start, and the scale of the path amplitudes it sums ----

export type FrontRead = {
  // the rank of N (its range, where every front lives) and the spectral radius of N on that range
  rank: number
  rho: number
  // N nilpotent on its whole range (every internal start): |(N on range)^rank| under 1e-12 of |N|^rank
  nilpotent: boolean
  nilpotency: number
  // the span reached from s0, span{N s0, N^2 s0, ...}, and whether N^n s0 vanishes there
  span: number
  nilpotentOnSpan: boolean
  // |N^n s0| for n = 1 .. reach, with reach = max(32, 4 span), and |N^n s0| / rho^n
  norms: number[]
  relRho: number[]
  // the least |N^n s0| / rho^n over n = 1 .. 4 span (the gate), and |N^n s0|^(1/n) at the last n (Gelfand)
  gateLeast: number
  gelfand: number
  // the front is nonzero for every n up to 4 span, above 1e-12 relative to rho^n
  nonzero: boolean
}

export function frontRead(n: number, N: C, s0: C, scale: number): FrontRead {
  const cols: C[] = Array.from({ length: n }, (_, j) => {
    const v = cvec(n)

    for (let i = 0; i < n; i++) {
      v.re[i] = N.re[i * n + j]!
      v.im[i] = N.im[i * n + j]!
    }

    return v
  })
  const range = spanBasis(cols, 1e-10)
  const rank = range.length
  const A = compress(n, N, range)
  const rho = spectralRadius(rank, A)
  const nA = frob(A)

  let P = A

  for (let i = 1; i < rank; i++) {
    P = mm(rank, P, A)
  }

  const nilpotency = rank === 0 ? 0 : frob(P) / Math.max(1e-300, nA ** rank)
  const nilpotent = rank === 0 || nilpotency < REL
  const f: C[] = [mv(n, N, s0)]

  for (let i = 1; i < 2 * n && i < 64; i++) {
    f.push(mv(n, N, f[i - 1]!))
  }

  // the reachable span: f_1 counts only above 1e-12 of the path scale (a cancelled front reaches nothing)
  const f1 = vnorm(f[0]!)
  const span = f1 <= REL * scale ? 0 : spanBasis(f.slice(0, rank + 1), 1e-10).length
  const reach = Math.max(32, 4 * span)

  while (f.length < reach + 1) {
    f.push(mv(n, N, f[f.length - 1]!))
  }

  const norms = f.slice(0, reach).map(vnorm)
  const fm = span === 0 ? 0 : vnorm(f[span]!)
  const nilpotentOnSpan = span === 0 || fm <= REL * Math.max(1e-300, nA ** span) * f1
  const relRho = norms.map((v, i) => (rho > 0 ? v / rho ** (i + 1) : Infinity))
  const gateN = Math.max(1, 4 * span)
  const gateLeast = Math.min(...relRho.slice(0, gateN))
  const nonzero = span > 0 && !nilpotentOnSpan && gateLeast > REL

  return {
    rank,
    rho,
    nilpotent,
    nilpotency,
    span,
    nilpotentOnSpan,
    norms,
    relRho,
    gateLeast,
    gelfand: norms[reach - 1]! ** (1 / reach),
    nonzero,
  }
}

// ---- the walks ----

export type FrontWalk = {
  name: string
  n: number
  h: number
  Q0: C
  Q1: C
  start: C
}

function fromPieces(P: { re: ArrayLike<number>; im: ArrayLike<number> }): C {
  return { re: Float64Array.from(P.re), im: Float64Array.from(P.im) }
}

const memberU = (): [number, number] => {
  const th = unitAngle(ringUnit(-1, 4))

  return [Math.cos(th), Math.sin(th)]
}

// the cage engine: Q0 = X P_S, Q1 = X P_D, the start dockStart's dock vector (slot-uniform register mode 0)
export function engineWalk(): FrontWalk {
  const h = CAGING_REG
  const n = SLOTS * h
  const E = partnerBasis()
  const [ur, ui] = memberU()
  const PS = cmat(n)
  const PD = cmat(n)

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const id = i === j ? 1 : 0
      const s = i % h === j % h ? 1 / SLOTS : 0

      PS.re[i * n + j] = id + (ur - 1) * s
      PS.im[i * n + j] = ui * s

      let q = 0

      for (let e = 0; e < h; e++) {
        q += E[i * h + e]! * E[j * h + e]!
      }

      PD.re[i * n + j] = id + (ur - 1) * q
      PD.im[i * n + j] = -ui * q
    }
  }

  const swap = (P: C): C => {
    const O = cmat(n)

    for (let i = 0; i < n; i++) {
      const xi = OPPOSITE[Math.floor(i / h)]! * h + (i % h)

      for (let j = 0; j < n; j++) {
        O.re[i * n + j] = P.re[xi * n + j]!
        O.im[i * n + j] = P.im[xi * n + j]!
      }
    }

    return O
  }
  const s = dockStart(1, 1, 0)

  return { name: 'engine', n, h, Q0: swap(PS), Q1: swap(PD), start: { re: Float64Array.from(s.re), im: Float64Array.from(s.im) } }
}

// the sets: set 0 plain, 1 Wilson; half 0 (+) or 1 (-)
export function setWalk(set: 0 | 1, half: 0 | 1): FrontWalk {
  const cs = chiralSlab(8)
  const pieces = colorPieces(cs.sets[half]!, cs.ranges[half]!.sR, cs.ranges[half]!.dR)
  const n = Math.round(pieces.P[set]![0]!.re.length ** 0.5)
  const start = cvec(n)

  for (let m = 0; m < n; m++) {
    start.re[m] = pieces.E[m * pieces.r]!
  }

  return {
    name: `${set === 0 ? 'plain' : 'wilson'}${half === 0 ? '+' : '-'}`,
    n,
    h: n / SLOTS,
    Q0: fromPieces(pieces.P[set]![0]!),
    Q1: fromPieces(pieces.P[set]![1]!),
    start,
  }
}

// Pi_a Q Pi_b as a full n x n matrix
function slotBlock(w: FrontWalk, Q: C, a: number, b: number): C {
  const { n, h } = w
  const O = cmat(n)

  for (let i = a * h; i < (a + 1) * h; i++) {
    for (let j = b * h; j < (b + 1) * h; j++) {
      O.re[i * n + j] = Q.re[i * n + j]!
      O.im[i * n + j] = Q.im[i * n + j]!
    }
  }

  return O
}

// N_a = Pi_a Q1 Pi_a Q0
export function straightBlock(w: FrontWalk, a: number): C {
  const left = slotBlock(w, w.Q1, a, a)
  const right = cmat(w.n)

  for (let i = a * w.h; i < (a + 1) * w.h; i++) {
    for (let j = 0; j < w.n; j++) {
      right.re[i * w.n + j] = w.Q0.re[i * w.n + j]!
      right.im[i * w.n + j] = w.Q0.im[i * w.n + j]!
    }
  }

  return mm(w.n, left, right)
}

// U(theta) = T Q1 T Q0, T diagonal e^(-i theta . m_d) on slot d
function walkBlock(w: FrontWalk, m: Int32Array, theta: readonly number[]): C {
  const tq = (Q: C): C => {
    const O = cmat(w.n)

    for (let i = 0; i < w.n; i++) {
      const d = Math.floor(i / w.h)

      let t = 0

      for (let j = 0; j < 4; j++) {
        t -= theta[j]! * m[d * 4 + j]!
      }

      const c = Math.cos(t)
      const s = Math.sin(t)

      for (let j = 0; j < w.n; j++) {
        O.re[i * w.n + j] = c * Q.re[i * w.n + j]! - s * Q.im[i * w.n + j]!
        O.im[i * w.n + j] = c * Q.im[i * w.n + j]! + s * Q.re[i * w.n + j]!
      }
    }

    return O
  }

  return mm(w.n, tq(w.Q1), tq(w.Q0))
}

const maxGap = (A: C, B: C): number => {
  let g = 0

  for (let i = 0; i < A.re.length; i++) {
    g = Math.max(g, Math.hypot(A.re[i]! - B.re[i]!, A.im[i]! - B.im[i]!))
  }

  return g
}

// the coefficient of e^(-i F t) of U(t w), 9 points on the line (frequencies -4 .. 4 are distinct mod 9)
function lineCoefficient(n: number, block: (t: number) => C, F: number): C {
  const O = cmat(n)
  const nt = 9

  for (let j = 0; j < nt; j++) {
    const t = (TAU * j) / nt
    const U = block(t)
    const c = Math.cos(F * t) / nt
    const s = Math.sin(F * t) / nt

    for (let i = 0; i < n * n; i++) {
      O.re[i]! += c * U.re[i]! - s * U.im[i]!
      O.im[i]! += c * U.im[i]! + s * U.re[i]!
    }
  }

  return O
}

// ---- STEP 1 ----

export type WalkFronts = {
  walk: string
  n: number
  // the extremal block read directly against its DFT on the line, worst over slots (the instrument)
  dftGap: number
  // the walk's own block builder against cage-cells setBlock (sets, half +) or cage-velocity fullBlock (engine)
  builderGap: number
  // the frequency-4 coefficient from any slot pair a != b (must be 0: only the straight path reaches it)
  offPairMax: number
  fronts: FrontRead[]
  // some slot whose front never vanishes (KILL on this walk)
  anyNonzero: boolean
  // every slot nilpotent on its reachable span (NILPOTENT on this walk)
  allNilpotent: boolean
  seconds: number
}

export function walkFronts(w: FrontWalk): WalkFronts {
  const t0 = Date.now()
  const geo = cageGeometry(8)
  const rootZ4 = (d: number): number[] =>
    [0, 1, 2, 3].map(ax => [0, 1, 2, 3].reduce((s, j) => s + geo.metric[ax]![j]! * geo.m[d * 4 + j]!, 0))
  const zeroAngle = new Float64Array(SLOTS)
  const builder = (theta: readonly number[]): C => {
    if (w.name === 'engine') {
      const b = fullBlock(geo, zeroAngle, theta)

      return { re: Float64Array.from(b.U.re), im: Float64Array.from(b.U.im) }
    }

    return walkBlock(w, geo.m, theta)
  }

  // the builder against the independent code at three generic momenta
  let builderGap = 0
  const probes = [
    [0.31, -1.17, 2.03, 0.58],
    [1.9, 0.4, -0.77, 2.6],
    [-2.2, 1.05, 0.13, -0.91],
  ]

  for (const th of probes) {
    if (w.name === 'engine') {
      builderGap = Math.max(builderGap, maxGap(builder(th), walkBlock(w, geo.m, th)))
    } else if (w.name === 'plain+' || w.name === 'wilson+') {
      const f = centerCellField('identity', makeCell(1, [0, 0, 0, 0]), new Int8Array(SLOTS))
      const sb = setBlock(f, w.name === 'plain+' ? 0 : 1, th)

      builderGap = Math.max(builderGap, maxGap(builder(th), { re: sb.re, im: sb.im }))
    }
  }

  let dftGap = 0
  let offPairMax = 0
  const fronts: FrontRead[] = []

  for (let a = 0; a < SLOTS; a++) {
    const r = rootZ4(a)
    const wv = [0, 1, 2, 3].map(j => [0, 1, 2, 3].reduce((s, ax) => s + r[ax]! * geo.metric[ax]![j]!, 0))
    const N = straightBlock(w, a)
    const coef = lineCoefficient(w.n, t => builder(wv.map(x => x * t)), 4)

    dftGap = Math.max(dftGap, maxGap(N, coef))

    // the path scale: |(Q1)_aa| |(Q0)_a.| |s0| bounds the one path's amplitude
    const scale = frob(slotBlock(w, w.Q1, a, a)) * frob(w.Q0) * vnorm(w.start)

    fronts.push(frontRead(w.n, N, w.start, scale))
  }

  // a != b: Pi_b Q1 Pi_a Q0 sits at frequency r_a . r_b + 2 < 4 on slot a's line, so the frequency-4 coefficient equals
  // N_a alone; read the cross pieces' own top frequency to confirm it is below 4
  for (let a = 0; a < 2; a++) {
    for (let b = 0; b < SLOTS; b++) {
      if (b === a) {
        continue
      }

      const ra = rootZ4(a)
      const rb = rootZ4(b)
      const dot = ra.reduce((s, x, i) => s + x * rb[i]!, 0)

      offPairMax = Math.max(offPairMax, 2 + dot)
    }
  }

  return {
    walk: w.name,
    n: w.n,
    dftGap,
    builderGap,
    offPairMax,
    fronts,
    anyNonzero: fronts.some(f => f.nonzero),
    allNilpotent: fronts.every(f => f.nilpotentOnSpan),
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- the control: the pi-flux rhombic chain (Vidal, Mosseri, Doucot PRL 81 5888 (1998)) ----

export type ChainFront = {
  flux: number
  // the two extremal path amplitudes A_0 -> B_0 -> A_1 and A_0 -> C_0 -> A_1, and their sum
  pathB: [number, number]
  pathC: [number, number]
  sum: number
  // the extremal block of H^2 (displacement one cell) read by DFT, and the front read from the hub
  front: FrontRead
}

export function chainFront(flux: number): ChainFront {
  // H(k): A-B 1 + e^(-ik), A-C 1 + e^(-i(k + flux)) (cage-velocity rhombicBlock's hops)
  const H = (k: number): C => {
    const O = cmat(3)
    const set = (i: number, j: number, re: number, im: number): void => {
      O.re[i * 3 + j] = re
      O.im[i * 3 + j] = im
      O.re[j * 3 + i] = re
      O.im[j * 3 + i] = -im
    }

    set(0, 1, 1 + Math.cos(k), -Math.sin(k))
    set(0, 2, 1 + Math.cos(k + flux), -Math.sin(k + flux))

    return O
  }
  const N = lineCoefficient(3, k => mm(3, H(k), H(k)), 1)
  const s0: C = { re: Float64Array.from([1, 0, 0]), im: new Float64Array(3) }
  // the hub's two paths to the next hub: through B the e^(-ik) hop then the 1 hop back, through C the same with the flux
  const pathB: [number, number] = [1, 0]
  const pathC: [number, number] = [Math.cos(-flux), Math.sin(-flux)]

  return {
    flux,
    pathB,
    pathC,
    sum: Math.hypot(pathB[0] + pathC[0], pathB[1] + pathC[1]),
    front: frontRead(3, N, s0, 2),
  }
}

// ---- STEP 2: the box front on three fields ----

export type BoxFront = {
  field: string
  role: number
  side: number
  // norms[a][n - 1]: the probability norm at dock x0 + 2n r_a after n cycles, and the predicted |N_a^n s0|
  norms: number[][]
  predicted: number[][]
  // |box - predicted| / predicted, per slot and cycle
  rel: number[][]
  normDrift: number
  plaquetteLinks: number
  seconds: number
}

export function fieldOf(name: string): ColorField {
  if (name === 'identity') {
    return identityField
  }

  if (name === 'cf0') {
    return centerField(enumerateCenterPatterns().kept[0]!.pattern)
  }

  return ruleField('weyl')
}

export function boxFront(fieldName: string, role: number): BoxFront {
  const t0 = Date.now()
  const side = BOX_SIDE
  const box = bulkBox(side)
  const weave = makeColorWeave({ side, table: 'bind' })
  const link = fieldOf(fieldName).on(box, 'bulk')
  const roleLinks: RoleLinks = { k: 3, mats: sigmaTable().lifts.floats, link }
  const E = cagingEngine(weave, roleLinks, memberU())
  const per = SLOTS * CAGING_REG * 3
  const targets: number[][] = Array.from({ length: SLOTS }, (_, a) => {
    const out: number[] = []

    let x = 0

    for (let n = 1; n <= BOX_CYCLES; n++) {
      x = weave.mesh.neighbour(weave.mesh.neighbour(x, a), a)
      out.push(x)
    }

    return out
  })
  const w = engineWalk()
  const predicted = Array.from({ length: SLOTS }, (_, a) => {
    const N = straightBlock(w, a)
    const out: number[] = []

    let f = w.start

    for (let n = 1; n <= BOX_CYCLES; n++) {
      f = mv(w.n, N, f)
      out.push(vnorm(f))
    }

    return out
  })
  const norms: number[][] = Array.from({ length: SLOTS }, () => [])

  let s: CagingState = dockStart(box.cells, 3, role)
  let normDrift = 0

  for (let b = 0; b < 2 * BOX_CYCLES; b++) {
    s = cagingBeat(E, s, b)

    if (b % 2 === 1) {
      const n = (b + 1) / 2

      for (let a = 0; a < SLOTS; a++) {
        const x = targets[a]![n - 1]!

        let p = 0

        for (let i = x * per; i < (x + 1) * per; i++) {
          p += s.re[i]! ** 2 + s.im[i]! ** 2
        }

        norms[a]!.push(Math.sqrt(p))
      }

      let total = 0

      for (let i = 0; i < s.re.length; i++) {
        total += s.re[i]! ** 2 + s.im[i]! ** 2
      }

      normDrift = Math.max(normDrift, Math.abs(total - 1))
    }
  }

  const id = sigmaTable().identity

  return {
    field: fieldName,
    role,
    side,
    norms,
    predicted,
    rel: norms.map((row, a) => row.map((v, i) => Math.abs(v - predicted[a]![i]!) / predicted[a]![i]!)),
    normDrift,
    plaquetteLinks: link.reduce((c, l) => c + (l !== id ? 1 : 0), 0),
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- STEP 3: cycle paths on the box, shortest dock paths on the true mesh ----

export type BoxPaths = {
  side: number
  // counts[a][n - 1]: root sequences of length 2n from x0 ending on x0 + 2n r_a (the box's neighbours), and the least and
  // greatest over slots at each n
  counts: number[][]
  least: number[]
  most: number[]
  // the last n with one path on every slot
  uniqueThrough: number
  seconds: number
}

export function boxPaths(): BoxPaths {
  const t0 = Date.now()
  const side = BOX_SIDE
  const box = bulkBox(side)
  const cells = box.cells
  const targets: number[][] = Array.from({ length: SLOTS }, (_, a) => {
    const out: number[] = []

    let x = 0

    for (let n = 1; n <= BOX_CYCLES; n++) {
      x = box.nb[box.nb[x * SLOTS + a]! * SLOTS + a]!
      out.push(x)
    }

    return out
  })

  let cur = new Float64Array(cells)

  cur[0] = 1

  const counts: number[][] = Array.from({ length: SLOTS }, () => [])

  for (let step = 1; step <= 2 * BOX_CYCLES; step++) {
    const next = new Float64Array(cells)

    for (let x = 0; x < cells; x++) {
      const c = cur[x]!

      if (c === 0) {
        continue
      }

      for (let d = 0; d < SLOTS; d++) {
        next[box.nb[x * SLOTS + d]!]! += c
      }
    }

    cur = next

    if (step % 2 === 0) {
      for (let a = 0; a < SLOTS; a++) {
        counts[a]!.push(cur[targets[a]![step / 2 - 1]!]!)
      }
    }
  }

  const least = Array.from({ length: BOX_CYCLES }, (_, i) => Math.min(...counts.map(r => r[i]!)))
  const most = Array.from({ length: BOX_CYCLES }, (_, i) => Math.max(...counts.map(r => r[i]!)))
  const first = most.findIndex(v => v !== 1)

  return { side, counts, least, most, uniqueThrough: first < 0 ? BOX_CYCLES : first, seconds: (Date.now() - t0) / 1000 }
}

export type MeshPaths = {
  radius: number
  cells: number
  inconsistentSteps: number
  // per n = 1 .. 4: the graph distance of tau_a^(2n) and its number of shortest paths, least and greatest over slots
  distance: { least: number; most: number }[]
  paths: { least: number; most: number }[]
  perSlot: { distance: number[]; paths: number[] }[]
  seconds: number
}

export function meshPaths(): MeshPaths {
  const t0 = Date.now()
  const radius = 4
  const coin = labelledCoin()
  const ball = buildHyperbolicBall({ coin, radius })
  const transports = labelTransports({ coin, kind: 'antipodal' })
  const { center, timeAxis } = coin.frame
  const keyOf = (g: Mat): string => pointKey(toPoincare(matVec(g, center), timeAxis))
  const degree = transports.length
  // geodesic word counts N(c), breadth-first order
  const count = new Float64Array(ball.cells)

  count[0] = 1

  for (let c = 1; c < ball.cells; c++) {
    const dc = ball.distance[c]!

    let s = 0

    for (let k = 0; k < degree; k++) {
      const y = ball.mesh.neighbour(c, k)

      if (y !== ball.phantom && ball.distance[y] === dc - 1) {
        s += count[y]!
      }
    }

    count[c] = s
  }

  const inverses = ball.frames.map(g => frameInverse(coin, g))
  const perSlot: { distance: number[]; paths: number[] }[] = []

  for (let a = 0; a < degree; a++) {
    const distance: number[] = []
    const paths: number[] = []

    let g = identity(coin.frame.dim)

    for (let L = 1; L <= 8; L++) {
      g = matMul(g, transports[a]!)

      if (L % 2 === 1) {
        continue
      }

      const direct = ball.index.get(keyOf(g))

      if (L <= radius && direct !== undefined) {
        distance.push(ball.distance[direct]!)
        paths.push(count[direct]!)
        continue
      }

      // midpoint split: D = min over c (|c| <= L/2) of |c| + |c^-1 g|, paths = sum over |c| = L/2 of N(c) N(c^-1 g)
      const m = L / 2

      let D = Infinity
      let total = 0

      for (let c = 0; c < ball.cells; c++) {
        const dc = ball.distance[c]!

        if (dc > m) {
          break
        }

        const h = ball.index.get(keyOf(matMul(inverses[c]!, g)))

        if (h === undefined) {
          continue
        }

        D = Math.min(D, dc + ball.distance[h]!)

        if (dc === m && ball.distance[h] === L - m) {
          total += count[c]! * count[h]!
        }
      }

      distance.push(D)
      paths.push(D === L ? total : NaN)
    }

    perSlot.push({ distance, paths })
  }

  const over = (pick: (s: { distance: number[]; paths: number[] }) => number[], i: number): { least: number; most: number } => ({
    least: Math.min(...perSlot.map(s => pick(s)[i]!)),
    most: Math.max(...perSlot.map(s => pick(s)[i]!)),
  })

  return {
    radius,
    cells: ball.cells,
    inconsistentSteps: ball.inconsistentSteps,
    distance: [0, 1, 2, 3].map(i => over(s => s.distance, i)),
    paths: [0, 1, 2, 3].map(i => over(s => s.paths, i)),
    perSlot,
    seconds: (Date.now() - t0) / 1000,
  }
}

// ---- stages and the verdict ----

export type CfrontStage =
  | { kind: 'step1'; walks: WalkFronts[]; chain: ChainFront[]; seconds: number }
  | { kind: 'box'; read: BoxFront }
  | { kind: 'box-paths'; read: BoxPaths }
  | { kind: 'mesh-paths'; read: MeshPaths }

export function cfrontSpecs(): { name: string; run: () => CfrontStage }[] {
  const boxes = [
    ['identity', 0],
    ['cf0', 0],
    ['rule', 0],
    ['rule', 1],
    ['rule', 2],
  ] as const

  return [
    {
      name: 'step1',
      run: () => {
        const t0 = Date.now()
        const walks = [engineWalk(), setWalk(0, 0), setWalk(0, 1), setWalk(1, 0), setWalk(1, 1)].map(walkFronts)

        return { kind: 'step1', walks, chain: [Math.PI, 0].map(chainFront), seconds: (Date.now() - t0) / 1000 }
      },
    },
    { name: 'box-paths', run: () => ({ kind: 'box-paths', read: boxPaths() }) },
    { name: 'mesh-paths', run: () => ({ kind: 'mesh-paths', read: meshPaths() }) },
    ...boxes.map(([f, r]) => ({ name: `box-${f}-${r}`, run: (): CfrontStage => ({ kind: 'box', read: boxFront(f, r) }) })),
  ]
}

export function cageFrontVerdict(stages: readonly CfrontStage[]): Verdict {
  const metrics: Record<string, number> = {}
  const notes: string[] = []
  const s1 = stages.find(s => s.kind === 'step1') as Extract<CfrontStage, { kind: 'step1' }> | undefined
  const bp = (stages.find(s => s.kind === 'box-paths') as Extract<CfrontStage, { kind: 'box-paths' }> | undefined)?.read
  const mp = (stages.find(s => s.kind === 'mesh-paths') as Extract<CfrontStage, { kind: 'mesh-paths' }> | undefined)?.read
  const boxes = stages.filter(s => s.kind === 'box').map(s => (s as Extract<CfrontStage, { kind: 'box' }>).read)

  if (!s1 || !bp) {
    return verdict({ status: 'open', claim: 'cage-front OPEN: STEP 1 or the box path count is missing', metrics, notes: '' })
  }

  // STEP 1 instrument
  const inst = Math.max(...s1.walks.map(w => Math.max(w.dftGap, w.builderGap)))
  const instOk = inst < 1e-12 && s1.walks.every(w => w.offPairMax < 4)

  metrics.instrumentGap = inst

  // STEP 2: gated where the box counts one path
  const U = bp.uniqueThrough
  const want = ['identity-0', 'cf0-0', 'rule-0']
  const present = want.every(k => boxes.some(b => `${b.field}-${b.role}` === k))

  let step2Worst = 0
  let step2Beyond = 0

  for (const b of boxes) {
    for (const row of b.rel) {
      row.forEach((v, i) => {
        if (i < U) {
          step2Worst = Math.max(step2Worst, v)
        } else {
          step2Beyond = Math.max(step2Beyond, v)
        }
      })
    }

    metrics[`step2Drift_${b.field}_${b.role}`] = b.normDrift
  }

  const step2Ok = present && U >= 1 && step2Worst < REL && boxes.every(b => b.normDrift < 1e-9)

  metrics.step2WorstUnique = step2Worst
  metrics.step2WorstBeyond = step2Beyond
  metrics.uniqueThrough = U

  // the control
  const chainPi = s1.chain.find(c => c.flux === Math.PI)
  const chainZero = s1.chain.find(c => c.flux === 0)
  const controlOk = !!chainPi && !!chainZero && !chainPi.front.nonzero && chainPi.front.nilpotentOnSpan && chainZero.front.nonzero

  metrics.chainPiSum = chainPi?.sum ?? NaN
  metrics.chainPiFront1 = chainPi?.front.norms[0] ?? NaN

  const sets = s1.walks.filter(w => w.walk !== 'engine')
  const engine = s1.walks.find(w => w.walk === 'engine')
  const kill = sets.length === 4 && sets.every(w => w.anyNonzero)
  const nilpotentSet = sets.some(w => w.allNilpotent)

  for (const w of s1.walks) {
    metrics[`rhoMax_${w.walk}`] = Math.max(...w.fronts.map(f => f.rho))
    metrics[`rhoMin_${w.walk}`] = Math.min(...w.fronts.map(f => f.rho))
    metrics[`spanMax_${w.walk}`] = Math.max(...w.fronts.map(f => f.span))
    metrics[`gateLeastMin_${w.walk}`] = Math.min(...w.fronts.map(f => f.gateLeast))
    metrics[`nonzeroSlots_${w.walk}`] = w.fronts.filter(f => f.nonzero).length
  }

  let status: Verdict['status'] = 'open'
  let word = 'OPEN'

  if (!instOk) {
    notes.push('STEP 1 instrument failed (extremal block against its DFT or the independent block builders)')
  } else if (!controlOk) {
    notes.push('the rhombic-chain control failed: pi flux must not read nonzero, flux 0 must')
  } else if (!step2Ok) {
    notes.push('STEP 2 failed or is missing')
  } else if (kill && !nilpotentSet) {
    status = 'fail'
    word = 'KILL-ALL'
  } else if (nilpotentSet) {
    status = 'pass'
    word = 'NILPOTENT'
  } else {
    notes.push('neither gate holds: some set has a nilpotent and a non-nilpotent slot mix without a kill on both')
  }

  const walkLine = s1.walks
    .map(
      w =>
        `${w.walk}: rho ${Math.min(...w.fronts.map(f => f.rho)).toFixed(6)} to ${Math.max(...w.fronts.map(f => f.rho)).toFixed(6)}, span ${Math.max(...w.fronts.map(f => f.span))}, nonzero slots ${w.fronts.filter(f => f.nonzero).length}/24, least |N^n s0|/rho^n ${Math.min(...w.fronts.map(f => f.gateLeast)).toExponential(2)}`,
    )
    .join('; ')

  return verdict({
    status,
    claim: `cage-front ${word}: ${walkLine}. STEP 2 front = |N^n s0| to ${step2Worst.toExponential(1)} on n 1..${U} (one box path), beyond ${step2Beyond.toExponential(1)}; chain pi sum ${chainPi?.sum.toExponential(1)}; mesh paths ${mp ? mp.paths.map(p => `${p.least}-${p.most}`).join(', ') : 'missing'}.`,
    metrics,
    control: { chainPiSum: chainPi?.sum ?? NaN, chainZeroNonzero: chainZero?.front.nonzero ? 1 : 0 },
    notes: [
      `engine (R*'s cage cycle) nonzero slots ${engine?.fronts.filter(f => f.nonzero).length ?? NaN}/24.`,
      'Read on the flat D4 box (the disclosed stand-in) and, for the path count only, the true {3,4,3,4} mesh.',
      ...notes,
    ].join(' '),
  })
}

export default experiment({
  id: 'gauge/cage-front',
  code: 'E-FRC-0305',
  title: 'explores whether any colour field could cage a lone third on R*s cycle, from the straight-through front block',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // serially (minutes; the stage runner deck/vibe/tmp/cfront.sh splits it)
    return cageFrontVerdict(cfrontSpecs().map(s => s.run()))
  },
})
