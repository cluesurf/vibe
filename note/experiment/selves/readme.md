# Selves arena

**176 experiments.** Codes [`E-SLF-0001`](../../../test/experiment/selves/abiogenesis-threshold.ts) through [`E-SLF-0176`](../../../test/experiment/selves/nested-garment-identity.ts). Files in `test/experiment/selves/`. This is the largest arena. Note: 175 rows carry codes in `test/registry.csv`, and `renormalization-tower.ts` (its file declares [`E-SLF-0100`](../../../test/experiment/selves/renormalization-tower.ts)) is present but not yet listed in the registry, so 176 files map to 176 codes.

## What this arena tests

Vibe theory says a **self** is not fundamental. A self is an **emergent, bound, self-maintaining pattern** in the discrete substrate, a Markov-blanket-like agent that arises when the reversible base rule is **coarse-grained with loss**. The cells turn over, the field stays, the gathering holds itself together for a while. This arena asks whether such an agent actually forms from the five base things, and what follows once it does: **binding** (what makes a pattern hold), **agency** (goal-directed action and will), **integration** (a whole more than its parts), **identity** (persistence through total turnover), **death** (the gathering loosening), **nesting** (selves of selves), a **self-model** (a part that mirrors the whole), and **self-localization** (where on the geometry a self can live).

The methodology is strict. Every claim carries a **control that could have failed**: a degree-preserving **SCRAMBLE**, a time-**shuffle**, a **FLAT diffusion** baseline, a no-dynamics run, or a lossless-versus-**lossy** comparison. Depth follows the rubric. **L1** confirms known mathematics or composes a measured factor. **L2** reproduces a construction on the substrate with a control. **L3** is a measured, controlled, novel consequence of the base rule. The arena is explicit about scope: many results explicitly mark an **added ingredient** (an imposed maintenance rule, a hand-coded planner, a scalar willpower budget) as **not base-emergent**, and several are flat negatives reported as findings.

## Sub-themes

### 1. Binding physics: mobility versus the binding engine

The central obstruction. On the committed coin every direction has one speed, so a local reversible rule cannot both **move** a structure and **bind** it. Capture would shed relative motion, and shedding is dissipation the bulk forbids.

- **[`E-SLF-0005`](../../../test/experiment/selves/arrow-binds-but-seals.ts)** - the arrow rule binds a body but seals its radiation, the momentum rule radiates but will not bind, so binding and radiation are disjoint.
- **[`E-SLF-0012`](../../../test/experiment/selves/bind-and-move-collision.ts)** - no single-speed reversible collision both confines and travels, mobility and the create-flip-annihilate engine are mutually exclusive.
- **[`E-SLF-0016`](../../../test/experiment/selves/capture-needs-dissipation.ts)** - a reversible sticky reflection scatters elastically and cannot capture, so binding needs the open bath.
- **[`E-SLF-0021`](../../../test/experiment/selves/soliton-self.ts)** - co-moving charges are not a bound self, a hit to the body is never healed (no restoring force), a plain negative.
- **[`E-SLF-0060`](../../../test/experiment/selves/integrable-breather.ts)** - a reversible breather exists on the D4 coin but is pinned, there is no moving breather.
- **[`E-SLF-0068`](../../../test/experiment/selves/leaky-confiner.ts)** - the leaky confiner holds a body yet seals its radiation, the perturbation never reaches the bath.
- **[`E-SLF-0075`](../../../test/experiment/selves/mobile-rule-d4.ts)** - a momentum-conserving reversible collision makes a lone particle travel on the D4 coin, and the pair table pins it.
- **[`E-SLF-0077`](../../../test/experiment/selves/multi-speed-coin-b4.ts)** - the B4 two-speed coin is mobile and valid but does not lift the binding obstruction, capture is architectural.
- **[`E-SLF-0083`](../../../test/experiment/selves/no-emergent-bound-body.ts)** - no emergent bound body, even a vortex disperses, its persistence is only reversible recurrence.
- **[`E-SLF-0084`](../../../test/experiment/selves/no-restoring-pressure.ts)** - no committed rule contracts a diffuse cloud, so a bound body does not emerge from the pure gas.
- **[`E-SLF-0092`](../../../test/experiment/selves/per-cell-radiation-obstruction.ts)** - per-cell ternary has no self, a radiating rule shatters the kink and a static rule traps the hit, so the corrective self must be emergent.
- **[`E-SLF-0103`](../../../test/experiment/selves/rest-slot-identity.ts)** - a rest slot gives a persistent bound identity that radiates free disturbances, but self-repair still needs attraction.
- **[`E-SLF-0109`](../../../test/experiment/selves/scatter-d4.ts)** - a head-on pair is deflected onto a rotated axis by the momentum collision, not passed through.
- **[`E-SLF-0128`](../../../test/experiment/selves/soliton-search-d4.ts)** - free gliders are solitons that persist and move, but head-on collisions disperse rather than bind.
- **[`E-SLF-0131`](../../../test/experiment/selves/substrate-self-obstruction.ts)** - on the committed coin confinement and radiation conflict, no rule gives a confined body that radiates to the bath.
- **[`E-SLF-0143`](../../../test/experiment/selves/two-field-self.ts)** - a confined body becomes a self only when coupled to a **propagating** field (the photon), not a local one.

### 2. Attraction mechanisms: shadow-pressure, Casimir, vacuum depletion, gravity

How a self attracts at all without a new fundamental force. The answer is **radiation-pressure shadow**: a vacuum-excluding body is struck more from the open side, so a test mass drifts toward it, the correct sign, reversible in the bulk.

