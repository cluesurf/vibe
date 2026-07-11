// The enstrophy-like quadratic of the lattice gas: the sum over all sites of tone squared, which for ternary
// tone is the count of nonzero sites. The reversible knit only permutes the multiset of tone values (collide
// rearranges them within a cell, stream moves them between cells), so this quadratic is conserved exactly. This
// is the lattice form of the bound that, in the Navier-Stokes setting, the deeper conserved flow keeps and the
// reduced description forgets. A lossy rule loses the bound.

import { Will } from '@/code/tone/will'

export function enstrophy(will: Will): number {
  const data = will.data

  let s = 0

  for (const t of data) {
    s += t * t
  }

  return s
}
