// A fast classical kernel of the living-pair knit (code/rule/living-pair-knit, schedule 'alternate', the neutral veto
// on), for the large boxes of E-RLT-0075's battery and E-RLT-0076's responses. It is a MEASUREMENT kernel: the rule is
// living-pair-knit's, and E-RLT-0075 gates this kernel bit for bit against livingBeat before it reads a number from it.
//
// THE REDUCED STATE, and why it is exact (code/measure/candidate-kernel's argument, unchanged by the schedule). The
// classical layer reads a token's point only at the neutral veto, and only for the two tokens that are held (an
// unmake) or stored (a make). A calm slot's token is never held (a pair is made from the tokens its store holds), and
// the two tokens of a stored unit hold one point (the veto made them equal, and the places never stream). So per slot
// the vibe and its token's point, and per line the store trit and its unit's one point, evolve exactly on their own.
//
// NO ROUNDING, NO CONTINUITY: permutations of trits, integer points moved by grid-move tables.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, momentumKey, OPPOSITE, isometricTable, type MomentumTable } from '@/code/rule/isometric-knit'
import { type ColorWeave } from '@/code/rule/color-weave'
import { collisionOrder, livingBeat, type LivingKnit, type LivingSchedule } from '@/code/rule/living-pair-knit'
import { type TokenStoreState } from '@/code/rule/token-store-knit'

const ROOTS = rootsD4()
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const R0 = Int32Array.from(ROOTS, r => r[0] ?? 0)
const R1 = Int32Array.from(ROOTS, r => r[1] ?? 0)
const R2 = Int32Array.from(ROOTS, r => r[2] ?? 0)
const R3 = Int32Array.from(ROOTS, r => r[3] ?? 0)

export type Reduced = {
  vibe: Int8Array
  point: Int8Array
  store: Int8Array
  spoint: Int8Array
}

export type LivingKernel = {
  readonly cells: number
  readonly table: MomentumTable
  readonly schedule: LivingSchedule
  readonly veto: boolean
  readonly target: Int32Array
  readonly move: readonly Int8Array[]
}

export function makeLivingKernel(weave: ColorWeave, schedule: LivingSchedule = 'alternate', links?: Int16Array, veto = true): LivingKernel {
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

  return { cells, table: isometricTable(), schedule, veto, target, move }
}

export function cloneReduced(s: Reduced): Reduced {
  return { vibe: Int8Array.from(s.vibe), point: Int8Array.from(s.point), store: Int8Array.from(s.store), spoint: Int8Array.from(s.spoint) }
}

export function reducedOf(s: TokenStoreState): Reduced {
  const cells = s.store.length / 12
  const point = new Int8Array(s.vibe.length)
  const spoint = new Int8Array(s.store.length)

  for (let i = 0; i < s.vibe.length; i++) point[i] = s.vibe[i] !== 0 ? (s.point[s.token[i] as number] as number) : 0

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) spoint[x * 12 + l] = s.store[x * 12 + l] !== 0 ? (s.point[s.place[x * 24 + 2 * l] as number] as number) : 0
  }

  return { vibe: Int8Array.from(s.vibe), point, store: Int8Array.from(s.store), spoint }
}

export function sameReduced(a: Reduced, b: Reduced): boolean {
  if (a.vibe.length !== b.vibe.length || a.store.length !== b.store.length) return false

  for (let i = 0; i < a.vibe.length; i++) {
    if (a.vibe[i] !== b.vibe[i]) return false
    if (a.vibe[i] !== 0 && a.point[i] !== b.point[i]) return false
  }

  for (let i = 0; i < a.store.length; i++) {
    if (a.store[i] !== b.store[i]) return false
    if (a.store[i] !== 0 && a.spoint[i] !== b.spoint[i]) return false
  }

  return true
}

export type KernelTally = { made: number; unmade: number; vetoed: number }

const SCRATCH_V = new Int8Array(24)
const SCRATCH_P = new Int8Array(24)

