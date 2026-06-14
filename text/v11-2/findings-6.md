# Findings 6, The Discrete Discipline, We Never Introduced the Reals

The methodological spine of the whole program. The base is fully discrete and deterministic from the first line to
the last. Tones are ternary, the law is a permutation table, motion is integer relabeling, momentum is an integer
sum, time is a beat count. No real number, no decimal, no continuous rate, and no randomness ever enters the base.
Continuity, when it appears, is always EMERGENT, the coarse-grained average of discrete grains, never assumed. This
file shows that by example, including the moments where a real number was the easy answer and was refused. Cite
`\cite{pollard2026vibetest}`.

## The base, by example, every quantity is an integer or a trit

The state is a tone in `{-1, 0, +1}` on each of a dock's 24 sites. The law (the knit) acts on a line (an opposite
pair) by a 9-entry table whose every output is again in `{-1, 0, +1}`, real output from the code.

| line in `(left, right)` | line out | kind | exact inverse |
| --- | --- | --- | --- |
| `(-1, -1)` | `(-1, -1)` | inert | `(-1, -1)` |
| `(-1, 0)` | `(0, -1)` | hop | `(0, -1)` |
| `(-1, 1)` | `(0, 0)` | annihilate | `(1, -1)` |
| `(0, -1)` | `(-1, 0)` | hop | `(-1, 0)` |
| `(0, 0)` | `(1, -1)` | create | `(-1, 1)` |
| `(0, 1)` | `(1, 0)` | hop | `(1, 0)` |
| `(1, -1)` | `(-1, 1)` | flip | `(0, 0)` |
| `(1, 0)` | `(0, 1)` | hop | `(0, 1)` |
| `(1, 1)` | `(1, 1)` | inert | `(1, 1)` |

It is a permutation of the nine states, so it is a bijection, so the beat is exactly reversible, forward then inverse
returns the start with zero error. The arrow's create move is a clean three-cycle on a single line, from peace,
`(0,0) -> (1,-1) -> (-1,1) -> (0,0)`, period three, all integers (real output from the code). Charge (the line sum)
is preserved in every row. Streaming is a pure relabeling, each tone shifts one dock along its site, no value
touched. Momentum is the integer sum of the site vectors `(±1, ±1, 0, 0)` of the occupied sites. Nothing here is a
real number. Why it matters, the universe of the model is a finite object you can store and step exactly, so its
reversibility and conservation are EXACT, not numerical approximations.

## The geometry too is integer

The 24 sites are the integer vectors `(±1, ±1, 0, 0)`, equivalently the squared-length-2 shell of the four-trit
direction space `{-1,0,+1}^4`. The shells, real output from the code, are 8 vectors at norm-squared 1 (the 16-cell),
24 at norm-squared 2 (the 24-CELL), 32 at norm-squared 3, and 16 at norm-squared 4 (the tesseract). The geometry
falls out of the tone, integer in, integer out. Why it matters, even the substrate's shape needs no real
coordinates, the dock is a set of integer vectors.

## The hardest test, binding, solved discretely when reals were the easy path

Binding a body, the central difficulty, is exactly where a real number was tempting, and three times the discrete
path was taken instead.

The easy answer would have been a real-valued POTENTIAL FIELD, relax a continuous field by a diffusion solve, let
masses slide down a real gradient. An effective version of this was built as a stand-in and FLAGGED as a non-discrete
crutch, never the base. It was then made discrete in two steps. First the field was bounded to a few TRITS (one to
three balanced trits per dock, range two to three), explicitly NOT arbitrary integers, because even an unbounded
integer counter was rejected as too complex, the field is a small ternary count, the same primitive as matter.
Second, the field was eliminated entirely. The committed mechanism is shadow pressure, the active vacuum's integer
radiation-pressure imbalance. A vacuum-excluding body absorbs the tones streaming toward it and casts a shadow, so a
displaced piece is struck more from the open side and pushed back. The numbers are integer counts, on the
24-direction coin the net momentum at a plane behind the body is exactly `-6` (the full shadow, every plus-moving
tone absorbed) versus exactly `0` with no body, and in the 1D trace the mass drifts `-79` toward the body versus `2`
for the no-body control. No field, no gradient solve, no real number. Why it matters, the single hardest thing in
the theory was won without ever leaving the integers, which is what makes the self genuinely a discrete phenomenon
and not a continuum smuggled in through a potential.

