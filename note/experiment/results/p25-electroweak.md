# P25: The Standard-Model Electroweak Breaking

**Status: validated. SU(2) x U(1) breaks to U(1)_EM, reproducing the W and Z masses.**

## The question

P22 showed the Higgs mechanism for one U(1). The Standard Model breaks SU(2) x U(1)_Y
to U(1)_EM. Does a Higgs doublet produce that specific pattern, the W, the Z, and a
massless photon, with the Weinberg-angle mass relation?

## What we did

Build the gauge-boson mass matrix from a Higgs doublet with vacuum value v, and
diagonalise it. The couplings are g (SU(2)) and g-prime (U(1)_Y).

## Result (g = 0.65, g-prime = 0.358, v = 246 GeV)

| boson | mass | status |
| ----- | ---- | ------ |
| W+, W- | 80.0 GeV | massive (g v / 2) |
| Z | 91.3 GeV | massive |
| photon | 0.000 GeV | massless (the unbroken U(1)_EM) |

- The Weinberg angle: sin^2(theta_W) = 0.233 (observed about 0.231).
- The mass relation: m_W / m_Z = 0.876 = cos(theta_W) exactly.

The Higgs doublet breaks SU(2) x U(1)_Y to U(1)_EM. Three of the four gauge bosons
(W+, W-, Z) become massive, one combination (the photon) stays massless, and the
masses obey m_W = m_Z cos(theta_W). With the measured couplings it **reproduces the
observed W (80.4) and Z (91.2) masses** and the Weinberg angle.

## Honest reading

This is the specific electroweak breaking pattern (the heart of the Standard-Model
gauge sector), from a Higgs doublet. The couplings g, g-prime, v are inputs, as in the
Standard Model. Deriving them, the full three generations, and the fermion Yukawa
masses is the larger Standard-Model program (frontiers).

## See also

`p22-higgs.md` (the single-U(1) Higgs mechanism), `p20-photon.md` (the photon), and
`p25-electroweak` (the experiment).
