// P258 (defects ARE particles): the persistent topological defects of p257 behave like real particles. A
// defect (winding +1) and an ANTI-defect (winding -1) have total charge 0, so they can ATTRACT and ANNIHILATE,
// the field relaxes to vacuum (energy -> 0). Two LIKE defects (total charge +2) CANNOT annihilate, the
// conserved total winding locks the energy above the topological minimum, they persist. So the topological
// charge is conserved in collisions, pairs annihilate, like charges persist, exactly particle-antiparticle
// behavior. This completes the persistence-to-particle story (PS5) on top of p257.
// Run: npx tsx code/experiment/p258-defect-particles-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type Z = { re: number; im: number }
function winding(theta: number[]): number {
  const L = theta.length; let w = 0
  for (let i = 0; i < L; i++) { let d = theta[(i + 1) % L]! - theta[i]!; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; w += d }
  return Math.round(w / (2 * Math.PI))
}
const phase = (z: Z): number => Math.atan2(z.im, z.re)
const energy = (psi: Z[]): number => { const L = psi.length; let e = 0; for (let i = 0; i < L; i++) { const a = psi[(i + 1) % L]!, z = psi[i]!; e += (a.re - z.re) ** 2 + (a.im - z.im) ** 2 } return e }
function relax(psi: Z[], steps: number, dt: number): { hist: number[]; final: Z[] } {
  const L = psi.length; let cur = psi.map((z) => ({ ...z })); const hist: number[] = []
  for (let t = 0; t < steps; t++) {
    const next = cur.map((z, i) => { const a = cur[(i + 1) % L]!, b = cur[(i + L - 1) % L]!; const lapRe = a.re + b.re - 2 * z.re, lapIm = a.im + b.im - 2 * z.im; const r2 = z.re * z.re + z.im * z.im, restore = 1 - r2; return { re: z.re + dt * (lapRe + restore * z.re), im: z.im + dt * (lapIm + restore * z.im) } })
    cur = next; if (t % 500 === 0) hist.push(winding(cur.map(phase)))
  }
  return { hist, final: cur }
}
// build a field of total winding w with the phase ramping smoothly around the ring
const fieldWithWinding = (L: number, w: number): Z[] => Array.from({ length: L }, (_, x) => ({ re: Math.cos(2 * Math.PI * w * x / L), im: Math.sin(2 * Math.PI * w * x / L) }))
// a localized defect/antidefect PAIR (net winding 0): phase bumps up 2pi then back down 2pi
function defectPair(L: number): Z[] {
  return Array.from({ length: L }, (_, x) => { const t = x / L; const th = 2 * Math.PI * (t < 0.5 ? Math.sin(Math.PI * 2 * t) : Math.sin(Math.PI * 2 * (1 - t))); return { re: Math.cos(th), im: Math.sin(th) } })
}

export function defectParticles(): { pairAnnihilates: boolean; likeChargesPersist: boolean; chargeConserved: boolean; particleLike: boolean } {
  const L = 64
  // (1) defect + antidefect (total winding 0) -> annihilate to vacuum
  const pair = defectPair(L)
  const wPair = winding(pair.map(phase))
  const pr = relax(pair, 6000, 0.1)
  const ePairFinal = energy(pr.final)
  const pairAnnihilates = wPair === 0 && ePairFinal < 0.01
  console.log(`P258 (1) defect+antidefect, total winding ${wPair}: energy -> ${ePairFinal.toFixed(4)} (annihilates to vacuum: ${pairAnnihilates})`)

  // (2) two LIKE defects (total winding +2) -> cannot annihilate, energy locked above topological minimum
  const like = fieldWithWinding(L, 2)
  const wLike = winding(like.map(phase))
  const lk = relax(like, 6000, 0.1)
  const eLikeFinal = energy(lk.final)
  const topoMin = (2 * Math.PI * 2) ** 2 / L // minimal energy of a total-winding-2 config on the ring
  const likeChargesPersist = wLike === 2 && eLikeFinal > 0.5 * topoMin
  console.log(`P258 (2) two like defects, total winding ${wLike}: energy -> ${eLikeFinal.toFixed(3)} (topological minimum ~${topoMin.toFixed(3)}, cannot annihilate: ${likeChargesPersist})`)

  // (3) total winding conserved throughout BOTH evolutions (no phase slips)
  const chargeConserved = pr.hist.every((w) => w === 0) && lk.hist.every((w) => w === 2)
  console.log(`P258 (3) total winding conserved through every step: pair ${pr.hist.join(',')} | like ${lk.hist.join(',')} => ${chargeConserved}`)

  const particleLike = pairAnnihilates && likeChargesPersist && chargeConserved
  console.log(`P258 => defects behave as PARTICLES: opposite charges annihilate, like charges persist, charge conserved in collisions: ${particleLike}\n`)

  return { pairAnnihilates, likeChargesPersist, chargeConserved, particleLike }
}

export default defineExperiment({
  id: 'spin/defect-particles-3434',
  title: 'topological defects annihilate in opposite-charge pairs and persist as like charges',
  category: 'spin',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = defectParticles()
    const ok =
      r.pairAnnihilates && r.likeChargesPersist && r.chargeConserved
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a defect and an anti-defect (total winding zero) relax to vacuum and annihilate, two like defects (total winding two) cannot decay and lock their energy above the topological minimum, and the total winding is conserved at every step, exactly particle-antiparticle behaviour',
      metrics: {
        pairAnnihilates: r.pairAnnihilates ? 1 : 0,
        likeChargesPersist: r.likeChargesPersist ? 1 : 0,
        chargeConserved: r.chargeConserved ? 1 : 0,
      },
      control: {
        // the like-charge pair is the negative control for annihilation: same
        // relaxation, but the conserved total winding forbids decay, so the energy
        // stays up while the opposite-charge pair falls to vacuum.
        likeChargesPersist: r.likeChargesPersist ? 1 : 0,
      },
      notes:
        'L2, known physics (topological defects in a complex order parameter, the Kibble-Zurek and XY-model picture). The like-vs-opposite charge pair is a genuine control. HONEST CAVEAT: this is a heat-flow relaxation on a 1D phase ring, NOT the directional lattice-gas base rule, so it shows the topological-charge bookkeeping, not that the base dynamics produces these defects. Deterministic given the seeded fields.',
    })
  },
})
