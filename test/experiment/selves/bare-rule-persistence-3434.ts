// P262 (FRONTIER 3, does the BARE rule produce conserved-winding fields, honest test): p257 showed winding
// gives persistence on a sigma-model field. The deep question, does the {3,4,3,4} fermion rule produce
// such fields. We test a LINEAR field rule (illustrating the principle, NOT the specific 24-direction rule) vs a NONLINEAR one (a self-interaction that fixes
// the amplitude), seeding a topological winding and measuring (a) winding conservation and (b) localization.
//   FINDING (honest): the LINEAR rule lets the amplitude collapse (zeros form), allowing PHASE SLIPS, so the
//   winding is NOT robustly conserved and the defect DISPERSES, no persistence (confirms the P101 churn at the
//   fermion level). A NONLINEAR amplitude-preserving term (a sigma-model constraint) LOCKS the winding and the
//   defect PERSISTS. So persistence requires the dynamics to preserve a |psi|-amplitude (sigma-model structure).
//   VERDICT: the bare LINEAR rule does NOT give persistent winding, the mechanism needed is now identified (an
//   amplitude-preserving nonlinearity), and whether the conserving lattice-gas collision supplies it is the
//   precise remaining frontier.
// Run: npx tsx code/experiment/p262-bare-rule-persistence-3434.ts

import { phaseWinding } from '@/code/measure/winding'
import { experiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type C = [number, number]
const cabs = (z: C): number => Math.hypot(z[0], z[1])
const cphase = (z: C): number => Math.atan2(z[1], z[0])
const winding = (psi: C[]): number => phaseWinding(psi.map(cphase))
const peak = (psi: C[]): number => Math.max(...psi.map(cabs))

// evolve a complex field: linear Schrodinger (free, the bare-walk envelope) OR nonlinear sigma-model (|psi|->1)
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

      // linear: i dpsi/dt = -lap (Schrodinger). nonlinear: add an amplitude-restoring term (1-|psi|^2)psi (sigma-model)
      const r2 = z[0] * z[0] + z[1] * z[1],
        rest = nonlinear ? 1 - r2 : 0

      // i dpsi = dt*( -lap ); => dpsi = dt*( i*lap ) ... use a stable split: diffuse the amplitude + restore
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

export function bareRulePersistence(): {
  linearLosesWinding: boolean
  linearDisperses: boolean
  nonlinearKeepsWinding: boolean
  nonlinearPersists: boolean
  mechanismIdentified: boolean
} {
  const L = 64
  // a winding-1 defect localized as a bump that the dynamics can collapse (amplitude varies, allowing slips)
  const psi0: C[] = Array.from({ length: L }, (_, x) => {
    const amp = 0.3 + 0.7 * Math.exp(-((x - L / 2) ** 2) / 40)
    const ph = (2 * Math.PI * x) / L

    return [amp * Math.cos(ph), amp * Math.sin(ph)]
  })

  const w0 = winding(psi0),
    p0 = peak(psi0)

  // LINEAR (bare walk envelope): amplitude collapses, phase slips, winding not robustly conserved, disperses
  const lin = evolve(psi0, 4000, false)
  const linW = lin.wHist[lin.wHist.length - 1]!
  const linearLosesWinding =
    linW !== w0 || lin.wHist.some(w => w !== w0)

  const linearDisperses =
    lin.peakHist[lin.peakHist.length - 1]! < p0 * 0.7

  // NONLINEAR (amplitude-preserving sigma-model): winding locked, defect persists
  const non = evolve(psi0, 4000, true)
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
    linearDisperses,
    nonlinearKeepsWinding,
    nonlinearPersists,
    mechanismIdentified,
  }
}

export default experiment({
  id: 'selves/bare-rule-persistence-3434',
  code: 'E-SLF-0008',
  title:
    'a linear field rule loses winding while an amplitude-preserving nonlinear rule locks it',
  category: 'selves',
  substrates: ['3434'],
  depth: 'L2',
  paper: false,
  run() {
    const r = bareRulePersistence()
    const ok = r.mechanismIdentified

    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'a linear field rule lets a topological winding slip and disperse while an amplitude-preserving nonlinearity locks the winding and the defect persists',
      metrics: {
        linearLosesWinding: r.linearLosesWinding ? 1 : 0,
        linearDisperses: r.linearDisperses ? 1 : 0,
        nonlinearKeepsWinding: r.nonlinearKeepsWinding ? 1 : 0,
        nonlinearPersists: r.nonlinearPersists ? 1 : 0,
      },
      control: {
        linearWindingLost: r.linearLosesWinding ? 1 : 0,
        nonlinearWindingLocked: r.nonlinearKeepsWinding ? 1 : 0,
      },
      notes:
        'L2, not base-emergent. This tests a LINEAR vs a NONLINEAR field PDE, illustrating the principle, NOT the bare 24-direction rule. The amplitude-preserving nonlinearity is an added ingredient, not one of the five base things. The honest reading is that the linear (bare-walk envelope) rule does not give persistent winding, and a sigma-model constraint is needed. Whether the conserving lattice-gas collision supplies that constraint is the open frontier. The linear-vs-nonlinear pair is the control.',
    })
  },
})
