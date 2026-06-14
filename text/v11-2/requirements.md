# Vibe Theory v11-2 paper — requirements and working notes

The single source of truth for how this paper must be written. Keep updated.

---

## 1. Voice and style

- **Concise, dense, clear, easy to read. Never verbose.** Get straight to the point every time.
- **Mostly short crisp sentences, interwoven with the occasional longer one** so it reads natural and clean, not monotone. Sentences should not all be the same length.
- **Normal-length paragraphs**, not choppy 1–2 sentence AI paragraphs. Short sentences live inside full paragraphs.
- **No filler / meta-commentary / junk.** Banned: "worth a word", "worth pausing on", "is a gem", "something sharp happens", "the whole point", "Honesty requires", "it bears noting", etc. State the thing.
- **No em-dashes (—), en-dashes (–), or semicolons (;).** Periods and separate sentences. Hyphens in compound words are fine.
- **Never write anything an intelligent reader could not parse.** No opaque phrases (e.g. "carries nothing up"). Say it plainly.
- **Quick inline glosses for jargon at first use** so a smart non-specialist follows without stalling. A few words is enough (bulk, cusp, horosphere, polytope, root system, quaternion, spinor, Schläfli symbol, symmetry group, lattice gas, Markov blanket, etc.). Give the reader a brief reference in their mind.
- Not every term needs a formal `definition` block. Use blocks at key points only; inline glosses everywhere else.
- Introduce the word **vibe** the moment experience is first mentioned (intro).
- The fire metaphor: the universe is an unending blazing fire of experience, each vibe a flame, each self/mind a flame too.

## 2. Core ontology to get right

- **The tone is NOT separate from the vibe.** A vibe IS the experience. Its tone is the quality of that experience, one way to model it as a value in {-1,0,+1}. Never "a vibe carries a tone" or "the value a vibe carries."
- The persisting bearer is the **site** (the slot), not a vibe holding a separable tone.

## 3. Terminology (get RIGHT all the way through)

- It is a **dock**, not a "cell." Use "cell" only: (a) when first defining the dock, (b) polytope names (24-cell, 5-cell, etc.), (c) generic honeycomb/polytope geometry, (d) biological cells.
- **Elements**, not "atoms." The eight base elements. Section title "The Eight Elements" if used.
- The law is the **knit** (collide then stream), never "the rule" as the law's name.
- The 24 directions are **sites**, never "star" or "coin."
- Lexicon: mesh, dock, site, tone, lean, knit, wake, beat. Above them: vibe (substance), flow (the whole).

## 4. Structure

- Parts in order: Introduction, Model, Geometry, Computation, Structure, Physics, Experience, Reality, Related Works, Predictions, Questions, Conclusions, Appendix, References. (See `outline.md` for the full section tree.)
- **Single-purpose section titles.** No "X and Y" combined sections.
- Minimal titles. Start high level, then dig deeper across the following sections.
- **No table of contents.**
- Margins = 1 inch (matches v10/v11).
- **Target length: 96 pages (24 x 4).** Honestly aiming 70–90+. Reach it with MORE SUBSTANCE per section, never by padding sentences.

## 5. Depth and content

- More substance for **Geometry / Physics / Structure / Computation**: real derivations, worked examples, intermediate results, tables, figures. Tight density for the interpretive parts (Experience, Reality).
- **Include every real finding and confirmation from the codebase/experiments**, in super concise clean prose. Convey the cool stuff throughout.
- **Quick worked examples / mental references**, talked through fast, so the reader can put themselves in the geometry quickly.
- Inline **related-work mentions for prestige**: Margenstern (cellular automata in hyperbolic spaces, implemented across all tessellations), Potter (associative computing engine), Jacobson, Ryu-Takayanagi, Maldacena, Finkelstein-Rubinstein, etc.
- Surface **key insights that help the reader visualize** the whole theory.

