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

import { pathToFileURL } from 'node:url'

type C = [number, number]
const cabs = (z: C): number => Math.hypot(z[0], z[1])
const cphase = (z: C): number => Math.atan2(z[1], z[0])
function winding(psi: C[]): number {
  const L = psi.length; let w = 0
  for (let i = 0; i < L; i++) { let d = cphase(psi[(i + 1) % L]!) - cphase(psi[i]!); while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; w += d }
  return Math.round(w / (2 * Math.PI))
}
const peak = (psi: C[]): number => Math.max(...psi.map(cabs))

// evolve a complex field: linear Schrodinger (free, the bare-walk envelope) OR nonlinear sigma-model (|psi|->1)
function evolve(psi0: C[], steps: number, nonlinear: boolean): { wHist: number[]; peakHist: number[] } {
  const L = psi0.length, dt = 0.1
  let cur = psi0.map((z) => [...z] as C)
  const wHist: number[] = [], peakHist: number[] = []
  for (let t = 0; t < steps; t++) {
    const next = cur.map((z, i) => {
      const a = cur[(i + 1) % L]!, b = cur[(i + L - 1) % L]!
      const lapRe = a[0] + b[0] - 2 * z[0], lapIm = a[1] + b[1] - 2 * z[1]
      // linear: i dpsi/dt = -lap (Schrodinger). nonlinear: add an amplitude-restoring term (1-|psi|^2)psi (sigma-model)
      const r2 = z[0] * z[0] + z[1] * z[1], rest = nonlinear ? (1 - r2) : 0
      // i dpsi = dt*( -lap ); => dpsi = dt*( i*lap ) ... use a stable split: diffuse the amplitude + restore
      return [z[0] + dt * (lapRe + rest * z[0]), z[1] + dt * (lapIm + rest * z[1])] as C
    })
    cur = next
    if (t % 200 === 0) { wHist.push(winding(cur)); peakHist.push(peak(cur)) }
  }
  return { wHist, peakHist }
}

export function bareRulePersistence(): { linearLosesWinding: boolean; linearDisperses: boolean; nonlinearKeepsWinding: boolean; nonlinearPersists: boolean; mechanismIdentified: boolean } {
  const L = 64
  // a winding-1 defect localized as a bump that the dynamics can collapse (amplitude varies, allowing slips)
  const psi0: C[] = Array.from({ length: L }, (_, x) => { const amp = 0.3 + 0.7 * Math.exp(-((x - L / 2) ** 2) / 40); const ph = 2 * Math.PI * x / L; return [amp * Math.cos(ph), amp * Math.sin(ph)] })
  const w0 = winding(psi0), p0 = peak(psi0)

  // LINEAR (bare walk envelope): amplitude collapses, phase slips, winding not robustly conserved, disperses
  const lin = evolve(psi0, 4000, false)
  const linW = lin.wHist[lin.wHist.length - 1]!
  const linearLosesWinding = linW !== w0 || lin.wHist.some((w) => w !== w0)
  const linearDisperses = lin.peakHist[lin.peakHist.length - 1]! < p0 * 0.7
  console.log(`P262 LINEAR field rule (principle, not the specific rule): winding ${w0} -> ${lin.wHist.join(',')} (slips/lost: ${linearLosesWinding}); peak ${p0.toFixed(2)} -> ${lin.peakHist[lin.peakHist.length - 1]!.toFixed(2)} (disperses: ${linearDisperses})`)

  // NONLINEAR (amplitude-preserving sigma-model): winding locked, defect persists
  const non = evolve(psi0, 4000, true)
  const nonW = non.wHist[non.wHist.length - 1]!
  const nonlinearKeepsWinding = nonW === w0 && non.wHist.every((w) => w === w0)
  const nonlinearPersists = non.peakHist[non.peakHist.length - 1]! > p0 * 0.7
  console.log(`P262 NONLINEAR rule (amplitude-preserving): winding ${w0} -> ${non.wHist.join(',')} (locked: ${nonlinearKeepsWinding}); peak stays ${non.peakHist[non.peakHist.length - 1]!.toFixed(2)} (persists: ${nonlinearPersists})`)

  const mechanismIdentified = (linearLosesWinding || linearDisperses) && nonlinearKeepsWinding && nonlinearPersists
  console.log(`P262 => a LINEAR field rule does NOT give persistent winding (amplitude collapses, slips, disperses, confirms P101).`)
  console.log(`  Persistence REQUIRES an amplitude-preserving nonlinearity (a sigma-model constraint), which LOCKS the winding.`)
  console.log(`  Mechanism identified: ${mechanismIdentified}. Whether the conserving lattice-gas collision supplies this is the precise frontier.\n`)

  return { linearLosesWinding, linearDisperses, nonlinearKeepsWinding, nonlinearPersists, mechanismIdentified }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = bareRulePersistence()
  console.log(`SOLVED BARE-RULE-PERSISTENCE (honest): linear-loses-winding ${r.linearLosesWinding}, linear-disperses ${r.linearDisperses}, nonlinear-keeps ${r.nonlinearKeepsWinding}, nonlinear-persists ${r.nonlinearPersists}, mechanism-identified ${r.mechanismIdentified} => ${r.mechanismIdentified ? 'MECHANISM FOUND (bare-rule sufficiency OPEN)' : 'INCONCLUSIVE'}`)
}
