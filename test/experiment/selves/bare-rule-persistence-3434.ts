// P262 (FRONTIER 3, does the BARE rule produce conserved-winding fields, honest test): p257 showed winding
// gives persistence on a sigma-model field. The deep question, does the {3,4,3,4} fermion rule produce
// such fields. We test a LINEAR field rule (illustrating the principle, NOT the specific 24-direction rule)
// vs a NONLINEAR one (a self-interaction that fixes the amplitude), seeding a topological winding and
// measuring (a) winding conservation and (b) localization. The linear rule here is explicit-Euler DIFFUSION
// of the two field components (there is no imaginary unit in the update, so it is NOT a Schrodinger
// evolution, the June 2026 audit verified this).
//   FINDING (honest): the LINEAR diffusion rule lets the amplitude collapse and the defect DISPERSES, no
//   persistence (confirms the P101 churn at the fermion level). Whether the winding also slips is SIZE
//   DEPENDENT, at the committed L=64 it slips, at L=96 the winding survives all 4000 steps and only the
//   dispersal half of the disjunction holds. A NONLINEAR amplitude-preserving term (a sigma-model constraint)
//   LOCKS the winding and the defect PERSISTS at both sizes.
//   VERDICT: the linear diffusion rule does NOT give a persistent localized defect, the mechanism needed is
//   identified (an amplitude-preserving nonlinearity), and whether the conserving lattice-gas collision
//   supplies it is the precise remaining frontier.

import { phaseWinding } from '@/code/measure/winding'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type C = [number, number]
const cabs = (z: C): number => Math.hypot(z[0], z[1])
const cphase = (z: C): number => Math.atan2(z[1], z[0])
const winding = (psi: C[]): number => phaseWinding(psi.map(cphase))
const peak = (psi: C[]): number => Math.max(...psi.map(cabs))

// evolve a two-component field by explicit-Euler diffusion of both components (the LINEAR rule, no imaginary
// unit, so this is a heat flow, not a Schrodinger evolution) OR with an added amplitude-restoring
// (1-|psi|^2)psi term (the NONLINEAR sigma-model constraint)
function evolve(
  psi0: C[],
  steps: number,
  nonlinear: boolean,
): { wHist: number[]; peakHist: number[] } {
  const L = psi0.length,
    dt = 0.1

  let cur = psi0.map(z => [...z] as C)

  const wHist: number[] = [],
    peakHist: number[] = []

  for (let t = 0; t < steps; t++) {
    const next = cur.map((z, i) => {
      const a = cur[(i + 1) % L]!,
        b = cur[(i + L - 1) % L]!

      const lapRe = a[0] + b[0] - 2 * z[0],
        lapIm = a[1] + b[1] - 2 * z[1]

      // linear: dpsi/dt = lap (component-wise diffusion). nonlinear: add the amplitude-restoring term
      // (1-|psi|^2)psi (sigma-model)
      const r2 = z[0] * z[0] + z[1] * z[1],
        rest = nonlinear ? 1 - r2 : 0

      return [
        z[0] + dt * (lapRe + rest * z[0]),
        z[1] + dt * (lapIm + rest * z[1]),
      ] as C
    })

    cur = next

    if (t % 200 === 0) {
      wHist.push(winding(cur))
      peakHist.push(peak(cur))
    }
  }

  return { wHist, peakHist }
}

