// FUSED MOVERS (E-SPN-0125, X-cube fusion). Readings for the question of
// note/project/vibe/roadmap/research/remaining-pieces.md, "Six angles on 3d motion", angle 2: in the X-cube model lineons
// along x and y fuse into one that moves along z, because their creation operators compose. The {3,4,3,4} mesh's 12
// line classes come from the D4 roots, and roots add to roots, so could a set of singles at one dock act, under the
// bounce K = w_P, like one excitation on the line a + b (or another line), and translate along a line none of them
// started on?
//
// THREE READINGS, each exact.
//  1. THE DOCK CENSUS (`fusionCensus`). K on every dock of m singles on distinct lines plus any set of full lines
//     among the others (the domain of E-SPN-0119's recruitCensus): does K send a line's two slots to one line (is it
//     LINE-PRESERVING), does it keep the number of single lines, does it ever put two singles on one line (a FUSION),
//     and does a single ever land on the line of the sum of two firing singles' roots (the X-cube channel)?
//  2. THE STAND-IN SEARCH (`hubSearch`, `lineClosure`). n loves on lines through a hub X with no vacuum, as
//     code/measure/bounce-mover holds them: (line class l, signed position s along the line's first root, slot j).
//     Every coin history (each single keeps or crosses to its line's other slot, every beat), the contact at X (any
//     `DockContact`, the committed table's or a planted one), the stream. Every reached state is read, and a
//     TRANSLATION is a pair of reached states S, S' = S + v with v != 0 in the 4d lattice (read from the vibes' 4d
//     docks, not from the line bookkeeping) and a history from S to S'. `lineClosure` is the quotient of the same
//     search on line classes alone, at every depth: which multisets of line classes the composite can hold.
//  3. THE RULE WITH ITS VACUUM (`vacuumFusionRun`). The working knit's own beat (hub-star's `starBeat`: keyed coin,
//     keyed meeting, the collision with veto 'none', the stream) on a start of loves placed on the vacuum, beside the
//     vacuum's run, reading the difference D_t from the vacuum at every beat: how many mesh lines carry it (the
//     minimum over beats), how many readings fall off the star of X, and every pair of beats t1 < t2 with
//     D_t2 = D_t1 + v, v != 0 a box translation (a TRANSLATION EVENT), and whether D_t1 then lay on a mesh line the
//     start did not occupy (a FUSED translation).
//
// THE THEOREM these read (derived in test/experiment/spin/fused-mover). A translation needs its difference on ONE
// mesh line through X, because the star theorem keeps it on the star and a translate of a vibe on a line of class l
// lies on the star only if v is along r_l. And the difference never collapses onto one line: K = w_P is a linear
// isometry of the roots, so it maps a line's two slots onto one line and single lines onto single lines, one to one;
// every other piece acts line by line with the same bijection in the run as in the vacuum. So right after a firing
// (or at the start) two or more lines through X hold a single, which the vacuum never holds, and a line that differs
// from the vacuum at one beat differs at every later beat until K fires again, and K fires only with two or more
// singles at X. So every beat has at least two differing lines, and no fused mover exists at any period.
//
// DETERMINISM: no random numbers; the key is integer arithmetic on (beat, dock, line), and every start is placed.
// NOTHING MOVES: every piece hands a value to a slot, and the stream takes it one dock along.

import {
  bouncePermutation,
  BOUNCE_TABLE,
  type CollisionKind,
} from '@/code/rule/bounce-pair-knit'
import {
  cloneConfiguration,
  type Configuration,
  type LockedTables,
} from '@/code/rule/doublet-locked-knit'
import {
  LINE_FIRSTS,
  LINE_OF,
  OPPOSITE,
} from '@/code/rule/isometric-knit'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  type MeshLines,
  type PathKey,
} from '@/code/measure/full-key-paths'
import { storeLine } from '@/code/measure/planon-lines'
import {
  starBeat,
  starLines,
  type KEvent,
} from '@/code/measure/hub-star'
import { d4BoxCoordinates } from '@/code/substrate/d4-box-integer'

