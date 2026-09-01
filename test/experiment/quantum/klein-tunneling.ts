// AUDIT 2026-08-31: regraded from L3 to L2. this experiment runs a hand-written 1D coined quantum walk from code/dynamics, not the lattice-gas rule, which is a classical permutation on ternary slots with no amplitudes (foundations/rule-has-no-amplitudes). Known quantum-walk physics reproduced correctly, so the honest depth is L2, and the former substrates label [3434] was false, nothing {3,4,3,4}-related is in the import graph. Prior art: Kurzynski 2008.
// Klein tunneling emerges from the coined Dirac walk model: a relativistic particle passes through a
// tall electrostatic step that ought to stop it. Launch a right-moving packet on the {3,4,3,4} coin's
// single-particle sector (the two-component coined Dirac walk) at a SCALAR step whose height sits in
// the Klein window (well above the particle's energy). Instead of reflecting, the packet penetrates,
// and it does so across a RANGE of incident momenta, nearly energy-independent. That is the Klein
// paradox, the sharpest signature of relativistic quantum mechanics with no nonrelativistic analogue.
//
// The effect is specific to a SCALAR (electrostatic) step, which shifts both chiralities equally and
// lets the incoming positive-energy particle couple to the negative-energy states on the far side. A
// MASS step of the SAME height is the control: it opens a real energy gap, so it REFLECTS the packet.
// So the contrast (scalar step transmits, mass step reflects, same height) is the Klein criterion, and
// it is measured here on the discrete rule, not read off an analytic transmission formula.
//
// - PREDICTION: a scalar step in the Klein window transmits the walk across incident momenta 0.5..1.1
//   (penetration > 0.80 at every momentum), and the transmission is nearly flat in the momentum (the
//   energy-insensitivity that distinguishes Klein tunneling from ordinary above-barrier transmission).
// - CONTROL: a mass step of the SAME height reflects the walk (penetration < 0.10 at those momenta), so
//   the transmission is the scalar coupling, not the step height, and it is not a numerical artefact.
//
// Depth L3. Klein tunneling is a MEASURED consequence of the coined Dirac walk model (not a
// built state or an imported transmission coefficient), with the scalar-vs-mass step as the control
// that genuinely fails. Emergent on the committed substrate's single-particle sector.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { diracBarrierProbability } from '@/code/dynamics/klein-barrier'

const MASS = 0.2
const HEIGHT = 1.8
const MOMENTA = [0.5, 0.7, 0.9, 1.1]
const BASE = {
  size: 900,
  steps: 150,
  mass: MASS,
  width: 24,
  barrierStart: 440,
  barrierWidth: 400,
  height: HEIGHT,
}

// penetration past the step face = probability that ended inside the step or beyond it
function penetration(
  kind: 'potential' | 'mass',
  momentum: number,
): number {
  const r = diracBarrierProbability({ ...BASE, momentum, kind })

  return r.inside + r.transmitted
}

export default experiment({
  id: 'quantum/klein-tunneling',
  code: 'E-QTM-0073',
  title:
    "Klein tunneling from the coined Dirac walk model: a scalar step in the Klein window transmits the relativistic walk across a range of incident momenta (penetration above 0.80 at every momentum, nearly energy-independent), while a mass step of the same height reflects it (penetration below 0.10)",
  category: 'quantum',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    // scalar-potential step: the walk penetrates (Klein tunneling), across incident momenta
    const potential = MOMENTA.map(k => penetration('potential', k))
    const worstPotential = Math.min(...potential)
    const bestPotential = Math.max(...potential)
    // nearly energy-independent transmission (the Klein signature, flat in momentum)
    const potentialSpread = bestPotential - worstPotential

    // CONTROL: a mass step of the SAME height reflects the walk (opens a real gap, no Klein tunneling)
    const massBarrier = MOMENTA.map(k => penetration('mass', k))
    const worstMass = Math.max(...massBarrier)

    // the per-momentum contrast (scalar transmits, mass reflects)
    const worstContrast = Math.min(
      ...MOMENTA.map((_, i) => potential[i]! - massBarrier[i]!),
    )

    const scalarTransmits = worstPotential > 0.8
    const nearlyEnergyIndependent = potentialSpread < 0.1
    const massReflects = worstMass < 0.1
    const cleanContrast = worstContrast > 0.7

    const ok =
      scalarTransmits &&
      nearlyEnergyIndependent &&
      massReflects &&
      cleanContrast

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a right-moving packet on the coined Dirac walk penetrates a scalar step in the Klein window with probability above 0.80 across incident momenta 0.5 to 1.1 and nearly flat in the momentum, while a mass step of the same height reflects it (penetration below 0.10), so Klein tunneling is an energy-insensitive consequence of the coined walk model specific to scalar coupling',
      metrics: {
        worstPotentialPenetration: Number(worstPotential.toFixed(4)),
        potentialSpread: Number(potentialSpread.toFixed(4)),
        worstContrast: Number(worstContrast.toFixed(4)),
      },
      // CONTROL: a mass step of the same height opens a real gap and reflects (no Klein tunneling).
      control: {
        worstMassPenetration: Number(worstMass.toFixed(4)),
      },
      notes:
        'AUDIT 2026-08-31: this experiment runs a hand-written 1D coined quantum walk from code/dynamics, not the lattice-gas rule, which is a classical permutation on ternary slots with no amplitudes (foundations/rule-has-no-amplitudes). Known quantum-walk physics reproduced correctly, so the honest depth is L2, and the former substrates label [3434] was false, nothing {3,4,3,4}-related is in the import graph. Prior art: Kurzynski 2008. ' +
        "Klein tunneling measured on the coined Dirac walk model (code/dynamics/klein-barrier): a scalar step in the Klein window transmits across momenta 0.5..1.1 nearly energy-independently, a mass step of the same height reflects. L3, on the coined walk model, not the rule, a could-be-wrong prediction with a control that genuinely fails.",
    })
  },
})
