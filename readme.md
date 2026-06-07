<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <img src='https://github.com/cluesurf/vibe/blob/make/view/vibe-mesh-{7,3}.png?raw=true' height='256'/>
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

Vibe Theory treats reality as one thing: a vast, growing crystal of
experience. The image above is its simplest face, the hyperbolic `{7,3}`
tessellation, and it is meant literally. Each tile is a **vibe**, the
smallest unit of experience. Each vibe carries a ternary **tone**, its
felt charge, shown as a color: **red is pain, green is peace, blue is
pleasure**. Tiles that touch are vibes that **note** (experience) one
another, so the edges of the crystal are the relations of the mesh.
There is nothing else in the model but this.

To hold it at a glance: a single tile is one quantum of experience, a
patch of tiles is a thing or a mind, and the whole crystal is the
universe, growing forever at its ever-receding edge (the present). The
geometry is hyperbolic because that is the shape that is roomy enough to
grow without end and has no preferred direction, so it respects
relativity. Everything we call physical, space and time and matter and
force and gravity, and everything we call inner, sensation and emotion
and thought, is a large-scale pattern in this one colored, growing mesh
of feeling.

For the framework itself see the
[companion papers](https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Pollard%2C%20Lance%22&l=list&p=1&s=10&sort=bestmatch)
and a high-level [overview](https://cluesurf.substack.com/p/vibe-mesh).
The precise model is specified in
[note/the-model.md](note/the-model.md).

## What this repo is

`@cluesurf/vibe` is a finite, discrete, reproducible simulator that
turns the theory into runnable measurements. It is the bench where the
model is built, stress-tested, and checked against known physics. It
generates the discrete substrate (the mesh), runs the one local rule
over it in discrete beats, and measures what emerges, so each
[open problem of the theory](https://github.com/cluesurf/vibe/tree/make/note/questions)
becomes a concrete experiment that either works or does not.

Everything is finite and seeded, so every result is exactly
reproducible. Real numbers appear only as measured outputs (coordinates,
eigenvalues, dimensions), never as the base, in keeping with the
discreteness principle. Each numbered problem below (P1, P2, and so on)
is one such experiment, with its code in `code/experiment/`, its finding
in `note/experiment/results/`, and its status in `note/questions/`.

The goal is practical and honest: to find out whether this crystal model
can actually reproduce our universe, by deriving space, matter, gravity,
the quantum, cosmology, and mind from the one rule, and to be clear at
every step about what is solid, what is partial, and what is still open.
The companion papers are snapshots of a _work very much in progress_.

## Results

Final status of each open problem, from the latest run. Build state:
typecheck clean, 89 of 89 known-answer tests pass.

The arc runs bottom-up. P1 to P9 are the conceptual core, and P10 to P17
the next version. P18 to P22 cover the dark sector and the field
content, P23 to P25 the field operators derived from the action and
electroweak breaking, and P26 to P30 the distinctive observational
predictions and cosmology.

P31 to P33 are the deep frontiers (the quantum formalism, the Einstein
equations, and black-hole entropy). P34 is the capstone (the committed
model run end to end), P35 the contact with data, and P36 the model DSL.

P37 to P42 are the deeper integration (the signal sector from the rule
itself, emergent spatial geometry, a family of non-random substrates
including the Margenstern hyperbolic tilings, and exact addressed
navigation on them). P43 is a structural model of freedom and choice,
P44 computational universality (the rule is Turing-complete), P45 the 3D
dodecagrid hyperbolic honeycomb, and P46 the dynamical everpresent
cosmological constant.

P47 to P51 are the unifying base (the Coxeter construction, the
parameter-free modular group, the hidden hierarchical crystal, the
golden ratio with order-and-freedom, and the full integer ladder built
end to end). P52 to P54 are hardening (the continuum limit, a
coarse-graining fixed point, and large-N scaling), and P55 to P56 the
integration capstone (all bosonic sectors from one operator on one mesh,
and the integer ladder eternally growing with the model on it).

P57 to P67 build the interior. P57 to P58 are recursion (higher vibes as
aggregate views of the micro-tones, self-similar with no stored higher
layer, the macro-rule an emergent renormalization fixed point). P59 to
P60 are the nested selves (cells in a body, homeostasis and autonomy)
and the full tower of selves. P61 is the no-complete-self-storage
principle (the world models itself only in lossy summary, so no infinite
mirror). P63 to P67 cover integration Phi picking out selves, the subtle
layer steering the surface as a real urge, waking versus dreaming,
reincarnation as pattern persistence, and synchronicity from shared deep
ancestry.

P62 and P68 to P69 settle the spatial dimension: compact hyperbolic
crystals exist only in dimensions 2 to 4 (so the dimension is
constrained, not assumed), three is selected by stable closed orbits,
and the spatial dimension emerges unbiased from pure grown connectivity.

The model itself is specified in [note/the-model.md](note/the-model.md)
and constructed in [code/model/vibe.ts](code/model/vibe.ts). Full detail
in [note/experiment/results/](note/experiment/results/) and
[note/questions/](note/questions/).

| Problem | What it tests                                    | Status                                                 | Key result                                                                                                                                                                                                                                                                                                                                                                      |
| ------- | ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1      | local rule with a bounded-below Hamiltonian      | resolved                                               | a trilemma for a CA's own log (local, bounded-below, propagating: pick two), resolved by the emergent-mesh Hamiltonian: the graph Laplacian is local (range 1), bounded below (spectrum from 0), and propagating (finite-speed lightcone) all at once                                                                                                                           |
| P2      | a dynamics that favors manifold-like order       | solved at scale                                        | a correct uniform-measure sampler (validated vs exact enumeration) reaches the entropic regime and shows a first-order transition: the smeared action makes manifold spacetime a stable phase coexisting with the layered phase, holding sharply across N = 48 to 160. P12 then measures the free-energy crossing (beta-star about 0.14): the manifold phase DOMINATES above it |
| P3      | addressing versus Lorentz                        | candidate solved                                       | a connected hyperbolic random graph has exponential reach, anisotropy 0.07 (Lorentz-safe), and 100 percent backtracking navigability at once, and all three survive an eightfold mesh growth                                                                                                                                                                                    |
| P4      | the monist spinor, spin from topology, chirality | validated                                              | Kahler-Dirac zero modes equal the Betti sum (disk 1, cylinder 2, torus 4), and the overlap operator threads Nielsen-Ninomiya (1 species, exact chiral symmetry, GW residual 6e-16)                                                                                                                                                                                              |
| P5      | the Hauptvermutung (unique geometry)             | validated (empirical)                                  | recovered dimension 3.02 plus or minus 0.05, proper-time coefficient of variation 0.027, a proof is still open                                                                                                                                                                                                                                                                  |
| P6      | a computable 2D path integral                    | solved at scale                                        | the 2D specialisation of P2: with the correct uniform-measure sampler the 2D smeared action makes a stable manifold phase that is genuinely 2-dimensional (Myrheim-Meyer dimension 2.0 to 2.1 at N = 64 to 128)                                                                                                                                                                 |
| P7      | quantum statistics from a classical base         | quantified + precise                                   | determinism (monism) makes CHSH violation possible, and the currency is aligned bits not bits (1 bit gives S=4 aligned vs S=1 misaligned, refining Hall). From dynamics, in a natural mesh the violation decays with measurement separation, unlike separation-independent QM, the precise residual tension                                                                     |
| P8      | gauge, fermion, confinement, index, condensate   | validated (A-C + index + Abelian and SU(2) condensate) | U(1) couples to the fermion, 3D SU(2) confines, the overlap index equals the gauge topological charge (lattice Atiyah-Singer), and in a dynamical gauge field (Abelian Schwinger AND non-Abelian SU(2)) a chiral condensate forms from the anomaly (zero free, nonzero gauged). The Weyl-projected chiral gauge theory remains open in physics                                  |
| P9      | the relationship of structure to experience      | boundary                                               | only the structural correlates (Markov blanket, integration) are measurable, by design                                                                                                                                                                                                                                                                                          |
| P10     | the cosmological constant (dark energy)          | progress                                               | the smeared action's fluctuation shrinks with volume in 2D (everpresent-like, the right direction for dark energy). 4D needs the smeared kernel (P19)                                                                                                                                                                                                                           |
| P11     | Lorentz invariance of the dynamics               | clarified                                              | rotational invariance emerges in the infrared on both the lattice and the random mesh (the lattice-field-theory fact). The clean substrate-level isotropy is P3, and discreteness threatens Lorentz only at the Planck scale                                                                                                                                                    |
| P12     | the free-energy crossing (closes P2)             | measured                                               | Wang-Landau (1/t schedule) measures the density of states and gives a crossing beta-star about 0.14, roughly N-independent. The manifold (spacetime) phase DOMINATES the sum over histories above it, with the layered phase metastable                                                                                                                                         |
| P13     | the arrow of time and cosmology                  | validated + demonstrated                               | the arrow is the monotone irreversible accumulation of relations. Expansion is demonstrated both from a de Sitter geometry and EMERGING from a pure local growth rule (rate = 1 + q, with a static control at q = 0)                                                                                                                                                            |
| P14     | mass and the relativistic dispersion             | validated                                              | a mass term gives a spectral gap equal to m and the relativistic dispersion E^2 = p^2 + m^2 (massless light cone at m = 0)                                                                                                                                                                                                                                                      |
| P15     | the entanglement area law (holography)           | validated                                              | the free-fermion ground state gives the 1D conformal log law (central charge c = 1) and a 2D area law (boundary beats volume), the signature behind black-hole entropy                                                                                                                                                                                                          |
| P16     | the Newtonian limit (gravity)                    | validated                                              | the static potential (Green's function of the Laplacian) is confining in 1D, logarithmic in 2D, and Newtonian 1/r in 3D (R^2 0.997)                                                                                                                                                                                                                                             |
| P17     | quantum coherence                                | validated                                              | a quantum walk spreads ballistically (width ~ t) while a classical walk diffuses (~ sqrt t), genuine interference emerging on the mesh                                                                                                                                                                                                                                          |
| P18     | dark matter                                      | mechanism shown                                        | a nonlocal (infrared-enhanced) gravitational kinetic term flattens the rotation curve (outer/inner v^2 ratio 0.23 local versus 1.29 nonlocal), with no dark particle                                                                                                                                                                                                            |
| P19     | dark energy in 4D                                | measured                                               | the 4D action-fluctuation scaling is measured. The sharp action has the fluctuation problem, the everpresent shrinking needs the 4D smeared kernel (already shown in 2D, P10)                                                                                                                                                                                                   |
| P20     | the photon                                       | validated                                              | the free U(1) gauge field is massless and gauge-invariant, with two transverse polarizations (a mass term gives a fixed gap)                                                                                                                                                                                                                                                    |
| P21     | the graviton                                     | validated                                              | the geometry's propagating excitation is a massless spin-2 field with two transverse-traceless polarizations (a massive spin-2 has five)                                                                                                                                                                                                                                        |
| P22     | the Higgs                                        | validated                                              | spontaneous symmetry breaking gives a nonzero vacuum value, and the photon eats the Goldstone mode and becomes massive with gap (g v)^2                                                                                                                                                                                                                                         |
| P23     | the gauge operator from the action               | validated                                              | the Maxwell (photon) operator is the small-field limit of the Wilson gauge action (Wilson/Maxwell ratio converging to one), not put in by hand                                                                                                                                                                                                                                  |
| P24     | the graviton from the action                     | validated                                              | the linearized Einstein operator (second variation of the Einstein-Hilbert action) is diffeomorphism-invariant with exactly two massless spin-2 modes, no projector imposed                                                                                                                                                                                                     |
| P25     | electroweak breaking                             | validated                                              | a Higgs doublet breaks SU(2) x U(1) to U(1)\_EM, three bosons (W+, W-, Z) massive and the photon massless, reproducing the observed W (80) and Z (91) masses and the Weinberg angle                                                                                                                                                                                             |
| P26     | swerves (observational)                          | demonstrated                                           | a particle on a causal set undergoes momentum diffusion (rapidity variance grows with proper time), a distinctive signature with no continuum analogue (cosmic rays, the dark sector)                                                                                                                                                                                           |
| P27     | Lorentz violation (observational)                | distinctive                                            | a lattice has energy-dependent, directional Lorentz violation, but the random sprinkling is Lorentz-safe (isotropic, no preferred frame), so the framework predicts the observed null result                                                                                                                                                                                    |
| P28     | singularity resolution                           | demonstrated                                           | discreteness gives a minimum causal length, so curvature (1/length^2) is capped at a finite value, no big-bang or black-hole infinity                                                                                                                                                                                                                                           |
| P29     | dark energy in 4D (smeared)                      | progress                                               | the 4D smeared Benincasa-Dowker kernel tames the fluctuation (implied Lambda exponent from +0.16 to +0.06, the everpresent direction), the full shrinking needs the dynamical conjugate-volume model                                                                                                                                                                            |
| P30     | inflation                                        | demonstrated                                           | a time-varying birth rate gives a burst of rapid expansion (4.2 e-folds) with a graceful exit to slow expansion, the inflationary profile from a local rule with no inflaton                                                                                                                                                                                                    |
| P31     | the quantum formalism                            | down-payment                                           | unitarity (the Born probability is conserved), interference (amplitudes add, not probabilities), and a conserved Born rule, all present on the mesh. Deriving why the probability is                                                                                                                                                                                            |
| P32     | the Einstein equations                           | down-payment                                           | the Einstein tensor is transverse (k . G = 0, energy-momentum conservation built in), reduces to Newton in the static limit, and propagates a massless graviton at the speed of light                                                                                                                                                                                           |
| P33     | black-hole entropy                               | demonstrated                                           | the entanglement entropy of a region scales with its horizon AREA, not its volume, the Bekenstein-Hawking law S = A/4, with the entanglement across the horizon as its origin                                                                                                                                                                                                   |
| P34     | capstone (the model run end-to-end)              | demonstrated                                           | one growing random hyperbolic mesh with the ternary signed-majority rule yields, all at once, Lorentz-safe geometry with exponential reach, convergent ternary dynamics, the bounded-below local emergent Hamiltonian, and the arrow of accumulation                                                                                                                            |
| P35     | contact with data                                | meets observation                                      | the everpresent Lambda matches the observed dark energy to order of magnitude (predicted 1.5e-122 vs observed 2.9e-122 in Planck units), the framework predicts no linear Lorentz violation (confirmed by gamma-ray-burst timing), and the swerve sits below current bounds                                                                                                     |
| P36     | the model DSL                                    | a tool                                                 | the committed model in a few fluent lines (vibe()...), printing at a glance, building, running, and reading off the physics, with a one-word swap to the lattice (Lorentz-violating) variant                                                                                                                                                                                    |
| P37     | one rule, causal propagation                     | demonstrated                                           | the ternary rule itself carries a strict causal light-cone (one hop per beat) and local stability, so the signal sector is part of the one dynamics, not a separate operator                                                                                                                                                                                                    |
| P38     | emergent spatial geometry                        | progress                                               | a coexisting slice has a definite spatial dimension below the spacetime dimension, rising by about one from 2D to 3D (the d-1 trend), with the absolute value biased low by finite size                                                                                                                                                                                         |
| P39     | a non-random substrate                           | demonstrated                                           | the deterministic golden-angle hyperbolic sunflower is as Lorentz-safe as the random sprinkle (anisotropy 0.049 vs 0.070) with exponential reach and no randomness, the non-arbitrary optimum for spreading points with no preferred direction                                                                                                                                  |
| P40     | non-random substrate family                      | demonstrated                                           | the sunflower, the Halton disc, and the regular {7,3} and {5,4} hyperbolic tilings are all Lorentz-safe (only the flat lattice is not), so curvature, not disorder, is what buys Lorentz safety                                                                                                                                                                                 |
| P41     | Margenstern tilings surveyed                     | demonstrated                                           | both Margenstern families, {p,4} (5,6,8) and {p,3} (7,8,9), are Lorentz-safe with exponential reach, a large family of deterministic, exactly-addressable substrates (with Fibonacci coordinates and known Turing-completeness)                                                                                                                                                 |
| P42     | Fibonacci-tree navigation                        | demonstrated                                           | routing by tree-address arithmetic on the heptagrid delivers every signal exactly (100 percent), locally, and efficiently (mean stretch 1.35, logarithmic hops), so the tilings are Lorentz-safe AND exactly addressable, solving P3 better than the random graph                                                                                                               |
| P43     | freedom and choice                               | solved structurally                                    | a choice is determined (reproduces, not random) yet jointly authored by self and urge, self-authored with agency scaling by structure, and computationally irreducible (settles over beats, not one-step), so it is not random and not predetermined by any part                                                                                                                |
| P44     | computational universality                       | demonstrated                                           | the signed-majority rule realizes NAND (functionally complete), builds a correct full adder, and expresses the universal Rule 110, so with the addressable tilings (P42) the substrate is Turing-complete, able to host any computable structure                                                                                                                                |
| P45     | dodecagrid {5,3,4} (3D honeycomb)                | demonstrated                                           | Margenstern's 3D hyperbolic honeycomb of right-angled dodecahedra is Lorentz-safe (anisotropy 0.075) with exponential reach, while a flat cubic lattice is not, so curvature scrambles direction in 3D too                                                                                                                                                                      |
| P46     | dynamical everpresent Lambda                     | solved                                                 | the conjugate-volume model gives delta-Lambda ~ V^-0.5 (the everpresent shrinking, exact), closing the dark-energy direction the static action only approached, and at the observed volume it gives the measured 10^-122                                                                                                                                                        |
| P47     | Coxeter unification                              | demonstrated                                           | {7,3}, {5,4}, {8,3}, {6,4}, and {5,3,4} all come from one generator by changing the Schlafli symbol, all Lorentz-safe, so the base is the reflection-group principle, not a chosen tiling                                                                                                                                                                                       |
| P48     | the modular base                                 | demonstrated                                           | the parameter-free modular group PSL(2,Z) tessellation is Lorentz-safe, generated by the deterministic Stern-Brocot automaton, addressed by continued fractions, with the golden ratio as its central geodesic, the base built from the integers                                                                                                                                |
| P49     | crystal hidden and hierarchical                  | demonstrated                                           | a hyperbolic crystal is indistinguishable from a random foam by a local observer (both unlike a flat lattice) and is tree-like (Gromov delta 1.5 vs 19.0), so order at the base is undetectable from inside and natively hierarchical                                                                                                                                           |
| P50     | golden ratio and order-with-freedom              | demonstrated                                           | the golden ratio agrees from three independent sources (continued fraction, Fibonacci, pentagon geometry), and the ordered crystal dynamics is determined yet computationally irreducible, reconciling order and freedom                                                                                                                                                        |
| P51     | the full integer ladder                          | demonstrated                                           | one pipeline builds the canonical base end to end, from integer generator data through a deterministic automaton to the tessellation to the vibe model running on it (Lorentz-safe, reproducible), for the modular group and the {7,3} and {5,4} crystals                                                                                                                       |
| P52     | the continuum limit                              | demonstrated                                           | the dimension estimate agrees with the continuum value to about one percent at all N (2D and 3D), shrinking as a negative power of N where there is room, so the discrete model sits at its continuum description                                                                                                                                                               |
| P53     | coarse-graining fixed point                      | demonstrated                                           | the dimension is invariant under repeated decimation, so the continuum dimension is a renormalization fixed point, the discrete model has one stable continuum description at every scale                                                                                                                                                                                       |
| P54     | large-N hardening (performance)                  | demonstrated                                           | a sampled O(N) dimension estimator agrees with the exact O(N^2) one and reaches N = 100000, where the continuum-limit error keeps shrinking, so larger systems are reachable and the continuum claim is hardened at scale                                                                                                                                                       |
| P55     | one rule, all sectors                            | demonstrated (bosonic)                                 | one mesh built by the committed rule, and the single emergent operator on it, yield the matter (spectrum), force (static potential), and radiation (light-cone) sectors in one run, the fermionic and gauge sectors being the remaining integration                                                                                                                             |
| P56     | the eternal ladder                               | demonstrated                                           | the integer ladder grows without bound (modular and {7,3}), stays Lorentz-safe at every stage, and the committed model runs on the growing substrate at every stage, the full tower from the integers up, eternally growing                                                                                                                                                     |
| P57     | recursion (higher vibes)                         | demonstrated (structural)                              | a mesh coarse-grains to a higher vibe that is a derived aggregate of the micro-tones (no stored layer), the same kind of object (ternary, Lorentz-safe), stable because the micro-self is, towering to another level. The emergent macro-rule is partial, the open frontier                                                                                                     |
| P58     | emergent macro-rule                              | solved                                                 | coarse-graining along the coherent domains (integrated wholes), the renormalized macro-rule (real couplings plus self-coupling) has the coarse-grained self as a fixed point, agreement climbing to 1.00 on the larger higher-vibe domains (vs 0.47 for arbitrary blocks), a renormalization fixed point exactly on the integrated wholes                                       |
| P59     | nested selves                                    | solved                                                 | on a modular mesh, a small wound inside a cell heals (homeostasis, 1.00), a whole-cell flip persists as a new identity (autonomy, 0.00 return), and the rest of the body is undisturbed (1.00), a self made of selves (cells in a body)                                                                                                                                         |
| P60     | tower of selves                                  | solved                                                 | a recursively modular mesh descends cells to tissues to organs to systems to body (81/27/9/3/1, dividing by the branching factor), the same emergent rule holding at every level, the fractal of wholes-within-wholes                                                                                                                                                           |
| P61     | no complete self-storage                         | solved                                                 | reconstruction fidelity reaches 1 only with no compression (a model as big as the whole), so a complete self-record cannot fit inside the thing it records, and the nested regress of lossy self-models converges (finite) while full copies diverge (the infinite mirror), so self-representation is necessarily lossy                                                         |
| P62     | dimension window                                 | solved                                                 | enumerating compact regular hyperbolic honeycombs (finite-celled crystals) reproduces the known classification (H^3 has 4, H^4 has 5) and shows they exist only in dimensions 2, 3, 4, vanishing at 5 and above, so the crystal substrate dimension is a computed constraint, not an assumption                                                                                 |
| P63     | integrated information                           | solved                                                 | integration Phi (algebraic connectivity) picks out selves: a cohesive cell has high Phi, a random bag near zero, and a self is a local maximum (swapping members in or out lowers it), with the whole an integrated unity, the bridge to the unity-of-experience claim                                                                                                          |
| P64     | subtle-layer urges                               | solved                                                 | a two-scale mesh where a slow deep layer biases the fast surface, steering rising with coupling depth (none when uncoupled) and the deep layer reasserting its pattern after the surface is disordered (99%), the urge as a real second layer not an abstract field                                                                                                             |
| P65     | dreaming and waking                              | solved                                                 | one memory mesh in two regimes: waking (external clamp) pins it to the one veridical stimulus pattern, dreaming (no clamp, internal rhythm) roams all stored memories, the only difference being whether the shared external constraint is imposed                                                                                                                              |
| P66     | reincarnation (pattern persistence)              | solved                                                 | a self (a stored attractor) survives 100% turnover of its material (Ship of Theseus) and reconstitutes from a seed after full dissolution into noise, a self being a pattern separable in principle from any particular substrate                                                                                                                                               |
| P67     | synchronicity                                    | solved                                                 | two subsystems with no link between them correlate (100%) when they share a deep ancestry (same memory landscape) under a common ambient rhythm, and stay uncorrelated (11%) when unrelated, the correlation coming from the shared past not a present signal (as in the Bell result P7)                                                                                        |
| P68     | dimension selection                              | solved                                                 | integrating gravitational orbits in d spatial dimensions shows only d=3 gives stable CLOSED orbits (inverse-square law), d=2 precesses and d>=4 is unstable, so of the allowed window {2,3,4} three is uniquely selected (corroborated by Huygens clean waves)                                                                                                                  |
| P69     | emergent dimension (pure growth)                 | solved                                                 | the spatial dimension read intrinsically from grown connectivity (shell growth in hops, no coordinates) matches the target unbiased for flat grids (2.00/2.97/3.90), fixing the P38 bias, and a negatively-curved mesh reads exponential, so curvature emerges from the relations too                                                                                           |

Legend: **validated** means a stated prediction was confirmed by the
testbed. **measured** means a quantity that was previously only bounded
is now computed directly (P12, P19). **mechanism shown** means the
mechanism and its signature are demonstrated, the scale or full
phenomenology pending (P18). **candidate solved** means a working
substrate or mechanism was found and needs hardening. **quantified**
means the mechanism was turned into a measured curve. **progress** and
**clarified** mean partial or corrected understanding. **down-payment**
means a first rung on a deep problem (the quantum formalism, the
Einstein equations), with the full result honestly still ahead. **open**
means genuinely unsolved (a shared frontier with the literature).
**boundary** means outside what the simulator can decide.

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

## Defining the model

The committed model (see [note/the-model.md](note/the-model.md)) is
written and read at a glance with a small DSL
([code/model/vibe.ts](code/model/vibe.ts)). With no options it IS the
committed model, and one-word swaps express variants for comparison.

```ts
const model = vibe().size(1500).seed(1) // the committed model
console.log(model.describe()) // print it at a glance
const world = model.build().run(40) // build the mesh, run 40 beats
world.read() // emergent structures off the same mesh
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

Swapping `vibe().mesh('lattice')` gives Lorentz anisotropy 1.0 (a
preferred frame) versus 0.06 for the hyperbolic mesh, which is why the
random hyperbolic mesh is the committed choice.

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
- **experiment**: one runnable script per open problem (P1 to P69), plus
  a scan runner and report writer.

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