- **[`E-SLF-0017`](../../../test/experiment/selves/casimir-capture-mobile.ts)** - the vacuum Casimir pressure drives two **mobile** plates together (capture), the inert vacuum leaves them fixed.
- **[`E-SLF-0018`](../../../test/experiment/selves/casimir-vacuum-attraction.ts)** - the active vacuum exerts a Casimir attraction, the wall gap is suppressed and the force falls with distance.
- **[`E-SLF-0043`](../../../test/experiment/selves/emergent-attraction-search.ts)** - the bare reversible rule has no emergent attraction, two separated charges obey exact superposition, a negative that motivates the shadow mechanism.
- **[`E-SLF-0046`](../../../test/experiment/selves/equivalence-principle.ts)** - a self sources gravity in proportion to its mass and falls universally, the equivalence principle on the substrate.
- **[`E-SLF-0053`](../../../test/experiment/selves/gravity-bound-self.ts)** - the full self on legitimate ingredients, a discrete gravity field at the cusp binds and self-repairs while disturbances radiate.
- **[`E-SLF-0074`](../../../test/experiment/selves/minimal-attraction-field.ts)** - the attraction needs only a few bounded bits, ternary is too coarse and about four bits repair a self, no unbounded integers.
- **[`E-SLF-0105`](../../../test/experiment/selves/reversible-radiation-pressure.ts)** - reversible radiation pressure on B4 is sub-critical, a slow mass oscillates and disperses rather than drifting to depletion.
- **[`E-SLF-0111`](../../../test/experiment/selves/self-contained-shadow-self.ts)** - a self-contained body binds itself by the shadow of its **own** active vacuum on the 24-direction D4 coin.
- **[`E-SLF-0124`](../../../test/experiment/selves/shadow-confines-single-speed.ts)** - shadow pressure confines a single-speed body at short range, so the rest slot is not required for binding.
- **[`E-SLF-0125`](../../../test/experiment/selves/shadow-pressure-attraction.ts)** - a vacuum-excluding body attracts a test mass by discrete radiation-pressure shadow, correct sign, reversible bulk.
- **[`E-SLF-0126`](../../../test/experiment/selves/shadow-pressure-d4.ts)** - shadow-pressure attraction on the real 24-direction D4 coin, net momentum points toward the excluding body.
- **[`E-SLF-0138`](../../../test/experiment/selves/ternary-field-attraction.ts)** - the attraction field is ternary tones, one trit per cell repairs range 2 and three trits range 3, no bits and no unbounded integers.
- **[`E-SLF-0147`](../../../test/experiment/selves/vacuum-depletion-attraction.ts)** - attraction from the active vacuum with no new field, depletion repairs range 2 and a dedicated emission field range 3.

### 2b. The bath, dissipation, and the arrow of openness

Capture, healing, and time's arrow come from the **open boundary**. A closed torus only recurs, an absorbing edge is a bath.

- **[`E-SLF-0009`](../../../test/experiment/selves/bath-coupled-self.ts)** - coupling a captured body to the bath gives it an attractor (identity) and a corrective response (agency).
- **[`E-SLF-0010`](../../../test/experiment/selves/bath-damps-soft-mode.ts)** - the absorbing boundary absorbs everything and the closed torus recurs exactly, an arrow of openness, not of healing.
- **[`E-SLF-0011`](../../../test/experiment/selves/bath-from-open-boundary.ts)** - an absorbing boundary is a bath (the burst radiates away and relaxes), the torus is not (it recurs).
- **[`E-SLF-0045`](../../../test/experiment/selves/emergent-soft-radiation.ts)** - a soft (gapless) sound mode emerges from discrete ternary tones, period grows linearly with wavelength, no real numbers.
- **[`E-SLF-0054`](../../../test/experiment/selves/growth-arrow-irreversibility.ts)** - a growing open mesh carries an arrow of time (broken echo, steady gradient) the closed reversible bulk lacks.
- **[`E-SLF-0059`](../../../test/experiment/selves/inspiral-capture.ts)** - attraction plus a bath captures (inspiral and settle), removing either one prevents capture.

### 3. Topological identity and solitons

A self's identity is a **topological winding** of the direction field, an integer a reversible local rule cannot change. This survives at the 24-cell resolution and needs a Skyrme-type stabilizer.

- **[`E-SLF-0008`](../../../test/experiment/selves/bare-rule-persistence-3434.ts)** - a linear diffusion rule disperses a winding defect while an amplitude-preserving nonlinear rule locks it.
- **[`E-SLF-0037`](../../../test/experiment/selves/derrick-stabilizer.ts)** - Derrick scaling needs a Skyrme term in 3D, and only a direction field carries winding.
- **[`E-SLF-0039`](../../../test/experiment/selves/discrete-kink-unstable.ts)** - the discrete sine-Gordon kink is unstable, a bounded force shatters it and an unbounded force blows it up.
- **[`E-SLF-0040`](../../../test/experiment/selves/dm-skyrmion-bound-self.ts)** - a DM-stabilized topological soliton is a stable reversibly-bound self, charge conserved, fixed size, robust to perturbation.
- **[`E-SLF-0098`](../../../test/experiment/selves/quaternion-twist-binding.ts)** - the DM stabilizer is a pure quaternion rotation (a twist angle, the coin handedness), no real coupling, and it binds a stable Skyrmion.
- **[`E-SLF-0104`](../../../test/experiment/selves/reversible-dynamics-step-threshold.ts)** - reversible discrete dynamics conserves the Skyrmion charge at small steps and goes chaotic at large (coarse) steps.
- **[`E-SLF-0127`](../../../test/experiment/selves/soliton-persistence-3434.ts)** - a reversible conserving box-ball rule produces persistent solitons that survive collisions.
- **[`E-SLF-0139`](../../../test/experiment/selves/ternary-skyrmion-charge.ts)** - a 3-trit-per-cell direction field encodes the Skyrmion charge exactly, the topological state is fully ternary.
- **[`E-SLF-0140`](../../../test/experiment/selves/topological-persistence-3434.ts)** - a winding-1 defect persists under relaxation while a winding-0 bump decays.
- **[`E-SLF-0141`](../../../test/experiment/selves/topological-winding-identity.ts)** - the self identity is a topological winding, protected at the 24-cell resolution but not at coarse ternary.

