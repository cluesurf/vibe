// A fast classical kernel of the candidate knit (code/rule/token-store-knit, variant 'returned-neutral'), for the
// large boxes of E-RLT-0070's battery (dressing at sides 7, 9 and 11, travel at 13, walls at 9) and the melting runs
// of E-RLT-0072. It is a MEASUREMENT kernel: the rule is token-store-knit's, and E-RLT-0070 gates this kernel bit for
// bit against storeBeat before it reads a number from it.
//
// THE REDUCED STATE, and why it is exact. The candidate's classical layer reads a token's point only at the neutral
// veto, and only for the tokens that are held (an unmake) or stored (a make). A calm slot's token is never held
// (pairs are made only from the tokens the store holds, E-RLT-0067's note), and the two tokens of a stored unit hold
// one point (the veto made them equal, and the store places never stream). So the vibes and stores evolve exactly
// with, per slot, the vibe and the point of its token (read only where the vibe is held), and per line the store
// trit and the one point of its stored unit. Nothing else of the token layer reaches a vibe or a store.
//
// A calm dock's collision is the store negated (E-RLT-0069's dock theorem; with the veto too, since a stored unit's
// two tokens share a point), so a dock with no vibe is done in 12 steps.
//
// NO ROUNDING, NO CONTINUITY: permutations of trits, integer points moved by grid-move tables.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, momentumKey, OPPOSITE, type MomentumTable } from '@/code/rule/isometric-knit'
import { isometricTable } from '@/code/rule/isometric-knit'
import { type ColorWeave } from '@/code/rule/color-weave'
import { storeBeat, type TokenStoreKnit, type TokenStoreState } from '@/code/rule/token-store-knit'
import { makePairKnit } from '@/code/rule/pair-making-knit'

const ROOTS = rootsD4()
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const R0 = Int32Array.from(ROOTS, r => r[0] ?? 0)
const R1 = Int32Array.from(ROOTS, r => r[1] ?? 0)
const R2 = Int32Array.from(ROOTS, r => r[2] ?? 0)
const R3 = Int32Array.from(ROOTS, r => r[3] ?? 0)

export type Reduced = {
  // per slot (x * 24 + d): the vibe and its token's point (meaningful where the vibe is held)
  vibe: Int8Array
  point: Int8Array
  // per line (x * 12 + l): the store trit and its stored unit's point (meaningful where the store is not 0)
  store: Int8Array
  spoint: Int8Array
}

export type Kernel = {
  readonly cells: number
  readonly table: MomentumTable
  // the slot each slot streams into, and the point table of the link it crosses
  readonly target: Int32Array
  readonly move: readonly Int8Array[]
}

// the kernel on a color weave's box and links (links may be replaced, for a frame change or flat links)
export function makeKernel(weave: ColorWeave, links?: Int16Array): Kernel {
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

  return { cells, table: isometricTable(), target, move }
}

export function cloneReduced(s: Reduced): Reduced {
  return { vibe: Int8Array.from(s.vibe), point: Int8Array.from(s.point), store: Int8Array.from(s.store), spoint: Int8Array.from(s.spoint) }
}

// the reduced state of a full token-store state
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

// whether two reduced states agree on every datum the classical layer reads
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

export type Tally = { made: number; unmade: number; vetoed: number }

const SCRATCH_V = new Int8Array(24)
const SCRATCH_P = new Int8Array(24)