### Section-specific asks
- **Symmetries**: walk through the actual groups of our mesh (2T -> W(D4) -> F4, triality S3), with a table. Gem: the factor of 6 (triality) = the three generations. [DONE]
- **Growth**: a quick table, ~8 rows, showing how {7,3}, {5,3,4}, {3,4,3,4} grow layer by layer (cell counts per shell). [PENDING NUMBERS]
- **Addressing/Navigation**: Margenstern-based Fibonacci tree-addressing; demo how it works in a quick worked example. (Note: implementation uses child-ordinal digit / ShortLex addresses, and D4-coordinate addressing on {3,4,3,4}; NOT literally Zeckendorf — fix that claim.)
- **Computation**: the real Turing-universality (Margenstern railway + ternary-NAND -> Rule 110 + Minsky register machine + Conway's Life on the cusp), reversible universality (Toffoli gates), on {3,4,3,4} and {5,3,4}. Potter associative-computing engine.
- **Data Structures**: list every structure built on the mesh (B-tree, trie, hash table, DHT/routing, heap, skip-list, R-tree, Bloom filter, Merkle proof, associative memory, sort/BFS), note it holds across all buildable tessellations, with honest caveats (range scan exponential, dense arrays belong on the horosphere). [DONE]
- **Selves**: the full honest arc, not vague. Empty vacuum has no force (negative) -> active vacuum is a medium -> discrete Casimir shadow attraction (gap suppression 1.34 at d=6 -> 0.23 at d=10) -> capture needs attraction + bath (both necessary) -> the bath makes a self (identity by degeneracy basin, agency by self-correction; closed control does neither) -> nested selves recurse (body -> self -> self-of-selves) -> OPEN PROBLEM: bind-vs-radiate, no single committed rule on the bare lattice both confines and radiates -> RESOLUTION: two fields, matter + massless photon, body radiates light not charge, photon masslessness makes the self possible. Identity = topological winding, protected at 24-direction resolution not at coarse ternary. [DONE — keep enriching]
- **Intelligences**: three definitions — Problem (gap, P = D - C), Solution (a path from current state to desired state through the configuration network), Intelligence (capacity to find such paths). Quick mental image of the network of configs. [DONE]

### Key factual corrections from the experiments
- Tessellations: **45 regular hyperbolic tessellations cataloged, 42 buildable** by the engine. **Kahler-Dirac fermion (matter) propagates on all 42.** Native **24-cell / D4 spinor structure appears in only 7 of 42** (the [3,4,3]-faceted ones: {3,4,3,4}, {4,3,4,3}, and five 5D pentacombs). So matter is generic, clean spin is selective.
- The 5D pentacomb **{3,4,3,3,4} carries both the 24-cell substructure AND curvature**, resolving the spin-vs-curvature trade-off that {3,4,3,4} cannot. (Worth a mention.)

## 6. Citations

- **Serious claims get a quiet codebase citation** `\cite{pollard2026vibetest}` so readers can dig deeper. Do NOT say "codebase" in prose, just cite.
- Cite the codebase explicitly in **The Method** (done) and let results carry the cite.
- Use real inline citations for external work (Margenstern, Jacobson, Ryu, Maldacena, Finkelstein-Rubinstein, Potter, etc.) for prestige. Keys live in `vibe.bib`.

## 7. Depth grades

- **Do NOT print L0–L3 grades in the paper prose.** Define the rubric once (the table in The Method) for reference, and nowhere else.

## 8. Figures

- Do **not** stack the two intro mesh figures; separate them with text between. [DONE]
- Curvature panels: ~2/3 size, grouped and centered. [DONE]
- The **{5,3,4} (vibe-mesh-534) figure fills the full text width**, flush left/right. [DONE]
- Bibliography: **each reference entry must not split across a page break.** [DONE via `\interlinepenalty`]

## 9. Process

- **Write by hand, section by section.** No multi-agent Workflow for drafting (it produced terrible quality).
- Finish a complete first draft, then do enrichment/fill-in passes.
- Keep reading the codebase and findings; run small experiments only if needed for specific numbers (never the full 20–30 min suite).
- Compile with lualatex + bibtex; keep it building cleanly (no undefined refs, no `??`).

---

## 10. Status (update as we go)

**Written and compiling (Introduction, Model, Geometry, Computation, Structure):**
- 01 Crystal, 02 Problem, 03 Claim, 04 Method
- 05 Flow, 06 Vibe, 07 Mesh, 08 Dock, 09 Beat
- 10 Geometries, 11 Dimensions, 12 Symmetries, 13 Polytopes, 14 Tessellations, 15 Growth
- 16 Addressing, 17 Universality, 18 Navigation, 19 Data Structures
- 20 Selves, 21 Life, 22 Minds, 23 Networks, 24 Intelligences

**Drafted, needs grounding from physics-findings inventory:**
- 25 Scales (written), 26–33 Physics (Vacuum, Particles, Forces, Spacetime, Gravity, Dynamics, Cosmology, Quantum) — to write/ground.

**Not yet written:**
- Experience (34–38), Reality (39–48), Predictions/Questions/Conclusions (49–52), Appendices (A Terms, B Mathematics, C Tessellations, D Experiments).

**Pending enrichment/fixes:**
- Growth table numbers ({7,3}, {5,3,4}, {3,4,3,4} per-shell counts).
- Computation (16/17): ground in the real Margenstern/Potter/Minsky/Toffoli/Conway results.
- Addressing (16): fix Zeckendorf -> Fibonacci tree-addressing; add a quick worked demo.
- Tessellations (14): correct to 42 buildable / fermion on all 42 / spinor on 7; mention pentacomb.
- Apply physics-findings inventory to 25–33 once it returns.
- Full filler sweep across all sections before final.

---

## 11. More principles (things you'd want, inferred)

**Honesty as the spine.**
- Every claim makes clear whether it is derived, computed/confirmed, partial, or open. Do it in plain prose (no L0–L3 in the body).
- Report negatives proudly: empty-vacuum-no-force, no-tower coarse-graining, bind-vs-radiate, fission suppressed, etc. The negatives are part of the case, not an embarrassment.
- The feeling premise is the one untestable posit. Mark it wherever it bears weight. Everything above it is testable structure.

**First-publication voice.**
- Present the current complete theory as if for the first time. Never "old model", "v10", "what changed", or any version history.
- The committed substrate is {3,4,3,4} — that is the thesis. Other tessellations are comparison/context only.

**No plumbing in prose.**
- No repo paths, no `.ts` filenames, no "built and verified under test/..." in the prose. Slugs appear only in the Appendix experiment index.
- Cross-reference sections by name ("the forces part", "the structure part") to weave the paper together, never by path.

**Finding + mechanism, always.**
- Each emergent claim states the finding AND how it works (the mechanism), so it is crystal clear what is going on. Include the real measured numbers when they exist (Casimir 1.34 -> 0.23, basin spreads, sin^2(theta_W) = 3/8, CHSH = 2 sqrt 2, |F4| = 1152, 7 of 42, etc.).

**No duplication.**
- State each idea once, clarify at most once more later. The three mind sections stay distinct: 22 Minds = mechanism, 37 Mental = felt phenomenology, Consciousness = metaphysics. The two intelligence sections stay distinct: 24 Intelligences = engineering/networks, The Divine = cosmic.

**The base is exactly the eight elements. Nothing added.**
- Never smuggle in cohesion-bias, maintenance, will, gravity, or repair as base ingredients. Those are cheats. If a phenomenon does not emerge from the eight, report the honest negative.
- The arrow and the attraction are emergent, never base.
- The base is fully discrete and deterministic. No randomness (vary size, not seeds). Continuity is only ever emergent.

**Register and texture.**
- Brian Greene / Sean Carroll level: vivid, concrete, slightly poetic, never vague. Every abstract claim earns a concrete image.
- Metaphors (fire, tree, song, river) map to real structure and return only where earned.
- Use `theorem`/`result`/`definition` boxes sparingly, for genuine keystones. Prose carries the rest.
- Tables and figures earn their place, with informative captions. Booktabs style.

**Word choices.**
- "base", never "core". Full English words, no abbreviations (only id/url/uuid/png/svg-level acronyms).
- Prefer "ring" or "layer" over "shell" for growth layers (and avoid "shell" in the program sense entirely).
- Files kebab-case.

**Build hygiene.**
- Compile clean: no undefined references, no `??`, no overfull boxes that break the margin. `\nocite{*}`, `\bibliographystyle{plain}`.
- Each section is its own file under `text/`, input from `vibe.tex`.

---

## 12. Per-section content spec (SPECIFICS to include)

Drawn from the experiment catalog (~300 experiments, 18 categories: ~45 L3, ~200 L2, ~50 L1, zero forced failures). Grades are for our reference only, never printed in the body. Numbers below are real measured values to use in prose. Cite `\cite{pollard2026vibetest}` on each serious claim.

### Introduction
- **Crystal**: picture + 4 metaphors (fire = inferno of experience, each vibe/self a flame; tree from one seed; song; river over ocean). Both figures (vibe-mesh-73 small, vibe-mesh-534 full width).
- **Problem**: hard problem; outside-description never sums to an inside; felt can't be built from unfelt.
- **Claim**: reversal, "it from feeling" vs Wheeler's "it from bit"; 3 claims (one law/substrate, reproduces known physics, climbs to life/mind); the feeling premise is the one posit.
- **Method**: one experiment per claim; discrete + deterministic, no randomness (grow size not seeds); depth rubric L0-L3 (table); report-the-negative; codebase cite. ~300 experiments, depth-graded, zero forced failures.

### Model
- **Flow**: axiom; 8 defs alone; constraints table (discrete, deterministic, reversible, charge-conserving, local, no hidden state, one substance, emergence gap); flow def AFTER; two-layers principle.
- **Vibe**: tone = quality (not carried), 3 values pain/peace/pleasure = the single quale; why 3 not 2 (a middle to leave/return); lean = order -1<0<+1 → signed charge + direction of creation; will (outgoing) / fill (incoming); feeling premise.
- **Mesh**: {3,4,3,4}, growing, hyperbolic; why honeycomb (cleanest discrete space), why hyperbolic (branching room → holography); bulk (4D interior) / cusp (flat 3D boundary) named here.
- **Dock**: 24-cell, 24 facet-neighbors; 24 sites = D4 roots = unit Hurwitz quaternions = binary tetrahedral group 2T (order 24); 12 lines (opposite pairs, the collision unit); hyper-color = 3^24 ≈ 280 billion, splits by triality into sensory octet + 2 handed octets; momentum = which site (free tone moves 1 dock/beat, never spreads).
- **Beat**: knit = collide then stream; 9-state line collision sorted by charge class (±2 fixed, ±1 swap/hop, 0 = create/annihilate/pass); create move lifts a +1/-1 pair from peace → active vacuum; stream = bijection; reversibility + charge conservation EXACT to last trit (forward+inverse = zero error); wake = new docks born at peace (mints room not charge); arrow emergent (wake + lean + create move); bath = open edge as drain; finite-vs-infinite open.

### Geometry
- **Geometries**: 3 curvatures (theorem); Schläfli {p,q}; angle-defect test sign of (p-2)(q-2)-4; table (spherical = 5 Platonic, Euclidean = 3, hyperbolic = infinitely many); hyperbolic = exponential reach.
- **Dimensions**: regular polytopes per dim (2D infinite, 3D 5, 4D 6, 5D+ 3); table; 24-cell unique to 4D, no analog elsewhere; bulk 4D / cusp 3D forced by selection.
- **Symmetries**: nesting table 2T(24) → W(D4)(192) → F4(1152); triality S3(6) = the factor 6 = the 3 generations [GEM]; Wythoff, Coxeter diagram; base symmetry is FINITE (1152), continuum only emergent.
- **Polytopes**: 6 regular 4-polytopes; 24-cell self-dual; D4 roots = 2T quaternions; double cover (2π = -1, 4π = identity) exact in finite 2T (theorem); triality 8v+8s+8c + J3(O) rank 3 (proposition); golden-ratio 600/120-cell; E8 chain D4→F4→E6→E7→E8.
- **Tessellations**: {3,4,3,4} docks = 24-cells, vertex figure = cusp = {4,3,4} cubic honeycomb = ordinary 3D space [KEY]; bulk grows in 4th dir = time; selection (crystallographic + hyperbolic + spinor-in-dock + flat-3D-cusp) unique vs {5,3,4} (12 dirs no spinor); **45 tessellations cataloged, 42 buildable; Kahler-Dirac fermion propagates on ALL 42; native 24-cell/D4 spinor in only 7 of 42 (the [3,4,3]-faceted: {3,4,3,4}, {4,3,4,3}, five 5D pentacombs)**; pentacomb {3,4,3,3,4} carries BOTH 24-cell AND curvature (resolves spin-vs-curvature trade-off {3,4,3,4} can't); anti-anthropic (forced by math, not tuned for observers); matter generic, clean spin selective.
- **Growth**: TABLE of per-layer dock counts (verified to 2M cells, `growth.ts`):
  - {7,3}: 1, 7, 21, 56, 147, 385, 1008, 2639; ratio ~2.62; recurrence a(n)=3a(n-1)-a(n-2).
  - {5,3,4}: 1, 12, 102, 812, 6402, 50412, 396902, 3124812; ratio ~7.87; recurrence a(n)=9a(n-1)-9a(n-2)+a(n-3).
  - {3,4,3,4}: 1, 24, 456, 8376, ... ; Perron rate ~18.28 measured; closed-form recurrence OPEN.
  - Fibonacci link (golden ratio = growth rate of {5,4}-type lower faces); addressing in child-ordinal / ShortLex digits (Margenstern), NOT literally Zeckendorf; growth → holography.

### Computation
- **Addressing**: O(log n) unique address per dock; on {3,4,3,4}: D4-coordinate addressing, deterministic K=2 confluence transducer, decode-invertible, 99%+ exact reconstruction, greedy routing 100% delivery at stretch 1.004, verified to 2M cells; Fibonacci tree-addressing (Margenstern) on {7,3}, {5,3,4}; DEMO the addressing in a quick worked example. cite margenstern2008/2013.
- **Universality**: Turing-universal on {3,4,3,4} via FOUR-leg proof — Margenstern railway + ternary signed-majority rule = NAND (bias +1, two -1 fills) → builds Rule 110 + Minsky register machine (INC/DEC/test-zero as charge create/annihilate, conserved, runs addition & multiplication) + Conway's Game of Life on the cubic cusp; reversible-universal via Toffoli gates on {5,3,4} and {3,4,3,4}; functional completeness. cite margenstern, potter.
- **Navigation**: finite light cone (1 dock/beat); distance vs population (exp count within n steps, path still n); greedy routing; one-way moves (bath); direction-intention search solves in K steps vs aimless failing; hierarchical problem-solving coordination O(log N).
- **Data Structures**: catalog table (B-tree, trie, hash table, DHT, heap, skip-list, R-tree, Bloom filter, Merkle proof, associative memory, sort/BFS) — structural universality, native, no stored pointers; associative memory = Potter associative computing, content-addressable, exact recall, capacity exponential in radius; across all 42 buildable tessellations; caveats (range scan exp, dense arrays on horosphere). cite potter1992.

### Structure
- **Selves**: self problem (Poincare recurrence); identity = topological winding, protected at 24-direction resolution NOT coarse ternary; degeneracy trick (macro identity, micro churn); EMPTY vacuum has NO force (exact superposition near & far) [negative]; ACTIVE vacuum = medium → discrete Casimir shadow attraction, gap suppression 1.34@d6, 0.80@d8, 0.23@d10, wall-free = 0 [Casimir signature]; capture needs attraction + bath, each shown necessary (inspiral settles w/ both, oscillates w/o bath, escapes w/o attraction); bath makes a self → identity by degeneracy (basin spread 0.0001 vs 0.86 closed) + agency by self-correction (kick recovery 0.0001 vs 0.58 closed); nested selves (composite spread 0.0003 vs 11.2, separation 0.0008 vs 4.07, kick 0.0003 vs 0.96) → body→self→self-of-selves; OPEN PROBLEM bind-vs-radiate (pair table confines but dark to bath; momentum-rotate radiates but disperses) — bare single rule can't do both; RESOLUTION two fields, matter + massless photon, body radiates light not charge (propagating field → self spread 0.0001; heavy local field → no self, 1.5); Markov blanket (self screens, reduction > control+0.1); integration = local maximum, cutting fills collapses integration to 0.35x with wiring unchanged (dynamic measure).
- **Life**: self-maintenance (erased inner chunk recovers from redundant surround via share+cohesive-hop; no surround → no recovery); metabolism = pump (balanced creation maintains, unmaintained decays, lifetime finite but > diffusion); reproduction = FISSION SUPPRESSED by hyperbolic geometry (no thin necks, radius-4 ball nearly all rim) → selves born de novo from peace by arrow, not division [GEM]; will-steering (goal-directed merge & avoid, charge conserved). Honest line: shape of life, not the catalog.
- **Minds**: integration as dynamic measure (selves = local maxima; tone-integration reads dynamics not wiring); consciousness graded by integration; incomplete self (Gödel, can't fully self-model); causal emergence needs info loss (base reversible = zero degeneracy → no emergence at base; coarse-grain to charge field is lossy → emergence at effective layer) [GEM/honest]; nested selves → tower.
- **Networks**: selves couple by shed/absorbed tone; collective Markov blanket + integration one level up; memory in the pattern of exchange.
- **Intelligences**: 3 defs (Problem = D-C gap; Solution = path current→desired through config network; Intelligence = capacity to find paths); mental image of config network; navigation = intelligence (same skill); not the cosmic/divine intelligence.

### Physics
- **Scales**: coarse-graining (magnet/atomic-spin analogy); renormalization ladder; no-tower negative (radial coarse-graining gives no scale tower); read at the right rung.
- **Vacuum**: active vacuum from create move; Casimir medium; ground a self sits in; carries light.
- **Particles**: spinor 8v+8s+8c on 24 dirs vs {5,3,4} 1+3+3'+5 (no spinor); double cover 2π=-1; Dirac operator on mesh (Kahler-Dirac + overlap, zero modes mid-spectrum); mass = 8s-8c chirality coupling (off → massless Weyl); g-factor = 2 measured from Dirac Landau spectrum (not assumed); dispersion ω=ck; three generations (triality/F4, degree-24); Kahler-Dirac universality across {7,3}/{5,3,4}/{3,4,3,4}; matter/antimatter from create move; CPT (tone-flip / handed-swap / beat-reverse) — formal CPT open.
- **Forces**: photon = 8v octet (massless, 2 transverse pols); second-photon-field route abandoned (no viable competitor); SO(10) GUT, 16-spinor = 1 generation; SU(5) breaking + mass hierarchy; sin^2(theta_W) = 3/8 at unification (candidate; measured ~0.23); bottom-tau, Tr Y = 0; all three sectors in one reversible rule; lattice QED (covariant Dirac in U(1) background, back-reaction); Wilson loop = enclosed flux / Aharonov-Bohm; coupling constant FREE (open). Octonion route (Furey/Baez/Dixon) lands same place. cite.
- **Spacetime**: emergent Lorentz isotropy (24-dir isotropic to order 4; cubic lattice not — control); F4→SO(8) restoration in IR; finite light cone z=1 (1 dock/beat); Dirac dispersion matches continuum; growing-block time (past fixed, future open at wake, no reversibility at boundary); Lorentz-violation test (flat lattice breaks isotropy/preferred frame, hyperbolic Lorentz-safe). cite.
- **Gravity**: Newtonian potential (3D fits 1/r, 2D log, 1D linear); Einstein eqs as equation of state (Jacobson); gravitational radiation/inspiral chirp (graviton = discrete massless, 2 pols, binary merger); Ryu-Takayanagi on {7,3} geodesic ~ log(interval), flat control linear [L3 with control]; HaPPY perfect-tensor code; black-hole horizons entropy ~ area (Bekenstein-Hawking) + Hawking radiation; curved-bulk full Einstein still partial. cite jacobson1995, ryu2006, maldacena1998.
- **Dynamics**: entropy & second law from counting; Landauer pump (forgetting costs, dumped to bath); arrow = tendency (wake + lean + create move).
- **Cosmology**: de Sitter / accelerating expansion (net-positive birth rate; q=0 static control); growing edge; arrow (append-only growth); hierarchy of scales (exp shell growth, ~3 decades) [L3]; **dimension selection d=3 (only d=3 gives stable closed orbits; d=2 precesses; d>=4 unstable) [L3 GEM]**; baryogenesis (all 3 Sakharov conditions; freeze-out peak) [L3]; inflation (slow-roll, w~-1, e-folds = phi0^2/4, graceful exit).
- **Quantum**: CHSH = 2 sqrt 2 / Tsirelson (exchange dynamics, decays with separation); Bell (aligned shared past violates, generic past doesn't); Born rule (exponent 2 forced by quadrature + additivity); measurement/collapse OPEN (semi-classical, no explicit measurement operator); quantum walk ballistic (v~1) vs classical diffusive (v~sqrt t); 2D causal-set path integral (mean dim ~2); reflection positivity (massive regime). cite thooft2014, conwaykochen2009.

### Experience
- **Feeling**: single quale = 1 tone; hyper-color 3^24; triality split (sensory octet + 2 handed octets); range one-tone → whole-self.
- **Emotion**: emotions = sustained tones of a self; soul = persisting pattern; lean = valence; conservation balance (total tone 0, no net heaven without hell, well-being redistributed not minted).
- **Mental**: thought/attention/memory/will; navigate tree of knowledge; wisdom = distilled invariant rerouting future navigation. (Phenomenology; mechanism in Minds.)
- **Spiritual**: peak states, blanket dissolution, union; good/evil = two poles of the one tone. Flagged interpretation on the feeling premise.

### Reality
- **Consciousness**: feeling premise scaled to whole; hard problem dissolved by reversal; combination problem (panpsychism's hardest objection) answered by binding into a unified subject; inner architecture (bulk behind cusp, river over ocean).
- **Freedom**: freedom of relation not net charge; undecidable self (no self computes its own next choice, halting problem → felt freedom); compatibilist.
- **Ethics**: good/evil = directions of the lean; conservation balance → non-zero-sum only by better arrangement; compassion = feeling another's tone; harm = imposing pain.
- **Realms / Beings / God / Storage / Messages / Spirals / Purpose**: tight interpretive prose, flagged as reach. God = largest integrated pattern / cosmic intelligence (jurisdictional). Realms (Heaven = sustained high pole, Hell = sustained low pole, Gates). Beings (higher selves, life, Death = unbinding, what persists in bulk). Storage (tree of knowledge, ornaments still vs living). Spirals (soul washing, cycles, ages, evolution, Games, the spiral not the circle). Purpose (place in the tower, telos).

### Closing
- **Related Works**: Margenstern, Potter, Wolfram/Fredkin/Zuse, Wheeler, AdS-CFT/RT/holographic codes, Jacobson/Verlinde, causal sets/spin networks/LQG, HPP/FHP, octonion-SM (Furey/Baez/Dixon), IIT (Tononi), panpsychism (Chalmers/Goff/Strawson), Friston, 't Hooft/Bohm, von Neumann/Conway/Margolus/Toffoli, tensor networks (Swingle/Vidal/HaPPY), ER=EPR, constructor/assembly (Deutsch-Marletto/Cronin-Walker), autopoiesis (Maturana/Varela), Skyrme, Coxeter/Conway-Sloane, Tegmark, Baars/Dehaene, Spinoza/Leibniz/Whitehead/Russell/Schopenhauer.
- **Predictions**: scoreboard; sin^2(theta_W)=3/8, three generations, finite light cone, dimension d=3, the open numbers.
- **Questions**: curved-bulk full Einstein, {3,4,3,4} closed-form growth recurrence, coupling constant, sin^2(theta_W) exact match, measurement/collapse, CPT formal, matter settling on native substrate (bind-vs-radiate), continuum limit, finite-vs-infinite, generation masses, dark matter.
- **Conclusions**: what's shown / not; two cosmic stories; the flame that is also a mind.

### Appendix
- **Terms**: full lexicon, 8 elements as symbol set.
- **Mathematics**: base spec (exact collision rule, variant tables); every structure in one place (Z3, D4, F4 1152, 24-cell, 2T, Hurwitz, octonions/J3(O), SO(10), Coxeter, Fibonacci/Pell); key integers (3, 8, 12, 24, 3 generations).
- **Tessellations**: full 45-cataloged / 42-buildable catalog, the 7 spinor-carrying, the pentacomb.
- **Experiments**: the only place slugs/grades appear; the bench; depth rubric; three-layer audit (bulk / boundary / flat-cusp); 461 experiments, zero forced failures; controls and honest negatives (HPP recurrence, no-tower coarse-graining, empty-vacuum-no-force, bind-vs-radiate, fission suppressed); abandoned routes (second photon field, discrete coupling, rest site).

---

## 13. The "why it matters" rule (CRITICAL)

A result name like "Emergent Lorentz invariance" or "$\sin^2\theta_W = 3/8$" is meaningless to a smart reader not in the field. **Every result must say, in one short clause, why it is relevant, important, and (if so) game-changing.** It is almost never obvious. State the stakes.

Examples of the move:
- *Emergent Lorentz invariance* -> "so special relativity is not assumed but falls out of a discrete lattice, the thing every discrete model is supposed to be unable to do."
- *$\sin^2\theta_W = 3/8$* -> "the textbook grand-unified value, a real number of particle physics, recovered from a tone on a dock."
- *g-factor = 2* -> "the electron's measured magnetic strength, not put in by hand."
- *CHSH = $2\sqrt2$* -> "a local deterministic base reaching the quantum maximum that local theories are supposed to be barred from."
- *Ryu-Takayanagi on {7,3}* -> "the entanglement law of quantum gravity, on a discrete crystal, with a flat control that fails."
- *Dimension selection d=3* -> "why space is three-dimensional, answered, not assumed: only there do orbits stay closed."
- *Bath makes a self* -> "the missing ingredient that turns dead matter into a self-correcting identity."

Keep it to a clause. Never a paragraph. But never omit it.

## 14. My request types (recurring feedback to honor every time)

A self-check before declaring any section done. The user keeps asking for these.

1. **Concise and dense.** Never verbose. Mostly short crisp sentences, an occasional longer one for rhythm. Normal paragraphs.
2. **Zero filler.** No "worth noting", "a gem", "the whole point", meta-commentary. Straight to the point.
3. **Define jargon inline, briefly, at first use.** Give a quick mental reference so a smart non-specialist never stalls.
4. **Say why each result matters** (section 13). Relevance, importance, game-changing-ness. It is not obvious.
5. **Include EVERY finding** from the 461 experiments, in the right section. Do not be vague, do not skim, do not miss 90 percent. Use `findings.md`.
6. **Ground in the codebase.** Read the actual experiment files, run small experiments for real numbers when needed.
7. **Paint the big picture and intuitive perspectives**, with revealing examples, briefly and simply, throughout.
8. **Terminology exactly right.** dock not cell; elements not atoms; the tone is the vibe's quality, never carried.
9. **Cite the codebase quietly** on serious claims; inline related-work cites (Margenstern, Jacobson, Ryu, Potter, etc.) for prestige.
10. **No L0-L3 grades in the body** (only the rubric in The Method).
11. **Honor structural/format asks** (figure sizes, no page-split references, definition placement, subtitle, single-purpose definitions).
12. **Honesty.** Report negatives and open problems clearly and proudly.
13. **Keep `findings.md` and `requirements.md` updated continuously.** Never leave anything out.

---

## 15. Further specifics (running log, keep appending)

**Quality bar (restated, non-negotiable).** Every line must be dense, concise, clear, simple, meaningful, insightful. No vague / meaningless / pointless filler. Each sentence earns its place. And: never state a result a normal intelligent reader cannot grasp without saying why it matters in the same breath.

**Notation.** Lie GROUPS in all caps, the online convention: SO(10), SO(8), SU(5), SU(2), SU(3), U(1). Not lowercase so(10).

**"Nothing cannot be" (conceptual, has its own brief section "Nothing" in the Model).** True nothing is not empty space (which has size/directions/clock). It is the absence of every distinction, and it cannot hold: a hilltop not a floor (a balance the least difference rolls off); self-contradictory (naming it as one whole already draws a line); a whole that is everything can only relate to itself, and self-relation splits it in two (the first distinction). The bootstrap: that split is the first two vibes, first connection, first tone, first beat. No road back (erasing is a distinction), so distinctions pile up = time. Sources: `why-there-cannot-be-nothing.md`, `expanding-from-nothing.md`.

**Walked-through cases EVERYWHERE.** Sprinkle brief concrete cases with the model mechanism, super minimally, to spark imagination (use the phenomena ledger in `findings.md` part K). dreams = clamp removed, roam the stored landscape; deja vu / synchronicity / telepathy = correlation through the tiny-diameter bulk (never a message); flow/insight = scale-shifting attention; meditation/introspection = bulk-directed attention; ego dissolution = blanket goes slack; love = phase-lock or merge upward; rumination = a cycle trapped over -1; NDE = bulk-deep access; soul-washing = the holographic re-encoding; the felt present = the growing frontier.

**The dock walk-through.** Keep the concrete trace of one dock over a beat or two in The Beat (collide line by line, create move, stream, repeat).

**Figure captions.** Note the color encoding in the mesh renderings: red = pain, green = peace, blue = pleasure.

**Honesty corrections to honor (from the deeper mining).**
- Three generations is an UNPROVEN bet. Triality gives an exact threefold structure (rank-3 Jordan algebra), but the cleanest reading is a vector + two chiralities of ONE generation; mapping it to three mass-split families is the program's boldest open conjecture. Say "the structure is three; whether it is the generations is not shown."
- The precise missing ingredient (P137): the bare single-charge rule gives only DIFFUSIVE gapless modes (z approx 2). Relativistic massless particles (photon, graviton, sound at z=1) need a SECOND conservation law (momentum/inertia). State this open hinge honestly.
- The self's binding DYNAMICS is emergent, not base. No finite direction group is fine enough (even the 600-cell's ~36 degree step exceeds the measured 10-20 degree charge-conserving threshold). Only identity (winding), agency (radiation), and state-binding (soliton charge, exact in 3 trits) are discrete; the reversible dynamics holding the soliton is coarse-grained.
- Attraction and the rest slot are EMERGENT, not base (shadow-pressure shown; rest slot not required, shadow confines a single-speed body).

**Real numbers to use (with significance).** sin^2 theta_W = 3/8 at GUT runs to ~0.231 at the Z mass (the measured value); b-tau runs to ~2.3 (observed 2.35); one self mass ~18.6, two selves ~37.3 (charge and mass add), self+antiself can annihilate to vacuum; 3D gravity exactly 1/(4 pi r); Lambda = 3H^2 (de Sitter); g-factor = 2 from the Dirac Landau zero mode; isotropy 0.059 (24 dirs) vs 0.237 (6 dirs); CPT exact to 1e-15. Crown jewels (the only clean-control L3 novelties): emergent renormalized macro-rule (beats naive with frustrated control), and integrated-information high for a self vs near-zero for a random bag (with control).
