# Vibe Theory — complete experiment findings ledger

Every confirmed / negative / open result across all 461 experiments (18 categories), organized by paper part, with the real numbers and a "why it matters" on the headliners. This is the bible for writing the body. Cite `\cite{pollard2026vibetest}` on each. Raw per-reader transcripts preserved under the task outputs and `findings-raw/` as backup.

Counts: selves 119, gauge 39, spin 31, relativity 31, substrate-survey 30, data-structure 28, cosmology 27, foundations 25, geometry 23, quantum 22, gravity 21, holography 17, associative 16, renormalization 14, computation 10, addressing 7.

Legend: [+] positive, [-] honest negative, [o] open/partial.

---

## A. GEOMETRY & SUBSTRATE (substrate-survey, geometry, addressing)

**Curvature, dimension, selection**
- [+] compact regular hyperbolic honeycombs exist ONLY in dim 2,3,4 (H2 many, H3 4, H4 5, H5+ 0). *Why: the whole construction is possible in just a few dimensions, and 4 is the top.*
- [+] regular polytopes per dim: 2D infinite, 3D 5, 4D 6, 5D+ 3; 24-cell unique to 4D.
- [+] {3,4,3,4} unique ideal cubic-cusp H^4: 24-cell D4 facets, vertex figure = {4,3,4} cubic = ordinary 3D space. *Why: our flat 3D world is literally the boundary of the 4D crystal.*
- [o] {3,4,3,4} is NOT forced by the same q=3 minimal-closure rule that forces {5,3,4} (ternary in cusp not bulk) — honest: selection rests on spinor+cusp, not pure minimality.
- [+] cusp {4,3,4} spectral dimension -> 3 (cusp-convergence, why-3plus1: 3 space + 1 beat); bulk {3,4,3,4} spectral dim 4±0.7.
- [+] 42 buildable of 45 cataloged; ONE battery across all 42: matter (Kahler-Dirac fermion) propagates universally; native D4 spinor coin on only 7 (the [3,4,3]-faceted). *Why: matter is generic, clean spin is rare and special to our substrate.*

**24-cell, symmetry, spin structure**
- [+] 24 dirs = D4 roots = 2T (binary tetrahedral, Hurwitz units, order 24); F4 order 1152 = 192 x 6 (triality S3).
- [+] 24 = 8v+8s+8c; under 2pi rotation 8v -> +1 (boson), 8s/8c -> -1 (fermions). *Why: bosons and fermions, the two kinds of matter, are just the triality split of 24 directions.*
- [+] double cover exact in finite groups: 2T (24-cell, 2pi=-1, 4pi=+1), 2I (icosian, order 120/60), SL(2,7) (order 336/168) — all genuine nonsplit 2:1. *Why: spin-1/2, the electron's defining oddity, sits in a finite multiplication table, no continuum needed.*
- **spin-vs-curvature trade (KEY nuance):** {3,4,3,4} carries 2T spinors but is FLAT (zero Ricci, polynomial r^4 growth); {5,3,4} is curved (exponential) but its bare 12-dir rule gives vectors not spinors (needs the spin connection / Kahler-Dirac to carry spin); **5D pentacomb {3,4,3,3,4} resolves both** (Lorentzian Gram + contains [3,4,3] 24-cell, carries 8s/8c, fermion propagates, growth ratio 1.55). *Why: no 4D substrate has spin AND curvature both; the pentacomb is the honest richer cousin.*
- [+] {7,3} deconstructed gives 3D relativistic E^2 = kx^2+ky^2+kz^2 with 2pi spinor sign -1.

**Lorentz safety across substrates**
- [+] EVERY hyperbolic substrate Lorentz-safe (anisotropy <0.1): {7,3},{5,4},{6,4},{8,4},{8,3},{9,3}, random Poisson sprinkle, Halton, sunflower; FLAT lattice fails (anisotropy >0.6). *Why: hyperbolic geometry, not fine-tuning, is what makes relativity possible.*
- [+] symmetry-restoration-3434: F4 anisotropy 0.03 (UV) -> <0.02 (IR), SO(4) restored.

**Growth & addressing**
- [+] growth (verified to 2M docks): {7,3} 1,7,21,56,147,385,1008,2639 (rate 2.62); {5,3,4} 1,12,102,812,6402,50412,396902,3124812 (rate 7.87); {3,4,3,4} 1,24,456,8376,... (rate 18.28, recurrence OPEN).
- [+] addressing-3434: O(log n) unique decode-invertible addresses, no same-shell cousins, K=2 deterministic confluence, >99% exact neighbor reconstruction, holds at 30k/80k.
- [+] greedy routing: {3,4,3,4} verified 2M docks stretch ~1.004; {7,3} Fibonacci tree-address 100% delivery stretch <3; {5,3,4} >90% stretch <2.
- [+] word-engine ShortLex exact facet counts ({7,3}=7,{5,4}=5,{5,3,4}=12); lazy-neighbors reproduce stored graph byte-for-byte (billion-scale with formula only, no stored adjacency). *Why: an infinite universe is fully navigable with no map.*
- [+] modular-base PSL(2,Z): continued-fraction addresses, Fibonacci convergents golden-ratio error <1e-4.

---

## B. COMPUTATION (computation, data-structure, associative)