const ROOTS: readonly (readonly number[])[] = rootsD4()

// the slot of a root, or -1 if the vector is not a root
export const slotOfRoot = (r: readonly number[]): number =>
  ROOTS.findIndex(o => o.every((x, k) => x === r[k]))

// a contact on one dock's occupation (vibe[0..23]): writes the slot permutation into `out` (out[d] is where slot d
// goes) and returns 0 for the identity
export type DockContact = (vibe: Int8Array, out: Int32Array) => number

export const committedContact =
  (kind: CollisionKind): DockContact =>
  (vibe, out) =>
    bouncePermutation(BOUNCE_TABLE, kind, vibe, 0, out)

// a PLANTED contact (the positive control): on a dock holding exactly singles on slots a and b and nothing else it
// sends a to c and b to the slot opposite c (both onto c's line, a fusion no line-preserving map can make), c to a
// and the slot opposite c to b; every other occupation gets `base`
export function plantedContact(
  base: DockContact,
  a: number,
  b: number,
  c: number,
): DockContact {
  const oc = OPPOSITE[c]!

  return (vibe, out) => {
    let held = 0

    for (let d = 0; d < 24; d++) {
      if (vibe[d] !== 0) {
        held++
      }
    }

    if (held !== 2 || vibe[a] === 0 || vibe[b] === 0) {
      return base(vibe, out)
    }

    for (let d = 0; d < 24; d++) {
      out[d] = d
    }

    out[a] = c
    out[b] = oc
    out[c] = a
    out[oc] = b

    return 1
  }
}

// ---- 1. the dock census ----

export type FusionCensus = {
  docks: number
  fires: number
  // firing docks where some line's two slots go to two different lines
  splitLines: number
  // firing docks where the number of single lines changes
  singleCountChanged: number
  // firing docks where two singles land on one line
  fused: number
  // pairs of firing singles whose roots sum to a root, and firing docks where a single lands on such a sum's line
  sumPairs: number
  sumLanded: number
  // firing docks where a single lands on a line no single held before (with or without full lines)
  singleNewLine: number
}

// every dock of m singles (loves) on m distinct lines and any set of full lines (a love and a fear) among the rest
export function fusionCensus(
  m: number,
  contact: DockContact,
): FusionCensus {
  const out: FusionCensus = {
    docks: 0,
    fires: 0,
    splitLines: 0,
    singleCountChanged: 0,
    fused: 0,
    sumPairs: 0,
    sumLanded: 0,
    singleNewLine: 0,
  }
  const vibe = new Int8Array(24)
  const perm = new Int32Array(24)

  const pick = (from: number, acc: number[]): void => {
    if (acc.length === m) {
      const own = acc.map(d => LINE_OF[d]!)

      if (new Set(own).size < m) {
        return
      }

      const others = Array.from({ length: 12 }, (_, l) => l).filter(
        l => !own.includes(l),
      )
      const sums: number[] = []

      for (let i = 0; i < m; i++) {
        for (let k = i + 1; k < m; k++) {
          const s = slotOfRoot(
            (ROOTS[acc[i]!] as number[]).map(
              (x, c) => x + (ROOTS[acc[k]!] as number[])[c]!,
            ),
          )

          if (s >= 0) {
            sums.push(LINE_OF[s]!)
          }
        }
      }

      for (let mask = 0; mask < 1 << others.length; mask++) {
        vibe.fill(0)

        for (const d of acc) {
          vibe[d] = 1
        }

        others.forEach((l, i) => {
          if (((mask >> i) & 1) === 0) {
            return
          }

          vibe[LINE_FIRSTS[l]!] = 1
          vibe[OPPOSITE[LINE_FIRSTS[l]!]!] = -1
        })
        out.docks++

        if (contact(vibe, perm) === 0) {
          continue
        }

        out.fires++
        out.sumPairs += sums.length

        let split = false

        for (let l = 0; l < 12; l++) {
          if (
            LINE_OF[perm[LINE_FIRSTS[l]!]!] !==
            LINE_OF[perm[OPPOSITE[LINE_FIRSTS[l]!]!]!]
          ) {
            split = true
          }
        }

        if (split) {
          out.splitLines++
        }

        const after = new Int8Array(24)

        for (let d = 0; d < 24; d++) {
          after[perm[d]!] = vibe[d]!
        }

        let singles = 0

        for (let l = 0; l < 12; l++) {
          if (
            (after[LINE_FIRSTS[l]!] !== 0) !==
            (after[OPPOSITE[LINE_FIRSTS[l]!]!] !== 0)
          ) {
            singles++
          }
        }

        if (singles !== m) {
          out.singleCountChanged++
        }

        const images = acc.map(d => LINE_OF[perm[d]!]!)

        if (new Set(images).size < m) {
          out.fused++
        }

        if (images.some(l => sums.includes(l))) {
          out.sumLanded++
        }

        if (images.some(l => !own.includes(l))) {
          out.singleNewLine++
        }
      }

      return
    }

    for (let d = from; d < 24; d++) {
      pick(d + 1, [...acc, d])
    }
  }

  pick(0, [])

  return out
}

