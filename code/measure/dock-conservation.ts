// What a dock collision keeps, state by state (E-RLT-0061 to E-RLT-0063): run it on a list of dock states and
// count, exactly, every state where it fails to be its own inverse, changes the charge (love minus fear), the
// count (love plus fear), the occupation momentum P = sum_d |s_d| r_d, the side sum D = sum_l n_l that exact
// local color keeps (code/measure/color-isotropy-bound), or any single line momentum; and how often each
// slot's vibe is changed (a direction the collision never touches streams freely forever, as E-RLT-0059 found
// for two directions of the committed knit).
//
// The states: the lone and two-vibe states (every one) and dense states from a 24-dimensional Kronecker
// sequence (slot d reads the Weyl orbit of frac(sqrt(q_d)), q_d the d-th prime), never a draw.

import { type Collision } from '@/code/rule/collision'
import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, OPPOSITE, SIDE } from '@/code/rule/isometric-knit'
import { weyl } from '@/code/tool/weyl'

const ROOTS = rootsD4()
const SLOT_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89]
const RATES = SLOT_PRIMES.map(q => Math.sqrt(q) - Math.floor(Math.sqrt(q)))

// the m-th Kronecker dock state: each slot fear, calm or love by thirds of its own Weyl orbit
export function kroneckerDockState(m: number): Int8Array {
  return Int8Array.from({ length: 24 }, (_, d) => {
    const u = weyl(m + 1, RATES[d] ?? 0)

    return u < 1 / 3 ? -1 : u < 2 / 3 ? 0 : 1
  })
}

// every dock state holding exactly one or two vibes
export function sparseDockStates(): Int8Array[] {
  const out: Int8Array[] = []

  for (let a = 0; a < 24; a++) {
    for (const s of [1, -1]) {
      const one = new Int8Array(24)

      one[a] = s
      out.push(one)

      for (let b = a + 1; b < 24; b++) {
        for (const t of [1, -1]) {
          const two = Int8Array.from(one)

          two[b] = t
          out.push(two)
        }
      }
    }
  }

  return out
}

export type DockAudit = {
  readonly states: number
  readonly changed: number
  readonly involutionFailures: number
  readonly chargeChanges: number
  readonly countChanges: number
  readonly momentumChanges: number
  readonly sideSumChanges: number
  readonly lineMomentumChanges: number
  // per slot, the states whose vibe in that slot the collision changed
  readonly slotChanges: number[]
}

function lineMomenta(s: Int8Array): number[] {
  return LINE_FIRSTS.map(d => (s[d] !== 0 ? 1 : 0) - (s[OPPOSITE[d] ?? 0] !== 0 ? 1 : 0))
}

function momentum(s: Int8Array): number[] {
  const p = [0, 0, 0, 0]

  s.forEach((v, d) => {
    if (v !== 0) for (let k = 0; k < 4; k++) p[k] = (p[k] ?? 0) + (ROOTS[d]?.[k] ?? 0)
  })

  return p
}

export function dockAudit(input: { collision: Collision; inverse: Collision; states: readonly Int8Array[] }): DockAudit {
  const slotChanges = new Array<number>(24).fill(0)
  let changed = 0
  let involutionFailures = 0
  let chargeChanges = 0
  let countChanges = 0
  let momentumChanges = 0
  let sideSumChanges = 0
  let lineMomentumChanges = 0
  const sum = (s: Int8Array): number => s.reduce((a, b) => a + b, 0)
  const count = (s: Int8Array): number => s.reduce((a, b) => a + (b !== 0 ? 1 : 0), 0)
  const sideSum = (s: Int8Array): number => s.reduce((a, b, d) => a + (b !== 0 ? (SIDE[d] ?? 0) : 0), 0)

  for (const x of input.states) {
    const y = Int8Array.from(x)

    input.collision(y, 0, 24)

    const back = Int8Array.from(y)

    input.inverse(back, 0, 24)

    involutionFailures += back.every((v, i) => v === x[i]) ? 0 : 1
    chargeChanges += sum(y) === sum(x) ? 0 : 1
    countChanges += count(y) === count(x) ? 0 : 1
    momentumChanges += momentum(y).every((v, k) => v === momentum(x)[k]) ? 0 : 1
    sideSumChanges += sideSum(y) === sideSum(x) ? 0 : 1

    const before = lineMomenta(x)

    lineMomentumChanges += lineMomenta(y).every((v, l) => v === before[l]) ? 0 : 1

    let any = false

    for (let d = 0; d < 24; d++) {
      if (y[d] !== x[d]) {
        slotChanges[d] = (slotChanges[d] ?? 0) + 1
        any = true
      }
    }

    changed += any ? 1 : 0
  }

  return { states: input.states.length, changed, involutionFailures, chargeChanges, countChanges, momentumChanges, sideSumChanges, lineMomentumChanges, slotChanges }
}
