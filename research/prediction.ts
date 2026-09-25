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
      'E-GRV-0051 finds a remnant at mass $1/(4\\omega_{\\max})$, but from the cutoff of the coined walk, which is imported (R-FND-0001)',
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
]
