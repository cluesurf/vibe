// The fixed-shift flaw in position-indexed Kronecker values, as a gate: two reads of one key used as two
// decisions must not decide each other.
//
// weylCell(key, beat, salt) = frac(key a + beat b + salt c) (code/tool/weyl), a = frac(sqrt 2), b = frac(sqrt 3),
// c = frac(sqrt 5). Any two of its values at one key differ by a FIXED shift (b between two beats, c between two
// salts), so over the keys the pair lies on one line of the torus. A threshold on one then decides the other:
// in conservingEdgeSweepHashed a pair spawns where weylCell(k, beat, 2) < arrow and takes its sign from
// weylCell(k, beat, 3) < 1/2, and since the second is the first plus 0.2361, every arrow <= 0.2639 makes every
// spawned pair +1 on the edge's first vertex and -1 on its second. The fear-weave agent found the flaw in two
// files and fixed them with code/tool/weyl-point; this file makes it a gate and fixes the third.
//
// THE GATE (code/measure/threshold-correlation): over K = 2^14 keys, D = the largest gap between the joint rate
// of two threshold decisions and the product of their rates, thresholds 1/8 .. 7/8 on each read; FLAGGED when
// D > 0.02. THE FIX (code/dynamics/conserving-sweep, hashedSweepValue): each beat owns its own Kronecker stream
// (weyl-point, start 2^20 + beat, a new prime per beat), the edge is the index, the three decisions are three
// slots. Two beats of one edge are then two rationally independent rotations, and the three decisions of one
// edge and beat are jointly equidistributed.
//
// Gates, fixed before the first run:
//   G1 sensitivity, exact: the smallest D any fixed shift can have on the threshold grid (from arc lengths, over
//      10,000 shifts and every breakpoint of the piecewise-linear gap) is above 0.02, so no fixed shift passes.
//   G2 controls at K = 2^14. Planted: u2 = frac(u1 + delta), u1 a weyl-point stream, for delta = j / 1000,
//      j = 0 .. 999, all 1,000 flagged. The reported flaw: weylCell salts 2 and 3 at one beat, and salt 1 at
//      beats 5 and 6, both flagged. Clean: weyl-point slots 0 and 1 of one index, and hashedSweepValue's hop value
//      at beats 5 and 6, both with D < 0.005.
//   G3 the audit of conservingEdgeSweepHashed's reads, before (weylCell salts 1, 2, 3) and after (hashedSweepValue
//      decisions 0, 1, 2): every pair of its three decisions at one beat, and each decision at beats (b, b + 1)
//      and (b, b + 2), for b in {1, 2, 17, 100}: 36 pairs each. Before: the salt 2 / salt 3 pair flagged at every
//      b. After: none of the 36 flagged.
//   G4 the consequence in the rule: on a ring of 4,096 empty vertices at arrow 0.1, the sweep as it was (kept
//      here as the control, a verbatim copy of the old body) creates every pair of beats 1 to 16 as +1 on the
//      edge's first vertex, a share of exactly 1; the fixed sweep's share over the same beats is within
//      0.5 +- 0.05, and its spawn rate within 0.1 +- 0.02 of the eligible edges.
// Reported: the other readers of weylCell in the same file (conservingHopSweepHashed and
// conservingEdgeSweepSteeredHashed read salt 1 once per edge and beat, so only their beat-to-beat pair exists;
// hashedTone reads one value per key); and the reruns of conservingEdgeSweepHashed's importers (in the report).
// Status: pass if G1 to G4 hold.
//
// Depth L2: a discipline gate with an exact sensitivity bound, planted controls, and the fix it gates.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { weylCell } from '@/code/tool/weyl'
import { weylPoint } from '@/code/tool/weyl-point'
import { conservingEdgeSweepHashed, hashedSweepValue } from '@/code/dynamics/conserving-sweep'
import { THRESHOLD_GAP, fixedShiftFloor, thresholdCorrelation } from '@/code/measure/threshold-correlation'

const KEYS = 2 ** 14
const RING = 4096
const ARROW = 0.1
const BEATS = 16

// conservingEdgeSweepHashed as it was until 2026-09-26, verbatim apart from its name: the control
function oldSweep(input: { tone: Int8Array; eu: Int32Array; ev: Int32Array; moved: Uint8Array; beat: number; arrow: number }): void {
  const { tone, eu, ev, moved, beat, arrow } = input

  moved.fill(0)

  for (let k = 0; k < eu.length; k++) {
    const v = eu[k]!
    const w = ev[k]!

    if (moved[v] || moved[w]) {
      continue
    }

    const a = tone[v]!
    const b = tone[w]!

    if ((a === 1 && b === -1) || (a === -1 && b === 1)) {
      tone[v] = 0
      tone[w] = 0
      moved[v] = 1
      moved[w] = 1
    } else if ((a === 0) !== (b === 0)) {
      const c = a === 0 ? w : v
      const e = a === 0 ? v : w

      if (weylCell(k, beat, 1) < 0.5) {
        tone[e] = tone[c]!
        tone[c] = 0
        moved[v] = 1
        moved[w] = 1
      }
    } else if (a === 0 && b === 0) {
      if (weylCell(k, beat, 2) < arrow) {
        if (weylCell(k, beat, 3) < 0.5) {
          tone[v] = 1
          tone[w] = -1
        } else {
          tone[v] = -1
          tone[w] = 1
        }

        moved[v] = 1
        moved[w] = 1
      }
    }
  }
}

