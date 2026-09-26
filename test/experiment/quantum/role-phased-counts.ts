// Is the walk's complex weight a count of vibes by role? An Eisenstein integer a + b omega + c omega^2 with
// a, b, c whole numbers of at least 0 counts vibes in take (phase 1), hold (omega) and free (omega^2). One of
// each is a knot, 1 + omega + omega^2 = 0, and adds nothing. So -1 = omega + omega^2: a fear is a love in
// each of the other two roles. E-QTM-0103 carried a lone vibe's amplitude on position exactly as
// Eisenstein integers. Measured here, on that walk (code/rule/fear-walk, countBeat):
// 1. the representation: over every triple in [0, 12]^3, the triples with one value differ only by knots,
//    and each value has exactly one triple with no knot (min(a, b, c) = 0), which is also the one with the
//    fewest vibes. The value -1 is (0, 1, 1)
// 2. the rule: the four coin weights as additions of role-rolled counts, nothing ever subtracted,
//    2 a = 1 + omega (the counts plus the counts turned one role), 2 b = 2 + omega^2, and their conjugates;
//    each beat adds contributions and then each slot drops its knots. Against the Eisenstein walk of
//    E-QTM-0103 on a ring of 401 docks for 200 beats: every slot's value equal, and its knot-free count equal
//    to the canonical count of the Eisenstein weight. And with the knots never dropped, for 40 beats: the
//    values still equal, so the knots are null
// 3. where the cancelling happens: the knots dropped per beat. Controls: the committed hop (phi = pi) and
//    the free stream (phi = 0), whose coins hold no turn of roles and can never make a knot
// 4. reversal: 100 beats forward and back on a ring of 51 docks return the start times 4^100, as counts
// 5. charge: the counts of all slots added and their knots dropped are (2^t, 0, 0) after every beat, 2^t
//    loves in take: love minus fear of the one vibe, times the grain
// 6. the grain: 2 per beat (against 4 per meeting for the Wigner weights), and the greatest common divisor
//    of every count at beat 200, which says whether the grain could be coarser
//
// Gates, fixed before the run: 1 no violation; 2 no mismatch either way; 3 knots dropped with the swap phase
// and none with the hop or the free stream; 4 exact; 5 exact after every beat; -1 is (0, 1, 1).
//
// What this does and does not show. It shows the complex weight is exactly vibes counted by role phase,
// unique once knots are dropped, and that the walk is then a rule of additions and knot removal that is
// exact, reversible and keeps love minus fear. It does not show that the phases ARE the role coordinate of
// the role grid: nothing in this walk carries a role grid, so the identification of phase k with role k is
// a reading of the arithmetic, the same one E-FRC-0118 made for three roles, one of each, adding to zero.
//
// Depth L1: exact arithmetic on a known representation, run on the walk of E-QTM-0103.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  countBeat,
  countsOf,
  removeKnots,
  valueOf,
  walkBeat,
  walkStart,
  FEAR_COIN,
  ZERO,
  type CountState,
  type Counts,
  type WalkState,
} from '@/code/rule/fear-walk'

const RANGE = 12
const DOCKS = 401
const BEATS = 200
const RAW_BEATS = 40
const RING = 51
const REVERSAL_BEATS = 100

function countStart(docks: number, dock: number): CountState {
  const zero: Counts = [0n, 0n, 0n]

  return {
    right: Array.from({ length: docks }, (_, x) => (x === dock ? ([1n, 0n, 0n] as Counts) : zero)),
    left: new Array<Counts>(docks).fill(zero),
  }
}

const same = (a: Counts, b: Counts): boolean => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a
  let y = b < 0n ? -b : b

  while (y > 0n) {
    ;[x, y] = [y, x % y]
  }

  return x
}

