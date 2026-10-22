// DOES THE LINK HOLONOMY CAGE A MEMBER CARRIED AS A ROLE TRIPLET? (E-SPN-0196, moving-matter item 0019, Key 4 of
// idea/keys.md, one-body half). The register member of E-SPN-0160 (192 modes a dock: 24 slots x the 8-mode register)
// carried with a role factor C^k. k = 1 is the trivial carriage (the links ignored); k = 3 is the triplet carriage, where
// the slot crossing link (x, d) turns the role by the link's grid move lifted to Sigma(648) in SU(3), the defining
// representation (E-FRC-0278: the 648 elements' conjugation of the 9 phase points is exactly the package's 216 grid moves).
//
//   sigmaElements   Sigma(648) exactly, in Q(zeta_9), by closure of the four published generators (rebuilt here exactly,
//                   the float ones in code/algebra/group/su3-subgroups are the instrument's check)
//   gridLifts       for each of the 216 grid moves (code/rule/vibe-weave gridMoves) its three lifts {U, omega U, omega^2 U},
//                   read off the conjugation of the phase points A(a, b) = D P D^dag, never typed
//   roleLinks       a section over the weave's link field: a link (x, d) met first gets lift[section(slot)] of its move,
//                   its reverse the exact inverse of that matrix (so a link and its reverse stay inverse as matrices).
//                   Sigma(648) is a non-split central extension, so no section is a homomorphism: which centre element a
//                   link carries is a choice the rule's ASL(2, 3) links do not make, and a second section is read
//   cagingCycle     the one-member cycle U = V (1 + (conj u - 1) Q_D) V (1 + (u - 1) Q_S) of register-link-field
//                   memberCycle, with the stream turning the role: slot d of dock x + r_d takes (1_reg x R(x, d)) times
//                   slot -d of dock x. The register's own 2T field is the identity; the sectors act on the register only
//   restPacket      a rest-band packet of the lightest branch: the slot-uniform register state (range Q_S, where at K = 0
//                   C(0) = c0 sum_d gamma(r_d) = 0 and the cycle is the scalar u, the rest level E = M) times a Gaussian
//                   envelope over docks, times one role basis vector
//   spreadTrack     the probability over docks per beat, its rms distance from the start dock (minimum image on the side
//                   box, Z^4 units, a root has length sqrt 2) and the return probability |<psi_0|psi_t>|^2
//
// EXACT: the group, the lifts, det and unitarity, the delta and epsilon invariants (Q(zeta_9); NOT Z[omega, 1/sqrt(-3)],
// because the SU(3) section of the Hessian group needs the ninth roots of NINTH = diag(e, e, e omega), e = zeta_9^2).
// FLOAT: the run (the exact lifts as floats, checked to 1e-12). DETERMINISM: no random numbers; the links are the weave's
// own integer Weyl start, the section an integer Weyl stream. NOTHING MOVES: a link holds a grid move; a member's role is
// turned by the link its slot crosses.

import { partnerBasis } from '@/code/measure/register-meson'
import { OPPOSITE } from '@/code/rule/isometric-knit'
import { gridMoves, linkStart } from '@/code/rule/vibe-weave'
import { type ColorWeave } from '@/code/rule/color-weave'
import { d4BoxCoordinates, d4Vector } from '@/code/substrate/d4-box-integer'
import {
  add,
  cappedClosure,
  dagger,
  det3,
  equals,
  identityMatrix,
  isUnitary,
  matMul,
  matrixKey,
  MINUS_I_OVER_ROOT3,
  mul,
  neg,
  ONE,
  scaleMatrix,
  toComplex,
  ZERO,
  zetaPower,
  type Ninth,
  type NinthMatrix,
} from '@/code/algebra/ninth-field'

const SLOTS = 24
const REG = 8
const MODES = SLOTS * REG

// ---- Sigma(648), exactly ----

const omegaPower = (k: number): Ninth => zetaPower(3 * k)
const diag = (d: readonly Ninth[]): Ninth[][] =>
  d.map((x, i) => d.map((_, j) => (i === j ? x : ZERO)))

