// Are the three copies of a quark triplet in the coin told apart by any rule?
//
// what-the-base-needs, "Color already in the coin": around any A2 plane the 18 non-gluon directions are
// three copies of a triplet and its antitriplet, 120 degrees apart on the orthogonal plane, and a
// color-selecting triality cycles the copies, "the shape three generations would take". A reading, not a
// measurement. This measures what can be measured of it, by one instrument (code/measure/generation-copies)
// on the D4 box: a lone tone on every slot of every copy's lines, both signs, run beside the vacuum, and
// per copy
//
// - reach: how far the farthest differing cell is after REACH_BEATS beats (a travel speed)
// - dressing: how many slots differ at the last beat
// - mixing: the share of the tone's charge (charge is conserved, so the excess sums to the tone) on each
//   copy's lines, averaged over BEATS beats, the rule's own transition count between copies. Column 4 is
//   the gluon lines
//
// Rules: the triality weave as built (E-FRC-0109), the same weave with its three orbits listed from the
// same copy (the aligned weave, below), and the committed turning weave as the control.
//
// The aligned weave. The triality weave's swaps S pair orbit r with orbit r + 1 line by line in the order
// each orbit was listed, and trialityWeaveLayout lists an orbit from its lowest line index. Read as copies,
// that listing lines orbits 0 and 1 up copy for copy and puts orbit 2 one copy ahead, so a swap into or out
// of orbit 2 moves a tone to the next or previous copy. That offset is a choice the construction made by
// line index, not a measured property, and every alignment is equally triality-symmetric. The aligned weave
// lists every orbit from its copy-0 line. Its structure gates (reversal, charge, triality) are rerun here.
//
// Gates, fixed before the run:
// 1. geometry: for all 32 color trialities each copy holds one line of each color, and the triality sends
//    copy g to copy g + 1 keeping the color
// 2. aligned weave: reverses exactly over 24 beats and commutes with its triality beat by beat, on a
//    dense patterned start, and conserves charge
// 3. degeneracy: under both triality weaves, every seed and its triality image give the same support at
//    every beat, the same reach, and line charges carried line to line by the triality, with no
//    exception, and so per-copy reach, dressing and a circulant mixing table. The committed rule, which
//    keeps no triality (E-FRC-0095), must show exceptions on the same instrument, or the instrument
//    cannot see a split
//
// What a symmetry forces and what it leaves open. The triality forces equal copies and a circulant table
// m[g][h] = m[g + 1][h + 1]. It does not fix the three numbers of the circulant: the share kept on the
// seeded copy and the shares passed one copy ahead and one copy behind. Those are measured, and their
// difference is a handedness in copy space the symmetry allows but does not require.
//
// Result, first run. Degenerate exactly, as the symmetry forces, under both weaves, and split under the
// committed rule on the same plane (36 of 36 seeds differ from their images, reach 6.74, 2.74 and 1.38 per
// copy). The open numbers: the aligned weave keeps every tone's charge on its own copy at every beat of
// every run (leak 0), so it conserves a copy number exactly and its transition table is the identity. The
// as-built weave passes 0.028 of the charge one copy ahead and 0.028 one copy behind on average (kept
// 0.944), equal both ways, so no handedness, and every tone is back on its copy by beat 24. A tone on a
// gluon line sends 0.299 of its charge to each copy, the vertex's democratic one-for-three. So the only
// mixing between copies in the triality weave is the orbit listing, a construction choice, and removing it
// leaves three exactly conserved, exactly degenerate copies: a family symmetry with nothing to break it.
//
// Depth L2: a symmetry and a transition table measured on a constructed rule, with a control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meshOpposites } from '@/code/tool/mesh'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  permutationOrder,
  weylF4DirectionPermutations,
} from '@/code/measure/coin-symmetry'
import {
  colorTriality,
  trialityWeave,
  trialityWeaveLayout,
} from '@/code/rule/triality-weave'
import { turningWeave, type Collision } from '@/code/rule/collision'
import { beat, inverseBeat } from '@/code/rule/lattice-gas'
import { makeWill, type Will } from '@/code/tone/will'
import {
  boxCellMap,
  d4BoxCell,
  d4BoxMesh,
  linearMapOf,
  transformState,
} from '@/code/substrate/d4-box'
import {
  alignedLayout,
  circulantDefect,
  copyLayout,
  copyStatistics,
  degeneracyExceptions,
  loneRun,
  memoizedRule,
  vacuumSequence,
  type LoneRun,
} from '@/code/measure/generation-copies'