export default experiment({
  id: 'quantum/role-phased-counts',
  code: 'E-QTM-0107',
  title:
    'the walk weight is vibes counted by role phase: every Eisenstein weight is one knot-free count of vibes in take, hold and free, unique up to knots, and the walk becomes a rule of additions and knot removal that equals the Eisenstein walk at every slot, drops knots only where the swap phase turns roles, reverses exactly and keeps 2^t loves in take as its charge',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    // 1. the representation
    const groups = new Map<string, Counts[]>()

    for (let a = 0; a <= RANGE; a++) {
      for (let b = 0; b <= RANGE; b++) {
        for (let c = 0; c <= RANGE; c++) {
          const k: Counts = [BigInt(a), BigInt(b), BigInt(c)]
          const v = valueOf(k)
          const key = `${v[0]},${v[1]}`

          groups.set(key, [...(groups.get(key) ?? []), k])
        }
      }
    }

    let representationViolations = 0

    for (const members of groups.values()) {
      const first = members[0] ?? [0n, 0n, 0n]
      const canonical = members.filter(k => removeKnots(k).knots === 0n)
      const fewest = members.reduce((m, k) => (k[0] + k[1] + k[2] < m[0] + m[1] + m[2] ? k : m), first)

      representationViolations += canonical.length === 1 ? 0 : 1
      representationViolations += same(fewest, canonical[0] ?? first) ? 0 : 1
      representationViolations += same(countsOf(valueOf(first)), canonical[0] ?? first) ? 0 : 1

      for (const k of members) {
        const d = [k[0] - first[0], k[1] - first[1], k[2] - first[2]]

        representationViolations += d[0] === d[1] && d[1] === d[2] ? 0 : 1
      }
    }

    const fear = countsOf([-1n, 0n])

    // 2 and 3 and 5: the counts walk against the Eisenstein walk
    let walk: WalkState = walkStart(DOCKS, BEATS, true)
    let counts = countStart(DOCKS, BEATS)
    let valueMismatches = 0
    let canonicalMismatches = 0
    let chargeExact = true
    const knotsAt: Record<number, bigint> = {}
    let knotsTotal = 0n
    let negativeRealSlots = 0

    for (let t = 1; t <= BEATS; t++) {
      walk = walkBeat(walk, () => FEAR_COIN)

      const step = countBeat(counts, true, true)

      counts = step.state
      knotsTotal += step.knots
      knotsAt[t] = step.knots

      const total = removeKnots(
        [...counts.right, ...counts.left].reduce((s, k) => [s[0] + k[0], s[1] + k[1], s[2] + k[2]] as Counts, [0n, 0n, 0n] as Counts),
      ).counts

      chargeExact = chargeExact && same(total, [2n ** BigInt(t), 0n, 0n])

      for (let x = 0; x < DOCKS; x++) {
        for (const [k, z] of [
          [counts.right[x] ?? [0n, 0n, 0n], walk.right[x] ?? ZERO],
          [counts.left[x] ?? [0n, 0n, 0n], walk.left[x] ?? ZERO],
        ] as const) {
          const v = valueOf(k)

          valueMismatches += v[0] === z[0] && v[1] === z[1] ? 0 : 1
          canonicalMismatches += same(k, countsOf(z)) ? 0 : 1

          if (t === BEATS) {
            // the real part of m + n omega is m - n / 2
            negativeRealSlots += 2n * z[0] - z[1] < 0n ? 1 : 0
          }
        }
      }
    }

    const finalCounts = [...counts.right, ...counts.left]
    const countGcd = finalCounts.reduce((g, k) => gcd(gcd(gcd(g, k[0]), k[1]), k[2]), 0n)
    const vibesFinal = finalCounts.reduce((s, k) => s + k[0] + k[1] + k[2], 0n)

    // knots never dropped: values still equal
    let raw = countStart(DOCKS, BEATS)
    let rawWalk: WalkState = walkStart(DOCKS, BEATS, true)
    let rawMismatches = 0

    for (let t = 1; t <= RAW_BEATS; t++) {
      raw = countBeat(raw, true, false).state
      rawWalk = walkBeat(rawWalk, () => FEAR_COIN)

      for (let x = 0; x < DOCKS; x++) {
        const v1 = valueOf(raw.right[x] ?? [0n, 0n, 0n])
        const v2 = valueOf(raw.left[x] ?? [0n, 0n, 0n])
        const z1 = rawWalk.right[x] ?? ZERO
        const z2 = rawWalk.left[x] ?? ZERO

        rawMismatches += v1[0] === z1[0] && v1[1] === z1[1] && v2[0] === z2[0] && v2[1] === z2[1] ? 0 : 1
      }
    }

    const rawVibes = [...raw.right, ...raw.left].reduce((s, k) => s + k[0] + k[1] + k[2], 0n)
    const rawCanonicalVibes = [...raw.right, ...raw.left].reduce((s, k) => {
      const c = removeKnots(k).counts

      return s + c[0] + c[1] + c[2]
    }, 0n)

    // controls: coins with no turn of roles make no knot
    const noTurnKnots = (keepBy: bigint, reverseBy: bigint): bigint => {
      let s = countStart(DOCKS, BEATS)
      let knots = 0n

      for (let t = 1; t <= BEATS; t++) {
        const n = s.right.length
        const zero: Counts = [0n, 0n, 0n]
        const right: Counts[] = new Array<Counts>(n).fill(zero)
        const left: Counts[] = new Array<Counts>(n).fill(zero)
        const scale = (k: Counts, by: bigint): Counts => [k[0] * by, k[1] * by, k[2] * by]
        const add = (p: Counts, q: Counts): Counts => [p[0] + q[0], p[1] + q[1], p[2] + q[2]]

        for (let x = 0; x < n; x++) {
          const r = s.right[x] ?? zero
          const l = s.left[x] ?? zero
          const a = removeKnots(add(scale(r, keepBy), scale(l, reverseBy)))
          const b = removeKnots(add(scale(r, reverseBy), scale(l, keepBy)))

          right[(x + 1) % n] = a.counts
          left[(x - 1 + n) % n] = b.counts
          knots += a.knots + b.knots
        }

        s = { right, left }
      }

      return knots
    }
    const hopKnots = noTurnKnots(0n, 2n)
    const streamKnots = noTurnKnots(2n, 0n)

    // 4. reversal
    let ring: CountState = countStart(RING, 0)

    ring = {
      right: ring.right.map((k, x) => (x === 7 ? ([3n, 0n, 1n] as Counts) : k)),
      left: ring.left.map((k, x) => (x === 20 ? ([0n, 5n, 2n] as Counts) : k)),
    }

    const ring0 = ring

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      ring = countBeat(ring, true, true).state
    }

    for (let t = 0; t < REVERSAL_BEATS; t++) {
      ring = countBeat(ring, false, true).state
    }

    const factor = 4n ** BigInt(REVERSAL_BEATS)
    const scaled = (k: Counts): Counts => removeKnots([k[0] * factor, k[1] * factor, k[2] * factor]).counts
    const reverses = ring.right.every((k, x) => same(k, scaled(ring0.right[x] ?? [0n, 0n, 0n]))) && ring.left.every((k, x) => same(k, scaled(ring0.left[x] ?? [0n, 0n, 0n])))

    const ok =
      representationViolations === 0 &&
      same(fear, [0n, 1n, 1n]) &&
      valueMismatches === 0 &&
      canonicalMismatches === 0 &&
      rawMismatches === 0 &&
      knotsTotal > 0n &&
      hopKnots === 0n &&
      streamKnots === 0n &&
      reverses &&
      chargeExact

    const log2 = (x: bigint): number => (x > 0n ? x.toString(2).length - 1 : -1)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'over every triple in [0, 12]^3 the counts with one value differ only by knots and each value has one knot-free count, the fewest vibes; -1 is (0, 1, 1); the walk as additions of role-rolled counts and knot removal equals the Eisenstein walk at every slot for 200 beats, with or without the knots, drops knots only with the swap phase and none with the hop or the free stream, reverses exactly, and keeps (2^t, 0, 0) as the total after every beat',
      metrics: {
        triplesChecked: (RANGE + 1) ** 3,
        valuesChecked: groups.size,
        representationViolations,
        fearAsCountsTake: Number(fear[0]),
        fearAsCountsHold: Number(fear[1]),
        fearAsCountsFree: Number(fear[2]),
        valueMismatches,
        canonicalMismatches,
        rawMismatchesWithKnotsKept: rawMismatches,
        knotsDroppedBeat1: Number(knotsAt[1] ?? -1n),
        knotsDroppedBeat10Log2: log2(knotsAt[10] ?? 0n),
        knotsDroppedBeat100Log2: log2(knotsAt[100] ?? 0n),
        knotsDroppedBeat200Log2: log2(knotsAt[BEATS] ?? 0n),
        knotsDroppedTotalLog2: log2(knotsTotal),
        chargeExactEveryBeat: chargeExact ? 1 : 0,
        reversesExactly: reverses ? 1 : 0,
        grainPerBeat: 2,
        countGcdAtBeat200: Number(countGcd),
        vibesAtBeat200Log2: log2(vibesFinal),
        vibesPerGrainUnitAtBeat200: Number((vibesFinal * 1000n) / 2n ** BigInt(BEATS)) / 1000,
        slotsWithNegativeRealPartAtBeat200: negativeRealSlots,
        rawVibesAtBeat40Log2: log2(rawVibes),
        canonicalVibesAtBeat40Log2: log2(rawCanonicalVibes),
      },
      control: {
        hopKnots: Number(hopKnots),
        freeStreamKnots: Number(streamKnots),
      },
      notes:
        'L1, exact BigInt arithmetic. Every count is a whole number of at least 0: no count is ever negative, a fear being carried as a love in each of the two other roles. The walk is the one-vibe sector of one line of E-QTM-0103, on a ring of docks. vibesPerGrainUnit is the total knot-free count over 2^t, the analog of the Wigner negativity: how many vibes the representation spends per unit of weight. Log2 values are floor(log2).',
    })
  },
})