export const CLOCK_EXACT = diag([ONE, omegaPower(1), omegaPower(2)])
export const SHIFT_EXACT: Ninth[][] = [
  [ZERO, ONE, ZERO],
  [ZERO, ZERO, ONE],
  [ONE, ZERO, ZERO],
]
export const FOURIER_EXACT: Ninth[][] = [0, 1, 2].map(j =>
  [0, 1, 2].map(k => mul(omegaPower(j * k), MINUS_I_OVER_ROOT3)),
)
export const NINTH_EXACT = diag([zetaPower(2), zetaPower(2), zetaPower(5)])
export const SIGMA_GENERATORS_EXACT = [
  CLOCK_EXACT,
  SHIFT_EXACT,
  FOURIER_EXACT,
  NINTH_EXACT,
]

export function sigmaElements(): { elements: Ninth[][][]; closed: boolean } {
  const c = cappedClosure(SIGMA_GENERATORS_EXACT, 3240)

  return { elements: c.elements as Ninth[][][], closed: c.closed }
}

// the phase points A(a, b) = D(a, b) P D(a, b)^dag, D(a, b) = omega^(2 a b) X^a Z^b (E-FRC-0278)
function phasePoints(): Ninth[][][] {
  const X: Ninth[][] = [0, 1, 2].map(r =>
    [0, 1, 2].map(c => ((c + 1) % 3 === r ? ONE : ZERO)),
  )
  const Z = diag([ONE, omegaPower(1), omegaPower(2)])
  const P: Ninth[][] = [0, 1, 2].map(r =>
    [0, 1, 2].map(c => ((3 - c) % 3 === r ? ONE : ZERO)),
  )
  const power = (m: NinthMatrix, k: number): Ninth[][] =>
    Array.from({ length: k }).reduce<Ninth[][]>(
      acc => matMul(m, acc),
      identityMatrix(3),
    )

  return Array.from({ length: 9 }, (_, q) => {
    const a = Math.floor(q / 3)
    const b = q % 3
    const D = scaleMatrix(
      matMul(power(X, a), power(Z, b)),
      omegaPower(2 * a * b),
    )

    return matMul(matMul(D, P), dagger(D))
  })
}

export type GridLifts = {
  elements: Ninth[][][]
  // lifts[m]: the indices (into elements) of grid move m's three lifts, in matrixKey order
  lifts: number[][]
  // inverse[e]: the index of elements[e]^-1
  inverse: Int32Array
  // the elements as floats, 18 numbers each (re, im interleaved, row major)
  floats: Float64Array[]
  // every element permutes the phase points, and the maps are exactly the 216 grid moves, three lifts each
  liftsRead: boolean
}

export function gridLifts(): GridLifts {
  const { elements } = sigmaElements()
  const points = phasePoints()
  const pointKeys = points.map(matrixKey)
  const gridOfPhase = (q: number): number => Math.floor(q / 3) + 3 * (q % 3)
  const moves = gridMoves().act.map(t => Array.from(t).join(','))
  const lifts: number[][] = moves.map(() => [])
  const keys = elements.map(matrixKey)
  const index = new Map(keys.map((k, i) => [k, i]))

  let liftsRead = true

  elements.forEach((g, e) => {
    const gd = dagger(g)
    const image = points.map(A =>
      pointKeys.indexOf(matrixKey(matMul(matMul(g, A), gd))),
    )

    if (image.some(x => x < 0)) {
      liftsRead = false

      return
    }

    const table = Array<number>(9).fill(0)

    image.forEach((to, q) => {
      table[gridOfPhase(q)] = gridOfPhase(to)
    })

    const m = moves.indexOf(table.join(','))

    if (m < 0) {
      liftsRead = false

      return
    }

    lifts[m]!.push(e)
  })

  for (const l of lifts) {
    l.sort((a, b) => (keys[a]! < keys[b]! ? -1 : keys[a]! > keys[b]! ? 1 : 0))
  }

  liftsRead =
    liftsRead && moves.length === 216 && lifts.every(l => l.length === 3)

  const inverse = Int32Array.from(
    elements.map(g => index.get(matrixKey(dagger(g))) ?? -1),
  )
  const floats = elements.map(g => {
    const out = new Float64Array(18)

    g.forEach((row, i) =>
      row.forEach((x, j) => {
        const [re, im] = toComplex(x)

        out[2 * (3 * i + j)] = re
        out[2 * (3 * i + j) + 1] = im
      }),
    )

    return out
  })

  return { elements, lifts, inverse, floats, liftsRead }
}

