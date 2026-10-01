// A CHANNEL THAT JOINS THE TWO REGISTER HALVES, GAUGE INVARIANTLY (E-FRC-0273). Every piece of the register rule R*
// commutes with J = R(vol) (E-FRC-0258, 0259, 0268), and so does the SU(2)+ link field (E-SPN-0180, E-FRC-0271). This
// module builds the pair channels that do NOT, and asks which of them survive the rule's symmetries.
//
// THE CENTER. The element -1 of 2T acts on the register as Gamma(-1) = P- - P+ (register-link-field). So psi_-^dag psi_+
// is odd under the center at the dock of psi_+, and a link g(x, y) is odd at each of its two ends. Summed over docks,
// every gauge invariant operator holds an EVEN number of half + fields: no dressing of psi_-^dag psi_+ by any 2T field is
// invariant, and the least invariant join moves TWO half + members. On one dock, with fermions, that is a pair piece
// from Lambda^2(+) to Lambda^2(-) (N+ changes by 2).
//
// THE SECTORS. A pair piece keeps the flats frozen only on the sector ranges (E-SPN-0175): S = range(Q_S), the slot
// singlet times the even register, and D = range(Q_D), E-SPN-0160's partner, whose 8 states are odd register blades.
// Each is 8 dimensional; in its own coordinates (the basis E, Q = E E^T) the rule's symmetries act as 8 x 8 matrices:
//
//   sectorRestrict      E^T g E for g acting on (slot d, register b) as (slots[d], reg[a][b])
//   registerGaugeHalf   2T by right multiplication on ONE half (sign +1: E-SPN-0180's SU(2)+ field; -1: the global
//                       SU(2)- of E-FRC-0268), found by the same exact search, 4 Gamma an integer matrix
//   sectorSymmetries    per sector: J, P+, P-, the 24 Gamma+, the 24 Gamma-, the 576 rotations rho (W(F4) by minors),
//                       the 576 reflections, and the untwisted rotations L(s) = rho(g) R(s) (E-FRC-0267's spin one half)
//   channelHom          dim Hom_G(Lambda^2(X+), Lambda^2(Y-)) and dim Hom_G(X+ (x) Y+, X- (x) Y-) by characters, G the
//                       products Gamma+(h) [Gamma-(k)] rho(g) (rho normalizes the gauge group, so each element is counted
//                       the same number of times)
//   joinChannel         the intertwiner T from the gauge invariant part of Lambda^2(X+) to Lambda^2(Y-), by averaging a
//                       fixed seed over the rotations (the source is gauge invariant and the gauge acts as 1 on half -, so
//                       no gauge average is needed); Schur's check; the channel bases A_k, B_k = T A_k
//
// THE PIECE, run in E-SPN-0175's relative engine (code/measure/register-sea): the S -> D channel joins the S pair
// channel PRE-STREAM (two holes at contact in S before beat 1's stream) with the D pair channel at contact after it,
// applied in beat 2's frame before beat 2's pieces. In that frame both channels are orthogonal to the flats (the S
// image is V range(Q_S), the D range is range(Q_D), both orthogonal to V F), so the flats stay frozen, and the two
// channels are orthogonal to each other because they lie in opposite halves. K = 1 + (v - 1) Pi_b, Pi_b the projector
// on the bonding states (a_k + T a_k) / sqrt 2. The CONTROL is 1 + (v - 1) Pi_A: the same phase on the same channel,
// with nothing joined.
//
// DETERMINISM: no random numbers; the seed is a golden-ratio stream. EXACT where it says so: 4 Gamma, J and the minors
// are integers; the intertwiner, the spin lifts and every amplitude are float measurement.

import { EVEN, f4Group } from '@/code/measure/spinor-register'
import { det4, sectorBasis, volumeRight } from '@/code/measure/chiral-register'
import { hurwitzExact } from '@/code/measure/hurwitz-gauge'
import {
  evenBlade,
  leftMultiplication,
  rightMultiplication,
  spinLift,
} from '@/code/measure/register-symmetry'
import { partnerBasis } from '@/code/measure/register-meson'
import {
  FULL,
  MODES,
  singletBasis,
  type Pair,
  type Torus,
} from '@/code/measure/register-sea'

