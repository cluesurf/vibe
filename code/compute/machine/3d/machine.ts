// The 3D prototype computer, on the dodecagrid {5,3,4}. Cell degree 12 (an icosahedron of directions). The
// strongly-universal CA's home. See note/research/vibe/notes/theory-v0.8.0/notes/computation/05-substrate-3d-5-3-4.md.

import {
  makeVibeComputer,
  type VibeComputer,
} from '@/code/compute/machine/shared'

export function make3DMachine(maxCells = 2000): VibeComputer {
  return makeVibeComputer({ symbol: [5, 3, 4], maxCells })
}
