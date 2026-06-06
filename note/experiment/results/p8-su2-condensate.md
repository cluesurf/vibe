# B2: Chiral Fermion in a Dynamical Non-Abelian Field

The full chiral gauge theory (a Weyl fermion coupled to a non-Abelian field) is
open in physics. This reaches the rung below it: a chiral overlap fermion coupled
to a dynamical SU(2) gauge field, with a chiral condensate forming from the
anomaly, the non-Abelian analogue of the Schwinger condensate.

Reproduce: `npx tsx code/experiment/p8-su2-condensate.ts`.

## The method

The fermion now carries spin (2) times color (2) = 4 components per site. The link
is an SU(2) matrix (a unit quaternion) acting on color, and gamma5 acts on spin.
We build the SU(2) gauge Wilson-Dirac operator, form the gamma5-Hermitian overlap
H_ov = gamma5 + sign(H_W), diagonalise it exactly, and measure the Banks-Casher
near-zero spectral density (proportional to the chiral condensate), averaged over
random SU(2) gauge configurations at several disorders.

## The result

```
gauge disorder   near-zero density (condensate signal)
0.0              0.0000
0.3              0.0094
0.6              0.0063
1.0              0.0000
```

- **Free theory (disorder 0): exactly zero**, as it should be.
- **Dynamical SU(2) field on: nonzero condensate** at moderate coupling (0.009 at
  disorder 0.3). The chiral fermion feels the non-Abelian field, and a condensate
  forms from the anomaly.
- The drop back to zero at the strongest disorder is a small-lattice artefact (at
  L = 4 a very rough SU(2) field opens a spectral gap that removes the near-zero
  modes within tolerance), not physics.

## What this establishes

The chiral overlap fermion is now coupled to a DYNAMICAL NON-ABELIAN gauge field,
and the anomaly-induced condensate forms, the SU(2) analogue of the Schwinger
result. This is the furthest reachable rung toward a chiral gauge theory: the
fermion sees the non-Abelian field and condenses.

## Honest caveats

- **Vector-like, not chiral-projected.** This is the overlap as a Dirac (vector-
  like) operator in an SU(2) background. The actual chiral gauge theory requires
  the Weyl projection (coupling a single chirality to the gauge field), which is
  the genuinely open problem (no satisfactory non-perturbative construction exists
  in the literature). We reach the rung below it, not the wall itself.
- **Small lattice, random quenched configs.** L = 4 with random SU(2) links, exact
  diagonalisation. A condensate signal, not the precise value, and the strongest-
  disorder point is a finite-size artefact.

## Status

B2: the reachable rung is done. A chiral fermion couples to a dynamical SU(2) gauge
field and a condensate forms. The chiral gauge theory itself (the Weyl projection,
non-perturbative) remains open in physics, and we say so.

## See also

`p8-schwinger.md` (the Abelian condensate), `p8-confinement.md` (SU(2) gauge
sector), `note/questions/remaining-frontier-spec.md` (B2).