## The soliton dynamics, where the honest line is drawn

The soliton that carries a self's body was the one place a real-valued continuous integrator (small-step spin
precession) was used, and it was used only as a reduced PROBE, never as the base. The committed claims were then
established discretely and the honest boundary was proven, not assumed. The soliton's STATE, its topological charge,
is exact in three trits, degree `-1` measured cleanly across radii 2 through 10. And the stable reversible DYNAMICS
that holds the soliton was PROVEN unable to live in any finite discrete direction group, charge is conserved only for
per-beat turns of about 2 to 10 degrees and goes chaotic above 20, while even the 600-cell, the finest regular
4-polytope, has a step near 36 degrees, past the threshold. So the living motion of the body is necessarily
coarse-grained, the slow average of the discrete base, exactly as a magnet's smooth magnetization is the average of
discrete atomic spins that flip in large jumps. Why it matters, rather than slipping a real-valued field into the
base to hold the soliton, the theory proves that the holding dynamics is an EMERGENT average and keeps the base
discrete, the two-layer picture is forced by a measured threshold.

## What the decimals in the results actually are

Decimals appear throughout the findings, the dispersion slope near 1, the anisotropy 0.059, the Casimir suppression
1.34, the Bell value 2.83, the g-factor 2.0. None of these is a real number IN the law. Each is a MEASUREMENT of the
integer dynamics, a statistic gathered over many discrete beats and docks, the way a real-valued temperature is
measured from a gas of discrete particles. The dynamics being measured is integer and exact. A handful of reduced
EFFECTIVE models (a damped oscillator coupled to a bath chain, a continuous spin field) used real arithmetic as
deliberate stand-ins to probe a question quickly, and they are labeled as effective, and wherever they carried a
committed substrate claim, that claim was redone on the integer base. Why it matters, the appearance of decimals in
the output never compromises the discreteness of the foundation, the reals are in the ruler, never in the thing
measured.

## Maintained to the end

The discipline held all the way through. The final self-binding (shadow pressure, a body binding itself by the
shadow of its own active vacuum) is integer. The committed base is the eight discrete elements, nothing real added.
The arrow and the attraction were reclassified as EMERGENT rather than smuggled in as base parameters. The rest slot,
a tempting extra, was shown NOT required, the shadow confines even a single-speed body. Computation universality is
proven on the integer knit. The geometry is the integer 24-cell. At no point, including the resolution of the last
open problem, did a real number enter the base. Why it matters, this is the strongest possible form of a discrete
foundation, every continuous thing in physics, spacetime, fields, gravity, is genuinely DERIVED as an emergent
average, not quietly assumed, so the claim that the world is built from a finite discrete law is clean.

## Where to look (code and experiments)

- The integer knit and exact reversibility: `code/rule/collision.ts` (`PAIR_FORWARD`, `PAIR_INVERSE`),
  `code/rule/lattice-gas.ts`, `foundations/absolute-limits`, `foundations/conserved-dynamics`,
  `computation/discrete-rule-endtoend` (forward+inverse bit-for-bit).
- The four-trit shells equal the polytopes: enumerate `{-1,0,+1}^4`, `code/algebra/group/root-system.ts`.
- The attraction made discrete, in order: the effective field `code/dynamics/gravity-field.ts` (the flagged
  stand-in), the bounded ternary field `selves/minimal-attraction-field` and `selves/ternary-field-attraction`, then
  the integer shadow pressure `selves/shadow-pressure-attraction`, `selves/shadow-pressure-d4`,
  `selves/self-contained-shadow-self`, code `code/dynamics/shadow-pressure.ts`.
- The soliton state and the proven-emergent dynamics: `selves/ternary-skyrmion-charge` (exact in 3 trits),
  `selves/reversible-dynamics-step-threshold` and `selves/fine-group-too-coarse` (no finite group fine enough),
  writeups `theory-v0.7.0/paper/the-discrete-self-latest-findings.md` and `the-base-is-discrete.md`.
- The reduced effective probes (labeled, not the base): `code/dynamics/oscillator-bath.ts`,
  `code/dynamics/skyrmion-field.ts`.