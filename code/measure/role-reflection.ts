// THE REFLECTION R AS A RULE STEP (E-QTM-0197, solutions section 5). E-QTM-0134 found that the frame-covariant Clifford
// meetings of three tokens are A (x) 1 with A^T W A = W and A 1 = 1 (W the tokens' signs), and that off a knot they
// include the reflection through the frame direction, R = 2 q^(-1) 1 w^T - 1 (q the charge mod 3), whose unitary lift
// commutes with every frame change. This module holds R in the two forms a rule can take it:
//
//   on roles      reflectionLift: the 3^3 x 3^3 unitary of R on three members' role qutrits, in code/measure/role-holes'
//                 layout (member order kept, the first member the most significant digit), a love-tone member carrying
//                 the frame as C and a fear-tone member as C* (the unlike kernel Phi Phi^dag is invariant under g (x)
//                 conj g, the like kernel P_anti under g (x) g). null on a knot (charge 0 mod 3), where no covariant
//                 meeting other than a permutation exists
//   on the knit   knitReflection: a configuration map of code/rule/doublet-locked-knit: at every dock holding exactly
//                 three vibes on its slots with charge not 0 mod 3, R moves their stored points (code/measure/frame-
//                 covariant-meeting applyStoredLinear). R is symmetric in tokens of one sign, so the slot order does
//                 not enter. Stores are untouched. A bijection of configurations, and an involution
//   a control     knitSlotSum: the same docks take SUM x 1 in slot order (the first held slot's point added to the
//                 second's), which is neither frame covariant (A 1 is not 1) nor isotropic (slot order)
//
// And the reads the experiment needs: the frame action on n members' roles (frameOnRoles), a role operator applied to
// every block of a role-holes state (applyRoles), and the largest commutator of a role operator with a list of others.
//
// DETERMINISM: no random numbers. FLOATS: the lift is built in floating point and its entries below 1e-12 are set to 0.

import {
  applyStoredLinear,
  chargeOf,
  frameReflection,
  physicalMap,
  weilLift,
} from '@/code/measure/frame-covariant-meeting'
import {
  multiplyOperators,
  tensorOperators,
  type Operator,
} from '@/code/measure/grid-weights'
import { cloneBranch } from '@/code/measure/qca-axioms'
import type { Branch } from '@/code/rule/doublet-locked-knit'
import type { RoleEngine } from '@/code/measure/role-holes'

const CLEAN = 1e-12

// the sign of a role-holes species: 0 a pleasure-tone member (+1), 1 a pain-tone member (-1)
export const signOfSpecies = (species: number): number =>
  species === 0 ? 1 : -1

// the unitary of R on the roles of members with these signs, or null on a knot
export function reflectionLift(
  signs: readonly number[],
): { re: Float64Array; im: Float64Array } | null {
  const a = frameReflection(signs)

  if (!a) {
    return null
  }

  const u = weilLift(physicalMap(a, signs), signs.length)

  if (!u) {
    return null
  }

  const re = Float64Array.from(u.re, x => (Math.abs(x) < CLEAN ? 0 : x))
  const im = Float64Array.from(u.im, x => (Math.abs(x) < CLEAN ? 0 : x))

  return { re, im }
}

export const conjugateOperator = (g: Operator): Operator => ({
  n: g.n,
  re: Float64Array.from(g.re),
  im: Float64Array.from(g.im, x => -x),
})

// g on a love-tone member, conj g on a fear-tone member (or the reverse with `swap`), as one operator on the members'
// roles in order
export function frameOnRoles(
  g: Operator,
  signs: readonly number[],
  swap = false,
): Operator {
  const one = (s: number): Operator =>
    (s > 0) !== swap ? g : conjugateOperator(g)

  let out = one(signs[0]!)

  for (let i = 1; i < signs.length; i++) {
    out = tensorOperators(out, one(signs[i]!))
  }

  return out
}

export const asOperator = (m: {
  re: Float64Array
  im: Float64Array
}): Operator => ({
  n: Math.round(Math.sqrt(m.re.length)),
  re: m.re,
  im: m.im,
})

// the largest entry of U U^dagger - 1
export function unitarityResidual(u: Operator): number {
  const d = u.n
  const ud: Operator = {
    n: d,
    re: new Float64Array(d * d),
    im: new Float64Array(d * d),
  }

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      ud.re[i * d + j] = u.re[j * d + i]!
      ud.im[i * d + j] = -u.im[j * d + i]!
    }
  }

  const p = multiplyOperators(u, ud)

  let worst = 0

  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      worst = Math.max(
        worst,
        Math.hypot(p.re[i * d + j]! - (i === j ? 1 : 0), p.im[i * d + j]!),
      )
    }
  }

  return worst
}

