// The 4D prototype computer, on {3,4,3,4}, the vibe base. Each cell is the 24-cell, degree 24 (the D4 root
// directions), the spinor-carrying dock. The golden substrate. See
// note/research/vibe/notes/theory-v0.8.0/notes/computation/06-substrate-4d-3-4-3-4.md.

import { makeVibeComputer, type VibeComputer } from '@/code/compute/machine/shared'

export function make4DMachine(maxCells = 2000): VibeComputer {
  return makeVibeComputer({ symbol: [3, 4, 3, 4], maxCells })
}
