import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  binaryIcosahedral,
  multiply,
  conjugate,
  quaternion,
  quaternionKey,
  type Quaternion,
} from '@/code/algebra/group/quaternion'
import { rotationKey } from '@/code/algebra/group/rotation'
import {
  commutatorSubgroup,
  contains,
  type GroupOps,
} from '@/code/algebra/group/finite-group'

// The decisive cocycle test for spin on {5,3,4}. The icosahedral symmetry A5 has Schur multiplier
// Z2 and a spinor double cover 2I. The question, is that cover GENUINE (nonsplit), so the spinor
// projective rep cannot be relabeled away as a linear rep, or is it a split (fake) cover. The
// answer is in the commutator subgroup, 2I is PERFECT, so the central minus one is a COMMUTATOR,
// which means the extension is NONSPLIT and the cocycle in H^2(A5, Z2) is genuinely nontrivial.
// The control is the SPLIT cover A5 times Z2, where the central minus one is NOT a commutator. And
// the loop holonomy, a 2pi rotation, gives the spinor minus one.

type SplitElement = { rotation: string; sign: number }

export default experiment({
  id: 'spin/cocycle-534',
  title:
    'the {5,3,4} spinor cover is genuine (nonsplit), the cocycle is nontrivial, a 2pi loop is minus one',
  category: 'spin',
  substrates: ['534'],
  depth: 'L1',
  paper: true,
  run() {
    const group = binaryIcosahedral() // 2I, order 120
    const minusOne = quaternion(-1, 0, 0, 0)

    // (1) 2I is PERFECT, so its commutator subgroup is the whole group and the central minus one is a
    // commutator. A genuine, nonsplit spinor cover.
    const ops2I: GroupOps<Quaternion> = {
      multiply,
      inverse: conjugate,
      key: quaternionKey,
    }
    const commutator2I = commutatorSubgroup(group, ops2I)
    const isPerfect = commutator2I.length === 120
    const minusOneIsCommutator = contains(commutator2I, minusOne, ops2I)

    // (2) CONTROL: the SPLIT cover A5 x Z2. Represent A5 by one quaternion per rotation, multiply
    // rotations via the representatives, keep Z2 independent. Its commutator subgroup misses the centre.
    const representativeByRotation = new Map<string, Quaternion>()
    for (const element of group) {
      const id = rotationKey(element)
      if (!representativeByRotation.has(id)) {
        representativeByRotation.set(id, element)
      }
    }

    const rotations = [...representativeByRotation.keys()] // 60 rotations = A5
    const opsSplit: GroupOps<SplitElement> = {
      multiply: (left, right) => ({
        rotation: rotationKey(
          multiply(
            representativeByRotation.get(left.rotation)!,
            representativeByRotation.get(right.rotation)!,
          ),
        ),
        sign: left.sign * right.sign,
      }),
      inverse: value => ({
        rotation: rotationKey(
          conjugate(representativeByRotation.get(value.rotation)!),
        ),
        sign: value.sign,
      }),
      key: value => `${value.rotation}|${value.sign}`,
    }
    const splitGroup: SplitElement[] = rotations.flatMap(rotation => [
      { rotation, sign: 1 },
      { rotation, sign: -1 },
    ])
    const commutatorSplit = commutatorSubgroup(splitGroup, opsSplit)
    const identityRotation = rotationKey(quaternion(1, 0, 0, 0))
    const centralElement: SplitElement = {
      rotation: identityRotation,
      sign: -1,
    }
    const centralIsCommutatorSplit = contains(
      commutatorSplit,
      centralElement,
      opsSplit,
    )

    // (3) LOOP HOLONOMY: an order-2 icosahedral rotation lifts to an order-4 element of 2I whose square
    // (a 2pi rotation, the identity in A5) is minus one, the spinor sign on the loop.
    const pure = group.find(element => Math.abs(element.w) < 1e-9)!
    const pureSquared = multiply(pure, pure)
    const loopHolonomyMinusOne =
      quaternionKey(pureSquared) === quaternionKey(minusOne)
    const rotationOrderTwo =
      rotationKey(pureSquared) === identityRotation &&
      rotationKey(pure) !== identityRotation

    const ok =
      isPerfect &&
      minusOneIsCommutator &&
      !centralIsCommutatorSplit &&
      loopHolonomyMinusOne &&
      rotationOrderTwo

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {5,3,4} icosahedral spinor cover 2I is nonsplit (the central minus one is a commutator), so the spinor projective rep is genuine, not a relabeled linear rep, and a 2pi rotation loop gives minus one',
      metrics: {
        commutator2IOrder: commutator2I.length,
        minusOneIsCommutator: minusOneIsCommutator ? 1 : 0,
        commutatorSplitOrder: commutatorSplit.length,
        loopHolonomyMinusOne: loopHolonomyMinusOne ? 1 : 0,
        rotationOrderTwo: rotationOrderTwo ? 1 : 0,
      },
      // CONTROL: the SPLIT cover A5 x Z2 has commutator subgroup of order 60 (equal to A5) that does NOT
      // contain the central minus one, so a split cover carries no genuine spinor. 2I is not split.
      control: {
        splitCommutatorOrder: commutatorSplit.length,
        splitCentralIsCommutator: centralIsCommutatorSplit ? 1 : 0,
      },
      notes:
        'This settles the group-theory layer of the cocycle test, the cocycle in H^2(A5, Z2) is genuinely nontrivial, the spinor is real, and the 2pi loop holonomy is minus one. OPEN, whether the bare {5,3,4} RULE dynamically realizes a spin structure with this holonomy rather than the trivial one is a further topological choice.',
    })
  },
})
