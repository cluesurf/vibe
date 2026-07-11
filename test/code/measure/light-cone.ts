// Conformance for code/measure/light-cone: free streaming with no interaction advances
// a charge exactly one cell per beat, so the front radius is the beat count (z = 1, the
// causal maximum normalized to one). On a mesh large enough that the front stays interior
// this is exact integer arithmetic, so we assert equality, not a fit.

import { suite, check, exactArray, equal } from '@/test/code/harness'
import { cubicMesh } from '@/code/tool/mesh'
import {
  lightConeRadii,
  streamingConeRadii,
} from '@/code/measure/light-cone'

suite('measure/light-cone: free streaming front', [
  // side 11 keeps the centre 5 cells from every wall, so 4 beats (radius 4) never wrap.
  check('the cubic front radius is 1,2,3,4 (one cell per beat)', () => {
    exactArray(lightConeRadii({ side: 11, beats: 4 }), [1, 2, 3, 4])
  }),
  check('the front never outruns the beat count (causality)', () => {
    const radii = lightConeRadii({ side: 15, beats: 6 })

    for (let i = 0; i < radii.length; i++)
      equal(radii[i]!, i + 1, `beat ${i + 1} front radius`)
  }),
  // The graph-distance cone via streamingConeRadii must agree: the farthest perturbed
  // cell is at graph distance equal to the beat count on the open interior.
  check(
    'the graph-distance streaming cone is also ballistic (z = 1)',
    () => {
      const mesh = cubicMesh({ side: 13 })

      exactArray(
        streamingConeRadii({ mesh, beats: 5 }),
        [1, 2, 3, 4, 5],
      )
    },
  ),
])
