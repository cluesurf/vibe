// A time-staggered hub vacuum: the oriented hub vacuum (code/measure/varying-vacuum) with the units of each of the three
// line frames run at their own phase of the period-6 cycle (E-RLT-0083). The RULE is unchanged (the living-pair knit, or
// the bounce knit): the stagger is a property of the STATE.
//
// THE FRAMES. The twelve D4 lines split into three frames of four mutually orthogonal lines (each line is orthogonal to
// exactly three others, and orthogonality is transitive among them). W(F4) permutes the three frames through S3
// (W(F4) / W'(F4) with the frame-fixing subgroup of order 192), the Hurwitz units 2T through Z3 (Q8 fixes every frame;
// its orbits on the lines are the frames themselves).
//
// WHY A STAGGER IS A STATE, derived. On a vacuum whose every dock at every beat holds zero occupation momentum LINE BY
// LINE ((Z) term by term, as the hub pattern does), the collision is -1 on every line holding vibes and the pair move
// acts line by line, so the vacuum's lines evolve independently of one another. Any assignment of cycle phases to the
// lines then runs exactly, provided each line's own history is a vacuum history. The period-6 phase of a unit is set by
// its initial state (a stored unit makes its pair at the next beat whose piece order allows it), not by the rule. So a
// schedule "per line class" needs no change of the rule and keeps its W(F4)-covariance whole.
//
// THE STAGGER. Frame c is started at the hub vacuum's state of beat b_c = -2c mod 6: frame c's units make at beats 2c
// and 2c + 3 mod 6. The shift is even, so each unit meets the same order of pieces (P K on even beats, K P on odd) as in
// the unstaggered vacuum, and its own cycle is the unstaggered one shifted. A hub then holds, at each beat, the vibes of
// ONE frame (4 lines, 8 vibes) instead of all 12 lines.
//
// THE SYMMETRY IT KEEPS, derived. Let U(t) be the unstaggered vacuum, kept by the orientation group G (576 elements:
// 2T and one more element, code/measure/varying-vacuum orientedHub). If g in G permutes the frames cyclically,
// c -> c + sigma(g), then for the staggered vacuum V_c(t) = U_c(t - 2c):
//      g V_c(t) = g U_c(t - 2c) = U_(c + sigma)(t - 2c) = V_(c + sigma)(t + 2 sigma),
// so g V(t) = V(t + 2 sigma(g)): g is a SPACE-TIME symmetry with time shift 2 sigma(g). An element that permutes the
// frames by a transposition has no such shift (it would need phi(1) - phi(2) = phi(2) - phi(1) mod 6 with the phases
// 2 and 4 apart). spaceTimeCheck measures both.
//
// THE BOUND, derived. A stagger with a space-time group whose linear part G_h (about a hub) acts transitively on the hub's
// 24 neighbouring units gives each unit a phase phi, with phi(g u) = phi(u) + tau(g) for a homomorphism tau of G_h into
// the cyclic group of time shifts. Units in one orbit of ker tau share a phase, and ker tau holds the commutator
// subgroup [G_h, G_h] (a cyclic image is abelian) and every root stabilizer (a unit fixed by g has tau(g) = 0). So the
// lines whose vacuum vibes share one hub-beat number at least the least orbit, on the lines, of the normal closure N of
// [G_h, G_h] and the stabilizers. For 2T it is Q8, whose orbits are the frames: 4 lines. lineShareCensus computes the
// bound over every two-generated subgroup of W(F4) that forces the husk scalars through k^4.
//
// NO ROUNDING, NO CONTINUITY: permutations of trits, integer points. The forcing tests of the census are measurements.

import { rootsD4 } from '@/code/algebra/group/root-system'
import { LINE_FIRSTS, OPPOSITE } from '@/code/rule/isometric-knit'
import { closure, type GroupTable } from '@/code/measure/color-isotropy-bound'
import { coinMove, pairMove, type BounceKernel } from '@/code/measure/bounce-pair-kernel'
import { cloneReduced, tritDifference, type KernelTally, type Reduced } from '@/code/measure/living-pair-kernel'
import { boxMaps, huskForcing, pointGenerator, type CoinData } from '@/code/measure/varying-vacuum'

