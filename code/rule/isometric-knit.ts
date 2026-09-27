// The isometric knit: a dock collision that is a coin map chosen by the dock's own momentum, W(F4)-covariantly
// (E-RLT-0061 to E-RLT-0063).
//
// THE RULE. A dock's occupation momentum is P = sum_d |s_d| r_d (a love and a fear count alike), and its twelve
// line momenta are n_l = |s_first| - |s_second|, so P = sum_l n_l r_first(l). Let R_P be the F4 roots (the 24
// D4 roots and the 24 short roots) orthogonal to P, and w_P the isometry that is -1 on the span of R_P and +1
// on its orthogonal complement. When w_P permutes the 24 D4 roots (it lies in W(F4)), the dock applies it to
// itself: the vibe in slot d is copied to slot w_P(d). Otherwise the dock is left as it is. P = 0 gives w = -1
// (every vibe to the opposite slot), a P on one mirror gives that mirror's reflection, a P on no mirror gives
// nothing.
//
// WHY IT IS WHAT IT IS. (1) It is a coin map, so it keeps the love count and the fear count: charge and count
// are exact. (2) w_P fixes P (P lies in the +1 space), so momentum is exact, and the dock after the collision
// has the same P, so the same w_P applies again and the rule is an involution: exactly reversible. (3) For g
// in W(F4), R_(gP) = g R_P, so w_(gP) = g w_P g^-1: the collision commutes with every one of the 1,152 coin
// maps, the full symmetry of the dock. (4) A coin map commutes with charge conjugation (negating every vibe),
// and C = C^-1, so C_c C C_c = C^-1: CPT at the identity coin map, exactly. By Steinberg's theorem the
// stabilizer of P in W(F4) is the Weyl group of R_P, so w_P is in W(F4) exactly when that Weyl group holds -1
// on its span (types A1, B2, B3, C3, F4 and products, not A2 or A3). This is the four-dimensional face-centered
// hypercubic lattice gas's isometric collision (Henon 1987, Complex Systems 1, 475; Frisch et al. 1987, Complex
// Systems 1, 649), made deterministic by taking the one covariant element of each stabilizer.
//
// THE VARIANTS.
// - colorExact: w_P is applied only when it keeps all twelve line momenta (n_(w l) = +-n_l with the side
//   signs), so the side sum D = sum_l n_l is kept and local color is exact (code/measure/color-isotropy-bound).
//   The condition is a function of n, covariant, and kept by the collision, so the variant is still an
//   involution, W(F4)-covariant and CPT.
// - firstMirror (the CONTROL): the reflection in the first F4 root (in rootsF4 order) orthogonal to P, or
//   nothing. Same conservation, involution and CPT, but the choice follows the index order, so it is not
//   covariant.
// - binaryTetrahedral: covariant under the 24 Hurwitz units acting by left quaternion multiplication (2T),
//   the least subgroup of W(F4) that forces the husk scalars through k^4 (E-RLT-0063), and under no more than
//   its construction gives: -1 at P = 0, and on every other (free) 2T orbit of momenta the first-mirror
//   reflection of the orbit's least-key member, carried to the others by 2T.
//
// Every variant is a function of the line momenta n alone (P is), so its exact linearization at the uniform
// background is a sum over the 3^12 line-momentum vectors (code/measure/line-momentum-linearization).
//
// NOTHING MOVES: the collision copies the vibe of slot d into slot w(d) of the same dock; the stream then
// copies it one dock along. No link holds anything.

import { type Collision } from '@/code/rule/collision'
import { rootsD4, rootsF4 } from '@/code/algebra/group/root-system'

const ROOTS = rootsD4()
const F4 = rootsF4()

// the opposite slot of each slot (the root -r_d)
export const OPPOSITE: readonly number[] = ROOTS.map(r => ROOTS.findIndex(o => o.every((x, k) => x === -(r[k] ?? 0))))

// the first slot of each of the twelve lines (d < opposite d), the line of each slot, and each slot's side
// sign (+1 first, -1 second)
export const LINE_FIRSTS: readonly number[] = ROOTS.map((_, d) => d).filter(d => d < (OPPOSITE[d] ?? d))
export const LINE_OF: readonly number[] = ROOTS.map((_, d) => LINE_FIRSTS.indexOf(Math.min(d, OPPOSITE[d] ?? d)))
export const SIDE: readonly number[] = ROOTS.map((_, d) => (d < (OPPOSITE[d] ?? d) ? 1 : -1))

