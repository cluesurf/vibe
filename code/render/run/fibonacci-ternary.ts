// WATCH THE TERNARY MACHINE COMPUTE FIBONACCI, ON {7,3}. The Fibonacci function compiled to the base-3 register
// machine (ternary-machine.ts), the vibe-theory-aligned representation, since the vibe base model is ternary tone.
// Each register is a radial row of TRIT-cells (base-3 digits, lowest at the centre): a 0 is dark, a 1 mid, a 2
// the vivid hue, so each wedge spells its value in base 3. The accumulators a and b are violet and emerald, the
// rest zinc, and the running Fibonacci output counts up in the centre. Run: pnpm tsx code/render/run/fibonacci-ternary.ts

import { runTernary } from '@/code/compute/ternary-machine'
import { renderDigitFibonacci } from '@/code/render/run/digit-fibonacci'

renderDigitFibonacci({
  base: 3,
  runner: (program, initial, onStep) => { runTernary(program, initial, onStep) },
  outName: 'fibonacci-7-3-ternary',
  digitsShown: 12, // fib to 55 = 2001 in base 3 (4 trits); headroom shows the word is sparse
  costLabel: 'trit-ops',
})