const ROOTS = rootsD4()
const LINE_SECONDS: readonly number[] = LINE_FIRSTS.map(f => OPPOSITE[f] ?? f)
const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((s, x, k) => s + x * (b[k] ?? 0), 0)

// the frame of each line: 0 for line 0's frame, then in order of the least line of each new frame
export function lineFrames(): Int8Array {
  const frame = new Int8Array(12).fill(-1)
  let next = 0

  for (let l = 0; l < 12; l++) {
    if (frame[l] !== -1) continue

    frame[l] = next

    for (let m = 0; m < 12; m++) {
      if (dot(ROOTS[LINE_FIRSTS[l] as number] as number[], ROOTS[LINE_FIRSTS[m] as number] as number[]) === 0) frame[m] = next
    }

    next++
  }

  return frame
}

// the frames of a line set are three iff every line is orthogonal to exactly three others, each frame four lines
export function framesCheck(): { frames: number; sizes: number[]; orthogonalEach: number[] } {
  const frame = lineFrames()
  const sizes = [0, 0, 0]

  for (let l = 0; l < 12; l++) sizes[frame[l] as number] = (sizes[frame[l] as number] ?? 0) + 1

  const orthogonalEach = LINE_FIRSTS.map((f, l) => LINE_FIRSTS.filter((g, m) => m !== l && dot(ROOTS[f] as number[], ROOTS[g] as number[]) === 0).length)

  return { frames: Math.max(...Array.from(frame)) + 1, sizes, orthogonalEach }
}

// the permutation of the three frames by a W(F4) element
export function framePermutation(coins: CoinData, g: number): number[] {
  const frame = lineFrames()
  const image = coins.lineImage[g] as Int8Array

  return [0, 1, 2].map(c => frame[image[frame.indexOf(c)] as number] as number)
}

// sigma if the permutation is the cyclic shift c -> c + sigma, else -1 (a transposition)
export function cyclicShift(permutation: readonly number[]): number {
  const sigma = (((permutation[0] as number) - 0) % 3 + 3) % 3

  return permutation.every((p, c) => p === (c + sigma) % 3) ? sigma : -1
}

// one beat of the kernel in place into next, recording before each coin piece, per dock, how many lines hold vibes and
// whether the occupation momentum is zero
export type BeatWatch = { maxLines: number; momentumDocks: number; tally: KernelTally }

