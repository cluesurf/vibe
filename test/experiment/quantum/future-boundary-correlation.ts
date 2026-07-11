// The two-ended route to flatness: a future boundary condition correlates
// spacelike-separated past points, and it does so causally.
//
// The reversible rule cannot spontaneously create distance-independent correlation
// (E-QTM-0030: a local seed manufactures none, only an initial-surface pattern is
// preserved). So a correlation that is flat in physical distance has to be anchored
// at a boundary. The past boundary is the origin (E-QTM-0036). The other boundary a
// reversible rule has is the FUTURE. This tests whether a future condition can
// stand in for the origin.
//
// The test is the connected three-point function of two spacelike-separated past
// points A and B with a future point F. If F lies in the common future of A and B
// (its backward cone reaches both), conditioning on F links them: the connected
// triple is nonzero even though A and B are uncorrelated on their own. If F is
// causally DISCONNECTED from A and B, conditioning on it does nothing, and the
// connected triple is exactly zero. So the test carries its own causal control.
//
// Measured result: the future apex (in the common future of A and B) produces a
// nonzero connected three-point correlation, while a causally-disconnected future
// point produces exactly zero. The two-state-vector mechanism (a future boundary
// correlating spacelike points) is present and causal on the rule. Honest caveat:
// in this classical reversible toy the effect is weak and short range, far from the
// strong flat correlation a Bell pair needs. The strong, flat version is the open
// problem, and it is what an emergent quantum layer or a fully two-ended boundary
// problem would have to supply.
//
// The ensemble is deterministic: the seed is swept over a grid of positions and
// three fixed phases, no randomness. Grade L2: a measured causal property of the
// rule (a future apex links spacelike points, a disconnected point does not) with a
// clean control.

import { squareMesh, meshNeighbors } from '@/code/tool/mesh'
import { makeWill, cellTone, Will } from '@/code/tone/will'
import { beat } from '@/code/rule/lattice-gas'
import { pairCollision } from '@/code/rule/collision'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const SIDE = 61
const T_MID = 5 // A and B are read here
const T_FINAL = 14 // F is read here; the apex backward cone has depth 9

