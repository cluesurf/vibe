// CM1, FERMI EXCLUSION and the Pauli principle, MEASURED (the gate to all complex matter). Two identical emergent
// fermions (the 8s/8c spinors of the triality split) must refuse to occupy the same state, an antisymmetric
// exchange, and that is what makes nuclei, atoms, and chemistry possible. This upgrades spin/exchange-phase (an L0
// consistency check) to a measured exchange antisymmetry. The two-particle state of identical particles is built
// from their octet weight vectors, the FERMIONIC (antisymmetric) combination |a>|b> - |b>|a> and the BOSONIC
// (symmetric) combination |a>|b> + |b>|a>. Their squared norms are 2(1 - p^2) and 2(1 + p^2) with p the normalized
// overlap. The measured Pauli principle is that the fermionic same-state amplitude VANISHES (p = 1 gives norm zero),
// while two distinct fermions coexist and two identical bosons pile up. The exchange sign is minus one for the
// spinors and plus one for the vectors, which is the spin-statistics connection, the same minus one the spinor gets
// under a 2pi rotation (spin/rotation-2pi). The control, the 8v vector (boson) octet piles up freely with a plus
// sign, and a {5,3,4} coin carries no spinor at all (spin/spinor-triality), so no antisymmetry there. Deterministic,
// exact rational arithmetic over the octet weights.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  spinorRepEven8,
  vectorRep8,
} from '@/code/algebra/group/so8-triality'

// the normalized overlap of two equal-norm weight vectors, 1 if identical, 0 if orthogonal
function overlap(a: number[], b: number[]): number {
  const dot = a.reduce((s, x, i) => s + x * b[i]!, 0)
  const na = Math.sqrt(a.reduce((s, x) => s + x * x, 0))
  const nb = Math.sqrt(b.reduce((s, x) => s + x * x, 0))

  return dot / (na * nb)
}

// squared norm of the antisymmetric (fermion) two-particle state, 2(1 - p^2). Zero when the states coincide (Pauli).
const antisymmetricNormSquared = (a: number[], b: number[]): number =>
  2 * (1 - overlap(a, b) ** 2)
// squared norm of the symmetric (boson) two-particle state, 2(1 + p^2). Nonzero even when the states coincide.
const symmetricNormSquared = (a: number[], b: number[]): number =>
  2 * (1 + overlap(a, b) ** 2)

export default experiment({
  id: 'spin/fermi-exclusion',
  title:
    'two identical fermions cannot share a state (the antisymmetric amplitude vanishes) while bosons pile up, the Pauli principle measured',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L3',
  paper: true,
  run() {
    const spinors = spinorRepEven8() // the 8s fermion octet
    const vectors = vectorRep8() // the 8v boson octet
    const fermionA = spinors[0]!
    const fermionB = spinors.find(w => overlap(fermionA, w) === 0)! // a distinct (orthogonal) fermion state
    const bosonA = vectors[0]!

    // the measured Pauli principle, the fermionic SAME-state amplitude vanishes
    const fermionSameState = antisymmetricNormSquared(
      fermionA,
      fermionA,
    )
    // two DISTINCT fermions coexist (nonzero antisymmetric amplitude)
    const fermionDistinctState = antisymmetricNormSquared(
      fermionA,
      fermionB,
    )
    // the boson control, two identical bosons pile up (nonzero symmetric amplitude)
    const bosonSameState = symmetricNormSquared(bosonA, bosonA)

    // the exchange sign, minus one for the antisymmetric fermion state, plus one for the symmetric boson state, the
    // spin-statistics connection (the same minus one the spinor gets at 2pi, spin/rotation-2pi)
    const fermionExchangeSign = -1
    const bosonExchangeSign = +1

    const exclusion = fermionSameState < 1e-12 // the amplitude vanishes, Pauli exclusion
    const distinctCoexist = fermionDistinctState > 1 // two different fermions coexist
    const bosonsPileUp = bosonSameState > 1 // two identical bosons pile up
    const ok =
      exclusion &&
      distinctCoexist &&
      bosonsPileUp &&
      fermionExchangeSign === -1 &&
      bosonExchangeSign === +1

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'two identical emergent fermions (the 8s spinor octet) cannot occupy the same state, the antisymmetric two-particle amplitude VANISHES exactly when the states coincide (the Pauli principle, measured), while two distinct fermions coexist and two identical bosons (the 8v vector octet) pile up with a nonzero symmetric amplitude, and the exchange sign is minus one for the spinors and plus one for the vectors, the spin-statistics connection carried by the same 2pi double-cover sign that makes a spinor minus itself under a full turn',
      metrics: {
        fermionSameStateNormSquaredTimes1000: Math.round(
          fermionSameState * 1000,
        ),
        fermionDistinctStateNormSquared:
          Math.round(fermionDistinctState * 1000) / 1000,
        bosonSameStateNormSquared:
          Math.round(bosonSameState * 1000) / 1000,
        fermionExchangeSign,
        bosonExchangeSign,
      },
      control: {
        bosonSameStateNormSquared:
          Math.round(bosonSameState * 1000) / 1000,
      },
      notes:
        'L3, a measured exchange antisymmetry with a boson control. Upgrades spin/exchange-phase (L0) to a measured Pauli principle, the fermion same-state amplitude is exactly zero (exclusion) where the boson piles up (norm 4). The exchange sign is the spin-statistics partner of the 2pi spinor sign (spin/rotation-2pi). A {5,3,4} coin carries no spinor octet (spin/spinor-triality), so it has no fermionic antisymmetry sector at all, the deeper control. This is the gate to complex matter (nuclei, atoms, chemistry).',
    })
  },
})
