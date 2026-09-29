// THE SUM OVER TAKE HISTORIES of the working rule, enumerated one history at a time (E-QTM-0158). MEASUREMENT code:
// exact Eisenstein integers over 2^T, no float in the sums.
//
// A history is one choice at every splitting the rule makes: for a lone open vibe on its line, keep (1 + w)/2 or
// cross (1 - w)/2 (the coin); for a line of two open like vibes, the coin's determinant w and then keep (1 + w)/2 or
// exchange -(1 - w)/2 of their points (the meeting), or the phase w when their points agree. Between splittings the
// history is fixed: the stream takes each slot's value one dock along (tables.target), and the link's grid move carries
// the point (tables.move). The history's amplitude is the product of its choices. This file enumerates every history
// explicitly, by depth-first search, and sums the amplitudes per final configuration, WITHOUT calling the rule's beat.
// The rule's own state (code/rule/coined-locked-knit coinedVetoBeat) is then compared term for term: equal means the
// rule's amplitude IS the sum over histories, with nothing else in it.
//
// Scope: loves only, on the empty box (no stored pair, so the pair move and the store never act), one or two of them;
// the pass contact keeps a full like line's slots, so the collision moves nothing here (checked, not assumed: a
// mismatch with the rule would show it).
//
// NOTHING MOVES: a history is a sequence of takes; the enumeration only reads the rule's tables.

import { OPPOSITE, LINE_OF } from '@/code/rule/isometric-knit'
import { type LockedState, type LockedTables } from '@/code/rule/doublet-locked-knit'

// numerators over 2 of the choices, and the exact phase w
const KEEP: [bigint, bigint] = [1n, 1n]
const CROSS: [bigint, bigint] = [1n, -1n]
const EXCHANGE: [bigint, bigint] = [-1n, 1n]
const OMEGA: [bigint, bigint] = [0n, 1n]
const TWO: [bigint, bigint] = [2n, 0n]

const mulE = (p: [bigint, bigint], q: [bigint, bigint]): [bigint, bigint] => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0] - p[1] * q[1]]

// a vibe of a history: its slot and point
export type Vibe = { slot: number; point: number }

// the per-configuration sums: key -> [numerator (over 2^T), history count]
export type HistorySum = Map<string, { amp: [bigint, bigint]; histories: number }>

export const keyOf = (vibes: readonly Vibe[]): string =>
  [...vibes]
    .map(v => `${v.slot}:${v.point}`)
    .sort()
    .join(' ')

// the configuration key of a rule branch (every vibe's slot and point)
export function branchKey(b: { vibe: Int8Array; point: Int8Array }): string {
  const out: Vibe[] = []

  for (let i = 0; i < b.vibe.length; i++) if (b.vibe[i] !== 0) out.push({ slot: i, point: b.point[i] as number })

  return keyOf(out)
}

// one beat of one history's configuration: every choice this beat, each with its numerator over 2 (the phase w counts
// as 2 w / 2, so every beat scales every history by exactly 1/2)
function choices(t: LockedTables, vibes: readonly Vibe[], meet = true): { next: Vibe[]; amp: [bigint, bigint] }[] {
  // group the vibes by line: dock * 12 + line
  const lines = new Map<number, number[]>()

  vibes.forEach((v, n) => {
    const id = Math.floor(v.slot / 24) * 12 + (LINE_OF[v.slot % 24] as number)
    const list = lines.get(id)

    if (list) list.push(n)
    else lines.set(id, [n])
  })

  let out: { next: Vibe[]; amp: [bigint, bigint] }[] = [{ next: vibes.map(v => ({ ...v })), amp: [1n, 0n] }]

  for (const members of lines.values()) {
    const grown: typeof out = []

    for (const h of out) {
      if (members.length === 1) {
        const n = members[0] as number
        const v = h.next[n] as Vibe
        const dock = Math.floor(v.slot / 24)
        const crossed = dock * 24 + (OPPOSITE[v.slot % 24] as number)
        const keep = h.next.map(u => ({ ...u }))
        const cross = h.next.map(u => ({ ...u }))

        cross[n] = { slot: crossed, point: v.point }
        grown.push({ next: keep, amp: mulE(h.amp, KEEP) })
        grown.push({ next: cross, amp: mulE(h.amp, CROSS) })
      } else if (members.length === 2) {
        // the coin's determinant w, then the meeting
        const [i, j] = members as [number, number]
        const pi = (h.next[i] as Vibe).point
        const pj = (h.next[j] as Vibe).point
        const det = mulE(h.amp, OMEGA)

        if (pi === pj || !meet) {
          // the phase w, written 2 w over 2 so the beat's scale stays 1/2 per line
          grown.push({ next: h.next.map(u => ({ ...u })), amp: mulE(det, mulE(OMEGA, TWO)) })
        } else {
          const keep = h.next.map(u => ({ ...u }))
          const swap = h.next.map(u => ({ ...u }))

          swap[i] = { slot: (h.next[i] as Vibe).slot, point: pj }
          swap[j] = { slot: (h.next[j] as Vibe).slot, point: pi }
          grown.push({ next: keep, amp: mulE(det, KEEP) })
          grown.push({ next: swap, amp: mulE(det, EXCHANGE) })
        }
      } else throw new Error('history-sum: a line holds more than two vibes')
    }

    out = grown
  }

  // the stream: each slot's value taken one dock along, its point moved by the link
  for (const h of out) h.next = h.next.map(v => ({ slot: t.target[v.slot] as number, point: t.move[v.slot * 9 + v.point] as number }))

  return out
}

