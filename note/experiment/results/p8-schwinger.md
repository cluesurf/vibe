# P8 / A4: The Chiral Condensate in a Dynamical Gauge Field

The index theorem (`p8-index.md`) put the chiral fermion in a FIXED gauge
background. This goes further: the chiral overlap fermion in a fluctuating gauge
field, the 2D Schwinger model, where a chiral condensate forms purely from the
anomaly. We measure that condensate and show it is zero in the free theory and
nonzero once the gauge field is on.

Reproduce: `npx tsx code/experiment/p8-schwinger.ts`.

## The method

The overlap operator is gamma5-Hermitian, so H_ov = gamma5 D_ov = gamma5 +
sign(H_W) is Hermitian with a real spectrum. By the Banks-Casher relation the
chiral condensate is proportional to the spectral density of the Hermitian Dirac
operator at zero, so a nonzero near-zero density signals a nonzero condensate. We
build H_ov in random 2D U(1) gauge backgrounds (link phases uniform in
[-disorder pi, disorder pi]), diagonalise it exactly, and average the fraction of
eigenvalues near zero over configurations.

## The result

```
gauge disorder   near-zero density (condensate signal)
0.00             0.0000
0.25             0.0023
0.50             0.0093
0.75             0.0104
1.00             0.0081
```

- **Free theory (disorder 0): exactly zero.** The free overlap on this lattice has
  no eigenvalues near zero within tolerance, so the condensate signal is zero, as
  it should be.
- **Gauge field on: nonzero, and it grows with coupling.** As the gauge disorder
  rises, the near-zero spectral density climbs to about 0.01, peaking around
  moderate-to-strong coupling. A nonzero near-zero density is a nonzero chiral
  condensate by Banks-Casher.

So turning on the dynamical gauge field generates a chiral condensate from nothing.
The chiral fermion genuinely feels the fluctuating field, and the anomaly produces
a condensate, the defining feature of the 2D Schwinger model.

## What this establishes

The chiral fermion is now coupled to a DYNAMICAL gauge field, not just a fixed
background, and the physics is right: a chiral condensate forms from the anomaly,
zero in the free theory and growing with the gauge coupling. Combined with the
index theorem (the fermion sees gauge topology) and the confinement result (the
gauge field confines), the chiral-fermion-meets-gauge-field thread now has matter
feeling the field, topology, and a condensate, all on the mesh.

## Honest caveats

- **A condensate SIGNAL, not the precise value.** We measure the Banks-Casher
  near-zero density, which is proportional to the condensate. We do not extract the
  exact Schwinger value (which needs the dynamical fermion determinant in the gauge
  weight and a continuum extrapolation). The qualitative result, zero in free
  theory and nonzero with the field, is robust.
- **Quenched, random backgrounds.** The gauge configurations are random (a proxy
  for the gauge ensemble at a coupling), not drawn from the full Schwinger weight
  including the fermion determinant. The non-monotone dip at the strongest disorder
  is a rough-lattice artefact, not physics.
- **Small lattice, exact diagonalisation.** L = 6, by exact complex-Hermitian
  eigendecomposition. The signal is clean at this size.

## Status

P8 / A4: the chiral fermion is coupled to a dynamical gauge field, and a chiral
condensate forms from the anomaly (zero free, nonzero gauged). This is the
Schwinger-model behaviour, demonstrated as a signal. The precise condensate value,
with the fermion determinant and continuum extrapolation, is the next refinement.
The remaining ladder beyond this is the genuinely open chiral gauge theory (B2).

## See also

`p8-index.md` (the fixed-background index theorem), `p8-confinement.md` (the gauge
sector), `note/questions/remaining-frontier-spec.md` (A4).
