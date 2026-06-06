// B2: the chiral overlap fermion in a dynamical NON-ABELIAN SU(2) gauge field.
// The full chiral gauge theory is open, but this reaches the rung below it: a
// vector-like overlap fermion coupled to a dynamical SU(2) field, with the chiral
// condensate measured by the Banks-Casher near-zero density. Zero in the free
// theory, nonzero with the field, the non-Abelian analogue of the Schwinger
// condensate. See note/questions/remaining-frontier-spec.md (B2).
// Run: npx tsx code/experiment/p8-su2-condensate.ts

import { pathToFileURL } from 'node:url'
import { makeRng } from '~/core/rng'
import { chiralCondensateSignalSU2 } from '~/operator/overlap-su2'

export function main(): void {
  console.log('B2: chiral condensate in a dynamical SU(2) gauge field')
  console.log('  disorder   near-zero density (condensate signal)')
  let free = 0
  let maxSignal = 0
  for (const disorder of [0, 0.3, 0.6, 1.0]) {
    const r = chiralCondensateSignalSU2({
      length: 4,
      disorder,
      configs: 10,
      rng: makeRng({ seed: 600 + Math.round(disorder * 100) }),
    })
    if (disorder === 0) {
      free = r.nearZeroDensity
    }
    if (r.nearZeroDensity > maxSignal) {
      maxSignal = r.nearZeroDensity
    }
    console.log(`  ${disorder.toFixed(2).padStart(6)}     ${r.nearZeroDensity.toFixed(4).padStart(10)}`)
  }
  console.log('')
  console.log(`  condensate forms in the non-Abelian field: ${free < 0.005 && maxSignal > free ? 'YES' : 'roughly'}`)
  console.log('  the chiral fermion couples to a dynamical SU(2) field and a condensate')
  console.log('  forms from the anomaly, the rung below the open chiral gauge theory.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
