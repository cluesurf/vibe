// How much of SU(3) can a classical rule carry? E-FRC-0100 shows a permutation of colour states that
// commutes with all of SU(3) can only leave or swap. This asks the other question: which FINITE
// subgroups of SU(3) act on something classical by permutation, so that a deterministic rule can carry
// them exactly, and what that something is in the base's own terms.
//
// The something is the discrete phase space of a qutrit, the nine points (a, b) of Z_3^2. A unitary
// acts classically when conjugation permutes the nine phase-point operators, so it carries every
// Wigner function point to point with no sign (code/measure/qutrit-phase-space). Measured over five
// published subgroups built by closure (code/algebra/group/su3-subgroups):
//
// - Delta(27), Sigma(108) and Sigma(648), the Hessian group Sigma(216 x 3): EVERY element acts
//   classically. Sigma(648) induces 216 distinct affine maps of the phase space, 9 translations times
//   all 24 elements of SL(2, 3), each hit by exactly 3 elements (the Z_3 center).
// - Sigma(60) and Sigma(1080), which hold the golden-ratio matrix: almost none do, and that matrix
//   turns a classical state (the Wigner function of |0>, all nonnegative) into one with negativity.
//
// Then the base's own terms. SL(2, 3) is the binary tetrahedral group 2T, and the 24 D4 coin
// directions form exactly that group under x o y = x q y with q = (1 - i) / sqrt 2 (code/algebra/group/
// coin-group): the product closes on the 24 directions, and an explicit search finds all 24
// isomorphisms from SL(2, 3), the size of its automorphism group. So the Hessian colour group is
// labelled by three tones and one coin direction: 3 (center) x 9 (a tone pair, the translation) x 24
// (a direction) = 648.
//
// Controls: the plain quaternion product does not close on the directions, the golden-ratio groups
// fail the classical test, and a count of isomorphisms that came out as anything but 24 would say the
// search is wrong.
//
// Depth L1: known mathematics (the qutrit Clifford group is the Hessian group, Gross's Wigner function
// is Clifford covariant for odd dimension, 2T is SL(2, 3)), computed exactly. What is new is reading
// it in the base's terms.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  generateGroup,
  centerOrder,
} from '@/code/dynamics/finite-gauge'
import {
  GOLDEN,
  SU3_SUBGROUPS,
  type Su3SubgroupName,
} from '@/code/algebra/group/su3-subgroups'
import {
  affineOf,
  applyUnitary,
  phaseSpaceAction,
  wignerFunction,
  wignerNegativity,
} from '@/code/measure/qutrit-phase-space'
import { rootsD4 } from '@/code/algebra/group/root-system'
import {
  coinGroup,
  countIsomorphisms,
  quaternionProduct,
  specialLinear23,
} from '@/code/algebra/group/coin-group'

type Census = {
  order: number
  center: number
  classical: number
  affineMaps: number
  linearParts: number
  largestFibre: number
  smallestFibre: number
  largestNegativity: number
}

function census(name: Su3SubgroupName): Census {
  const group = generateGroup({
    generators: [...SU3_SUBGROUPS[name].generators],
  })
  const fibres = new Map<string, number>()
  const linear = new Set<string>()

  let classical = 0
  let largestNegativity = 0

  for (const element of group.matrices) {
    const map = phaseSpaceAction({ unitary: element })
    const affine = map === undefined ? undefined : affineOf({ map })

    if (affine !== undefined) {
      classical += 1

      const key = `${affine.matrix.join()}|${affine.shift.join()}`

      fibres.set(key, (fibres.get(key) ?? 0) + 1)
      linear.add(affine.matrix.join())
    }

    const image = applyUnitary({
      unitary: element,
      re: [1, 0, 0],
      im: [0, 0, 0],
    })

    largestNegativity = Math.max(
      largestNegativity,
      wignerNegativity(wignerFunction(image)),
    )
  }

  const sizes = [...fibres.values()]

  return {
    order: group.order,
    center: centerOrder(group),
    classical,
    affineMaps: fibres.size,
    linearParts: linear.size,
    largestFibre: Math.max(0, ...sizes),
    smallestFibre: sizes.length === 0 ? 0 : Math.min(...sizes),
    largestNegativity,
  }
}

