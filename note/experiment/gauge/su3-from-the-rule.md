# SU(3) From the Rule

**Does the committed rule carry SU(3) colour by itself?** Three experiments, `E-FRC-0093` to
`E-FRC-0095`, measure it from the committed turning weave and not from a Wilson action typed in by
hand. **The answer is no, at every level tested, and each no is exact.** What the rule does carry is
stated beside it. No random numbers are used anywhere: every probe, start and candidate is a fixed
construction, enumerated in full.

## Where SU(3) could live

Colour needs three things, a triplet for the group to act on, a group that acts on it, and a vertex
where three colour lines meet (the epsilon tensor of a baryon, the three-gluon coupling). In the five
base things there are exactly three places to look.

| place | why it is a candidate | experiment |
| --- | --- | --- |
| the tone | it has exactly three values, a triplet with nothing added | [`E-FRC-0093`](../../../test/experiment/gauge/rule-tone-symmetry.ts) |
| the coin's triangles | the 24 D4 directions hold 32 zero-sum triangles in 16 A2 subsystems, and A2 is the root system of SU(3) | [`E-FRC-0094`](../../../test/experiment/gauge/rule-no-triplet-vertex.ts) |
| the coin's symmetry | a lattice rule could keep a finite skeleton of SU(3), its Z3 center or S3 Weyl group | [`E-FRC-0095`](../../../test/experiment/gauge/rule-coin-symmetry.ts) |

## What was measured

| experiment | measured on the committed rule | control |
| --- | --- | --- |
| `E-FRC-0093` (L3) | continuous tone symmetry of all 24 beats: **2 of 9** u(3) generators, exactly the charge `i(-1, 0, +1)` and the overall phase `i(1, 1, 1)`. At most **2** under every one of the 12 ways a line's far end can carry a triplet or antitriplet. The committed pair table sits **0.627** from the U(3)-covariant maps. Of the 36 tone relabellings on the two ends of a line (S3, the SU(3) Weyl group, on each end), **only the identity** commutes with the rule, run through `beat` on the D4 mesh at sides 3 and 5 for two schedule periods | the identity and swap line maps give all **9**. Pure streaming keeps all **36** relabellings. The covariant space has complex dimension **2** (identity and swap), as Schur-Weyl says |
| `E-FRC-0094` (L2) | over all 24 beats, **0 of 32** triangles fall inside one interaction block. The largest block is **4 slots on 2 lines**. The block decomposition reproduces the collision exactly on every probe | a whole-cell collision (sticky reflection) puts **32 of 32** inside its one block |
| `E-FRC-0095` (L2) | of **995,328** candidates (1152 W(F4) elements x 36 tone relabellings x 24 beat shifts), **one** is an exact symmetry of the 24-beat schedule, the identity. **No** element of order three | streaming keeps all **1152**, 640 of them with order divisible by three. The previous knit keeps **12**, 4 of them with order divisible by three |

## What the rule does carry

- **U(1) charge, exactly.** The only nontrivial continuous symmetry of the tone is the charge phase.
  It is also one of the two Cartan directions of su(3), so the rule keeps one diagonal direction of
  SU(3) and breaks all six root generators and the other Cartan direction. The U(1) is the one
  `E-FRC-0014` already gauges.
- **A Z3 in time, not in colour.** The vacuum clock runs `(0,0) -> (1,-1) -> (-1,1) -> (0,0)`, a
  3-cycle, and that orbit alone is invariant under a relabelling that turns one end of a line by a
  3-cycle and the other end by its inverse, the way a triplet and an antitriplet would. The full clock
  table breaks it (the inert like-signed states `(1,1)` and `(-1,-1)` do not follow), which is why
  `E-FRC-0093` finds only the identity.

## What SU(3) would need

Stated as measured obstructions, each of which names the ingredient:

1. **The clock must go.** By Schur-Weyl, a line map that commutes with all of U(3) is a combination of
   doing nothing and exchanging the two tones. The create, flip and annihilate cycle, the arrow, is
   exactly what breaks U(3) to charge and phase. A U(3)-symmetric ternary line rule has no arrow.
2. **Amplitudes.** A continuous group acts on the tone only when the tone is a vector in C^3. The
   committed rule is a classical permutation of tone values (no amplitudes, `E-FND-0080`), so SU(3) can
   at most be a symmetry of a linear extension of it, and `E-FRC-0093` shows that no such extension of
   this rule has one.
3. **A three-line vertex.** Every collision block is at most two lines, and no triangle ever lies in
   one block. An epsilon coupling needs a collision that joins three lines whose directions close a
   triangle.
4. **An order-three coin symmetry.** The oriented clock already cuts W(F4) down to 12 elements for the
   previous knit, and the turning schedule with its single swapped couple removes the rest, including
   every element of order three.

So the honest statement is: **SU(3) colour is not in the committed rule.** It would take adding a
sixth thing (a three-line vertex on the triangles, on a tone that carries amplitudes, with a clock
compatible with U(3)), which the methodology forbids calling emergence. The 8v = 8 gluons match of
`E-FRC-0038` stays what it is, a dimension count.

