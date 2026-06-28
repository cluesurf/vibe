// EXTERNAL THEORY: Van Raamsdonk, "building up spacetime with quantum entanglement", with Maes (E/G) and
// Jacobson behind it (author-bridges/van-raamsdonk.md, experiment E-DEC-05 / E-GRV-14). His claim: the
// geometric connectivity between two regions is held together by their entanglement, so dialing the
// entanglement across a cut to zero pinches the geometry apart at that cut. Vibe must produce both
// emergently, and they must track each other.
//
// Tested on a free-fermion chain (the same correlation-matrix machinery as holography/entanglement), with one
// tunable "throat" bond in the middle. Sweeping the throat weight from 1 down to 0: (1) the entanglement
// entropy across the throat falls, (2) the geometric cross-throat connectivity (the summed correlation linking
// the two halves) falls in lockstep, so the two co-vary strongly (Pearson near 1) and the throat connectivity
// collapses to near nothing (the geometry pinches off at the throat). CONTROL: the connectivity across a FIXED,
// untouched far bond is largely RETAINED through the same sweep, so removing entanglement disconnects the cut
// it was removed from and leaves the rest connected. The discriminator is spatial (which cut pinches), not the
// global fact that pinching any bond lowers every correlation a little.

import { weakBondChainHamiltonian } from '@/code/operator/tight-binding'
import {
  freeFermionCorrelationMatrix,
  regionEntanglementEntropy,
  crossCutConnectivity,
} from '@/code/measure/entanglement'
import { pearson } from '@/code/measure/statistics'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export default experiment({
  id: 'holography/entanglement-geometry-covaries',
  code: 'E-HLG-0021',
  title:
    "vibe's emergent entanglement and geometric connectivity across a tunable throat rise and fall together (Van Raamsdonk), while an untouched far bond does not track it",
  category: 'holography',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const n = 64
    const mid = n / 2 // the throat bond is between sites mid-1 and mid
    const farBond = Math.floor(n / 4) // a fixed bond well away from the throat
    const left = Array.from({ length: mid }, (_, i) => i)
    const right = Array.from({ length: n - mid }, (_, i) => mid + i)
    // the two sides of the far bond, for the control connectivity.
    const farLeft = Array.from({ length: farBond + 1 }, (_, i) => i)
    const farRight = Array.from(
      { length: n - farBond - 1 },
      (_, i) => farBond + 1 + i,
    )

    // deterministic sweep of the throat weight from open (1) to pinched (near 0).
    const weights = [1, 0.8, 0.6, 0.4, 0.25, 0.12, 0.05, 0.01]

    const entropy: number[] = []
    const throatConnectivity: number[] = []
    const farConnectivity: number[] = []

    for (const weight of weights) {
      const h = weakBondChainHamiltonian({
        n,
        bondIndex: mid - 1,
        weight,
      })

      const c = freeFermionCorrelationMatrix({ h, n })
      entropy.push(regionEntanglementEntropy({ c, n, region: left }))
      throatConnectivity.push(
        crossCutConnectivity({ c, n, regionA: left, regionB: right }),
      )
      farConnectivity.push(
        crossCutConnectivity({
          c,
          n,
          regionA: farLeft,
          regionB: farRight,
        }),
      )
    }

    const rThroat = pearson({ a: entropy, b: throatConnectivity })

    // both the throat entanglement and its connectivity collapse as the bond pinches.
    const entanglementCollapses =
      entropy[entropy.length - 1]! < entropy[0]! * 0.5

    const throatRetained =
      throatConnectivity[throatConnectivity.length - 1]! /
      throatConnectivity[0]!

    const throatPinchesOff = throatRetained < 0.1

    // CONTROL: the untouched far bond keeps most of its connectivity (geometry stays sewn there).
    const farRetained =
      farConnectivity[farConnectivity.length - 1]! / farConnectivity[0]!

    const farStaysConnected = farRetained > 0.5

    const coVary = rThroat > 0.9

    const ok =
      entanglementCollapses &&
      throatPinchesOff &&
      coVary &&
      farStaysConnected

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        "as the throat bond is dialed from open to pinched, the entanglement entropy across it and the geometric connectivity sewing the two halves fall together (Pearson > 0.9) and the throat connectivity collapses to under a tenth, so the geometry pinches off exactly where the entanglement was removed, while an untouched far bond keeps over half its connectivity, confirming Van Raamsdonk's entanglement-builds-geometry link spatially on vibe's substrate",
      metrics: {
        sweepPoints: weights.length,
        pearsonThroat: rThroat,
        entropyOpen: entropy[0]!,
        entropyPinched: entropy[entropy.length - 1]!,
        throatConnectivityOpen: throatConnectivity[0]!,
        throatConnectivityPinched:
          throatConnectivity[throatConnectivity.length - 1]!,
        throatRetained,
      },
      control: {
        farRetained,
        farStaysConnected: farStaysConnected ? 1 : 0,
      },
      notes:
        'L2, the free-fermion realization of Van Raamsdonk on a 64-site chain (the correlation-matrix method, the same as holography/entanglement). The throat weight is swept deterministically (no randomness). Entanglement entropy is read from the restricted correlation matrix, connectivity is the summed cross-cut correlation (a transport notion, distinct from the entropy). They co-vary (Pearson > 0.9) and the throat connectivity collapses to under a tenth while a far bound bond keeps over half its connectivity. The discriminator is spatial: cutting entanglement disconnects the cut it was removed from, not the whole chain (pinching any bond lowers every correlation a little, so a global-correlation drop alone would not localize). This is the entanglement-builds-geometry link emergent on the substrate, not full nonlinear Einstein gravity (E-GRV-14 reaches further).',
    })
  },
})