export default experiment({
  id: 'gauge/classical-colour-group',
  code: 'E-FRC-0104',
  title:
    'the largest crystal subgroup of SU(3) that acts classically is the Hessian group Sigma(648): all 648 elements permute the nine points of the qutrit phase space, through 9 translations times the 24 elements of SL(2, 3), and the 24 D4 coin directions form exactly SL(2, 3), so this colour group is labelled by three tones and one direction, while the golden-ratio groups act classically on almost nothing',
  category: 'gauge',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const names: Su3SubgroupName[] = [
      'delta27',
      'sigma108',
      'sigma648',
      'sigma60',
      'sigma1080',
    ]
    const results = Object.fromEntries(
      names.map(name => [name, census(name)]),
    ) as Record<Su3SubgroupName, Census>
    const hessian = results.sigma648
    const valentiner = results.sigma1080

    const coin = coinGroup({ directions: rootsD4() })
    const special = specialLinear23()
    const indexOf = (m: number[]): number =>
      special.matrices.findIndex(x => x.join() === m.join())
    const isomorphisms = countIsomorphisms({
      first: special,
      second: coin,
      order: 24,
      generators: [indexOf([1, 1, 0, 1]), indexOf([0, 2, 1, 0])],
    })

    // control: the plain quaternion product of two scaled roots lands among the roots how often
    const scaled = rootsD4().map(
      r =>
        r.map(x => x / Math.sqrt(2)) as unknown as [
          number,
          number,
          number,
          number,
        ],
    )
    const keys = new Set(
      scaled.map(q => q.map(x => Math.round(x * 1e6) || 0).join()),
    )

    let plainClosed = 0

    for (const a of scaled) {
      for (const b of scaled) {
        plainClosed += keys.has(
          quaternionProduct(a, b)
            .map(x => Math.round(x * 1e6) || 0)
            .join(),
        )
          ? 1
          : 0
      }
    }

    const goldenNegativity = wignerNegativity(
      wignerFunction(
        applyUnitary({ unitary: GOLDEN, re: [1, 0, 0], im: [0, 0, 0] }),
      ),
    )

    const ordersRight = names.every(
      name => results[name].order === SU3_SUBGROUPS[name].order,
    )
    const cliffordClassical =
      results.delta27.classical === 27 &&
      results.sigma108.classical === 108 &&
      hessian.classical === 648 &&
      hessian.affineMaps === 216 &&
      hessian.linearParts === 24 &&
      hessian.largestFibre === 3 &&
      hessian.smallestFibre === 3 &&
      hessian.center === 3 &&
      hessian.largestNegativity < 1e-12
    const goldenNotClassical =
      valentiner.classical < valentiner.order / 10 &&
      goldenNegativity > 0.1
    const coinIsSpecialLinear =
      coin.closed && coin.hurwitz && isomorphisms === 24
    const controlOpen = plainClosed < scaled.length * scaled.length
    const ok =
      ordersRight &&
      cliffordClassical &&
      goldenNotClassical &&
      coinIsSpecialLinear &&
      controlOpen

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'every element of Delta(27), Sigma(108) and the Hessian group Sigma(648) permutes the nine phase-space points of a qutrit, Sigma(648) through 216 affine maps (9 translations x all 24 of SL(2, 3)) each hit by exactly its 3 central elements, and never makes Wigner negativity from |0>, while only a few of the 1080 elements of Sigma(360 x 3) act classically, its golden-ratio generator makes Wigner negativity 0.29 from |0> and the group as a whole up to 1/3. The 24 D4 coin directions close under x o y = x q y into a group with exactly 24 isomorphisms from SL(2, 3), so the classical colour group is labelled by a center tone, a tone pair and a coin direction, 3 x 9 x 24 = 648',
      metrics: {
        ...Object.fromEntries(
          names.map(name => [
            `${name}Classical`,
            results[name].classical,
          ]),
        ),
        sigma648AffineMaps: hessian.affineMaps,
        sigma648LinearParts: hessian.linearParts,
        sigma648FibreSize: hessian.largestFibre,
        sigma648Center: hessian.center,
        sigma1080LargestNegativity: valentiner.largestNegativity,
        goldenNegativityFromZero: goldenNegativity,
        coinGroupCloses: coin.closed ? 1 : 0,
        coinIdentityDirection: coin.identity,
        isomorphismsFromSL23: isomorphisms,
      },
      control: {
        ...Object.fromEntries(
          names.map(name => [`${name}Order`, results[name].order]),
        ),
        plainProductLandsInDirections: plainClosed,
        plainProductPairs: scaled.length * scaled.length,
        automorphismsOfSL23: 24,
      },
      notes:
        'L1, known mathematics computed exactly with no random numbers: the qutrit Clifford group is the Hessian group (up to phases), Gross (2006) shows its action on the discrete Wigner function is a permutation for odd dimension, and the binary tetrahedral group is SL(2, 3). What the base gets from it: a colour gauge link valued in Sigma(648) is a classical object, a record of three tones and one coin direction, and moving along it permutes a nine-point classical phase space, so a deterministic permutation rule can carry this much of SU(3) exactly. What it cannot carry is the golden-ratio element of Sigma(1080), the one that creates Wigner negativity, the qutrit form of magic. Whether the classical colour group is enough for the physics depends on its gauge theory reaching the couplings where hadrons are measured, which E-FRC-0103 measures. The labelling 3 x 9 x 24 is a bijection of sets, not a direct product of groups: the translations and the center are a Heisenberg extension, and SL(2, 3) acts on them.',
    })
  },
})