// the pair move on every line of dock x, with the neutral veto
function pairMove(s: Reduced, x: number, tally?: Tally): void {
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

      if (s.point[i] !== s.point[j]) {
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

// the dock collision P K P
export function collideDock(k: Kernel, s: Reduced, x: number, tally?: Tally): void {
  const base = x * 24
  let held = false

  for (let d = 0; d < 24; d++) {
    if (s.vibe[base + d] !== 0) {
      held = true
      break
    }
  }

  if (!held) {
    // the calm dock's collision: every stored unit comes out, turns round and goes back, the store negated
    for (let l = 0; l < 12; l++) s.store[x * 12 + l] = -(s.store[x * 12 + l] as number)
    return
  }

  pairMove(s, x, tally)

  let p0 = 0
  let p1 = 0
  let p2 = 0
  let p3 = 0

  for (let d = 0; d < 24; d++) {
    if (s.vibe[base + d] !== 0) {
      p0 += R0[d] as number
      p1 += R1[d] as number
      p2 += R2[d] as number
      p3 += R3[d] as number
    }
  }

  const w = k.table[momentumKey([p0, p1, p2, p3])]

  if (w) {
    for (let d = 0; d < 24; d++) {
      SCRATCH_V[w[d] as number] = s.vibe[base + d] as number
      SCRATCH_P[w[d] as number] = s.point[base + d] as number
    }

    for (let d = 0; d < 24; d++) {
      s.vibe[base + d] = SCRATCH_V[d] as number
      s.point[base + d] = SCRATCH_P[d] as number
    }
  }

  pairMove(s, x, tally)
}

// one beat in place: collide every dock, then stream (a held slot's point moved by its link)
export function kernelBeat(k: Kernel, s: Reduced, next: Reduced, tally?: Tally): void {
  for (let x = 0; x < k.cells; x++) collideDock(k, s, x, tally)

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

// a runner that keeps two buffers and swaps them
export function makeRunner(k: Kernel, start: Reduced): { state: () => Reduced; beat: (tally?: Tally) => void } {
  let a = cloneReduced(start)
  let b = cloneReduced(start)

  return {
    state: () => a,
    beat: (tally?: Tally) => {
      kernelBeat(k, a, b, tally)
      const t = a

      a = b
      b = t
    },
  }
}

const GOLDEN_FILL = (Math.sqrt(5) - 1) / 2

// E-FRC-0159's golden fill (combined-knit-battery's golden()): fear, calm, love by thirds-ish (0.3, 0.3, 0.4) and a
// point per slot, each from the golden rotation at the given scale
export function goldenFill(slots: number, scale: number): { vibe: Int8Array; point: Int8Array } {
  const vibe = new Int8Array(slots)
  const point = new Int8Array(slots)

  for (let i = 0; i < slots; i++) {
    const u = ((i + 1) * GOLDEN_FILL * scale) % 1

    vibe[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
    point[i] = Math.floor(((i + 3) * GOLDEN_FILL * scale * 9) % 9)
  }

  return { vibe, point }
}

// A full token-store state from vibes, their points and one store value on every line: slot tokens 0..24 cells - 1
// at the given points, place tokens after them, a line's two place tokens at one point ((x * 12 + l) * 5 mod 9, the
// same as vacuumState's), labels the vibes' signs (unread by 'returned-neutral')
export function fullState(input: { vibe: Int8Array; point: Int8Array; tau: number }): TokenStoreState {
  const slots = input.vibe.length
  const cells = slots / 24
  const point = new Int8Array(slots * 2)
  const label = new Int8Array(slots * 2)

  for (let i = 0; i < slots; i++) {
    point[i] = input.point[i] as number
    label[i] = input.vibe[i] as number
  }

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const p = ((x * 12 + l) * 5) % 9

      point[slots + x * 24 + 2 * l] = p
      point[slots + x * 24 + 2 * l + 1] = p
      label[slots + x * 24 + 2 * l] = input.tau
      label[slots + x * 24 + 2 * l + 1] = -input.tau
    }
  }

  return {
    vibe: Int8Array.from(input.vibe),
    store: new Int8Array(cells * 12).fill(input.tau),
    token: Int32Array.from({ length: slots }, (_, i) => i),
    place: Int32Array.from({ length: slots }, (_, i) => slots + i),
    point,
    label,
  }
}

// The bit-for-bit check of this kernel against the rule: a full token-store state run by storeBeat
// ('returned-neutral') and its reduced state run by the kernel, compared on every beat. Returns the beats that
// disagree and the pairs made, unmade and vetoed (so the check is known to exercise the veto)
export function kernelAgreement(input: { weave: ColorWeave; start: TokenStoreState; beats: number }): { mismatches: number; made: number; unmade: number; vetoed: number } {
  const knit: TokenStoreKnit = { weave: input.weave, knit: makePairKnit({ mesh: input.weave.mesh }), variant: 'returned-neutral' }
  const kernel = makeKernel(input.weave)
  const run = makeRunner(kernel, reducedOf(input.start))
  const none = new Uint8Array(input.start.point.length)
  const tally: Tally = { made: 0, unmade: 0, vetoed: 0 }
  let full = input.start
  let mismatches = 0

  for (let t = 0; t < input.beats; t++) {
    full = storeBeat(knit, full, none).state
    run.beat(tally)
    mismatches += sameReduced(reducedOf(full), run.state()) ? 0 : 1
  }

  return { mismatches, ...tally }
}

// the empty box with every store at `tau` (the hot vacuum at +1, the cold at 0), stored points p(line)
export function vacuumState(cells: number, tau: number): Reduced {
  const spoint = Int8Array.from({ length: cells * 12 }, (_, i) => (i * 5) % 9)

  return { vibe: new Int8Array(cells * 24), point: new Int8Array(cells * 24), store: new Int8Array(cells * 12).fill(tau), spoint }
}

// the trits (vibes and stores) where two reduced states differ, and the vibes alone
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
