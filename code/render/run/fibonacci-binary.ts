// WATCH THE BINARY 64-BIT MACHINE COMPUTE FIBONACCI, ON {7,3}. The Fibonacci function in TypeScript, compiled to
// the binary register machine (the modern-CPU representation), executed one operation at a time. Each register is
// a radial row of bit-cells (lowest bit at the centre), bright for 1 and dark for 0, so each wedge spells its
// value in binary. The accumulators a and b are violet and emerald, the rest zinc, and the running Fibonacci
// output counts up in the centre. Run: pnpm tsx code/render/run/fibonacci-binary.ts

import { runBinary } from '@/code/compute/binary-machine'
import { renderDigitFibonacci } from '@/code/render/run/digit-fibonacci'

renderDigitFibonacci({
  base: 2,
  runner: (program, initial, onStep) => { runBinary(program, initial, onStep) },
  outName: 'fibonacci-7-3-binary',
  digitsShown: 18,
  costLabel: 'word-ops',
})