const REG = 8
const SLOTS = 24
const PAIR = REG * REG
const GOLDEN = (Math.sqrt(5) - 1) / 2

export type M8 = number[][]

export const mulM = (a: M8, b: M8): M8 =>
  a.map(r =>
    Array.from({ length: b[0]!.length }, (_, j) =>
      r.reduce((s, x, k) => s + x * b[k]![j]!, 0),
    ),
  )
export const eyeM = (n = REG): M8 =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => (i === j ? 1 : 0)),
  )
export const traceM = (a: M8): number => a.reduce((s, r, i) => s + r[i]!, 0)
export const transposeM = (a: M8): M8 => a[0]!.map((_, i) => a.map(r => r[i]!))
export const maxAbsDiff = (a: M8, b: M8): number =>
  Math.max(...a.flatMap((r, i) => r.map((x, j) => Math.abs(x - b[i]![j]!))))

// ---- one half's 2T ----

export type HalfGauge = {
  // 4 Gamma(q), integer, indexed as the Hurwitz group
  gamma4: M8[]
  homomorphism: boolean
  perm: number[]
  signs: number[]
  conjugate: boolean
}

const PERMS = [
  [1, 2, 3],
  [1, 3, 2],
  [2, 1, 3],
  [2, 3, 1],
  [3, 1, 2],
  [3, 2, 1],
]

// Gamma(q) = P_other + P_sign (w + x A1 + y A2 + z A3), A_k a signed right multiplication by e_0k, the first choice that
// is an exact homomorphism of the group table
export function registerGaugeHalf(sign: 1 | -1): HalfGauge {
  const hurwitz = hurwitzExact()
  const table = hurwitz.group.table
  const n = hurwitz.group.order
  const J = volumeRight()
  const I = eyeM()
  const R = [1, 2, 3].map(k =>
    rightMultiplication(
      evenBlade(EVEN.findIndex(b => b.join(',') === `0,${k}`)),
    ),
  )
  const on = I.map((r, i) => r.map((x, j) => x + sign * J[i]![j]!))
  const off2 = I.map((r, i) => r.map((x, j) => 2 * (x - sign * J[i]![j]!)))

  for (const conjugate of [false, true]) {
    for (const perm of PERMS) {
      for (let s = 0; s < 8; s++) {
        const signs = [0, 1, 2].map(k => ((s >> k) & 1 ? -1 : 1))
        const units = perm.map((p, k) =>
          R[p - 1]!.map(r => r.map(x => signs[k]! * x)),
        )
        const gamma4 = hurwitz.doubled.map(q => {
          const c = conjugate ? [q[0]!, -q[1]!, -q[2]!, -q[3]!] : q
          const inner = I.map((r, i) =>
            r.map(
              (x, j) =>
                c[0]! * x +
                c[1]! * units[0]![i]![j]! +
                c[2]! * units[1]![i]![j]! +
                c[3]! * units[2]![i]![j]!,
            ),
          )

          return mulM(on, inner).map((r, i) =>
            r.map((x, j) => x + off2[i]![j]!),
          )
        })

        let ok = true

        for (let a = 0; a < n && ok; a++) {
          for (let b = 0; b < n && ok; b++) {
            const p = mulM(gamma4[a]!, gamma4[b]!)
            const t = gamma4[table[a * n + b]!]!

            ok = p.every((r, i) => r.every((x, j) => x === 4 * t[i]![j]!))
          }
        }

        if (ok) {
          return { gamma4, homomorphism: true, perm, signs, conjugate }
        }
      }
    }
  }

  return {
    gamma4: [],
    homomorphism: false,
    perm: [],
    signs: [],
    conjugate: false,
  }
}

// ---- the sector coordinates ----