### 4. Emergence and self-organization

A self appears from **cohesion** and adaptive fills, not from fixed tones alone. Above a critical seed it nucleates, and demand-driven creation self-tunes it to a set-point.

- **[`E-SLF-0001`](../../../test/experiment/selves/abiogenesis-threshold.ts)** - a self-maintaining region nucleates above a critical seed size and dies below it, the abiogenesis transition (imposed majority-hysteresis rule, sharp critical radius).
- **[`E-SLF-0044`](../../../test/experiment/selves/emergent-self-robust.ts)** - a self emerges by cohesion and conserving maintenance holds it against decay.
- **[`E-SLF-0067`](../../../test/experiment/selves/l3-self-from-base-rule.ts)** - the pure reversible base rule confines a packet into a persistent bounded structure, streaming alone spreads it.
- **[`E-SLF-0076`](../../../test/experiment/selves/morphogenesis-pattern.ts)** - an activator-inhibitor rule self-organizes a regular striped pattern whose wavelength is set by the rule, not the seed.
- **[`E-SLF-0093`](../../../test/experiment/selves/perception-dynamics.ts)** - charge conserved, the arrow creates life from peace and no-arrow relaxes, a dynamic balance that diffuses and pumps.
- **[`E-SLF-0112`](../../../test/experiment/selves/self-emergence.ts)** - fixed fills do not self-organize selves, adaptive fills do.
- **[`E-SLF-0117`](../../../test/experiment/selves/self-organized-criticality.ts)** - demand-driven creation self-tunes the activity to one interior set-point from any start, self-organized criticality.
- **[`E-SLF-0118`](../../../test/experiment/selves/selves-as-attractors.ts)** - stable basin, persistent identity, and capacity that grows with size, selves as attractors.
- **[`E-SLF-0120`](../../../test/experiment/selves/selves-at-scale.ts)** - coherent self-patches emerge on the exact {5,3,4}, far larger than random, with a size hierarchy.
- **[`E-SLF-0121`](../../../test/experiment/selves/selves-dynamics.ts)** - the largest self grows while a hierarchy of patches persists on the exact {5,3,4}.
- **[`E-SLF-0175`](../../../test/experiment/selves/balance-endures.ts)** - a balanced (paired) charge cluster self-organizes to a compact bound remnant while an unbalanced cluster cannot pair and disperses, so only balanced structure endures.

### 5. Maintenance, memory, and persistence

A self lives only while **repair keeps pace with decay**. Charge is conserved but the pattern is not, so maintenance costs work.

- **[`E-SLF-0007`](../../../test/experiment/selves/autonomous-self.ts)** - a purely local repair rule raises self fidelity over the unmaintained control, but not robustly past a 0.6 bar.
- **[`E-SLF-0015`](../../../test/experiment/selves/bulk-persistence.ts)** - a stored pattern decays, redundancy extends its survival, and maintenance makes it permanent.
- **[`E-SLF-0032`](../../../test/experiment/selves/cohesive-memory.ts)** - a cohesive hop roughly doubles imprint memory versus the churning rule.
- **[`E-SLF-0070`](../../../test/experiment/selves/maintenance-threshold.ts)** - a self lives only while repair keeps pace with decay, and dies below that threshold.
- **[`E-SLF-0072`](../../../test/experiment/selves/memory-vs-conservation.ts)** - charge is conserved while the pattern decays, and maintenance holds it at a work cost.
- **[`E-SLF-0094`](../../../test/experiment/selves/permanent-memory.ts)** - a maintained codeword stays at full fidelity where the unmaintained one erodes, conserving, at a cost.
- **[`E-SLF-0095`](../../../test/experiment/selves/persistence-problem.ts)** - a pattern lasts only if its identity is topological, the bath makes it last, a closed system only recurs.
- **[`E-SLF-0096`](../../../test/experiment/selves/persistent-self.ts)** - a self-maintaining integrated region keeps its identity and boundary, the unmaintained pattern dissolves.
- **[`E-SLF-0114`](../../../test/experiment/selves/self-maintenance.ts)** - a self heals its own damage by the rule alone, the control with no surround does not.

### 6. Identity through turnover, death, and reincarnation

A self is a **gathering, not its cells**. It keeps identity while every cell is replaced, and dissolves when the gathering loosens.

