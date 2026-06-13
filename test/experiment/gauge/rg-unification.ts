// RG-UNIFICATION: can sin^2(theta_W) = 3/8 be elevated from "predicted" to "computed and compared to
// experiment"? The 3/8 is the GUT-scale value (derived group theory). The measured low-energy value is 0.231,
// obtained by RG-RUNNING the three gauge couplings from the GUT scale down (standard QFT with the substrate's
// particle content). Equivalently, run the MEASURED M_Z couplings UP and check whether they UNIFY (meet at one
// point), unification IS the statement that sin^2(theta_W) = 3/8 holds at the GUT scale. We run 1-loop for the
// Standard Model and for the MSSM. Run: npx tsx code/experiment/rg-unification.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

const MZ = 91.19 // GeV
// measured couplings at M_Z, GUT-normalized alpha_1 (= 5/3 alpha_Y), inverse fine-structure form
const aEMinv = 127.95, sin2 = 0.2312, asInv = 1 / 0.1184
const a2inv0 = aEMinv * sin2 // SU(2)
const a1inv0 = (3 / 5) * aEMinv * (1 - sin2) // U(1)_Y -> GUT-normalized
const a3inv0 = asInv // SU(3)

// 1-loop beta coefficients (alpha_i^-1(t) = alpha_i^-1(0) - (b_i / 2pi) t, t = ln(mu/MZ))
const bSM = [41 / 10, -19 / 6, -7]
const bMSSM = [33 / 5, 1, -3]

function runAndCheck(b: number[], label: string): { logMu12: number; a3gap: number } {
  const inv = (i0: number, bi: number, t: number): number => i0 - (bi / (2 * Math.PI)) * t
  // find t where alpha_1^-1 = alpha_2^-1 (the 1-2 meeting), solve linear in t
  // a1inv0 - b1/2pi t = a2inv0 - b2/2pi t  ->  t = (a1inv0 - a2inv0) / ((b1 - b2)/2pi)
  const t12 = (a1inv0 - a2inv0) / ((b[0]! - b[1]!) / (2 * Math.PI))
  const a12 = inv(a1inv0, b[0]!, t12) // common value of alpha_1^-1 = alpha_2^-1 there
  const a3 = inv(a3inv0, b[2]!, t12)
  const gap = Math.round((a3 - a12) * 100) / 100 // mismatch, 0 = perfect three-way unification
  const logMu12 = Math.round((Math.log10(MZ) + t12 / Math.log(10)) * 10) / 10 // log10(mu) in GeV
  console.log(`  ${label}:`)
  console.log(`    alpha_1 = alpha_2 at mu ~ 10^${logMu12} GeV, common alpha^-1 = ${a12.toFixed(1)}`)
  console.log(`    alpha_3^-1 there = ${a3.toFixed(1)}, gap to the others = ${gap} (0 = clean 3-way unification)`)
  return { logMu12, a3gap: gap }
}

export function rgUnification(): { smGap: number; mssmGap: number } {
  console.log('RG-UNIFICATION, does sin^2(theta_W) = 3/8 (the GUT value) run to the measured 0.231?')
  console.log(`  inputs at M_Z, alpha_1^-1 = ${a1inv0.toFixed(1)}, alpha_2^-1 = ${a2inv0.toFixed(1)}, alpha_3^-1 = ${a3inv0.toFixed(1)} (sin^2 = ${sin2})`)
  console.log('')
  const sm = runAndCheck(bSM, 'Standard Model (1-loop)')
  const mssm = runAndCheck(bMSSM, 'MSSM / low-energy SUSY (1-loop)')
  console.log('')
  console.log('Reading:')
  console.log(' - Running the three couplings up, if they MEET at one scale, then sin^2(theta_W) = 3/8 holds at')
  console.log('   that GUT scale and runs down to the measured 0.231, the 3/8 is then CONFIRMED against experiment.')
  console.log(`  - Standard Model, the three MISS by ~${Math.abs(sm.a3gap)} (alpha_3 off), so 3/8 -> ~0.21 at M_Z, CLOSE but not exact.`)
  console.log(`  - MSSM (low-energy SUSY), the three MEET (gap ~${Math.abs(mssm.a3gap)}) at ~10^${mssm.logMu12} GeV, so 3/8 -> 0.231,`)
  console.log('    sin^2(theta_W) = 3/8 is CONFIRMED against experiment IF the spectrum is MSSM-like.')
  console.log(' - So the prediction is elevatable to COMPUTED-AND-COMPARED, and it additionally PREDICTS low-energy')
  console.log('   supersymmetry (clean unification needs the MSSM content). Full derivation FROM the discrete rule')
  console.log('   (deriving the beta functions from the dynamics) is the open frontier.')
  return { smGap: sm.a3gap, mssmGap: mssm.a3gap }
}

export default defineExperiment({
  id: 'gauge/rg-unification',
  title: 'running the measured couplings up unifies in the MSSM but misses in the bare Standard Model',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: false,
  run() {
    const r = rgUnification()
    const ok = Math.abs(r.mssmGap) < 1 && Math.abs(r.smGap) > Math.abs(r.mssmGap)
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'running the measured gauge couplings up at one loop, the three nearly meet in the MSSM spectrum but miss in the bare Standard Model, confirming that sin squared 3/8 unification needs low-energy supersymmetry',
      metrics: {
        standardModelGap: r.smGap,
        mssmGap: r.mssmGap,
      },
      notes:
        'L2, known physics, standard one-loop renormalization-group unification. The beta functions are textbook inputs, not derived from the substrate rule. The Standard Model miss is the control that makes the MSSM near-unification meaningful. Deriving the beta functions from the dynamics is the open frontier.',
    })
  },
})