// E^T g E, g acting on (slot d, register b) as (slots[d], reg[a][b]); slots null is the identity
export function sectorRestrict(
  E: Float64Array,
  slots: Int32Array | null,
  reg: M8,
): M8 {
  const out = Array.from({ length: REG }, () => Array<number>(REG).fill(0))

  for (let d = 0; d < SLOTS; d++) {
    const sd = slots ? slots[d]! : d

    for (let b = 0; b < REG; b++) {
      for (let a = 0; a < REG; a++) {
        const w = reg[a]![b]!

        if (w === 0) {
          continue
        }

        for (let i = 0; i < REG; i++) {
          const ei = E[(sd * REG + a) * REG + i]!

          if (ei === 0) {
            continue
          }

          for (let j = 0; j < REG; j++) {
            out[i]![j]! += ei * w * E[(d * REG + b) * REG + j]!
          }
        }
      }
    }
  }

  return out
}

// the largest entry of g E - E (E^T g E): 0 when g keeps range(E)
export function sectorLeak(
  E: Float64Array,
  slots: Int32Array | null,
  reg: M8,
): number {
  const r = sectorRestrict(E, slots, reg)

  let worst = 0

  for (let d = 0; d < SLOTS; d++) {
    const sd = slots ? slots[d]! : d

    for (let a = 0; a < REG; a++) {
      for (let j = 0; j < REG; j++) {
        let ge = 0
        let er = 0

        for (let b = 0; b < REG; b++) {
          ge += reg[a]![b]! * E[(d * REG + b) * REG + j]!
        }

        for (let i = 0; i < REG; i++) {
          er += E[(sd * REG + a) * REG + i]! * r[i]![j]!
        }

        worst = Math.max(worst, Math.abs(ge - er))
      }
    }
  }

  return worst
}

export type SectorName = 'S' | 'D'

export type SectorSymmetries = {
  name: SectorName
  E: Float64Array
  J: M8
  plus: M8
  minus: M8
  gaugePlus: M8[]
  gaugeMinus: M8[]
  rotations: M8[]
  reflections: M8[]
  untwisted: M8[]
  // the largest leak of any symmetry out of the sector's range
  leak: number
}

export type Symmetries = {
  S: SectorSymmetries
  D: SectorSymmetries
  gaugePlus: HalfGauge
  gaugeMinus: HalfGauge
  // the rotations' spin lifts: the null space dimension (1 each) and the worst |s s~ - 1|
  liftKernel: number
  liftGap: number
}

export function sectorSymmetries(): Symmetries {
  const J = volumeRight()
  const gp = registerGaugeHalf(1)
  const gm = registerGaugeHalf(-1)
  const group = f4Group()
  const rot = group.filter(g => det4(g.matrix) === 1)
  const refl = group.filter(g => det4(g.matrix) === -1)
  const lifts = rot.map(g => spinLift(g.matrix))
  const untwistedRegister = lifts.map(l => leftMultiplication(l.s))
  const quarter = (m: M8): M8 => m.map(r => r.map(x => x / 4))
  const build = (name: SectorName, E: Float64Array): SectorSymmetries => {
    let leak = 0

    const restrict = (slots: Int32Array | null, reg: M8): M8 => {
      leak = Math.max(leak, sectorLeak(E, slots, reg))

      return sectorRestrict(E, slots, reg)
    }
    const Jx = restrict(null, J)
    const I = eyeM()
    const gaugePlus = gp.gamma4.map(g => restrict(null, quarter(g)))
    const gaugeMinus = gm.gamma4.map(g => restrict(null, quarter(g)))
    const rotations = rot.map(g => restrict(g.slots, g.register))
    const reflections = refl.map(g => restrict(g.slots, g.register))
    const untwisted = rot.map((g, k) =>
      restrict(g.slots, untwistedRegister[k]!),
    )

    return {
      name,
      E,
      J: Jx,
      plus: I.map((r, i) => r.map((x, j) => (x + Jx[i]![j]!) / 2)),
      minus: I.map((r, i) => r.map((x, j) => (x - Jx[i]![j]!) / 2)),
      gaugePlus,
      gaugeMinus,
      rotations,
      reflections,
      untwisted,
      leak,
    }
  }

  return {
    S: build('S', singletBasis()),
    D: build('D', partnerBasis()),
    gaugePlus: gp,
    gaugeMinus: gm,
    liftKernel: Math.max(...lifts.map(l => l.kernel)),
    liftGap: Math.max(...lifts.map(l => l.normGap)),
  }
}

