// IIT's exclusion postulate: a conscious complex exists over the set of elements whose integrated
// information is maximal, and that maximum is definite, so the complex has definite borders and
// overlapping candidates are excluded. Giulio Tononi's Integrated Information Theory holds that only
// the maximally-integrated set is a subject: any subset integrates less, any superset integrates
// less, so there is one bordered complex, not a smear of overlapping ones. A vibe self is a bound,
// densely interacting region in a sparse environment, so it should show exactly this: a sharp
// interior maximum of integration at the boundary of the dense core.
//
// The integration proxy is the algebraic connectivity (the Fiedler value) of the induced subgraph,
// the same measure used across the selves experiments as an IIT integration stand-in. A dense core
// (every core element linked to every other) sits inside a sparse halo (each halo element hangs off
// one core element by a single link). Integration is swept over the nested regions that grow the
// core and then add the halo.
//
// Measured: the integration climbs as the core fills, peaks exactly at the full core (a definite
// interior maximum), and drops sharply the instant any halo element is added, because a
// single-link element drags the connectivity down. So the complex has definite borders: both the
// subset (an unfinished core) and the superset (core plus halo) integrate strictly less than the
// core itself, the exclusion postulate.
//
// The control is a homogeneous ring, no dense core. Its integration only falls as the region grows,
// with no interior maximum, so there is no definite-bordered complex, the exclusion postulate has
// nothing to exclude. So the bordered complex is specifically the payoff of a dense core in a sparse
// environment, exactly IIT's picture of a self.
//
// Depth L2. It measures the integration profile over nested regions for a cored graph versus a
// homogeneous one, a model of IIT's exclusion postulate on the substrate's self picture. Distinct
// from the spatial-versus-temporal binding result (E-SLF-0165, which contrasts two whole systems):
// this is the definite-border property within one system.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import {
  coreWithHalo,
  ringGraph,
  integrationOverNestedRegions,
  maximalComplex,
} from '@/code/measure/exclusion'

const CORE = 12
const HALO = 12
const SIZES = [4, 8, 11, 12, 13, 16, 20, 24]

export default experiment({
  id: 'selves/exclusion-postulate',
  code: 'E-SLF-0172',
  title:
    'integration peaks at a definite interior maximum at the core boundary (a bordered complex, subsets and supersets integrate less) while a homogeneous graph has none, IIT exclusion postulate',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const cored = coreWithHalo({ coreSize: CORE, haloSize: HALO })
    const coredProfile = integrationOverNestedRegions({
      adjacency: cored,
      sizes: SIZES,
    })

    const coredComplex = maximalComplex(coredProfile)

    // the ring control has the same node count and the same nested-region sweep
    const ring = ringGraph(CORE + HALO)
    const ringProfile = integrationOverNestedRegions({
      adjacency: ring,
      sizes: SIZES,
    })

    const ringComplex = maximalComplex(ringProfile)

    // the complex sits at the full core, a definite interior maximum
    const complexAtCore = SIZES[coredComplex.argmax] === CORE
    const coredHasBorder = coredComplex.interior
    // and it is decisive: adding the halo drops integration by a large factor
    const dropFactor =
      coredComplex.max /
      Math.max(1e-9, coredProfile[coredComplex.argmax + 1]!)

    const sharpBorder = dropFactor > 5
    // the homogeneous control has NO interior complex (its max is at an endpoint)
    const ringHasNoBorder = !ringComplex.interior

    const ok =
      complexAtCore && coredHasBorder && sharpBorder && ringHasNoBorder

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'integrated information (the Fiedler value) over nested regions climbs as the dense core fills and reaches a definite interior maximum exactly at the core boundary, then drops by more than five-fold the instant a single-link halo element is added, so both the subset and the superset integrate strictly less and the complex has definite borders, while a homogeneous ring of the same size has no interior maximum at all (its integration only falls with size), so the bordered complex is the payoff of a dense core in a sparse environment, IIT exclusion postulate on the substrate self',
      metrics: {
        complexSize: SIZES[coredComplex.argmax]!,
        complexIntegration: Number(coredComplex.max.toFixed(3)),
        dropFactor: Number(dropFactor.toFixed(2)),
        coredInterior: coredComplex.interior ? 1 : 0,
        ringInterior: ringComplex.interior ? 1 : 0,
      },
      // CONTROL: the homogeneous ring has no interior maximum, no bordered complex to exclude.
      control: { ringInterior: ringComplex.interior ? 1 : 0 },
      notes:
        'IIT exclusion postulate (Tononi). The maximally-integrated set is a bordered complex, subsets and supersets integrate less. On the substrate a self is a dense core in a sparse halo, which shows the definite border; a homogeneous graph shows none.',
    })
  },
})
