// TWO REGISTER MEMBERS STARTED ON DIFFERENT LINES (E-FND-0158). The adopted knit keeps the tone of every mesh line
// (E-SPN-0098), so two vibes on different lines never share a slot, never exchange, never trade momentum and never
// change one another: every row whose test needs that was blocked (OPEN-FND-03). The register rule's many-body form runs
// two holes of the full sea exactly on the D4 torus (code/measure/register-sea, E-SPN-0175). This module adds the reads
// those rows need on that engine.
//
//   localPair        two holes on one relative dock y0 in two pure (slot, register) modes, antisymmetric, symmetric or
//                    distinguishable (the raw product, member 1 the first index)
//   exchangeParts    the weight of the pair's symmetric and antisymmetric parts, (1 + P12) / 2 and (1 - P12) / 2, with
//                    (P12 psi)(y)[m1][m2] = psi(-y)[m2][m1]
//   relativeWeights  w(q) = sum over (m1, m2) of |M(q)[m1][m2]|^2, the pair's weight at relative momentum q (member 1 at
//                    q, member 2 at -q). A translation-invariant one-body rule keeps each w(q) exactly; only a pair piece
//                    that depends on the separation moves weight between momenta
//   memberLines      the weight of member 1 (or 2) on each of the 12 slot lines, summed over the separation, its register
//                    and the other member
//   sidePiece        a one-member sector piece psi <- psi + alpha Q psi (member 1) or psi + alpha psi Q^T (member 2), Q =
//                    E E^T, for a rule that treats the two members differently (a control)
//
// DETERMINISM: no random numbers. FLOATS are measurement on exact pieces, as in register-sea.

import { LINE_OF } from '@/code/rule/isometric-knit'
import {
  FULL,
  MODES,
  newPair,
  pairAt,
  type Pair,
  type Torus,
} from '@/code/measure/register-sea'

const REG = 8
const NR = 24
const LINES = 12

export type Symmetry = -1 | 0 | 1

// two holes at relative dock y0 (a site index) in modes a and b, normalized. The distinguishable pair is the one entry;
// the (anti)symmetric pair adds -+ its exchange image at -y0 with the modes swapped
export function localPair(
  t: Torus,
  y0: number,
  a: number,
  b: number,
  symmetry: Symmetry,
): Pair {
  const s = newPair(t)
  const k = y0 * FULL + a * MODES + b
  const kk = t.neg[y0]! * FULL + b * MODES + a

  if (symmetry === 0) {
    s.re[k] = 1

    return s
  }

  if (k === kk) {
    throw new Error('register-crossing: an exchange-symmetric start needs two distinct entries')
  }

  s.re[k] = Math.SQRT1_2
  s.re[kk] = symmetry * Math.SQRT1_2

  return s
}

// the weight of (1 + P12) psi / 2 and (1 - P12) psi / 2
export function exchangeParts(
  t: Torus,
  s: Pair,
): { symmetric: number; antisymmetric: number } {
  let sym = 0
  let anti = 0

  for (let i = 0; i < t.sites.length; i++) {
    const n = t.neg[i]!

    for (let x = 0; x < MODES; x++) {
      for (let z = 0; z < MODES; z++) {
        const k = i * FULL + x * MODES + z
        const kk = n * FULL + z * MODES + x
        const pr = s.re[kk]!
        const pi = s.im[kk]!

        sym += ((s.re[k]! + pr) / 2) ** 2 + ((s.im[k]! + pi) / 2) ** 2
        anti += ((s.re[k]! - pr) / 2) ** 2 + ((s.im[k]! - pi) / 2) ** 2
      }
    }
  }

  return { symmetric: sym, antisymmetric: anti }
}

// w(q) for every torus momentum (Parseval: the sum is sites times the pair norm)
export function relativeWeights(t: Torus, s: Pair): Float64Array {
  const w = new Float64Array(t.momenta.length)

  for (let j = 0; j < t.momenta.length; j++) {
    const M = pairAt(t, s, j)

    let n = 0

    for (let k = 0; k < FULL; k++) {
      n += M.re[k]! ** 2 + M.im[k]! ** 2
    }

    w[j] = n
  }

  return w
}

// member 1's (member = 1) or member 2's (member = 2) weight on each of the 12 slot lines
export function memberLines(t: Torus, s: Pair, member: 1 | 2): Float64Array {
  const out = new Float64Array(LINES)

  for (let i = 0; i < t.sites.length; i++) {
    for (let x = 0; x < MODES; x++) {
      for (let z = 0; z < MODES; z++) {
        const k = i * FULL + x * MODES + z
        const w = s.re[k]! ** 2 + s.im[k]! ** 2
        const slot = Math.floor((member === 1 ? x : z) / REG)

        out[LINE_OF[slot]!]! += w
      }
    }
  }

  return out
}

// the weight with both members on one dock in one slot (any registers), and in one (slot, register) mode. An
// antisymmetric pair has no weight in one mode, ever; a distinguishable pair reaches it only if each member reaches the
// other's slot
export function sameSlotWeights(
  t: Torus,
  s: Pair,
): { slot: number; mode: number } {
  const o = t.origin * FULL

  let slot = 0
  let mode = 0

  for (let d = 0; d < NR; d++) {
    for (let a = 0; a < REG; a++) {
      for (let b = 0; b < REG; b++) {
        const k = o + (d * REG + a) * MODES + d * REG + b
        const w = s.re[k]! ** 2 + s.im[k]! ** 2

        slot += w

        if (a === b) {
          mode += w
        }
      }
    }
  }

  return { slot, mode }
}

// the line of a (slot, register) mode
export const lineOfMode = (m: number): number => LINE_OF[Math.floor(m / REG)]!

// a one-member sector piece at relative dock offset off: member 1 takes psi + alpha Q psi, member 2 psi + alpha psi Q^T
export function sidePiece(
  re: Float64Array,
  im: Float64Array,
  off: number,
  E: Float64Array,
  alpha: readonly [number, number],
  member: 1 | 2,
): void {
  const [ar, ai] = alpha
  // the index that Q acts on, and the other one
  const stride = (m: number, other: number): number =>
    member === 1 ? off + m * MODES + other : off + other * MODES + m

  for (let other = 0; other < MODES; other++) {
    // c[eta] = sum_m E[m][eta] psi(m)
    const cr = new Float64Array(REG)
    const ci = new Float64Array(REG)

    for (let m = 0; m < MODES; m++) {
      const k = stride(m, other)
      const xr = re[k]!
      const xi = im[k]!

      if (xr === 0 && xi === 0) {
        continue
      }

      for (let eta = 0; eta < REG; eta++) {
        const e = E[m * REG + eta]!

        cr[eta]! += e * xr
        ci[eta]! += e * xi
      }
    }

    for (let m = 0; m < MODES; m++) {
      let qr = 0
      let qi = 0

      for (let eta = 0; eta < REG; eta++) {
        const e = E[m * REG + eta]!

        qr += e * cr[eta]!
        qi += e * ci[eta]!
      }

      const k = stride(m, other)

      re[k]! += ar * qr - ai * qi
      im[k]! += ar * qi + ai * qr
    }
  }
}

export { LINES, NR }