// every unordered set of m slots on m distinct lines of one dock
export function singleSets(m: number): number[][] {
  const out: number[][] = []

  const pick = (from: number, acc: number[]): void => {
    if (acc.length === m) {
      if (new Set(acc.map(d => LINE_OF[d])).size === m) {
        out.push(acc)
      }

      return
    }

    for (let d = from; d < 24; d++) {
      pick(d + 1, [...acc, d])
    }
  }

  pick(0, [])

  return out
}

// ---- 2. the stand-in search ----

// a body: line class l, signed position s (dock X + s r_l, r_l the line's first root), slot j (0 the first root,
// streaming to s + 1; 1 the opposite, to s - 1). Loves only: the contact reads the occupation, and a like full line's
// pass or turn never changes which line a vibe is on.
export type Body = { l: number; s: number; j: number }

const POS = 64
const CODE = 12 * (2 * POS + 1) * 2

const encode = (b: Body): number =>
  (b.l * (2 * POS + 1) + (b.s + POS)) * 2 + b.j
const decodeBody = (c: number): Body => ({
  l: Math.floor(Math.floor(c / 2) / (2 * POS + 1)),
  s: (Math.floor(c / 2) % (2 * POS + 1)) - POS,
  j: c % 2,
})

export const stateKey = (bodies: readonly Body[]): number =>
  bodies
    .map(encode)
    .sort((a, b) => a - b)
    .reduce((k, c) => k * CODE + c, 0)

export function stateBodies(key: number, n: number): Body[] {
  const out: Body[] = []

  let k = key

  for (let i = 0; i < n; i++) {
    out.push(decodeBody(k % CODE))
    k = Math.floor(k / CODE)
  }

  return out.reverse()
}

export const bodySlot = (b: Body): number =>
  b.j === 0 ? LINE_FIRSTS[b.l]! : OPPOSITE[LINE_FIRSTS[b.l]!]!

const VIBE = new Int8Array(24)
const PERM = new Int32Array(24)

// one beat of the stand-in on one coin mask: the coin (a body alone on its line at its dock crosses to the line's
// other slot where the mask's bit is set; a body sharing its line and dock cannot, as in keyedCoin), the contact at
// X on the bodies at s = 0, the stream. Returns the next bodies, or undefined when the mask sets the bit of a body
// that cannot cross (that history is the same as the one with the bit clear).
export function hubStep(
  bodies: readonly Body[],
  mask: number,
  contact: DockContact,
): Body[] | undefined {
  const coined: Body[] = []

  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i]!
    const flip = ((mask >> i) & 1) === 1

    if (
      flip &&
      bodies.some((o, k) => k !== i && o.l === b.l && o.s === b.s)
    ) {
      return undefined
    }

    coined.push({ l: b.l, s: b.s, j: flip ? 1 - b.j : b.j })
  }

  VIBE.fill(0)

  const at = coined.map((b, i) => ({ b, i })).filter(t => t.b.s === 0)

  for (const t of at) {
    VIBE[bodySlot(t.b)] = 1
  }

  if (at.length > 0 && contact(VIBE, PERM) !== 0) {
    for (const t of at) {
      const d = PERM[bodySlot(t.b)]!
      const l = LINE_OF[d]!

      coined[t.i] = { l, s: 0, j: d === LINE_FIRSTS[l] ? 0 : 1 }
    }
  }

  return coined.map(b => ({
    l: b.l,
    s: b.s + (b.j === 0 ? 1 : -1),
    j: b.j,
  }))
}