- **[`E-SLF-0022`](../../../test/experiment/selves/coarse-autopoietic-closure.ts)** - the self maintains a stable organization while its cells turn over, the cohesion-off control does not.
- **[`E-SLF-0057`](../../../test/experiment/selves/identity-persists-through-turnover.ts)** - a self keeps its identity by repair through total substance turnover, a structureless self dies.
- **[`E-SLF-0099`](../../../test/experiment/selves/reincarnation.ts)** - the self persists through total turnover and reconstitutes from a seed, reincarnation as pattern persistence.
- **[`E-SLF-0119`](../../../test/experiment/selves/selves-as-propagating-structures-3434.ts)** - the identity-through-turnover measure scores a glider as a self and the perception-rule seed as churn.
- **[`E-SLF-0160`](../../../test/experiment/selves/dissolution-death.ts)** - holding the cell count and scattering them drops the binding margin through the death threshold, the gathering loosening while the field remains.
- **[`E-SLF-0176`](../../../test/experiment/selves/nested-garment-identity.ts)** - a state coarse-grains into nested garments each the exact block-sum of the finer, and the total-charge identity carries through every layer, while a leak dissolves it though the nesting stays exact.

### 7. Integration, Markov blanket, and causal emergence

The coarse-graining criteria for a self. A genuine self **screens** interior from exterior through its shell, is a **local maximum of integration**, and keeps more effective information than a random coarse map.

- **[`E-SLF-0013`](../../../test/experiment/selves/binding-improves-model.ts)** - a bound self carries more predictive information about its environment than an unbound gas.
- **[`E-SLF-0019`](../../../test/experiment/selves/causal-emergence.ts)** - a coarse-grained macro has more effective information than the degenerate micro.
- **[`E-SLF-0023`](../../../test/experiment/selves/coarse-causal-emergence.ts)** - a structured coarse map keeps more effective information than a random one, measured on real self dynamics.
- **[`E-SLF-0025`](../../../test/experiment/selves/coarse-commuting-square.ts)** - the learned effective rule commutes with one micro beat far better than a random rule.
- **[`E-SLF-0026`](../../../test/experiment/selves/coarse-implied-timescale.ts)** - the self slow timescale plateaus across lags, the shuffled control has no timescale.
- **[`E-SLF-0028`](../../../test/experiment/selves/coarse-light-cone.ts)** - a self contains and corrects an interior perturbation, the medium spreads it, a coarse light-cone.
- **[`E-SLF-0029`](../../../test/experiment/selves/coarse-markov-blanket.ts)** - an emergent self screens interior from exterior through its shell more cleanly than medium, the Markov-blanket test.
- **[`E-SLF-0030`](../../../test/experiment/selves/coarse-size-robustness.ts)** - the self slow-mode survives across lattice sizes, the shuffled control fails at every size.
- **[`E-SLF-0031`](../../../test/experiment/selves/coarse-spectral-gap.ts)** - the Markov model of a real self has a slow mode the time-shuffled control lacks.
- **[`E-SLF-0061`](../../../test/experiment/selves/integrated-information.ts)** - selves are tone-integration local maxima, and the measure reads the dynamics, not just the wiring.
- **[`E-SLF-0062`](../../../test/experiment/selves/integration.ts)** - a configuration has a Markov-blanket score and an integration proxy, locating where a self sits.
- **[`E-SLF-0065`](../../../test/experiment/selves/l3-breather-self-criteria.ts)** - the base-rule breather screens through its shell and contains an interior perturbation more than the vacuum.
- **[`E-SLF-0066`](../../../test/experiment/selves/l3-causal-emergence-needs-loss.ts)** - the reversible base rule is a permutation with no degeneracy, so causal emergence needs information loss.
- **[`E-SLF-0158`](../../../test/experiment/selves/individuation-margin.ts)** - a compact region on {3,4,3,4} individuates (internal integration exceeds external coupling) while no region on a degree-matched scramble does.
- **[`E-SLF-0159`](../../../test/experiment/selves/concrescence-jump.ts)** - many parts bound into one occasion are more individuated than the parts alone (Whitehead concrescence), a jump the scramble does not show.

### 8. Self-model, prediction, and attention

A **strange loop**: a localized hub comes to mirror the whole self, predict its own next state, and weight slow meaningful input above fast noise. No infinite regress, the lossy mirror converges.

- **[`E-SLF-0006`](../../../test/experiment/selves/attention-workspace.ts)** - the deterministic hub-workspace attention differential is consistently positive but does not robustly clear the bars, open.
- **[`E-SLF-0041`](../../../test/experiment/selves/dreaming-and-waking.ts)** - waking is pinned to one veridical memory while dreaming roams the landscape.
- **[`E-SLF-0069`](../../../test/experiment/selves/lossy-self-model-feeds-back.ts)** - detail a self cannot see in its coarse model still feeds back into its determined choice.
- **[`E-SLF-0071`](../../../test/experiment/selves/many-self-models.ts)** - every self forms its own self-model at its own hub.
- **[`E-SLF-0073`](../../../test/experiment/selves/metacognition.ts)** - the self-model predicts the self next state, beating local regions, a usable forward model.
- **[`E-SLF-0085`](../../../test/experiment/selves/no-self-storage.ts)** - a lossless self-record needs the whole, the lossy regress converges, there is no infinite mirror.
- **[`E-SLF-0086`](../../../test/experiment/selves/p121-recursion.ts)** - hub2 represents hub1, the chain world to model1 to model2 of model1, recursion.
- **[`E-SLF-0115`](../../../test/experiment/selves/self-model.ts)** - a localized hub represents the self global state, beating local regions and a shuffle.
- **[`E-SLF-0130`](../../../test/experiment/selves/structural-attention.ts)** - a self attends to its slow meaningful input far above an equal-size fast-noise input, emergent structural attention.
- **[`E-SLF-0153`](../../../test/experiment/selves/world-model.ts)** - a self interior carries predictive information about its future environment, the controls do not, a world-model.
- **[`E-SLF-0174`](../../../test/experiment/selves/repeating-thought-cycle.ts)** - a stored association cycle is an attracting limit cycle (a repeating thought reached from noisy cues) while scrambling the weights leaves no cycle.