// ---- characters ----

const chiWedge = (A: M8): number => (traceM(A) ** 2 - traceM(mulM(A, A))) / 2

export type HomCounts = {
  wedgeSStoSS: number
  wedgeSStoDD: number
  wedgeDDtoSS: number
  wedgeDDtoDD: number
  mixedSDtoSD: number
  // the gauge invariant part of Lambda^2(X+) and its rotation invariants
  gaugeWedgeS: number
  gaugeWedgeD: number
  elements: number
}

// dim Hom_G by (1 / |G|) sum chi_A chi_B (real characters), G = Gamma+(h) [Gamma-(k)] rho(g)
export function channelHom(sym: Symmetries, withMinus: boolean): HomCounts {
  const { S, D } = sym
  const mh = withMinus ? 24 : 1
  const acc = {
    wedgeSStoSS: 0,
    wedgeSStoDD: 0,
    wedgeDDtoSS: 0,
    wedgeDDtoDD: 0,
    mixedSDtoSD: 0,
  }

  let count = 0

  for (let h = 0; h < 24; h++) {
    for (let k = 0; k < mh; k++) {
      for (let r = 0; r < S.rotations.length; r++) {
        const halves = (X: SectorSymmetries): { p: M8; m: M8 } => {
          let g = mulM(X.gaugePlus[h]!, X.rotations[r]!)

          if (withMinus) {
            g = mulM(X.gaugeMinus[k]!, g)
          }

          return { p: mulM(X.plus, g), m: mulM(X.minus, g) }
        }
        const s = halves(S)
        const d = halves(D)
        const sp = chiWedge(s.p)
        const sm = chiWedge(s.m)
        const dp = chiWedge(d.p)
        const dm = chiWedge(d.m)

        acc.wedgeSStoSS += sp * sm
        acc.wedgeSStoDD += sp * dm
        acc.wedgeDDtoSS += dp * sm
        acc.wedgeDDtoDD += dp * dm
        acc.mixedSDtoSD +=
          traceM(s.p) * traceM(d.p) * traceM(s.m) * traceM(d.m)
        count++
      }
    }
  }

  const gaugeWedge = (X: SectorSymmetries): number =>
    X.gaugePlus.reduce((a, g) => a + chiWedge(mulM(X.plus, g)), 0) / 24

  return {
    wedgeSStoSS: acc.wedgeSStoSS / count,
    wedgeSStoDD: acc.wedgeSStoDD / count,
    wedgeDDtoSS: acc.wedgeDDtoSS / count,
    wedgeDDtoDD: acc.wedgeDDtoDD / count,
    mixedSDtoSD: acc.mixedSDtoSD / count,
    gaugeWedgeS: gaugeWedge(S),
    gaugeWedgeD: gaugeWedge(D),
    elements: count,
  }
}

// ---- pair operators on 64 = 8 x 8 sector coordinates, index a * 8 + b ----

export const kron = (a: M8, b: M8): M8 =>
  Array.from({ length: PAIR }, (_, i) =>
    Array.from(
      { length: PAIR },
      (__, j) =>
        a[Math.floor(i / REG)]![Math.floor(j / REG)]! * b[i % REG]![j % REG]!,
    ),
  )

// (1 - swap) / 2 times (P (x) P): the antisymmetric pairs of one half
export function wedgeProjector(P: M8): M8 {
  const PP = kron(P, P)

  return Array.from({ length: PAIR }, (_, i) =>
    Array.from({ length: PAIR }, (__, j) => {
      const js = (j % REG) * REG + Math.floor(j / REG)

      return (PP[i]![j]! - PP[i]![js]!) / 2
    }),
  )
}

