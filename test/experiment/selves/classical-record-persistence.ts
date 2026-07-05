// Vibe-to-Hameroff bridge (Orch-OR): the thing that persists is the classical record,
// not a coherent phase, shown spatially. Orch-OR needs a coherent quantum pattern to
// survive intact between collapses. Vibe's persistent structure is a classical settled
// record, and this experiment shows its SPATIAL pattern holds over time while a coherent
// (closed, reversible) field does not, the spatial companion to the scalar record-drift
// in decoherence-immunity (E-QTM-0049).
//
// A localized body is seeded (a deterministic pattern in a band, the rest at peace) and
// coupled to the open growing edge, where it settles into a classical record with a
// definite spatial occupancy profile. Its per-beat slab-occupancy field has real spatial
// structure (unlike a mesh-filling pattern, whose profile is flat), so the lag
// autocorrelation of the field over time is a genuine measure of whether the spatial
// pattern persists. The record's autocorrelation stays high across lags (the pattern
// holds), the deterministic form of a stable bound pattern that needs no coherence.
//
// The control is the SAME body run CLOSED (no wake): the reversible bulk keeps reshuffling
// its fine phase, so its coarse profile does not lock into a stable pattern and its lag
// autocorrelation is low or negative. So the persistent spatial structure is the classical
// record made by the settling on the wake, not the coherent phase, which is exactly the
// bridge's point that vibe's persistence carries no coherence bill.
//
// Depth L2. It measures the lag autocorrelation of the coarse field along the substrate's
// own settling dynamics, with a closed control, and reads it against the Orch-OR bridge.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh } from '@/code/tool/mesh'
import { makeWill, fillWillPattern } from '@/code/tone/will'
import { pairCollision, type Collision } from '@/code/rule/collision'
import { streamSourceTable } from '@/code/rule/lattice-gas'
import { slabOccupancySeries } from '@/code/dynamics/measurement'
import { lagAutocorrelation } from '@/code/measure/persistence'

const SIDE = 8
const BEATS = 200
const BAND_START = 3
const BAND_WIDTH = 3
const LAGS = [5, 20, 50, 100]

export default experiment({
  id: 'selves/classical-record-persistence',
  code: 'E-SLF-0162',
  title:
    'the classical record holds its spatial pattern over time while a coherent field disperses, the spatial form of coherence-free persistence (Hameroff bridge)',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: SIDE })
    const side = SIDE
    const degree = mesh.degree

    // a localized body: fill a deterministic pattern, then hold to peace every cell whose
    // x is outside the band, so the coarse profile has real spatial structure
    const init = makeWill(mesh)
    fillWillPattern(init)

    for (let cell = 0; cell < mesh.cellCount; cell++) {
      const x = cell % side

      if (x < BAND_START || x >= BAND_START + BAND_WIDTH) {
        const base = cell * degree

        for (let d = 0; d < degree; d++) {
          init.data[base + d] = 0
        }
      }
    }

    const opposite = Array.from({ length: degree }, (unused, d) =>
      mesh.opposite(d),
    )

    const forward: Collision = pairCollision({
      opposite,
      forward: true,
    })
    const table = streamSourceTable(mesh)

    const recordSeries = slabOccupancySeries({
      init,
      forward,
      table,
      beats: BEATS,
      open: true,
      frontierX: 0,
    })

    const closedSeries = slabOccupancySeries({
      init,
      forward,
      table,
      beats: BEATS,
      open: false,
      frontierX: 0,
    })

    let minRecordAutocorr = Infinity
    let maxClosedAutocorr = -Infinity

    const perLag: Record<string, number> = {}

    for (const lag of LAGS) {
      const recordAutocorr = lagAutocorrelation({
        series: recordSeries,
        lag,
      })
      const closedAutocorr = lagAutocorrelation({
        series: closedSeries,
        lag,
      })
      minRecordAutocorr = Math.min(minRecordAutocorr, recordAutocorr)
      maxClosedAutocorr = Math.max(maxClosedAutocorr, closedAutocorr)
      perLag[`record_lag${lag}`] = Number(recordAutocorr.toFixed(4))
      perLag[`closed_lag${lag}`] = Number(closedAutocorr.toFixed(4))
    }

    const recordPersists = minRecordAutocorr > 0.5
    const closedDisperses = maxClosedAutocorr < 0.2
    const separated = minRecordAutocorr - maxClosedAutocorr > 0.4
    const ok = recordPersists && closedDisperses && separated

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the classical record on the open edge holds its spatial occupancy pattern over time (lag autocorrelation above 0.5 across lags to 100 beats) while the same body run closed does not lock into a stable pattern (autocorrelation below 0.2), so the persistent spatial structure is the classical record made on the wake, not a coherent phase, and vibe needs no coherence to carry a stable bound pattern',
      metrics: {
        minRecordAutocorr: Number(minRecordAutocorr.toFixed(4)),
        maxClosedAutocorr: Number(maxClosedAutocorr.toFixed(4)),
        separation: Number(
          (minRecordAutocorr - maxClosedAutocorr).toFixed(4),
        ),
        ...perLag,
      },
      // CONTROL: the same body run CLOSED (no wake) does not hold a stable spatial pattern.
      control: {
        maxClosedAutocorr: Number(maxClosedAutocorr.toFixed(4)),
      },
      notes:
        'Hameroff / Orch-OR bridge (author-bridges/stuart-hameroff.md), the spatial companion to the scalar record-drift in decoherence-immunity (E-QTM-0049). Uses a localized body so the coarse profile has spatial variance, the fix for the degenerate flat-profile probe.',
    })
  },
})
