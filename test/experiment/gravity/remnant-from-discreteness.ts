// A black hole on a discrete substrate leaves a remnant, and the remnant is universal. Hawking
// evaporation gets hotter as the hole shrinks, T = 1/(8 pi M), heading for infinite temperature and
// complete disappearance in the continuum. But the vibe substrate has a discrete beat, so it carries
// no dynamical frequency above a maximum omega_max, and hence no radiation hotter than T_max =
// omega_max/(2 pi). Evaporation therefore cannot pass the mass where T = T_max; it halts there at a
// stable remnant of mass 1/(4 omega_max).
//
// The cutoff omega_max is not asserted: it is MEASURED from the substrate's own dynamics. The coined
// Dirac walk (the {3,4,3,4} coin's single-particle sector) is simulated beat by beat and its dispersion
// read off by DFT (code/dynamics/quantum-walk, measuredCoinedWalkFrequency), and the highest frequency
// it carries, the band edge, is the substrate's discreteness cutoff. So the discreteness input to the
// remnant is a measured property of the rule, near the Nyquist ceiling pi as the discrete beat
// requires.
//
// This is the vibe answer to the 7-dimensional G2-torsion remnant proposal (Pincak et al., 2026): a
// remnant needs no extra dimensions and no new repulsive force, only the substrate's measured
// discreteness. Shown, plus a control:
// - UNIVERSAL: holes started at masses spanning three orders of magnitude all evaporate down to the
//   SAME remnant mass, a Planckian relic, not a scaled-down hole.
// - SCALING: the remnant mass is exactly 1/(4 omega_max), so a finer beat (larger omega_max) leaves a
//   smaller remnant.
// - CONTROL: the continuum limit (omega_max to infinity, no discreteness) leaves NO remnant, the hole
//   evaporates to the numerical floor. Remove the substrate's discreteness and the remnant vanishes.
//
// Depth L2. The discreteness cutoff is MEASURED from the substrate's own walk, but the Hawking
// thermodynamics is the analytic Schwarzschild law, not derived from the substrate, so this is a
// known-physics bridge with a measured cutoff, honestly labeled. The L3 step is to read the cutoff off
// a measured analog-Hawking emission spectrum saturating at the band edge.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { remnantMass, evaporateWithCutoff } from '@/code/measure/remnant'
import { measuredCoinedWalkFrequency } from '@/code/dynamics/quantum-walk'

const INITIAL_MASSES = [1, 8, 64, 512]
const WALK_SIZE = 64
const WALK_MASS = 0.05 // near-massless walk, so the band edge is near the Nyquist ceiling
const WALK_BEATS = 200

// the substrate's discreteness cutoff: the highest frequency the simulated coined Dirac walk carries,
// read off its measured dispersion (the band edge)
function measuredBandEdge(): number {
  let maxFrequency = 0

  for (let index = 1; index < WALK_SIZE / 2; index++) {
    const frequency = Math.abs(
      measuredCoinedWalkFrequency({
        wavenumberIndex: index,
        size: WALK_SIZE,
        mass: WALK_MASS,
        beats: WALK_BEATS,
      }),
    )
    maxFrequency = Math.max(maxFrequency, frequency)
  }

  return maxFrequency
}

export default experiment({
  id: 'gravity/remnant-from-discreteness',
  code: 'E-GRV-0051',
  title:
    'a black hole on a discrete substrate leaves a universal remnant: the cutoff frequency measured from the coined Dirac walk\'s own dispersion caps the Hawking temperature, so evaporation halts at mass 1/(4 omega_max) regardless of starting mass, and the remnant vanishes in the continuum control, no extra dimensions or torsion needed',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const bandEdge = measuredBandEdge()
    const remnant = remnantMass(bandEdge)

    // UNIVERSAL: every starting mass halts at the same remnant
    let worstUniversalityDeviation = 0

    for (const initialMass of INITIAL_MASSES) {
      const result = evaporateWithCutoff({ initialMass, maxFrequency: bandEdge })
      worstUniversalityDeviation = Math.max(
        worstUniversalityDeviation,
        Math.abs(result.finalMass - remnant) / remnant,
      )
    }

    // SCALING: remnant = 1/(4 omega_max), so doubling the cutoff halves the remnant
    const remnantHalf = remnantMass(bandEdge / 2)
    const remnantDouble = remnantMass(bandEdge * 2)
    const scalingHolds =
      Math.abs(remnantHalf / remnant - 2) < 1e-9 &&
      Math.abs(remnantDouble / remnant - 0.5) < 1e-9

    // CONTROL: the continuum (no cutoff) evaporates fully, no remnant
    const continuum = evaporateWithCutoff({
      initialMass: 512,
      maxFrequency: Infinity,
    })

    // the measured cutoff is near the Nyquist ceiling, as the discrete beat requires
    const nearNyquist = bandEdge > 2.8 && bandEdge <= Math.PI + 1e-9

    const universal = worstUniversalityDeviation < 1e-2
    const continuumEvaporatesFully =
      continuum.finalMass < 1e-5 && !continuum.halted

    const ok =
      universal &&
      scalingHolds &&
      continuumEvaporatesFully &&
      nearNyquist

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the cutoff frequency measured from the simulated coined Dirac walk dispersion is near the Nyquist ceiling, and using it, holes started at masses from 1 to 512 all evaporate down to the same remnant mass 1/(4 omega_max) (universal to better than one percent), the remnant scales exactly as 1/(4 omega_max), and in the continuum limit with no discreteness the hole evaporates to nothing, so a stable Planckian remnant is forced by the substrate discreteness measured from the rule',
      metrics: {
        measuredBandEdge: Number(bandEdge.toFixed(4)),
        remnantMass: Number(remnant.toFixed(6)),
        worstUniversalityDeviation: Number(
          worstUniversalityDeviation.toExponential(2),
        ),
        remnantAtHalfCutoff: Number(remnantHalf.toFixed(6)),
      },
      // CONTROL: the continuum limit leaves no remnant (full evaporation).
      control: {
        continuumFinalMass: Number(continuum.finalMass.toExponential(2)),
        continuumHalted: continuum.halted ? 1 : 0,
      },
      notes:
        'Remnant from discreteness, with the cutoff MEASURED from the coined Dirac walk\'s own dispersion (not asserted). The vibe alternative to the Pincak 7D G2-torsion remnant: only reversibility (info preserved) and measured discreteness (a floor). L2 (Hawking law still analytic). Reuses code/measure/remnant, code/dynamics/quantum-walk.',
    })
  },
})
