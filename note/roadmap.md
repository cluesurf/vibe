# Roadmap

What is left to build, as a living checklist. The testbed currently covers P1 to P74.
This tracks the work still ahead, grouped by area, with the nearest current result noted
where one exists. Checked items are done, unchecked are outstanding.

## Physics frontiers (the A rungs and deeper)

- [x] **Fully-discrete graviton** (P73): the discrete linearized Einstein operator on a
  lattice is gauge-invariant (annihilates pure-gauge perturbations to 1e-16), massless (the
  dispersion runs through the origin), and spin-2 (two transverse-traceless polarizations).
  The second variation of the full action on a Poisson sprinkling (large fluctuations) remains.
- [x] **The nonlinear Einstein equation** (P72): in its cosmological (Friedmann) form the
  full nonlinear equation is satisfied. The exact FRW solutions obey Friedmann, acceleration,
  and conservation together to machine precision through the nonlinear Bianchi identity, and
  the nonlinearity is essential. The fully discrete strong-field interior solution remains.
- [x] **The large-N free-energy crossing** (P74): the height-changing cluster move (toggle an
  asserted relation, recompute the closure) sweeps 85 to 100 percent of the height range at
  N = 64 and 96, where the single-pair move stalled below 25 percent. The traversal that
  blocked P12 is solved. Driving a full Wang-Landau to a converged beta-star at N = 128 with
  this move is the remaining compute.
- [x] **The Born-rule derivation** (P70): counting (amplitude = sqrt density, fair sampling)
  and envariance both derive the squared amplitude, and uniform substrate sampling uniquely
  selects the exponent 2. Born is not a postulate but counting the substrate fairly.
- [x] **Hawking radiation** (P71): the across-horizon spectrum (trace out the interior of a
  squeezed vacuum) is thermal at T = kappa/2pi, the temperature scales as 1/M from the area
  law and the first law, and the radiation entropy follows a Page curve that turns over. The
  detailed microstate map behind the late-time return remains.
- [~] **Chiral gauge theory** (P77, partial). P8 gave confinement, the index theorem, and
  the chiral condensate. P77 shows the fermion-doubling obstruction (2^d species, net
  chirality zero) and its vector-theory resolution (a Wilson term leaves one species). The
  Weyl-projected chiral gauge theory (hard in physics generally) is marked open, not claimed.

## The Standard Model

- [x] **Charge quantization** (P79). Anomaly freedom (the index-theorem consistency the
  substrate already requires) plus gauge-invariant masses fixes one generation's hypercharges
  uniquely to the Standard Model values, the unused cubic and color anomalies cancel on their
  own, and electric charges come out quantized in thirds with neutral atoms. Assumes the gauge
  group and representation content.
- [~] **The mass hierarchy and Yukawa couplings** (P81, structural). Exponential overlap on a
  hyperbolic substrate turns evenly spaced modes into an exponentially spread mass spectrum,
  reproducing the observed 5.5-decade charged-fermion range where a flat power law gives 2.3.
  The mechanism is shown. The specific masses are open.
- [x] **Baryogenesis** (P80, structural). The substrate supplies all three Sakharov conditions
  (B violation from growth, CP from directed notes, out-of-equilibrium from eternal growth). A
  matter excess builds up and removing any one erases it. The observed magnitude is open.
- [ ] **Three generations.** Why three families, from the topology or representation
  structure of the mesh. Open. The candidate routes (a topological count, the 3D dimension
  derived in P62/P68, the ternary base) are suggestive but none yet forces the count.
- [ ] **The gauge group itself.** Deriving SU(3) x SU(2) x U(1) rather than putting it
  in by hand (P8, P25, P79 used given groups). Open.

## The substrate and the base

- [x] Non-random substrate (deterministic, Lorentz-safe): the sunflower, Halton, and the
  Margenstern tilings (P39, P40, P41, P45).
- [x] The unifying base: the Coxeter construction (P47), the parameter-free modular group
  (P48), and the full integer ladder in one program (P51).
- [x] **Deterministic growth, not static placement** (P83). The base now grows one cell at a
  time at the frontier by a deterministic rule, append-only (the interior frozen as the past),
  resumable forever with no rebuild (chunked growth equals one shot), faithful to the static
  tiling ring for ring, and the hyperbolic ball-growth ratio emerges on its own at the
  pentagrid's golden-ratio law (2.6186 vs 2.6180).
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
- [x] **3D addressed navigation** (P76). Greedy routing on the hyperbolic address delivers
  100 percent of pairs at stretch 1.00 on the dodecagrid {5,3,4}, the 3D analogue of P42.

## The interior (stage two, the wild face)

- [x] A structural model of freedom and choice (P43), and computational universality
  (P44), the basis for hosting any structure.
- [x] **Recursion, higher vibes** (P57, P58): a mesh coarse-grains to a higher vibe that is
  a derived aggregate of the micro-tones (no stored layer), and the higher level obeys the
  same signed-majority rule, an emergent renormalization fixed point, exactly on the
  integrated wholes (agreement to 1.00 on the larger domains). The integration threshold for
  being a higher vibe is the same threshold for obeying the emergent rule. See the
  higher-vibes-and-recursion spec.
- [x] **Selves as attractors, fully** (P75). A self recovers from perturbations within a 40
  percent basin, keeps its identity over time (overlap 1.000), and a mesh holds several selves
  with capacity growing with size (18 at N=120, 26 at N=240).
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
- [~] **Structure formation and the primordial spectrum** (P78, first step). The substrate
  gives a clean scale-free Poisson density seed (contrast scales as count^-0.509, the
  one-over-root-volume law). The observed spectral tilt and gravitational growth remain open.
- [x] **Sharper observational predictions** (P82). The swerve (P26) and Lorentz-safety
  (P27) turned into numbers against the latest bounds. The model predicts zero first-order
  Lorentz violation, passing the Fermi-LAT GRB 090510 bound (xi1 < 0.132) that excludes a
  lattice (anisotropy ~1.12), passes the quadratic bound, and the swerve vanishes as the
  discreteness fines (rate ~ density^-1.61). A confirmed first-order energy-dependent photon
  speed would falsify it.

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
