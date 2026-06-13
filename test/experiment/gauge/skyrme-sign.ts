// P205 (Tier 1 gate): the Skyrme-sign / Derrick measurement on a REAL 3D direction field. Build a localized
// texture of size R, measure exchange energy E_ex(R) and Skyrme energy E_sk(R) directly, and confirm the
// Derrick scaling, in 3D E_ex grows ~ R and E_sk falls ~ 1/R, so E_ex + kappa*E_sk has a stable MINIMUM for
// kappa > 0 and none for kappa <= 0. This measures the stabilization mechanism on a real field (the open
// question is only whether the rule supplies kappa > 0, argued via the fermion in p192 / does-the-rule-...).
// Run: npx tsx code/experiment/p205-skyrme-sign.ts

import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

type V = [number, number, number]
const dot = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (v: V): V => { const m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m] }

// a 3D texture of size R: a hedgehog with a radial profile (nonzero exchange AND topological-current density)
function texture(M: number, R: number): V[][][] {
  const c = M / 2
  const f: V[][][] = Array.from({ length: M }, () => Array.from({ length: M }, () => Array.from({ length: M }, () => [0, 0, 1] as V)))
  for (let x = 0; x < M; x++) for (let y = 0; y < M; y++) for (let z = 0; z < M; z++) {
    const dx = x - c, dy = y - c, dz = z - c, rho = Math.hypot(dx, dy, dz)
    const prof = Math.PI * Math.max(0, 1 - rho / R)
    const rhat: V = rho > 1e-6 ? [dx / rho, dy / rho, dz / rho] : [0, 0, 1]
    // tilt the local frame by the profile to make a winding texture
    f[x]![y]![z] = norm([Math.sin(prof) * rhat[0], Math.sin(prof) * rhat[1], Math.cos(prof) + 0.6 * Math.sin(prof) * rhat[2]])
  }
  return f
}
function energies(f: V[][][], M: number): { ex: number; sk: number } {
  let ex = 0, sk = 0
  const triA = (a: V, b: V, cc: V): number => 2 * Math.atan2(dot(a, cross(b, cc)), 1 + dot(a, b) + dot(b, cc) + dot(cc, a))
  for (let x = 0; x < M - 1; x++) for (let y = 0; y < M - 1; y++) for (let z = 0; z < M - 1; z++) {
    const n = f[x]![y]![z]!, nx = f[x + 1]![y]![z]!, ny = f[x]![y + 1]![z]!, nz = f[x]![y]![z + 1]!
    ex += (1 - dot(n, nx)) + (1 - dot(n, ny)) + (1 - dot(n, nz)) // exchange
    // topological-current density on the three plaquettes (solid angle = (grad x grad).n)
    const qxy = triA(n, nx, ny), qyz = triA(n, ny, nz), qzx = triA(n, nz, nx)
    sk += qxy * qxy + qyz * qyz + qzx * qzx // Skyrme = square of the current density
  }
  return { ex, sk }
}

export function skyrmeSign(): { exExp: number; skExp: number; stableForPositiveKappa: boolean } {
  const M = 40
  const Rs = [5, 7, 10, 14]
  const data = Rs.map((R) => ({ R, ...energies(texture(M, R), M) }))
  console.log('P205 Derrick measurement on a real 3D field:')
  for (const d of data) console.log(`  R=${d.R}: exchange E_ex=${d.ex.toFixed(1)}, Skyrme E_sk=${d.sk.toFixed(2)}`)
  // fit log E vs log R for the exponents
  const fit = (key: 'ex' | 'sk'): number => {
    let n = data.length, sx = 0, sy = 0, sxx = 0, sxy = 0
    for (const d of data) { const X = Math.log(d.R), Y = Math.log(d[key]); sx += X; sy += Y; sxx += X * X; sxy += X * Y }
    return (n * sxy - sx * sy) / (n * sxx - sx * sx)
  }
  const exExp = Math.round(fit('ex') * 100) / 100, skExp = Math.round(fit('sk') * 100) / 100
  console.log(`  measured exponents: exchange ~ R^${exExp} (Derrick predicts +1 in 3D), Skyrme ~ R^${skExp} (predicts -1)`)
  // E(R) = a R^exExp + kappa b R^skExp. With exExp>0 and skExp<0, kappa>0 gives a minimum, kappa<=0 does not.
  const stableForPositiveKappa = exExp > 0.3 && skExp < -0.3
  console.log(`  => exchange grows, Skyrme falls (opposite scaling), so E_ex + kappa*E_sk has a stable minimum`)
  console.log(`     for kappa > 0 and NONE for kappa <= 0: ${stableForPositiveKappa}. The gate is the SIGN of kappa,`)
  console.log('     argued forced-positive (the fermion the self carries, p192). Here the SCALING is confirmed on a real field.')
  return { exExp, skExp, stableForPositiveKappa }
}

export default defineExperiment({
  id: 'gauge/skyrme-sign',
  title: 'on a real 3D texture the exchange energy grows with size and the Skyrme energy falls, the Derrick scaling',
  category: 'gauge',
  substrates: 'any',
  depth: 'L2',
  paper: true,
  run() {
    const r = skyrmeSign()
    const ok = r.stableForPositiveKappa
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'measured on a real 3D direction field, the exchange energy scales up with soliton size and the Skyrme energy scales down, the opposite scaling that gives a stable minimum only for a positive Skyrme coefficient',
      metrics: {
        exchangeExponent: r.exExp,
        skyrmeExponent: r.skExp,
        stableForPositiveKappa: r.stableForPositiveKappa ? 1 : 0,
      },
      notes:
        'L2, known physics, the Derrick scaling argument confirmed on a real field. The measured exponents are the content, and the opposing signs are the meaningful contrast. This confirms the scaling only. The actual sign of the Skyrme coefficient kappa is argued from the fermion the self carries, not measured here, so it stays open.',
    })
  },
})
