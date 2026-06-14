# Findings 5, Physics, Spacetime, Gravity, Cosmology, Quantum, Foundations

The large-scale and foundational physics, with exact measured numbers and the mechanism for each. Companion to
`findings.md`. Cite `\cite{pollard2026vibetest}`, with Jacobson, Ryu-Takayanagi, Maldacena, and 't Hooft where the
external results converge.

## Emergent Lorentz invariance, the impossible-on-a-lattice result

Special relativity is supposed to be unreachable on a discrete lattice (a grid has preferred axes). Here it emerges,
measured.

| quantity | 24-direction dock | low-symmetry control |
| --- | --- | --- |
| 4th-moment anisotropy | 0.059 | 0.237 (6-direction cubic) |
| anisotropy, ultraviolet to infrared | 0.03 to under 0.02 (SO(4) restored) | stays large (flat lattice fails) |
| order to which the cone is round | killed to 6th order (F4) | only 4th order (lattice) |

The light cone is exactly `z = 1`, one dock per beat, far above the diffusive `sqrt(beats)`, so a finite speed of
light is built in before any physics. The massless dispersion is `omega = |k|` exactly, the massive one
`omega^2 - k^2 = m^2`, the cone is frame-independent, velocities add relativistically, and nothing exceeds `c`. A
real astrophysical test, the model's linear Lorentz violation parameter sits at about zero and PASSES the gamma-ray-
burst bound, while a naive flat lattice is EXCLUDED, and the residual ultraviolet violation scales as
`(E/E_Planck)^2`. Why it matters, the one thing every discrete model is supposed to be unable to do, recover special
relativity, is done with controls, and it survives the observation that kills flat lattices.

## The sharp missing ingredient, stated honestly

The bare single-charge conserved mode is DIFFUSIVE, dynamic exponent about `z = 2`. A relativistic massless particle
(photon, graviton, sound at `z = 1`) needs a SECOND conservation law, momentum or inertia, on top of charge. Time
quantization is fine (the rule is reversible with energy bounded below), the spatial gapless mode is the diffusive
one, and boosts in a moving frame are untested. This is the precise open hinge between the diffusive base and the
relativistic modes. Why it matters, the theory names exactly what is still needed for the massless particles, rather
than papering over it.

## Gravity, Newton's law by dimension

A force between masses falls off with distance at the rate the dimension dictates.

| space | force falloff | result |
| --- | --- | --- |
| 3D cusp | `1/r^2` (exponent -2 +/- 0.05) | Newtonian gravity, Green's function EXACTLY `1/(4 pi r)` |
| 4D bulk | `1/r^3` short-range | the extra dimension shows at short range, crossover at its size |
| 2D | `log r` | the lower-dimensional law |

The graviton appears as the linearized Einstein operator with 2 massless polarizations and a gauge residual under
1e-9, and the Benincasa-Dowker discrete d'Alembertian is positive and recovers the wave operator. The full nonlinear
Friedmann equation integrates forward (radiation slope 0.5, matter 2/3, with a deceleration-to-acceleration
transition that is integrated, not plugged in), and `Lambda = 3 H^2` (de Sitter). Einstein's equations arise as an
equation of state from horizon thermodynamics in the Jacobson sense. The curved-BULK full Einstein equation on
`{5,3,4}` is still OPEN. Why it matters, gravity's force law, its quantum (the graviton), and its field equation all
appear, with the honest mark that the fully curved case is unfinished.

## Black holes, Hawking radiation, and holography

Horizons behave thermodynamically. The surface gravity measured along rays matches the metric value to under 3
percent, an Unruh detector reads thermal (`F(E)/F(-E) = exp(-E/T)`), the temperature scales as `1/M`, and the Page
curve turns over. Entanglement entropy obeys the area law, `S = (c/6) ln(l)` with `c` about 1 for a massless field,
and on `{7,3}` the entropy follows the geodesic LOG law (Ryu-Takayanagi) where a flat `{6,3}` control gives a linear
law that fails, with a control that fails being the strong form of the test. Black-hole entropy scales as AREA
(`l^2`) not volume (`l^3`), the Bekenstein-Hawking law. The bulk-to-boundary map is a quantum error-correcting code
(HaPPY), the `[[5,1,3]]` code recovers from any 2-qubit erasure, code distance grows as `3^depth`, a damaged bulk
self reconstructs, the causal wedge holds, the threshold rises as the code grows, a spread bit survives erasure, and
a short bulk path joins distant boundary points. Why it matters, the entanglement law of quantum gravity and the
holographic dictionary, the deepest ideas in the field, hold on a discrete crystal with controls, and the
bulk-boundary code is literally how a self survives damage.

## Cosmology, why space is 3D and why there is matter

| result | finding | why it matters |
| --- | --- | --- |
| dimension selection | only `d = 3` gives stable closed orbits (`d = 2` precesses, apsidal angle off; `d >= 4` unstable) | answers why space is three-dimensional, only there do planets orbit |
| accelerating expansion | net-positive birth gives expansion 1.3-1.4 at `q = 0.3` versus 1.0 static at `q = 0` | dark-energy-like acceleration for free, from a growing crystal |
| baryogenesis | all THREE Sakharov conditions necessary (removing any gives zero asymmetry), freeze-out peak | why there is matter at all rather than mutual annihilation |
| inflation | slow-roll at `phi0 = 16`, `w` about -1, e-folds 64 (about `phi0^2/4`), graceful exit | the early rapid expansion, with a clean exit |
| no singularity | discreteness caps the curvature | no infinite-density Big-Bang singularity |
| rarity of life | the alive set is rare (under 20 percent high-integration, over 50 percent low churn), a thin film | life is a rare, threshold-gated thin film, mirroring the real cosmos |