export type JoinChannel = {
  source: SectorName
  target: SectorName
  // T: source coordinates -> target coordinates, T^dag T = Pi_A
  T: M8
  // the source channel's projector (the gauge invariant part of Lambda^2(+)) and an orthonormal basis of it, and the
  // target images B_k = T A_k
  PiA: M8
  A: number[][]
  B: number[][]
  // Schur: T^dag T = c Pi_A; the scale c before normalizing and the largest deviation after
  scale: number
  schurGap: number
}

// the gauge invariant part of Lambda^2(X+): the average of Gamma+(h) (x) Gamma+(h) over the 24 elements, on the
// antisymmetric pairs of half +
export function gaugeInvariantWedge(X: SectorSymmetries): M8 {
  const W = wedgeProjector(X.plus)
  const avg = W.map(r => r.map(() => 0))

  for (const g of X.gaugePlus) {
    const gg = kron(g, g)
    const m = mulM(gg, W)

    m.forEach((r, i) => r.forEach((x, j) => (avg[i]![j]! += x / 24)))
  }

  return avg
}

// an orthonormal basis of the range of a real projector, by Gram-Schmidt on its columns
export function rangeOf(P: M8, tol = 1e-9): number[][] {
  const out: number[][] = []

  for (let c = 0; c < P.length; c++) {
    let v = P.map(r => r[c]!)

    for (let pass = 0; pass < 2; pass++) {
      for (const e of out) {
        const d = v.reduce((s, x, i) => s + x * e[i]!, 0)

        v = v.map((x, i) => x - d * e[i]!)
      }
    }

    const n = Math.hypot(...v)

    if (n > tol) {
      out.push(v.map(x => x / n))
    }
  }

  return out
}

export function joinChannel(
  sym: Symmetries,
  source: SectorName,
  target: SectorName,
): JoinChannel {
  const X = sym[source]
  const Y = sym[target]
  const PiA = gaugeInvariantWedge(X)
  const PiB = wedgeProjector(Y.minus)
  // the fixed seed, a golden-ratio stream
  const seed = Array.from({ length: PAIR }, (_, i) =>
    Array.from(
      { length: PAIR },
      (__, j) => ((((i * PAIR + j + 1) * GOLDEN) % 1) + 1) % 1 - 0.5,
    ),
  )
  const X0 = mulM(mulM(PiB, seed), PiA)
  const T = X0.map(r => r.map(() => 0))

  X.rotations.forEach((gs, k) => {
    const gd = Y.rotations[k]!
    const m = mulM(mulM(kron(gd, gd), X0), transposeM(kron(gs, gs)))

    m.forEach((r, i) => r.forEach((x, j) => (T[i]![j]! += x / X.rotations.length)))
  })

  const TT = mulM(transposeM(T), T)
  const A = rangeOf(PiA)
  const scale = A.length > 0 ? traceM(TT) / A.length : 0
  const Tn = T.map(r => r.map(x => (scale > 0 ? x / Math.sqrt(scale) : 0)))
  const TTn = mulM(transposeM(Tn), Tn)
  const schurGap = maxAbsDiff(TTn, PiA)
  const B = A.map(a => Tn.map(r => r.reduce((s, x, j) => s + x * a[j]!, 0)))

  return { source, target, T: Tn, PiA, A, B, scale, schurGap }
}

// the largest entry of (g_Y (x) g_Y) T - T (g_X (x) g_X) over a list of paired group elements
export function intertwineGap(
  T: M8,
  gx: readonly M8[],
  gy: readonly M8[],
): number {
  let worst = 0

  gx.forEach((a, k) => {
    const b = gy[k]!
    const left = mulM(kron(b, b), T)
    const right = mulM(T, kron(a, a))

    worst = Math.max(worst, maxAbsDiff(left, right))
  })

  return worst
}

// ---- the piece in the relative engine ----

export type JoinMode = 'join' | 'control'

