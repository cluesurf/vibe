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

## RESOLVED (2026-09-02, later the same day): the palindromic turning weave

The cyclic turning weave FAILED CPT: the full 384-element sweep at every phase
found zero survivors, and the counter-turning schedule is not its partner
either. The repair is the same principle that fixed lineHop at the collision
level, applied one level up: make the SCHEDULE a palindrome. The partition
walks out and back under the element, the swap order runs out and back, and
the design space (720 swap orders, 8 by 12 mirror phases) contains winners
that are BOTH connected and CPT-exact. The first winner (order
0-2-3-1-4-5, both phases zero, element 148, period 24) passes every gate,
formalized as E-FND-0117 (foundations/palindromic-turning-weave) with the
cyclic schedule as the built-in negative control:

| gate | result |
| --- | --- |
| cyclic schedule CPT (control) | zero survivors, whole group, every phase |
| winner CPT | EXACT, pure charge conjugation with time reversal at mirror phase 23, IDENTITY spatial parity, zero of 48,000 dense checks |
| species graph | 12 swap edges covering and connecting all 12 lines |
| universality | 21 of 24 directions interact |
| echo and charge | exactly zero drift |
| vacuum | exactly periodic at the schedule period 24 |
| separated superposition | exact |

The remaining acceptance gates before this can be proposed for adoption: the
wall sector (quantization and periodicity), interference re-derivation, unit
kicks, and the long-window dressed profile (the support at side 21 reads
2 through 15 over twenty beats with a late sample at 22, bounded so far but
not yet run past one full schedule period on a window-safe mesh). The search
scripts are permanent: task/turning-weave-search.ts (the cyclic search),
task/turning-weave-palindrome-search.ts (the palindromic design sweep),
task/turning-weave-battery.ts and task/turning-weave-window.ts.

## The battery is CLEARED (2026-09-02, E-FND-0118)

The palindromic turning weave passed the full acceptance battery lineWeave
earned. E-FND-0118 (foundations/turning-weave-acceptance) closes the four
remaining gates, each with its control:

