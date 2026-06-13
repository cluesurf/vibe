// P5: the Hauptvermutung (does geometry recover uniquely).
// Sprinkle the same Minkowski region with many seeds, recover the dimension each
// time, and report the spread. Low variance is empirical support.
// Run: npx tsx code/experiment/p5-hauptvermutung.ts

import { pathToFileURL } from 'node:url'
import { makeRng, deriveSeed } from '@/code/tool/rng'
import { sprinkleMinkowski } from '@/code/substrate/sprinkle-minkowski'
import { myrheimMeyerDimension } from '@/code/measure/dimension'

export function main(): { mean: number; std: number; samples: number[] } {
  const targetDimension = 3
  const count = 700
  const trials = 8
  const dims: number[] = []
  for (let i = 0; i < trials; i++) {
    const rng = makeRng({ seed: deriveSeed({ base: 42, index: i }) })
    const poset = sprinkleMinkowski({ dimension: targetDimension, count, rng })
    dims.push(myrheimMeyerDimension({ poset }))
  }
  const mean = dims.reduce((a, b) => a + b, 0) / dims.length
  const variance =
    dims.reduce((a, b) => a + (b - mean) * (b - mean), 0) / dims.length
  const std = Math.sqrt(variance)

  console.log('P5 Hauptvermutung: recovered dimension across sprinklings')
  console.log('  target dimension:', targetDimension)
  console.log('  recovered mean  :', mean.toFixed(3))
  console.log('  recovered std   :', std.toFixed(3))
  console.log('  samples         :', dims.map((d) => d.toFixed(2)).join(', '))
  return { mean, std, samples: dims }
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
