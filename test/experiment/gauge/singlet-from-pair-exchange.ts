// Does color confinement's bookkeeping need a three-body vertex? E-FRC-0094 found the committed rule
// has no collision that couples three directions, the vertex an epsilon-tensor baryon seems to ask
// for. This measures whether pairwise exchange alone, the one color-symmetric two-slot interaction
// E-FRC-0100 allows, already binds the baryon and the meson.
//
// Exact diagonalization:
//
// - three triplets with exchange on the open chain (bonds 0-1 and 1-2 only): the ground state is
//   unique, it is the epsilon singlet (overlap 1, every su(3) generator annihilates it), and the gap
//   is 1 (the two exchanges square to 1 on the mixed-symmetry states, so those sit at -1 against the singlet at -2). With all three bonds the gap is 3.
// - a triplet and an antitriplet with their exchange (the singlet projector, E-FRC-0100): the ground
//   state is the singlet, gap 3.
// - two triplets: no singlet exists at all, so exchange of either sign leaves a colored ground state.
// - singlets exist exactly when (triplets - antitriplets) is a multiple of 3: triality, counted on
//   blocks of two to four slots.
//
// Control: a permutation rule started from a basis state only ever visits basis states, and the best
// overlap any basis state has with the epsilon singlet is 1/6, so no classical trajectory holds the
// baryon. The epsilon singlet's amplitudes are 0 and +-1/sqrt(6): a ternary pattern times one scale.
//
// Depth L1: known group theory (the SU(3) Heisenberg model), computed exactly.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { makeComplexMatrix } from '@/code/algebra/linear/dense'
import { eigHermitian } from '@/code/algebra/linear/eig-hermitian'
import {
  combineOperators,
  epsilonState,
  pairExchangeUnitary,
  identityOperator,
  permutationOperator,
  singletCount,
  singletResidual,
  slotSwapMap,
  type Operator,
  type SlotKind,
} from '@/code/measure/color-symmetry'

function diagonalize(operator: Operator): {
  values: number[]
  ground: { re: Float64Array; im: Float64Array }
} {
  const matrix = makeComplexMatrix({
    rows: operator.size,
    cols: operator.size,
  })

  matrix.re.set(operator.re)
  matrix.im.set(operator.im)

  const eigen = eigHermitian({ matrix })
  const n = operator.size
  const re = new Float64Array(n)
  const im = new Float64Array(n)

  for (let a = 0; a < n; a++) {
    re[a] = eigen.vectorsRe[a * n] ?? 0
    im[a] = eigen.vectorsIm[a * n] ?? 0
  }

  return { values: Array.from(eigen.values), ground: { re, im } }
}

function exchange(bonds: readonly [number, number][]): Operator {
  return combineOperators(
    bonds.map(([i, j]) => ({
      operator: permutationOperator({
        map: slotSwapMap({ d: 3, k: 3, i, j }),
      }),
      re: 1,
    })),
  )
}

// |<a|b>|^2 for normalized states
function overlap(
  a: { re: Float64Array; im: Float64Array },
  b: { re: Float64Array; im: Float64Array },
): number {
  let re = 0
  let im = 0

  for (let s = 0; s < a.re.length; s++) {
    re +=
      (a.re[s] ?? 0) * (b.re[s] ?? 0) + (a.im[s] ?? 0) * (b.im[s] ?? 0)

    im +=
      (a.re[s] ?? 0) * (b.im[s] ?? 0) - (a.im[s] ?? 0) * (b.re[s] ?? 0)
  }

  return re * re + im * im
}

function gapOf(values: readonly number[]): number {
  const ground = values[0] ?? 0

  return (
    (values.find(value => value > ground + 1e-8) ?? ground) - ground
  )
}

function degeneracyOf(values: readonly number[]): number {
  const ground = values[0] ?? 0

  return values.filter(value => value < ground + 1e-8).length
}