### 9. Nested selves, towers, and the multiscale self

Selves nest. Coupled sub-selves **bind into one higher self** that repairs its own parts, and a structured coarse map keeps effective information across recursive levels where a random tower loses it. The surrogate tower is the multiscale-self program.

- **[`E-SLF-0033`](../../../test/experiment/selves/composite-self-level.ts)** - a captured composite has the metastable slow mode the self-level needs, a dispersing packet does not.
- **[`E-SLF-0035`](../../../test/experiment/selves/cooperation-tower.ts)** - integration wins on total order and recurs into a tower, a cooperation tower.
- **[`E-SLF-0078`](../../../test/experiment/selves/nested-bath-selves.ts)** - two bath-coupled bodies bind into a higher composite self with its own identity and agency, selves nest.
- **[`E-SLF-0079`](../../../test/experiment/selves/nested-self-tower.ts)** - a self of selves, the structured causal map keeps effective information across **two** recursive coarse-grainings, a random tower loses it.
- **[`E-SLF-0080`](../../../test/experiment/selves/nested-selves.ts)** - small wounds heal, whole-cell flips persist, the body stays intact, nested selves.
- **[`E-SLF-0081`](../../../test/experiment/selves/nested-selves-form-a-higher-self.ts)** - coupled sub-selves bind into one higher self that repairs its own parts, the upward step on the ladder.
- **[`E-SLF-0082`](../../../test/experiment/selves/nesting-controls.ts)** - the flat-cusp form-tower beats a pure-diffusion control (the nesting control that could have failed).
- **[`E-SLF-0091`](../../../test/experiment/selves/p57-recursion.ts)** - higher vibes are aggregate views with no stored layer, self-similar, inherited-stable, towering.
- **[`E-SLF-0100`](../../../test/experiment/selves/renormalization-tower.ts)** - the measured level-0 compression composes into an effective vibe count of N_top times C to the L, a scale accounting (L1, present as a file, not yet registered).
- **[`E-SLF-0102`](../../../test/experiment/selves/resonance-between-selves.ts)** - two aligned selves lock into resonance while two anti-aligned selves frustrate each other.
- **[`E-SLF-0122`](../../../test/experiment/selves/selves-interacting.ts)** - opposite selves annihilate at contact, same selves merge into one.
- **[`E-SLF-0133`](../../../test/experiment/selves/surrogate-conservation.ts)** - the base conserves total charge exactly, the local re-estimate drifts, a leaking rule breaks it (surrogate conservation).
- **[`E-SLF-0134`](../../../test/experiment/selves/surrogate-fidelity.ts)** - a learned surrogate of a self forward-predicts its held-out coarse future, the controls do not.
- **[`E-SLF-0135`](../../../test/experiment/selves/surrogate-patch-test.ts)** - a patch test detects surrogate drift after a regime change, the stationary self gives no false alarm.
- **[`E-SLF-0136`](../../../test/experiment/selves/surrogate-speedup.ts)** - the surrogate-tower speedup grows geometrically at bounded fidelity, over-compression collapses it.
- **[`E-SLF-0137`](../../../test/experiment/selves/surrogate-tower-climb.ts)** - a temporal surrogate tower climbs several levels with forward accuracy bounded above chance and the control.
- **[`E-SLF-0142`](../../../test/experiment/selves/tower-of-selves.ts)** - a clean multi-level hierarchy to one top, the rule holds at every level, a tower of selves.
- **[`E-SLF-0144`](../../../test/experiment/selves/two-self-interaction.ts)** - two opposite-charge selves annihilate at contact but not at range, same-charge selves never do.
- **[`E-SLF-0157`](../../../test/experiment/selves/field-coupling-at-range.ts)** - a body-hit on one body changes the field record at a distant body through the shared mesh alone, the severed-mesh control gives an exact zero, and the response attenuates with separation.

### 10. Agency, will, and planning

Goal-directed action. Steering changes where a determined life ends, effort is a real cause, and a planner built only from the arrow, the rule, and the will crosses a barrier greedy cannot. Several of these mark an added planner or scalar as **not base-emergent**.

