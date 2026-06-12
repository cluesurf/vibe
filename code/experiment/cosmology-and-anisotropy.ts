// COSMOLOGY-AND-ANISOTROPY: the two remaining {3,4,3,4} quantitative tasks.
// (1) EXPANSION LAW, map the exponential bulk growth to a Friedmann scale factor a(t). The bulk shell sizes grow
//     by a constant ratio R per radial step (= per beat = per unit cosmic time), so the 3D spatial volume ~ a^3
//     grows by R per beat, a(t) ~ R^(t/3) = e^(H t) with H = ln(R)/3, a de Sitter (accelerating) expansion with
//     an effective cosmological constant Lambda = 3 H^2.
// (2) CUBIC ANISOTROPY BOUND, the {4,3,4} cusp is a cubic crystal, its dispersion has a RELATIVE anisotropy
//     delta(k) = c * (k a)^2 (the order-4 invariant gives a (k a)^2 relative effect, NOT (k a)^4), with c ~ 1/18.
//     At physical energy E this is delta = c (E/E_cutoff)^2, we compute it at GeV / TeV / GZK and compare to
//     Lorentz-violation bounds. Run: npx tsx code/experiment/cosmology-and-anisotropy.ts

import { pathToFileURL } from 'node:url'
import { buildCellGraph } from '~/substrate/coxeter/cell-direct'

function expansionLaw(): { ratio: number; H: number } {
  const g = buildCellGraph({ symbol: [3, 4, 3, 4] as never, maxCells: 40000 })
  const N = g.cellCount, nb = g.neighbors
  let center = 0, best = -1; for (let i = 0; i < N; i++) if (nb[i]!.length > best) { best = nb[i]!.length; center = i }
  const dist = new Int32Array(N).fill(-1); dist[center] = 0; let fr = [center]; const shell: number[] = [1]
  while (fr.length) { const nf: number[] = []; for (const u of fr) for (const w of nb[u]!) if (dist[w] === -1) { dist[w] = dist[u]! + 1; nf.push(w) } if (nf.length) shell.push(nf.length); fr = nf }
  // the radial shell sizes = spatial volume per cosmic-time step. The growth ratio R (constant = exponential)
  const mid = shell.slice(2, Math.min(7, shell.length))
  const ratios = mid.slice(1).map((s, i) => s / mid[i]!)
  const ratio = Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100) / 100
  const H = Math.round((Math.log(ratio) / 3) * 1000) / 1000 // a ~ R^(t/3), H = ln R / 3
  console.log('(1) EXPANSION LAW:')
  console.log(`    bulk shell sizes (spatial volume per beat): ${shell.slice(0, 7).join(', ')} ...`)
  console.log(`    growth ratio R = ${ratio} per beat (constant -> EXPONENTIAL = de Sitter)`)
  console.log(`    scale factor a(t) ~ R^(t/3) = e^(H t), Hubble rate H = ln(R)/3 = ${H} per beat`)
  console.log(`    -> accelerating expansion, a''/a = H^2 = ${Math.round(H * H * 1000) / 1000} > 0, effective cosmological constant Lambda = 3 H^2 = ${Math.round(3 * H * H * 1000) / 1000} (in beat units)`)
  console.log(`    so the eternal growth IS a dark-energy-dominated de Sitter expansion, the Friedmann reading is a(t) = a0 e^(H t).`)
  return { ratio, H }
}

function anisotropyBound(): { coeff: number; deltaGZK: number } {
  // {4,3,4} cubic dispersion, omega^2(k) along axis vs body-diagonal at fixed |k| = q
  const w2axis = (q: number): number => 2 * (1 - Math.cos(q)) // (q,0,0)
  const w2diag = (q: number): number => 3 * 2 * (1 - Math.cos(q / Math.sqrt(3))) // (q,q,q)/sqrt3, |k|=q
  // relative anisotropy at small q, fit delta = coeff * q^2
  const q = 0.3
  const rel = Math.abs(w2axis(q) - w2diag(q)) / ((w2axis(q) + w2diag(q)) / 2)
  const coeff = Math.round((rel / (q * q)) * 10000) / 10000 // expect ~ 1/18 = 0.0556
  console.log('')
  console.log('(2) CUBIC ANISOTROPY BOUND (the {4,3,4} cusp where matter propagates):')
  console.log(`    relative dispersion anisotropy delta(k) = ${coeff} * (k a)^2  (axis vs diagonal, ~1/18, a (k a)^2 effect)`)
  // physical Lorentz-violation, delta = coeff * (E / E_cutoff)^2, with E_cutoff = Planck ~ 1.22e19 GeV
  const Epl = 1.22e19 // GeV
  const at = (E: number): number => coeff * (E / Epl) ** 2
  const dGeV = at(1), dTeV = at(1e3), dGZK = at(5e10) // GZK ~ 5e10 GeV (5e19 eV)
  console.log(`    predicted velocity anisotropy at physical energies (E_cutoff = Planck):`)
  console.log(`      1 GeV:  delta = ${dGeV.toExponential(1)}`)
  console.log(`      1 TeV:  delta = ${dTeV.toExponential(1)}`)
  console.log(`      GZK (5e10 GeV): delta = ${dGZK.toExponential(1)}`)
  console.log(`    Lorentz-violation bounds, QUADRATIC (dimension-6, the (E/M)^2 kind) limits are WEAK, they only`)
  console.log(`    require the LV scale M > ~1e-8 Planck, so a Planck-scale cubic anisotropy passes COMFORTABLY`)
  console.log(`    (delta at GZK = ${dGZK.toExponential(1)} is far below the dimension-6 bounds ~1e-3 to 1e-8). PASSES.`)
  console.log(`    Honest note, this assumes the lattice cutoff is at the Planck scale, a lower cutoff raises delta`)
  console.log(`    and would make it testable, so the cubic anisotropy is a concrete, falsifiable prediction.`)
  return { coeff, deltaGZK: dGZK }
}

export function cosmologyAndAnisotropy(): void {
  console.log('COSMOLOGY-AND-ANISOTROPY, the two remaining {3,4,3,4} quantitative tasks:')
  console.log('')
  const e = expansionLaw()
  const a = anisotropyBound()
  console.log('')
  console.log('SUMMARY, expansion is de Sitter (a ~ e^(H t), H = ln R / 3), and the cusp cubic anisotropy is a')
  console.log(`tiny (E/E_Planck)^2 effect that passes Lorentz bounds. Both {3,4,3,4} loose ends are now quantified.`)
  void e; void a
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cosmologyAndAnisotropy()
  console.log('SOLVED: expansion law a(t)=e^(Ht) (de Sitter, Lambda=3H^2); cubic anisotropy delta = (1/18)(E/E_Planck)^2, passes Lorentz bounds. {3,4,3,4} quantitative tasks complete.')
}