// every history of `beats` beats from a start, summed per final configuration; the scale is the number of lines split
// per beat, so each history's numerator is over 2^(lines split): returned with the exponent of 2 carried per history.
// `meet` false leaves out the meeting (a line of two keeps its points with the phase w only): a control that must NOT
// match the rule once two vibes with unequal points share a line
export function enumerateHistories(t: LockedTables, start: readonly Vibe[], beats: number, meet = true): { sum: HistorySum; histories: number; exponent: number } {
  // every beat divides by 2 once per occupied line; with a fixed number of vibes the count of occupied lines can vary
  // (two vibes on one line against two lines), so each history carries its own exponent and the sums are brought to the
  // largest
  type Path = { vibes: Vibe[]; amp: [bigint, bigint]; e: number }
  const finals: Path[] = []

  const walk = (p: Path, left: number): void => {
    if (left === 0) {
      finals.push(p)
      return
    }

    const lines = new Set(p.vibes.map(v => Math.floor(v.slot / 24) * 12 + (LINE_OF[v.slot % 24] as number))).size

    for (const c of choices(t, p.vibes, meet)) walk({ vibes: c.next, amp: mulE(p.amp, c.amp), e: p.e + lines }, left - 1)
  }

  walk({ vibes: start.map(v => ({ ...v })), amp: [1n, 0n], e: 0 }, beats)

  const exponent = Math.max(0, ...finals.map(p => p.e))
  const sum: HistorySum = new Map()

  for (const p of finals) {
    const scale = 1n << BigInt(exponent - p.e)
    const k = keyOf(p.vibes)
    const o = sum.get(k)
    const a: [bigint, bigint] = [p.amp[0] * scale, p.amp[1] * scale]

    if (o) {
      o.amp = [o.amp[0] + a[0], o.amp[1] + a[1]]
      o.histories++
    } else sum.set(k, { amp: a, histories: 1 })
  }

  return { sum, histories: finals.length, exponent }
}

// the rule's state against the history sum, term for term: every nonzero sum is a branch with that amplitude, and every
// branch is a nonzero sum. Returns the number of mismatched terms (0 when the rule is the sum over histories)
export function compareWithRule(s: LockedState, h: { sum: HistorySum; exponent: number }): { mismatches: number; branches: number; nonzero: number } {
  const seen = new Set<string>()
  let mismatches = 0

  for (const b of s.branches) {
    const k = branchKey(b)
    const o = h.sum.get(k)

    seen.add(k)

    if (!o || b.k > h.exponent) {
      mismatches++
      continue
    }

    const scale = 1n << BigInt(h.exponent - b.k)

    if (b.a * scale !== o.amp[0] || b.b * scale !== o.amp[1]) mismatches++
  }

  let nonzero = 0

  for (const [k, o] of h.sum) {
    if (o.amp[0] === 0n && o.amp[1] === 0n) continue
    nonzero++
    if (!seen.has(k)) mismatches++
  }

  return { mismatches, branches: s.branches.length, nonzero }
}