type Read = (key: number) => number

export default experiment({
  id: 'method/weyl-fixed-shift',
  code: 'E-MTH-0026',
  title:
    'the fixed-shift flaw as a gate: two weylCell values of one key differ by a fixed shift, so a threshold on one decides the other (every fixed shift shows a threshold gap above 0.02, planted controls all caught, independent streams all pass), and in conservingEdgeSweepHashed it made every pair spawned below arrow 0.264 the same way round; fixed by giving each beat its own weyl-point stream',
  category: 'method',
  substrates: ['any'],
  depth: 'L2',
  paper: false,
  run() {
    const check = (read1: Read, read2: Read) => thresholdCorrelation({ read1, read2, keys: KEYS })

    // G1
    const floor = fixedShiftFloor(10000)
    const g1 = floor.floor > THRESHOLD_GAP

    // G2
    let plantedFlagged = 0
    let plantedSmallestGap = Number.POSITIVE_INFINITY

    for (let j = 0; j < 1000; j++) {
      const delta = j / 1000
      const r = check(
        k => weylPoint({ start: 26, index: k, slot: 0 }),
        k => (weylPoint({ start: 26, index: k, slot: 0 }) + delta) % 1,
      )

      plantedFlagged += r.flagged ? 1 : 0
      plantedSmallestGap = Math.min(plantedSmallestGap, r.gap)
    }

    const saltPair = check(k => weylCell(k, 5, 2), k => weylCell(k, 5, 3))
    const beatPair = check(k => weylCell(k, 5, 1), k => weylCell(k, 6, 1))
    const cleanSlots = check(k => weylPoint({ start: 26, index: k, slot: 0 }), k => weylPoint({ start: 26, index: k, slot: 1 }))
    const cleanBeats = check(k => hashedSweepValue(k, 5, 0), k => hashedSweepValue(k, 6, 0))
    const g2 =
      plantedFlagged === 1000 && saltPair.flagged && beatPair.flagged && cleanSlots.gap < 0.005 && cleanBeats.gap < 0.005

    // G3
    const oldRead = (d: number, b: number): Read => k => weylCell(k, b, d + 1)
    const newRead = (d: number, b: number): Read => k => hashedSweepValue(k, b, d)
    const audit = (read: (d: number, b: number) => Read): { flagged: number; saltTwoThree: number; worst: number; pairs: number } => {
      let flagged = 0
      let saltTwoThree = 0
      let worst = 0
      let pairs = 0

      for (const b of [1, 2, 17, 100]) {
        const list: [Read, Read, string][] = [
          [read(0, b), read(1, b), 'hop spawn'],
          [read(0, b), read(2, b), 'hop sign'],
          [read(1, b), read(2, b), 'spawn sign'],
          ...[0, 1, 2].flatMap(d => [
            [read(d, b), read(d, b + 1), 'next'] as [Read, Read, string],
            [read(d, b), read(d, b + 2), 'second'] as [Read, Read, string],
          ]),
        ]

        for (const [r1, r2, name] of list) {
          const r = check(r1, r2)

          pairs++
          flagged += r.flagged ? 1 : 0
          saltTwoThree += r.flagged && name === 'spawn sign' ? 1 : 0
          worst = Math.max(worst, r.gap)
        }
      }

      return { flagged, saltTwoThree, worst, pairs }
    }
    const before = audit(oldRead)
    const after = audit(newRead)
    const g3 = before.saltTwoThree === 4 && after.flagged === 0 && after.pairs === 36

    // G4
    const eu = Int32Array.from({ length: RING }, (_, i) => i)
    const ev = Int32Array.from({ length: RING }, (_, i) => (i + 1) % RING)
    const spawnShare = (sweep: typeof oldSweep): { plusFirst: number; spawned: number; eligible: number } => {
      let plusFirst = 0
      let spawned = 0
      let eligible = 0

      for (let beat = 1; beat <= BEATS; beat++) {
        const tone = new Int8Array(RING)
        const moved = new Uint8Array(RING)

        // from an empty ring nothing can hop, so every charge after the beat belongs to a pair spawned on one edge
        sweep({ tone, eu, ev, moved, beat, arrow: ARROW })

        const before = spawned

        for (let k = 0; k < RING; k++) {
          const v = eu[k]!
          const w = ev[k]!

          if (tone[v] !== 0 && tone[w] === -tone[v]!) {
            // an edge whose ends are an opposite pair made this beat: the pair's first vertex is v when the
            // pair was made on edge k (neighboring pairs never share a vertex, the matching guarantees it)
            spawned++
            plusFirst += tone[v] === 1 ? 1 : 0
            k++
          }
        }

        // the edges the sweep weighed with both ends empty: every edge but the one after each spawn
        eligible += RING - (spawned - before)
      }

      return { plusFirst, spawned, eligible }
    }
    const oldShare = spawnShare(oldSweep)
    const newShare = spawnShare(conservingEdgeSweepHashed)
    const oldPlusShare = oldShare.plusFirst / Math.max(1, oldShare.spawned)
    const newPlusShare = newShare.plusFirst / Math.max(1, newShare.spawned)
    const newRate = newShare.spawned / newShare.eligible
    const g4 = oldShare.spawned > 0 && oldPlusShare === 1 && Math.abs(newPlusShare - 0.5) <= 0.05 && Math.abs(newRate - ARROW) <= 0.02

    // reported: the other weylCell readers in conserving-sweep (one value per edge and beat, salt 1)
    const hopBeatPair = check(k => weylCell(k, 5, 1), k => weylCell(k, 6, 1))

    const gates = { G1: g1, G2: g2, G3: g3, G4: g4 }
    const ok = Object.values(gates).every(Boolean)

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every fixed shift between two reads of one key shows a threshold gap above the gate\'s 0.02 (exact floor over all shifts), 1,000 planted shifts and the two reported weylCell pairs are flagged while independent weyl-point streams pass; conservingEdgeSweepHashed\'s spawn and sign reads were such a pair and made every pair spawned at arrow 0.1 the same way round (share 1), and with a stream per beat none of its 36 decision pairs is flagged and the share is one half',
      metrics: {
        keys: KEYS,
        thresholdGap: THRESHOLD_GAP,
        fixedShiftFloor: floor.floor,
        fixedShiftFloorAt: floor.at,
        plantedFlagged,
        plantedSmallestGap,
        weylCellSaltPairGap: saltPair.gap,
        weylCellSaltPairConstantShift: saltPair.constantShift ? 1 : 0,
        weylCellSaltPairShift: saltPair.shift,
        weylCellBeatPairGap: beatPair.gap,
        weylCellBeatPairConstantShift: beatPair.constantShift ? 1 : 0,
        weylCellBeatPairShift: beatPair.shift,
        cleanSlotsGap: cleanSlots.gap,
        cleanBeatsGap: cleanBeats.gap,
        auditPairs: after.pairs,
        auditFlaggedBefore: before.flagged,
        auditSpawnSignFlaggedBefore: before.saltTwoThree,
        auditWorstGapBefore: before.worst,
        auditFlaggedAfter: after.flagged,
        auditWorstGapAfter: after.worst,
        oldSpawned: oldShare.spawned,
        oldPlusFirstShare: oldPlusShare,
        oldSpawnRate: oldShare.spawned / oldShare.eligible,
        newSpawned: newShare.spawned,
        newPlusFirstShare: newPlusShare,
        newSpawnRate: newRate,
        hopSweepBeatPairGap: hopBeatPair.gap,
        hopSweepBeatPairFlagged: hopBeatPair.flagged ? 1 : 0,
        ...Object.fromEntries(Object.entries(gates).map(([k, v]) => [`gate_${k}`, v ? 1 : 0])),
      },
      control: {
        plantedShifts: 1000,
        oldSweepIsVerbatim: 1,
      },
      notes:
        'L2. FIRST RUN (2026-09-26, 2 s): every gate passes, first time, no gate touched. The exact floor is 0.1406 (at shift 0.172), seven times the 0.02 threshold, so the gate cannot miss a fixed shift on this threshold grid, and every weylCell pair is one: all 36 of conservingEdgeSweepHashed\'s decision pairs were flagged before the fix (worst gap 0.222), the spawn and sign pair at every beat tested, with the literal constant shift 0.23607 = frac(sqrt 5); across beats the shift is 0.73205 = frac(sqrt 3). In the rule the flaw was total: at arrow 0.1 all 6,555 pairs spawned over 16 beats of an empty 4,096 ring were +1 on the edge\'s first vertex; after the fix 5,510 are, 50.02 percent of them. After the fix no pair is flagged (worst gap 0.0028) and the independent-stream controls read 7e-4 and 4e-4. STILL IN THE FILE, reported and not fixed here: conservingHopSweepHashed and conservingEdgeSweepSteeredHashed read weylCell(edge, beat, 1) once per edge and beat, so a hop at one beat and the next are the fixed-shift pair (gap 0.170, flagged); each makes one decision per edge and beat, so the within-beat flaw is absent. hashedTone reads one value per cell, no pair. WHAT THE FIX LEAVES: along the edge index the values are still one rotation per beat, a Kronecker fill, so neighboring edges are not independent; it shows in the spawn rate, 0.0918 of the edges weighed at arrow 0.1 after the fix and 0.111 before, because the edge after a spawn is skipped and a rotation correlates the two. The gate asks only about two reads of ONE key; a gate on neighboring keys would flag every Kronecker fill in the repo, including weyl-point.',
    })
  },
})
