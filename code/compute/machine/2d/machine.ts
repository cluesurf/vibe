// The 2D prototype computer, on the ternary heptagrid {7,3}. Cell degree 7, ternary splitting tree for addressing.
// The teaching substrate. See note/research/vibe/notes/theory-v0.8.0/notes/computation/04-substrate-2d-7-3.md.

import {
  makeVibeComputer,
  type VibeComputer,
} from '@/code/compute/machine/shared'

export function make2DMachine(maxCells = 2000): VibeComputer {
  return makeVibeComputer({ symbol: [7, 3], maxCells })
}