// the incoherent sum: sum over histories of |amplitude|^2 per final configuration, against |sum|^2 (both over 4^exponent);
// the L1 distance between the two distributions is the interference the sum carries (0 when no two histories share an
// end, or they never interfere)
export function coherenceL1(t: LockedTables, start: readonly Vibe[], beats: number): { l1: bigint; unit: bigint; shared: number } {
  type Path = { vibes: Vibe[]; amp: [bigint, bigint]; e: number }
  const finals: Path[] = []

  const walk = (p: Path, left: number): void => {
    if (left === 0) {
      finals.push(p)
      return
    }

    const lines = new Set(p.vibes.map(v => Math.floor(v.slot / 24) * 12 + (LINE_OF[v.slot % 24] as number))).size

    for (const c of choices(t, p.vibes)) walk({ vibes: c.next, amp: mulE(p.amp, c.amp), e: p.e + lines }, left - 1)
  }

  walk({ vibes: start.map(v => ({ ...v })), amp: [1n, 0n], e: 0 }, beats)

  const exponent = Math.max(0, ...finals.map(p => p.e))
  const coherent = new Map<string, [bigint, bigint]>()
  const incoherent = new Map<string, bigint>()
  const counts = new Map<string, number>()
  const n2 = (a: [bigint, bigint]): bigint => a[0] * a[0] - a[0] * a[1] + a[1] * a[1]

  for (const p of finals) {
    const scale = 1n << BigInt(exponent - p.e)
    const k = keyOf(p.vibes)
    const a: [bigint, bigint] = [p.amp[0] * scale, p.amp[1] * scale]
    const c = coherent.get(k) ?? [0n, 0n]

    coherent.set(k, [c[0] + a[0], c[1] + a[1]])
    incoherent.set(k, (incoherent.get(k) ?? 0n) + n2(a))
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }

  let l1 = 0n

  for (const [k, c] of coherent) {
    const x = n2(c) - (incoherent.get(k) as bigint)

    l1 += x < 0n ? -x : x
  }

  return { l1, unit: 1n << BigInt(2 * exponent), shared: [...counts.values()].filter(n => n > 1).length }
}

// each history class's share of its endpoint's amplitude (the weak value of "this history" between the start and that
// end): for every endpoint reached by two or more histories, grouped by the history's choice word, share = class
// amplitude / total. Returned as exact numerators (over the common scale) for the caller to divide
export function historyShares(t: LockedTables, start: readonly Vibe[], beats: number): { key: string; words: { word: string; amp: [bigint, bigint] }[]; total: [bigint, bigint] }[] {
  type Path = { vibes: Vibe[]; amp: [bigint, bigint]; word: string }
  const finals: Path[] = []

  const walk = (p: Path, left: number): void => {
    if (left === 0) {
      finals.push(p)
      return
    }

    // a lone vibe only: the choice word is k (keep) or x (cross) per beat
    for (const c of choices(t, p.vibes)) {
      const moved = c.amp[0] === KEEP[0] && c.amp[1] === KEEP[1] ? 'k' : 'x'

      walk({ vibes: c.next, amp: mulE(p.amp, c.amp), word: p.word + moved }, left - 1)
    }
  }

  if (start.length !== 1) throw new Error('history-sum: shares are read for one vibe')

  walk({ vibes: start.map(v => ({ ...v })), amp: [1n, 0n], word: '' }, beats)

  const groups = new Map<string, Path[]>()

  for (const p of finals) {
    const k = keyOf(p.vibes)
    const list = groups.get(k)

    if (list) list.push(p)
    else groups.set(k, [p])
  }

  const out: { key: string; words: { word: string; amp: [bigint, bigint] }[]; total: [bigint, bigint] }[] = []

  for (const [key, list] of groups) {
    if (list.length < 2) continue

    const total = list.reduce<[bigint, bigint]>((s, p) => [s[0] + p.amp[0], s[1] + p.amp[1]], [0n, 0n])

    out.push({ key, words: list.map(p => ({ word: p.word, amp: p.amp })), total })
  }

  return out
}
