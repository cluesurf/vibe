<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <img src='https://github.com/cluesurf/vibe/blob/make/view/vibe.png?raw=true' height='256'/>
</p>

<h3 align='center'>Vibe Theory</h3>
<p align='center'>
  A Discrete Model of the Universe<br/>
  (WIP)
</p>

<br/>
<br/>
<br/>

## Introduction

`vibe-test` is a finite, discrete, reproducible simulator for testing
the
[open problems of Vibe Theory](https://github.com/cluesurf/vibe/tree/make/note/questions)
and the discrete-spacetime program. It generates a discrete substrate,
runs a local rule over it in discrete beats, and measures the emergent
physics, so each research question becomes a runnable measurement.

Everything is finite and seeded. Real numbers appear only as measured
outputs (sprinkling coordinates, eigenvalues), never as the base, in
keeping with the discreteness principle.

The
[companion papers](https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Pollard%2C%20Lance%22&l=list&p=1&s=10&sort=bestmatch)
are snapshots of a _work very much in progress_. Findings are tracked in
`note/experiment/results/` and the open problems in `note/questions/`.

[Here](https://cluesurf.substack.com/p/vibe-mesh) is a high-level
overview of how to imagine things in this system/model/framework.

## What is inside

- **substrate**: Poisson-sprinkled Minkowski and curved spacetime,
  regular lattices, `{p,q}` hyperbolic tilings with Fibonacci
  addressing, hyperbolic random graphs, classical sequential growth.
- **rule**: synchronous, asynchronous, reversible, rewriting, and gauge
  updates.
- **fields**: scalar (graph Laplacian), spinor (Kahler-Dirac and overlap
  fermions), vector (the U(1) and SU(2) gauge fields and the free
  photon), tensor (the graviton), plus the Higgs and its mass mechanism.
- **operator**: graph Laplacian, Kahler-Dirac and overlap, the
  gauge-covariant Dirac, the lattice Maxwell operator, the evolution
  Hamiltonian, and the gauge index.
- **measure**: dimension, distance, curvature, manifold-likeness,
  Lorentz isotropy, navigation, CHSH, locality, integration, Wilson
  loops, entanglement entropy, rotation curves.
- **dynamics**: the Benincasa-Dowker action, the correct uniform-measure
  sampler, Wang-Landau density of states, causal-set Monte Carlo,
  classical sequential growth, coarse graining, and the Wilson heat
  bath.
- **experiment**: one runnable script per open problem (P1 to P43), plus
  a scan runner and report writer.

## Defining the model

The committed model (see [note/the-model.md](note/the-model.md)) is written and read
at a glance with a small DSL ([code/model/vibe.ts](code/model/vibe.ts)). With no
options it IS the committed model, and one-word swaps express variants for comparison.

```
const model = vibe().size(1500).seed(1)   // the committed model
console.log(model.describe())              // print it at a glance
const world = model.build().run(40)        // build the mesh, run 40 beats
world.read()                               // emergent structures off the same mesh
```

`describe()` prints:

```
vibe model
  mesh      hyperbolic          random hyperbolic causal mesh, Lorentz-safe, degree ~10
  tone      ternary             {-1, 0, +1}, the felt quality of a vibe
  fill      ternary-symmetric   each note carries a ternary fill (a shared relational vibe)
  rule      signed-majority     next(v) = sign( sum over neighbours w of fill(v,w) * will(w) )
  schedule  asynchronous        local, neighbours only, no global clock
  growth    net-positive        eternal expansion by local birth
  size 1500, seed 1
```

Swapping `vibe().mesh('lattice')` gives Lorentz anisotropy 1.0 (a preferred frame)
versus 0.06 for the hyperbolic mesh, which is why the random hyperbolic mesh is the
committed choice.

## Quick start

```
pnpm install
pnpm test:sim                                   # known-answer tests
pnpm sim code/experiment/p3-study.ts            # the addressing-vs-Lorentz study
pnpm sim code/experiment/p7-bell.ts             # CHSH vs setting correlation
```

Each experiment is also a standalone script:
`npx tsx code/experiment/pN-*.ts`. Findings are tracked in
`note/experiment/results/`.

## Results

Final status of each open problem, from the latest run. Build state:
typecheck clean, 63 of 63 known-answer tests pass. P1 to P9 are the
conceptual core, P10 to P17 the next version, P18 to P22 the dark sector
and the field content, P23 to P25 the field operators derived from the
action and electroweak breaking, P26 to P30 the distinctive observational
predictions and cosmology, P31 to P33 the deep frontiers (the quantum
formalism, the Einstein equations, and black-hole entropy), P34 the
capstone (the committed model run end-to-end), P35 the contact with
data, P36 the model DSL, and P37 to P42 the deeper integration (the
signal sector from the rule itself, emergent spatial geometry, a family
of non-random substrates including the Margenstern hyperbolic tilings,
and exact addressed navigation on them), and P43 a structural model of
freedom and choice (determined yet self-authored and irreducible). The
model itself is specified in
[note/the-model.md](note/the-model.md) and constructed in
[code/model/vibe.ts](code/model/vibe.ts). Full detail in
[note/experiment/results/](note/experiment/results/) and
[note/questions/](note/questions/).

| Problem | What it tests                                    | Status                                                 | Key result                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1      | local rule with a bounded-below Hamiltonian      | resolved                                               | a trilemma for a CA's own log (local, bounded-below, propagating: pick two), resolved by the emergent-mesh Hamiltonian: the graph Laplacian is local (range 1), bounded below (spectrum from 0), and propagating (finite-speed lightcone) all at once                                                                                                        |
| P2      | a dynamics that favors manifold-like order       | solved at scale                                        | a correct uniform-measure sampler (validated vs exact enumeration) reaches the entropic regime and shows a first-order transition: the smeared action makes manifold spacetime a stable phase coexisting with the layered phase, holding sharply across N = 48 to 160. P12 then measures the free-energy crossing (beta-star about 0.14): the manifold phase DOMINATES above it |
| P3      | addressing versus Lorentz                        | candidate solved                                       | a connected hyperbolic random graph has exponential reach, anisotropy 0.07 (Lorentz-safe), and 100 percent backtracking navigability at once, and all three survive an eightfold mesh growth                                                                                                                                                                 |
| P4      | the monist spinor, spin from topology, chirality | validated                                              | Kahler-Dirac zero modes equal the Betti sum (disk 1, cylinder 2, torus 4), and the overlap operator threads Nielsen-Ninomiya (1 species, exact chiral symmetry, GW residual 6e-16)                                                                                                                                                                           |
| P5      | the Hauptvermutung (unique geometry)             | validated (empirical)                                  | recovered dimension 3.02 plus or minus 0.05, proper-time coefficient of variation 0.027, a proof is still open                                                                                                                                                                                                                                               |
| P6      | a computable 2D path integral                    | solved at scale                                        | the 2D specialisation of P2: with the correct uniform-measure sampler the 2D smeared action makes a stable manifold phase that is genuinely 2-dimensional (Myrheim-Meyer dimension 2.0 to 2.1 at N = 64 to 128)                                                                                                                                              |
| P7      | quantum statistics from a classical base         | quantified + precise                                   | determinism (monism) makes CHSH violation possible, and the currency is aligned bits not bits (1 bit gives S=4 aligned vs S=1 misaligned, refining Hall). From dynamics, in a natural mesh the violation decays with measurement separation, unlike separation-independent QM, the precise residual tension                                                  |
| P8      | gauge, fermion, confinement, index, condensate   | validated (A-C + index + Abelian and SU(2) condensate) | U(1) couples to the fermion, 3D SU(2) confines, the overlap index equals the gauge topological charge (lattice Atiyah-Singer), and in a dynamical gauge field (Abelian Schwinger AND non-Abelian SU(2)) a chiral condensate forms from the anomaly (zero free, nonzero gauged). The Weyl-projected chiral gauge theory remains open in physics               |
| P9      | the relationship of structure to experience      | boundary                                               | only the structural correlates (Markov blanket, integration) are measurable, by design                                                                                                                                                                                                                                                                       |
| P10     | the cosmological constant (dark energy)          | progress                                               | the smeared action's fluctuation shrinks with volume in 2D (everpresent-like, the right direction for dark energy). 4D needs the smeared kernel (P19)                                                                                                                                                                                                        |
| P11     | Lorentz invariance of the dynamics               | clarified                                              | rotational invariance emerges in the infrared on both the lattice and the random mesh (the lattice-field-theory fact). The clean substrate-level isotropy is P3, and discreteness threatens Lorentz only at the Planck scale                                                                                                                                 |
| P12     | the free-energy crossing (closes P2)             | measured                                               | Wang-Landau (1/t schedule) measures the density of states and gives a crossing beta-star about 0.14, roughly N-independent. The manifold (spacetime) phase DOMINATES the sum over histories above it, with the layered phase metastable                                                                                                                      |
| P13     | the arrow of time and cosmology                  | validated + demonstrated                               | the arrow is the monotone irreversible accumulation of relations. Expansion is demonstrated both from a de Sitter geometry and EMERGING from a pure local growth rule (rate = 1 + q, with a static control at q = 0)                                                                                                                                         |
| P14     | mass and the relativistic dispersion             | validated                                              | a mass term gives a spectral gap equal to m and the relativistic dispersion E^2 = p^2 + m^2 (massless light cone at m = 0)                                                                                                                                                                                                                                   |
| P15     | the entanglement area law (holography)           | validated                                              | the free-fermion ground state gives the 1D conformal log law (central charge c = 1) and a 2D area law (boundary beats volume), the signature behind black-hole entropy                                                                                                                                                                                       |
| P16     | the Newtonian limit (gravity)                    | validated                                              | the static potential (Green's function of the Laplacian) is confining in 1D, logarithmic in 2D, and Newtonian 1/r in 3D (R^2 0.997)                                                                                                                                                                                                                          |
| P17     | quantum coherence                                | validated                                              | a quantum walk spreads ballistically (width ~ t) while a classical walk diffuses (~ sqrt t), genuine interference emerging on the mesh                                                                                                                                                                                                                       |
| P18     | dark matter                                      | mechanism shown                                        | a nonlocal (infrared-enhanced) gravitational kinetic term flattens the rotation curve (outer/inner v^2 ratio 0.23 local versus 1.29 nonlocal), with no dark particle                                                                                                                                                                                         |
| P19     | dark energy in 4D                                | measured                                               | the 4D action-fluctuation scaling is measured. The sharp action has the fluctuation problem, the everpresent shrinking needs the 4D smeared kernel (already shown in 2D, P10)                                                                                                                                                                                |
| P20     | the photon                                       | validated                                              | the free U(1) gauge field is massless and gauge-invariant, with two transverse polarizations (a mass term gives a fixed gap)                                                                                                                                                                                                                                 |
| P21     | the graviton                                     | validated                                              | the geometry's propagating excitation is a massless spin-2 field with two transverse-traceless polarizations (a massive spin-2 has five)                                                                                                                                                                                                                     |
| P22     | the Higgs                                        | validated                                              | spontaneous symmetry breaking gives a nonzero vacuum value, and the photon eats the Goldstone mode and becomes massive with gap (g v)^2                                                                                                                                                                                                                      |
| P23     | the gauge operator from the action               | validated                                              | the Maxwell (photon) operator is the small-field limit of the Wilson gauge action (Wilson/Maxwell ratio converging to one), not put in by hand                                                                                                                                                                                                                |
| P24     | the graviton from the action                     | validated                                              | the linearized Einstein operator (second variation of the Einstein-Hilbert action) is diffeomorphism-invariant with exactly two massless spin-2 modes, no projector imposed                                                                                                                                                                                  |
| P25     | electroweak breaking                             | validated                                              | a Higgs doublet breaks SU(2) x U(1) to U(1)_EM, three bosons (W+, W-, Z) massive and the photon massless, reproducing the observed W (80) and Z (91) masses and the Weinberg angle                                                                                                                                                                            |
| P26     | swerves (observational)                          | demonstrated                                            | a particle on a causal set undergoes momentum diffusion (rapidity variance grows with proper time), a distinctive signature with no continuum analogue (cosmic rays, the dark sector)                                                                                                                                                                          |
| P27     | Lorentz violation (observational)                | distinctive                                            | a lattice has energy-dependent, directional Lorentz violation, but the random sprinkling is Lorentz-safe (isotropic, no preferred frame), so the framework predicts the observed null result                                                                                                                                                                  |
| P28     | singularity resolution                           | demonstrated                                            | discreteness gives a minimum causal length, so curvature (1/length^2) is capped at a finite value, no big-bang or black-hole infinity                                                                                                                                                                                                                         |
| P29     | dark energy in 4D (smeared)                      | progress                                               | the 4D smeared Benincasa-Dowker kernel tames the fluctuation (implied Lambda exponent from +0.16 to +0.06, the everpresent direction), the full shrinking needs the dynamical conjugate-volume model                                                                                                                                                          |
| P30     | inflation                                        | demonstrated                                            | a time-varying birth rate gives a burst of rapid expansion (4.2 e-folds) with a graceful exit to slow expansion, the inflationary profile from a local rule with no inflaton                                                                                                                                                                                   |
| P31     | the quantum formalism                            | down-payment                                           | unitarity (the Born probability is conserved), interference (amplitudes add, not probabilities), and a conserved Born rule, all present on the mesh. Deriving why the probability is |psi|^2 is open                                                                                                                                                            |
| P32     | the Einstein equations                           | down-payment                                           | the Einstein tensor is transverse (k . G = 0, energy-momentum conservation built in), reduces to Newton in the static limit, and propagates a massless graviton at the speed of light                                                                                                                                                                          |
| P33     | black-hole entropy                               | demonstrated                                            | the entanglement entropy of a region scales with its horizon AREA, not its volume, the Bekenstein-Hawking law S = A/4, with the entanglement across the horizon as its origin                                                                                                                                                                                  |
| P34     | capstone (the model run end-to-end)              | demonstrated                                            | one growing random hyperbolic mesh with the ternary signed-majority rule yields, all at once, Lorentz-safe geometry with exponential reach, convergent ternary dynamics, the bounded-below local emergent Hamiltonian, and the arrow of accumulation                                                                                                            |
| P35     | contact with data                                | meets observation                                       | the everpresent Lambda matches the observed dark energy to order of magnitude (predicted 1.5e-122 vs observed 2.9e-122 in Planck units), the framework predicts no linear Lorentz violation (confirmed by gamma-ray-burst timing), and the swerve sits below current bounds                                                                                     |
| P36     | the model DSL                                    | a tool                                                 | the committed model in a few fluent lines (vibe()...), printing at a glance, building, running, and reading off the physics, with a one-word swap to the lattice (Lorentz-violating) variant                                                                                                                                                                  |
| P37     | one rule, causal propagation                     | demonstrated                                            | the ternary rule itself carries a strict causal light-cone (one hop per beat) and local stability, so the signal sector is part of the one dynamics, not a separate operator                                                                                                                                                                                  |
| P38     | emergent spatial geometry                        | progress                                               | a coexisting slice has a definite spatial dimension below the spacetime dimension, rising by about one from 2D to 3D (the d-1 trend), with the absolute value biased low by finite size                                                                                                                                                                        |
| P39     | a non-random substrate                           | demonstrated                                            | the deterministic golden-angle hyperbolic sunflower is as Lorentz-safe as the random sprinkle (anisotropy 0.049 vs 0.070) with exponential reach and no randomness, the non-arbitrary optimum for spreading points with no preferred direction                                                                                                                 |
| P40     | non-random substrate family                      | demonstrated                                            | the sunflower, the Halton disc, and the regular {7,3} and {5,4} hyperbolic tilings are all Lorentz-safe (only the flat lattice is not), so curvature, not disorder, is what buys Lorentz safety                                                                                                                                                                |
| P41     | Margenstern tilings surveyed                     | demonstrated                                            | both Margenstern families, {p,4} (5,6,8) and {p,3} (7,8,9), are Lorentz-safe with exponential reach, a large family of deterministic, exactly-addressable substrates (with Fibonacci coordinates and known Turing-completeness)                                                                                                                                |
| P42     | Fibonacci-tree navigation                        | demonstrated                                            | routing by tree-address arithmetic on the heptagrid delivers every signal exactly (100 percent), locally, and efficiently (mean stretch 1.35, logarithmic hops), so the tilings are Lorentz-safe AND exactly addressable, solving P3 better than the random graph                                                                                              |
| P43     | freedom and choice                               | solved structurally                                    | a choice is determined (reproduces, not random) yet jointly authored by self and urge, self-authored with agency scaling by structure, and computationally irreducible (settles over beats, not one-step), so it is not random and not predetermined by any part                                                                                               |

Legend: **validated** means a stated prediction was confirmed by the
testbed. **measured** means a quantity that was previously only bounded
is now computed directly (P12, P19). **mechanism shown** means the
mechanism and its signature are demonstrated, the scale or full
phenomenology pending (P18). **candidate solved** means a working
substrate or mechanism was found and needs hardening. **quantified**
means the mechanism was turned into a measured curve. **progress** and
**clarified** mean partial or corrected understanding. **down-payment**
means a first rung on a deep problem (the quantum formalism, the Einstein
equations), with the full result honestly still ahead. **open** means
genuinely unsolved (a shared frontier with the literature). **boundary**
means outside what the simulator can decide.

## License

MIT. Open for science: use, modify, and build on it freely, with
attribution. See [LICENSE](LICENSE). The written results and figures are
shared under CC-BY-4.0 (attribution).

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