export default experiment({
  id: 'gauge/singlet-from-pair-exchange',
  code: 'E-FRC-0101',
  title:
    'pairwise color exchange with no three-body term binds the baryon: on an open chain of three triplets the unique ground state is the epsilon singlet (gap 1), a triplet and antitriplet bind into the meson singlet (gap 3), two triplets have no singlet at all, and singlets exist only at triality zero, while no classical state holds more than 1/6 of the baryon',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const epsilon = epsilonState()
    const triplets: SlotKind[] = ['plain', 'plain', 'plain']

    const chain = diagonalize(
      exchange([
        [0, 1],
        [1, 2],
      ]),
    )
    const ring = diagonalize(
      exchange([
        [0, 1],
        [1, 2],
        [0, 2],
      ]),
    )
    const chainOverlap = overlap(chain.ground, epsilon)
    const ringOverlap = overlap(ring.ground, epsilon)
    const chainResidual = singletResidual({
      d: 3,
      slots: triplets,
      ...chain.ground,
    })

    // the meson: exchange for a triplet and antitriplet is minus the singlet projector times d,
    // read off the color-symmetric circle at phase pi: U(pi) = 1 - 2 J / 3, so J = 3 (1 - U) / 2
    const circle = pairExchangeUnitary({
      d: 3,
      kind: 'conjugate',
      phase: Math.PI,
    })
    const mesonHamiltonian = combineOperators([
      { operator: identityOperator({ size: 9 }), re: -1.5 },
      { operator: circle, re: 1.5 },
    ])
    const meson = diagonalize(mesonHamiltonian)
    const mesonResidual = singletResidual({
      d: 3,
      slots: ['plain', 'conjugate'],
      ...meson.ground,
    })

    const blocks: [string, SlotKind[]][] = [
      ['qq', ['plain', 'plain']],
      ['qqbar', ['plain', 'conjugate']],
      ['qqq', ['plain', 'plain', 'plain']],
      ['qqqbar', ['plain', 'plain', 'conjugate']],
      ['qqqq', ['plain', 'plain', 'plain', 'plain']],
      ['qqqbarqbar', ['plain', 'plain', 'conjugate', 'conjugate']],
    ]
    const singlets = Object.fromEntries(
      blocks.map(([name, slots]) => [
        name,
        singletCount({ d: 3, slots }),
      ]),
    )
    const trialityHolds = blocks.every(([name, slots]) => {
      const triality =
        slots.filter(kind => kind === 'plain').length -
        slots.filter(kind => kind === 'conjugate').length

      return ((triality % 3) + 3) % 3 === 0
        ? (singlets[name] ?? 0) > 0
        : singlets[name] === 0
    })

    // the classical control: the best basis state
    const bestClassical = Math.max(
      ...Array.from(epsilon.re, amplitude => amplitude * amplitude),
    )
    const ternaryPattern = Array.from(epsilon.re).every(
      amplitude =>
        Math.abs(amplitude) < 1e-12 ||
        Math.abs(Math.abs(amplitude) * Math.sqrt(6) - 1) < 1e-12,
    )

    const baryonBinds =
      degeneracyOf(chain.values) === 1 &&
      Math.abs(chainOverlap - 1) < 1e-9 &&
      chainResidual < 1e-9 &&
      Math.abs(gapOf(chain.values) - 1) < 1e-8 &&
      degeneracyOf(ring.values) === 1 &&
      Math.abs(ringOverlap - 1) < 1e-9 &&
      Math.abs(gapOf(ring.values) - 3) < 1e-8
    const mesonBinds =
      degeneracyOf(meson.values) === 1 &&
      mesonResidual < 1e-9 &&
      Math.abs(gapOf(meson.values) - 3) < 1e-8
    const ok =
      baryonBinds &&
      mesonBinds &&
      trialityHolds &&
      Math.abs(bestClassical - 1 / 6) < 1e-12 &&
      ternaryPattern

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'nearest-neighbour color exchange on an open chain of three triplets, with no three-body term, has the epsilon singlet as its unique ground state (overlap 1, gap 1, gap 3 with the closing bond), the triplet-antitriplet exchange has the meson singlet as its unique ground state (gap 3), and singlets exist exactly at triality zero (none for qq, qqq-bar or qqqq), while any basis state, all a permutation rule can visit, overlaps the baryon by at most 1/6',
      metrics: {
        chainGroundDegeneracy: degeneracyOf(chain.values),
        chainOverlapWithEpsilon: chainOverlap,
        chainGap: gapOf(chain.values),
        chainSingletResidual: chainResidual,
        ringGap: gapOf(ring.values),
        ringOverlapWithEpsilon: ringOverlap,
        mesonGroundDegeneracy: degeneracyOf(meson.values),
        mesonGap: gapOf(meson.values),
        mesonSingletResidual: mesonResidual,
        ...Object.fromEntries(
          Object.entries(singlets).map(([name, count]) => [
            `singlets_${name}`,
            count,
          ]),
        ),
      },
      control: {
        bestClassicalOverlap: bestClassical,
        epsilonAmplitudesTernary: ternaryPattern ? 1 : 0,
        expectedChainGap: 1,
      },
      notes:
        'L1, the SU(3) Heisenberg model on two and three sites, exact, with no random numbers. It removes the worry E-FRC-0094 raised: a baryon does not need a three-body vertex, pairwise exchange binds it, provided the exchange carries amplitudes (E-FRC-0100). What binds is the energy of the exchange, so a rule that produced these states would have to lower that energy, by cooling or by a ground-state preparation, since a color-symmetric unitary keeps the singlet weight of any start fixed. The epsilon singlet written in the color basis is a ternary pattern of 0, +1 and -1 over the 27 states times one scale, so the static baryon is expressible in the tone values themselves once they are read as signed amplitudes rather than labels.',
    })
  },
})