- **[`E-SLF-0003`](../../../test/experiment/selves/alignment-lowers-conflict.ts)** - an aligned self has low internal conflict and a decisive urge, a fragmented self is torn.
- **[`E-SLF-0004`](../../../test/experiment/selves/arbitrary-structure.ts)** - the goal-directed builder reaches and holds several arbitrary balanced targets.
- **[`E-SLF-0038`](../../../test/experiment/selves/detour-planning.ts)** - lookahead beats greedy on a barrier when the horizon spans it (added hand-coded lookahead, not base-emergent).
- **[`E-SLF-0042`](../../../test/experiment/selves/effort-is-a-cause.ts)** - more goal-directed effort gives a better determined outcome and zero effort a worse one, so it does not happen anyway.
- **[`E-SLF-0050`](../../../test/experiment/selves/flat-intention.ts)** - directed intention works on the flat layer.
- **[`E-SLF-0063`](../../../test/experiment/selves/integration-amplifies-agency.ts)** - a coherent self reaches its goal while a fragmented self of the same parts cannot, so integration amplifies agency.
- **[`E-SLF-0064`](../../../test/experiment/selves/intention-at-scale.ts)** - the will coherently biases the whole self, but directed action is geometrically frustrated at scale.
- **[`E-SLF-0088`](../../../test/experiment/selves/p153-integrated-agent.ts)** - the closed perceive-plan-act loop crosses a sequence of barriers, beating reactive and one-shot.
- **[`E-SLF-0090`](../../../test/experiment/selves/p162-integrated-agent.ts)** - multi-step lookahead through the forward model solves a detour the reactive agent cannot.
- **[`E-SLF-0097`](../../../test/experiment/selves/planning-no-additions.ts)** - a planner built only from the arrow, the rule, and the will crosses a barrier greedy cannot, no additions.
- **[`E-SLF-0129`](../../../test/experiment/selves/steering-changes-the-trajectory.ts)** - the same deterministic life steered versus unsteered ends in a different place, and that gap is the impact.
- **[`E-SLF-0132`](../../../test/experiment/selves/subtle-layer-urges.ts)** - a deep layer steers the surface and reasserts after disorder, subtle-layer urges.
- **[`E-SLF-0150`](../../../test/experiment/selves/will-fork.ts)** - a self delays gratification with willpower, relapses when depleted, the field overrides, a sharp threshold (willpower added as a scalar, decision-logic only).
- **[`E-SLF-0151`](../../../test/experiment/selves/will-steering.ts)** - with the will a self moves toward a target and away from a threat, the unbiased self does not.
- **[`E-SLF-0152`](../../../test/experiment/selves/willpower-grounded.ts)** - a charge reserve depletes when a self pumps against a draining field, willpower grounded in conserved charge.
- **[`E-SLF-0155`](../../../test/experiment/selves/plan-vs-tracking-crossover.ts)** - a frozen-snapshot planner is optimal in a static world, and past a measured drift-rate crossover a locally-sensed tracker wins, the plan-versus-signal trade made exact.
- **[`E-SLF-0156`](../../../test/experiment/selves/coherence-route-beats-shortest.ts)** - the coherence-preserving route beats the shortest route through a hazardous world and ties in the benign control, the good path findable from the local signal and invisible to geometry.
- **[`E-SLF-0171`](../../../test/experiment/selves/zeno-holding.ts)** - the holding strength of a self scales monotonically with the rate of re-imposition, Stapp quantum-Zeno volition as a graded law under conservation.

### 11. Free will: determined yet irreducible

A choice **replays exactly** yet resists a one-step shortcut, is authored by the self's own structure, and is eroded by an uncaused spark. Determinism without predetermination.

- **[`E-SLF-0020`](../../../test/experiment/selves/choice-determined-yet-irreducible.ts)** - a choice replays exactly yet resists a one-step shortcut, and the self structure is what makes it irreducible.
- **[`E-SLF-0036`](../../../test/experiment/selves/deliberation-depth-hides-the-outcome.ts)** - the deeper a self must deliberate, the more its determined outcome hides from a cheap predictor.
- **[`E-SLF-0051`](../../../test/experiment/selves/freedom-choice.ts)** - a choice is determined yet self-authored and irreducible (a Hopfield self resolving an urge).
- **[`E-SLF-0145`](../../../test/experiment/selves/uncaused-spark-erodes-authorship.ts)** - an uncaused spark lowers self-coherence, so the deterministic self is the most self-authored.
- **[`E-SLF-0146`](../../../test/experiment/selves/urge-is-the-voice-of-your-parts.ts)** - the urge is the aggregate of a self parts, the parts are real causes, and the self not the urge resolves the choice.
- **[`E-SLF-0170`](../../../test/experiment/selves/free-will-signature.ts)** - an act is determined from outside (exact replay) yet unpredictable from within (same coarse view, divergent future), Faggin free will from determinism without randomness.

### 12. Valence and felt quality

The tone **is** the felt value, pain at minus and pleasure at plus, and a self acts on it. The base has no built-in drive toward pleasure, the arrow points toward the center.

- **[`E-SLF-0034`](../../../test/experiment/selves/conflict-resolves-toward-peace.ts)** - opposed tones resolve toward peace while agreeing tones persist, so the base valence arrow points at the center, not the pleasure pole.
- **[`E-SLF-0148`](../../../test/experiment/selves/valence-approach.ts)** - a self drifts toward a +tone region and away from a -tone region, and not without the dynamics.
- **[`E-SLF-0149`](../../../test/experiment/selves/valence-mirror-symmetry.ts)** - flipping pain and pleasure mirrors the dynamics exactly, so the base has no drive toward pleasure.
- **[`E-SLF-0173`](../../../test/experiment/selves/consonance-valence.ts)** - consonant intervals sit in roughness valleys with the fifth a local minimum while dissonant intervals peak, and the valleys vanish for pure tones, the Symmetry Theory of Valence via consonance.

### 13. Self-localization, geometry, and reproduction

**Where** a self can live. The hyperbolic bulk is all-boundary and disperses selves, so selves condense on the **flat horosphere**, where compact low-boundary patterns hold. Dimension fixes the exchange statistics, and reproduction is geometry-gated.

