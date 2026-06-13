# Reading the Numbers: A Metrics Glossary

What the recurring numbers in the experiments mean, in plain terms. Every number is a
deterministic function of a stated seed, so it reproduces exactly.

## Geometry and substrate

- **Lorentz anisotropy** (0 to 1). How much the directions of nearest links cluster at
  preferred angles, measured as the strongest angular Fourier order parameter over
  harmonics 2, 3, 4, 6. **0 means perfectly isotropic** (no preferred direction, the
  good case). **1 means a strong preferred frame** (a flat lattice). The cutoff for
  "has a preferred frame" is 0.25. A random sprinkle reads about 0.07, the hyperbolic
  tilings about 0.02 to 0.06, a flat lattice 1.0.
- **mean degree.** The average number of neighbors a node has (how many other vibes each
  one directly notes). In the committed model this is about ten.
- **exponential reach** (yes/no). Whether the number of nodes within graph-distance r
  grows exponentially with r, the signature of hyperbolic space. Measured by the mean
  ball-growth ratio over the unsaturated radii exceeding about 1.8.
- **(spacetime / spatial) dimension.** Recovered from the order, not put in. Measured by
  ball growth (how volume scales with radius) or by the Myrheim-Meyer ordering fraction.
  A value near an integer d means the structure looks d-dimensional. Sprinkled regions
  read within a few percent of their true dimension.
- **manifold fraction.** The fraction of sampled causal sets that look manifold-like
  rather than layered. Higher means smooth spacetime is favored.

## Dynamics and thermodynamics

- **action** (and **smeared action**). The discrete Benincasa-Dowker action, the
  causal-set analogue of the Einstein-Hilbert action. Its fluctuations and scaling drive
  the cosmological-constant results.
- **beta-star (the crossing coupling).** The coupling at which the free energies of the
  manifold and layered phases cross, so above it the manifold phase dominates. Measured
  near 0.14.
- **flip fraction.** The fraction of vibes that change tone in one sweep of the rule. It
  falling to zero means the dynamics has converged to a stable structured state (an
  attractor).
- **height ratio, ordering fraction.** Order parameters for how layered versus
  manifold-like a causal set is.

## Operators and fields

- **spectral gap.** The smallest nonzero eigenvalue of the field operator. For a massive
  field it equals the mass (the rest energy). For a massless field it shrinks to zero.
- **dispersion** (omega versus k). How frequency depends on wavenumber. The relativistic
  form is omega^2 = k^2 + m^2, so the slope is one and the intercept is m^2.
- **R^2 (goodness of fit).** How well a fitted form matches the data, 1.0 being perfect.
  Used for example to confirm the static potential is 1/r (R^2 about 0.997).
- **anisotropy / diffeomorphism residual / Bianchi residual.** These should be machine
  zero (about 1e-15) when a symmetry holds exactly, for example gauge invariance of the
  graviton operator or energy-momentum conservation of the Einstein tensor.
- **polarizations / zero modes.** Counts of physical field components, for example two
  for a massless photon or graviton, five for a massive spin-2, and zero-mode counts
  equal to topological invariants (Betti numbers).

## Quantum and entanglement

- **CHSH value** (up to 4). The Bell correlation. The classical bound is 2, the quantum
  value about 2.83, and the algebraic maximum 4. Above 2 means non-classical correlation.
- **entanglement entropy.** How much a region is entangled with its complement. Its
  scaling distinguishes a volume law from an area law (entropy set by the boundary).
- **norm / total probability.** Sum of the squared amplitude, which a unitary evolution
  conserves at 1.0.
- **spreading exponent.** How a wavepacket's width grows with time: 1.0 is ballistic
  (quantum, coherent), 0.5 is diffusive (classical).

## Cosmology and predictions

- **delta-Lambda exponent.** How the implied cosmological constant scales with the
  spacetime volume V. The everpresent prediction is delta-Lambda ~ 1/sqrt(V), an
  exponent of -0.5 (Lambda shrinks as the universe grows).
- **e-folds.** The number of factors of e by which a region expands. Inflation is a few
  e-folds in a short epoch.
- **Planck units.** Natural units where the Planck length and time are one. Dark energy
  is about 10^-122 in these units, and the everpresent prediction matches that.

## Honest-status words

Used in the scoreboard. **validated** (a prediction confirmed), **measured** (a quantity
now computed), **demonstrated** (the mechanism shown), **down-payment** (a first rung on
a deep open problem), **progress / clarified** (partial or corrected), **meets
observation** (matches data), **boundary** (outside what a simulation can decide).

## See also

`note/what-the-testbed-proves.md` (what the numbers do and do not establish) and
`note/experiment/results/` (the per-experiment findings).