export type JoinReading = {
  // x_k = <A_k, C_S>, y_k = <B_k, C_D> before the piece; kappa = sum conj(x_k) y_k, the gauge invariant coherence
  // between the two channels
  kappaRe: number
  kappaIm: number
  sourceWeight: number
  targetWeight: number
}

// C_S[alpha][beta] of the pre-stream contact in beat 2's frame: (1 / 24) sum_(d, e) psi[move(0, d, e)][(d, alpha), (e,
// beta)] (the singlet coordinates, E_S = delta / sqrt 24 on every slot)
function sourceCoordinates(t: Torus, s: Pair): { re: number[]; im: number[] } {
  const re = Array<number>(PAIR).fill(0)
  const im = Array<number>(PAIR).fill(0)

  for (let d = 0; d < SLOTS; d++) {
    for (let e = 0; e < SLOTS; e++) {
      const j = t.move[t.origin * SLOTS * SLOTS + d * SLOTS + e]!
      const o = j * FULL + d * REG * MODES + e * REG

      for (let a = 0; a < REG; a++) {
        for (let b = 0; b < REG; b++) {
          re[a * REG + b]! += s.re[o + a * MODES + b]! / SLOTS
          im[a * REG + b]! += s.im[o + a * MODES + b]! / SLOTS
        }
      }
    }
  }

  return { re, im }
}

function addSource(
  t: Torus,
  s: Pair,
  dre: readonly number[],
  dim: readonly number[],
): void {
  for (let d = 0; d < SLOTS; d++) {
    for (let e = 0; e < SLOTS; e++) {
      const j = t.move[t.origin * SLOTS * SLOTS + d * SLOTS + e]!
      const o = j * FULL + d * REG * MODES + e * REG

      for (let a = 0; a < REG; a++) {
        for (let b = 0; b < REG; b++) {
          s.re[o + a * MODES + b]! += dre[a * REG + b]! / SLOTS
          s.im[o + a * MODES + b]! += dim[a * REG + b]! / SLOTS
        }
      }
    }
  }
}

// C_D = E_D^T psi(0) E_D, and its inverse embedding
function targetCoordinates(
  t: Torus,
  s: Pair,
  E: Float64Array,
): { re: number[]; im: number[] } {
  const o = t.origin * FULL
  // L = E^T psi(0): 8 x 192
  const Lr = new Float64Array(REG * MODES)
  const Li = new Float64Array(REG * MODES)

  for (let m1 = 0; m1 < MODES; m1++) {
    for (let g = 0; g < REG; g++) {
      const w = E[m1 * REG + g]!

      if (w === 0) {
        continue
      }

      for (let m2 = 0; m2 < MODES; m2++) {
        Lr[g * MODES + m2]! += w * s.re[o + m1 * MODES + m2]!
        Li[g * MODES + m2]! += w * s.im[o + m1 * MODES + m2]!
      }
    }
  }

  const re = Array<number>(PAIR).fill(0)
  const im = Array<number>(PAIR).fill(0)

  for (let g = 0; g < REG; g++) {
    for (let m2 = 0; m2 < MODES; m2++) {
      for (let h = 0; h < REG; h++) {
        const w = E[m2 * REG + h]!

        re[g * REG + h]! += Lr[g * MODES + m2]! * w
        im[g * REG + h]! += Li[g * MODES + m2]! * w
      }
    }
  }

  return { re, im }
}

function addTarget(
  t: Torus,
  s: Pair,
  E: Float64Array,
  dre: readonly number[],
  dim: readonly number[],
): void {
  const o = t.origin * FULL
  // (E dC)[m1][h]
  const Xr = new Float64Array(MODES * REG)
  const Xi = new Float64Array(MODES * REG)

  for (let m1 = 0; m1 < MODES; m1++) {
    for (let g = 0; g < REG; g++) {
      const w = E[m1 * REG + g]!

      if (w === 0) {
        continue
      }

      for (let h = 0; h < REG; h++) {
        Xr[m1 * REG + h]! += w * dre[g * REG + h]!
        Xi[m1 * REG + h]! += w * dim[g * REG + h]!
      }
    }
  }

  for (let m1 = 0; m1 < MODES; m1++) {
    for (let m2 = 0; m2 < MODES; m2++) {
      let r = 0
      let i = 0

      for (let h = 0; h < REG; h++) {
        const w = E[m2 * REG + h]!

        r += Xr[m1 * REG + h]! * w
        i += Xi[m1 * REG + h]! * w
      }

      s.re[o + m1 * MODES + m2]! += r
      s.im[o + m1 * MODES + m2]! += i
    }
  }
}

