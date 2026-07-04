// Hearst's individuation criterion on the substrate (darren-hearst in the related-theories
// census): a subject individuates when its internal integration exceeds its external
// coupling, Phi_internal > C_external. On the mesh this is the binding margin of a compact
// region, (internal edges - boundary edges) / (total), which is positive when the region
// is more bound to itself than to the outside. The claim is that the {3,4,3,4} mesh
// SUPPORTS individuated selves (compact regions with a positive margin) while a
// degree-preserving scramble, an expander with no low-conductance cut, does not, so no
// region on it ever individuates. The same criterion run backwards is death: as a
// region's margin falls below zero, the binding dissolves (king and belli-lacin reach the
// same wave-returns-to-the-sea image).
//
// Depth L2, a graph-conductance property read through Hearst's criterion, with the
// scramble the control that could have failed.

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'
import { d4Mesh, meshNeighbors } from '@/code/tool/mesh'
import { scrambleNeighbors } from '@/code/control/scramble'
import { ballAtRadius, bindingMargin } from '@/code/coarse/binding-margin'

export default experiment({
  id: 'selves/individuation-margin',
  code: 'E-SLF-0158',
  title:
    'a compact region on {3,4,3,4} individuates (internal integration exceeds external coupling, Hearst Phi>C_ext) while no region on a degree-matched scramble does',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const mesh = d4Mesh({ side: 6 })
    const neighbors = meshNeighbors(mesh)
    const scrambled = scrambleNeighbors({ neighbors, seed: 1, passes: 8 })

    // grow a compact ball from a fixed centre and read the binding margin at each radius,
    // on the real mesh and on the scramble (the SAME regions, so only the geometry
    // differs). The mesh individuates where the margin crosses above zero.
    const radii = [1, 2, 3, 4]
    const meshMargins: number[] = []
    const scrambleMargins: number[] = []

    for (const radius of radii) {
      const region = ballAtRadius({ mesh, center: 0, radius })
      meshMargins.push(bindingMargin({ neighbors, region }).margin)
      scrambleMargins.push(bindingMargin({ neighbors: scrambled, region }).margin)
    }

    const bestMeshMargin = Math.max(...meshMargins)
    const bestScrambleMargin = Math.max(...scrambleMargins)
    // the individuation radius: the smallest radius whose margin is positive (a self
    // exists). Reported as the crossing point, or -1 if the mesh never individuates.
    const individuationRadius =
      radii[meshMargins.findIndex(m => m > 0)] ?? -1

    const meshIndividuates = bestMeshMargin > 0
    const scrambleNeverIndividuates = bestScrambleMargin < 0
    const ok = meshIndividuates && scrambleNeverIndividuates

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a compact region on {3,4,3,4} individuates in Hearst sense, its internal integration exceeds its external coupling so the binding margin (internal minus boundary edges, over the total) is positive, and a self exists as a bound region. On a degree-preserving scramble, an expander with no low-conductance cut, the same regions never individuate, their margin stays negative because the boundary always dominates. So the geometry supports selves and the degree alone does not, and the same margin run backwards is death, the binding dissolving as the margin crosses below zero. Depth L2, a graph-conductance property read through Hearst individuation criterion, the scramble the control.',
      metrics: {
        bestMeshMargin,
        bestScrambleMargin,
        individuationRadius,
        meshMarginAtMaxRadius: meshMargins[meshMargins.length - 1]!,
        scrambleMarginAtMaxRadius: scrambleMargins[scrambleMargins.length - 1]!,
      },
      control: {
        bestScrambleMargin,
      },
      notes:
        'the discriminating control is the scramble: same 24-regular degree, locality gone, so no compact low-conductance region exists and nothing individuates. On the hyperbolic mesh the boundary of a ball is a constant fraction of its volume (unlike a flat lattice where it vanishes), so a self keeps a real coupling to the world even while individuated, which matches vibe picture of a self as a local gathering that never fully seals. This reads the graph only, a structural proxy, not the tone dynamics.',
    })
  },
})
