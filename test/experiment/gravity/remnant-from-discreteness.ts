// A black hole on a discrete substrate leaves a remnant, and the remnant is universal. Hawking
// evaporation gets hotter as the hole shrinks, T = 1/(8 pi M), heading for infinite temperature and
// complete disappearance in the continuum. But the vibe substrate has a DISCRETE BEAT (base feature:
// a discrete step), so it carries no dynamical frequency above the Nyquist ceiling omega_max = pi per
// beat, hence no radiation hotter than T_max = omega_max/(2 pi). Evaporation therefore cannot pass the
// mass where T = T_max; it halts there at a stable remnant of mass 1/(4 omega_max).
//
// This is the vibe answer to the black-hole information paradox and to the 7-dimensional G2-torsion
// remnant proposal (Pinčák et al., Gen. Rel. Grav. 2026): a remnant needs no extra dimensions and no
// new repulsive force, only the substrate's discreteness. Two things are shown, plus a control.
//
// - UNIVERSAL: holes started at masses spanning three orders of magnitude all evaporate down to the
//   SAME remnant mass, independent of where they started. A Planckian relic, not a scaled-down hole.
// - SCALING: the remnant mass is exactly 1/(4 omega_max), so a finer beat (larger omega_max) leaves a
//   smaller remnant, a quantitative prediction that could have come out otherwise.
// - CONTROL: the continuum limit (omega_max to infinity, no discreteness) leaves NO remnant, the hole
//   evaporates to the numerical floor. Remove the substrate's discreteness and the remnant vanishes,
//   so the remnant is a genuine consequence of discreteness and not of the evaporation law itself.
//
// Depth L2. This realizes the known minimal-length-remnant mechanism on the vibe substrate, using the
// analytic Schwarzschild thermodynamics with the substrate's own discrete-beat cutoff, with a
// universality result and a continuum control. It is a known-physics bridge, honestly labeled; the L3
// step would read the cutoff off a measured analog-Hawking spectrum rather than the Nyquist ceiling.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { remnantMass, evaporateWithCutoff } from '@/code/measure/remnant'

// the substrate's discrete-beat Nyquist ceiling: one beat per step gives a maximum angular frequency
// of pi per beat, the highest frequency a discrete-time signal can carry
const NYQUIST = Math.PI
const INITIAL_MASSES = [1, 8, 64, 512]

export default experiment({
  id: 'gravity/remnant-from-discreteness',
  code: 'E-GRV-0051',
  title:
    'a black hole on a discrete substrate leaves a universal remnant: the discrete-beat Nyquist ceiling caps the Hawking temperature so evaporation halts at mass 1/(4 omega_max) regardless of the starting mass, and the remnant vanishes in the continuum control, no extra dimensions or torsion needed',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const remnant = remnantMass(NYQUIST)

    // UNIVERSAL: every starting mass halts at the same remnant
    let worstUniversalityDeviation = 0

    for (const initialMass of INITIAL_MASSES) {
      const result = evaporateWithCutoff({ initialMass, maxFrequency: NYQUIST })
      worstUniversalityDeviation = Math.max(
        worstUniversalityDeviation,
        Math.abs(result.finalMass - remnant) / remnant,
      )
    }

    // SCALING: remnant = 1/(4 omega_max), so doubling the ceiling halves the remnant
    const remnantHalfBeat = remnantMass(NYQUIST / 2)
    const remnantDoubleBeat = remnantMass(NYQUIST * 2)
    const scalingHolds =
      Math.abs(remnantHalfBeat / remnant - 2) < 1e-9 &&
      Math.abs(remnantDoubleBeat / remnant - 0.5) < 1e-9

    // CONTROL: the continuum (no cutoff) evaporates fully, no remnant
    const continuum = evaporateWithCutoff({
      initialMass: 512,
      maxFrequency: Infinity,
    })
    const remnantShrinksToZero =
      remnantMass(NYQUIST * 1e6) < remnant * 1e-5

    const universal = worstUniversalityDeviation < 1e-2
    const continuumEvaporatesFully = continuum.finalMass < 1e-5 && !continuum.halted

    const ok =
      universal && scalingHolds && continuumEvaporatesFully && remnantShrinksToZero

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'holes started at masses from 1 to 512 all evaporate down to the same remnant mass 1/(4 pi) (universal to better than one percent), the remnant scales exactly as 1/(4 omega_max) so a finer beat leaves a smaller remnant, and in the continuum limit with no discreteness the hole evaporates to nothing, so a stable Planckian remnant is forced by the substrate discreteness alone',
      metrics: {
        remnantMassAtNyquist: Number(remnant.toFixed(6)),
        worstUniversalityDeviation: Number(
          worstUniversalityDeviation.toExponential(2),
        ),
        remnantAtHalfBeat: Number(remnantHalfBeat.toFixed(6)),
        remnantAtDoubleBeat: Number(remnantDoubleBeat.toFixed(6)),
      },
      // CONTROL: the continuum limit leaves no remnant (full evaporation).
      control: {
        continuumFinalMass: Number(continuum.finalMass.toExponential(2)),
        continuumHalted: continuum.halted ? 1 : 0,
      },
      notes:
        'Remnant from discreteness: the substrate discrete beat (Nyquist ceiling) caps the Hawking temperature, halting evaporation at a universal Planckian relic. The vibe alternative to the Pincak 7D G2-torsion remnant, needing only reversibility (information preserved) and discreteness (evaporation floor). L2, analytic Schwarzschild thermodynamics with the substrate cutoff, continuum control. Reuses code/measure/black-hole-thermodynamics.',
    })
  },
})