// the piece, in place on the state in beat 2's frame (after beat 1's stream, before beat 2's pieces). The channel's
// source must be S and its target D (the S -> D join); v the unit on the bonding states (mode 'join') or on the source
// channel alone (mode 'control')
export function joinApply(
  t: Torus,
  s: Pair,
  ch: JoinChannel,
  ED: Float64Array,
  v: readonly [number, number],
  mode: JoinMode,
): JoinReading {
  if (ch.source !== 'S' || ch.target !== 'D') {
    throw new Error('register-join: the relative piece is the S -> D join')
  }

  const cs = sourceCoordinates(t, s)
  const cd = targetCoordinates(t, s, ED)
  const dot = (a: readonly number[], c: { re: number[]; im: number[] }): [number, number] => [
    a.reduce((z, x, k) => z + x * c.re[k]!, 0),
    a.reduce((z, x, k) => z + x * c.im[k]!, 0),
  ]
  const xs = ch.A.map(a => dot(a, cs))
  const ys = ch.B.map(b => dot(b, cd))

  let kappaRe = 0
  let kappaIm = 0
  let sourceWeight = 0
  let targetWeight = 0

  xs.forEach((x, k) => {
    const y = ys[k]!

    kappaRe += x[0] * y[0] + x[1] * y[1]
    kappaIm += x[0] * y[1] - x[1] * y[0]
    sourceWeight += x[0] ** 2 + x[1] ** 2
    targetWeight += y[0] ** 2 + y[1] ** 2
  })

  const ar = v[0] - 1
  const ai = v[1]
  const sre = Array<number>(PAIR).fill(0)
  const sim = Array<number>(PAIR).fill(0)
  const tre = Array<number>(PAIR).fill(0)
  const tim = Array<number>(PAIR).fill(0)

  xs.forEach((x, k) => {
    const y = ys[k]!

    if (mode === 'control') {
      // (v - 1) x_k on A_k
      const dr = ar * x[0] - ai * x[1]
      const di = ar * x[1] + ai * x[0]

      ch.A[k]!.forEach((a, i) => {
        sre[i]! += dr * a
        sim[i]! += di * a
      })

      return
    }

    // the bonding coefficient c = (x + y) / sqrt 2; (v - 1) c / sqrt 2 added to both legs
    const cr = (x[0] + y[0]) / 2
    const ci = (x[1] + y[1]) / 2
    const dr = ar * cr - ai * ci
    const di = ar * ci + ai * cr

    ch.A[k]!.forEach((a, i) => {
      sre[i]! += dr * a
      sim[i]! += di * a
    })
    ch.B[k]!.forEach((b, i) => {
      tre[i]! += dr * b
      tim[i]! += di * b
    })
  })

  addSource(t, s, sre, sim)

  if (mode === 'join') {
    addTarget(t, s, ED, tre, tim)
  }

  return { kappaRe, kappaIm, sourceWeight, targetWeight }
}

// ---- readings on the pair ----

export type HalfWeights = { plusPlus: number; mixed: number; minusMinus: number }