// the occupation momentum of a dock is a D4 vector with every entry in [-6, 6] (six roots carry +1 on an axis)
const SPAN = 13
const OFFSET = 6

export function momentumKey(p: readonly number[]): number {
  return (p[0] ?? 0) + OFFSET + SPAN * ((p[1] ?? 0) + OFFSET + SPAN * ((p[2] ?? 0) + OFFSET + SPAN * ((p[3] ?? 0) + OFFSET)))
}

// the permutation of the 24 slots a 4 x 4 matrix (rows) induces, or undefined when some root is not sent to
// a root
export function slotPermutationOf(matrix: readonly (readonly number[])[]): Int32Array | undefined {
  const out = new Int32Array(24)

  for (let d = 0; d < 24; d++) {
    const r = ROOTS[d] ?? []
    const image = matrix.map(row => row.reduce((s, x, k) => s + x * (r[k] ?? 0), 0))
    const e = ROOTS.findIndex(o => o.every((x, k) => Math.abs(x - (image[k] ?? 0)) < 1e-9))

    if (e < 0) {
      return undefined
    }

    out[d] = e
  }

  return out
}

// the isometry that is -1 on the span of the F4 roots orthogonal to p and +1 on its complement, as a slot
// permutation, or undefined when it is the identity (no root is orthogonal to p) or not a coin map
export function stabilizerInvolution(p: readonly number[]): Int32Array | undefined {
  const orthogonal = F4.filter(root => root.reduce((s, x, k) => s + x * (p[k] ?? 0), 0) === 0)
  const basis: number[][] = []

  for (const root of orthogonal) {
    const w = [...root]

    for (const b of basis) {
      const s = w.reduce((acc, x, k) => acc + x * (b[k] ?? 0), 0)

      for (let k = 0; k < 4; k++) w[k] = (w[k] ?? 0) - s * (b[k] ?? 0)
    }

    const norm = Math.hypot(...w)

    if (norm > 1e-9) basis.push(w.map(x => x / norm))
  }

  if (basis.length === 0) {
    return undefined
  }

  // w = I - 2 (projection onto the span)
  const matrix = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1 : 0) - 2 * basis.reduce((s, b) => s + (b[i] ?? 0) * (b[j] ?? 0), 0)))

  return slotPermutationOf(matrix)
}

// the reflection in the first F4 root (rootsF4 order) orthogonal to p, or undefined when none is
export function firstMirrorReflection(p: readonly number[]): Int32Array | undefined {
  const root = F4.find(r => r.reduce((s, x, k) => s + x * (p[k] ?? 0), 0) === 0)

  if (!root) {
    return undefined
  }

  const norm = root.reduce((s, x) => s + x * x, 0)
  const matrix = [0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => (i === j ? 1 : 0) - (2 * (root[i] ?? 0) * (root[j] ?? 0)) / norm))

  return slotPermutationOf(matrix)
}

// a momentum table: the slot permutation for every momentum key (undefined where the dock is left alone)
export type MomentumTable = readonly (Int32Array | undefined)[]

function tableOf(choose: (p: readonly number[]) => Int32Array | undefined): MomentumTable {
  const out: (Int32Array | undefined)[] = new Array(SPAN ** 4).fill(undefined)

  for (let key = 0; key < SPAN ** 4; key++) {
    const p = [0, 1, 2, 3].map(k => (Math.floor(key / SPAN ** k) % SPAN) - OFFSET)

    // only D4 vectors (even sum) occur
    if ((p[0]! + p[1]! + p[2]! + p[3]!) % 2 !== 0) continue

    out[key] = choose(p)
  }

  return out
}

