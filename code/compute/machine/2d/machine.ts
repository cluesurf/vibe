// The 2D prototype computer, on the ternary heptagrid {7,3}. Cell degree 7, ternary splitting tree for addressing.
// The teaching substrate.

import {
  makeVibeComputer,
  type VibeComputer,
} from '@/code/compute/machine/shared'

export function make2DMachine(maxCells = 2000): VibeComputer {
  return makeVibeComputer({ symbol: [7, 3], maxCells })
}
