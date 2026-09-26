# Relativity arena

**53 experiments ([`E-RLT-0001`](../../../test/experiment/relativity/addressing-lorentz.ts) to [`E-RLT-0053`](../../../test/experiment/relativity/emergent-isotropy-at-scale.ts)).**

## What this arena tests

Vibe runs on a **discrete, fixed lattice**. Special relativity is the hard problem for any such theory. A regular lattice has preferred axes and a preferred rest frame, so naively it breaks Lorentz invariance. The arena asks whether the physics that matters can still emerge:

- an **emergent speed limit** (a finite maximum signal speed, the light cone),
- **Lorentz invariance** recovered from a preferred-frame substrate,
- **isotropy** (the same light speed in every direction),
- **boosts** and relativistic velocity addition,
- **time dilation** and the Dirac dispersion for massive modes,
- **doubly-special-relativity** deformations at the cell scale, with ordinary relativity recovered at low energy.

The through-line is **emergence in the infrared**. Exact continuous Lorentz symmetry cannot live in a finite point group. The claim is that it appears as the long-wavelength limit, that the {3,4,3,4} 24-direction D4 coin restores it faster than a cubic lattice, and that the residual violation sits far below current bounds. Two routes go further and find **exact** discrete Lorentz structure in the light-cone sector.

## Sub-themes

### 1. The emergent light cone and speed limit

A free tone streams ballistically. The front advances exactly one cell per beat (z = 1), a finite frame-independent maximum speed, and the full interacting rule respects the same causal bound.

- **[`E-RLT-0014`](../../../test/experiment/relativity/light-cone.ts)** - ballistic z = 1 light cone on the {4,3,4} cubic cusp, a front advancing one cell per beat.
- **[`E-RLT-0015`](../../../test/experiment/relativity/light-cone-3434.ts)** - finite ballistic light cone (z = 1) on the 24-direction {3,4,3,4} coin, with the full interacting rule causal (perturbations never exceed the beat count).
- **[`E-RLT-0027`](../../../test/experiment/relativity/one-rule-propagation.ts)** - the microscopic ternary signed-majority rule itself carries a causal light cone at finite speed.
- **[`E-RLT-0034`](../../../test/experiment/relativity/sliver-transport.ts)** - a long geodesic tube shows ballistic (not diffusive) transport with a finite escape speed.
- **[`E-RLT-0039`](../../../test/experiment/relativity/momentum-current-and-cone.ts)** - the momentum-conserving knit conserves a momentum current exactly and has a sharp causal speed of one cell per beat, while a lossy rule loses the momentum (the control).

### 2. The preferred-frame problem: lattice versus sprinkling versus deterministic substrate

A regular lattice picks a rest frame and preferred axes. A random Minkowski sprinkling (a causal set) is Lorentz-invariant in distribution. These experiments run the fork and ask whether a deterministic, non-random placement can be as Lorentz-safe as the random one.

- **[`E-RLT-0001`](../../../test/experiment/relativity/addressing-lorentz.ts)** - a regular lattice singles out a frame, a Minkowski sprinkling does not, measured on reach and isotropy.
- **[`E-RLT-0006`](../../../test/experiment/relativity/deterministic-substrate.ts)** - a deterministic golden-angle sunflower substrate is as Lorentz-safe as the random sprinkle, so the safety does not require true randomness.
- **[`E-RLT-0012`](../../../test/experiment/relativity/growth.ts)** - an expanding hyperbolic mesh keeps exponential reach, isotropy, and navigability as it grows.
- **[`E-RLT-0017`](../../../test/experiment/relativity/lorentz-boost.ts)** - sprinkle rapidity is flat and boost-covariant, while a lattice peaks at a rest frame (a genuine boost probe, not a rotation proxy).
- **[`E-RLT-0022`](../../../test/experiment/relativity/lorentz-violation.ts)** - a lattice violates Lorentz invariance (anisotropic, energy-dependent group velocity), a sprinkling is Lorentz-safe.
- **[`E-RLT-0028`](../../../test/experiment/relativity/physics-on-real-space.ts)** - the flat-layer physics holds on the {4,3,4} cubic cusp but degrades on a generic aperiodic slice.

### 3. Emergent isotropy: the rotational half of Lorentz

A relativistic light speed must be the same in every direction. The 24 D4 directions (the 24-cell) force rank-2 and rank-4 tensors isotropic, so the wave dispersion is isotropic to high order where a cubic lattice is not.

