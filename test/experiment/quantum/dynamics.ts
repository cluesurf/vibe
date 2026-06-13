// P7 alignment from dynamics: the honest frontier result.
// We showed CHSH violation needs an ALIGNED setting-state correlation. Can a
// natural causal mesh produce it? In a relativistic mesh the shared past of two
// spacelike-separated measurements (the overlap of their backward light cones)
// SHRINKS with separation, and fast in an expanding hyperbolic mesh. So the
// shared-past fraction eta(d) that drives the correlation decays with separation
// d. We model eta(d) = exp(-d / xi) and measure CHSH S(d). The result: a natural
// mesh gives violation that DECAYS with separation, while quantum mechanics gives
// separation-independent violation. So naturalness and quantum violation are in
// tension for spacelike measurements, the precise residual difficulty. See
// note/experiment/results/p7-naturalness.md.
// Run: npx tsx code/experiment/p7-dynamics.ts

import { pathToFileURL } from 'node:url'
import { chshShared } from '@/test/experiment/foundations/naturalness'

export function main(): void {
  const xi = 2.0 // mesh correlation length (shared-past decay scale)
  console.log('P7: CHSH violation versus measurement separation in a natural mesh')
  console.log('  (shared-past fraction eta(d) = exp(-d/xi), aligned correlation)')
  console.log('  separation d   eta(d)   CHSH S   note')
  for (const d of [0, 1, 2, 4, 8]) {
    const eta = Math.exp(-d / xi)
    const r = chshShared({ eta, mode: 'aligned', trials: 80000, seed: 900 + d })
    const note =
      r > 2.83 ? 'above quantum' : r > 2 ? 'above classical' : 'classical'
    console.log(
      `  ${String(d).padStart(10)}   ${eta.toFixed(3)}   ${r.toFixed(3)}   ${note}`,
    )
  }
  console.log('')
  console.log('  quantum mechanics: S ~ 2.83 at ANY separation (flat).')
  console.log('  the natural mesh: S decays toward the classical bound as separation grows,')
  console.log('  because the shared past shrinks. So a natural causal mesh reproduces')
  console.log('  quantum violation only for nearby measurements, not spacelike ones,')
  console.log('  unless the correlation is fine-tuned. That is the precise residual')
  console.log('  difficulty of the classical-base reading, now made quantitative.')
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
}