// the operator swapping two of n role qutrits
export function roleSwap(n: number, i: number, j: number): Operator {
  const D = 3 ** n
  const u: Operator = {
    n: D,
    re: new Float64Array(D * D),
    im: new Float64Array(D * D),
  }

  for (let r = 0; r < D; r++) {
    const digits = Array.from(
      { length: n },
      (_, k) => Math.floor(r / 3 ** (n - 1 - k)) % 3,
    )

    ;[digits[i], digits[j]] = [digits[j]!, digits[i]!]

    const image = digits.reduce((s, d) => s * 3 + d, 0)

    u.re[image * D + r] = 1
  }

  return u
}

// U applied to the role amplitudes of every block of state x of a role-holes engine
export function applyRoles(e: RoleEngine, x: number, u: Operator): void {
  const R = e.R

  if (u.n !== R) {
    throw new Error('role-reflection: the operator does not match the engine')
  }

  const s = e.states[x]!
  const blocks = e.tuples * e.B
  const vr = new Float64Array(R)
  const vi = new Float64Array(R)

  for (let b = 0; b < blocks; b++) {
    const base = b * R

    for (let r = 0; r < R; r++) {
      vr[r] = s.re[base + r]!
      vi[r] = s.im[base + r]!
    }

    for (let r = 0; r < R; r++) {
      let yr = 0
      let yi = 0

      for (let k = 0; k < R; k++) {
        const ar = u.re[r * R + k]!
        const ai = u.im[r * R + k]!

        if (ar === 0 && ai === 0) {
          continue
        }

        yr += ar * vr[k]! - ai * vi[k]!
        yi += ar * vi[k]! + ai * vr[k]!
      }

      s.re[base + r] = yr
      s.im[base + r] = yi
    }
  }
}

// the largest entry of the difference of states x and y of an engine
export function stateDistance(e: RoleEngine, x: number, y: number): number {
  const a = e.states[x]!
  const b = e.states[y]!

  let worst = 0

  for (let k = 0; k < e.size; k++) {
    worst = Math.max(
      worst,
      Math.hypot(a.re[k]! - b.re[k]!, a.im[k]! - b.im[k]!),
    )
  }

  return worst
}

// ---- the knit ----

const SLOTS = 24

// the docks' held slots in increasing order
function heldSlots(b: Branch, x: number): number[] {
  const out: number[] = []

  for (let d = 0; d < SLOTS; d++) {
    if (b.vibe[x * SLOTS + d] !== 0) {
      out.push(d)
    }
  }

  return out
}

// R on the stored points of every dock holding exactly three vibes off a knot
export function knitReflection(cells: number): (b: Branch) => Branch {
  const out = [0, 0, 0]

  return b => {
    let copy: Branch | null = null

    for (let x = 0; x < cells; x++) {
      const held = heldSlots(b, x)

      if (held.length !== 3) {
        continue
      }

      const signs = held.map(d => b.vibe[x * SLOTS + d]!)

      if (chargeOf(signs) === 0) {
        continue
      }

      const a = frameReflection(signs)!

      applyStoredLinear(
        a,
        held.map(d => b.point[x * SLOTS + d]!),
        out,
      )
      copy ??= cloneBranch(b)
      held.forEach((d, i) => {
        copy!.point[x * SLOTS + d] = out[i]!
      })
    }

    return copy ?? cloneBranch(b)
  }
}

// the CONTROL: SUM x 1 in slot order on the same docks
export function knitSlotSum(cells: number): (b: Branch) => Branch {
  const sum = [1, 0, 0, 1, 1, 0, 0, 0, 1]
  const out = [0, 0, 0]

  return b => {
    let copy: Branch | null = null

    for (let x = 0; x < cells; x++) {
      const held = heldSlots(b, x)

      if (held.length !== 3) {
        continue
      }

      const signs = held.map(d => b.vibe[x * SLOTS + d]!)

      if (chargeOf(signs) === 0) {
        continue
      }

      applyStoredLinear(
        sum,
        held.map(d => b.point[x * SLOTS + d]!),
        out,
      )
      copy ??= cloneBranch(b)
      held.forEach((d, i) => {
        copy!.point[x * SLOTS + d] = out[i]!
      })
    }

    return copy ?? cloneBranch(b)
  }
}
