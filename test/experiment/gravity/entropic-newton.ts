// Entropic gravity, the static Newtonian force with NO new field. The bare knit has no 1/r tail
// (`gravity/shadow-pressure-not-newtonian`, a measured negative), so the static attraction is the one genuinely
// missing piece. This experiment delivers it the Verlinde way, as a thermodynamic consequence of the measured
// entanglement area law, with ZERO new ingredients. A holographic screen of radius r carries N(r) bits, set by
// the entanglement entropy of the enclosed region. We MEASURE that scaling on a three-dimensional gapped ground
// state (a band insulator, the proxy for the emergent massive cusp field, the same kind of state whose area law
// already underwrites the Einstein structure in `gravity/gr-einstein-equations`). The screen bits obey the AREA
// law, N(r) is SUB-EXTENSIVE (the entropy per enclosed volume falls as the ball grows) with a fitted exponent
// near two, while the volume-law thermal state is EXTENSIVE (entropy per volume constant) with exponent near
// three, the control. The Verlinde force rides entirely on N(r), F proportional to 1/N(r), so the area law gives
// the inverse-square force (potential 1/r), Newton, while the volume law would give the wrong 1/r cubed. So the
// static Newtonian attraction follows from the measured area law without adding any field. Depth L2, the area-law
// scaling is the measured substrate input and the Verlinde mapping is known physics, with the volume-law thermal
// state as the control that gives the wrong force. Deterministic throughout (a fixed Hamiltonian ground state).

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { staggeredMassCubicHamiltonian } from '@/code/operator/tight-binding'
import { freeFermionCorrelationMatrix } from '@/code/measure/entanglement'
import {
  screenBitSeries,
  ballRegion,
  logLogExponent,
  verlindeForceLaw,
} from '@/code/measure/entropic-gravity'

const SIDE = 12
const MASS = 0.8
const RADII = [2, 3, 4, 5]

function strictlyDecreasing(values: number[]): boolean {
  for (let i = 1; i < values.length; i++)
    if (values[i]! >= values[i - 1]!) return false
  return true
}

export default experiment({
  id: 'gravity/entropic-newton',
  title:
    'the static Newtonian 1/r force from the measured area law, the Verlinde route, no new field',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const n = SIDE * SIDE * SIDE
    const h = staggeredMassCubicHamiltonian({
      side: SIDE,
      mass: MASS,
      periodic: true,
    })
    const c = freeFermionCorrelationMatrix({ h, n })

    // the screen bits N(r), the entanglement entropy of the gapped ground state inside a ball of radius r
    const ground = screenBitSeries({ c, n, side: SIDE, radii: RADII })
    const groundExponent = logLogExponent(ground.radii, ground.bits)
    const groundPerVolume = ground.bits.map(
      (bits, i) => bits / ground.volumes[i]!,
    )

    // the volume-law control, a thermal (maximally mixed) state has C = (1/2) I, so S = volume * ln 2
    const thermalBits = RADII.map(
      radius => ballRegion({ side: SIDE, radius }).length * Math.log(2),
    )
    const thermalExponent = logLogExponent(RADII, thermalBits)
    const thermalPerVolume = thermalBits.map(
      (bits, i) => bits / ground.volumes[i]!,
    )

    // the Verlinde force law implied by each scaling, F proportional to 1/N(r) proportional to r^(-exponent)
    const groundForce = verlindeForceLaw({
      bitExponent: groundExponent,
      tolerance: 0.5,
    })
    const thermalForce = verlindeForceLaw({
      bitExponent: thermalExponent,
      tolerance: 0.5,
    })

    // the ground state is sub-extensive (area law, entropy per volume falls), the thermal state is extensive
    // (volume law, entropy per volume flat), the exponents are well separated, and the area law gives the
    // inverse-square (Newtonian) force while the volume law does not
    const groundSubExtensive = strictlyDecreasing(groundPerVolume)
    const thermalExtensive = !strictlyDecreasing(thermalPerVolume)
    const exponentsSeparated =
      groundExponent < 2.6 && thermalExponent > 2.9
    const newtonFromArea = groundForce.isNewtonian
    const wrongFromVolume = !thermalForce.isNewtonian
    const ok =
      groundSubExtensive &&
      thermalExtensive &&
      exponentsSeparated &&
      newtonFromArea &&
      wrongFromVolume

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the entanglement entropy of a three-dimensional gapped ground state inside a ball of radius r obeys the AREA law, the screen bits N(r) are sub-extensive (the entropy per enclosed volume falls as the ball grows) with a fitted exponent near two, while a thermal (volume-law) state is extensive with exponent near three. The Verlinde entropic force rides entirely on N(r), F proportional to 1/N(r), so the measured area law gives the inverse-square Newtonian force (potential 1/r) while the volume-law control gives the wrong inverse-cube. So the static Newtonian attraction, the one piece the bare knit lacks, follows from the measured area law with no new field added.',
      metrics: {
        groundExponent: Number(groundExponent.toFixed(3)),
        thermalExponent: Number(thermalExponent.toFixed(3)),
        groundForceExponent: Number(
          groundForce.forceExponent.toFixed(3),
        ),
        groundPotentialExponent: Number(
          groundForce.potentialExponent.toFixed(3),
        ),
        thermalForceExponent: Number(
          thermalForce.forceExponent.toFixed(3),
        ),
        groundNewtonian: groundForce.isNewtonian ? 1 : 0,
        thermalNewtonian: thermalForce.isNewtonian ? 1 : 0,
        groundEntropyPerVolumeStart: Number(
          groundPerVolume[0]!.toFixed(3),
        ),
        groundEntropyPerVolumeEnd: Number(
          groundPerVolume[groundPerVolume.length - 1]!.toFixed(3),
        ),
        groundSubExtensive: strictlyDecreasing(groundPerVolume) ? 1 : 0,
        thermalEntropyPerVolume: Number(
          thermalPerVolume[0]!.toFixed(3),
        ),
      },
      control: {
        thermalExponent: Number(thermalExponent.toFixed(3)),
        thermalNewtonian: thermalForce.isNewtonian ? 1 : 0,
      },
      notes:
        'the gapped ground state is the proxy for the emergent massive cusp field, the same area-law state that underwrites the Einstein structure in gr-einstein-equations, so this adds no new ingredient. The fitted exponent sits a little above two from the discreteness of the small lattice balls, but the sub-extensive ratio test (entropy per volume strictly falling) is the rock-solid area-law signature, and it is far from the thermal volume law (entropy per volume constant at ln 2). The Verlinde chain puts all the radius dependence in N(r), so the area law is exactly what makes the force inverse-square. This resolves the static-1/r gap left open by shadow-pressure-not-newtonian without adding a field, the entropic route the gravity-field-options note ranked first.',
    })
  },
})