export default experiment({
  id: 'quantum/future-boundary-correlation',
  code: 'E-QTM-0037',
  title:
    'a future point in the common future of two spacelike past points correlates them (a connected three-point signal), while a causally-disconnected future point gives exactly zero, the two-ended mechanism, causal',
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const mesh = squareMesh({ side: SIDE })

    meshNeighbors(mesh)

    const opposite = Array.from({ length: mesh.degree }, (_, d) =>
      mesh.opposite(d),
    )

    const collision = pairCollision({ opposite })
    const centre = SIDE >> 1

    const cellAt = (x: number, y: number): number =>
      (((y % SIDE) + SIDE) % SIDE) * SIDE + (((x % SIDE) + SIDE) % SIDE)

    const apex = cellAt(centre, centre) // in the common future of A and B
    const control = cellAt(centre + 20, centre + 20) // causally disconnected

    const tone = (cell: number, state: Will): number => {
      const value = cellTone(state, cell)

      return value > 0 ? 1 : value < 0 ? -1 : 0
    }

    const distances = [2, 4, 6, 8]

    // The deterministic ensemble: a 3x3 ternary seed swept over a grid of positions
    // and three phases.
    type Record = {
      a: number[]
      b: number[]
      apexValue: number
      controlValue: number
    }

    const records: Record[] = []

    for (let dy = -9; dy <= 9; dy++) {
      for (let dx = -9; dx <= 9; dx++) {
        for (let phase = 0; phase < 3; phase++) {
          const seedX = centre + dx
          const seedY = centre + dy
          const will = makeWill(mesh)

          for (let yy = -1; yy <= 1; yy++) {
            for (let xx = -1; xx <= 1; xx++) {
              const cell = cellAt(seedX + xx, seedY + yy)
              const base = cell * mesh.degree

              for (let k = 0; k < mesh.degree; k++) {
                will.data[base + k] =
                  ((((xx + yy + k + phase) % 3) + 3) % 3) - 1
              }
            }
          }

          let mid = will

          for (let t = 0; t < T_MID; t++) {
            mid = beat(mid, collision)
          }

          let future: Will = { ...mid, data: mid.data.slice() }

          for (let t = T_MID; t < T_FINAL; t++) {
            future = beat(future, collision)
          }

          records.push({
            a: distances.map(d =>
              tone(cellAt(centre - Math.ceil(d / 2), centre), mid),
            ),
            b: distances.map(d =>
              tone(cellAt(centre + Math.floor(d / 2), centre), mid),
            ),
            apexValue: tone(apex, future),
            controlValue: tone(control, future),
          })
        }
      }
    }

    const mean = (xs: number[]): number =>
      xs.reduce((s, x) => s + x, 0) / xs.length

    // The connected three-point function of A, B at separation index i with a future
    // point whose per-record values are `f`.
    const connectedTriple = (i: number, f: number[]): number => {
      const a = records.map(r => r.a[i] ?? 0)
      const b = records.map(r => r.b[i] ?? 0)
      const meanA = mean(a)
      const meanB = mean(b)
      const meanF = mean(f)
      const ab = mean(records.map(r => (r.a[i] ?? 0) * (r.b[i] ?? 0)))
      const abf = mean(
        records.map(
          (r, j) => (r.a[i] ?? 0) * (r.b[i] ?? 0) * (f[j] ?? 0),
        ),
      )

      const bf = mean(
        records.map((r, j) => (r.b[i] ?? 0) * (f[j] ?? 0)),
      )

      const af = mean(
        records.map((r, j) => (r.a[i] ?? 0) * (f[j] ?? 0)),
      )

      return (
        abf -
        meanA * bf -
        meanB * af -
        meanF * ab +
        2 * meanA * meanB * meanF
      )
    }

    const apexValues = records.map(r => r.apexValue)
    const controlValues = records.map(r => r.controlValue)

    let apexMax = 0
    let controlMax = 0

    for (let i = 0; i < distances.length; i++) {
      apexMax = Math.max(
        apexMax,
        Math.abs(connectedTriple(i, apexValues)),
      )

      controlMax = Math.max(
        controlMax,
        Math.abs(connectedTriple(i, controlValues)),
      )
    }

    // 1. The future apex (in the common future of A and B) creates a connected
    //    three-point correlation.
    const apexLinks = apexMax > 0.002

    // 2. The causally-disconnected control creates essentially none.
    const controlIsZero = controlMax < 0.001

    // 3. The causal contrast: the apex effect is well above the control.
    const causalContrast = apexMax > 3 * Math.max(controlMax, 1e-9)

    const solved = apexLinks && controlIsZero && causalContrast

    return verdict({
      status: solved ? 'pass' : 'fail',
      claim:
        'a future point in the common future of two spacelike-separated past points produces a nonzero connected three-point correlation between them, while a causally-disconnected future point produces exactly zero, so a future boundary condition correlates spacelike points and does so causally, the two-ended mechanism present on the rule',
      metrics: {
        apexTripleMax: apexMax,
        controlTripleMax: controlMax,
        ensemble: records.length,
        causalRatio: apexMax / Math.max(controlMax, 1e-9),
      },
      control: {
        // The causally-disconnected future point is the control: it shares no past
        // with A and B, so conditioning on it cannot link them, and the connected
        // triple is exactly zero. The apex effect being above it is the causal
        // signature. If the control were equally large, the effect would be an
        // artifact, not a future boundary condition.
        controlTripleMax: controlMax,
      },
      notes:
        'L2, deterministic (the seed is swept over a position grid and three phases, no random). The connected three-point function isolates the future linking A and B beyond their own correlation. The effect is real and causal (apex nonzero, disconnected control exactly zero) but WEAK and short range in this classical reversible toy: it is the mechanism, not yet the strong flat correlation a Bell pair needs. The strong, flat, distance-independent version is the open problem, the two-ended companion of the origin channel (E-QTM-0036).',
    })
  },
})
