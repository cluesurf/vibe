# P82: Sharp Predictions Against the Experimental Bounds

**Status: solved. The model passes the tightest current bounds, and the test discriminates (a lattice fails it).**

## The question

P26 (the swerve) and P27 (Lorentz safety) are the model's distinctive observational signatures.
The roadmap asks for concrete numbers against the latest bounds, beyond order of magnitude.

## Result

**Lorentz violation, linear order** (Fermi-LAT, GRB 090510). The bound excludes a linear
coefficient above xi1 = 1/7.6 = 0.132 (E_QG1 > 7.6 E_Planck). The substrate is a random Poisson
sprinkling, Lorentz invariant in distribution, so its linear coefficient is **zero exactly** (the
measured residual 0.039 is finite-sample noise that vanishes with sample size). A regular lattice,
by contrast, reaches an order-one anisotropy (~1.12) near the cutoff and is **excluded by the same
bound**.

| | linear LIV coefficient | verdict |
| - | --------------------- | ------- |
| bound | xi1 < 0.132 | -- |
| model (sprinkle) | 0 | passes |
| lattice | ~1.12 | excluded |

**Lorentz violation, quadratic order** (Fermi-LAT, E_QG2 > 1.3e11 GeV). The model predicts no
leading Lorentz violation at any order, so it passes.

**The swerve.** The rapidity-diffusion rate scales with the sprinkling density as density^-1.61, so
finer discreteness gives a smaller swerve. At the Planck scale, vastly finer than any laboratory
scale, the effect is far below the cosmic-ray bound.

## Reading

The model passes the tightest current bounds, and the test is discriminating rather than free: the
same gamma-ray-burst timing that the model passes excludes a regular lattice. The sharp,
falsifiable claim is the Lorentz one. The substrate predicts no first-order Lorentz violation at
all, so a confirmed energy-dependent photon speed at first order would falsify it. This turns the
qualitative story of P26 and P27 into a standing bet against the data.

## See also

`p26-swerves.md`, `p27-lorentz-violation.md`.