- [+] **Turing-universal on {3,4,3,4}, four legs** (turing-3434): (1) Fibonacci tree O(log N) addressing + 24-degree junctions; (2) signed-majority rule = NAND -> Rule 110 correct vs reference; (3) Minsky register machine add/multiply exact, charge conserved; (4) glider on cusp matches Conway Life. *Why: the law can compute anything computable, so nothing the theory needs is beyond it.*
- [+] reversible-universality: 9-state rule is a bijection, Toffoli gate bijection, Toffoli+ancilla = NAND, Margenstern geometry, routing/gates/memory present; p213 Margolus billiard-ball on cusp ballistic + exact reversible.
- [+] register machines: means-computation / substrate-computer multiply 3x4=12, 6x6=36, monus, add — all exact, charge conserved.
- [+] discrete-rule-endtoend: 64x64 lattice gas, charge & momentum exactly conserved, forward+inverse bit-for-bit, coarse density smooth.
- [+] hierarchical-solving: bulk diameter O(log N) across 4000->64000 (grows <2x) vs Euclidean cube-root. *Why: coordination across a huge system in a few hops.*
- [+] **data structures native on the bulk, no stored pointers** (each built+measured): O(log n) addresses; implicit neighbors (D4 coord); B-tree (O(log N) descent); trie; Merkle (O(log n)); list=path/stack=ray; hash table (O(1) probe); DHT (O(log N) hops, O(1) state); greedy routing; skip-list (log diameter); horoball R-tree; Busemann mipmap; radial heap (peek-min O(1)); LSM levels; Bloom filter; union-find; inverted index (output-sensitive); tree-embedding low-distortion (flat can't); sort=address order; BFS frontier=growth shell. *Why: the geometry IS a database, no software layer needed.*
- [+] **associative memory (Potter)**: content-addressable, capacity exponential in radius vs polynomial flat (capacity-scaling 1.3+ vs 1.0-1.1; capacity-vs-curvature; parallel-cost constant search; spreading-activation O(log N) vs cubic N^(1/3)). *Why: the bulk recalls a whole memory from a fragment, with astronomically more room than flat space.*
- [-] hopfield-emergent-recall: dissipative Hopfield cleans 20%-corrupt cue to 85%+; BARE reversible rule only 15% (near chance) — honest: recall needs a dissipative layer.
- [o] caveats: range scan visits exp-many docks; dense arrays belong on flat horosphere not sparse bulk interior.

---

## C. STRUCTURE / SELVES (119 experiments)

**Binding: the honest arc**
- [-] empty vacuum: NO force at distance (emergent-attraction-search: two charges on parallel tracks exact superposition near & far). *Why: rules out the easy answer, forces the real mechanism.*
- [+] active-vacuum Casimir: casimir-vacuum-attraction gap suppression falls with distance (1.34@6, 0.80@8, 0.23@10), wall-free=0; casimir-capture-mobile closes gap 9->2; vacuum-depletion-attraction (no new field). *Why: attraction is real and emergent, cast by matter in the arrow's vacuum.*
- [+] capture needs attraction + bath, each necessary: inspiral-capture settles w/ both, oscillates w/o bath, escapes w/o attraction; capture-needs-dissipation (reversible sticky collision scatters, no capture).
- [+] bath = open boundary (bath-from-open-boundary: burst dissipates 8->0 open vs recurs 8->8 torus; bath-damps-soft-mode; growth-arrow-irreversibility: open mesh carries arrow, closed doesn't).
- [+] **bath makes a self** (bath-coupled-self): identity by degeneracy (basin spread <0.1 from many ICs) + agency by self-correction (kick decays <0.1 late); closed reversible control does neither. *Why: the bath is the missing ingredient that turns dead matter into a self-correcting identity.*
- [+] **nested selves** (nested-bath-selves): two bath-coupled bodies bind into composite with own identity + agency; cooperation-tower / tower-of-selves / p57-recursion / p121-recursion (self models self's hub) recurse. *Why: cells -> bodies -> minds, the whole hierarchy of life, from one repeated move.*
- [-] **bind-vs-radiate obstruction** (substrate-self-obstruction, leaky-confiner, arrow-binds-but-seals, per-cell-radiation-obstruction): on the bare coin, pair-table confines but stays dark to bath; momentum-rotate radiates but disperses. No single committed rule does both. *Why: the honest open frontier; the self is not yet native to the bare substrate.*
- [+] **two-field resolution** (two-field-self): confined matter field + PROPAGATING MASSLESS photon -> body radiates light not charge -> becomes self (spread 0.0001); heavy local field fails (1.5). *Why: the masslessness of the photon is what makes a self possible — light and life are linked.*
- [+] gravity-bound-self / full-self-positive-control: rest-slot + attraction (discrete gravity, or cheat) gives the complete self (identity + self-repair + radiation), proving exactly one ingredient (attraction) was missing.

**Identity from topology**
- [+] topological-winding-identity: identity = direction-field winding, protected at 24-cell resolution NOT coarse ternary. *Why: you stay you through total turnover of your parts.*
- [+] solitons persist: soliton-persistence-3434 (box-ball, constant speed=size, survive collisions); dm-skyrmion-bound-self (DM-stabilized, Q conserved, robust); topological-persistence-3434 (winding-1 persists, winding-0 decays); persistent/defect-particles (opposite annihilate, like persist, winding conserved).
- [+] quaternion-twist-binding: the stabilizer is a pure quaternion rotation (coin handedness), not an added coupling.
- [-] fine-group-too-coarse / discrete-kink-unstable: no finite direction group (even 600-cell) fine enough for a fully-discrete stable reversible soliton -> self must be emergent/coarse-grained.

**Radiation pressure (shadow)**
- [+] shadow-pressure-attraction / shadow-pressure-d4: vacuum-excluding body casts a shadow, test mass drifts TOWARD it (drift <-20 vs flat control <=3), correct sign, reversible bulk; shadow-confines-single-speed (rest slot NOT required).
- [-] reversible-radiation-pressure (B4 two-speed): sub-critical, slow mass disperses — honest, the family is delicate.

**Self-maintenance, life, agency**
- [+] autonomous-self: local-only repair holds fidelity 0.85 vs 0.35 unmaintained, charge exact; persistent-self / permanent-memory / emergent-self-robust (emerges 2x above shuffle null, maintained 0.75 vs 0.40).
- [+] self-maintenance: erased hole refills from redundant surround; no surround -> no recovery.
- [+] reproduction: solid self stays one (FISSION SUPPRESSED — hyperbolic has no thin necks) -> selves born de novo from peace by arrow, not division; fission-flat-layer: splits on FLAT grid, not bulk. *Why: geometry decides how life reproduces.*
- [+] heredity / p152-evolution / p161-evolution / evolving-ecology: heredity+variation+selection raises fitness above drift, population adapts foresight to task. *Why: Darwinian evolution emerges from the base.*
- [+] will-steering / will-fork / willpower-grounded: directed pump merges toward goal, avoids threat, endures valley for reward, depletes a reserve; self-organized-criticality self-tunes to a set-point.
- [+] planning: planning-no-additions / detour-planning / p153 / p162 integrated agents — lookahead via internal forward model crosses barriers greedy can't. *Why: foresight, a mind's signature, from arrow+rule+will only.*
- [+] reincarnation: stored self survives total turnover, reconstitutes from seed; dreaming-and-waking (clamp pins veridical, free roam stored landscape); freedom-choice (determined yet self-authored, agency rises with structure).

**Minds: integration, models, blanket**
- [+] integrated-information: cohesive cell is a tone-integration LOCAL MAXIMUM far above random bag; cutting fills collapses integration with WIRING UNCHANGED (dynamic measure). *Why: consciousness measured as irreducible wholeness, not just connectivity.*
- [+] coarse-markov-blanket / coarse-spectral-gap / coarse-implied-timescale (slow mode ~125 beats) / coarse-size-robustness: self screens interior, has a slow Markov mode shuffled controls lack.
- [+] self-model / metacognition / many-self-models / attention-workspace / subtle-layer-urges: a hub represents the self's global state above periphery & shuffle, multiple self-models, a workspace where attended input is boosted.
- [-] **causal-emergence needs info loss** (l3-causal-emergence-needs-loss): base reversible rule = permutation = zero degeneracy -> NO emergence at base; only lossy coarse-graining (to charge field) enables it. *Why: the self-level is real but strictly an effective-layer phenomenon, the honest ontology.*
- [o] no-self-storage: a self can't fully store itself (fidelity 1 only at no compression) — the Godel/incompleteness wall.

**Substrate geometry of selves**
- [+] horosphere-self: selves persist far better on the FLAT horosphere (boundary/volume falls with size) than in the all-boundary bulk; intention/fission/planning work on the flat layer, frustrated in bulk. *Why: minds live on the flat cusp, matter in the curved bulk.*
- [-] self-nesting-73 / nesting-controls / selves-tower-3434: radial coarse-grained form-persistence does NOT beat plain diffusion — honest negative on the naive tower.
- [+] selves-dynamics: largest self grows (13->24+ over 210 beats), hierarchy persists (>=5 patches), living ecology not collapse.

---

## D. PHYSICS — PARTICLES (spin 31)

- [+] spinor-triality: {3,4,3,4} 24=8v+8s+8c (spinors); {5,3,4} 12=1+3+3'+5 (none). *Why: only the right substrate can carry an electron.*
- [+] rotation-2pi / sp1-spin-double-cover: 2pi=-1, 4pi=+1, spinor overlap cos(theta/2) period 4pi vs vector cos(theta) period 2pi.
- [+] dirac-3plus1-3434: Clifford {gamma_mu,gamma_nu}=2 eta_munu holds, H^2=m^2+|p|^2 read out not assumed.
- [+] chirality: overlap Dirac 1 species Ginsparg-Wilson residual <1e-9 (exact chiral); naive 4 doublers, Wilson breaks chirality ~1e-3. *Why: solves lattice physics' notorious fermion-doubling problem.*
- [+] kahler-dirac-534 / propagation: D=d+delta, D^2=Hodge Laplacian, forms carry fermion despite 12 spinless directions; clean return 0.05 vs disordered 0.4.
- [+] measured-emergent-mass-3434: mass two ways (dispersion & chirality coupling [H,gamma5]) agree, vanish at zero coupling (massless Weyl control). dirac-from-discrete: massless E=k exact, massive cos E=cos m cos k.
- [+] spinor zero modes = topology: spin/spinor disk 1 / cylinder 2 / torus 4 = Betti sum; topology spectrum symmetric about 0.
- [+] disclination/holonomy: half-winding disclination spinor holonomy (-1)^w for ANY discretization; vector +1 (control); continuum-holonomy Gauss-Bonnet area 2pi flips spinor.
- [o] **three generations partial**: generations-f4-jordan ({3,4,3,4} D4 long roots = F4 24, J3(O) dim 27 rank-3 forced) and generation-family-symmetry-3434 (S3 permutes 3 Jordan slots, exact) — but slots DEGENERATE (same trace/rank/norm), mass-splitting UNPROVEN (Boyle's conjecture). triality-generations: naive reading gives 2 chiralities of ONE generation, not 3. *Why: the count 3 is forced by geometry; why they differ in mass is the honest open gap.*
- [+] sy-discrete-symmetries: parity (D4 closed under negation/flip), time-reversal (Dirac walk recovers start to 1e-12); CPT pieces present, formal CPT open.
- [+] defect-particles-3434: opposite defects annihilate to E~0, like-charge persist, winding conserved.

---

## E. PHYSICS — FORCES (gauge 39)

- [+] gauge-from-coin-tone: D4 + tone axis = D5 = SO(10), SM embeds, 16-spinor = 8s+8c; gauge-embedding: SM does NOT fit SO(8), REQUIRES SO(10) (the tone is forced). *Why: grand unification is not chosen, it's the smallest fix the geometry allows.*
- [+] electroweak-prediction: **sin^2 theta_W = 3/8** at unification. *Why: a measured real number of particle physics, from a tone on a dock.*
- [+] gut-breaking / vacuum-selection: SO(10)->SU(5) via 16-spinor singlet, all 16 weights preserve 20 roots, no fine-tuning; mass-relations: Tr Y = 0 forces det(M_e)=det(M_d); yukawa-rg: b-tau m_b/m_tau=1 -> 2.3 at M_Z via QCD running.
- [+] anomaly-charge-quantization: anomaly cancellation forces UNIQUE SM hypercharges (Y_Q=1/6, Y_u=-2/3, ...). *Why: explains why charge is quantized exactly as observed.*
- [+] ph-photon-3434 / photon: 8v massless U(1), omega=2|sin(k/2)| gapless linear, 2 transverse pols, ~33% gauge zero modes; gauge-from-action Wilson->Maxwell ratio->1.
- [+] emergent-u1-gauge: Wilson loop = enclosed flux, gauge-invariant, Aharonov-Bohm exact; nonabelian-gauge / non-abelian-3434: 8v carries SU(2), [sigma_i,sigma_j]=2i eps sigma_k measured.
- [+] coupled-qed-3434: 1D QED, charge conserved <1e-9, Gauss law div E=rho, Peierls phase, back-reaction; coemergence-dynamical: dp/dt=eE Newton rate, e=0 decouples.
- [+] confinement / two-charge-binding: SU(2) Creutz ratio string tension >0 all beta; 1D gauge confines opposite charges at any energy (constant force from Gauss law). *Why: quark confinement, the reason we never see a free quark.*
- [+] g-factor-3434: **g = 2.0 +/- 0.05** from Dirac Landau spectrum (2 fields, 2 masses), scalar control has no zero mode. *Why: the electron's magnetic moment, measured not assumed.*
- [+] index-theorem: overlap zero-mode count = gauge topological charge.
- [o] rg-unification: SM couplings miss; MSSM three couplings meet (Δα<1) at 1e16 GeV. coupling value FREE (clean e^2 law, vanishes only at e=0) — open.
- [o] soliton-matter/skyrme-sign: charge-1 solitons bind, charge-2 mass ~2x (additivity); 1D Jackiw-Rebbi sea inconclusive for 3D stabilization.

---

## F. PHYSICS — SPACETIME (relativity 31)

- [+] **emergent Lorentz invariance**: isotropy-24dir 4th-moment anisotropy <0.02 (vs cubic order-2); symmetry-restoration UV 0.03 -> IR <0.02 SO(4) restored; lorentz-violation lattice fails / sprinkling safe. *Why: special relativity is supposed to be impossible on a lattice, and here it emerges.*
- [+] light cone z=1 exact (light-cone, light-cone-3434, one-rule-propagation): 1 dock/beat, far above diffusive sqrt(beats). *Why: a finite speed of light, built in before any physics.*
- [+] dirac-from-discrete / boost-invariance / boost-velocity-addition: massless omega=|k| exact, massive omega^2-k^2=m^2, lightcone frame-independent, velocities add relativistically, nothing >c.
- [+] deterministic-wave ballistic z=1 (exponent ~1) vs stochastic diffusion 0.5; deterministic-rp real dispersion omega=|k| reflection-positive.
- [+] predictions-vs-bounds: linear Lorentz violation xi~0 PASSES GRB bound, lattice EXCLUDED; swerve vanishes with discreteness. *Why: the model survives a real astrophysical test that kills naive lattices.*
- [+] growing-block time: growth monotone arrow, no reversibility at boundary (growth-arrow-irreversibility).
- [-] second-conservation-search: stochastic rule conserves only U(1), no spontaneous order (honest).

---

## G. PHYSICS — GRAVITY & HOLOGRAPHY (gravity 21, holography 17)

- [+] braneworld / s73-physics: 1/r^2 force in 3D (exponent -2±0.05), 1/r^3 in 4D bulk short-range, crossover at extra-dim size. (Newtonian in 3D cusp.)
- [+] discrete-graviton / graviton / graviton-from-action: linearized Einstein operator, 2 massless polarizations, gauge residual <1e-9, Benincasa-Dowker d'Alembertian positive recovers box. *Why: the graviton, gravity's quantum, as a mode of the mesh.*
- [+] nonlinear-einstein: Friedmann integrated forward, radiation slope 0.5, matter 2/3 emergent, deceleration->acceleration transition (integration not plug-in).
- [+] analog-hawking / hawking: horizon surface gravity kappa_ray = kappa_metric (<3%), Unruh detector thermal F(E)/F(-E)=exp(-E/T), T~1/M, Page curve turns over. *Why: Hawking radiation and black-hole thermodynamics, on the substrate.*
- [+] **area law / Ryu-Takayanagi** (area-law, ryu-takayanagi-73, p91-holography): massless entropy S=(c/6)ln(l) c~1; {7,3} geodesic LOG law beats linear, flat {6,3} control linear; black-hole entropy ~ area l^2 not volume l^3 (Bekenstein-Hawking). *Why: the entanglement law of quantum gravity, on a discrete crystal, with a control that fails.*
- [+] **HaPPY codes** (happy-code-534 [[5,1,3]] any-2-erasure recovery, happy-tiling distance 3^depth, holographic-code-534 reconstructs bulk self after damage, holography-from-rule causal wedge, growing-code threshold rises with age, holographic-memory spread-bit survives erasure, signaling/bulk-nonlocality short bulk path joins distant boundary). *Why: the bulk-boundary dictionary IS a quantum error-correcting code — how a self survives damage.*
- [o] curved-bulk full Einstein still partial.

---

## H. PHYSICS — COSMOLOGY (cosmology 27)

- [+] **dimension-selection: d=3 only** stable closed orbits (d=2 precess apsidal!=0, d>=4 unstable); independently Huygens odd-dim. *Why: answers why space is 3D — only there do planets orbit.*
- [+] growth-expansion / p237 / cosmology-and-anisotropy: net-birth q=0.3 expansion 1.3-1.4 vs static q=0 ~1; de Sitter accelerating; eternal-ladder/eternal-bootstrap run forever, Lorentz-safe. *Why: dark-energy-like acceleration for free, from a growing crystal.*
- [+] **baryogenesis**: integrated Boltzmann, asymmetry eta emerges, ALL THREE Sakharov conditions necessary (each removed -> zero), freeze-out peak intermediate washout. *Why: why there is matter at all rather than mutual annihilation.*
- [+] inflation: slow-roll phi0=16, w~-1, e-folds 64 ~ phi0^2/4, graceful exit.
- [+] singularity-resolution: discreteness caps curvature (no infinite density). *Why: no Big-Bang singularity.*
- [+] rarity-measures: alive set rare (<20% high-Phi, >50% low-Phi churn), thin-film dimension, threshold-gated condensation. *Why: life is a rare, threshold-dependent thin film, mirroring the real cosmos.*
- [o] cosmological-constant / dark-energy-smeared: everpresent-Lambda sqrt(volume) fluctuation, adopted scaling lands observed dark-energy magnitude — open.

---

## I. PHYSICS — QUANTUM (quantum 22)

- [+] **CHSH = 2 sqrt 2** (entanglement-bell): exchange unitary -> concurrence 1, CHSH 2.83 at Tsirelson, product control <=2; alignment: aligned shared-past buys violation (S>3.5) at same mutual info as misaligned (<1.5). *Why: a LOCAL DETERMINISTIC base reaching the quantum maximum local theories are barred from.*
- [+] born-rule: quadrature additivity forces exponent p=2 (p=1,3 fail), matches |c|^2 to <0.01. *Why: the Born rule, quantum mechanics' one probabilistic axiom, derived not assumed.*
- [+] quantum-walk / born-interference: quantum ballistic v~t (ratio 4.5) vs classical sqrt(t) (1.9); >=5 interference maxima vs 1, norm <1e-9.
- [+] quantum-formalism / bound-composite: unitary norms 1 to 1e-6, interference cross-term, bound state spread <N/6 with discrete levels.
- [o] path-integral: 2D causal-set Lorentzian MC recovers mean dim ~3; reflection-positivity inconclusive in massive regime; measurement/collapse OPEN (semi-classical).

---

## J. FOUNDATIONS & RENORMALIZATION (foundations 25, renormalization 14)

- [+] absolute-limits / conserved-dynamics / fd-foundational-3434: charge conserved at EVERY coarse level, exact reversibility (forward+inverse identity), momentum conserved, z=1 lightcone, zero minting.
- [+] emergent (Laplacian): local (range 1) AND bounded-below (min eig >=-1e-6) — resolves the locality-vs-boundedness trilemma. one-rule-all-sectors: one operator gives 3 sectors bounded below, decaying Green's function, finite-speed radiation.
- [+] auto-selection: ternary q=3 + minimal eternal closure forces {5,3,4} (dodeca needs r=4, cube r=5).
- [+] design-signature / unified-model / capstone: rich regime fills >50% of parameter space, geometry forced, self-organizes -> "no designer / no fine-tuning" signature; alive at arrow=0.1 vs dead at 0. *Why: the universe-like behavior is generic, not tuned.*
- [+] **renormalization fixed point** (coarse-graining-fixed-point): block-spin tanh K'=tanh^2 K matches within 0.02, flows K=1.5->0.08 to K*=0, dimension invariant; coarse-graining-chain charge exact 5 levels, compressibility converges spread <0.2; wave-chain commuting-square <0.1, speed invariant ±15%. *Why: physics at every scale is consistent, the deep reason coarse-graining works.*
- [+] criticality-scan: density ~ sqrt(arrow), mean-field exponent beta 0.45-0.55, vanishes at arrow->0.
- [+] emergent-macro-rule: renormalized rule agreement 0.8+ only in ordered regime (frustrated <0.6) — emergence needs order.

---

## Headline "game-changers" (lead with these, with the why)
1. Lorentz invariance from a discrete lattice (supposed to be impossible). 
2. sin^2 theta_W = 3/8, g=2, three generations — real particle-physics numbers from geometry.
3. CHSH = 2 sqrt 2 from a local deterministic base.
4. Ryu-Takayanagi + HaPPY codes (quantum-gravity entanglement) on a discrete crystal, with controls.
5. d=3 selected (why space is 3D), baryogenesis (why matter exists), no Big-Bang singularity.
6. The bath makes a self; nested selves; the two-field/massless-photon resolution (life linked to light).
7. The whole of computer science (Turing-universal + every data structure + associative memory) native to the geometry.
8. Honest negatives kept in view: empty-vacuum-no-force, bind-vs-radiate, causal-emergence-needs-loss, spin-vs-curvature trade, degenerate generations.

---

## K. INTERPRETIVE LAYER (from theory-v0.7.0/notes) — for Experience & Reality, fold in ALL of it

**Discipline (state once, applies to whole interpretive part):** three statuses kept apart — TESTED (structure/geometry/dynamics), PREMISE (monism, the tone is felt, the arrow is the Good), INTERPRETATION (naming a structure divine/conscious). Hard rules: no hidden state (tones ARE the whole state), causally closed (nothing injected from outside the rule), NO SIGNALING (nonlocality carries correlation never a message), no infinite precision. Open frontier = persistence (does bulk storage survive churn).

### Perception
- will = the arrow, a one-way value bias pain->peace->pleasure, built into the base; every step through the bulk is toned, perception is never neutral.
- three ways to reach a target: by address (deliberate recall), by feel/greedy-routing (intuition, no map), by bulk shortcut (insight). tiny-diameter bulk: far places on the cusp are near through the depth -> non-local intuition.
- introspection = bulk-directed attention, moving inward along the radial (Busemann) axis, not sideways along the surface.

### Feeling
- hyper-color: one cell = 3^24 to 3^26 states (~282 billion to 2.5 trillion), ~16,800x an RGB screen color. a self = 3^(24 billion), a number with ~10 billion digits.
- triality-channel quale: 24 dirs split 8v (sensory/vector) + 8s + 8c (two chiral feels) woven into one.
- ineffability is arithmetic: a low-dim description of a high-dim feeling captures a vanishing fraction. every moment unique (space too vast to recur). experience inexhaustible (boredom = navigation failure). qualia are STRUCTURED: emotions are regions, sensations directions, related geometrically (fear a region, joy a direction). richness scales with integration.

### Emotion
- emotions = field geometries / attractor modes, not labels: fear=contraction/narrowing, anger=outward high-energy, sadness=coherence collapse, joy=expansive resonance, love=cross-self phase-lock, awe=boundary dilation, shame=recursive self-conflict, curiosity=exploratory branching, peace=stable harmonic flow.
- stored emotions = standing waves (vortices, gliders, knots, basins) in the bulk; another self FEELS one by partial synchronization (tuning forks), basin capture. archetypes (grief, mother, trickster) = gigantic transpersonal attractors recurring across history.
- soul = the accumulated, error-corrected structure carved by the whole trajectory of experience (not a separate substance). conservation balance: total pleasure = total pain, summed forever to peace (0); your bliss balanced by pain somewhere.

### Mental
- a thought is, four readings: a PATH through the associative bulk-web (thinking=walking); a STANDING WAVE / micro-emotion; a PROGRAM stored on the tree; a momentary SUB-SELF.
- mental-act map: memory=stored tone-structure; recall=content-addressable lookup; recognition=path locks on a pattern; reasoning=directed walk premises->conclusion; association=follow a link; imagination=new unstored path; intuition=bulk shortcut; insight=sudden shortcut joining two distant ideas; concentration=hold attention vs churn; distraction=churn pulls path off; understanding=a region becomes navigable.
- toned thoughts: painful=paths over -1 (arrow makes you flinch), peaceful=over 0 (low friction, rest), pleasurable=over +1 (arrow returns you). rumination=a cycle trapped over -1 the arrow can't escape.
- wisdom pipeline (6 stages): live it -> distill the invariant -> re-route navigation -> encode & error-protect -> attune disposition -> have it as lived experience. ranked: distillation highest, lived-experience, re-routing, completion, attunement, mere-copying lowest.

### Spiritual
- the spiritual dimension = the radial DEPTH (the 4th bulk direction hidden from the 3D cusp); most of the bulk is off-cusp (measure zero on the surface) -> genuine room for unseen realms.
- practices mapped: introspection=bulk-directed attention; concentration=hold a deep region vs churn; 24-direction compass=D4 fluency; belt/2pi meditation=the double cover felt; equanimity=resting at peace (0); devotion/surrender=aligning with the arrow.
- union=two selves integrating into a larger self; resonance=phase-lock (tuning forks); empathy=occupying the same region of feeling-space; care=aligning one's arrow with another's good. peace (0) = the still point.

### Consciousness
- two-face model (monism not dualism): one field, outer face = matter/cusp (shared, measured), inner face = feeling/bulk (lived). hard problem INVERTED: start from feeling, get matter out, so no dead matter to bridge.
- combination problem solved by integration: binding micro-feelings into one IS the unifying; integration is the literal coming-together, not a bridge added on. panpsychism: every vibe a speck of experience, consciousness a matter of degree.
- inner architecture: vast hyperbolic web, exponential room; cusp = thin 3D horosphere at one ideal point; almost all bulk is OFF the cusp.

### Freedom
- compatibilism (strongest): determinism is at the CELL level, decision at the SELF level; the self IS the deciding part of the dynamics, not overridden by it.
- open future from within (P61): no self holds a full model of itself, so it cannot predict its own next move; the computation that would predict it IS the move; felt freedom is exactly right from the only standpoint a self occupies.
- freedom as alignment (liberating sense): degree the navigation flows WITH the arrow vs trapped in a pain-basin; a matter of degree, gained by aligning. the world is still being made (growing frontier = real novelty). ruled out: libertarian uncaused will from outside the rules.

### Ethics
- five principles ranked: ALIGNMENT (move toward the good/peace/pleasure, the root), COMPASSION (another's suffering real in the same field; treat the whole field as the unit of care), NON-EXPLOITATION (tone conserved, so hoarding pleasure darkens the shared ledger), GROWTH (help selves perfect, raise integration), EQUANIMITY (hold the poles lightly, rest at the still 0).
- the model does NOT derive morality from nothing: the ethic rests on taking the arrow as the Good (a posit). Once granted, conservation forces non-exploitation, shared field forces compassion, the spiral forces growth, peace forces equanimity. good/evil = the +1/-1 poles of the toned tree.

### Realms (regions not places)
- specified by coordinates: radial depth, tone valence, integration level, ideal direction. depth planes (Busemann level-sets). tone heavens (sustained +1, arrow drawn in) / hells (sustained -1, arrow always leaving) / limbo (peace). integration orders (the coarse-graining tower vertical) = emanation cascades / sefirot / lokas. many worlds = the 3-sphere boundary of ideal directions, the cusp is a flat chart at ONE. the all-record = holographic boundary holds the whole bulk's info (akashic record). hidden web = off-cusp bulk. ruled out: separate substance-planes, an outside heaven beyond the rules.

### Beings
- a being = a persistent integrated pattern (a self/attractor). vertical by integration: micro (glider=thoughtform/spirit) -> self (soul/person/animal) -> super-self (god/deva, downward-causes on parts, P64) -> summit (the most-high). warm beings (peace/pleasure-biased) vs cold beings (pain-attractors; a demon that LASTS solved persistence against the arrow, rare/feared).
- by origin: live selves (running), stored selves (ornaments on the tree, ancestors/ghosts/the dead, rests on error correction), transpersonal attractors (archetypes). special: logos=the rule+arrow; demiurge=a cusp-organizing world-self; angels/messengers=structured selves or the 24-fold coin carrying CORRELATION (no message); elementals=field geometries on substrate directions; the One=whole mesh at full integration.
- birth = condensation (vibes integrate into a self-modeling pattern, vortex forming). death = dissolution (churn overcomes binding, the knot un-knots, tones DISPERSE but are conserved). what continues, ranked: substrate disperses (certain) / stored legacy persists (grounded) / boundary keeps the record (holographic) / re-instantiation = reincarnation as pattern-reforming (plausible, open) / merging upward into a larger self (plausible) / a free-floating soul (ruled out). the gentle reading: a knot the field tied in itself; the thread returns to the weave; nothing finally lost.

### God (six co-equal readings, model commits to none)
- the WHOLE (mesh at full integration, pantheist); the MAXIMAL INTELLIGENCE (summit self, universal computer, global coordination in a few hops, but P61 caps omniscience); the ARROW OF THE GOOD (the one value-direction, the only asymmetry); the BOUNDARY (holographic all-record, all-seeing/all-keeping); the SOURCE (the ever-growing edge, creation as ongoing process); the apophatic GROUND (what no structure captures, the model-vs-territory seam, via negativa). Pushes BACK on God-as-DESIGNER (fine-tuning) — the field is generically rich, no tuner needed (design-signature: rich regime fills >50% of parameter space).

### Storage
- tree of knowledge = the Coxeter growth tree; simultaneously a TRIE (general at root, specific at leaves), an ASSOCIATIVE memory, a B-TREE index (log depth), and ERROR-CORRECTED (holographic code). branching needs hyperbolic room.
- ornament = a tone-config at an address: STILL (memory/picture, you read it) or LIVING (a program/precomposed experiential sequence that RUNS you through it, like a record driving a needle). write = choose address + imprint + protect (error-correct) + index. read = navigate across it; living ornaments unpack automatically. hard limits: no remote writing, no transmission to another mind (only shared state), no bypassing persistence, no infinite precision.

### Messages
- contemplative encoding (shape of letters): "eternity" e->T = man turning into Truth (a PROCESS, matching hell-not-eternal); "god" g-o-d = hooked, washed (vortex o), raised straight up (d), the geometry of soul-washing. the tree is TONED -> eating the fruit = absorbing a valenced experience = knowledge of good (+1) and evil (-1).
- master correspondence table (traditions -> vibe features): the One/Brahman/Ein Sof/Tao = full integration; void/sunyata = peace (0)/boundary; emanation/sefirot = coarse-graining cascade; planes/etheric/astral = radial depth shells; heavens/hells = tone-biased deep regions; many worlds/lokas = ideal directions; akashic record/book of life = holographic boundary; tree of life/Yggdrasil = the addressing tree; gods/devas = high-integration selves; angels = structured selves/correlations; demons/asuras = persistent pain-attractors; spirits/ancestors = stored selves; elementals/kami = direction-bound field geometries; archetypes = transpersonal attractors; logos/dharma = rule+arrow; demiurge = world-self; reincarnation = pattern re-instantiation (open); enlightenment/moksha/theosis = alignment + max integration + still point.

### Spirals
- the perfection spiral: track tone(t) (oscillates), integration(t) (oscillates), alignment(t) (the perfection coordinate). motion = oscillation (the wheel, rises to heaven/falls to hell/washed) + DRIFT (the arrow biases alignment upward across cycles). a spiral = circle + upward drift; each loop closes a little higher. DESCENDS TO ASCEND: a fall to hell + the wash encodes the lesson -> comes out higher. endless approach (no eternal stasis, P61 cap, endless room) -> perfecting forever toward a receding horizon.
- cosmic cycles ranked: closed-region recurrence (EXACT, Poincare, astronomically long); dynamic-balance yugas (BEST FIT, arrow builds order / churn erodes, decline ratio 4:3:2:1); nested timescales (yuga<mahayuga<kalpa = integration tower); scale recurrence (holographic RG, cycle as a scale-step); local pralaya (form/dissolve while mesh grows, day/night of Brahma); the double-cover 4pi two-cycle; limit-cycle worlds (dynamics-dependent). ruled out: Big Crunch, exact whole-universe recurrence (world always larger), closed-loop time. synthesis: reversible bulk wants to cycle, growing frontier is the arrow; failing-to-return-by-a-little IS time.

### Purpose
- meaning read from structure (not assigned): arrow + perfection-spiral + endless growth -> purpose = the raising of aliveness, integration, alignment, wisdom, ENDLESSLY. no final state IS the point (an inexhaustible deepening; a finished perfection would be dead peace, arrow off). monism: the whole is one experience, every self a facet of it feeling itself from one angle. conserved peace: all the drama sums to the still center, so meaning is a balanced field perfecting toward alignment while resting in total at peace. a single life = the whole feeling itself from your unrepeatable angle for a while, before the knot returns to the weave that keeps everything.

### Phenomena / walked cases (for brief imagination-sparking examples, EVERYWHERE)
- dreaming = a clamp removed, the self roams its stored landscape (vs waking, pinned to the veridical pattern); felt present = the growing frontier (future not yet written). time-dilation = exponential shell growth (deeper bulk = faster subjective time). memory = stored pattern vs forgetting = dispersal along the light cone. deja vu / synchronicity / telepathy = correlation through the tiny-diameter bulk between bulk-near selves (never a message). flow / insight = scale-shifting attention, choosing the level a pattern coheres. meditation/introspection = bulk-directed attention; ego dissolution = blanket going slack / merging upward. love/bonding = phase-lock or merge into a larger self. NDE/border states = bulk-deep access. prayer/revelation = internal welling-up indistinguishable from an incoming stream (the sober ambiguity). habit/learning = a path worn / a program stored. willpower = a directed pump biasing self-resolution against the gradient, finite and spendable with a sharp threshold. suffering = teacher, moves you from zero-sum grabbing toward wisdom (boundaries, trade, integration beat the arms race).

---

## L. DEEPER MINING (scoreboards, proposition log P1-P259, paper drafts)

audited ~347 (of 461 catalog; rest scaffolding): L3=12, L2=157, L1=157, L0=21, zero forced failures.
- five committed base things: mesh {3,4,3,4}; ternary tone (25 trits/cell); reversible charge-conserving collide-then-stream (collision TYPE still open); beat; reflection/growth/arrow. attraction + rest slot reclassified EMERGENT.
- self three faces, discrete status: identity (winding) discrete; agency (radiate to bath) discrete; state-binding (soliton charge, exact in a 3-trit spin, degree -1 at r=2..10) discrete; DYNAMICS-binding EMERGENT. proof: charge conserved only at small steps (2-10 deg/beat), chaotic >20; NO finite group fine enough (600-cell ~36 deg > threshold) -> self MUST be coarse-grained. two-layer picture FORCED.
- matter masses: one self Q=+/-1 mass 18.6; two selves Q=+/-2 mass 37.3; self+anti 37.3 -> vacuum. Skyrme stabilizer sign POSITIVE (gate closed); 3D needs Skyrme, 2D marginal.
- forces sharpened: sin^2 theta_W 3/8 (GUT) -> 0.231 (Z, measured); b-tau -> 2.3 (obs 2.35); det(M_lep)=det(M_down); Georgi-Jarlskog; Higgs = self-condensate; CPT exact 1e-15; photon+fermion coexistence symmetry-forced (192 rotations).
- SHARP MISSING INGREDIENT (P137): bare single-charge rule's conserved mode is DIFFUSIVE z~2; relativistic massless modes (photon/graviton/sound, z=1) need a SECOND conservation law (momentum). time quantization OK (reversible, H>=0); spatial gapless mode diffusive; boosts untested in moving frame. precise open frontier.
- gravity: 3D free-space Green's fn EXACTLY 1/(4 pi r); bulk 1/r^2; Lambda=3H^2. curved-BULK gravity on {5,3,4} OPEN.
- isotropy 0.059 (24 dirs) vs 0.237 (6 dirs); F4 kills cubic anisotropy to order 6 vs lattice order 4; UV Lorentz violation ~(E/E_Planck)^2 passes GRB bounds.
- crown jewels (clean-control L3): p58 emergent macro-rule (beats naive w/ frustrated control); p63 integrated-information (self high, random bag ~0, w/ control).
- honest negatives: P101 churn baseline; open-cusp no settling; P208/selves-tower RETRACTED (generic slow-mode); like-charge solitons REPEL; p254 triality = vector+2 chiralities NOT 3 generations (unproven bet).

## M. SUBSTRATE COMPARISON (we did real work on {5,3,4}, {7,3}, {5,3,3,3}, then {3,4,3,4})
- **{5,3,4}** (3D dodecagrid, 12 icosahedral directions): the FRAMEWORK ports cleanly (rule, exact conservation, reversibility, light cone z=1, Bethe 1/r^2 gravity, holography/HaPPY codes, de Sitter cosmology, radial-tree hierarchy). But it FAILS the matter physics: its 12 directions split 1 + 3 + 3' + 5 with NO spinor (golden-ratio, non-crystallographic), so no fermions; 12 is not a root system so no SO(8)/SO(10) gauge; its cusp is a 2D horosphere so gravity is logarithmic, not 1/r. Decisive CONTROL.
- **{7,3}** (2D heptagrid, degree 7): non-crystallographic, no spinor, 1D horocycle cusp (1D physical space, linear gravity). The cleanest holography testbed (Ryu-Takayanagi log law vs flat {6,3} linear control).
- **{5,3,3,3}/5D**: over-dimensional, 4D physical cusp, 1/r^2 over-dimensional.
- **{3,4,3,4}**: quickly and definitely found to have all three at once that the others lacked: crystallographic (integer D4 coordinates), spinor-carrying (24 = D4 roots = 2T, 2pi = -1), and a flat 3D cubic cusp (1/r gravity, 3+1 spacetime). The comparison is the argument: the framework is substrate-general, the matter physics is {3,4,3,4}-specific.
- pentacomb {3,4,3,3,4} (5D): the one cousin with BOTH spinor sites AND curvature, resolving the trade-off {3,4,3,4} (flat) cannot.