const SIDE = 11
const BEATS = 24
const REACH_BEATS = 6
const GATE_SIDE = 5
const GOLDEN = (Math.sqrt(5) - 1) / 2

function patterned(box: ReturnType<typeof d4BoxMesh>): Will {
  const will = makeWill(box)

  for (let i = 0; i < will.data.length; i++) {
    const u = ((i + 1) * GOLDEN * 1.37) % 1

    will.data[i] = u < 0.3 ? -1 : u < 0.6 ? 0 : 1
  }

  return will
}

export default experiment({
  id: 'gauge/generation-copies',
  code: 'E-FRC-0140',
  title:
    'the three triplet copies in the coin, measured as generations: under the triality weave every lone tone and its triality image travel, dress and mix identically, so the copies are exactly degenerate with a circulant transition table between them, while the committed turning weave splits them on the same instrument',
  category: 'gauge',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const roots = rootsD4()
    const box = d4BoxMesh({ side: SIDE })
    const opposite = meshOpposites(box)
    const sigma = colorTriality({ opposite })
    const built = trialityWeaveLayout({ opposite, triality: sigma })
    const copies = copyLayout({ roots, opposite, triality: sigma })
    const aligned = alignedLayout({ layout: built, copies })

    // 1. geometry, for every color triality
    const selectors = weylF4DirectionPermutations({ directions: roots }).filter(
      p =>
        permutationOrder({ permutation: p }) === 3 &&
        p.filter((image, d) => image === d).length === 6,
    )
    const regularSelectors = selectors.filter(
      p => copyLayout({ roots, opposite, triality: p }).regular,
    ).length
    // how the as-built orbits sit against the copies: the copy of each orbit's first line
    const builtOffsets = built.orbits.map(o => copies.copy[o[0] ?? 0] ?? -1)
    const alignedOffsets = aligned.orbits.map(o => copies.copy[o[0] ?? 0] ?? -1)

    // 2. the aligned weave's structure gates, on a small box
    const small = d4BoxMesh({ side: GATE_SIDE })
    const forward = trialityWeave({ layout: aligned })
    const backward = trialityWeave({ layout: aligned, forward: false })
    const start = patterned(small)
    const charge = (w: Will): number => w.data.reduce((a, b) => a + b, 0)

    let w: Will = { mesh: small, data: Int8Array.from(start.data) }
    let chargeKept = true

    for (let t = 0; t < 24; t++) {
      w = beat(w, forward(t))
      chargeKept = chargeKept && charge(w) === charge(start)
    }

    for (let t = 23; t >= 0; t--) {
      w = inverseBeat(w, backward(t))
    }

    const reverses = w.data.every((x, k) => x === start.data[k])
    const matrix = linearMapOf(sigma)
    const cellMap =
      matrix === undefined ? undefined : boxCellMap({ matrix, side: GATE_SIDE })

    let commutes = cellMap !== undefined

    if (cellMap !== undefined) {
      let a: Will = { mesh: small, data: Int8Array.from(start.data) }
      let b: Will = {
        mesh: small,
        data: transformState({ data: start.data, cellMap, permutation: sigma, degree: 24 }),
      }

      for (let t = 0; t < 12; t++) {
        a = beat(a, forward(t))
        b = beat(b, forward(t))
        commutes =
          commutes &&
          transformState({ data: a.data, cellMap, permutation: sigma, degree: 24 }).every(
            (x, k) => x === b.data[k],
          )
      }
    }

    // 3. every direction, both signs, under each rule
    const mid = Math.floor(SIDE / 2)
    const cell = d4BoxCell({ coordinates: [mid, mid, mid, mid], side: SIDE })
    // the lookup form of each rule gives the same states as the rule itself: checked on the dense start
    const lookupAgrees = [trialityWeave({ layout: built }), turningWeave({ opposite: meshOpposites(small) })].every(
      plain => {
        const fast = memoizedRule(plain)

        let a: Will = { mesh: small, data: Int8Array.from(start.data) }
        let b: Will = { mesh: small, data: Int8Array.from(start.data) }

        for (let t = 0; t < 12; t++) {
          a = beat(a, plain(t))
          b = beat(b, fast(t))
        }

        return a.data.every((x, k) => x === b.data[k])
      },
    )

    const record = (plain: (t: number) => Collision): LoneRun[][] => {
      const rule = memoizedRule(plain)
      const vacuum = vacuumSequence({ mesh: box, rule, beats: BEATS })

      return Array.from({ length: 24 }, (_, direction) =>
        ([1, -1] as const).map(tone =>
          loneRun({
            mesh: box,
            side: SIDE,
            rule,
            vacuum,
            cell,
            direction,
            tone,
            lines: copies.lines,
            reachBeats: REACH_BEATS,
          }),
        ),
      )
    }

    const builtRuns = record(trialityWeave({ layout: built }))
    const alignedRuns = record(trialityWeave({ layout: aligned }))
    const committedRuns = record(turningWeave({ opposite }))
    const builtStats = copyStatistics({ layout: copies, runs: builtRuns })
    const alignedStats = copyStatistics({ layout: copies, runs: alignedRuns })
    const committedStats = copyStatistics({ layout: copies, runs: committedRuns })
    const builtExceptions = degeneracyExceptions({ copies, sigma, runs: builtRuns })
    const alignedExceptions = degeneracyExceptions({ copies, sigma, runs: alignedRuns })
    const committedExceptions = degeneracyExceptions({ copies, sigma, runs: committedRuns })
    const split = (xs: readonly number[]): number => Math.max(...xs) - Math.min(...xs)

    // a gluon-line tone: where its charge goes, by copy
    const gluonShare = (runs: LoneRun[][]): number[] => {
      const share = [0, 0, 0, 0]

      let count = 0

      copies.lines.forEach(([p, q], l) => {
        if ((copies.copy[l] ?? 0) >= 0) {
          return
        }

        for (const d of [p, q]) {
          for (let s = 0; s < 2; s++) {
            const run = runs[d]?.[s]
            const sign = s === 0 ? 1 : -1

            run?.lineCharge.forEach(lineCharge =>
              lineCharge.forEach((value, line) => {
                const g = copies.copy[line] ?? -1
                const k = g < 0 ? 3 : g

                share[k] = (share[k] ?? 0) + (sign * value) / (run?.lineCharge.length ?? 1)
              }),
            )
            count += 1
          }
        }
      })

      return share.map(x => x / Math.max(1, count))
    }

    const builtGluon = gluonShare(builtRuns)
    const alignedGluon = gluonShare(alignedRuns)
    const circulant = (m: readonly (readonly number[])[]): {
      kept: number
      ahead: number
      behind: number
    } => ({
      kept: m[0]?.[0] ?? 0,
      ahead: m[0]?.[1] ?? 0,
      behind: m[0]?.[2] ?? 0,
    })
    const builtCirculant = circulant(builtStats.mixing)
    const alignedCirculant = circulant(alignedStats.mixing)

    const geometry = selectors.length === 32 && regularSelectors === 32
    const structure = reverses && commutes && chargeKept && lookupAgrees
    const degenerate =
      builtExceptions === 0 &&
      alignedExceptions === 0 &&
      split(builtStats.reach) < 1e-9 &&
      split(alignedStats.reach) < 1e-9 &&
      split(builtStats.finalSupport) === 0 &&
      split(alignedStats.finalSupport) === 0 &&
      circulantDefect(builtStats.mixing) < 1e-12 &&
      circulantDefect(alignedStats.mixing) < 1e-12
    const controlSplits = committedExceptions > 0
    const ok = geometry && structure && degenerate && controlSplits

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'for all 32 color trialities each copy holds one line of each color and the triality turns copy g into g + 1, the aligned triality weave reverses exactly, conserves charge and commutes with its triality, and under both triality weaves every lone tone on a copy line and its triality image have the same support at every beat, the same reach and the same line charges carried by the triality, so the three copies are exactly degenerate in travel, dressing and mixing with a circulant transition table, while the committed turning weave breaks the equality on the same instrument',
      metrics: {
        colorTrialities: selectors.length,
        regularTrialities: regularSelectors,
        builtOrbitCopyOffset0: builtOffsets[0] ?? -1,
        builtOrbitCopyOffset1: builtOffsets[1] ?? -1,
        builtOrbitCopyOffset2: builtOffsets[2] ?? -1,
        alignedOrbitCopyOffsetMax: Math.max(...alignedOffsets),
        alignedReverses: reverses ? 1 : 0,
        alignedCommutes: commutes ? 1 : 0,
        alignedChargeKept: chargeKept ? 1 : 0,
        lookupAgrees: lookupAgrees ? 1 : 0,
        builtDegeneracyExceptions: builtExceptions,
        alignedDegeneracyExceptions: alignedExceptions,
        builtReachCopy0: builtStats.reach[0] ?? 0,
        builtReachSplit: split(builtStats.reach),
        builtFinalSupportCopy0: builtStats.finalSupport[0] ?? 0,
        builtCirculantDefect: circulantDefect(builtStats.mixing),
        builtKept: builtCirculant.kept,
        builtAhead: builtCirculant.ahead,
        builtBehind: builtCirculant.behind,
        builtToGluon: builtStats.mixing[0]?.[3] ?? 0,
        builtLeak: builtStats.leak,
        alignedLeak: alignedStats.leak,
        builtFinalKept: builtStats.finalMixing[0]?.[0] ?? 0,
        builtFinalAhead: builtStats.finalMixing[0]?.[1] ?? 0,
        builtFinalBehind: builtStats.finalMixing[0]?.[2] ?? 0,
        alignedReachCopy0: alignedStats.reach[0] ?? 0,
        alignedReachSplit: split(alignedStats.reach),
        alignedFinalSupportCopy0: alignedStats.finalSupport[0] ?? 0,
        alignedCirculantDefect: circulantDefect(alignedStats.mixing),
        alignedKept: alignedCirculant.kept,
        alignedAhead: alignedCirculant.ahead,
        alignedBehind: alignedCirculant.behind,
        alignedToGluon: alignedStats.mixing[0]?.[3] ?? 0,
        alignedFinalKept: alignedStats.finalMixing[0]?.[0] ?? 0,
        alignedFinalAhead: alignedStats.finalMixing[0]?.[1] ?? 0,
        alignedFinalBehind: alignedStats.finalMixing[0]?.[2] ?? 0,
        builtGluonToCopy0: builtGluon[0] ?? 0,
        builtGluonToCopy1: builtGluon[1] ?? 0,
        builtGluonToCopy2: builtGluon[2] ?? 0,
        alignedGluonToCopy0: alignedGluon[0] ?? 0,
        alignedGluonToCopy1: alignedGluon[1] ?? 0,
        alignedGluonToCopy2: alignedGluon[2] ?? 0,
      },
      control: {
        committedDegeneracyExceptions: committedExceptions,
        committedReachCopy0: committedStats.reach[0] ?? 0,
        committedReachCopy1: committedStats.reach[1] ?? 0,
        committedReachCopy2: committedStats.reach[2] ?? 0,
        committedReachSplit: split(committedStats.reach),
        committedFinalSupportCopy0: committedStats.finalSupport[0] ?? 0,
        committedFinalSupportCopy1: committedStats.finalSupport[1] ?? 0,
        committedFinalSupportCopy2: committedStats.finalSupport[2] ?? 0,
        committedCirculantDefect: circulantDefect(committedStats.mixing),
        committedLeak: committedStats.leak,
        committedKeptCopy0: committedStats.mixing[0]?.[0] ?? 0,
        committedKeptCopy1: committedStats.mixing[1]?.[1] ?? 0,
        committedKeptCopy2: committedStats.mixing[2]?.[2] ?? 0,
        side: SIDE,
        beats: BEATS,
      },
      notes:
        'L2, exact, no random numbers. The degeneracy is what the triality forces, so its equality is a check of the symmetry reaching the observables, and it is gated against a control that breaks it. The numbers the symmetry leaves open are the three entries of the circulant table: kept, passed one copy ahead, passed one copy behind. Which copy a swap S lands a tone on depends on how the orbits were listed, a construction choice of E-FRC-0109 by line index, so the as-built and the aligned weave are both reported. Reach is at 6 beats on a side-11 box, mixing over 24 beats, where the periodic box has wrapped, which does not affect a charge total. Masses in the particle sense are not measured: neither triality weave has a free traveller (E-FRC-0111), so a dispersion relation has nothing to fit.',
    })
  },
})