| gate | result |
| --- | --- |
| vacuum | exactly periodic FROM BIRTH, the empty state recurs at beat 24, zero transient across three periods. The commensurability quantum is 24 beats |
| unit kick | a three-regime law: blind slabs (offsets 1, 2) leave the protected traveller exactly alone, kicking slabs (7, 11, 13, 17) move its phase by EXACTLY one clock unit at support one, absorbing slabs (3, 5) dress it, stated not hidden |
| interference | exact: kicked branch at 30 against free branch at 150, additivity 2e-12, eleven aligned beats at twice root three, six crossed beats at exactly root three (root three at 90) |
| walls | content quantized in whole side-cubed sheets and exactly period 24 (closed-system statements, no window needed). Localization is window-limited: a dominant core at the slab column plus a one-pass birth-radiation front |
| dressing | past a full schedule period the protected species holds support exactly one, the interacting species is a breathing dressed particle (core max 15, returns to nearly bare) with a slow trail (total 27 after 26 beats, an order of magnitude under the committed rule's radiating band) |

Together with E-FND-0117 (CPT exact under pure charge conjugation with time
reversal, the cyclic schedule failing everywhere as the control, connected
universality, echo, superposition), the candidate now holds everything the
committed rule held, plus what it could not: one connected interaction
structure over all twelve species. The two known physical differences from
the committed rule, stated plainly: the Sakharov commensurate null moves
from three beats to the schedule period, and defect formation radiates a
one-pass front. Adoption is the user's decision. On adoption, lineWeave
becomes the previous committed rule exactly as pairCollision did, and
survives inside the turning weave as its frozen-schedule sector.

## Canon under the turning weave, part one (E-FND-0119)

The counting-weight law carries exactly (slab response 5, 10, 15 to one, two,
three defects, ratios 2.000 and 3.000) and the Sakharov structure carries
(total tone sum exactly zero at every beat, per-line charges quantized in
whole sheets, settled asymmetry of one to five sheets), with the asymmetry now
spread across lines on the schedule rather than confined to one fixed couple,
which is the universality of the interaction showing up in the baryogenesis
channel. Part two (condensate, second law, the walk-sector bridge) stays open
pending the adoption decision.

## The graphene crossover, scoped (from the chronoflux lead)

The one usable lead in the chronoflux poster is its empirical anchor: the
Dirac fluid regime of graphene, a lab-real relativistic electron fluid whose
shear viscosity to entropy density ratio approaches the conjectured quantum
bound (one over four pi in natural units). The model already holds both
ingredients:

- `test/experiment/fluids/emergent-shear-viscosity.ts`: a finite shear
  viscosity with the decay rate scaling as k squared, one nu across
  wavenumbers and sizes, with a no-shear-mode control.
- `test/experiment/fluids/second-law-coarse-entropy.ts`: the coarse entropy
  measurement on the same gas.

The crossover experiment: measure nu and the coarse entropy density s on the
SAME thermalized state of the momentum-conserving gas, form the dimensionless
ratio, and compare its size against the graphene measurements and the one
over four pi bound. The honest open piece is unit identification: the bound
is stated in units of hbar over Boltzmann's constant, and the model's hbar
analog must come from its own clock quantum (the unit kick) rather than being
chosen to fit, or the comparison is numerology. That identification question
is the experiment's real content and should be posed first as a small note
deriving the model's natural hbar from the measured unit-kick law. Everything
else in the chronoflux poster (continuity to consciousness to matter as one
mechanism) supplies no computable rule and is not actionable. The recovered
tree of nature poster (the prime spine) has no mechanism at all and is not
actionable either.

## ADOPTED (2026-09-02): turningWeave is the committed rule

The user adopted the palindromic turning weave after the battery cleared.
`code/rule/collision.ts` now exports `turningWeave` as THE COMMITTED RULE
(the hardcoded G_TURN line permutation verified equal to element 148, and
the exported collisions verified beat-for-beat identical to the battery's
schedule, forward and inverse, with forward composed with inverse the exact
identity, tmp/probe-adoption-check.ts). `lineWeave` is the PREVIOUS
committed rule, kept as the turning weave's frozen-schedule sector, exactly
as `pairCollision` stepped down before it. The readme reflects the adoption
(the committed-rule paragraph, the walkthrough, the rule bullet, and four
new hits: the particle table, universality with CPT kept, the graphene-band
viscosity ratio E-FLD-0019, and quantized Sakharov matter-from-nothing).
Remaining after merge, in the main tree: regenerate the scoreboard from the
ledger once the ledger rows touched by universality are re-worded, and run
the full suite at the next natural end. Canon part two under the adopted
rule (condensate, second law, the walk bridge) is the open research stream.

## Canon part two, first results (E-FND-0120), and the predictions folder

Two findings the committed rule did not have, both passing as
E-FND-0120 (foundations/turning-weave-relic-and-mass):

- THE RELIC BACKGROUND: no growth quench rate is null under the
  adopted rule (the static weave's commensurate null is gone), because
  domain formation permanently scatters radiation into the bulk, the
  model growing its own relic background. The relic is lawful: whole
  hypersheets at every settled beat of every rate, floors 174, 110, 48
  sheets at k of 1, 12, 24 (falling with commensurability at the deep
  end, not monotone across all rates, reported as measured).
- MASS FROM DRESSING: the protected species is exactly ballistic
  (speed root two to the last decimal), the interacting species move
  at species-dependent fractions of it (1.76 and 3.08 cells per eight
  beats against 11.31). Interaction generates effective mass, and it
  differs by species under one rule, the mechanism shape the
  mass-hierarchy rows need. The dispersion relation proper is the
  coarse-bridge deliverable.

The predictions folder is note/prediction/: the index, the hard
predictions (kill shots and staked numbers), technologies, the
anomalous claims assessed with tests, consciousness, intelligence
(with the quantum-computing counting-signature prediction and the
field-sector dictionary), metaphysics (the realm coordinates made
testable), and the ordered next steps.

## The breather energy ladder (E-FND-0121)

The hbar identification's first falsifiable test, passed in refined
form. The naive eigenstate reading is measured false (the Z three
clock amplitude shows a period-three class cycle, the wrong meter for
a period-six object, recorded as the instrument negative). The
temporal spectrum decides: power at exactly the harmonic ladder of
the predicted fundamental (E of zero, one half, one, three halves in
kick-law hbar units) and machine-zero power at every off-ladder
frequency. The breather is a bound state carrying the harmonic series
of E equals one half, which is what E-FLD-0019 staked.

## The second law closes canon part two (E-FND-0122)

Matter ordered into the left quarter climbs from column entropy ln 3
to 99 percent of the ln 9 ceiling in 48 beats under the adopted rule,
the 25 fluctuation drops are counted and reported, and the exact
inverse schedule returns the ordered microstate at Hamming zero, the
echo serving as the control that the rise is coarse bookkeeping and
not dissipation. Canon part two now stands: counting and Sakharov
carried (E-FND-0119), the condensate law became the relic-background
law (E-FND-0120), the breather energy ladder confirmed the kick-law
hbar in refined form (E-FND-0121), and the second law holds
(E-FND-0122). The one remaining canon item is the walk-sector bridge,
which is the coarse-bridge programme, the program's central open
derivation.