// the algebra of Key 4, exactly over every element: unitary, det 1 (so U x U x U eps = det U eps = eps), and
// (U x conj U) delta = U U^T-contracted = delta, delta = sum_i |i i> (so the member-antimember singlet is invariant)
export function singletInvariance(elements: readonly NinthMatrix[]): {
  unitary: number
  detOne: number
  delta: number
  epsilon: number
} {
  let unitary = 0
  let detOne = 0
  let delta = 0
  let epsilon = 0

  for (const U of elements) {
    if (isUnitary(U)) {
      unitary++
    }

    if (equals(det3(U), ONE)) {
      detOne++
    }

    // (U x conj U) delta has components sum_k U[i][k] conj(U[j][k]) = (U U^dag)[i][j]
    const uud = matMul(U, dagger(U))

    if (uud.every((row, i) => row.every((x, j) => equals(x, i === j ? ONE : ZERO)))) {
      delta++
    }

    // (U x U x U) eps at (i, j, l) = sum_{abc} eps_abc U_ia U_jb U_lc, which is eps_ijl det U
    let ok = true

    for (let i = 0; i < 3 && ok; i++) {
      for (let j = 0; j < 3 && ok; j++) {
        for (let l = 0; l < 3 && ok; l++) {
          let s = ZERO

          for (const [a, b, c, sign] of EPS) {
            const t = mul(mul(U[i]![a]!, U[j]![b]!), U[l]![c]!)

            s = add(s, sign > 0 ? t : mul(t, NEG_ONE))
          }

          ok = equals(s, epsAt(i, j, l))
        }
      }
    }

    if (ok) {
      epsilon++
    }
  }

  return { unitary, detOne, delta, epsilon }
}

const NEG_ONE: Ninth = neg(ONE)
const EPS: readonly (readonly [number, number, number, number])[] = [
  [0, 1, 2, 1],
  [1, 2, 0, 1],
  [2, 0, 1, 1],
  [0, 2, 1, -1],
  [2, 1, 0, -1],
  [1, 0, 2, -1],
]
const epsAt = (i: number, j: number, l: number): Ninth => {
  const hit = EPS.find(([a, b, c]) => a === i && b === j && c === l)

  return hit === undefined ? ZERO : hit[3] > 0 ? ONE : NEG_ONE
}

// ---- the role links over the weave ----

export type RoleLinks = {
  k: number
  // mats[i]: k x k complex, 2 k^2 numbers, re, im interleaved, row major
  mats: Float64Array[]
  // link[x * 24 + d]: the matrix carried from dock x to dock x + r_d
  link: Int32Array
}

export const trivialRole = (cells: number): RoleLinks => ({
  k: 1,
  mats: [Float64Array.from([1, 0])],
  link: new Int32Array(cells * SLOTS),
})

// section: for a link slot, which of its move's three lifts (0, 1 or 2); 'first' always 0, 'weyl' an integer Weyl stream
export type Section = 'first' | 'weyl'

export function roleLinks(
  weave: ColorWeave,
  moveLinks: Int16Array,
  L: GridLifts,
  section: Section,
): RoleLinks & { reverseExact: boolean } {
  const cells = weave.mesh.cellCount
  const link = new Int32Array(cells * SLOTS).fill(-1)

  let reverseExact = true

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const i = x * SLOTS + d

      if (link[i]! >= 0) {
        continue
      }

      const y = weave.mesh.neighbour(x, d)
      const back = y * SLOTS + weave.opposite[d]!
      const m = moveLinks[i]!
      const pick = section === 'first' ? 0 : linkStart(i, 3, 1)
      const e = L.lifts[m]![pick]!

      link[i] = e
      link[back] = L.inverse[e]!

      // the reverse move must be the inverse grid move, and its lift the inverse matrix's move
      if (!L.lifts[moveLinks[back]!]!.includes(L.inverse[e]!)) {
        reverseExact = false
      }
    }
  }

  return { k: 3, mats: L.floats, link, reverseExact }
}

export const flatRole = (cells: number, L: GridLifts): RoleLinks => {
  const id = L.elements.findIndex(g =>
    g.every((row, i) => row.every((x, j) => equals(x, i === j ? ONE : ZERO))),
  )

  return { k: 3, mats: L.floats, link: new Int32Array(cells * SLOTS).fill(id) }
}