// the vibe's 4d dock, X at the origin: s times the line's first root
const dockOf = (b: Body): number[] =>
  (ROOTS[LINE_FIRSTS[b.l]!] as number[]).map(x => x * b.s)

// a translation-invariant key: the bodies' (line, slot, 4d dock) sorted (lexicographic order on docks is kept by a
// translation), every dock taken relative to the first
const lexicographic = (
  a: readonly number[],
  b: readonly number[],
): number => {
  for (let k = 0; k < a.length; k++) {
    if (a[k] !== b[k]) {
      return a[k]! - b[k]!
    }
  }

  return 0
}

export function translationKey(bodies: readonly Body[]): string {
  const e = bodies
    .map(b => ({ l: b.l, j: b.j, p: dockOf(b) }))
    .sort((a, b) => a.l - b.l || a.j - b.j || lexicographic(a.p, b.p))
  const o = (e[0] as { p: number[] }).p

  return e
    .map(x => `${x.l}.${x.j}.${x.p.map((v, k) => v - o[k]!).join(',')}`)
    .join('|')
}

export type HubSearch = {
  // distinct states over all beats (a state first seen at two beats counts once), and state-beat pairs
  states: number
  visits: number
  // the fewest distinct line classes any reached state holds, and the states holding exactly one
  minClasses: number
  oneClass: number
  // the line-class sets reached (sorted classes, joined), for the closure check
  classSets: Set<string>
  // pairs of distinct reached states that are translates (same translation key), and those with a history between them
  translatePairs: number
  translations: number
  // translations whose line class is not among the start's
  fused: number
  // one fused translation, for the record: the class, the lattice step, the period in beats
  example?: { l: number; step: number[]; period: number }
}

// every coin history of `beats` beats from loves on `slots` at X, exactly (states merged each beat)
export function hubSearch(
  slots: readonly number[],
  contact: DockContact,
  beats: number,
): HubSearch {
  const n = slots.length
  const start: Body[] = slots.map(d => ({
    l: LINE_OF[d]!,
    s: 0,
    j: d === LINE_FIRSTS[LINE_OF[d]!] ? 0 : 1,
  }))
  const startClasses = new Set(start.map(b => b.l))
  const seen = new Map<number, number>()

  let frontier = new Set<number>([stateKey(start)])
  let visits = 0

  seen.set(stateKey(start), 0)

  for (let t = 1; t <= beats; t++) {
    const next = new Set<number>()

    for (const key of frontier) {
      const bodies = stateBodies(key, n)

      for (let mask = 0; mask < 1 << n; mask++) {
        const moved = hubStep(bodies, mask, contact)

        if (moved) {
          next.add(stateKey(moved))
        }
      }
    }

    frontier = next
    visits += next.size

    for (const k of next) {
      if (!seen.has(k)) {
        seen.set(k, t)
      }
    }
  }

  const classSets = new Set<string>()

  let minClasses = 12
  let oneClass = 0

  const groups = new Map<string, number[]>()

  for (const key of seen.keys()) {
    const bodies = stateBodies(key, n)
    const classes = [...new Set(bodies.map(b => b.l))].sort(
      (a, b) => a - b,
    )

    classSets.add(
      bodies
        .map(b => b.l)
        .sort((a, b) => a - b)
        .join(','),
    )
    minClasses = Math.min(minClasses, classes.length)

    if (classes.length === 1) {
      oneClass++
    }

    const tk = translationKey(bodies)
    const g = groups.get(tk)

    if (g) {
      g.push(key)
    } else {
      groups.set(tk, [key])
    }
  }

  let translatePairs = 0
  let translations = 0
  let fused = 0
  let example: HubSearch['example']

  for (const members of groups.values()) {
    if (members.length < 2) {
      continue
    }

    for (let i = 0; i < members.length; i++) {
      for (let k = 0; k < members.length; k++) {
        if (i === k) {
          continue
        }

        translatePairs++

        const from = members[i]!
        const to = members[k]!
        const period = historyLength(from, to, n, contact, beats)

        if (period < 0) {
          continue
        }

        translations++

        const a = stateBodies(from, n)
        const b = stateBodies(to, n)

        if (a.some(x => startClasses.has(x.l))) {
          continue
        }

        fused++

        const pa = a.map(dockOf).sort(lexicographic)
        const pb = b.map(dockOf).sort(lexicographic)

        example ??= {
          l: a[0]!.l,
          step: pb[0]!.map((x, c) => x - pa[0]![c]!),
          period,
        }
      }
    }
  }

  return {
    states: seen.size,
    visits,
    minClasses,
    oneClass,
    classSets,
    translatePairs: translatePairs / 2,
    translations,
    fused,
    example,
  }
}

