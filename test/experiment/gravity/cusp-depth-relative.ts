// THE STATIC FIELD BELOW A CUSP WITH DEPTH-WEIGHTED COLUMNS, RELATIVE RESIDUAL GATE (E-GRV-0155, item
// vibe-roadmap-board-0052, gap B-52). E-GRV-0154 (board-0049) is open by its registered rule: one of 1415 Bloch solves
// (p = 6, k = 0, a field of 3.4e4) missed the ABSOLUTE 1e-12 residual gate I3 at 8.0e-12, 2.4e-16 of its field, the
// float floor. This file reruns E-GRV-0154's computation unchanged, with I3 gating the residual RELATIVE to the field
// (the 2-norm of H(k) x - e_source over the largest modulus of x, at most 1e-12), the bound fixed in the item's `what`
// (gate b4faf9f61b44) before this file was written. The absolute reading is still printed beside it, not gated.
//
// Depth L1: exact linear algebra on the true mesh against a derived prediction; no rule is run.
// DETERMINISM: the mesh, its quotients and the momentum grid are fixed; no start, no random number.

import { experiment } from '@/test/scaffold/suite'
import {
  cuspDepthWeightedRun,
  GATE_PLAN,
} from '@/test/experiment/gravity/cusp-depth-weighted'

export default experiment({
  id: 'gravity/cusp-depth-relative',
  code: 'E-GRV-0155',
  title:
    'the static field below a cusp with depth-weighted columns, E-GRV-0154 rerun with its residual gate relative to the field (board-0052, gap B-52), partial by the registered rule: every instrument gate holds (the worst of 1415 Bloch solves sits at 3.5e-13 of its field against the frozen 1e-12, its absolute residual still 8.0e-12), and every reading repeats E-GRV-0154: the column resistance grows as F^q with q -3.51, -2.04, -0.85, 0.13, 1.09, 3.02 for p 0, 1, 2, 3, 4, 6, so the infinite mesh is unscreened iff p >= 3. The RS-II warp (p = 1) stays screened (xi 0.35 docks), the horosphere-area weight (p = 3) meets B1 and B2 but not B3 (xi 1.43 docks at level 49, 4 pi K r G(r) 0.074 at r = 4), and only the sweep exponent p = 6 gives 1/r, r = 1 to 8 within 10 percent at levels 33 and 49 (xi 184)',
  category: 'gravity',
  substrates: ['3434'],
  depth: 'L1',
  paper: false,
  run() {
    return cuspDepthWeightedRun(GATE_PLAN, 'relative')
  },
})