The cosmological constant from `sqrt(volume)` fluctuations lands near the observed dark-energy magnitude under an
adopted scaling, an open result. Why it matters, three of the deepest cosmological questions, the dimension of space,
the existence of matter, and the absence of a singularity, get structural answers.

## Quantum mechanics from a deterministic base

| result | finding | why it matters |
| --- | --- | --- |
| Bell / CHSH | `CHSH = 2 sqrt 2` (2.83), the Tsirelson bound, from an exchange unitary, product control `<= 2` | a LOCAL DETERMINISTIC base reaching the quantum maximum local theories are barred from |
| Bell alignment | an aligned shared past buys violation (`S > 3.5`) at the SAME mutual information as a misaligned past (`< 1.5`) | the violation is about correlation structure, not extra information |
| Born rule | quadrature additivity FORCES the exponent `p = 2` (`p = 1, 3` fail), matching `|c|^2` to under 0.01 | quantum mechanics' one probabilistic axiom, derived not assumed |
| quantum walk | ballistic `v ~ t` (ratio 4.5) versus classical `sqrt(t)` (1.9), 5-plus interference maxima versus 1, norm to 1e-9 | genuine quantum spreading and interference from the rule |

The 2D causal-set Lorentzian path integral recovers a mean dimension near 3, reflection positivity is inconclusive
in the massive regime, and measurement/collapse is OPEN (the dynamics is semi-classical, with no explicit
measurement operator). Why it matters, the strangest features of quantum mechanics, nonlocal correlations at the
Tsirelson bound and the Born rule, come from a local deterministic substrate, with the measurement problem honestly
left open.

## Foundations, exactness, and the renormalization fixed point

The base conserves charge at EVERY coarse level, is exactly reversible (forward then inverse is the identity),
conserves momentum, has a `z = 1` light cone, and mints nothing. The emergent Laplacian is simultaneously LOCAL
(range 1) and bounded below (minimum eigenvalue at least -1e-6), resolving the locality-versus-boundedness trilemma,
and one operator gives all three sectors bounded below with a decaying Green's function and finite-speed radiation.
Block-spin coarse-graining reaches a fixed point, `tanh K' = tanh^2 K` to within 0.02, the coupling flows from
`K = 1.5` toward `K* = 0` with the dimension invariant, charge exact across 5 levels, the wave speed invariant to
about 15 percent. Criticality scans give density about `sqrt(arrow)` with a mean-field exponent `beta` of 0.45 to
0.55. The renormalized macro-rule agrees with the micro-rule at 0.8-plus only in the ordered regime (frustrated under
0.6), so emergence needs order. The substrate self-organizes into a universe-like regime that fills over 50 percent
of its parameter space (alive at `arrow = 0.1`, dead at 0), the no-designer, no-fine-tuning signature. Why it
matters, physics is consistent at every scale (the deep reason renormalization works), the universe-like behavior is
generic rather than tuned, and two clean-control results stand out as genuine novelties, the emergent renormalized
macro-rule (which beats a naive coarse-graining, with a frustrated control) and high integrated information for a
self versus near-zero for a random bag (with a control).

## Where to look (code and experiments)

- Spacetime: `relativity/isotropy-24dir`, `relativity/symmetry-restoration-3434`, `relativity/lorentz-violation`,
  `relativity/light-cone-3434`, `relativity/dirac-from-discrete`, `relativity/boost-invariance`,
  `relativity/boost-velocity-addition`, `relativity/predictions-vs-bounds`, `relativity/deterministic-wave`,
  `relativity/second-conservation-search`.
- Gravity and holography: `gravity/braneworld`, `gravity/s73-physics`, `gravity/discrete-graviton`,
  `gravity/graviton-from-action`, `gravity/nonlinear-einstein`, `gravity/analog-hawking`, `gravity/hawking`,
  `gravity/area-law`, `holography/ryu-takayanagi-73`, `holography/happy-code-534`, `holography/holographic-code-534`,
  `holography/holography-from-rule`, `holography/growing-code`.
- Cosmology: `cosmology/dimension-selection`, `cosmology/growth-expansion`, `cosmology/baryogenesis`,
  `cosmology/inflation`, `cosmology/singularity-resolution`, `cosmology/rarity-measures`,
  `cosmology/cosmological-constant`.
- Quantum: `quantum/entanglement-bell`, `quantum/born-rule`, `quantum/quantum-walk`, `quantum/bound-composite`,
  `quantum/path-integral`.
- Foundations and renormalization: `foundations/absolute-limits`, `foundations/conserved-dynamics`,
  `foundations/emergent`, `foundations/one-rule-all-sectors`, `foundations/auto-selection`,
  `foundations/design-signature`, `foundations/capstone`, `renormalization/coarse-graining-fixed-point`,
  `renormalization/coarse-graining-chain`, `renormalization/criticality-scan`, `renormalization/emergent-macro-rule`.