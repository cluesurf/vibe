// The measurement RECORD must be a self. The capstone of the selection trilogy.
//
// A definite measurement outcome must be BOTH held (a settled record that does not keep changing)
// AND live (a real macroscopic structure, not the empty vacuum). E-QTM-0084 showed the reversible
// rule cannot amplify a microstate into a branch; E-QTM-0085 showed the arrow supplies that
// amplifier (the active rule scrambles, sensitive dependence). This closes the loop by asking the
// last question: once amplified, can the committed rule HOLD the branch as a live definite record?
//
// Measured on the genuine {3,4,3,4} dodecagrid (the active edge rule) and the flat horosphere self
// layer (the self-kit), deterministic throughout, no randomness:
//
//   1. ARROW ON, NEVER SETTLES. With the arrow on, the active rule keeps a high activity but its
//      coarse record keeps CHANGING beat to beat (the block signature drifts by a large fraction
//      between late snapshots), the chaos that amplifies (E-QTM-0085) also never lets a definite
//      record form. Amplification without a held record.
//
//   2. ARROW OFF, DIES. Turn the arrow off to let it settle and add a drain (dissipation), and the
//      activity drains to ZERO: dead peace plus loss leaves the empty vacuum, no record at all. A
//      held state without life.
//
//   So the bare committed rule faces a dichotomy: active it never settles, passive it dies. Neither
//   holds a LIVE DEFINITE record, which is what a measurement outcome is.
//
//   3. A SELF HOLDS A LIVE DEFINITE RECORD (the case that gives YES). An emergent self (the self-kit
//      on the flat horosphere, a self-maintaining bound structure) stays ALIVE (a stable non-zero
//      activity) AND HOLDS a definite configuration (its cluster overlaps itself across time near
//      one), across sizes. It is exactly the missing ingredient: a structure that neither dies nor
//      churns, so it can carry a settled live record.
//
// So the measurement record is a SELF. The full measurement decomposes into the arrow (the
// amplifier, E-QTM-0085, a base thing) and a self-maintaining holder (the emergent self), and the
// bare rule supplies the first but not the second, which ties the definite outcome to the selves
// layer (E-QTM-0045) as an ingredient, not an analogy. Grade L2: measured dynamical facts about the
// committed rule (active never settles, passive dies) with the emergent self as the holder that
// does both, sharpening the E-QTM-0043 obstruction to its final missing ingredient. The self-kit is
// a MODEL of the emergent self (the horosphere idealization), so this names the required holder and
// ties it to the selves layer without deriving that self from the substrate's own coarse-graining,
// the harder open step (E-QTM-0045). The Born weights stay separate (E-QTM-0005, E-QTM-0012).

import { buildDodecagrid } from '@/code/substrate/coxeter/cell-scale'
import { edgesFromCsr } from '@/code/tool/graph'
import {
  conservingEdgeSweepHashed,
  hashRand,
} from '@/code/dynamics/conserving-sweep'
import {
  flatGraph,
  emergeSelfHashed,
  beatHashed,
  largestPositiveCluster,
} from '@/code/model/self-kit'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const BLOCKS = 8

function activity(tone: Int8Array): number {
  let n = 0

  for (const value of tone) {
    if (value !== 0) {
      n++
    }
  }

  return n / tone.length
}

function blockSignature(tone: Int8Array): number[] {
  const sig = new Array<number>(BLOCKS).fill(0)
  const per = Math.ceil(tone.length / BLOCKS)

  for (let i = 0; i < tone.length; i++) {
    sig[Math.min(BLOCKS - 1, Math.floor(i / per))]! += tone[i]!
  }

  return sig
}

function signatureDrift(a: number[], b: number[]): number {
  let diff = 0
  let norm = 0

  for (let i = 0; i < BLOCKS; i++) {
    diff += Math.abs(a[i]! - b[i]!)
    norm += Math.abs(a[i]!) + Math.abs(b[i]!)
  }

  return norm > 0 ? diff / norm : 0
}

function genericTone(size: number, salt: number): Int8Array {
  const tone = new Int8Array(size)

  for (let i = 0; i < size; i++) {
    const r = hashRand(i, 0, salt)
    tone[i] = r < 0.3 ? -1 : r < 0.6 ? 1 : 0
  }

  return tone
}

function clusterOverlap(a: number[], b: number[]): number {
  const set = new Set(b)

  let shared = 0

  for (const cell of a) {
    if (set.has(cell)) {
      shared++
    }
  }

  return a.length > 0 ? shared / a.length : 0
}

