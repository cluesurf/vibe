// THE SELF'S SPECTRUM WITH A SIZE-SCALED EIGEN GATE (E-SLF-0193, item vibe-roadmap-grounding-0033). E-SLF-0188
// (grounding-0023) is FAIL by its registered rule on instrument E4 alone: its largest eigen residual 2.0e-9 sat over
// the ABSOLUTE 1e-9 bar at the 3,906-row K 0 block, the float floor (E6 rebuilt 64 beats to 2.1e-13). This file reruns
// E-SLF-0188's computation unchanged, with E4 gating each block's residual against c eps n_b N_b and its orthonormality
// against c eps n_b (eps = 2^-52, n_b the block's rows, N_b = sqrt(1 + n_b u_b) from its own E2 reading, c = 1e4), the
// bar fixed in the item's what (gate d99189b03149) before this file was written. The absolute reading is still printed
// beside it, not gated. Every other gate, setting and the verdict rule are E-SLF-0188's.
//
// FULL RUN (M3, 2026-11-17, clone spectrum-scaled, 2,291 s, light slot). PASS by the registered rule. E4 scaled holds:
// the worst ratio is 7,302 against c 1e4, at the 930-row pieces n 3 L 16 blocks (residual 1.5e-9), not at the 3,906-row
// K 0 block (2,344, residual 2.0e-9); bare n 3 L 32 5,184, orthonormality ratio 1.2. The absolute reading still fails
// (2.0e-9 against 1e-9), printed, not gated. Every other gate and reading repeats E-SLF-0188 to the digit: C1 0, Q1,
// E1 5.7e-16, E2 9.8e-15, E3 8.3e-17, E5 1.4e-10, E6 2.1e-13, D-exact 0; pieces R 1.0000 at L 16 and 32 (bound band,
// top phase -0.330018), bare R 0.6301 / 0.6302 (mixed, R_best 0.9939), G-size holds for both; P1 P3 P5 held, P2 not
// classified, P4 and P6 failed. The prediction missed the worst ratio (2,300 predicted, 7,302 read): 0023 printed only
// the run's largest residual, which hid that a smaller block sets the per-row worst.
//
// Depth L2: B1's rule in floats, spectra by the Householder solver, every pair checked by its residual.
// DETERMINISM: the quotients, sectors and starts are fixed; no random number.

import { experiment } from '@/test/scaffold/suite'
import { selfSpectrumRun } from '@/test/experiment/selves/self-spectrum'

export default experiment({
  id: 'selves/self-spectrum-scaled',
  code: 'E-SLF-0193',
  title:
    "the self's spectrum, E-SLF-0188 rerun with its eigen gate E4 scaled to block size (grounding-0033): the localized eigenvectors of B1's line sector on the (sqrt 2)^6, ^8 and ^10 quotient lines, B1's cluster's weight on them and the dark set, every residual held against c eps n of its block",
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    return selfSpectrumRun('scaled')
  },
})
