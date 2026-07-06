import type { Will } from '@/code/tone/will'
import { makeWill, fillWillPattern, cloneWill } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable, beatInto } from '@/code/rule/lattice-gas'
import { d4Mesh } from '@/code/tool/mesh'

// 't Hooft's ontological basis on the committed rule. In the Cellular Automaton Interpretation of
// quantum mechanics the deterministic microscopic law permutes a preferred set of "ontological"
// basis states (the beables), so every state lies on a finite cycle and information is never lost,
// and quantum superpositions are epistemic distributions over those beables rather than new
// ontological states. The committed reversible rule is exactly such a permutation: iterating it
// returns any microstate to itself after a finite period (a beable cycle, Poincare recurrence) and
// it maps distinct states to distinct states (injective). A lossy rule with an information sink is
// NOT a permutation: distinct states merge and the initial state does not recur.

const FNV_OFFSET = 2166136261
const FNV_PRIME = 16777619

function hashWill(will: Will): number {
  let hash = FNV_OFFSET >>> 0

  for (let i = 0; i < will.data.length; i++) {
    hash ^= will.data[i]! + 1
    hash = Math.imul(hash, FNV_PRIME) >>> 0
  }

  return hash >>> 0
}

// One beat of the committed reversible rule, optionally followed by an information sink (a lossy
// control) that clamps one slot to zero, destroying the distinction carried there.
function stepInto(input: {
  source: Will
  target: Will
  table: ReturnType<typeof streamSourceTable>
  collision: Collision
  sink: boolean
}): void {
  const { source, target, table, collision, sink } = input
  beatInto({ src: source, dst: target, table, collision })

  if (sink) {
    target.data[0] = 0
  }
}

// The recurrence period: iterate the rule from the pattern-filled state until the microstate returns
// to its start, up to `limit` beats. Returns -1 if it never recurs within the limit (the lossy
// signature: information destroyed, no beable cycle).
export function recurrencePeriod(input: {
  side: number
  limit: number
  sink: boolean
}): number {
  const { side, limit, sink } = input

  const mesh = d4Mesh({ side })
  const degree = mesh.degree
  const opposite = Array.from({ length: degree }, (unused, d) => mesh.opposite(d))
  const collision: Collision = pairCollision({ opposite, forward: true })
  const table = streamSourceTable(mesh)

  const init = makeWill(mesh)
  fillWillPattern(init)

  if (sink) {
    init.data[0] = 0
  }

  const start = hashWill(init)

  let current = cloneWill(init)
  let scratch: Will = { mesh: current.mesh, data: new Int8Array(current.data.length) }

  for (let t = 1; t <= limit; t++) {
    stepInto({ source: current, target: scratch, table, collision, sink })

    const swap = current
    current = scratch
    scratch = swap

    if (hashWill(current) === start) {
      return t
    }
  }

  return -1
}

// Whether the rule maps two distinct microstates to distinct successors (injective, the permutation
// property). Two states differing in a single slot are stepped once; injective means they stay
// distinct. Under the sink the distinction in the clamped slot is erased, so states differing only
// there merge (not injective).
export function ruleInjective(input: { side: number; sink: boolean }): boolean {
  const { side, sink } = input

  const mesh = d4Mesh({ side })
  const degree = mesh.degree
  const opposite = Array.from({ length: degree }, (unused, d) => mesh.opposite(d))
  const collision: Collision = pairCollision({ opposite, forward: true })
  const table = streamSourceTable(mesh)

  const a = makeWill(mesh)
  fillWillPattern(a)
  const b = cloneWill(a)
  // flip the slot the sink would clamp, so the two states differ only where the sink erases
  b.data[0] = (a.data[0] === 1 ? -1 : 1) as Int8Array[number]

  const nextA: Will = { mesh: a.mesh, data: new Int8Array(a.data.length) }
  const nextB: Will = { mesh: b.mesh, data: new Int8Array(b.data.length) }

  stepInto({ source: a, target: nextA, table, collision, sink })
  stepInto({ source: b, target: nextB, table, collision, sink })

  for (let i = 0; i < nextA.data.length; i++) {
    if (nextA.data[i] !== nextB.data[i]) {
      return true
    }
  }

  return false
}
