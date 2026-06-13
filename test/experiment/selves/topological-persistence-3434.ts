// P257 (THE CENTRAL GAP, persistence): the pure rule gives churn with no persistent selves (P101). The one
// honest route to a persistent PARTICLE is TOPOLOGICAL: a defect whose winding number is a conserved charge,
// so it cannot decay locally. We test this directly. A phase field on a ring (the spinor phase) with winding
// w = 1 (a kink) is evolved by a LOCAL relaxation rule. The profile relaxes (energy drops) but the winding w
// is LOCKED, the defect PERSISTS. Control: a w = 0 bump relaxes all the way to uniform (no persistence). So
// topological charge gives genuine persistence, the mechanism the program needs. HONEST CAVEAT: this shows a
// field with winding structure persists, the spinor field (8s/8c) has this structure, but whether the bare
// {3,4,3,4} rule dynamically produces conserved-winding fields is the deeper open question.
// Run: npx tsx code/experiment/p257-topological-persistence-3434.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

// winding number of a phase field on a ring: (1/2pi) sum of wrapped phase differences
function winding(theta: number[]): number {
  const L = theta.length; let w = 0
  for (let i = 0; i < L; i++) { let d = theta[(i + 1) % L]! - theta[i]!; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; w += d }
  return Math.round(w / (2 * Math.PI))
}

// local relaxation of a complex field psi = r e^{i theta} (a lattice Ginzburg-Landau / heat flow that keeps |psi|>0)
function relax(psi: { re: number; im: number }[], steps: number, dt: number): { re: number; im: number }[] {
  const L = psi.length
  let cur = psi.map((z) => ({ ...z }))
  for (let t = 0; t < steps; t++) {
    const next = cur.map((z, i) => {
      const a = cur[(i + 1) % L]!, b = cur[(i + L - 1) % L]!
      // discrete Laplacian (diffusion) + a weak |psi|->1 restoring term (keeps the field from vanishing)
      const lapRe = a.re + b.re - 2 * z.re, lapIm = a.im + b.im - 2 * z.im
      const r2 = z.re * z.re + z.im * z.im, restore = (1 - r2)
      return { re: z.re + dt * (lapRe + restore * z.re), im: z.im + dt * (lapIm + restore * z.im) }
    })
    cur = next
  }
  return cur
}

const phase = (z: { re: number; im: number }): number => Math.atan2(z.im, z.re)
const energy = (psi: { re: number; im: number }[]): number => { const L = psi.length; let e = 0; for (let i = 0; i < L; i++) { const a = psi[(i + 1) % L]!, z = psi[i]!; e += (a.re - z.re) ** 2 + (a.im - z.im) ** 2 } return e }

export function topologicalPersistence(): { windingConserved: boolean; energyRelaxes: boolean; defectPersists: boolean; trivialDecays: boolean; discriminates: boolean } {
  const L = 64
  // w = 1 kink: psi = e^{i * 2pi x / L} (winds once around the ring)
  const kink = Array.from({ length: L }, (_, x) => ({ re: Math.cos(2 * Math.PI * x / L), im: Math.sin(2 * Math.PI * x / L) }))
  const w0 = winding(kink.map(phase)), e0 = energy(kink)
  const kinkRelaxed = relax(kink, 4000, 0.1)
  const w1 = winding(kinkRelaxed.map(phase)), e1 = energy(kinkRelaxed)
  const windingConserved = w0 === 1 && w1 === 1
  const energyRelaxes = e1 < e0 - 1e-6
  const defectPersists = windingConserved // the winding is locked => the defect cannot decay

  // CONTROL: w = 0 bump (a local perturbation, no winding) relaxes all the way to uniform
  const bump = Array.from({ length: L }, (_, x) => { const g = Math.exp(-((x - L / 2) ** 2) / 50); return { re: 1 - 0.8 * g, im: 0.3 * g } })
  const wb0 = winding(bump.map(phase)), eb0 = energy(bump)
  const bumpRelaxed = relax(bump, 4000, 0.1)
  const eb1 = energy(bumpRelaxed)
  const trivialDecays = wb0 === 0 && eb1 < eb0 * 0.05 // relaxes to (near) uniform

  const discriminates = defectPersists && trivialDecays

  return { windingConserved, energyRelaxes, defectPersists, trivialDecays, discriminates }
}

export default defineExperiment({
  id: 'selves/topological-persistence-3434',
  title: 'a winding-1 defect persists under relaxation while a winding-0 bump decays',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = topologicalPersistence()
    const ok = r.discriminates
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'under a local relaxation rule a winding-1 phase defect keeps its topological charge and persists while a winding-0 bump relaxes to uniform, so a conserved winding is the mechanism for a particle that cannot decay locally',
      metrics: {
        windingConserved: r.windingConserved ? 1 : 0,
        energyRelaxes: r.energyRelaxes ? 1 : 0,
        defectPersists: r.defectPersists ? 1 : 0,
        trivialDecays: r.trivialDecays ? 1 : 0,
      },
      control: {
        windingOneSurvives: r.defectPersists ? 1 : 0,
        windingZeroDecays: r.trivialDecays ? 1 : 0,
      },
      notes:
        'L2 with the winding-0 control. Deterministic. The relaxation uses an amplitude-restoring term, an added ingredient, not the bare rule, so this shows the topological mechanism, not base emergence. The honest caveat is that whether the bare {3,4,3,4} rule dynamically produces conserved-winding fields is the deeper open question.',
    })
  },
})