// the fewest beats (1..beats) of some coin history from state `from` to state `to`, or -1
export function historyLength(
  from: number,
  to: number,
  n: number,
  contact: DockContact,
  beats: number,
): number {
  let frontier = new Set<number>([from])

  for (let t = 1; t <= beats; t++) {
    const next = new Set<number>()

    for (const key of frontier) {
      const bodies = stateBodies(key, n)

      for (let mask = 0; mask < 1 << n; mask++) {
        const moved = hubStep(bodies, mask, contact)

        if (moved?.every(b => Math.abs(b.s) <= POS)) {
          next.add(stateKey(moved))
        }
      }
    }

    if (next.has(to)) {
      return t
    }

    frontier = next
  }

  return -1
}

// THE CLOSURE on line classes, at every depth. A node is the multiset of the composite's line classes. With no
// vacuum, K fires only at X (two lines through X share no other dock), and any subset of the composite can meet at X
// on any slots while the rest are away (a body moves one dock a beat and can turn back where it is alone on its line,
// so it can be at X, or two docks out, at any beat of X's parity). So an edge is: pick a subset of two or more at X,
// a slot for each (two on one class hold its two slots), apply the contact.
export function lineClosure(
  slots: readonly number[],
  contact: DockContact,
): {
  nodes: Set<string>
  minClasses: number
  oneClass: number
  newClassOnly: number
} {
  const start = slots.map(d => LINE_OF[d]!).sort((a, b) => a - b)
  const startSet = new Set(start)
  const key = (ls: readonly number[]): string =>
    ls
      .slice()
      .sort((a, b) => a - b)
      .join(',')
  const nodes = new Set<string>([key(start)])
  const queue: number[][] = [start]
  const vibe = new Int8Array(24)
  const perm = new Int32Array(24)

  while (queue.length > 0) {
    const ls = queue.shift()!
    const n = ls.length

    for (let sub = 0; sub < 1 << n; sub++) {
      const members = ls
        .map((_, i) => i)
        .filter(i => ((sub >> i) & 1) === 1)

      if (members.length < 2) {
        continue
      }

      const count = new Map<number, number>()

      for (const i of members) {
        count.set(ls[i]!, (count.get(ls[i]!) ?? 0) + 1)
      }

      if ([...count.values()].some(c => c > 2)) {
        continue
      }

      const free = members.filter(i => count.get(ls[i]!) === 1)

      for (let js = 0; js < 1 << free.length; js++) {
        const slotOf = new Map<number, number>()
        const used = new Map<number, number>()

        for (const i of members) {
          const l = ls[i]!
          const f = LINE_FIRSTS[l]!

          if (count.get(l) === 2) {
            const k = used.get(l) ?? 0

            slotOf.set(i, k === 0 ? f : OPPOSITE[f]!)
            used.set(l, k + 1)
          } else {
            slotOf.set(
              i,
              ((js >> free.indexOf(i)) & 1) === 1 ? OPPOSITE[f]! : f,
            )
          }
        }

        vibe.fill(0)

        for (const i of members) {
          vibe[slotOf.get(i)!] = 1
        }

        if (contact(vibe, perm) === 0) {
          continue
        }

        const next = ls.slice()

        for (const i of members) {
          next[i] = LINE_OF[perm[slotOf.get(i)!]!]!
        }

        const k = key(next)

        if (!nodes.has(k)) {
          nodes.add(k)
          queue.push(next)
        }
      }
    }
  }

  let minClasses = 12
  let oneClass = 0
  let newClassOnly = 0

  for (const k of nodes) {
    const classes = new Set(k.split(',').map(Number))

    minClasses = Math.min(minClasses, classes.size)

    if (classes.size === 1) {
      oneClass++

      if (![...classes].some(l => startSet.has(l))) {
        newClassOnly++
      }
    }
  }

  return { nodes, minClasses, oneClass, newClassOnly }
}