- **[`E-RLT-0013`](../../../test/experiment/relativity/isotropy-24dir.ts)** - the 24 D4 directions give a wave dispersion isotropic to order four, the cubic (6 or 8 directions) does not.
- **[`E-RLT-0019`](../../../test/experiment/relativity/lorentz-dynamics.ts)** - the long-wavelength wavefront is nearly isotropic on both a random mesh and a lattice.
- **[`E-RLT-0021`](../../../test/experiment/relativity/lorentz-isotropy.ts)** - the one-step diffusion tensor is isotropic, forced by the icosahedral {5,3,4} cell symmetry.
- **[`E-RLT-0038`](../../../test/experiment/relativity/wave-isotropy.ts)** - the deterministic reversible wave on the dodecagrid has an isotropic speed in every direction.

### 4. Boosts and the full Lorentz group

Rotations are half of Lorentz. Boosts are the other half. On the Dirac quantum walk the boost test is sharp, and two experiments find exact (machine-precision) discrete boost structure by using light-cone coordinates.

- **[`E-RLT-0002`](../../../test/experiment/relativity/boost-invariance.ts)** - the massless mode has an exact boost-invariant light cone, the massive modes are boost-invariant in the infrared window.
- **[`E-RLT-0003`](../../../test/experiment/relativity/boost-velocity-addition.ts)** - boosts are genuine Lorentz transformations, the light cone is frame-independent and velocities add relativistically ((v+u)/(1+uv), never superluminal).
- **[`E-RLT-0011`](../../../test/experiment/relativity/emergent-boost-3434.ts)** - boosts preserve E^2 - p^2 = m^2 in the infrared and break it in the ultraviolet, the expected emergent-spacetime situation.
- **[`E-RLT-0016`](../../../test/experiment/relativity/lorentz.ts)** - the Dirac dispersion is boost-invariant at small k with a massless light-speed mode.
- **[`E-RLT-0042`](../../../test/experiment/relativity/exact-discrete-boosts.ts)** - the light sector carries **exact** Lorentz structure: omega = k with no correction anywhere in the zone, integer light-cone boosts map solutions to solutions exactly, and their rapidities are dense. The mass deforms it (the control).
- **[`E-RLT-0043`](../../../test/experiment/relativity/massive-shell-lorentz.ts)** - the massive walk shell is **exactly** Lorentz invariant in deformed variables, E^2 - P^2 = sin^2(mass) at every momentum, boosts map dynamical modes to dynamical modes, and the group velocity is P/E.

### 5. Dirac and relativistic-wave emergence, and mass

The single-particle sector of the directional rule is a two-component (left and right mover) walk. Its dispersion is measured, not assumed, and gives the Dirac relation. The mass is the emergent chirality coupling.

- **[`E-RLT-0008`](../../../test/experiment/relativity/dirac-from-discrete.ts)** - the discrete walk dispersion measured by DFT gives a massless light cone (E = k, an exact permutation) and the massive Dirac relation cos E = cos m cos k.
- **[`E-RLT-0024`](../../../test/experiment/relativity/mass.ts)** - an analytic consistency check: the assumed lattice Dirac Hamiltonian gives a gap = m and a relativistic dispersion b ~ m^2 (an L0 check, the mass is put in by hand, not emergent).
- **[`E-RLT-0025`](../../../test/experiment/relativity/measured-dispersion-3434.ts)** - the walk dispersion read out of the one-step operator gives rest energy = mass, Lorentz at long wave, and a massless light-speed mode.
- **[`E-RLT-0026`](../../../test/experiment/relativity/measured-emergent-mass-3434.ts)** - the fermion mass is the 8s-8c chirality coupling, measured two agreeing ways (dispersion mass and the [H, gamma5] commutator), vanishing into a massless Weyl fermion when the coupling is off. This measures the mass mechanism, not the mass value.
- **[`E-RLT-0040`](../../../test/experiment/relativity/honeycomb-dirac-cones.ts)** - the honeycomb two-site cell gives exactly two isolated linear Dirac cones with v = 3/2, while the square lattice gives a Fermi line and a staggered mass gaps them out. Known graphene tight-binding math, verified by measurement (L1).

### 6. The momentum ingredient: deterministic waves and the second conserved current

A relativistic massless mode (photon, graviton, sound) needs ballistic propagation and a second conserved current (momentum) beyond the U(1) charge. Random hops give diffusion (z = 2). Deterministic reversible rules give waves (z = 1), and the momentum-conserving knit supplies the second current.