The smallest version of the missing ingredient is the center alone. Confinement and deconfinement
in SU(3) are governed by its Z3 center, and [`E-FRC-0099`](../../../test/experiment/gauge/center-automaton.ts)
measures what a tone read cyclically (charges added mod 3, on links) would buy under a deterministic
reversible rule: Z3 confinement at high energy and the first-order coexistence of the transition,
but a frozen ordered phase at low energy, where a kinetic variable per link is needed.

## What these do not test

- **Effective vertices over many beats.** `E-FRC-0094` is about one collision. Tones stream between
  cells, so a coupling of three directions could be assembled over several beats from pairwise events.
  A classical composition of two pairwise events is not an epsilon vertex, and no deterministic test
  here separates the two.
- **Approximate or coarse-grained symmetry.** An SU(3) that appears only statistically after
  coarse-graining would not show up as an exact symmetry. Testing it without sampling needs a
  deterministic coarse-graining whose output can be compared against SU(3), which is not built.
- **Time-reversed and cell-dependent symmetries.** CPT is exact for the committed rule and is excluded
  by design, as is any symmetry that acts differently on different cells.

## Coarse-graining and multi-beat couplings

Two of the gaps above are closed by `E-FRC-0096` and `E-FRC-0097`, both run through `beat` on the D4
mesh, both with calibrations that come out as constructed, and neither using a random number.

**No tone symmetry comes back under coarse-graining** ([`E-FRC-0096`](../../../test/experiment/gauge/rule-coarse-tone-symmetry.ts), L3).
Each run is coarse-grained into b^4 blocks of cells, a block's variable being the fractions of its
slots holding -1, 0 and +1, and D_b is the mean total-variation distance between the relabelled run
and the relabelled plain run (`code/coarse/tone-population`). Two structured starts, two schedule
periods, L = 9 and L = 15.

| relabelling | single cell | whole mesh | survival | reading |
| --- | --- | --- | --- | --- |
| the four that move the vacuum tone 0 | 0.328 (L = 9) | 0.284 (L = 15) | **0.84 to 0.88** | broken at every scale |
| charge conjugation (fixes 0) | 0.0996 (L = 9) | 0.0087 (L = 9), 0.0091 (L = 15) | **0.087, 0.092** | shrinks elevenfold, then a floor that does not fall with volume (incoherent cancellation would give 0.36 of it) |

The calibrations: streaming gives exactly 0 at every scale. A tone cycle keeps its two 3-cycles
exactly and leaves the transpositions broken at every scale (survival 0.90). Reversing a lone +1
breaks four relabellings at the cell scale (it keeps exchanging 0 and +1 exactly) and gives exactly
0 at the whole-mesh scale, the shape a breaking that coarse-graining removes would have. The
committed rule has neither shape. The vacuum tone is where the clock creates and annihilates pairs,
so every relabelling that moves it stays broken at every scale. That is the coarse form of the clock
obstruction above, and it means no S3 skeleton of SU(3) emerges at long distance.

**Multi-beat three-tone effects are generic, not triangular** ([`E-FRC-0097`](../../../test/experiment/gauge/rule-triangle-coupling.ts), L3).
The third-order inclusion-exclusion difference over three tones is nonzero exactly where the outcome
depends on all three together (`code/measure/three-body-interaction`).

- **Census:** three +1 tones in one vacuum cell, the 32 triangles against 32 other triples at 12
  phases. There is **no joint effect within 8 beats for any of them** (0 of 384 each).
- **Targeted:** 16 interacting pairs that a third direction closes into a triangle, each given every
  possible third tone in the same cell. **57 of 672** other thirds produce a joint effect (8.5
  percent). **0 of 32** closing thirds do.
- **Calibrations:** sticky reflection gives a joint effect for every triple, and streaming for none.

So the rule does assemble three-body effects over several beats, as any nonlinear classical dynamics
does, but the triangle geometry is if anything avoided rather than singled out. There is no
effective epsilon vertex.

What remains untested: coarse variables other than block populations (currents, correlations),
spread three-tone starts and windows longer than 8 beats.

## The library

| module | what |
| --- | --- |
| `code/coarse/tone-population` | block tone populations, the coarse relabelling distance D_b over block sizes, the tone-cycle and lone-reversal calibration rules |
| `code/measure/three-body-interaction` | the inclusion-exclusion joint difference of several tones over several beats |
| `code/measure/collision-anatomy` | interaction blocks of a collision found by probing, exact block maps, the check that they reproduce the collision, zero-sum triangles |
| `code/measure/tone-symmetry` | the u(3) Lie algebra commuting with block maps, per-slot triplet and antitriplet representations, the U(3)-covariant pair space (Schur-Weyl), all computed as null spaces with no sampling |
| `code/measure/coin-symmetry` | W(F4) as permutations of the 24 directions, exact schedule symmetries with tone relabellings and beat shifts, the order of a combined symmetry |
| `code/check/tone-permutation-symmetry` | the 36 line relabellings, run through `beat` on a mesh |