// Left multiplication by the 24 Hurwitz units (the binary tetrahedral group 2T), reading a dock vector
// (x1, x2, x3, x4) as the quaternion x1 + x2 i + x3 j + x4 k. It permutes the 24 D4 roots and acts freely
// on every nonzero vector: the least group that forces the husk scalars through k^4 (E-RLT-0063).
export function binaryTetrahedralMatrices(): number[][][] {
  const units: number[][] = []

  for (let axis = 0; axis < 4; axis++) {
    for (const s of [1, -1]) {
      const u = [0, 0, 0, 0]

      u[axis] = s
      units.push(u)
    }
  }

  for (let code = 0; code < 16; code++) units.push([0, 1, 2, 3].map(k => (code & (1 << k) ? -0.5 : 0.5)))

  return units.map(([a = 0, b = 0, c = 0, d = 0]) => [
    [a, -b, -c, -d],
    [b, a, -d, c],
    [c, d, a, -b],
    [d, -c, b, a],
  ])
}

const applyMatrix = (m: readonly (readonly number[])[], v: readonly number[]): number[] => m.map(row => Math.round(row.reduce((s, x, k) => s + x * (v[k] ?? 0), 0)))

// The 2T-covariant knit's table: P = 0 gives -1 (central, so covariant); every other momentum's 2T orbit is
// free (24 momenta), its least key is the representative, the representative gets the first-mirror
// reflection, and every other member h P gets h w h^-1. Covariant under 2T by construction and under no more
// than the first-mirror choice allows. Only momenta a dock can hold are filled (the rest stay undefined).
function binaryTetrahedralTable(): MomentumTable {
  const group = binaryTetrahedralMatrices()
  const slots = group.map(m => slotPermutationOf(m) ?? new Int32Array(24))
  const out: (Int32Array | undefined)[] = new Array(SPAN ** 4).fill(undefined)
  const done = new Set<number>()

  for (let key = 0; key < SPAN ** 4; key++) {
    const p = [0, 1, 2, 3].map(k => (Math.floor(key / SPAN ** k) % SPAN) - OFFSET)

    if ((p[0]! + p[1]! + p[2]! + p[3]!) % 2 !== 0 || done.has(key)) continue

    if (p.every(x => x === 0)) {
      out[key] = Int32Array.from(OPPOSITE)
      done.add(key)
      continue
    }

    const orbit = group.map(m => applyMatrix(m, p))

    // an orbit leaving the momentum box holds no reachable momentum with an image outside; keep it whole
    if (orbit.some(q => q.some(x => Math.abs(x) > OFFSET))) {
      done.add(key)
      continue
    }

    const keys = orbit.map(momentumKey)
    const least = Math.min(...keys)
    const r = keys.indexOf(least)
    const representative = orbit[r] ?? p
    const w = firstMirrorReflection(representative)
    // h_r maps p to the representative; the member h_i p = h_i h_r^-1 representative
    const back = slots[r] ?? new Int32Array(24)
    const backInverse = new Int32Array(24)

    back.forEach((image, d) => {
      backInverse[image] = d
    })

    orbit.forEach((_, i) => {
      done.add(keys[i] ?? 0)

      if (!w) return

      const h = slots[i] ?? new Int32Array(24)
      // g = h_i h_r^-1 carries the representative to member i: g w g^-1 at slot e is g(w(g^-1 e))
      const g = new Int32Array(24)
      const gInverse = new Int32Array(24)

      for (let d = 0; d < 24; d++) g[d] = h[backInverse[d] ?? 0] ?? 0
      for (let d = 0; d < 24; d++) gInverse[g[d] ?? 0] = d

      const image = new Int32Array(24)

      for (let e = 0; e < 24; e++) image[e] = g[w[gInverse[e] ?? 0] ?? 0] ?? 0

      out[keys[i] ?? 0] = image
    })
  }

  return out
}

let ISOMETRIC: MomentumTable | undefined
let FIRST_MIRROR: MomentumTable | undefined
let BINARY_TETRAHEDRAL: MomentumTable | undefined

export function binaryTetrahedralKnitTable(): MomentumTable {
  BINARY_TETRAHEDRAL = BINARY_TETRAHEDRAL ?? binaryTetrahedralTable()

  return BINARY_TETRAHEDRAL
}

export function isometricTable(): MomentumTable {
  ISOMETRIC = ISOMETRIC ?? tableOf(stabilizerInvolution)

  return ISOMETRIC
}

export function firstMirrorTable(): MomentumTable {
  FIRST_MIRROR = FIRST_MIRROR ?? tableOf(firstMirrorReflection)

  return FIRST_MIRROR
}