export default experiment({
  id: 'quantum/record-needs-a-self',
  code: 'E-QTM-0086',
  title:
    'the measurement record must be a self: with the arrow on the committed rule amplifies but never settles (the coarse record keeps changing), with the arrow off and a drain it settles but dies (drains to the empty vacuum), so the bare rule holds no live definite record, while an emergent self stays alive and holds a definite configuration, tying the definite outcome to the selves layer as an ingredient',
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    // 1 and 2: the active edge rule on the genuine dodecagrid.
    const g = buildDodecagrid({ maxCells: 12000 })
    const size = g.cellCount
    const { eu, ev } = edgesFromCsr(g.offsets, g.adj, size)

    // ARROW ON: run and snapshot the coarse record late, measure how much it keeps changing.
    const arrowOnTone = genericTone(size, 5)
    const movedOn = new Uint8Array(size)

    let snapEarly: number[] = []
    let snapLate: number[] = []

    for (let t = 1; t <= 300; t++) {
      conservingEdgeSweepHashed({
        tone: arrowOnTone,
        eu,
        ev,
        moved: movedOn,
        beat: t,
        arrow: 0.1,
      })

      if (t === 250) {
        snapEarly = blockSignature(arrowOnTone)
      }

      if (t === 300) {
        snapLate = blockSignature(arrowOnTone)
      }
    }

    const arrowOnActivity = activity(arrowOnTone)
    const arrowOnDrift = signatureDrift(snapEarly, snapLate)

    // ARROW OFF + DRAIN: run at dead peace with a drain, measure the surviving activity.
    const arrowOffTone = genericTone(size, 5)
    const movedOff = new Uint8Array(size)
    const drain = Math.floor(size * 0.1)

    for (let t = 1; t <= 300; t++) {
      conservingEdgeSweepHashed({
        tone: arrowOffTone,
        eu,
        ev,
        moved: movedOff,
        beat: t,
        arrow: 0,
      })

      for (let i = 0; i < drain; i++) {
        arrowOffTone[i] = 0
      }
    }

    const arrowOffActivity = activity(arrowOffTone)

    // 3: the emergent self (the holder), on the flat horosphere self layer, across two sizes.
    let worstSelfActivity = 1
    let worstSelfHold = 1

    for (const L of [40, 64]) {
      const sg = flatGraph(L)
      const moved = new Uint8Array(sg.cellCount)
      const { tone } = emergeSelfHashed(sg, moved, {
        beats: 70,
        density: 0.1,
      })

      // let it reach its held configuration, then take a reference and check it holds.
      for (let t = 0; t < 60; t++) {
        beatHashed(tone, sg, moved, 100 + t, 0.01, 0.22)
      }

      const reference = largestPositiveCluster(tone, sg)

      let minHold = 1
      let minAct = 1

      for (let block = 0; block < 4; block++) {
        for (let t = 0; t < 20; t++) {
          beatHashed(tone, sg, moved, 200 + block * 20 + t, 0.01, 0.22)
        }

        minHold = Math.min(
          minHold,
          clusterOverlap(reference, largestPositiveCluster(tone, sg)),
        )
        minAct = Math.min(minAct, activity(tone))
      }

      worstSelfActivity = Math.min(worstSelfActivity, minAct)
      worstSelfHold = Math.min(worstSelfHold, minHold)
    }

    // the gates
    const arrowOnAliveButChurns =
      arrowOnActivity > 0.1 && arrowOnDrift > 0.1

    const arrowOffDies = arrowOffActivity < 0.01
    const selfAliveAndHolds =
      worstSelfActivity > 0.05 && worstSelfHold > 0.6

    const ok =
      arrowOnAliveButChurns && arrowOffDies && selfAliveAndHolds

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a live definite measurement record cannot come from the bare committed rule, which faces a dichotomy (with the arrow on it stays active but its coarse record keeps changing, never settling; with the arrow off and a drain it settles but dies to the empty vacuum), while an emergent self stays alive at a stable activity and holds a definite configuration across sizes, so the measurement record is a self and the definite outcome is tied to the selves layer as a required ingredient, the amplifier being the arrow (E-QTM-0085) and the holder being the self',
      metrics: {
        arrowOnActivity: Number(arrowOnActivity.toFixed(3)),
        arrowOnLateRecordDrift: Number(arrowOnDrift.toFixed(3)),
        arrowOffActivity: Number(arrowOffActivity.toExponential(2)),
        worstSelfActivity: Number(worstSelfActivity.toFixed(3)),
        worstSelfHold: Number(worstSelfHold.toFixed(3)),
      },
      control: {
        // the arrow-off (dead peace) rule is the control for the active never-settling: it DOES
        // settle but at the cost of dying, so neither active nor passive holds a live record, and
        // the self holding both alive and definite is the ingredient the bare rule lacks.
        arrowOffActivity: Number(arrowOffActivity.toExponential(2)),
        selfHold: Number(worstSelfHold.toFixed(3)),
      },
      notes:
        'L2, measured. Parts 1 and 2 run the active edge rule (conservingEdgeSweep, deterministic hashed, no randomness) on the genuine {3,4,3,4} dodecagrid: with arrow 0.1 the activity stays high (~0.2) but the coarse 8-block record drifts by a large fraction between beats 250 and 300 (never settles, the chaos of E-QTM-0085), and with arrow 0 plus a 10 percent drain the activity falls to zero (dead peace drains empty). Part 3 runs the self-kit on the flat horosphere (the emergent self layer): an emerged self keeps a stable non-zero activity and its largest cluster overlaps a mid-run reference near one across sizes 40 and 64, so it stays alive AND holds a definite configuration. The full measurement thus needs the arrow (the amplifier, E-QTM-0085, a base thing) and a self-maintaining holder (the emergent self), and the bare rule supplies only the first. The self-kit is a MODEL of the emergent self (the horosphere idealization), so this names the required holder and ties measurement to the selves layer (E-QTM-0045) without deriving the self from the substrate coarse-graining (the harder open step). Born weights stay separate (E-QTM-0005, E-QTM-0012).',
    })
  },
})
