# Roadmap

What is left to build, as a living checklist. The testbed currently covers P1 to P69.
This tracks the work still ahead, grouped by area, with the nearest current result noted
where one exists. Checked items are done, unchecked are outstanding.

## Physics frontiers (the A rungs and deeper)

- [ ] **Fully-discrete graviton.** Take the second variation of the discrete
  Benincasa-Dowker action directly on a sprinkling, not the continuum operator. P24 gave
  the linearized Einstein operator in the continuum limit, this is the genuinely discrete
  version.
- [ ] **The nonlinear Einstein equation.** Beyond the linearized equation of P32. The
  full equation of motion from the discrete action, including the graviton
  self-interaction and the matter back-reaction.
- [ ] **The large-N free-energy crossing.** P12 measured the crossing at N up to 48 but
  the single-pair move could not extend chains at N = 64. Build a height-changing cluster
  move so the crossing converges at N = 64 and 128.
- [ ] **The Born-rule derivation.** P31 showed unitarity, interference, and a conserved
  Born probability, but did not derive WHY the probability is the squared amplitude. The
  derivation from the mesh (an envariance or Gleason-style argument) is open.
- [ ] **Hawking radiation.** P33 gave the black-hole area-law entropy. The temperature,
  particle creation at the horizon, and the information question are the next steps.
- [ ] **Chiral gauge theory.** P8 gave confinement, the index theorem, and the chiral
  condensate, but the Weyl-projected chiral gauge theory (hard in physics generally)
  remains.

## The Standard Model

- [ ] **Three generations.** Why three families, from the topology or representation
  structure of the mesh.
- [ ] **The mass hierarchy and Yukawa couplings.** The pattern of fermion masses.
- [ ] **The gauge group itself.** Deriving SU(3) x SU(2) x U(1) rather than putting it
  in by hand (P8, P25 used given groups).
- [ ] **Baryogenesis.** The matter-antimatter asymmetry.

## The substrate and the base

- [x] Non-random substrate (deterministic, Lorentz-safe): the sunflower, Halton, and the
  Margenstern tilings (P39, P40, P41, P45).
- [x] The unifying base: the Coxeter construction (P47), the parameter-free modular group
  (P48), and the full integer ladder in one program (P51).
- [ ] **Deterministic growth, not static placement.** P48 and P51 generate the base by a
  deterministic automaton, but as a static orbit. The eternal-growth version, where the
  automaton grows the universe forever and the geometry emerges from the growth, is the
  remaining piece.
- [x] **The dimension window** (P62): compact regular hyperbolic crystals (finite-celled
  honeycombs) exist only in spatial dimensions 2, 3, 4 (H^3 has 4, H^4 has 5, none above),
  reproducing the known classification, so the substrate dimension is a computed constraint,
  not an assumption.
- [x] **Dimension selection (why 3 of {2,3,4})** (P68): integrating gravitational orbits in d
  spatial dimensions shows only d=3 gives stable CLOSED orbits (the inverse-square law). d=2
  precesses, d>=4 is unstable. Of the {2,3,4} window (P62), three is uniquely selected,
  corroborated by Huygens clean-wave propagation (odd dimensions).
- [x] **Emergent spatial geometry from a pure growth rule** (P69): the spatial dimension read
  intrinsically from grown connectivity (shell growth in hops, no coordinates) matches the
  target unbiased for flat grids (2.00/2.97/3.90), fixing P38's bias, and a negatively-curved
  mesh reads exponential, so curvature emerges from the relations too.
- [ ] **3D addressed navigation.** The 3D analogue of the Fibonacci-tree routing of P42,
  on the dodecagrid.

## The interior (stage two, the wild face)

- [x] A structural model of freedom and choice (P43), and computational universality
  (P44), the basis for hosting any structure.
- [x] **Recursion, higher vibes** (P57, P58): a mesh coarse-grains to a higher vibe that is
  a derived aggregate of the micro-tones (no stored layer), and the higher level obeys the
  same signed-majority rule, an emergent renormalization fixed point, exactly on the
  integrated wholes (agreement to 1.00 on the larger domains). The integration threshold for
  being a higher vibe is the same threshold for obeying the emergent rule. See the
  higher-vibes-and-recursion spec.