- **[`E-SLF-0014`](../../../test/experiment/selves/bulk-curvature-disperses.ts)** - bulk curvature disperses, it does not bind, hyperbolic shells grow exponentially and the flat cusp polynomially.
- **[`E-SLF-0027`](../../../test/experiment/selves/coarse-individuality-transition.ts)** - the individuality-transition signatures appear only with imposed group selection and a single-cell bottleneck, not from the base rule.
- **[`E-SLF-0047`](../../../test/experiment/selves/evolving-ecology.ts)** - a population of planning agents evolves better problem-solving and adapts its foresight.
- **[`E-SLF-0048`](../../../test/experiment/selves/fine-group-too-coarse.ts)** - no finite direction group (not even the 600-cell) is fine enough for a stable discrete dynamics, the self is forced emergent.
- **[`E-SLF-0049`](../../../test/experiment/selves/fission-flat-layer.ts)** - a self divides on the flat layer where the hyperbolic bulk cannot.
- **[`E-SLF-0055`](../../../test/experiment/selves/heredity.ts)** - a daughter inherits the parent with tunable variation, heredity as conserving creation.
- **[`E-SLF-0056`](../../../test/experiment/selves/horosphere-self.ts)** - selves are compact-possible and far more persistent on the flat horosphere than in the bulk.
- **[`E-SLF-0058`](../../../test/experiment/selves/inner-bulk-capacity.ts)** - the hyperbolic bulk grows exponentially and the flat cusp polynomially, room for the inner experiencer.
- **[`E-SLF-0087`](../../../test/experiment/selves/p152-evolution.ts)** - heredity plus variation plus selection drives mean fitness up, beating drift.
- **[`E-SLF-0089`](../../../test/experiment/selves/p161-evolution.ts)** - selection raises fitness, drift does not, and the population re-adapts to a new environment.
- **[`E-SLF-0101`](../../../test/experiment/selves/reproduction.ts)** - fission is suppressed on hyperbolic geometry, a self stays one.
- **[`E-SLF-0106`](../../../test/experiment/selves/s53333-selves.ts)** - topological solitons exist on the 4D horosphere but are over-dimensional.
- **[`E-SLF-0107`](../../../test/experiment/selves/s534-selves.ts)** - solitons on the 2D horosphere are anyonic, not the 3D fermions of {3,4,3,4}.
- **[`E-SLF-0108`](../../../test/experiment/selves/s73-selves.ts)** - solitons on the 1D horocycle are kinks with no exchange statistics.
- **[`E-SLF-0110`](../../../test/experiment/selves/selection-by-persistence.ts)** - deterministic variation plus persistence-selection adapts a population toward its environment, with no randomness.
- **[`E-SLF-0116`](../../../test/experiment/selves/self-nesting-73.ts)** - the {7,3} hyperbolic bulk has no radial nesting tower.

### 14. Bridges to consciousness and mind theories

Named research programs reproduced on the substrate as controlled measurements: IIT, global workspace, split-brain, anesthesia, Assembly Theory, and the interface and predictive-processing views.

- **[`E-SLF-0161`](../../../test/experiment/selves/anesthetic-integration-collapse.ts)** - anesthesia as a reversible, dose-dependent, integration-specific collapse of the bound self, modelled classically with no coherence (Hameroff bridge).
- **[`E-SLF-0162`](../../../test/experiment/selves/classical-record-persistence.ts)** - the classical record holds its spatial pattern over time while a coherent field disperses, the spatial form of coherence-free persistence (Hameroff bridge).
- **[`E-SLF-0163`](../../../test/experiment/selves/combination-transition.ts)** - unified experience switches on sharply as two selves combine, the combination problem as a phase transition.
- **[`E-SLF-0164`](../../../test/experiment/selves/split-brain-fission.ts)** - cutting the commissure splits one self into exactly two coherent loci while a same-size random lesion shatters it, the discrete split-brain.
- **[`E-SLF-0165`](../../../test/experiment/selves/spatial-vs-temporal-binding.ts)** - spatial co-presence integrates strongly while a same-size feed-forward temporal chain does not, the McFadden spatial-binding discriminator.
- **[`E-SLF-0166`](../../../test/experiment/selves/global-workspace-ignition.ts)** - a stimulus ignites into a global broadcast above a critical seed and stays local below it, the all-or-none global-workspace nonlinearity.
- **[`E-SLF-0167`](../../../test/experiment/selves/assembly-index-threshold.ts)** - built and selected structures have a low assembly index while random noise has a high one, Assembly Theory on the substrate.
- **[`E-SLF-0168`](../../../test/experiment/selves/interface-perception.ts)** - a fitness-tuned perception carries more information about fitness than a truth-tuned one when fitness is non-monotonic, Hoffman interface theory measured.
- **[`E-SLF-0169`](../../../test/experiment/selves/controlled-hallucination.ts)** - a predictive perceiver tracks input then runs on its prior when input is ablated (a controlled hallucination) while a memoryless perceiver falls silent, Seth predictive processing.
- **[`E-SLF-0172`](../../../test/experiment/selves/exclusion-postulate.ts)** - integration peaks at a definite interior maximum at the core boundary (a bordered complex) while a homogeneous graph has none, the IIT exclusion postulate.

### 15. Controls and negatives

Results whose whole point is a **control that could have failed** or a plain negative, reported as findings. These pin what the base does **not** do.

