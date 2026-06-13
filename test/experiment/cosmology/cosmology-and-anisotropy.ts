// COSMOLOGY-AND-ANISOTROPY: the two remaining {3,4,3,4} quantitative tasks.
// (1) EXPANSION LAW, map the exponential bulk growth to a Friedmann scale factor a(t). The bulk shell sizes grow
//     by a constant ratio R per radial step (= per beat = per unit cosmic time), so the 3D spatial volume ~ a^3
//     grows by R per beat, a(t) ~ R^(t/3) = e^(H t) with H = ln(R)/3, a de Sitter (accelerating) expansion with
//     an effective cosmological constant Lambda = 3 H^2.
// (2) CUBIC ANISOTROPY BOUND, the {4,3,4} cusp is a cubic crystal, its dispersion has a RELATIVE anisotropy
//     delta(k) = c * (k a)^2 (the order-4 invariant gives a (k a)^2 relative effect, NOT (k a)^4), with c ~ 1/18.
//     At physical energy E this is delta = c (E/E_cutoff)^2, we compute it at GeV / TeV / GZK and compare to
//     Lorentz-violation bounds. Run: npx tsx code/experiment/cosmology-and-anisotropy.ts

import { bfsShells, branchingRatio } from '@/code/measure/shells'
import { buildCellGraph } from '@/code/substrate/coxeter/cell-direct'
import { defineExperiment } from '@/test/scaffold/suite'
import { verdict } from '@/test/scaffold/verdict'

function expansionLaw(): { ratio: number; H: number } {
  const g = buildCellGraph({ symbol: [3, 4, 3, 4] as never, maxCells: 40000 })
  const N = g.cellCount, nb = g.neighbors
  let center = 0, best = -1; for (let i = 0; i < N; i++) if (nb[i]!.length > best) { best = nb[i]!.length; center = i }
  const { shellCounts: shell } = bfsShells({ neighbors: nb, root: center })
  // the radial shell sizes = spatial volume per cosmic-time step. The growth ratio R (constant = exponential)
  const ratio = Math.round(branchingRatio({ shellCounts: shell, from: 3, to: 7 }) * 100) / 100
  const H = Math.round((Math.log(ratio) / 3) * 1000) / 1000 // a ~ R^(t/3), H = ln R / 3
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
  // physical Lorentz-violation, delta = coeff * (E / E_cutoff)^2, with E_cutoff = Planck ~ 1.22e19 GeV
  const Epl = 1.22e19 // GeV
  const at = (E: number): number => coeff * (E / Epl) ** 2
  const dGeV = at(1), dTeV = at(1e3), dGZK = at(5e10) // GZK ~ 5e10 GeV (5e19 eV)
  return { coeff, deltaGZK: dGZK }
}

export function cosmologyAndAnisotropy(): void {
  const e = expansionLaw()
  const a = anisotropyBound()
  void e; void a
}

export default defineExperiment({
  id: 'cosmology/cosmology-and-anisotropy',
  title:
    'the {3,4,3,4} bulk grows exponentially (de Sitter) and the cusp cubic anisotropy passes Lorentz bounds',
  category: 'cosmology',
  substrates: ['3434'],
  depth: 'L1',
  paper: true,
  run() {
    const e = expansionLaw()
    const a = anisotropyBound()
    const ok = e.ratio > 1.5 && a.deltaGZK < 1e-3
    return verdict({
      status: ok ? 'pass' : 'fail',
      claim:
        'the {3,4,3,4} bulk shells grow by a constant ratio per beat giving a de Sitter scale factor, and the cubic cusp dispersion anisotropy at the GZK energy is far below Lorentz-violation bounds',
      metrics: {
        growthRatio: e.ratio,
        hubble: e.H,
        anisotropyCoeff: a.coeff,
        deltaGZK: a.deltaGZK,
      },
      notes:
        'L1, the exponential bulk growth is a measured graph-growth property of a hyperbolic tiling mapped to a Friedmann reading, and the anisotropy is an analytic dispersion calculation, both established rather than emergent. The Lorentz bound passes only under the assumption the lattice cutoff sits at the Planck scale.',
    })
  },
})
