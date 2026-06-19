// P236 (quantum foundations, the Bell tension): this is an ANALYTIC / CONSISTENCY CHECK that ASSUMES the
// standard textbook CHSH facts. It enumerates the four deterministic local strategies to recover the local
// hidden-variable bound (2), and it plugs the standard optimal angles into E(x,y)=cos(x-y) to recover the
// quantum value (2*sqrt(2), the Tsirelson bound). Both numbers are well-known results of quantum mechanics
// and Bell theory, ASSUMED here, not produced by the vibe substrate. This file does NOT show the substrate
// reaches the quantum value, and it does NOT demonstrate emergent holographic nonlocality. It only states the
// known local/quantum gap, then describes (in prose) the holographic resolution as a conjecture. The base
// rule is local and so would obey CHSH <= 2. Whether a nonlocal boundary actually emerges from it is an open
// claim, not tested here. Run: npx tsx code/experiment/p236-bell-nonlocality.ts

import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

export function bellNonlocality(): {
  localMax: number
  quantumMax: number
  gap: boolean
} {
  // (1) local deterministic hidden-variable CHSH, brute force all strategies a0,a1,b0,b1 in {+-1}
  let localMax = 0
  for (const a0 of [1, -1])
    for (const a1 of [1, -1])
      for (const b0 of [1, -1])
        for (const b1 of [1, -1]) {
          const chsh = a0 * b0 + a0 * b1 + a1 * b0 - a1 * b1
          localMax = Math.max(localMax, Math.abs(chsh))
        }
  // (shared randomness is a convex mixture of deterministic strategies, so the bound stays at this max)
  // (2) quantum CHSH = E(a0,b0)+E(a0,b1)+E(a1,b0)-E(a1,b1), E(x,y)=cos(x-y), optimal angles 0,90,45,135 deg
  const deg = (d: number): number => (d * Math.PI) / 180
  const E = (x: number, y: number): number => Math.cos(x - y)
  const a0 = deg(0),
    a1 = deg(90),
    b0 = deg(45),
    b1 = deg(-45)
  const quantumMax = E(a0, b0) + E(a0, b1) + E(a1, b0) - E(a1, b1)
  const gap = quantumMax > localMax + 0.1
  return { localMax, quantumMax, gap }
}

export default experiment({
  id: 'quantum/bell-nonlocality',
  title:
    'the local CHSH bound is 2 and the quantum value is 2 sqrt 2, a restated gap',
  category: 'quantum',
  substrates: 'any',
  depth: 'L1',
  paper: false,
  run() {
    const r = bellNonlocality()
    const ok =
      r.localMax === 2 &&
      Math.abs(r.quantumMax - 2 * Math.sqrt(2)) < 1e-9 &&
      r.gap
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'enumerating local deterministic strategies gives the CHSH bound 2 and the textbook optimal angles give the quantum value 2 sqrt 2, a known gap not produced by the substrate',
      metrics: {
        localMax: r.localMax,
        quantumMax: r.quantumMax,
        tsirelson: 2 * Math.sqrt(2),
      },
      notes:
        'L1, an analytic restatement of textbook CHSH facts. The local bound is brute-forced over the four deterministic strategies (a genuine enumeration), but the quantum value plugs the standard optimal angles into cos(x - y), so it is assumed, not produced by the vibe rule. This file does NOT show the substrate reaches the quantum value. The local discrete base obeys CHSH <= 2, the holographic-boundary resolution is a conjecture stated in prose, not tested.',
    })
  },
})
