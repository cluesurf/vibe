# The field content of the committed rule, and what is still missing

Measured 2026-09-02 on `lineWeave`, side 17 and side 25, all probes deterministic.
The question answered here: treating the committed rule as a quantum field theory,
what species does it contain, which of them interact, and what does full coverage
of the quantum field still require.

## The species spectrum (all 24 directions, one defect each)

| band | directions | behavior |
| --- | --- | --- |
| ballistic matter | 10 clock-couple matter directions, plus 2 of the 4 swap-couple directions | support exactly 1, speed exactly root 2 (one D4 step per beat, the light cone) |
| breathers | all 10 clock-couple wire directions | speed 0, bounded within 2 steps, EXACT period 6 recurrence of the whole difference field |
| radiating | 2 of the 4 swap-couple directions (the matter line's backward end, the wire line's forward end) | a linear-growth trail, about 5.7 new difference slots per beat, all of it inside the swap couple |

Three readings, one per band:

- The ballistic band is the massless sector. Speed root 2 is the model's light speed.
- A breather is a massive particle at rest: localized, and oscillating at its own
  internal clock with exact period 6, which is twice the vacuum clock frequency
  (vacuum period 12). Mass as internal oscillation, the de Broglie clock picture,
  measured rather than posed.
- The radiating band is the emission vertex the gauge ledger row asks for: a moving
  source continuously converting between matter and wire quanta, leaving a
  linearly growing wake. It exists only in the swap couple.

## The interaction map (difference-field additivity, exact tests)

| configuration | result |
| --- | --- |
| head-on, clock-couple matter, true collision course | EXACTLY free, zero deviation from the sum of solo runs at every beat |
| head-on, swap-couple matter, true collision course | real scattering: deviation turns on after the crossing and grows (2, 4, 7, 9, 15 slots) |
| same cell, matter of couple 0 + matter of couple 1 | EXACTLY decoupled, zero deviation |
| same cell, couple-0 matter + couple-0 wire | contact interaction from beat 1 (2, 4, 6, 8, 14, ... slots) |

Structural fact behind the third row, verified in the code and by measurement: the
collide step of `lineWeave` reads and writes only the four slots of one couple, and
streaming preserves slot identity, so THE SIX COUPLES ARE FULLY DECOUPLED
SUBSYSTEMS. They share only the active-cell geometry (growth fronts, reflection,
walls all gate whole cells). Also by construction: clock-couple matter slots are
never touched by any collide, so five of the six matter species are exactly free
fields.

## Antiparticles and exclusion, structural

- Tone 2 is the exact antiparticle of tone 1: clock amplitude root 3 at minus 150
  degrees against root 3 at plus 150, conjugate at every beat, in both the free and
  the interacting sector.
- A slot holds one tone. Two same-mode excitations cannot coexist, only a changed
  value. Exclusion is not a statistics postulate here, it is the state space.

## The one-in-six observation (recorded as counting, not as a claim)

