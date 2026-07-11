// A LITERAL railway-CA adder, addition performed by the actual locomotive running on tracks. Each register is a
// binary counter built from flip-flop switches (code/compute/railway-ca.ts makeBinaryCounter), and `addInto`
// adds `src` into `dst` by running the locomotive through `dst`'s carry chain once per unit of `src`, a real
// ripple each time. So unlike the register-machine INTERPRETERS (runRailway / runBinary), here the arithmetic is
// genuinely the cell-level CA: the locomotive moves, the flip-flops toggle, carries propagate down the track.
//
// The control flow (the loop, the copies) is driven from here, the same division of labour the interpreters use,
// what is literal is the arithmetic: every +1 is a locomotive ripple through real switches.

import {
  makeBinaryCounter,
  type BinaryCounter,
} from '@/code/compute/railway-ca'

// dst := dst + src, by running `src.count()` real increments of `dst` (each a locomotive carry ripple)
export function addInto(
  dst: BinaryCounter,
  src: BinaryCounter,
): number {
  const times = src.count()

  for (let k = 0; k < times; k++) {
    dst.increment()
  }

  return times
}

// dst := src (clear, then add), preserving src
export function copyInto(dst: BinaryCounter, src: BinaryCounter): void {
  dst.clear()
  addInto(dst, src)
}

// Compute fib(n) on the literal railway CA. The accumulators a, b, t are binary counters of flip-flop switches;
// the loop runs the recurrence with `addInto`, so every addition is the locomotive rippling carries on tracks.
// Returns the value and the total number of locomotive increments run (the literal work done).
export function fibOnRailway(input: { n: number; bits?: number }): {
  value: number
  increments: number
} {
  const bits = input.bits ?? 16
  const a = makeBinaryCounter(bits)
  const b = makeBinaryCounter(bits)
  const t = makeBinaryCounter(bits)

  a.clear()
  b.set(1)
  t.clear()

  let increments = 0

  for (let iter = 0; iter < input.n; iter++) {
    t.clear()
    increments += addInto(t, a)
    increments += addInto(t, b) // t = a + b
    copyInto(a, b)
    increments += b.count() // a = b
    copyInto(b, t)
    increments += t.count() // b = t
  }

  return { value: a.count(), increments }
}