function pairMove(k: LivingKernel, s: Reduced, x: number, tally?: KernelTally): void {
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

function coinMove(k: LivingKernel, s: Reduced, x: number): void {
  const base = x * 24
  let p0 = 0
  let p1 = 0
  let p2 = 0
  let p3 = 0
  let held = false

  for (let d = 0; d < 24; d++) {
    if (s.vibe[base + d] !== 0) {
      held = true
      p0 += R0[d] as number
      p1 += R1[d] as number
      p2 += R2[d] as number
      p3 += R3[d] as number
    }
  }

  // a coin map on a calm dock moves nothing the reduced state holds
  if (!held) return

  const w = k.table[momentumKey([p0, p1, p2, p3])]

  if (!w) return

  for (let d = 0; d < 24; d++) {
    SCRATCH_V[w[d] as number] = s.vibe[base + d] as number
    SCRATCH_P[w[d] as number] = s.point[base + d] as number
  }

  for (let d = 0; d < 24; d++) {
    s.vibe[base + d] = SCRATCH_V[d] as number
    s.point[base + d] = SCRATCH_P[d] as number
  }
}

// beat t's collision on dock x
export function collideLiving(k: LivingKernel, s: Reduced, x: number, t: number, tally?: KernelTally): void {
  for (const piece of collisionOrder(k.schedule, t)) {
    if (piece === 'P') pairMove(k, s, x, tally)
    else coinMove(k, s, x)
  }
}

// beat t in place into next: collide every dock, then stream
export function livingKernelBeat(k: LivingKernel, s: Reduced, next: Reduced, t: number, tally?: KernelTally): void {
  for (let x = 0; x < k.cells; x++) collideLiving(k, s, x, t, tally)

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
export function livingRunner(k: LivingKernel, start: Reduced, phase = 0): { state: () => Reduced; beat: (tally?: KernelTally) => void; time: () => number } {
  let a = cloneReduced(start)
  let b = cloneReduced(start)
  let t = phase

  return {
    state: () => a,
    time: () => t,
    beat: (tally?: KernelTally) => {
      livingKernelBeat(k, a, b, t, tally)
      t++

      const swap = a

      a = b
      b = swap
    },
  }
}

// the empty box with every store at tau and the layout's points
export function livingVacuum(cells: number, tau: number, layout: Int8Array): Reduced {
  return { vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: new Int8Array(cells * 12).fill(tau), spoint: Int8Array.from(layout) }
}

// the trits (vibes and stores) where two reduced states differ, the vibes alone, the docks touched
export function tritDifference(a: Reduced, b: Reduced): { trits: number; vibes: number; docks: number } {
  let vibes = 0
  let stores = 0
  let docks = 0
  const cells = a.store.length / 12

  for (let x = 0; x < cells; x++) {
    let touched = false

    for (let d = 0; d < 24; d++) {
      if (a.vibe[x * 24 + d] !== b.vibe[x * 24 + d]) {
        vibes++
        touched = true
      }
    }

    for (let l = 0; l < 12; l++) {
      if (a.store[x * 12 + l] !== b.store[x * 12 + l]) {
        stores++
        touched = true
      }
    }

    docks += touched ? 1 : 0
  }

  return { trits: vibes + stores, vibes, docks }
}

// The bit-for-bit check against the rule: a full state run by livingBeat and its reduced state by the kernel
export function livingKernelAgreement(input: { knit: LivingKnit; start: TokenStoreState; beats: number }): { mismatches: number; made: number; unmade: number; vetoed: number } {
  const kernel = makeLivingKernel(input.knit.weave, input.knit.schedule, undefined, input.knit.veto)
  const run = livingRunner(kernel, reducedOf(input.start))
  const none = new Uint8Array(input.start.point.length)
  const tally: KernelTally = { made: 0, unmade: 0, vetoed: 0 }
  let full = input.start
  let mismatches = 0

  for (let t = 0; t < input.beats; t++) {
    full = livingBeat(input.knit, full, none, t).state
    run.beat(tally)
    mismatches += sameReduced(reducedOf(full), run.state()) ? 0 : 1
  }

  return { mismatches, ...tally }
}