The weave has exactly 1 interacting couple and 5 sterile ones, decoupled from it
except through geometry. The observed cosmic dark-to-visible matter ratio is about
5.4 to 1 (Planck: Omega_c about 0.265, Omega_b about 0.049). If the sterile couples
are read as dark sectors coupled only gravitationally, the counting gives 5 to 1
uninvited. This is a numerological observation until the wall-energy-to-potential
coupling exists (the `dark_matter_phenomena` row's named gap). It is recorded
because the structure (dark = same matter, decoupled except through shared
geometry) is exactly the phenomenology dark matter presents.

## What full coverage of the quantum field still requires

In priority order, each tied to its ledger row:

1. CROSS-SPECIES COUPLING (gauge universality). One photon must couple to every
   charged species. Six decoupled sectors cannot express that: today interaction
   is confined to couple 0. Either a cross-couple collide term is added (a base
   change, adoption-gated, needs the same acceptance battery), or the couples are
   read as one visible sector plus five dark ones and universality is only needed
   inside couple 0, or coupling arises through the shared geometry (the
   gravitational channel that already exists). This is the deepest architectural
   gap and the fork should be decided deliberately.
2. THE QUADRATIC WEIGHT (Born rule). The detector responds to the count of
   amplifying defects, not the squared amplitude. Standing negative, honestly
   held. The coarse bridge (dense tilings, many defects per coarse cell) is the
   one open route.
3. THE GAUGE ALGEBRA OF THE CARRIER. The emission vertex now exists (the radiating
   band). Missing: showing the wire sector's quanta compose with a gauge group
   structure, and identifying which carrier is massless (couple-0 wire, dressed by
   the swap) versus massive (the clock-wire breathers).
4. THE COARSE BRIDGE (quantum_amplitude_at_the_base). Derive the walk sector as
   the continuum limit of the dressed traveller. The spectrum above gives the
   dictionary entries (masses, speeds, vertices) the bridge must reproduce.
5. LORENTZ INVARIANCE. Speed root 2 along D4 directions only, anisotropy at the
   lattice scale, expected and stated. Needs the coarse isotropy measurement.
6. DYNAMICAL SCALAR (Higgs). The breather is a localized massive mode and the
   clock condensate is a phase field with history-selected vacua. Missing: the
   doublet structure, and the breather-to-condensate coupling.
7. MULTI-PARTICLE STRUCTURE. Wave packets, the uncertainty bound saturated
   dynamically, bound states of two or more excitations (the nuclear ladder for
   `bbn_abundances` and `periodic_table_shell_structure`).
8. SAKHAROV CONDITIONS (baryon_asymmetry). C and CP violation exist by
   construction and growth is out of equilibrium. Missing: a measured net
   asymmetry between tone-1 and tone-2 populations under growth.

The rest of the open ledger (Weinberg running, alpha's value, Koide, absolute
masses) is algebra or free input in any theory, and stays honestly labeled.

## Measured follow-ups (2026-09-02, this branch)

The spectrum, the interaction map, the antiparticle statement and the Sakharov
mechanism are now formal experiments: E-FND-0113 (weave-species-spectrum),
E-FND-0114 (weave-interaction-map), E-FND-0115 (weave-antiparticle-conjugation),
E-FND-0116 (weave-sakharov-asymmetry). All four pass with exact gates and their
controls read exactly zero. Notable exact results: the breather period is 6 for
all ten clock-wire directions, C violation is 54 slots in the radiating mode and
0 in both free sectors, and the quench asymmetry is quantized in whole
hypersheets (multiples of side cubed) with the commensurate quench an exact null.

## The turning weave, a candidate answer to gauge universality

The obstruction to universality was measured, not guessed: species connectivity
needs at least eleven interaction edges, no single schedule element of the
384-element torus symmetry group gives a swap orbit longer than nine lines, and
the triality cosets of the full 1,152 group do not act on the integer torus.
The candidate that clears it is a TWO-CLOCK SCHEDULE, the turning weave: the
couple partition precesses under a fixed period-4 group element while the swap
rotates through the six couples, total period twelve, exactly the vacuum clock
period. Twelve of the 384 elements give twelve swap edges covering and
connecting all twelve lines (the search is task/turning-weave-search.ts, the
battery task/turning-weave-battery.ts and task/turning-weave-window.ts,
candidate element index 148).

Measured on the candidate, side 9 and side 21:

| gate | result |
| --- | --- |
| echo, 24 beats generic state | EXACTLY zero, charge drift zero |
| vacuum clock | EXACT period 12 survives the schedule |
| separated superposition | exact, worst mismatch zero |
| universality | 22 of 24 directions interact (support above one), against 4 of 24 under the committed weave |
| dressed traveller, window safe | support saturates near 17 and oscillates, a dressed quasiparticle, no runaway |
| protected modes | 2 directions stay exactly free for 20 beats, phase-protected (their motion never meets the swap trigger window), not structurally sterile, since the swap orbit covers all 12 lines and the element has no fixed line |
| quench charge | total exactly conserved, line charges quantized in multiples of side cubed |
| the honest difference | the commensurate-quench null does NOT carry: k=3 also charges under the turning schedule, later and smaller |

Not yet measured, the decisive remaining gates before this candidate can even be
proposed for adoption: the CPT fingerprint under schedule reversal (the group
sweep redone with time-dependent rules), the wall sector (periodicity and the
quantum law), interference re-derivation, and the identification of the
couple-0 particle physics inside the turning schedule. The dark-sector reading
changes under this candidate (all couples visible, dark matter falls back to
the wall candidate), and the phase-protected free modes are a new species class
worth naming only if they survive the full battery.
