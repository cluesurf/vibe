// The prediction table, and the candidates that are not rows yet.
//
// A row says: vibe predicts X, standard physics predicts Y, at conditions Z the difference is
// delta, and this observation would tell them apart. A row is FROZEN when it is made: it names
// the date and the commit, and it is never edited. If the observation disagrees, the row stays,
// marked refuted. A row is refused unless its result passes every criterion in PREDICTION
// (type.ts), and `graph.ts` enforces that, not an editor.

import type { Candidate, Prediction } from './type'

export const PREDICTIONS: Prediction[] = []

export const CANDIDATES: Candidate[] = [
  {
    id: 'PC-01',
    candidate:
      'correlation through a shared ancestor in the interior decays as a power of boundary distance',
    stands: 'argued (R-HLG-0002). The exponent is not measured',
    needs:
      'the exponent from the committed knit, then the physical system whose correlations it predicts',
    problem: 'OP-11',
  },
  {
    id: 'PC-02',
    candidate: 'a smallest stable remnant halts black-hole evaporation',
    stands:
      "E-GRV-0051 finds a remnant at mass $1/(4\\omega_{\\max})$, but from the cutoff of the coined walk, which is imported (R-FND-0001). A lone vibe's motion under the one-third turn, apart from the committed knit, is measured (E-QTM-0103) and could replace the walk's cutoff",
    needs:
      'a remnant mass derived from the committed knit, and an observable that bounds it',
    problem: null,
  },
  {
    id: 'PC-03',
    candidate:
      'low-multipole suppression in the CMB from a finite hyperbolic substrate',
    stands:
      'E-CSM-0051, on a {7,3} tiling, finds the suppression is a generic finite-size effect and reports the hyperbolic-persistence conjecture falsified. No preferred-axis experiment exists',
    needs:
      'a suppression specific to {3,4,3,4}, set against the measured low-$\\ell$ power',
    problem: null,
  },
  {
    id: 'PC-04',
    candidate: 'dark energy as a residual vacuum term of the substrate',
    stands:
      'E-CSM-0027 gives a constant expansion ratio, a qualitative $w = -1$. No equation of state is derived',
    needs: '$w(z)$ from the rule, to set beside the DESI measurements',
    problem: null,
  },
  {
    id: 'PC-05',
    candidate: 'the Koide relation holds for the charged leptons only',
    stands:
      'E-FRC-0057 finds $Q = \\dfrac{m_e + m_\\mu + m_\\tau}{(\\sqrt{m_e} + \\sqrt{m_\\mu} + \\sqrt{m_\\tau})^2} = 2/3$ for the charged leptons, E-FRC-0063 finds 0.85 and 0.73 for the up and down quarks, E-FRC-0065 finds the neutrinos below 2/3. All restate measured masses (L1)',
    needs:
      'a derived reason, then a value for a sector not yet measured',
    problem: null,
  },
  {
    id: 'PC-06',
    candidate:
      'a black hole radiates a burst while it forms and does not evaporate steadily after, unless its clock register holds far more than $e^{4\\pi}$ states',
    stands:
      'measured on the bounded clock register: read $48/\\kappa$ after a lump settles, the emission is 1.9e-8 to 1.8e-7 of the prompt burst in every case, where a Hawking part would keep it near 1, because the capped redshift makes the settled horizon a static reflecting wall (E-GRV-0136), and growing the register from 13 to 49 does not move the spectrum toward Planck (E-GRV-0134). The depth register the horizon lives in is added, not derived from the rule, and physical register sizes are far beyond the runs',
    needs:
      "the register size of a physical black hole (whether $\\ln C$ exceeds $4\\pi$, which Bekenstein's coefficient in E-GRV-0131 also asks for), then an observable that separates a formation burst from steady evaporation, such as the late emission of a primordial black hole",
    problem: null,
  },
  {
    id: 'PC-07',
    candidate:
      "light's speed depends on direction first at relative order $k^4$, in one fixed angular shape, never at $k^2$",
    stands:
      'derived and measured on the husk light: $W(F_4)$ has invariant degrees 2, 6, 8 and 12, so its one quartic invariant is $|k|^4$, and the exact linear symbol is anisotropic at relative order $k^4$ (slope 4.000 in every branch) where a cubic lattice is at $k^2$, with the leading anisotropy in the shape $q - 3r$ (E-MTH-0008). E-MTH-0014 corrects an earlier isotropy figure. The coefficient is in lattice units, and the lattice scale is not fixed',
    needs:
      'the physical length of a dock, so the $k^4$ coefficient becomes a number, set against gamma-ray-burst timing and direction bounds on Lorentz violation',
    problem: 'OP-17',
  },
  {
    id: 'PC-08',
    candidate:
      'dark matter is the mirror half of the member register: matter that meets ours only through gravity',
    stands:
      'structural, on the candidate rule with the Clifford register (not the adopted rule): the register splits exactly into two chiral halves that a reflection swaps (E-FRC-0258), and every one-body piece commutes with that split while the only covariant one-body coupling between the halves breaks CPT (E-FRC-0259), so the mirror half meets ours only through depth and the many-body collision. No abundance is computed',
    needs:
      "the mirror half's abundance from the rule, and a cross section with ordinary matter, set against the measured dark-matter density and direct-detection limits",
    problem: null,
  },
  {
    id: 'PC-09',
    candidate:
      'the early universe needs no inflation: a single seed on a flat husk has no horizon problem and no flatness problem',
    stands:
      'measured on the true {3,4,3,4} mesh: the husk is a horosphere, flat by geometry, and every pair of husk docks a single seed reaches shares a causal past at every beat (0 of 8,256 disjoint at beat 4), where a start everywhere at once leaves 171 of 300 pairs with none (E-CSM-0058). The husk itself grows as a cubic ball, 3.22 e-folds in all, so it does not inflate (E-CSM-0059). The thermal uniformity of the reached docks is not read',
    needs:
      'the primordial ripple spectrum from a seed without inflation, a spectral index and a tensor-to-scalar ratio, set against Planck and BICEP measurements',
    problem: null,
  },
]
