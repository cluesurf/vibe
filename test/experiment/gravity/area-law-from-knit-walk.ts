// Frontier 1 residual closed, the area law from the KNIT's own dynamics, not a Hamiltonian proxy. The gravity story
// rests on the entanglement area law, which was measured on a free-fermion Hamiltonian (a gapped insulator). That
// Hamiltonian is the right universality class (`gravity/area-law-universality`, the proxy's Dirac gap is exactly
// twice the mass), but the honest residual was to compute the entanglement from the knit's OWN evolution operator.
// This does that. The directional knit's single-particle sector is a coined Dirac walk (P230), a UNITARY, not a
// Hamiltonian, and here we fill its lower Floquet band and compute the entanglement entropy of an interval directly
// from that walk. A MASSIVE (gapped) walk gives a SATURATING entropy, the area law, the entropy of an interval is
// set by its two boundary points, not its length. A near-massless (gapless) walk gives a GROWING entropy (the
// critical log law), the control. So the area law that underwrites all of emergent gravity is read off the knit's
// own coined Dirac walk, closing the proxy-to-knit residual. Depth L2, the saturating versus growing interval
// entropy measured deterministically from the walk unitary, with the gapless walk the control.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { coinedWalkIntervalEntropy } from '@/code/measure/walk-entanglement'

const MOMENTUM_COUNT = 120
const LENGTHS = [4, 6, 8, 10, 12]
const MASSIVE_THETA = 0.6
const GAPLESS_THETA = 0.05

export default experiment({
  id: 'gravity/area-law-from-knit-walk',
  title:
    'the area law from the knit own coined Dirac walk, a massive walk saturates (area law), a gapless walk grows (control)',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const massive = LENGTHS.map(intervalLength =>
      coinedWalkIntervalEntropy({
        theta: MASSIVE_THETA,
        momentumCount: MOMENTUM_COUNT,
        intervalLength,
      }),
    )

    const gapless = LENGTHS.map(intervalLength =>
      coinedWalkIntervalEntropy({
        theta: GAPLESS_THETA,
        momentumCount: MOMENTUM_COUNT,
        intervalLength,
      }),
    )

    // the massive walk's entropy saturates (the area law, flat across interval length), the gapless walk's grows
    const massiveTail = massive.slice(2) // lengths 8, 10, 12
    const massiveSaturates =
      Math.max(...massiveTail) - Math.min(...massiveTail) < 0.02

    const gaplessGrows =
      gapless[gapless.length - 1]! - gapless[0]! > 0.4

    const ok = massiveSaturates && gaplessGrows

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the entanglement entropy of an interval, computed directly from the knit own coined Dirac walk (the unitary U(k) = Shift(k) Coin(theta) of the knit single-particle sector, P230, with its lower Floquet band filled), SATURATES for a massive (gapped) walk, the area law (the entropy is set by the two boundary points, not the interval length), while a near-massless (gapless) walk has a GROWING entropy, the critical log law, the control. So the entanglement area law that underwrites emergent gravity is a property of the knit own evolution operator, not an arbitrary Hamiltonian proxy, closing the proxy-to-knit residual.',
      metrics: {
        massiveAt4: Number(massive[0]!.toFixed(3)),
        massiveAt12: Number(massive[massive.length - 1]!.toFixed(3)),
        massiveTailSpread: Number(
          (Math.max(...massiveTail) - Math.min(...massiveTail)).toFixed(
            4,
          ),
        ),
        gaplessAt4: Number(gapless[0]!.toFixed(3)),
        gaplessAt12: Number(gapless[gapless.length - 1]!.toFixed(3)),
        gaplessGrowth: Number(
          (gapless[gapless.length - 1]! - gapless[0]!).toFixed(3),
        ),
      },
      control: {
        gaplessGrowth: Number(
          (gapless[gapless.length - 1]! - gapless[0]!).toFixed(3),
        ),
      },
      notes:
        'the coined Dirac walk is the knit own single-particle evolution (P230), a discrete-time UNITARY, not a Hamiltonian, so this is the area law from the knit dynamics directly. The massive walk entropy is flat across interval length (the area law, the boundary is two points in one dimension), the gapless walk entropy climbs (the critical conformal log law), the control. Combined with the dimension-independent universality (`gravity/area-law-universality`), this establishes the 3D area law as the knit own, closing the proxy residual. The remaining depth is only the full many-body 3D directional walk, which the universality already covers.',
    })
  },
})