- [ ] **Selves as attractors, fully.** P34 and P43 used stable attractors as selves. A
  dedicated study of their stability, basins, identity over time, and persistence.
- [x] **Integrated information** (P63): integration Phi (algebraic connectivity) picks out
  selves. A cohesive cell has high Phi, a random bag near zero, and a self is a local maximum
  (swapping members in or out lowers it), with the whole an integrated unity. The structural
  bridge to the unity-of-experience claim.
- [x] **Nested selves and the full tower** (P59, P60): a self made of selves (cells in a
  body), where a small wound heals (homeostasis) and a whole-cell flip persists as a new
  identity (autonomy), the body undisturbed throughout, and the full tower (vibes, cells,
  tissues, organs, systems, body) descending to one top with the same rule at every level.
- [x] **Subtle-layer urges** (P64): a two-scale mesh where a slow deep layer biases the fast
  surface through shared notes. Steering rises with coupling depth (none when uncoupled), and
  the deep layer reasserts its pattern after the surface is disordered. The urge as a real
  second layer, not an abstract field.
- [x] **Dreaming versus waking** (P65): one memory mesh in two regimes. Waking (external
  clamp) pins it to the one veridical stimulus pattern, dreaming (no clamp, internal rhythm)
  roams all stored memories. The only difference is whether the shared external constraint is
  imposed.
- [x] **Reincarnation as pattern persistence** (P66): a self survives 100% turnover of its
  material (Ship of Theseus) and reconstitutes from a seed after full dissolution. A self is a
  pattern, separable in principle from any particular substrate.
- [x] **Synchronicity** (P67): two subsystems with no link between them correlate when they
  share a deep ancestry (same memory landscape) under a common ambient rhythm, and stay
  uncorrelated when unrelated. Correlation from the shared past, not a present signal (as P7).

## Integration and the capstone

- [x] The committed model run end-to-end, one mesh and one rule (P34), and the signal
  sector from the rule itself (P37).
- [x] **One rule for all sectors in one simulation** (P55): the bosonic sectors (matter
  spectrum, static force, radiation) all come from one emergent operator on one mesh built
  by the one rule, in a single run. Folding the fermionic and non-abelian gauge sectors into
  the same single evolution is the remaining part.
- [x] **The full ladder with the model, eternally growing** (P56): the integer ladder
  grows without bound, stays Lorentz-safe at every stage, and the model runs on the growing
  substrate at every stage. Truly incremental growth (no rebuilding) is the remaining
  engineering step.

## Cosmology and contact with data

- [x] Dark energy (everpresent, dynamical, V^-0.5, P46), inflation (P30), the arrow and
  expansion (P13), dark matter mechanism (P18).
- [ ] **Structure formation and the primordial spectrum.** The CMB-scale density
  perturbations from the growth dynamics.
- [ ] **Sharper observational predictions.** Turn the swerve (P26) and Lorentz-safety
  (P27) into quantitative numbers against the latest bounds, beyond the order-of-magnitude
  contact of P35.

## Consolidation and publishing

- [ ] **Fold P10 to P51 into the paper.** The v4 paper covers through the earlier results.
  Add the substrate and base work (P37 to P51), the freedom-and-choice and universality
  results, and the integer-ladder synthesis.
- [x] **A short companion on the integer ladder** (note/the-universe-from-integers.md): the base built from the integers, for a wider audience.

## Hardening

- [x] **Larger-N runs and continuum-limit checks** (P52): the dimension estimate agrees
  with the continuum value to about one percent at all N, shrinking with N where there is
  room. Extending this to the action and the field-operator spectra is the remaining part.
- [x] **A coarse-graining fixed point** (P53): the dimension is invariant under repeated
  decimation, so the continuum dimension is a renormalization fixed point. Extending the
  fixed-point check to the action coupling is the remaining part.
- [ ] **Performance.** The heavier experiments (Wang-Landau, the 3D honeycomb, the
  spectra) are O(N^2) in the substrate and acceptable at current sizes, but a sparser
  representation and incremental updates would let them reach larger systems.

## See also

`note/the-model.md` (the model), `note/what-the-testbed-proves.md` (what the results do
and do not establish), `note/questions/readme.md` (the per-result status), and
`note/experiment/results/` (the findings).