// ---- 3. the rule with its vacuum ----

// the vacuum's run: the configuration after each beat 1..beats, and its K firings (condition Z says none)
export function vacuumPath(
  tables: LockedTables,
  vacuum: Configuration,
  key: PathKey,
  threshold: number,
  beats: number,
): { path: Configuration[]; events: number } {
  let a = cloneConfiguration(vacuum)
  let b = cloneConfiguration(vacuum)

  const events: KEvent[] = []
  const path: Configuration[] = []

  for (let t = 0; t < beats; t++) {
    starBeat(tables, a, b, key, threshold, t, events)
    ;[a, b] = [b, a]
    path.push(cloneConfiguration(a))
  }

  return { path, events: events.length }
}

export type FusionRun = {
  // the fewest mesh lines differing from the vacuum at any beat, and at the last beat
  minLines: number
  maxLines: number
  lastLines: number
  // beats at which some differing mesh line is not one the start occupied
  offStart: number
  // readings off the star of X, summed over beats; K firings, and those off X
  offStar: number
  events: number
  offHub: number
  // pairs of beats t1 < t2 with D_t2 = D_t1 + v, v != 0 a box translation; those where D_t1 lay on lines the start
  // did not occupy (fused); the fewest beats between such a pair
  translations: number
  fused: number
  shortest: number
  // pairs of beats with D_t2 = D_t1 exactly (a recurrence, v = 0)
  recurrences: number
}

const sameSlot = (
  p: Configuration,
  q: Configuration,
  i: number,
): boolean =>
  p.vibe[i] === q.vibe[i] &&
  (p.vibe[i] === 0 ||
    (p.point[i] === q.point[i] && p.open[i] === q.open[i]))
const sameStore = (
  p: Configuration,
  q: Configuration,
  s: number,
): boolean =>
  p.store[s] === q.store[s] &&
  (p.store[s] === 0 ||
    (p.spoint[s] === q.spoint[s] && p.sopen[s] === q.sopen[s]))