// the pair's weight with both holes in half +, one in each, both in half - (J's eigenbasis on each member's register)
export function halfWeights(t: Torus, s: Pair): HalfWeights {
  const O = sectorBasis(volumeRight())

  let pp = 0
  let mx = 0
  let mm = 0

  const br = new Float64Array(PAIR)
  const bi = new Float64Array(PAIR)
  const tr = new Float64Array(PAIR)
  const ti = new Float64Array(PAIR)

  for (let i = 0; i < t.sites.length; i++) {
    for (let d = 0; d < SLOTS; d++) {
      for (let e = 0; e < SLOTS; e++) {
        const o = i * FULL + d * REG * MODES + e * REG

        for (let a = 0; a < REG; a++) {
          for (let b = 0; b < REG; b++) {
            br[a * REG + b] = s.re[o + a * MODES + b]!
            bi[a * REG + b] = s.im[o + a * MODES + b]!
          }
        }

        // O^T M: rows in the eigenbasis
        for (let p = 0; p < REG; p++) {
          for (let b = 0; b < REG; b++) {
            let r = 0
            let m = 0

            for (let a = 0; a < REG; a++) {
              const w = O[p]![a]!

              r += w * br[a * REG + b]!
              m += w * bi[a * REG + b]!
            }

            tr[p * REG + b] = r
            ti[p * REG + b] = m
          }
        }

        for (let p = 0; p < REG; p++) {
          for (let q = 0; q < REG; q++) {
            let r = 0
            let m = 0

            for (let b = 0; b < REG; b++) {
              const w = O[q]![b]!

              r += tr[p * REG + b]! * w
              m += ti[p * REG + b]! * w
            }

            const w2 = r * r + m * m
            const hp = p < 4
            const hq = q < 4

            if (hp && hq) {
              pp += w2
            } else if (!hp && !hq) {
              mm += w2
            } else {
              mx += w2
            }
          }
        }
      }
    }
  }

  return { plusPlus: pp, mixed: mx, minusMinus: mm }
}

// a pair at contact with sector coordinates C (8 x 8, antisymmetric): psi(0) = E C E^T
export function contactPair(t: Torus, E: Float64Array, C: readonly number[]): Pair {
  const s: Pair = {
    re: new Float64Array(t.sites.length * FULL),
    im: new Float64Array(t.sites.length * FULL),
  }
  const o = t.origin * FULL

  for (let m1 = 0; m1 < MODES; m1++) {
    for (let m2 = 0; m2 < MODES; m2++) {
      let v = 0

      for (let a = 0; a < REG; a++) {
        const w = E[m1 * REG + a]!

        if (w === 0) {
          continue
        }

        for (let b = 0; b < REG; b++) {
          v += w * C[a * REG + b]! * E[m2 * REG + b]!
        }
      }

      s.re[o + m1 * MODES + m2] = v
    }
  }

  return s
}

// (P_sign (x) P_sign) on every member's register: keep one half's pairs, then normalize
export function projectHalves(t: Torus, s: Pair, sign: 1 | -1): Pair {
  const J = volumeRight()
  const P = eyeM().map((r, i) => r.map((x, j) => (x + sign * J[i]![j]!) / 2))
  const out: Pair = {
    re: new Float64Array(s.re.length),
    im: new Float64Array(s.im.length),
  }

  for (let i = 0; i < t.sites.length; i++) {
    for (let d = 0; d < SLOTS; d++) {
      for (let e = 0; e < SLOTS; e++) {
        const o = i * FULL + d * REG * MODES + e * REG

        for (let a = 0; a < REG; a++) {
          for (let b = 0; b < REG; b++) {
            let r = 0
            let m = 0

            for (let c = 0; c < REG; c++) {
              const pa = P[a]![c]!

              if (pa === 0) {
                continue
              }

              for (let f = 0; f < REG; f++) {
                const w = pa * P[b]![f]!

                r += w * s.re[o + c * MODES + f]!
                m += w * s.im[o + c * MODES + f]!
              }
            }

            out.re[o + a * MODES + b] = r
            out.im[o + a * MODES + b] = m
          }
        }
      }
    }
  }

  let n = 0

  for (let k = 0; k < out.re.length; k++) {
    n += out.re[k]! ** 2 + out.im[k]! ** 2
  }

  n = Math.sqrt(n)

  for (let k = 0; k < out.re.length; k++) {
    out.re[k]! /= n
    out.im[k]! /= n
  }

  return out
}

export { PAIR }
