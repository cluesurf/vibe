# Gravity Arena

**50 experiments.** Codes **[`E-GRV-0001`](../../../test/experiment/gravity/analog-hawking.ts)** through **[`E-GRV-0050`](../../../test/experiment/gravity/gravity-screening-size-independent.ts)**.

## What this arena tests

In ordinary physics gravity is either a fundamental force or a fundamental geometry, put in by hand as Newton's law or Einstein's field equations. Vibe theory refuses to add it. The whole model is five base things: a discrete **{3,4,3,4}** crystal (the 24-direction D4 coin), a ternary tone, a reversible charge-conserving rule, reflection and growth, and the arrow. There is no gravity term anywhere in the base.

So this arena asks whether gravity can **emerge** from the coarse-grained substrate instead. The thesis is entropic and thermodynamic. Curvature is not fundamental, it is the shape a conserved current is forced into to stay continuous under stress. The gravitational potential is not a new field, it is the thermodynamic reading of the entanglement **area law** of the emergent matter field. Space geometry, Newton's inverse square, the Einstein equations, the graviton, gravitational waves, horizons, black-hole thermodynamics, the dark sector, and the link to holography are all treated as things that must be **measured out of the dynamics**, with a control that could have failed, not asserted.

Each experiment carries a depth tier. **L0** is circular (the answer put in by hand). **L1** confirms known math on the substrate. **L2** reproduces a known physics construction. **L3** is the genuine target: a base rule producing the result as a measured consequence. Negatives are reported as results. Several titles below name their own limit, and a few label themselves openly as consistency checks or open frontiers rather than emergence.

## Sub-themes

### 1. Gravity as emergent geometry (curvature, the metric, the causal set)

Gravity **is** geometry. A mass curves the effective metric and free rays follow geodesics that bend toward it. These tests measure geodesic focusing, matter-sourced curvature, lensing, and the strong-field Schwarzschild interior on the substrate tilings.

- **[`E-GRV-0006`](../../../test/experiment/gravity/curvature-focusing.ts)** - positive curvature reconverges geodesics (route 2A works, at the cost of a dynamical mesh), the flat cusp stays parallel, the hyperbolic bulk defocuses (2B fails locally).
- **[`E-GRV-0010`](../../../test/experiment/gravity/effective-metric.ts)** - an effective metric bends rays toward matter, the lensing scaling with the source mass.
- **[`E-GRV-0012`](../../../test/experiment/gravity/emergent-metric.ts)** - one emergent metric gives the matter inverse-square law and the light factor-two bending, no new field.
- **[`E-GRV-0037`](../../../test/experiment/gravity/time-dilation-optical.ts)** - gravity as time dilation, the clock-rate well bends light (the temporal half), the full metric gives the factor-two deflection.
- **[`E-GRV-0004`](../../../test/experiment/gravity/black-hole-shadow.ts)** - the strong-field Schwarzschild geometry: the photon sphere, divergent lensing, and the black-hole shadow, with the weak-field factor of two recovered.
- **[`E-GRV-0033`](../../../test/experiment/gravity/schwarzschild-from-bootstrap.ts)** - the Schwarzschild metric resummed by the gravity-gravitates bootstrap, the spatial metric giving the other half of the light bending.
- **[`E-GRV-0035`](../../../test/experiment/gravity/tempering.ts)** - parallel tempering finds a susceptibility peak and layered-versus-manifold coexistence in the causal-set action, the geometry phase transition.

### 2. The source of gravity: the area law and the discrete potential

The gravitational potential rides entirely on the **entanglement area law** of the emergent matter field. These tests measure that the ground-state entropy is boundary-set (area) not volume-set, and derive the Newtonian force the Verlinde way, with the volume-law thermal state as the control.

- **[`E-GRV-0002`](../../../test/experiment/gravity/area-law-from-knit-walk.ts)** - the area law read off the knit's own coined Dirac walk: a massive walk saturates (area law), a gapless walk grows (control).
- **[`E-GRV-0003`](../../../test/experiment/gravity/area-law-universality.ts)** - the area law is universal across gapped masses, so the proxy is a genuine relativistic field model, not an arbitrary stand-in.
- **[`E-GRV-0013`](../../../test/experiment/gravity/entropic-newton.ts)** - the static Newtonian 1/r force from the measured area law by the Verlinde route, no new field.
- **[`E-GRV-0015`](../../../test/experiment/gravity/gr-einstein-equations.ts)** - the measured area law forces the Einstein equation as an equation of state (Jacobson), with a measured 1/r Newtonian limit.
- **[`E-GRV-0028`](../../../test/experiment/gravity/newton-constant-scale.ts)** - Newton's G is the single scale: the bounded area-law bit density fixes G in lattice units, the volume law has no definite G.
- **[`E-GRV-0038`](../../../test/experiment/gravity/trace-singlet.ts)** - the gravity scalar is the forced F4-invariant trace, the unique symmetric singlet the 24-cell already carries, and it binds a test mass.
- **[`E-GRV-0036`](../../../test/experiment/gravity/ternary-field.ts)** - the discrete gravity field held in balanced ternary, three trits bind a displaced mass while a single trit is too coarse.