export function watchedBeat(k: BounceKernel, s: Reduced, next: Reduced, t: number, watch: BeatWatch): void {
  const pFirst = k.schedule === 'palindrome' || k.schedule === 'first' || t % 2 === 0
  const look = (x: number): void => {
    let lines = 0
    let p0 = 0
    let p1 = 0
    let p2 = 0
    let p3 = 0

    for (let l = 0; l < 12; l++) {
      const a = s.vibe[x * 24 + (LINE_FIRSTS[l] as number)] !== 0
      const b = s.vibe[x * 24 + (LINE_SECONDS[l] as number)] !== 0

      if (a || b) lines++

      for (const [held, d] of [
        [a, LINE_FIRSTS[l] as number],
        [b, LINE_SECONDS[l] as number],
      ] as [boolean, number][]) {
        if (!held) continue

        const r = ROOTS[d] as number[]

        p0 += r[0] as number
        p1 += r[1] as number
        p2 += r[2] as number
        p3 += r[3] as number
      }
    }

    watch.maxLines = Math.max(watch.maxLines, lines)
    watch.momentumDocks += p0 !== 0 || p1 !== 0 || p2 !== 0 || p3 !== 0 ? 1 : 0
  }

  for (let x = 0; x < k.cells; x++) {
    if (pFirst) {
      pairMove(k, s, x, watch.tally)
      look(x)
      coinMove(k, s, x)
    } else {
      look(x)
      coinMove(k, s, x)
      pairMove(k, s, x, watch.tally)
    }
  }

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

// the history of a start under the kernel: the reduced state at the start of each beat 0 .. beats, and per beat what
// the watch saw (made, unmade, vetoed; the most lines on one dock at a coin piece; the docks with nonzero momentum)
export type History = { states: Reduced[]; made: number[]; unmade: number[]; vetoed: number[]; maxLines: number[]; momentumDocks: number[] }

export function history(k: BounceKernel, start: Reduced, beats: number): History {
  let a = cloneReduced(start)
  let b = cloneReduced(start)
  const out: History = { states: [cloneReduced(start)], made: [], unmade: [], vetoed: [], maxLines: [], momentumDocks: [] }

  for (let t = 0; t < beats; t++) {
    const watch: BeatWatch = { maxLines: 0, momentumDocks: 0, tally: { made: 0, unmade: 0, vetoed: 0 } }

    watchedBeat(k, a, b, t, watch)
    ;[a, b] = [b, a]
    out.states.push(cloneReduced(a))
    out.made.push(watch.tally.made)
    out.unmade.push(watch.tally.unmade)
    out.vetoed.push(watch.tally.vetoed)
    out.maxLines.push(watch.maxLines)
    out.momentumDocks.push(watch.momentumDocks)
  }

  return out
}

// The staggered start: frame c's slots and stores from the unstaggered vacuum's state at beat shifts[c]
export function staggeredStart(unstaggered: History, shifts: readonly number[]): Reduced {
  const frame = lineFrames()
  const base = unstaggered.states[0] as Reduced
  const out = cloneReduced(base)
  const cells = base.store.length / 12

  for (let x = 0; x < cells; x++) {
    for (let l = 0; l < 12; l++) {
      const from = unstaggered.states[shifts[frame[l] as number] as number] as Reduced

      for (const d of [LINE_FIRSTS[l] as number, LINE_SECONDS[l] as number]) {
        out.vibe[x * 24 + d] = from.vibe[x * 24 + d] as number
        out.point[x * 24 + d] = from.point[x * 24 + d] as number
      }

      out.store[x * 12 + l] = from.store[x * 12 + l] as number
      out.spoint[x * 12 + l] = from.spoint[x * 12 + l] as number
    }
  }

  return out
}

// the least period p (even, up to `most`) with states[t + p] = states[t] on vibes and stores for every t in range
export function periodOf(states: readonly Reduced[], most: number): number {
  for (let p = 1; p <= most; p++) {
    let ok = true

    for (let t = 0; t + p < states.length && ok; t++) ok = tritDifference(states[t] as Reduced, states[t + p] as Reduced).trits === 0

    if (ok) return p
  }

  return 0
}

// Space-time check on the side-L box (L divisible by 4), hub at the origin: for each element g of `group`, the affine
// image of V(t) (docks by g about the hub, slots by g, stores by g with the side sign) against V(t + shift) for the
// shift 2 sigma(g) (sigma the cyclic frame shift) and, for a transposition, against every shift. Returned: the elements
// that are space-time symmetries with the derived shift, those that are with some other shift, those with none
export function spaceTimeCheck(input: { coins: CoinData; side: number; group: readonly number[]; states: readonly Reduced[]; period: number }): { derived: number; otherShift: number; none: number; transpositions: number } {
  const { coins, side, group, states, period } = input
  const box = boxMaps(coins, side)
  const cells = box.cells
  let derived = 0
  let otherShift = 0
  let none = 0
  let transpositions = 0

  for (const g of group) {
    const gen = pointGenerator(coins, box, g, [0, 0, 0, 0], 1)
    const perm = coins.table.permutations[g] as readonly number[]
    const sigma = cyclicShift(framePermutation(coins, g))
    const image = (s: Reduced): Reduced => {
      const out: Reduced = { vibe: new Int8Array(s.vibe.length), point: new Int8Array(s.point.length), store: new Int8Array(s.store.length), spoint: new Int8Array(s.spoint.length) }

      for (let x = 0; x < cells; x++) {
        const y = gen.map[x] as number

        for (let d = 0; d < 24; d++) out.vibe[y * 24 + (perm[d] as number)] = s.vibe[x * 24 + d] as number
        for (let l = 0; l < 12; l++) out.store[y * 12 + (gen.lineImage[l] as number)] = (s.store[x * 12 + l] as number) * (gen.lineSign[l] as number)
      }

      return out
    }
    const holdsWith = (shift: number): boolean => {
      for (let t = 0; t < period; t++) {
        if (tritDifference(image(states[t] as Reduced), states[(t + shift) % period] as Reduced).trits !== 0) return false
      }

      return true
    }

    if (sigma < 0) transpositions++

    if (sigma >= 0 && holdsWith((2 * sigma) % period)) derived++
    else if (Array.from({ length: period }, (_, s) => s).some(holdsWith)) otherShift++
    else none++
  }

  return { derived, otherShift, none, transpositions }
}

// ---- the bound over forcing groups ----

// the orbits of a group (element indices) on the twelve lines
export function lineOrbits(coins: CoinData, group: readonly number[]): number[][] {
  const seen = new Int8Array(12)
  const out: number[][] = []

  for (let l = 0; l < 12; l++) {
    if (seen[l]) continue

    const orbit = [...new Set(group.map(g => coins.lineImage[g]?.[l] as number))].sort((a, b) => a - b)

    for (const m of orbit) seen[m] = 1

    out.push(orbit)
  }

  return out
}

// the normal closure in `group` (generated by `generators`) of the commutators and the root stabilizers: the subgroup
// every phase homomorphism must kill. For G generated by S, [G, G] is the normal closure of the commutators of pairs
// of elements of S
export function phaseKernel(table: GroupTable, group: readonly number[], generators: readonly number[]): number[] {
  const n = table.permutations.length
  const inGroup = new Set(group)
  const mul = (a: number, b: number): number => table.multiply[a * n + b] as number
  const inv = (a: number): number => table.inverse[a] as number
  const gens = new Set<number>()
  const members = [...group]

  for (const a of generators) for (const b of generators) gens.add(mul(mul(a, b), mul(inv(a), inv(b))))

  // the root stabilizers
  for (const g of members) {
    const p = table.permutations[g] as readonly number[]

    if (p.some((image, d) => image === d)) gens.add(g)
  }

  // normal closure: conjugates of the generators by every element, then the closure
  const conj = new Set<number>()

  for (const x of gens) for (const g of members) conj.add(mul(mul(g, x), inv(g)))

  const kernel = closure(table, [...conj])

  if (!kernel.every(x => inGroup.has(x))) throw new Error('phase kernel left the group')

  return kernel
}

export type ShareCensus = { pairs: number; subgroups: number; below: number; belowForcing: number; shares: Record<string, number> }

// Over every subgroup generated by two elements of W(F4) (each once): the count of subgroups by the smallest line orbit
// of their phase kernel, and, among those whose smallest orbit is below `below`, how many force the husk scalars
// through k^4 (the bound `below` holds for two-generated forcing groups exactly when that count is 0)
export function lineShareCensus(table: GroupTable, coins: CoinData, below: number): ShareCensus {
  const n = table.permutations.length
  const seen = new Set<string>()
  const shares: Record<string, number> = {}
  let subgroups = 0
  let belowCount = 0
  let belowForcing = 0
  let pairs = 0

  for (let a = 0; a < n; a++) {
    for (let b = a; b < n; b++) {
      pairs++

      const group = closure(table, [a, b])
      const key = group.join(',')

      if (seen.has(key)) continue

      seen.add(key)
      subgroups++

      const kernel = phaseKernel(table, group, [a, b])
      const share = Math.min(...lineOrbits(coins, kernel).map(o => o.length))

      shares[String(share)] = (shares[String(share)] ?? 0) + 1

      if (share >= below) continue

      belowCount++
      belowForcing += huskForcing(coins, group).husk4 ? 1 : 0
    }
  }

  return { pairs, subgroups, below: belowCount, belowForcing, shares }
}