- **[`E-SLF-0002`](../../../test/experiment/selves/active-persistence.ts)** - the apparent refuge relocation is a refuge halo, the self dies where it is and none of its charge reaches the refuge, a negative.
- **[`E-SLF-0024`](../../../test/experiment/selves/coarse-causal-emergence-mobile.ts)** - mobility alone yields no causal-emergent self-level, the mobile gas has no metastable coarse mode.
- **[`E-SLF-0052`](../../../test/experiment/selves/full-self-positive-control.ts)** - positive control, a rest slot plus an explicit (cheat) attraction give a full self with identity, self-repair, and radiation.
- **[`E-SLF-0113`](../../../test/experiment/selves/self-emergence-perception.ts)** - living balance is structureless churn, no durable selves from tones alone.
- **[`E-SLF-0123`](../../../test/experiment/selves/selves-tower-3434.ts)** - the coarse-grained form-tower on {3,4,3,4} does not beat a pure-diffusion control.
- **[`E-SLF-0154`](../../../test/experiment/selves/navigation-not-base-emergent.ts)** - the bare committed rule does not navigate, a structured body shows no centroid drift toward a charge-rich resource, while the declared selves-layer valence lean shows a large approach differential, so goal-directed movement is not base-emergent.

## What this arena establishes

- **The self is emergent, never fundamental.** No committed reversible local rule gives a moving bound self on its own (**[`E-SLF-0012`](../../../test/experiment/selves/bind-and-move-collision.ts)**, **[`E-SLF-0083`](../../../test/experiment/selves/no-emergent-bound-body.ts)**, **[`E-SLF-0084`](../../../test/experiment/selves/no-restoring-pressure.ts)**, **[`E-SLF-0131`](../../../test/experiment/selves/substrate-self-obstruction.ts)**). Binding, capture, and healing require **lossy coarse-graining** and the **open bath** (**[`E-SLF-0016`](../../../test/experiment/selves/capture-needs-dissipation.ts)**, **[`E-SLF-0059`](../../../test/experiment/selves/inspiral-capture.ts)**, **[`E-SLF-0066`](../../../test/experiment/selves/l3-causal-emergence-needs-loss.ts)**). The self is what the substrate looks like after loss, exactly the theory's claim.
- **Attraction and identity are geometric, not new forces.** Binding comes from **radiation-pressure shadow** on the D4 coin with the correct sign (**[`E-SLF-0111`](../../../test/experiment/selves/self-contained-shadow-self.ts)**, **[`E-SLF-0125`](../../../test/experiment/selves/shadow-pressure-attraction.ts)**, **[`E-SLF-0126`](../../../test/experiment/selves/shadow-pressure-d4.ts)**), and identity is a **topological winding** protected at the 24-cell resolution (**[`E-SLF-0040`](../../../test/experiment/selves/dm-skyrmion-bound-self.ts)**, **[`E-SLF-0141`](../../../test/experiment/selves/topological-winding-identity.ts)**). Selves live on the **flat horosphere**, not the all-boundary hyperbolic bulk (**[`E-SLF-0056`](../../../test/experiment/selves/horosphere-self.ts)**, **[`E-SLF-0014`](../../../test/experiment/selves/bulk-curvature-disperses.ts)**).
- **A self is a gathering, not its cells.** It keeps identity through total turnover (**[`E-SLF-0057`](../../../test/experiment/selves/identity-persists-through-turnover.ts)**, **[`E-SLF-0099`](../../../test/experiment/selves/reincarnation.ts)**) and dies when the gathering loosens below the binding margin (**[`E-SLF-0160`](../../../test/experiment/selves/dissolution-death.ts)**). Life is repair outrunning decay at a work cost (**[`E-SLF-0070`](../../../test/experiment/selves/maintenance-threshold.ts)**, **[`E-SLF-0094`](../../../test/experiment/selves/permanent-memory.ts)**).
- **Integration, agency, and a self-model follow once binding holds.** A self screens interior from exterior (**[`E-SLF-0029`](../../../test/experiment/selves/coarse-markov-blanket.ts)**), is a local maximum of integration (**[`E-SLF-0061`](../../../test/experiment/selves/integrated-information.ts)**), forms a hub that mirrors and predicts the whole (**[`E-SLF-0115`](../../../test/experiment/selves/self-model.ts)**, **[`E-SLF-0073`](../../../test/experiment/selves/metacognition.ts)**), and steers a determined life to a different end (**[`E-SLF-0129`](../../../test/experiment/selves/steering-changes-the-trajectory.ts)**). Selves nest into higher selves (**[`E-SLF-0078`](../../../test/experiment/selves/nested-bath-selves.ts)**, **[`E-SLF-0081`](../../../test/experiment/selves/nested-selves-form-a-higher-self.ts)**).
- **Free will is determinism without predetermination.** A choice replays exactly yet is irreducible and self-authored, and an uncaused spark only erodes authorship (**[`E-SLF-0020`](../../../test/experiment/selves/choice-determined-yet-irreducible.ts)**, **[`E-SLF-0170`](../../../test/experiment/selves/free-will-signature.ts)**, **[`E-SLF-0145`](../../../test/experiment/selves/uncaused-spark-erodes-authorship.ts)**).
- **Controls, flags, and reported negatives.** Controls that could have failed are everywhere (SCRAMBLE, shuffle, FLAT diffusion, no-dynamics), added ingredients are flagged as **not base-emergent** (**[`E-SLF-0038`](../../../test/experiment/selves/detour-planning.ts)**, **[`E-SLF-0150`](../../../test/experiment/selves/will-fork.ts)**, **[`E-SLF-0154`](../../../test/experiment/selves/navigation-not-base-emergent.ts)**), and plain negatives are reported as results (**[`E-SLF-0002`](../../../test/experiment/selves/active-persistence.ts)**, **[`E-SLF-0021`](../../../test/experiment/selves/soliton-self.ts)**, **[`E-SLF-0113`](../../../test/experiment/selves/self-emergence-perception.ts)**, **[`E-SLF-0123`](../../../test/experiment/selves/selves-tower-3434.ts)**).

## License

MIT

## ClueSurf