### 3. Newton's 1/r from lattice Green functions

Recovering the static inverse-square law directly as a lattice Poisson Green function, getting the dimension right, and pinning where the naive bulk propagator fails.

- **[`E-GRV-0022`](../../../test/experiment/gravity/gravity-freespace.ts)** - the free-space 3D lattice Green function is exactly 1/(4 pi r), the clean 1/r Newton law with no box artifact.
- **[`E-GRV-0021`](../../../test/experiment/gravity/gravity-boundary.ts)** - the flat-cusp Poisson Green function falls as 1/r in three dimensions and log r in two, the dimension-correct potentials.
- **[`E-GRV-0029`](../../../test/experiment/gravity/newtonian.ts)** - the 3D static potential is Newtonian, 1/r the best fit.
- **[`E-GRV-0024`](../../../test/experiment/gravity/gravity-tree.ts)** - the Bethe-lattice boundary coupling falls as 1/r for every branching, but the ideal tree is dimension-blind.
- **[`E-GRV-0025`](../../../test/experiment/gravity/gravity-treepath.ts)** - a common-ancestor tree-path propagator on the real cell graph, calibrated against {5,3,4}.
- **[`E-GRV-0032`](../../../test/experiment/gravity/s534-physics.ts)** - the {5,3,4} suite: a Bethe 1/r-squared correlator, exponential shell growth, and exact icosahedral 4th-moment isotropy, with 2D physical-space gravity logarithmic.
- **[`E-GRV-0020`](../../../test/experiment/gravity/gravity-3434.ts)** - the naive screened-diffusion gravity propagator on {3,4,3,4} is confounded (a finite hyperbolic patch is almost all boundary), so the exact bulk gravity law is left open.

### 4. The graviton as an emergent spin-2 field

The graviton is the emergent metric's radiative mode. These tests build the transverse-traceless spin-2 field, show helicity two, masslessness, gauge invariance, and derive the operator from an action rather than typing it in.