// ---- the cycle ----

export type CagingState = { re: Float64Array; im: Float64Array }

export type CagingEngine = {
  cells: number
  nb: Int32Array
  role: RoleLinks
  u: readonly [number, number]
  ed: Float64Array
}

export function cagingEngine(
  weave: ColorWeave,
  role: RoleLinks,
  u: readonly [number, number],
): CagingEngine {
  const cells = weave.mesh.cellCount
  const nb = new Int32Array(cells * SLOTS)

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      nb[x * SLOTS + d] = weave.mesh.neighbour(x, d)
    }
  }

  return { cells, nb, role, u, ed: partnerBasis() }
}

// index of (dock x, slot d, register a, role c)
const at = (k: number, x: number, d: number, a: number, c: number): number =>
  ((x * SLOTS + d) * REG + a) * k + c

// psi <- (1 + (w - 1) Q) psi, Q = Q_S (the slot average) or Q_D (partnerBasis), on the register, every role component
function sector(
  E: CagingEngine,
  s: CagingState,
  w: readonly [number, number],
  which: 'S' | 'D',
): void {
  const k = E.role.k
  const ar = w[0] - 1
  const ai = w[1]
  const cr = new Float64Array(REG)
  const ci = new Float64Array(REG)

  for (let x = 0; x < E.cells; x++) {
    for (let c = 0; c < k; c++) {
      cr.fill(0)
      ci.fill(0)

      if (which === 'S') {
        for (let d = 0; d < SLOTS; d++) {
          for (let a = 0; a < REG; a++) {
            const i = at(k, x, d, a, c)

            cr[a]! += s.re[i]! / SLOTS
            ci[a]! += s.im[i]! / SLOTS
          }
        }

        for (let d = 0; d < SLOTS; d++) {
          for (let a = 0; a < REG; a++) {
            const i = at(k, x, d, a, c)

            s.re[i]! += ar * cr[a]! - ai * ci[a]!
            s.im[i]! += ar * ci[a]! + ai * cr[a]!
          }
        }

        continue
      }

      for (let m = 0; m < MODES; m++) {
        const i = (x * MODES + m) * k + c
        const vr = s.re[i]!
        const vi = s.im[i]!

        if (vr === 0 && vi === 0) {
          continue
        }

        for (let e = 0; e < REG; e++) {
          const v = E.ed[m * REG + e]!

          cr[e]! += v * vr
          ci[e]! += v * vi
        }
      }

      for (let m = 0; m < MODES; m++) {
        let pr = 0
        let pi = 0

        for (let e = 0; e < REG; e++) {
          const v = E.ed[m * REG + e]!

          pr += v * cr[e]!
          pi += v * ci[e]!
        }

        const i = (x * MODES + m) * k + c

        s.re[i]! += ar * pr - ai * pi
        s.im[i]! += ar * pi + ai * pr
      }
    }
  }
}

// V: slot d of dock x + r_d takes (1_reg x R(x, d)) times slot -d of dock x
function stream(E: CagingEngine, s: CagingState): CagingState {
  const k = E.role.k
  const out: CagingState = {
    re: new Float64Array(s.re.length),
    im: new Float64Array(s.im.length),
  }

  for (let x = 0; x < E.cells; x++) {
    for (let d = 0; d < SLOTS; d++) {
      const to = E.nb[x * SLOTS + d]!
      const R = E.role.mats[E.role.link[x * SLOTS + d]!]!
      const src = at(k, x, OPPOSITE[d]!, 0, 0)
      const dst = at(k, to, d, 0, 0)

      for (let a = 0; a < REG; a++) {
        const o = a * k

        for (let i = 0; i < k; i++) {
          let r = 0
          let m = 0

          for (let j = 0; j < k; j++) {
            const gr = R[2 * (k * i + j)]!
            const gi = R[2 * (k * i + j) + 1]!
            const vr = s.re[src + o + j]!
            const vi = s.im[src + o + j]!

            r += gr * vr - gi * vi
            m += gr * vi + gi * vr
          }

          out.re[dst + o + i] = r
          out.im[dst + o + i] = m
        }
      }
    }
  }

  return out
}

