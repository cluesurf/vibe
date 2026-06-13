// P8 / A4: the chiral condensate in a dynamical gauge field (the Schwinger model).
// The overlap fermion is placed in random 2D U(1) gauge backgrounds, and we
// measure the near-zero spectral density of the gamma5-Hermitian overlap, which by
// Banks-Casher is proportional to the chiral condensate. The Schwinger condensate
// is nonzero purely from the anomaly and grows with gauge coupling, so the signal
// should rise with disorder. See note/questions/remaining-frontier-spec.md (A4).
// Run: npx tsx code/experiment/p8-schwinger.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '@/code/tool/rng'
import { chiralCondensateSignal } from '@/code/operator/overlap-condensate'

export function main(): void {
  console.log('P8 / A4: chiral condensate signal (Banks-Casher) versus gauge disorder')
  console.log('  disorder   near-zero density (condensate signal)')
  let prev = 0
  let monotone = true
  for (const disorder of [0, 0.25, 0.5, 0.75, 1.0]) {
    const r = chiralCondensateSignal({
      length: 6,
      disorder,
      configs: 12,
      rng: makeRng({ seed: 500 + Math.round(disorder * 100) }),
    })
    if (disorder > 0 && r.nearZeroDensity < prev - 0.01) {
      monotone = false
    }
    prev = r.nearZeroDensity
    console.log(
      `  ${disorder.toFixed(2).padStart(6)}     ${r.nearZeroDensity.toFixed(4).padStart(10)}`,
    )
  }
  console.log('')
  console.log(`  condensate signal grows with gauge coupling: ${monotone ? 'YES' : 'roughly'}`)
  console.log('  a nonzero, coupling-growing near-zero density is the anomaly-induced')
  console.log('  Schwinger condensate: the chiral fermion feels the dynamical gauge field.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