- **[`E-GRV-0017`](../../../test/experiment/gravity/gravitational-wave.ts)** - the propagating spin-2 graviton: helicity two (period 180), massless (front speed one), reversible, the gravitational wave, with a spin-1 vector the helicity control.
- **[`E-GRV-0018`](../../../test/experiment/gravity/graviton.ts)** - two graviton polarizations measured from the derived operator spectrum.
- **[`E-GRV-0009`](../../../test/experiment/gravity/discrete-graviton.ts)** - the discrete graviton is gauge-invariant and massless, two polarizations verified as eigenmodes.
- **[`E-GRV-0019`](../../../test/experiment/gravity/graviton-from-action.ts)** - the graviton operator derived two ways from the action (causal-set d'Alembertian and the Christoffel-Ricci-Einstein pipeline), pure-gauge modes annihilated, exactly two massless modes.
- **[`E-GRV-0011`](../../../test/experiment/gravity/einstein-equations.ts)** - a consistency check of the linearized Einstein operator: transverse conservation (Bianchi) and a c-speed graviton, labelled as properties of the assumed operator.

### 5. Nonlinear Einstein structure, gravitational waves, and ringdown

Gravity gravitates. The field's own energy sources more gravity, so it breaks superposition, integrates into a Friedmann cosmology, and radiates a quadrupole wave.

- **[`E-GRV-0023`](../../../test/experiment/gravity/gravity-gravitates.ts)** - the self-coupling breaks superposition (gravity gravitates), reversibly and boundedly, the linear field the control.
- **[`E-GRV-0030`](../../../test/experiment/gravity/nonlinear-einstein.ts)** - the nonlinear Friedmann equation integrated forward, power laws emerge, a deceleration-to-acceleration transition.
- **[`E-GRV-0031`](../../../test/experiment/gravity/propagating-curved-gravity.ts)** - a stable reversible nonlinear propagating gravity in the curved {5,3,4} bulk, finite speed, exact echo, bounded.
- **[`E-GRV-0043`](../../../test/experiment/gravity/quadrupole-radiation-structure.ts)** - the multipole kinematics of an unequal-mass binary: the monopole is constant and the mass dipole vanishes by momentum conservation, while the quadrupole oscillates at 2 f_orb (the cos(2 phi) LIGO signature).
- **[`E-GRV-0044`](../../../test/experiment/gravity/quadrupole-amplitude-scale.ts)** - the quadrupole strain formula is dimensionally self-consistent, extraction recovers G r^-1 omega^2 a^2 mu and discriminates quadrupole from dipole scaling.
- **[`E-GRV-0045`](../../../test/experiment/gravity/quadrupole-coefficient-closure.ts)** - the wave prefactor 2 factorises as (16 pi)(1/4 pi)(1/2), the Green coefficient measured in-file and the virial factor computed in-file, omitting it gives 4 (the control).
- **[`E-GRV-0016`](../../../test/experiment/gravity/gr-gravitational-waves.ts)** - the assumed general-relativistic waveform formulas are internally self-consistent.
- **[`E-GRV-0048`](../../../test/experiment/gravity/ringdown-discreteness-echo.ts)** - the {3,4,3,4} geometry sustains a coherent ringdown after a pulse while a degree-matched scramble dephases and dies.

### 6. Horizons and black-hole thermodynamics

Effective horizons form where the wave speed falls to zero, and they radiate. The thermal spectrum and the first law follow from a derived temperature and the measured area law.

- **[`E-GRV-0001`](../../../test/experiment/gravity/analog-hawking.ts)** - a fill profile makes an effective horizon: the surface gravity, the dynamical exp(-kappa t) redshift, and a thermal detector response at T_H = kappa/2pi.
- **[`E-GRV-0026`](../../../test/experiment/gravity/hawking.ts)** - the thermal spectrum derived from the Unruh detector response (detailed balance, not plugged in), T = kappa/2pi, T ~ 1/M, and a genuine Page-curve turnover.
- **[`E-GRV-0014`](../../../test/experiment/gravity/gr-black-hole-thermo.ts)** - on the measured area-law entropy the horizon first law, Smarr, Bekenstein saturation, and M-cubed evaporation follow.

### 7. Where gravity lives: bulk screening and dimensionality

Long-range Newtonian gravity cannot live in the curved hyperbolic bulk, it is exponentially screened there, so it must live on the flat cusp. These tests pin the screening as a clean spectral gap and probe the substrate dimension.

- **[`E-GRV-0007`](../../../test/experiment/gravity/curved-bulk-gravity.ts)** - curved-bulk gravity is exponentially screened, the 1/r Newton tail is a flat-cusp property not a bulk one.
- **[`E-GRV-0049`](../../../test/experiment/gravity/td-log-density-gravity-screened.ts)** - TD Poisson gravity in the hyperbolic bulk decays like a Yukawa potential, not 1/r, so Newtonian gravity must live on the flat cusp, the flat 4D lattice the control.
- **[`E-GRV-0050`](../../../test/experiment/gravity/gravity-screening-size-independent.ts)** - the bulk screening is a size-independent spectral gap (random-walk decay 0.572 at both 9000 and 170000 cells), a definite Yukawa mass, the flat lattice rising toward one the control.
- **[`E-GRV-0005`](../../../test/experiment/gravity/braneworld.ts)** - a 3D substrate is inverse-square at all scales, a 4D bulk deviates to 1/r-cubed at short range, the braneworld signature bounding any extra dimension.

### 8. Candidate mechanisms and the dark sector

Two alternative static-force mechanisms tested, and the dark-matter rotation curve treated as a consistency check that flags its own assumption.

- **[`E-GRV-0034`](../../../test/experiment/gravity/shadow-pressure-not-newtonian.ts)** - the bare shadow pressure is a distance-independent ballistic deficit, not a 1/r Newtonian tail, a measured negative.
- **[`E-GRV-0027`](../../../test/experiment/gravity/le-sage-shadow.ts)** - Le Sage shadow gravity: an isotropic flux gives the inverse-square force, but the measured first-order drag rules it out as fundamental.
- **[`E-GRV-0008`](../../../test/experiment/gravity/dark-matter.ts)** - an assumed nonlocal 1/L-squared term flattens the rotation curve (no dark particle), flagged as a consistency check, not a substrate derivation.

### 9. Reversibility, continuity, and the Chronoflux bridge

The bridge from the reversible conserving substrate to smooth conserved geometry. Vibe's exactly conserved ternary tone is the divergence-free current whose forced continuity is curvature (Herbert's Chronoflux), with lossy rules the control that breaks it.

