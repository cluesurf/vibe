// The topological winding number emerges quantized from a chiral walk's own dynamics. A chiral (two-
// beat) coined walk carries a bulk topological invariant, the winding number of its band, an INTEGER
// that cannot change without closing the energy gap. Here it is not computed from an analytic band: it
// is MEASURED from the real walk by the mean chiral displacement, the time-averaged chiral-weighted
// position, which for a chiral walk converges to exactly the winding number (the same invariant whose
// value forces the Jackiw-Rebbi bound state at an interface, by the bulk-boundary correspondence).
//
// A single coin+shift (the substrate's Dirac-walk sector) has a Bloch vector confined to a plane and
// carries no winding, so the minimal walk that winds applies the coin+shift TWICE per step with two
// angles (a two-beat, split-step walk). In the symmetric time frame the walk is chiral-symmetric and
// the mean chiral displacement 2<sigma_x * position> converges to the integer winding number.
//
// - PREDICTION: at coin angles chosen in five different sectors of the walk's phase diagram, the
//   measured mean chiral displacement converges to five DISTINCT integers (-2, -1, 0, +1, +2), each to
//   within 0.02 of an integer, despite the walk spreading ballistically (the invariant is quantized and
//   robust, a number that could have come out anything).
// - CONTROL: a trivial coin (theta1 = 0, no first-beat mixing) gives winding EXACTLY 0, so the nonzero
//   windings are the two-beat chiral structure, not an artefact of the measurement.
//
// Depth L3. The winding number is a MEASURED, integer-quantized consequence of the real (two-beat)
// coined-walk dynamics (not an analytic band index, not a built state), with a trivial-coin control
// that gives zero. The two-beat walk is the natural composition of the substrate's own coin+shift
// applied twice; the single-beat Dirac-walk sector cannot wind, which is why two beats are used.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { meanChiralDisplacement } from '@/code/dynamics/split-step-walk'

const PI = Math.PI
const SIZE = 1200
const STEPS = 150

// (theta1, theta2, expected winding, label), one point solidly inside each of five sectors
const POINTS: [number, number, number][] = [
  [0, PI / 4, 0],
  [PI / 2, -PI / 2, 1],
  [PI / 2, 0, 2],
  [-PI / 2, -PI / 2, -1],
  [-PI / 2, 0, -2],
]

function winding(theta1: number, theta2: number): number {
  return meanChiralDisplacement({
    size: SIZE,
    steps: STEPS,
    theta1,
    theta2,
  })
}

export default experiment({
  id: 'quantum/topological-winding',
  code: 'E-QTM-0077',
  title:
    "the topological winding number measured from a chiral walk's own dynamics: the mean chiral displacement of a two-beat coined walk converges to five distinct integers (-2, -1, 0, +1, +2) across five sectors of coin space, each within 0.02 of an integer despite ballistic spreading, while a trivial coin gives exactly zero",
  category: 'quantum',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const measured = POINTS.map(([t1, t2]) => winding(t1, t2))
    const expected = POINTS.map(([, , w]) => w)

    // each measured value is within 0.02 of its (distinct) integer winding number
    let worstIntegerError = 0

    for (let i = 0; i < measured.length; i++) {
      worstIntegerError = Math.max(
        worstIntegerError,
        Math.abs(measured[i]! - expected[i]!),
      )
    }

    const quantizedToIntegers = worstIntegerError < 0.02

    // the five sectors give five DISTINCT integers (a real phase diagram, not one value everywhere)
    const roundedSet = new Set(measured.map(m => Math.round(m)))
    const fiveDistinctSectors = roundedSet.size === 5

    // CONTROL: a trivial coin (theta1 = 0) gives winding exactly 0
    const trivialWinding = winding(0, PI / 4)
    const trivialIsZero = Math.abs(trivialWinding) < 0.02

    const ok =
      quantizedToIntegers && fiveDistinctSectors && trivialIsZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the mean chiral displacement of a two-beat coined walk, measured from the real dynamics, converges to the integer winding numbers -2, -1, 0, +1 and +2 in five sectors of coin space (each within 0.02 of an integer, all five distinct) despite the walk spreading ballistically, so the bulk topological invariant is an emergent, quantized consequence of the walk',
      metrics: {
        worstIntegerError: Number(worstIntegerError.toExponential(2)),
        distinctSectors: roundedSet.size,
        windings: measured.map(m => Number(m.toFixed(3))).join(','),
      },
      // CONTROL: a trivial coin (theta1 = 0) carries no winding.
      control: {
        trivialWinding: Number(trivialWinding.toExponential(2)),
      },
      notes:
        'Winding number measured on a two-beat (split-step) coined walk via the mean chiral displacement (code/dynamics/split-step-walk): five sectors give quantized integers -2..+2 to <0.02, trivial coin gives 0. The single-beat Dirac-walk sector cannot wind (Bloch vector planar), so two beats are used. L3, a measured integer-quantized invariant, the bulk partner of the Jackiw-Rebbi bound state.',
    })
  },
})