export function bareRulePersistence(L = 64): {
  linearLosesWinding: boolean
  linearWindingLifetime: number
  linearDisperses: boolean
  nonlinearKeepsWinding: boolean
  nonlinearPersists: boolean
  mechanismIdentified: boolean
  steps: number
} {
  const steps = 4000
  // a winding-1 defect localized as a bump that the dynamics can collapse (amplitude varies, allowing slips)
  const psi0: C[] = Array.from({ length: L }, (_, x) => {
    const amp = 0.3 + 0.7 * Math.exp(-((x - L / 2) ** 2) / 40)
    const ph = (2 * Math.PI * x) / L

    return [amp * Math.cos(ph), amp * Math.sin(ph)]
  })

  const w0 = winding(psi0),
    p0 = peak(psi0)

  // LINEAR (diffusion): the amplitude collapses and the defect disperses. Whether the winding also slips is
  // size dependent (it does at L=64, it does not within 4000 steps at L=96).
  const lin = evolve(psi0, steps, false)
  const linW = lin.wHist[lin.wHist.length - 1]!
  const linearLosesWinding =
    linW !== w0 || lin.wHist.some(w => w !== w0)

  // the step of the first observed winding change (200-step sampling), or the full run if it never changes
  const firstSlip = lin.wHist.findIndex(w => w !== w0)
  const linearWindingLifetime =
    firstSlip === -1 ? steps : firstSlip * 200

  const linearDisperses =
    lin.peakHist[lin.peakHist.length - 1]! < p0 * 0.7

  // NONLINEAR (amplitude-preserving sigma-model): winding locked, defect persists
  const non = evolve(psi0, steps, true)
  const nonW = non.wHist[non.wHist.length - 1]!
  const nonlinearKeepsWinding =
    nonW === w0 && non.wHist.every(w => w === w0)

  const nonlinearPersists =
    non.peakHist[non.peakHist.length - 1]! > p0 * 0.7

  const mechanismIdentified =
    (linearLosesWinding || linearDisperses) &&
    nonlinearKeepsWinding &&
    nonlinearPersists

  return {
    linearLosesWinding,
    linearWindingLifetime,
    linearDisperses,
    nonlinearKeepsWinding,
    nonlinearPersists,
    mechanismIdentified,
    steps,
  }
}

export default experiment({
  id: 'selves/bare-rule-persistence-3434',
  code: 'E-SLF-0008',
  title:
    'a linear diffusion rule disperses a winding defect while an amplitude-preserving nonlinear rule locks it',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = bareRulePersistence(64)
    // the size dependence of the winding half, at L=96 the linear rule keeps the winding for the whole run
    const r96 = bareRulePersistence(96)
    const ok = r.mechanismIdentified && r96.mechanismIdentified

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a linear diffusion rule lets a topological winding defect disperse (and at L=64 the winding also slips, though at L=96 it survives all 4000 steps, so the winding half is size dependent) while an amplitude-preserving nonlinearity locks the winding and the defect persists at both sizes',
      metrics: {
        linearLosesWinding: r.linearLosesWinding ? 1 : 0,
        linearWindingLifetimeL64: r.linearWindingLifetime,
        linearWindingLifetimeL96: r96.linearWindingLifetime,
        linearDisperses: r.linearDisperses ? 1 : 0,
        linearDispersesL96: r96.linearDisperses ? 1 : 0,
        nonlinearKeepsWinding: r.nonlinearKeepsWinding ? 1 : 0,
        nonlinearPersists: r.nonlinearPersists ? 1 : 0,
        steps: r.steps,
      },
      control: {
        linearWindingLost: r.linearLosesWinding ? 1 : 0,
        nonlinearWindingLocked: r.nonlinearKeepsWinding ? 1 : 0,
      },
      notes:
        'L2, not base-emergent. This tests a LINEAR vs a NONLINEAR field PDE, illustrating the principle, NOT the bare 24-direction rule. The linear rule is explicit-Euler diffusion of both components (no imaginary unit, not a Schrodinger evolution, the old comment was mislabeled). The winding claim is size honest, at L=64 the winding slips (lifetime reported at 200-step sampling) but at L=96 the linear rule keeps the winding for all 4000 steps, so there the linear side of the verdict holds only through the dispersal half of the (losesWinding OR disperses) disjunction. The amplitude-preserving nonlinearity is an added ingredient, not part of the base. The honest reading is that the linear diffusion rule does not give a persistent localized defect, and a sigma-model constraint is needed. Whether the conserving lattice-gas collision supplies that constraint is the open frontier. The linear-vs-nonlinear pair is the control.',
    })
  },
})