// one beat: beat 1 is Q_S's phase u then the stream, beat 2 Q_D's conj u then the stream (memberCycle's two halves).
// The input is CONSUMED (the sector acts in place, to hold two states at side 16); clone a state that must be kept
export function cagingBeat(
  E: CagingEngine,
  s: CagingState,
  beat: number,
): CagingState {
  if (beat % 2 === 0) {
    sector(E, s, E.u, 'S')
  } else {
    sector(E, s, [E.u[0], -E.u[1]], 'D')
  }

  return stream(E, s)
}

export const cloneState = (s: CagingState): CagingState => ({
  re: Float64Array.from(s.re),
  im: Float64Array.from(s.im),
})

// ---- the packet and the reads ----

// squared distance (Z^4 units) of every box offset from the origin, minimum image over the side box
export function offsetDistances(side: number): Float64Array {
  const cells = side ** 4
  const out = new Float64Array(cells)
  const half = side / 2

  for (let o = 0; o < cells; o++) {
    const c = d4BoxCoordinates({ cell: o, side }).map(v => (v >= half ? v - side : v))

    let best = Infinity

    for (let s = 0; s < 81; s++) {
      const shift = [0, 1, 2, 3].map(q => (Math.floor(s / 3 ** q) % 3) - 1)
      const v = d4Vector(c.map((x, q) => x + side * shift[q]!))

      best = Math.min(best, v.reduce((t, y) => t + y * y, 0))
    }

    out[o] = best
  }

  return out
}

// the offset index of dock x from dock x0
export function offsetOf(side: number, x: number, x0: number): number {
  const a = d4BoxCoordinates({ cell: x, side })
  const b = d4BoxCoordinates({ cell: x0, side })

  return a.reduce((t, v, q) => t + ((((v - b[q]!) % side) + side) % side) * side ** q, 0)
}

export function restPacket(input: {
  side: number
  k: number
  x0: number
  sigma: number
  register: number
  role: number
  r2: Float64Array
}): CagingState {
  const { side, k, x0, sigma, register, role, r2 } = input
  const cells = side ** 4
  const s: CagingState = {
    re: new Float64Array(cells * MODES * k),
    im: new Float64Array(cells * MODES * k),
  }

  let n = 0

  for (let x = 0; x < cells; x++) {
    const g = Math.exp(-r2[offsetOf(side, x, x0)]! / (4 * sigma * sigma))

    for (let d = 0; d < SLOTS; d++) {
      s.re[at(k, x, d, register, role)] = g
      n += g * g
    }
  }

  n = Math.sqrt(n)

  for (let i = 0; i < s.re.length; i++) {
    s.re[i]! /= n
  }

  return s
}

export type SpreadRead = { rms: number; norm: number; returned: number }

export function spreadRead(input: {
  side: number
  k: number
  x0: number
  r2: Float64Array
  start: CagingState
  s: CagingState
  dockOffset: Int32Array
}): SpreadRead {
  const { k, r2, start, s, dockOffset } = input
  const per = MODES * k
  const cells = s.re.length / per

  let m2 = 0
  let norm = 0
  let ovr = 0
  let ovi = 0

  for (let x = 0; x < cells; x++) {
    let p = 0

    for (let i = x * per; i < (x + 1) * per; i++) {
      const vr = s.re[i]!
      const vi = s.im[i]!

      p += vr * vr + vi * vi

      const ar = start.re[i]!
      const ai = start.im[i]!

      if (ar !== 0 || ai !== 0) {
        ovr += ar * vr + ai * vi
        ovi += ar * vi - ai * vr
      }
    }

    norm += p
    m2 += p * r2[dockOffset[x]!]!
  }

  return { rms: Math.sqrt(m2 / norm), norm, returned: ovr * ovr + ovi * ovi }
}

// the least-squares slope of y on x
export function slope(x: readonly number[], y: readonly number[]): number {
  const n = x.length
  const mx = x.reduce((a, b) => a + b, 0) / n
  const my = y.reduce((a, b) => a + b, 0) / n

  let sxy = 0
  let sxx = 0

  for (let i = 0; i < n; i++) {
    sxy += (x[i]! - mx) * (y[i]! - my)
    sxx += (x[i]! - mx) ** 2
  }

  return sxy / sxx
}

export { SLOTS as CAGING_SLOTS, REG as CAGING_REG, MODES as CAGING_MODES }