// the difference from the vacuum as entries (label, box coordinates), its canonical translation-invariant key (the
// least over anchors of the entries relative to an anchor, mod side) and its absolute key
export function differenceKeys(
  run: Configuration,
  vac: Configuration,
  coords: readonly (readonly number[])[],
  side: number,
): {
  canonical: string
  absolute: string
  size: number
  slots: number[]
  stores: number[]
} {
  const labels: number[] = []
  const docks: number[] = []
  const slots: number[] = []
  const stores: number[] = []

  for (let i = 0; i < run.vibe.length; i++) {
    if (sameSlot(run, vac, i)) {
      continue
    }

    slots.push(i)
    labels.push(
      (((i % 24) * 3 + (run.vibe[i]! + 1)) * 256 +
        (run.point[i]! + 128)) *
        4 +
        run.open[i]!,
    )
    docks.push(Math.floor(i / 24))
  }

  for (let s = 0; s < run.store.length; s++) {
    if (sameStore(run, vac, s)) {
      continue
    }

    stores.push(s)
    labels.push(
      (((24 + (s % 12)) * 3 + (run.store[s]! + 1)) * 256 +
        (run.spoint[s]! + 128)) *
        4 +
        run.sopen[s]!,
    )
    docks.push(Math.floor(s / 12))
  }

  const cells = side ** 4
  const pack = (c: readonly number[]): number =>
    c.reduce(
      (acc, x, k) => acc + (((x % side) + side) % side) * side ** k,
      0,
    )
  const absolute = labels
    .map((l, i) => l * cells + pack(coords[docks[i]!] as number[]))
    .sort((a, b) => a - b)

  let canonical = ''

  if (labels.length > 0) {
    const least = Math.min(...labels)

    for (let i = 0; i < labels.length; i++) {
      if (labels[i] !== least) {
        continue
      }

      const o = coords[docks[i]!] as number[]
      const rel = labels
        .map(
          (l, k) =>
            l * cells +
            pack(
              (coords[docks[k]!] as number[]).map((x, c) => x - o[c]!),
            ),
        )
        .sort((a, b) => a - b)
        .join(',')

      if (canonical === '' || rel < canonical) {
        canonical = rel
      }
    }
  }

  return {
    canonical,
    absolute: absolute.join(','),
    size: labels.length,
    slots,
    stores,
  }
}

// the run of `start` beside the vacuum's path, read every beat
export function vacuumFusionRun(input: {
  tables: LockedTables
  path: readonly Configuration[]
  start: Configuration
  lines: MeshLines
  hub: number
  key: PathKey
  threshold: number
  side: number
  coords: readonly (readonly number[])[]
  startLines: ReadonlySet<number>
}): FusionRun {
  const {
    tables,
    path,
    start,
    lines,
    hub,
    key,
    threshold,
    side,
    coords,
    startLines,
  } = input
  const inStar = starLines(lines, [hub])

  let a = cloneConfiguration(start)
  let b = cloneConfiguration(start)

  const events: KEvent[] = []
  const out: FusionRun = {
    minLines: Number.POSITIVE_INFINITY,
    maxLines: 0,
    lastLines: 0,
    offStart: 0,
    offStar: 0,
    events: 0,
    offHub: 0,
    translations: 0,
    fused: 0,
    shortest: -1,
    recurrences: 0,
  }
  const history: {
    canonical: string
    absolute: string
    newOnly: boolean
    t: number
  }[] = []

  for (let t = 0; t < path.length; t++) {
    starBeat(tables, a, b, key, threshold, t, events)
    ;[a, b] = [b, a]

    const vac = path[t]!
    const d = differenceKeys(a, vac, coords, side)
    const held = new Set<number>()

    for (const i of d.slots) {
      held.add(lines.lineOf[i]!)
    }

    for (const s of d.stores) {
      held.add(storeLine(lines, s))
    }

    for (const L of held) {
      if (!inStar[L]) {
        out.offStar++
      }
    }

    out.minLines = Math.min(out.minLines, held.size)
    out.maxLines = Math.max(out.maxLines, held.size)
    out.lastLines = held.size

    if ([...held].some(L => !startLines.has(L))) {
      out.offStart++
    }

    const newOnly =
      held.size > 0 && [...held].every(L => !startLines.has(L))

    for (const h of history) {
      if (h.canonical !== d.canonical) {
        continue
      }

      if (h.absolute === d.absolute) {
        out.recurrences++
        continue
      }

      out.translations++

      if (h.newOnly) {
        out.fused++
      }

      if (out.shortest < 0 || t - h.t < out.shortest) {
        out.shortest = t - h.t
      }
    }

    history.push({
      canonical: d.canonical,
      absolute: d.absolute,
      newOnly,
      t,
    })
  }

  out.events = events.length
  out.offHub = events.filter(e => e.dock !== hub).length

  return out
}

// every dock's box coordinates
export const boxCoordinates = (
  cells: number,
  side: number,
): number[][] =>
  Array.from({ length: cells }, (_, x) =>
    d4BoxCoordinates({ cell: x, side }),
  )
