// O2.3 (#2, rule-options-for-attraction), the reversible bound-state route. Integrable reversible systems have
// breathers, localized time-periodic bound states, with no dissipation and no bath. We test whether the
// committed rule on the D4 coin admits one, and whether it can MOVE (the integrable moving-soliton promise).
//
// A symmetric charge packet under the pair table CONFINES into a breather, the conserving interaction reflects
// charge that reaches the packet edge back inward, so the packet stays spatially bounded while its occupancy
// breathes in and out, periodic in time, charge exactly conserved, and the whole thing reversible. The control,
// streaming alone (pass-through), lets the packet spread to a much larger extent. So a reversible bound
// oscillating state EXISTS on the committed coin.
//
// But it is PINNED. A packet launched with net momentum does not translate as a bound breather, it stays put (the
// confinement is reflection, which has zero net velocity). So the integrable MOVING breather, a bound state that
// also travels, does NOT arise from the committed rule, consistent with the single-speed obstruction
// (selves/bind-and-move-collision). Reversible binding yes, moving reversible binding no.
//
// Depth L2, a reversible breather demonstrated on the committed coin with a streaming control, and the honest
// negative that it cannot be made to move.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, shellDistances, type Mesh } from '@/code/tool/mesh'
import { makeWill, cellTone, type Will } from '@/code/tone/will'
import { pairCollision, passThrough } from '@/code/rule/collision'
import { beatInto, streamSourceTable } from '@/code/rule/lattice-gas'
import { conservesCharge, isReversible } from '@/code/check/invariant'
import { travelDistance } from '@/code/check/structure'

export default experiment({
  id: 'selves/integrable-breather',
  title:
    'a reversible breather (bound oscillating state) exists on the D4 coin, but it is pinned, no moving breather',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const side = 16
    const beats = 64
    const mesh: Mesh = d4Mesh({ side })
    const degree = mesh.degree
    const opposite = Array.from({ length: degree }, (_, d) =>
      mesh.opposite(d),
    )

    const forward = pairCollision({ opposite, forward: true })
    const inverse = pairCollision({ opposite, forward: false })
    const half = side / 2
    const center =
      half +
      half * side +
      half * side * side +
      half * side * side * side

    const dist = shellDistances(mesh, center)
    const table = streamSourceTable(mesh) // precompute the stream gather once, reused for every beat

    // a symmetric block packet, +1 in all slots of cells within radius 2 of the centre (zero net momentum).
    const packet = (): Will => {
      const will = makeWill(mesh)

      for (let c = 0; c < mesh.cellCount; c++) {
        if (dist[c]! >= 0 && dist[c]! <= 2) {
          const base = c * degree

          for (let d = 0; d < degree; d++) {
            will.data[base + d] = 1
          }
        }
      }

      return will
    }

    // charge-weighted mean shell-distance of the NET charge from the centre (ignores the charge-neutral vacuum
    // pairs the create move makes, so it tracks the packet itself, not the vacuum fill).
    const meanDistance = (will: Will): number => {
      let weight = 0
      let weighted = 0

      for (let c = 0; c < mesh.cellCount; c++) {
        const q = Math.abs(cellTone(will, c))

        if (q !== 0) {
          weight += q
          weighted += q * dist[c]!
        }
      }

      return weight > 0 ? weighted / weight : 0
    }

    // trace the NET-charge extent (travelDistance) and centroid distance over the run.
    const trace = (
      init: Will,
      collision: ReturnType<typeof pairCollision>,
    ) => {
      let current = init
      let scratch: Will = {
        mesh,
        data: new Int8Array(current.data.length),
      }

      let extentMax = 0
      let meanMin = Infinity
      let meanMax = 0

      for (let t = 0; t < beats; t++) {
        beatInto({ src: current, dst: scratch, table, collision })
        const swap = current
        current = scratch
        scratch = swap
        const ext = travelDistance({ will: current, start: center })
        const mean = meanDistance(current)

        if (ext > extentMax) {
          extentMax = ext
        }

        if (mean < meanMin) {
          meanMin = mean
        }

        if (mean > meanMax) {
          meanMax = mean
        }
      }

      return { extentMax, meanMin, meanMax }
    }

    const breather = trace(packet(), forward)
    const spread = trace(packet(), passThrough)
    const chargeOk = conservesCharge(packet(), forward, beats)
    const reversible = isReversible(packet(), forward, beats, inverse)

    // a packet launched with net momentum, +1 only in direction 0, to test a MOVING breather.
    const launched = (): Will => {
      const will = makeWill(mesh)

      for (let c = 0; c < mesh.cellCount; c++) {
        if (dist[c]! >= 0 && dist[c]! <= 2) {
          will.data[c * degree + 0] = 1
        }
      }

      return will
    }

    const launchedTrace = trace(launched(), forward)

    // the symmetric breather, the net charge stays CONFINED (small extent) where streaming spreads it, and it
    // BREATHES (its centroid oscillates), with charge conserved and reversible.
    const confined = breather.extentMax <= spread.extentMax - 3
    const breathes = breather.meanMax - breather.meanMin >= 0.5
    // the launched packet is also a breather, it stays COMPACT (extent bounded, it did not fly off) and its
    // centroid WOBBLES, but it does not translate, a pinned breather, no moving breather.
    const launchedCompact =
      launchedTrace.extentMax <= breather.extentMax + 2

    const launchedWobbles =
      launchedTrace.meanMax - launchedTrace.meanMin >= 0.5

    const pinnedNotMoving = launchedCompact && launchedWobbles

    const ok =
      confined && breathes && chargeOk && reversible && pinnedNotMoving

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a symmetric packet under the committed pair table confines into a reversible breather, its net charge stays bounded where streaming spreads it, its centroid oscillates (it breathes), charge is exactly conserved and the evolution is reversible, and a packet launched with net momentum stays compact and merely wobbles in place rather than translating, so a reversible bound oscillating state exists on the committed coin but it is PINNED, there is no moving breather',
      metrics: {
        breatherExtentMax: breather.extentMax,
        spreadExtentMax: spread.extentMax,
        breatherMeanMin: breather.meanMin,
        breatherMeanMax: breather.meanMax,
        chargeConserved: chargeOk ? 1 : 0,
        reversible: reversible ? 1 : 0,
        launchedExtentMax: launchedTrace.extentMax,
        launchedMeanMin: launchedTrace.meanMin,
        launchedMeanMax: launchedTrace.meanMax,
        confined: confined ? 1 : 0,
        breathes: breathes ? 1 : 0,
        pinnedNotMoving: pinnedNotMoving ? 1 : 0,
        beats,
      },
      control: { spreadExtentMax: spread.extentMax },
      notes:
        'reversible breathers (bound oscillating states) exist on the committed coin from confinement, no bath needed (charge stays confined to a small extent while streaming spreads it, the centroid oscillates, charge conserved, reversible). But they are PINNED, a launched packet stays compact and wobbles in place rather than translating, so the integrable MOVING breather does not arise (the single-speed obstruction again). So #2 supplies reversible BOUND states but not mobile ones',
    })
  },
})
