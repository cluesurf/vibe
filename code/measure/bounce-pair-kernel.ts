// A fast classical kernel of the bounce knit (code/rule/bounce-pair-knit), for large boxes (E-RLT-0083 to E-RLT-0085).
// It is code/measure/living-pair-kernel with the coin map chosen by `collision`: 'bounce' (B) or 'isometric' (K, which
// makes it the living-pair kernel exactly). A MEASUREMENT kernel: E-RLT-0084 gates it bit for bit against bounceBeat
// before any number is read from it. The reduced state (per slot the vibe and its token's point, per line the store and
// its unit's point) is exact for B for the reason it is exact for K: the classical layer reads a point only at the
// neutral veto, and B, like K, moves a vibe and its point together.
//
// NO ROUNDING, NO CONTINUITY: permutations of trits, integer points moved by grid-move tables.

import { LINE_FIRSTS, OPPOSITE, isometricTable, type MomentumTable } from '@/code/rule/isometric-knit'
import { type ColorWeave } from '@/code/rule/color-weave'
import { collisionOrder, type LivingSchedule } from '@/code/rule/living-pair-knit'
import { bounceBeat, bouncePermutation, type BounceKnit, type CollisionKind } from '@/code/rule/bounce-pair-knit'
import { type TokenStoreState } from '@/code/rule/token-store-knit'
import { cloneReduced, reducedOf, sameReduced, type KernelTally, type Reduced } from '@/code/measure/living-pair-kernel'

const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)

export type BounceKernel = {
  readonly cells: number
  readonly table: MomentumTable
  readonly schedule: LivingSchedule
  readonly veto: boolean
  readonly collision: CollisionKind
  readonly target: Int32Array
  readonly move: readonly Int8Array[]
}

export function makeBounceKernel(weave: ColorWeave, collision: CollisionKind = 'bounce', schedule: LivingSchedule = 'alternate', links?: Int16Array, veto = true): BounceKernel {
  const cells = weave.mesh.cellCount
  const target = new Int32Array(cells * 24)
  const use = links ?? weave.links
  const move: Int8Array[] = []

  for (let x = 0; x < cells; x++) {
    for (let d = 0; d < 24; d++) {
      const slot = x * 24 + d

      target[slot] = weave.mesh.neighbour(x, d) * 24 + d
      move.push(weave.moves.act[use[slot] ?? weave.moves.identity] as Int8Array)
    }
  }

  return { cells, table: isometricTable(), schedule, veto, collision, target, move }
}

export function pairMove(k: BounceKernel, s: Reduced, x: number, tally?: KernelTally): void {
  const base = x * 24
  const lineBase = x * 12

  for (let l = 0; l < 12; l++) {
    const i = base + (LINE_FIRSTS[l] as number)
    const j = base + (LINE_SECONDS[l] as number)
    const a = s.vibe[i] as number
    const b = s.vibe[j] as number
    const tau = s.store[lineBase + l] as number

    if (tau === 0) {
      if (a === 0 || b !== -a) continue

      if (k.veto && s.point[i] !== s.point[j]) {
        if (tally) tally.vetoed++
        continue
      }

      s.vibe[i] = 0
      s.vibe[j] = 0
      s.store[lineBase + l] = a
      s.spoint[lineBase + l] = s.point[i] as number
      if (tally) tally.unmade++
    } else if (a === 0 && b === 0) {
      const p = s.spoint[lineBase + l] as number

      s.vibe[i] = tau
      s.vibe[j] = -tau
      s.point[i] = p
      s.point[j] = p
      s.store[lineBase + l] = 0
      if (tally) tally.made++
    }
  }
}

const PERM = new Int32Array(24)
const SCRATCH_V = new Int8Array(24)
const SCRATCH_P = new Int8Array(24)

// the coin piece on dock x; counts the docks where B turned only the full lines when `turned` is given
export function coinMove(k: BounceKernel, s: Reduced, x: number, turned?: { onlyFull: number }): void {
  const base = x * 24
  const kind = bouncePermutation(k.table, k.collision, s.vibe, base, PERM)

  if (kind === 0) return
  if (turned && kind === 2) turned.onlyFull++

  for (let d = 0; d < 24; d++) {
    SCRATCH_V[PERM[d] as number] = s.vibe[base + d] as number
    SCRATCH_P[PERM[d] as number] = s.point[base + d] as number
  }

  for (let d = 0; d < 24; d++) {
    s.vibe[base + d] = SCRATCH_V[d] as number
    s.point[base + d] = SCRATCH_P[d] as number
  }
}

// beat t's collision on dock x
export function collideBounce(k: BounceKernel, s: Reduced, x: number, t: number, tally?: KernelTally): void {
  for (const piece of collisionOrder(k.schedule, t)) {
    if (piece === 'P') pairMove(k, s, x, tally)
    else coinMove(k, s, x)
  }
}

// beat t in place into next: collide every dock, then stream
export function bounceKernelBeat(k: BounceKernel, s: Reduced, next: Reduced, t: number, tally?: KernelTally): void {
  for (let x = 0; x < k.cells; x++) collideBounce(k, s, x, t, tally)

  next.vibe.fill(0)

  for (let slot = 0; slot < s.vibe.length; slot++) {
    const v = s.vibe[slot] as number

    if (v === 0) continue

    const to = k.target[slot] as number

    next.vibe[to] = v
    next.point[to] = (k.move[slot] as Int8Array)[s.point[slot] as number] as number
  }

  next.store.set(s.store)
  next.spoint.set(s.spoint)
}

// a runner with its own beat counter (starting at `phase`)
export function bounceRunner(k: BounceKernel, start: Reduced, phase = 0): { state: () => Reduced; beat: (tally?: KernelTally) => void; time: () => number } {
  let a = cloneReduced(start)
  let b = cloneReduced(start)
  let t = phase

  return {
    state: () => a,
    time: () => t,
    beat: (tally?: KernelTally) => {
      bounceKernelBeat(k, a, b, t, tally)
      t++

      const swap = a

      a = b
      b = swap
    },
  }
}

// The bit-for-bit check against the rule: a full state run by bounceBeat and its reduced state by the kernel
export function bounceKernelAgreement(input: { knit: BounceKnit; start: TokenStoreState; beats: number }): { mismatches: number; made: number; unmade: number; vetoed: number } {
  const kernel = makeBounceKernel(input.knit.weave, input.knit.collision, input.knit.schedule, undefined, input.knit.veto)
  const run = bounceRunner(kernel, reducedOf(input.start))
  const none = new Uint8Array(input.start.point.length)
  const tally: KernelTally = { made: 0, unmade: 0, vetoed: 0 }
  let full = input.start
  let mismatches = 0

  for (let t = 0; t < input.beats; t++) {
    full = bounceBeat(input.knit, full, none, t).state
    run.beat(tally)
    mismatches += sameReduced(reducedOf(full), run.state()) ? 0 : 1
  }

  return { mismatches, ...tally }
}