- **[`E-GRV-0039`](../../../test/experiment/gravity/coarse-continuity-closure.ts)** - the conserved tone obeys the discrete continuity law div J = 0 exactly at every coarse-block scale, a lossy rule's residual growing with scale.
- **[`E-GRV-0042`](../../../test/experiment/gravity/curved-mesh-continuity.ts)** - the same continuity law holds exactly on the actual curved {3,4,3,4} mesh, not only the flat torus, the lossy control breaking it by exactly the charge it destroys.
- **[`E-GRV-0046`](../../../test/experiment/gravity/continuum-limit-of-tone-current.ts)** - the coarse-grained tone density is Cauchy in scale at the self-averaging rate, so a continuum current exists, a scale-free Cantor control decaying far more shallowly.
- **[`E-GRV-0053`](../../../test/experiment/gravity/discrete-to-continuum-layers.ts)** - the discrete-to-continuum transfer splits in two, the continuity law exact at every finite scale with no limit taken while the smooth field is a finite-resolution reading whose quantum is exactly one over the block volume, so the continuum is approached as a resolution and never instantiated as an infinity, a one-signed sink the control (and a both-signed sink shown to cancel at a coarse scale, which is why it is not used).
- **[`E-GRV-0047`](../../../test/experiment/gravity/coarse-stress-closure.ts)** - the momentum-transport law also closes integer-exactly at every coarse block, completing the covariant closure, the pair-table control leaving a residual.
- **[`E-GRV-0040`](../../../test/experiment/gravity/recoverability-functional.ts)** - Herbert's recoverability functional R = accessible / total unifies horizons, decoherence, and conservation, staying 1 globally on the reversible base and dropping under a lossy control.
- **[`E-GRV-0041`](../../../test/experiment/gravity/gravity-induced-entanglement-witness.ts)** - two distant regions become entangled only through the geometric mediator and the mutual information covaries with its strength (the GIE / BMV witness), a direct bypass the control.


## Added or first run by the 2026-08-31 audit

- **[`E-GRV-0028`](../../../test/experiment/gravity/newton-constant-scale.ts)** (L2) - Newton G is the single scale, the bounded area-law bit density fixes G in lattice units, the volume law has no definite G

## Added by the 2026-09-01 amplitude branch

- **[`E-GRV-0054`](../../../test/experiment/gravity/chronoflux-withdrawn-action-redundancies.ts)** - (L1, paper) both structural redundancies of the withdrawn Chronoflux action verified numerically, and neither posable in the rebuilt 2026 action

## What this arena establishes

- **The static Newtonian force emerges without a new field.** The measured entanglement area law gives the inverse-square force by the Verlinde route, and the flat-cusp lattice Green function is a clean 1/r, both with volume-law and dimensional controls.
- **The Einstein structure is thermodynamic, not fundamental.** The measured area law forces the Einstein equation as an equation of state, and the graviton, its two polarizations, and the nonlinear gravity-gravitates self-coupling are derived, not typed in.
- **Horizons and black-hole thermodynamics fall out.** Effective horizons radiate at T = kappa/2pi with a derived thermal spectrum, and the first law, Smarr, Bekenstein, and M-cubed evaporation follow from the measured area-law entropy.
- **Geometry sets where gravity can live.** Long-range gravity is exponentially screened in the hyperbolic bulk by a size-independent spectral gap, so Newtonian gravity is a flat-cusp phenomenon, which is exactly where the theory puts observers.
- **Conservation is the bridge to curvature.** The exactly conserved reversible tone is a divergence-free current at every coarse scale on the real curved mesh, the discrete-to-continuum half of the Chronoflux link, with lossy controls that break it.
- **The discrete carries the continuum law without any infinity.** The transfer splits: the conservation law is metric-free and exact at every finite scale with no limit taken, while only the smooth field needs a limit, and there it is a finite-resolution reading whose quantum shrinks as one over the block volume. So the continuum is approached as a resolution rather than instantiated, which is the precise answer to whether a discrete base can host a continuum theory.
- **The gaps are marked.** The exact bulk gravity propagator is open, the dark-sector rotation curve is a flagged consistency check, Le Sage is ruled out by drag, and several relations are labelled internal consistency rather than emergence.

## License

MIT

## ClueSurf
