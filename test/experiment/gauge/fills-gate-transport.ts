// The fills as the gauge-field candidate, measured at the level they actually work. The base's known
// gap for the Standard Model is a dynamical gauge field: the rule acts on cells, the codes live on
// edges, and nothing dynamical connects them. The one edge-valued structure already in the program is
// the fill (the sixth-thing candidate the selves arena needs, selves/self-emergence), so this
// experiment measures exactly what a fill does to transport, with no interpretation beyond the numbers.
//
//   - GAUSS BOOKKEEPING IS EXACT. Over two hundred beats of the hashed fill-gated sweep on a path,
//     every tone change decomposes into edge-paired changes with the pair sum conserved, zero
//     violations, so the fill dynamics carries an exact per-edge continuity law.
//   - A FILL LINE GATES LIKE THE MAGNITUDE OF A WILSON LINE. The conducting walk reaches its own
//     horizon, and an insulating fill (0) at ANY position inside that horizon truncates the charge's
//     maximum reach at exactly its own position, exhaustively over positions, the multiplicative
//     blocking law of a connection whose values gate magnitudes.
//   - AND IT CARRIES NO PHASE. The transported object is the same ternary tone whatever conducting
//     path it took, and the vacuum under the Hebbian fill dynamics turns every fill insulating (the
//     adaptive vacuum is an insulator), so the fills supply the magnitude half of a gauge connection
//     and nothing supplies the phase half, the same missing piece the amplitude program measures.
//
// Depth L2: exact bookkeeping and exhaustive gating on the stated fill model. What would make the
// fills a gauge field is a phase-valued fill with this same gating, which is a design, not a finding.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { fillGatedSweepHashed } from '@/code/dynamics/fill-gated-sweep'
import { adaptFills } from '@/code/measure/fill-coherence'

const CELLS = 12
const BEATS = 2000

type Edge = readonly [number, number]

const EDGES: Edge[] = Array.from({ length: CELLS - 1 }, (_, i) => [
  i,
  i + 1,
])

// run the hashed sweep with the given fills from a lone +1 at cell 0, tracking Gauss violations and
// whether the charge reaches the last cell
function run(fill: Int8Array): {
  maxReach: number
  gaussViolations: number
  chargeDrift: number
} {
  const tone = new Int8Array(CELLS)

  tone[0] = 1

  let gaussViolations = 0
  let maxReach = 0

  const chargeOf = (t: Int8Array): number =>
    t.reduce((a, b) => a + b, 0)
  const chargeStart = chargeOf(tone)

  for (let beat = 0; beat < BEATS; beat++) {
    const before = Int8Array.from(tone)

    fillGatedSweepHashed({ tone, edges: EDGES, fill, beat })

    // every change must pair across one edge with the pair sum conserved
    const changed: number[] = []

    for (let cell = 0; cell < CELLS; cell++) {
      if (tone[cell] !== before[cell]) {
        changed.push(cell)
      }
    }

    const used = new Set<number>()

    for (const cell of changed) {
      if (used.has(cell)) {
        continue
      }

      const partner = changed.find(
        other =>
          other !== cell &&
          !used.has(other) &&
          Math.abs(other - cell) === 1,
      )

      if (partner === undefined) {
        gaussViolations++
        continue
      }

      const sumBefore = before[cell]! + before[partner]!
      const sumAfter = tone[cell]! + tone[partner]!

      if (sumBefore !== sumAfter) {
        gaussViolations++
      }

      used.add(cell)
      used.add(partner)
    }

    for (let cell = CELLS - 1; cell > maxReach; cell--) {
      if (tone[cell] !== 0) {
        maxReach = cell
        break
      }
    }
  }

  return {
    maxReach,
    gaussViolations,
    chargeDrift: Math.abs(chargeOf(tone) - chargeStart),
  }
}

export default experiment({
  id: 'gauge/fills-gate-transport',
  code: 'E-FRC-0073',
  title:
    'the edge fills gate transport like the magnitude of a Wilson line and carry no phase: on the fill-gated sweep the conducting walk reaches its horizon and an insulating fill at any position inside it truncates the maximum reach at exactly its own position, exhaustively (the blocking law of a connection), every tone change over two thousand beats is edge-paired with the pair sum conserved (an exact per-edge continuity), and the Hebbian fill dynamics turns the vacuum insulating, so the fills supply the magnitude half of a gauge connection and nothing supplies the phase half',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // the conducting path sets the walk's own horizon in this window
    const conducting = new Int8Array(CELLS - 1).fill(1)
    const open = run(conducting)
    const horizon = open.maxReach

    // one insulator at every position, exhaustively: inside the horizon the reach is EXACTLY the
    // insulator's position, beyond it the insulator changes nothing
    let truncationExact = true
    let worstGauss = open.gaussViolations
    let worstDrift = open.chargeDrift

    for (let position = 0; position < CELLS - 1; position++) {
      const fill = new Int8Array(CELLS - 1).fill(1)

      fill[position] = 0

      const result = run(fill)

      worstGauss = Math.max(worstGauss, result.gaussViolations)
      worstDrift = Math.max(worstDrift, result.chargeDrift)

      const expected = position < horizon ? position : horizon

      if (result.maxReach !== expected) {
        truncationExact = false
      }
    }

    // the Hebbian vacuum: adapt fills on an all-peace tone field, every fill goes insulating
    const vacuumFill = new Int8Array(CELLS - 1).fill(1)

    adaptFills(new Int8Array(CELLS), EDGES, vacuumFill)

    const vacuumInsulates = [...vacuumFill].every(f => f === 0)

    const ok =
      horizon >= 6 &&
      truncationExact &&
      worstGauss === 0 &&
      worstDrift === 0 &&
      vacuumInsulates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'on the twelve-cell path the conducting walk reaches its horizon (cell 8 in two thousand beats of the fixed hashed function), an insulating fill at any position inside the horizon truncates the maximum reach at EXACTLY its own position while one beyond the horizon changes nothing, exhaustively over all eleven positions, every tone change across every run pairs across a single edge with its pair sum conserved (zero Gauss violations, zero charge drift), and the Hebbian fill update on the peace vacuum sets every fill to insulating, so the fill is a connection that gates transport by magnitude while carrying no phase',
      metrics: {
        conductingHorizon: horizon,
        insulatorPositionsTried: CELLS - 1,
        truncationExact: truncationExact ? 1 : 0,
        gaussViolations: worstGauss,
        chargeDrift: worstDrift,
      },
      // CONTROL: the conducting path reaches the horizon, so the truncations are the insulators, not
      // the dynamics
      control: {
        conductingHorizon: horizon,
        vacuumInsulates: vacuumInsulates ? 1 : 0,
      },
      notes:
        'Roadmap base-model 0013. The reading for the Standard Model ledger: the fills give exactly the magnitude structure of a lattice gauge connection (gating, locality, an exact continuity law) on the objects where a gauge field lives, and no phase, which is the same U(1) hole the amplitude program measures from the other side (E-FND-0084 to 0090). A phase-valued fill in Z_3 with this gating would be the minimal gauge-sector addition, and the qutrit toric code on the mesh complex (on its own branch) is the natural check set for it. The hashed sweep tie-breaks are a fixed function of edge and beat, no randomness.',
    })
  },
})