// A line-momentum rule: the slot permutation a dock applies, as a function of its twelve line momenta (n_l in
// {-1, 0, 1}, line order LINE_FIRSTS), or undefined for none. `p` is the dock's momentum, passed so the rule
// need not recompute it.
export type LineMomentumRule = (n: Int8Array, p: readonly number[]) => Int32Array | undefined

// whether a slot permutation keeps every line momentum: n_(line of w(first l)) = side(w(first l)) n_l
export function keepsLineMomenta(w: Int32Array, n: Int8Array): boolean {
  for (let l = 0; l < 12; l++) {
    const image = w[LINE_FIRSTS[l] ?? 0] ?? 0

    if ((n[LINE_OF[image] ?? 0] ?? 0) !== (SIDE[image] ?? 1) * (n[l] ?? 0)) {
      return false
    }
  }

  return true
}

export type IsometricVariant = 'isometric' | 'color-exact' | 'first-mirror' | 'binary-tetrahedral'

export function lineMomentumRule(variant: IsometricVariant): LineMomentumRule {
  const table = variant === 'first-mirror' ? firstMirrorTable() : variant === 'binary-tetrahedral' ? binaryTetrahedralKnitTable() : isometricTable()

  if (variant === 'color-exact') {
    return (n, p) => {
      const w = table[momentumKey(p)]

      return w && keepsLineMomenta(w, n) ? w : undefined
    }
  }

  return (_, p) => table[momentumKey(p)]
}

// a rule conjugated by a coin map g (g C g^-1): the image dock reads back its line momenta through g
export function conjugateRule(rule: LineMomentumRule, g: readonly number[]): LineMomentumRule {
  const inverse = new Int32Array(24)

  g.forEach((image, d) => {
    inverse[image] = d
  })

  // the linear map of g^-1 on momenta, through the roots: g^-1 r_e = r_(inverse e)
  const back = new Int8Array(12)

  return (n, p) => {
    // n'_l for the preimage dock: slot d of the preimage holds what slot g(d) holds here
    for (let l = 0; l < 12; l++) {
      const image = g[LINE_FIRSTS[l] ?? 0] ?? 0

      back[l] = (SIDE[image] ?? 1) * (n[LINE_OF[image] ?? 0] ?? 0)
    }

    const q = [0, 0, 0, 0]

    for (let l = 0; l < 12; l++) {
      const r = ROOTS[LINE_FIRSTS[l] ?? 0] ?? []

      for (let k = 0; k < 4; k++) q[k] = (q[k] ?? 0) + (back[l] ?? 0) * (r[k] ?? 0)
    }

    void p

    const w = rule(back, q)

    if (!w) {
      return undefined
    }

    // g w g^-1
    const out = new Int32Array(24)

    for (let e = 0; e < 24; e++) {
      out[e] = g[w[inverse[e] ?? 0] ?? 0] ?? 0
    }

    return out
  }
}

// the dock collision of a line-momentum rule: read n and P off the occupation, copy slot d to slot w(d)
export function lineMomentumCollision(rule: LineMomentumRule): Collision {
  const n = new Int8Array(12)
  const p = [0, 0, 0, 0]
  const scratch = new Int8Array(24)

  return (slots, base) => {
    p[0] = 0
    p[1] = 0
    p[2] = 0
    p[3] = 0

    for (let l = 0; l < 12; l++) {
      const first = LINE_FIRSTS[l] ?? 0
      const value = (slots[base + first] !== 0 ? 1 : 0) - (slots[base + (OPPOSITE[first] ?? 0)] !== 0 ? 1 : 0)
      const r = ROOTS[first] ?? []

      n[l] = value

      if (value !== 0) {
        p[0] += value * (r[0] ?? 0)
        p[1] += value * (r[1] ?? 0)
        p[2] += value * (r[2] ?? 0)
        p[3] += value * (r[3] ?? 0)
      }
    }

    const w = rule(n, p)

    if (!w) {
      return
    }

    for (let d = 0; d < 24; d++) scratch[w[d] ?? 0] = slots[base + d] ?? 0
    for (let d = 0; d < 24; d++) slots[base + d] = scratch[d] ?? 0
  }
}

// the knit as a scheduled rule (the battery's factory shape): period one, its own inverse
export function isometricKnit(variant: IsometricVariant): (t: number) => Collision {
  const collision = lineMomentumCollision(lineMomentumRule(variant))

  return () => collision
}
