// P233 (#2, the {3,4,3,4} 24-direction scale-up, the emergent ISOTROPY benefit, dynamically): the wave
// dispersion of the discrete rule, omega^2(k) = sum over neighbour directions d of (1 - cos(k.d)). For the
// {3,4,3,4} bulk the 24 directions are the D4 root system (the 24-cell). We compare the dispersion along an AXIS
// vs a DIAGONAL at fixed |k|, for the cubic Z3 (6 dirs), the hypercubic Z4 (8 dirs), and D4 (24 dirs). D4's 4th
// moment is isotropic (sum d_i^4 = 3 sum d_i^2 d_j^2 = 12 = 3*4), so its dispersion is ISOTROPIC TO ORDER 4
// (anisotropy only at order 6, matching p226 / F4), while Z3 and Z4 are anisotropic already at order 4. So the
// 24 directions give emergent rotational symmetry the cubic lacks. Run: npx tsx code/experiment/p233-isotropy-24dir.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function neighbors(kind: 'Z3' | 'Z4' | 'D4'): number[][] {
  const R: number[][] = []
  if (kind === 'Z3') { for (let i = 0; i < 3; i++) for (const s of [1, -1]) { const v = [0, 0, 0]; v[i] = s; R.push(v) } }
  else if (kind === 'Z4') { for (let i = 0; i < 4; i++) for (const s of [1, -1]) { const v = [0, 0, 0, 0]; v[i] = s; R.push(v) } }
  else { for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) for (const si of [1, -1]) for (const sj of [1, -1]) { const v = [0, 0, 0, 0]; v[i] = si; v[j] = sj; R.push(v) } }
  return R
}
const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0)
const omega2 = (R: number[][], k: number[]): number => R.reduce((s, d) => s + (1 - Math.cos(dot(k, d))), 0)

// anisotropy: relative difference of omega^2 between an axis direction and a body-diagonal at the same |k|
function anisotropy(kind: 'Z3' | 'Z4' | 'D4', q: number): number {
  const R = neighbors(kind), dim = kind === 'Z3' ? 3 : 4
  const axis = new Array<number>(dim).fill(0); axis[0] = q
  const diag = new Array<number>(dim).fill(q / Math.sqrt(dim)) // |diag| = q
  const wa = omega2(R, axis) / R.length, wd = omega2(R, diag) / R.length
  return Math.abs(wa - wd) / ((wa + wd) / 2)
}

export function isotropy24dir(): { z3: number; z4: number; d4: number; d4Best: boolean } {
  console.log('P233 wave-dispersion ISOTROPY, axis vs diagonal relative anisotropy (lower = more isotropic):')
  const qs = [0.4, 0.8, 1.2]
  for (const q of qs) {
    console.log(`  |k|=${q}:  Z3 (6 dir) = ${anisotropy('Z3', q).toExponential(2)},  Z4 (8 dir) = ${anisotropy('Z4', q).toExponential(2)},  D4 (24 dir) = ${anisotropy('D4', q).toExponential(2)}`)
  }
  // 4th-moment isotropy check (the order-4 anisotropy): sum d_i^4 vs 3 sum d_i^2 d_j^2
  const m4 = (R: number[][]): { diag: number; mixed: number } => { let dg = 0, mx = 0; for (const d of R) { dg += d[0]! ** 4; mx += d[0]! ** 2 * (d[1] ?? 0) ** 2 } return { diag: dg, mixed: mx } }
  const md4 = m4(neighbors('D4')), mz4 = m4(neighbors('Z4'))
  console.log('')
  console.log(`  4th-moment isotropy (need sum d_1^4 = 3 sum d_1^2 d_2^2 for order-4 isotropy):`)
  console.log(`    D4 (24 dir): sum d_1^4 = ${md4.diag}, 3 x sum d_1^2 d_2^2 = ${3 * md4.mixed}  -> ${md4.diag === 3 * md4.mixed ? 'EQUAL (isotropic to order 4)' : 'unequal'}`)
  console.log(`    Z4 (8 dir):  sum d_1^4 = ${mz4.diag}, 3 x sum d_1^2 d_2^2 = ${3 * mz4.mixed}  -> ${mz4.diag === 3 * mz4.mixed ? 'EQUAL' : 'UNEQUAL (anisotropic at order 4)'}`)
  const z3 = anisotropy('Z3', 1.2), z4 = anisotropy('Z4', 1.2), d4 = anisotropy('D4', 1.2)
  const d4Best = d4 < z4 / 5 && d4 < z3 / 5
  console.log('')
  console.log('Reading:')
  console.log(' - D4 (the {3,4,3,4} 24 directions) has an ISOTROPIC 4th moment (sum d^4 = 3 sum d^2 d^2 = 12), so its')
  console.log('   wave dispersion is isotropic to ORDER 4, the axis-vs-diagonal anisotropy is far smaller than the')
  console.log('   cubic Z3 or hypercubic Z4 (which are anisotropic already at order 4).')
  console.log(' - This is the DYNAMICAL version of p226 (triality / F4 kills the order-4 anisotropy), the 24-direction')
  console.log('   structure gives emergent ROTATIONAL symmetry the cubic lacks. The discrete rule on {3,4,3,4} thus')
  console.log('   coarse-grains to an isotropic continuum (no lattice artifact until order 6), grounding emergent')
  console.log('   Lorentz / rotational invariance in the actual 24-direction discrete substrate.')
  return { z3, z4, d4, d4Best }
}

export default defineExperiment({
  id: 'relativity/isotropy-24dir',
  title: 'the 24 D4 directions give a wave dispersion isotropic to order four, the cubic does not',
  category: 'relativity',
  substrates: ['3434'],
  depth: 'L2',
  paper: true,
  run() {
    const r = isotropy24dir()
    const ok = r.d4Best && r.d4 < 0.02
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the wave dispersion built from the 24 D4 directions has an axis-versus-diagonal anisotropy far below the cubic 6-direction and hypercubic 8-direction sets, isotropic to order four',
      metrics: {
        anisotropyD4: r.d4,
        anisotropyZ4: r.z4,
        anisotropyZ3: r.z3,
      },
      control: {
        anisotropyZ3Cubic: r.z3,
        anisotropyZ4Hypercubic: r.z4,
      },
      notes:
        'L2, a known lattice-isotropy fact reproduced on the substrate directions. The dispersion omega^2(k) is computed from the actual D4 neighbour set, and the order-4 isotropy (sum d_1^4 = 3 sum d_1^2 d_2^2, exact integer arithmetic) is measured, not assumed. The cubic Z3 and hypercubic Z4 sets are the controls, anisotropic already at order 4. D4 anisotropy only appears at order 6, matching F4.',
    })
  },
})
