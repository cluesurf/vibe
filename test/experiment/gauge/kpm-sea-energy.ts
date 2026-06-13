// P216 (the gate-closer): the Dirac-SEA energy of the 3D Dirac-skyrmion operator vs soliton size R, by the
// Kernel Polynomial Method (Chebyshog expansion of |x|) + stochastic trace with COMMON RANDOM NUMBERS.
// Since Tr[H] = 0 for this operator, E_sea = -(1/2) Tr|H|. We estimate Tr|H| via the Chebyshev series of |x|
// and a stochastic trace; using the SAME random vectors for hedgehog and vacuum makes the huge bulk cancel
// per-sample, so the soliton's fermionic energy Delta E_sea(R) = E_sea(hedgehog,R) - E_sea(vacuum) survives.
// If Delta E_sea RISES as the soliton sharpens (R -> small), the fermion adds POSITIVE stiffness -> the rule's
// fermion supplies a STABILIZING term (the Skyrme sign). Run: npx tsx code/experiment/p216-kpm-sea-energy.ts

import { pathToFileURL } from 'node:url'
import { makeDirac, newCx, dotR, lambdaMaxH2, type Cx } from '../lib/dirac-skyrmion'

// Chebyshev coefficients of |x| on [-1,1]: c0 = 2/pi, c_{2k} = -(4/pi)(-1)^k/(4k^2-1), odd = 0
function absCoeffs(M: number): number[] {
  const c = new Array<number>(M).fill(0); c[0] = 2 / Math.PI
  for (let k = 1; 2 * k < M; k++) c[2 * k] = (-4 / Math.PI) * ((-1) ** k) / (4 * k * k - 1)
  return c
}
// Jackson damping (kills Gibbs oscillation of |x| at 0)
function jackson(M: number): number[] {
  const g = new Array<number>(M).fill(0); const Np = M + 1
  for (let n = 0; n < M; n++) g[n] = ((Np - n) * Math.cos((Math.PI * n) / Np) + Math.sin((Math.PI * n) / Np) / Math.tan(Math.PI / Np)) / Np
  return g
}
// Chebyshev moments mu_n = <xi| T_n(H/a) |xi> for n=0..M-1 (matvec only)
function moments(applyH: (v: Cx, o: Cx) => void, a: number, xi: Cx, M: number, dim: number): Float64Array {
  const mu = new Float64Array(M)
  let t0 = { re: xi.re.slice(), im: xi.im.slice() }
  let t1 = newCx(dim); applyH(t0, t1); for (let i = 0; i < dim; i++) { t1.re[i]! /= a; t1.im[i]! /= a }
  mu[0] = dotR(xi, t0, dim); mu[1] = dotR(xi, t1, dim)
  let tn = newCx(dim); const tmp = newCx(dim)
  for (let n = 2; n < M; n++) {
    applyH(t1, tmp)
    for (let i = 0; i < dim; i++) { tn.re[i] = (2 * tmp.re[i]!) / a - t0.re[i]!; tn.im[i] = (2 * tmp.im[i]!) / a - t0.im[i]! }
    mu[n] = dotR(xi, tn, dim)
    const sw = t0; t0 = t1; t1 = tn; tn = sw
  }
  return mu
}

export function kpmSeaEnergy(): { deltaE: [number, number][]; hasMinimum: boolean } {
  const L = 14, M = 1.5, MCHEB = 220, NRV = 12
  const Rs = [2, 3, 4, 6, 9]
  // TEXTURE mode: constant mass magnitude, only the DIRECTION winds (a charge-1 hopfion). No volume term, so the
  // fermion energy is purely gradient = exchange*R + Skyrme/R. The vacuum is uniform-z (sea energy is
  // direction-independent by isospin symmetry, so the far-field cancels). A MINIMUM in Delta E_sea(R) proves
  // the Skyrme coefficient D > 0 (stabilizing).
  const vac = makeDirac(L, M, 0, 'uniformz')
  const dim = vac.dim
  const c = absCoeffs(MCHEB), g = jackson(MCHEB)
  const hedges = Rs.map((R) => makeDirac(L, M, R, 'texture'))
  // spectral bound: max over vacuum and the SHARPEST texture (sharp textures have the largest spectrum)
  const a = Math.sqrt(Math.max(lambdaMaxH2(vac.applyH, dim), lambdaMaxH2(hedges[0]!.applyH, dim))) * 1.2
  const dMu: Float64Array[] = Rs.map(() => new Float64Array(MCHEB)) // accumulated Delta moments per R
  let rng = 12345
  const xi = newCx(dim)
  for (let r = 0; r < NRV; r++) {
    for (let i = 0; i < dim; i++) { rng = (rng * 1103515245 + 12345) & 0x7fffffff; xi.re[i] = (rng & 1) ? 1 : -1; xi.im[i] = 0 } // Rademacher
    const muV = moments(vac.applyH, a, xi, MCHEB, dim)
    hedges.forEach((h, ri) => { const muH = moments(h.applyH, a, xi, MCHEB, dim); for (let n = 0; n < MCHEB; n++) dMu[ri]![n]! += (muH[n]! - muV[n]!) / NRV })
  }
  // Delta E_sea(R) = -(1/2) * a * sum_n g_n c_n Delta mu_n
  const deltaE: [number, number][] = Rs.map((R, ri) => {
    let dTrAbs = 0; for (let n = 0; n < MCHEB; n++) dTrAbs += g[n]! * c[n]! * dMu[ri]![n]!
    return [R, Math.round(-0.5 * a * dTrAbs * 100) / 100] as [number, number]
  })
  console.log(`P216 fermion sea energy of a TEXTURE soliton, Delta E_sea(R) by KPM (L=${L}, ${MCHEB} moments, ${NRV} probes):`)
  for (const [R, dE] of deltaE) console.log(`  R=${R}: Delta E_sea = ${dE}`)
  // a minimum at an INTERIOR R means Delta E ~ B*R + D/R with D>0 (Skyrme stabilizing)
  let minI = 0; for (let i = 1; i < deltaE.length; i++) if (deltaE[i]![1] < deltaE[minI]![1]) minI = i
  const hasMinimum = minI > 0 && minI < deltaE.length - 1
  console.log(`  minimum at R=${deltaE[minI]![0]} (interior=${hasMinimum})`)
  if (hasMinimum) console.log('  => Delta E_sea(R) = B*R + D/R with a MINIMUM -> Skyrme coefficient D > 0 (STABILIZING). The rule\'s fermion supplies the stabilizer. GATE CLOSED (positive sign).')
  else console.log('  => no interior minimum in this R range -> the 1/R (Skyrme) term is not isolated here; sign still not cleanly established. Honest partial.')
  return { deltaE, hasMinimum }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = kpmSeaEnergy()
  console.log(`RESULT: Delta E_sea ${r.deltaE.map((d) => d[1]).join("/")}, interior minimum (Skyrme>0) ${r.hasMinimum}`)
}
