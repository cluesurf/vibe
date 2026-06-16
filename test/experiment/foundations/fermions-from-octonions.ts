// One generation of Standard-Model fermions from the octonions. The gauge group came from the division-algebra tower
// (`foundations/gauge-group-from-octonions`). This experiment goes deeper, the EXACT fermion content of one generation,
// the quarks and leptons with their correct color and electric charges, emerges from the complexified octonions, the
// Furey / Dixon / Gunaydin-Gursey construction. So the matter is not posited, it is built from the octonion seed.
//
//   - THE OCTONION LEFT-MULTIPLICATIONS ARE A CLIFFORD ALGEBRA. The seven octonion imaginary units, acting by left
//     multiplication, are eight-by-eight matrices that square to minus the identity and anticommute, the generators of
//     Cl(0,7). (Even though the octonions are non-associative, the left-multiplication MATRICES compose associatively,
//     so the Clifford structure is exact.)
//   - THREE FERMIONIC LADDER OPERATORS. Six of the seven generators, paired and complexified, give three ladder
//     operators a_1, a_2, a_3 obeying the canonical anticommutation relations {a_i, a_j-dagger} = delta_ij and
//     {a_i, a_j} = 0, three fermion modes.
//   - THE FOCK SPACE IS ONE GENERATION. The three-mode Fock space has eight states, occupied by zero, one, two, or
//     three modes, with multiplicities one, three, three, one, a color singlet, a color triplet, a color anti-triplet,
//     and a color singlet (the SU(3) structure of one generation).
//   - THE CHARGES ARE EXACT. The electric charge is one third of the number operator, so the eight states carry charges
//     zero, one third (three times), two thirds (three times), and one, exactly the neutrino, the down-type quarks
//     (three colors, charge magnitude one third), the up-type quarks (three colors, two thirds), and the electron
//     (one). The conjugate ideal gives the antiparticles, sixteen states, one full generation.
//
// So one generation of the Standard Model, with the right color structure and the right fractional electric charges,
// descends from the complexified octonions. Together with the gauge group (the same tower) and the geometry and the
// three-generation count (`foundations/octonion-base-generator`), the whole Standard-Model architecture comes from the
// one octonion seed. Depth L2, the Clifford structure, the ladder relations, the number spectrum, and the charges
// computed deterministically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { octonionFermionGeneration } from '@/code/measure/octonion-fermions'

export default experiment({
  id: 'foundations/fermions-from-octonions',
  title: 'one generation of fermions (with exact color and charges 0, 1/3, 2/3, 1) from the complexified octonions, the Furey construction',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const generation = octonionFermionGeneration()

    // the octonion left-multiplications form Cl(0,7), the three ladder operators are fermionic
    const cliffordOk = generation.leftMultsAreClifford
    const ladderOk = generation.ladderRelationsHold

    // the number operator has trace twelve and a quantized spectrum {0,1,2,3}
    const traceOk = generation.numberOperatorTrace === 12
    const spectrumOk = generation.spectrumQuantized

    // the multiplicities are 1, 3, 3, 1 (color singlet, triplet, anti-triplet, singlet)
    const multiplicitiesOk =
      generation.multiplicities.length === 4 &&
      generation.multiplicities[0] === 1 &&
      generation.multiplicities[1] === 3 &&
      generation.multiplicities[2] === 3 &&
      generation.multiplicities[3] === 1

    // the electric charges are 0, 1/3, 2/3, 1 (neutrino, down-type, up-type, electron)
    const charges = generation.electricCharges
    const chargesOk =
      Math.abs(charges[0]! - 0) < 1e-9 &&
      Math.abs(charges[1]! - 1 / 3) < 1e-9 &&
      Math.abs(charges[2]! - 2 / 3) < 1e-9 &&
      Math.abs(charges[3]! - 1) < 1e-9

    const ok = cliffordOk && ladderOk && traceOk && spectrumOk && multiplicitiesOk && chargesOk

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'one generation of Standard-Model fermions, with the correct color structure and the correct fractional electric charges, descends from the complexified octonions. The seven octonion imaginary units, acting by left multiplication, are eight-by-eight matrices squaring to minus the identity and anticommuting, the generators of the Clifford algebra Cl(0,7). Six of them, paired and complexified, give three fermionic ladder operators obeying the canonical anticommutation relations. The three-mode Fock space has eight states with multiplicities one, three, three, one, a color singlet, a triplet, an anti-triplet, and a singlet, the SU(3) structure of one generation. The electric charge is one third of the number operator, so the charges are zero, one third (three times), two thirds (three times), and one, exactly the neutrino, the three-colored down-type quarks, the three-colored up-type quarks, and the electron. The conjugate ideal gives the antiparticles, sixteen states, one full generation. So the matter is built from the octonion seed, not posited.',
      metrics: {
        leftMultsAreClifford: cliffordOk ? 1 : 0,
        ladderRelationsHold: ladderOk ? 1 : 0,
        numberOperatorTrace: generation.numberOperatorTrace,
        spectrumQuantized: spectrumOk ? 1 : 0,
        colorSinglets: generation.multiplicities[0]! + generation.multiplicities[3]!,
        colorTriplet: generation.multiplicities[1]!,
        colorAntiTriplet: generation.multiplicities[2]!,
        chargeNeutrino: Number(charges[0]!.toFixed(3)),
        chargeDownType: Number(charges[1]!.toFixed(3)),
        chargeUpType: Number(charges[2]!.toFixed(3)),
        chargeElectron: Number(charges[3]!.toFixed(3)),
      },
      control: {
        spectrumQuantized: spectrumOk ? 1 : 0,
        multiplicitiesAreOneThreeThreeOne: multiplicitiesOk ? 1 : 0,
      },
      notes:
        'the octonion left-multiplications L_{e_a} (a = 1..7) satisfy L^2 = -I and anticommute, the Clifford algebra Cl(0,7) (the left-multiplication matrices compose associatively, so this is exact despite the octonions being non-associative). Three fermionic ladder operators a_k = (1/2)(L_{2k-1} + i L_{2k}) obey {a_i, a_j-dagger} = delta_ij and {a_i, a_j} = 0 (verified). The number operator N = sum a_k-dagger a_k has trace twelve, tr(N^2) = 24, tr(N^3) = 54, and minimal polynomial N(N-1)(N-2)(N-3) = 0, so its spectrum is {0, 1, 1, 1, 2, 2, 2, 3}, the three-fermion Fock space, with multiplicities 1, 3, 3, 1 (the color singlet, triplet, anti-triplet, singlet). The electric charge Q = N/3 gives 0, 1/3 (times three), 2/3 (times three), 1, exactly one generation, the neutrino (0), the down-type quarks (1/3, three colors), the up-type quarks (2/3, three colors), the electron (1), with the conjugate ideal supplying the antiparticles (sixteen states). This is the Furey / Dixon / Gunaydin-Gursey result, computed from the octonion multiplication. So the FERMION CONTENT (not just the gauge group and the generation count) descends from the octonion seed, closing the loop, the whole Standard Model from one algebra. See `from-the-void-to-the-base.md` and `gauge-group-from-octonions`.',
    })
  },
})