- **[`E-RLT-0004`](../../../test/experiment/relativity/deterministic-perception.ts)** - the perception rule reformulated as a deterministic reversible block CA is charge-conserving, reversible, and ballistic.
- **[`E-RLT-0005`](../../../test/experiment/relativity/deterministic-rp.ts)** - the deterministic reversible wave has a real, linear, massless dispersion, so its spatial reflection positivity is positive (a positive-norm massless relativistic particle).
- **[`E-RLT-0007`](../../../test/experiment/relativity/deterministic-wave.ts)** - a deterministic reversible rule propagates ballistically (z = 1), so momentum emerges once the randomness is removed (L3).
- **[`E-RLT-0030`](../../../test/experiment/relativity/propagating-mode-3434.ts)** - the momentum-conserving knit carries a propagating massless mode omega = c k, the charge-only pair table does not (L3).
- **[`E-RLT-0032`](../../../test/experiment/relativity/second-conservation-search.ts)** - the stochastic rule conserves only the U(1) charge with no spontaneous order (the emergent-search negative that motivates the momentum-conserving rule).
- **[`E-RLT-0033`](../../../test/experiment/relativity/second-conserved-quantity-3434.ts)** - the momentum-conserving knit has a second conserved current (the exact integer momentum vector) deterministically, the pair table breaks it.
- **[`E-RLT-0037`](../../../test/experiment/relativity/transverse-mode-frozen.ts)** - the bare knit propagates the spin-0 mode but freezes the transverse spin-2 graviton (a conserved shear, omega = 0), so a propagating graviton is emergent, not bare (a measured negative with a positive control).

### 7. Dispersion, Lorentz violation, and low-energy recovery

Discreteness must leave a signature and must break Lorentz at some order in momentum. These experiments measure the leading deviation, show it flows to zero in the infrared, and set it against gamma-ray-burst photon bounds. The fixed lattice deforms into a doubly-special form rather than picking a frame.

