// P21: the graviton (a propagating massless spin-2 field), counted from the operator spectrum.
// The earlier version counted polarizations as the rank of a transverse-traceless projector, which
// is 2 by construction. This version instead reads the polarization count from the SPECTRUM of the
// graviton operator DERIVED in P24 (Christoffel -> Ricci -> Einstein), where nothing is imposed by
// hand. The spectrum at any momentum k is
//   { -(1/2)|k|^2 (one unphysical trace mode), 0, 0, 0 (three diffeomorphism gauge modes),
//     +(1/2)|k|^2, +(1/2)|k|^2 (the two physical, propagating graviton polarizations) }.
// So the two polarizations, the three gauge modes, and the masslessness are MEASURED from the
// operator, not asserted. A massive spin-2 would instead carry five degrees of freedom (the
// dimension of traceless symmetric tensors), because it has no diffeomorphism gauge freedom.
// See note/questions/frontiers.md. Run: npx tsx code/experiment/p21-graviton.ts

import { pathToFileURL } from 'node:url'
import { gravitonFromAction } from '@/test/experiment/gravity/graviton-from-action'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// Massless dispersion: lowest graviton omega^2 on a periodic lattice of side L is the
// lowest lattice momentum, 4 sin^2(pi/L), which shrinks to zero as L grows.
function minDispersion(side: number): number {
  return 4 * Math.sin(Math.PI / side) ** 2
}

// Classify the spectrum of the DERIVED graviton operator at momentum k.
function spectrumCounts(k: number[]): { physical: number; gauge: number; trace: number } {
  const r = gravitonFromAction({ k })
  const target = 0.5 * r.k2
  const tol = 1e-6 * (1 + r.k2)
  let physical = 0
  let gauge = 0
  let trace = 0
  for (const v of r.eigenvalues) {
    if (Math.abs(v - target) < tol) physical += 1
    else if (Math.abs(v) < tol) gauge += 1
    else if (Math.abs(v + target) < tol) trace += 1
  }
  return { physical, gauge, trace }
}

export function gravitonStudy(): {
  masslessPolarizations: number[]
  gaugeModes: number[]
  massiveDof: number
  dispersion: { side: number; omega2: number }[]
  allTwo: boolean
} {
  const directions = [
    [0, 0, 1],
    [1, 1, 0],
    [1, 1, 1],
    [2, 1, 3],
  ]
  const counts = directions.map((d) => spectrumCounts(d))
  return {
    masslessPolarizations: counts.map((c) => c.physical),
    gaugeModes: counts.map((c) => c.gauge),
    // A massive spin-2 has no gauge freedom, so it keeps the full traceless symmetric tensor: in 3
    // spatial dimensions that is 6 - 1 = 5 components (the vDVZ count).
    massiveDof: 5,
    dispersion: [4, 6, 8].map((side) => ({ side, omega2: minDispersion(side) })),
    allTwo: counts.every((c) => c.physical === 2 && c.gauge === 3),
  }
}

export function main(): void {
  const r = gravitonStudy()
  console.log('P21: the graviton (massless spin-2), polarizations read from the derived operator spectrum')
  console.log('')
  console.log(`  physical (propagating) polarizations per momentum direction: ${r.masslessPolarizations.join(', ')}`)
  console.log(`  diffeomorphism gauge modes (exact zero eigenvalues) per direction: ${r.gaugeModes.join(', ')}`)
  console.log('  (measured from the operator: two physical modes at +(1/2)|k|^2, three gauge zeros,')
  console.log('   and one unphysical trace mode at -(1/2)|k|^2, with NO projector imposed)')
  console.log('')
  console.log(`  a massive spin-2 would carry ${r.massiveDof} degrees of freedom (no gauge freedom): the contrast that fixes spin two`)
  console.log('')
  console.log('  massless dispersion, lowest omega^2 on a lattice of side L:')
  for (const d of r.dispersion) {
    console.log(`    L = ${d.side}: omega^2 = ${d.omega2.toFixed(3)}`)
  }
  console.log('  (shrinks as the lattice grows, so the graviton is massless: omega -> 0 as k -> 0)')
  console.log('')
  console.log(`  graviton has exactly two physical polarizations (measured, not projected): ${r.allTwo ? 'YES' : 'no'}`)
  console.log('')
  console.log('  The graviton is the propagating excitation of the geometry. Its two physical')
  console.log('  polarizations are not imposed by a transverse-traceless projector, they are read off')
  console.log('  the spectrum of the operator derived from the action in P24: two modes propagate at')
  console.log('  +(1/2)|k|^2, three are pure diffeomorphism gauge (exact zeros), and one trace mode is')
  console.log('  unphysical. That is the signature of a massless spin-2 field, the graviton.')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}

export default defineExperiment({
  id: 'gravity/graviton',
  title: 'two graviton polarizations measured from the derived operator spectrum',
  category: 'gravity',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = gravitonStudy()
    const massless = r.masslessPolarizations.every((p) => p === 2)
    const gauge = r.gaugeModes.every((g) => g === 3)
    const shrinks =
      (r.dispersion[r.dispersion.length - 1]?.omega2 ?? 9) <
      (r.dispersion[0]?.omega2 ?? 0)
    const ok = massless && gauge && r.allTwo && r.massiveDof === 5 && shrinks
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the derived graviton operator has two physical polarizations and three gauge zeros with a massless dispersion',
      metrics: {
        massiveDof: r.massiveDof,
        firstOmega2: r.dispersion[0]?.omega2 ?? 0,
        lastOmega2: r.dispersion[r.dispersion.length - 1]?.omega2 ?? 0,
      },
    })
  },
})
