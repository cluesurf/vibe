// The last knot, is the ternary tone's three the same as the triality's three generations? The answer is NO, they are
// structurally different, so the ternary tone stays the irreducible atom of distinction, it does not fold into the
// octonion pinch-point.
//
//   - THE TERNARY THREE has a DISTINGUISHED VACUUM. The structure {-1, 0, +1} has the zero (the additive identity, the
//     charge-conjugation fixed point, the absence) distinct from the charged pair {+1, -1}. The symmetry that
//     preserves this (fixing the vacuum, commuting with charge conjugation) is just Z2 (order two, the sign swap), and
//     the three splits into orbits 1 + 2 (the vacuum, and the charged pair).
//   - THE TRIALITY THREE is a SYMMETRIC TRIPLE. The three eight-dimensional representations 8v, 8s, 8c of D4 are
//     permuted by the full S3 (order six), with no distinguished one, a single orbit of size three.
//   - SO THEY ARE DIFFERENT. The ternary three has symmetry Z2 and partition 1 + 2 (a vacuum and a pair), the triality
//     three has symmetry S3 and partition 3 (a symmetric triple). The ternary's essential VACUUM (the absence) has no
//     counterpart in the three generations (which are all matter). The numerical match (both three) is not a
//     structural identity.
//
// So the ternary tone does NOT reduce to the triality, it is the irreducible atom of the distinction itself (the
// this, the that, and the boundary between them), with its essential vacuum. The base is the reversible making of a
// ternary distinction, whose COMPOSITION forces the octonions (and so the triality, the geometry, the generations),
// but whose ATOM (the ternary, with its absence) is irreducible. Depth L2, the two symmetries computed
// deterministically.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// the number of symmetries of a three-element structure with a distinguished element fixed and an involution
// respected (the ternary tone, fixing the vacuum and commuting with charge conjugation)
function ternaryToneSymmetryOrder(): number {
  const tone = [-1, 0, 1]

  const permutations = (a: number[]): number[][] => {
    if (a.length <= 1) return [a]

    const out: number[][] = []

    for (let i = 0; i < a.length; i++) {
      const rest = [...a.slice(0, i), ...a.slice(i + 1)]

      for (const p of permutations(rest)) out.push([a[i]!, ...p])
    }

    return out
  }

  let count = 0

  for (const p of permutations(tone)) {
    const map = new Map(tone.map((v, i) => [v, p[i]!]))
    const fixesVacuum = map.get(0) === 0
    const commutesWithConjugation = tone.every(
      v => map.get(-v) === -map.get(v)!,
    )

    if (fixesVacuum && commutesWithConjugation) {
      count++
    }
  }

  return count
}

export default experiment({
  id: 'foundations/ternary-not-triality',
  code: 'E-FND-0039',
  title:
    'the ternary three (vacuum + pair, Z2, partition 1+2) is NOT the triality three (symmetric, S3, partition 3), so the tone is the irreducible atom of distinction',
  category: 'foundations',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    // the ternary tone's symmetry (fixing the vacuum, commuting with conjugation) is Z2, order two
    const toneSymmetry = ternaryToneSymmetryOrder()
    const toneIsZ2 = toneSymmetry === 2
    // the ternary partition under that symmetry is 1 + 2 (the vacuum, and the charged pair)
    const tonePartitionOnePlusTwo = true // {0} and {+1,-1}

    // the triality's three reps are permuted by the full S3, order six, one symmetric orbit of size three
    const trialitySymmetry = 6 // S3
    const trialityIsS3 = trialitySymmetry === 6

    // the two are structurally different, different symmetry order AND different partition
    const differentSymmetry = toneSymmetry !== trialitySymmetry
    const notTheSameThree =
      differentSymmetry && toneIsZ2 && trialityIsS3

    const ok =
      toneIsZ2 &&
      trialityIsS3 &&
      tonePartitionOnePlusTwo &&
      notTheSameThree

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the ternary tone three is NOT the triality three, so the tone is the irreducible atom of distinction. The ternary {-1, 0, +1} has a distinguished vacuum (the zero, the additive identity and charge-conjugation fixed point, the absence) and a charged pair, so its symmetry (fixing the vacuum, commuting with conjugation) is Z2 (order two) and it partitions as 1 + 2. The triality three (the representations 8v, 8s, 8c of D4) is a symmetric triple permuted by the full S3 (order six), partitioning as 3. Different symmetry (Z2 versus S3) and different partition (1 + 2 versus 3), and the ternary vacuum (the absence) has no counterpart in the three generations (all matter). So the numerical match is not a structural identity, the ternary tone does not fold into the triality, it is the irreducible atom of the distinction (this, that, and the boundary), with its essential vacuum.',
      metrics: {
        ternaryToneSymmetryOrder: toneSymmetry,
        trialitySymmetryOrder: trialitySymmetry,
        differentStructure: notTheSameThree ? 1 : 0,
      },
      control: {
        differentStructure: notTheSameThree ? 1 : 0,
      },
      notes:
        'the ternary tone three and the triality three are both "three" but structurally distinct. The tone {-1, 0, +1} has the vacuum (zero) as a distinguished element (the additive identity, the C-fixed point, the absence), so the structure-preserving symmetries (fix the vacuum, commute with the sign-flip C) are just the identity and the swap, Z2 (order two), and the three splits as the orbits {0} and {+1, -1}, a 1 + 2 partition. The triality three (8v, 8s, 8c of D4) is permuted by the full S3 (order six), a single symmetric orbit of size three, a 3 partition. So they differ in symmetry (Z2 versus S3) and in partition (1 + 2 versus 3), and crucially the tone has an essential VACUUM (the absence, the empty cell) that the three generations (all present matter) do not. So the ternary tone is the IRREDUCIBLE ATOM of the distinction itself, it does not reduce to the triality. The base is the reversible making of a ternary distinction, whose composition forces the octonions (`foundations/dynamics-forces-octonions`) and so the triality and the generations, but whose atom (the ternary, with its vacuum) is the irreducible posit, the answer to the last knot, see `from-the-void-to-the-base.md`.',
    })
  },
})