- **[`E-RLT-0009`](../../../test/experiment/relativity/discreteness-signature.ts)** - the discrete dispersion bends below the continuum at a leading order in momentum near two, vanishing in the infrared, a novel falsifiable signature.
- **[`E-RLT-0010`](../../../test/experiment/relativity/doubly-special-dispersion.ts)** - the fixed-lattice dispersion recovers Lorentz at low momentum and deforms to a doubly-special form with a cell-scale maximum frequency (D'Ariano-Perinotti), absent in the continuum control.
- **[`E-RLT-0018`](../../../test/experiment/relativity/lorentz-bound-3434.ts)** - the deterministic {3,4,3,4} substrate passes the GRB Lorentz bound by D4 symmetry (linear coefficient xi1 = 0, anisotropy order >= 4), with no random sprinkling (L3).
- **[`E-RLT-0020`](../../../test/experiment/relativity/lorentz-flow.ts)** - higher-order angular anisotropy washes out under coarse-graining (the central-limit route to isotropy).
- **[`E-RLT-0023`](../../../test/experiment/relativity/lorentz-violation-scale.ts)** - the D4 substrate suppresses Lorentz violation to a higher order in momentum than a hypercubic substrate.
- **[`E-RLT-0029`](../../../test/experiment/relativity/predictions-vs-bounds.ts)** - the model passes the GRB Lorentz bound that excludes a lattice, the sprinkling prediction against the tightest current data (L3).
- **[`E-RLT-0035`](../../../test/experiment/relativity/swerves.ts)** - momentum diffusion from discreteness (the Dowker-Henson-Sorkin swerve), rapidity variance grows linearly with proper time, a distinctive observational prediction.
- **[`E-RLT-0036`](../../../test/experiment/relativity/symmetry-restoration-3434.ts)** - the discrete F4 symmetry restores to continuous rotational isotropy in the infrared on {3,4,3,4}.
- **[`E-RLT-0041`](../../../test/experiment/relativity/lorentz-irrelevance-exponent.ts)** - the lattice Lorentz violation is an irrelevant operator with a measured exponent near four on the coin, so exact Lorentz is the infrared fixed point (near two for the cubic set, the control).

### 8. Integrated capstone

- **[`E-RLT-0031`](../../../test/experiment/relativity/rf-relativity-3434.ts)** - a ballistic light cone, 24-direction isotropy, the Dirac dispersion, and a rising arrow all on the committed {3,4,3,4} coin, bundling the arena's separate results into one substrate.

## Added by the 2026-09-01 amplitude branch

- **[`E-RLT-0044`](../../../test/experiment/relativity/chronoflux-aether-bound.ts)** - (L1, paper) the Einstein-aether spin-2 bound pins the withdrawn Chronoflux alpha_1 below 6e-15, thirteen orders from the values its flow sector uses

## The committed knit at coarse scale, added 2026-09-25

- **[`E-RLT-0045`](../../../test/experiment/relativity/coarse-isotropy-of-the-rule.ts)** (L2) - rotation symmetry does not come back at coarse scale under the committed knit. It keeps only {I, -I}, which forces nothing, so rank 2 is the lowest unforced rank (the torus group forces rank 2 only, W(F4) ranks 2 and 4, not 6). The rank-2 response of long charge waves stays anisotropic from side 9 to 17: kernel 1.60, 1.34, 1.31, axis-shell spread 0.31, 0.33, 0.34. It keeps 0.82 and 1.10 of itself where a lattice correction would keep 0.53 or 0.28, against a streaming floor of 0.001 to 0.04.
- **[`E-RLT-0046`](../../../test/experiment/relativity/chirality-at-scale.ts)** (L2, partial) - the knit's handedness does not survive coarse-graining. At the lattice scale a lone love's response is 4.12 times more self-dual than anti-self-dual (`E-FRC-0142`). The long-wave current response at L = 9, 13, 17 splits within a factor of 1.46 on the dense background and the vacuum, with no stable sign, and its antisymmetric part shrinks from 0.45 to 0.19 of the isotropic. Partial, because the mirror control swaps the halves to 2 percent at side 9 but reproduces their size only to about 25 percent at side 13.

So the isotropy results above hold for the walk and the 24-direction coin, not for the committed knit's own long waves: the knit breaks rotation at every scale measured and keeps its chirality only at the lattice scale. A knit whose symmetry group acts irreducibly on rank 2 is the open design constraint.

## Restoring isotropy: the CPT fork (`E-RLT-0047` to `0053`), added 2026-09-25

- **[`E-RLT-0047`](../../../test/experiment/relativity/emergent-metric-escape.ts)** (L2) - no single emergent metric absorbs the committed knit's anisotropy. Its dense-background kinetic tensor (anisotropy 0.06 to 0.07) and its vacuum lone-vibe tensor (0.91) stay 0.70 to 0.74 apart at sides 9, 13 and 17, against a pre-registered 0.1, with pure streaming at 0.04 as the positive control. The sound tensor from peak frequencies is a quadratic form (residual 0.064), 0.95 and 1.12 from the other two. The 0.1 tolerance was fixed after a side-9 probe had been seen (disclosed).
- **[`E-RLT-0048`](../../../test/experiment/relativity/knit-that-restores-isotropy.ts)** (L2) - no schedule of the committed architecture restores rotation symmetry. Exhaustively, only one non-central coin map class (minus a reflection) leaves any beat invariant, so every glide group is abelian and reducible, as measured for the committed, color turn, momentum and round-robin knits. Giving each line its own orientation and the swap a whole orbit of couples admits 24 irreducible glide groups of order 24, complex type with one single-handed invariant two-form, none with a CPT partner and none coupling more than 54 of 66 line pairs. The orbit knit built from one keeps reversal, charge and a periodic vacuum, with glide-averaged anisotropy 0.23 at side 9 and 0.21 at side 13 (noise) against the committed knit's 1.20.
- **[`E-RLT-0049`](../../../test/experiment/relativity/palindromic-orbit-knit.ts)** (L2) - a palindrome buys CPT back and loses the isotropy. Folded forward and back, the orbit knit keeps exact CPT with the identity coin map at mirror phase 31, but the glide goes with the fold: its period group is the 3 beat symmetries, reducible, and its anisotropy rises from 0.23 to 0.63. Over every subgroup of every beat stabilizer of five beat shapes, 2.35 million invariant beats, no irreducible period group exists.
- **[`E-RLT-0050`](../../../test/experiment/relativity/scatter-block-symmetry.ts)** (L2) - the four-line scatter block narrows the fork and does not open it. On states that make its scatterings fire, it breaks 8 symmetries of the head-on base beat, leaving the identity and the point inversion with charge conjugation. The knit keeps CPT with a reducible period group of order 2 and anisotropy 0.84 and 0.81 at sides 9 and 13.
- **[`E-RLT-0051`](../../../test/experiment/relativity/whole-dock-isotropic-knit.ts)** (L2) - the isotropy bound. Exact local color keeps the side sum, and no irreducible coin group keeps any of the 4,096 side choices, so every irreducible period group forces at least 8 line-momentum invariants (the scatter weave keeps 5, and 235 of 320 two-generated groups force all 12). The quaternion knit (period one, Q8, spread 1.3e-15) keeps CPT, reversal, charge, P and a period-3 vacuum, with isotropy forced, but dresses 289, 7,219, 68,735, 106,055 at side 9 against 33, 160, 565, 1,508.
- **[`E-RLT-0052`](../../../test/experiment/relativity/calm-moving-relabelings.ts)** (L2) - relabelings that move calm do not help. A calm-moving uniform relabeling would freeze every vibe count (rank 3 for all four), and no knit of six has any calm-moving ledger entry over 1,152 coin maps and 36 per-side pairs, so no period group grows.
- **[`E-RLT-0053`](../../../test/experiment/relativity/emergent-isotropy-at-scale.ts)** (L2) - no emergent isotropy at these sizes. The combined knit's long-wave anisotropy stays at 0.80, 0.77, 0.76, 0.77, 0.76 from side 9 to 25, structural under averaging, while the forced-isotropic quaternion knit's reading is noise falling from 1.35 to 0.32.

So the fork stands on every escape tried. Isotropy by symmetry (the orbit knit) costs CPT and the round robin. CPT with the round robin leaves isotropy to emerge dynamically, and it does not emerge to side 25 (`E-RLT-0045`, `0053`). Forcing isotropy with exact local color costs at least 8 line-momentum invariants, and the one knit found with CPT and forced isotropy dresses without bound. Outside the proofs: a block that replaces the couples, and vibe maps that move calm beyond the uniform and per-side ones. Methodology note: the symmetry ledger is blind to a block that fires only on some states, so `E-RLT-0050` tests on states that make the scatterings fire.

## What this arena establishes

- **A finite speed limit is real and robust.** The light cone (z = 1, one cell per beat) is measured on the cubic cusp and the 24-direction coin, on the microscopic rule and the full interacting rule, and it is causal.
- **Isotropy and infrared Lorentz are recovered, and the geometry is why.** The 24 D4 directions form a spherical 5-design, so the dispersion is isotropic through order four and the leading Lorentz violation is an irrelevant operator flowing to zero with a measured exponent near four, faster than a cubic lattice.
- **The Lorentz-from-lattice tension is genuine and handled two ways.** A regular lattice does pick a frame. The causal-set route keeps boosts by randomizing the substrate, but the framework forbids true randomness, so the deterministic-sunflower and D4-symmetry experiments ([`E-RLT-0006`](../../../test/experiment/relativity/deterministic-substrate.ts), [`E-RLT-0018`](../../../test/experiment/relativity/lorentz-bound-3434.ts)) carry the safety instead. This is the central strain of the arena and it is surfaced, not hidden.
- **Exact discrete Lorentz structure exists in the light sector.** Using light-cone coordinates, the massless walk has omega = k with no correction anywhere in the zone, integer boosts map solutions to solutions exactly with dense rapidities ([`E-RLT-0042`](../../../test/experiment/relativity/exact-discrete-boosts.ts)), and the massive shell is exactly Lorentz invariant in deformed variables ([`E-RLT-0043`](../../../test/experiment/relativity/massive-shell-lorentz.ts)). The known finite-point-group impossibility is evaded, not contradicted.
- **The Dirac equation and mass are emergent, with a caveat.** The two-component walk dispersion is measured and gives the Dirac relation, and the mass emerges as a chirality coupling measured two agreeing ways ([`E-RLT-0026`](../../../test/experiment/relativity/measured-emergent-mass-3434.ts)). The purely analytic mass check ([`E-RLT-0024`](../../../test/experiment/relativity/mass.ts)) is L0 and puts the mass in by hand, flagged as such.
- **The interacting massless mode needs a second conserved current, an open frontier.** Deterministic reversible rules give ballistic momentum ([`E-RLT-0007`](../../../test/experiment/relativity/deterministic-wave.ts)), and the momentum-conserving knit supplies the second current and a propagating omega = c k mode ([`E-RLT-0030`](../../../test/experiment/relativity/propagating-mode-3434.ts), [`E-RLT-0033`](../../../test/experiment/relativity/second-conserved-quantity-3434.ts)). The transverse spin-2 graviton stays frozen on the bare knit ([`E-RLT-0037`](../../../test/experiment/relativity/transverse-mode-frozen.ts)), so a propagating graviton is emergent only in the Lorentz-restored infrared, a named remaining gap.
- **Discreteness makes falsifiable predictions.** A doubly-special dispersion with a cell-scale maximum frequency ([`E-RLT-0010`](../../../test/experiment/relativity/doubly-special-dispersion.ts)), a phase-speed bend that vanishes in the infrared ([`E-RLT-0009`](../../../test/experiment/relativity/discreteness-signature.ts)), and rapidity-diffusion swerves ([`E-RLT-0035`](../../../test/experiment/relativity/swerves.ts)), all of which pass the current gamma-ray-burst bounds that would exclude a plain lattice.
