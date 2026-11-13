# No attractor on a closed box, and the cost of keeping a pattern

Depth **L1** (known math, see [experimental-methodology.md](experimental-methodology.md),
section 2). Two facts about any exact reversible rule on a **finite closed box**, with plain
proofs. They hold for every reversible rule on such a box, the working knit, the candidate
register rule and any reversible piece added later, so **no experiment on a finite box needs to
test them again**. An experiment on a finite box that gates on the bare rule failing to
attract, repair, capture or select restates theorem 1. Cite this note instead and spend the
run on what the theorems leave open (the last section but one).

**Scope, first.** Both theorems are proved for a finite box. The model's mesh is the whole
infinite {3,4,3,4} honeycomb, and its present is an amplitude state (board decisions 001 and
003). Neither theorem carries over to it as stated: on an infinite set a bijection can map a
set strictly into itself, and what a region can lose is bounded by its surface instead
([reversible-lean-and-the-open-mesh.md](reversible-lean-and-the-open-mesh.md), section 5). A
finite box is still the right setting for every run on a flat or wrapped box, which is every
run the simulator makes today.

Written 2026-11-12 from research 21
(`note/project/vibe/research/21-intention-and-grounding.md` in the ClueSurf repo, section 1
and the G4 row of section 4). Amended the same day after the advisory board's round 01 to 03
(objections S-3, S-6, S-12, Q-10, G-8, S2-4, S3-1; records in
`note/project/vibe/roadmap/board/` in the ClueSurf repo): the unitary form of theorem 1, the
mutual-information form of theorem 2, the lean cap's true reach, and growth marked as an
injection outside both theorems.

## The setting

- **The box.** A finite set X of configurations: a fixed number of docks, each holding
  finitely many tones, roles and link values. No dock is born or removed.
- **The rule.** One beat is a map f from X to X. The paper's rule is a composition of exact
  reversible pieces, each run backward piece by piece
  (`text/0017-the-vibe-theory-model/text/02-the-rule.tex`, lines 4 to 6). So f is a
  bijection of X.
- **With amplitudes.** A state is a finite sum of configurations with weights in the model's
  ring, which depends on the link lift (Z[omega][1/6] or Z[zeta9][1/6], never Z[omega][1/2],
  [path-records-and-the-ring.md](path-records-and-the-ring.md), section 3). The beat acts on
  these sums as a unitary U: it permutes configurations and multiplies each by a unit phase,
  or mixes them by a unitary coin. Either way it keeps the inner product. With the coin on,
  U is not a bijection of configurations and has no cycles, so theorem 1 has a separate
  unitary form below.

## Theorem 1. A closed reversible box has no attractor

**Statement.** Let f be a bijection of a finite set X. Then:

1. X splits into disjoint cycles, and every configuration returns to itself after some
   number of beats (exact recurrence).
2. No two distinct configurations ever become equal. Their distance (for example the number
   of slots where they differ) is periodic in the beat, so it never settles toward zero.
3. No set of configurations is mapped into a strictly smaller set. If f(A) is inside A, then
   f(A) = A.
4. With amplitudes, the overlap of any two states is the same at every beat.

So there is no attractor (a set that nearby starts fall into and stay in), no repair (a map
that sends many damaged states to one intact state), no capture (two free parts that meet and
stay bound with nothing carried off), and no selection (a definite outcome picked out from
many inputs).

**Proof.**

1. A bijection of a finite set is a permutation, and every permutation is a product of
   disjoint cycles. Starting anywhere and applying f, the orbit must repeat because X is
   finite. The first repeat is back to the start, since a repeat at a later point would give
   that point two predecessors, which a bijection forbids.
2. If f^t(x) = f^t(y) then x = y, because f^t is a bijection. Both x and y lie on cycles, so
   the pair (f^t(x), f^t(y)) returns to (x, y) after the least common multiple of the two
   cycle lengths, and with it every distance between them.
3. A bijection keeps the size of every set, so f(A) has as many elements as A. If f(A) is
   inside A, the two have the same size, so they are equal.
4. A unitary keeps inner products, so the overlap of U^t a and U^t b equals the overlap of a
   and b at every t. Two starts that differ never come closer in this measure.

A **repair** would send every state in some damaged set D to the one intact state p, which
needs |D| = 1 by point 2. An **attractor** would be a set with a basin larger than itself,
which point 3 forbids. Every claim above uses only that f is a bijection and X is finite. It
does not depend on the mesh, the dock or the knit.

**The unitary form** (objections Q-10, S-12). Let U be a unitary on the finite-dimensional
space spanned by X. Then:

1. U has a discrete spectrum of unit phases, so every state returns as close as one likes to
   itself after some number of beats (quantum recurrence), though not exactly unless the
   phases are commensurate.
2. The overlap of any two states is the same at every beat (point 4 above).
3. No subspace is mapped into a strictly smaller one, since U keeps dimension.
4. No unitary sends two orthogonal states to one state, so a repair of many distinguishable
   damaged states to one intact state is forbidden, as in point 2.

The proofs are one line each: a unitary is diagonal in an orthonormal basis with unit
eigenvalues, keeps inner products, and is invertible. The finite dimension is what gives
point 1. On the infinite mesh the spectrum can be continuous and recurrence can fail.

**What can look like an attractor and is not.** A coarse reading can lose detail and so
rise toward a ceiling: on the adopted knit the husk's coarse entropy reaches ln B within 4
beats and then only fluctuates (E-FND-0155). That is a property of the reading, not of the
state. The fine state still recurs exactly, as point 1 says.

## Theorem 2. Keeping a pattern costs at least its error entropy, paid into a cold reservoir

A part S of the box can still contract, with no conflict with theorem 1, if it passes its
lost distinctions to the rest of the box E. This bounds how cheap keeping can be.

**Statement.** Split the box as S x E. Let the pattern on S be one fixed configuration p.
Each beat, churn changes each of the n trits of S on its own with probability epsilon (to
either of the two other values with equal chance), independently of E. Then a reversible
repair that puts S back to p must raise the entropy of E by exactly

  n H3(epsilon) nats a beat,  with  H3(epsilon) = -(1 - epsilon) ln(1 - epsilon) - epsilon ln(epsilon / 2).

H3 is concave with H3(0) = 0 and H3(2/3) = ln 3, so on 0 to 2/3 it lies above the straight
line from (0, 0) to (2/3, ln 3). That gives the simple form research 21 quotes:

  n H3(epsilon) >= (3/2) n epsilon ln 3 >= n epsilon ln 3.

For small epsilon the exact value is close to n epsilon (1 + ln 2 + ln(1/epsilon)), which is
larger than n epsilon ln 3 by a factor that grows as epsilon falls. So n epsilon ln 3 is a
safe lower bound, not the tight one.

**Proof.** Write H for entropy over the box's configurations.

1. A bijection keeps total entropy: f only relabels configurations, so the probability list
   is the same list in another order. So H(S, E) after the repair equals H(S, E) before it.
2. Before the repair, S carries the error and E is independent of it, so
   H(S, E) = H(S) + H(E) with H(S) = n H3(epsilon) (n independent trits, each with the
   distribution 1 - epsilon, epsilon/2, epsilon/2).
3. After the repair S is p for certain, so H(S) = 0 and H(S, E) = H(E after).
4. So H(E after) = H(E before) + n H3(epsilon). The equality is exact for one beat.

**The general form: mutual information** (objection S-3). The statement above assumes the
churn is independent of E. Drop that, and the same two steps give, for any classical
ensemble and any bijective repair that ends with S in p,

  H(E after) = H(E before) + H(S before) − I(S : E)_before.

So keeping costs what the repairer does not already hold about the error, not the error's
whole entropy. The independent case above is I(S : E) = 0
([reversible-lean-and-the-open-mesh.md](reversible-lean-and-the-open-mesh.md), section 4).

**The quantum form** (objection S2-4). For a global pure state the mutual information can be
twice the entropy of S, and a global unitary can restore S while the entropy of E falls (del
Rio, Åberg, Renner, Dahlsten and Vedral, Nature 474, 2011). A cost appears only when the
repair's reach is limited: it is the conditional entropy of S given the part of E inside the
repair's light cone. Under board decision 001 the present is one pure amplitude state, so
this is the form that applies to the model, and the classical theorem holds only for errors
whose correlations have left the repair's reach. Under decisions 001 and 007 the target also
depends on the record branch, since a repair to one fixed p would count a self's own records
as errors: the cost of keeping a form F is H(F | R, E_R), with R the self's records and E_R
the part of the rest within reach (objection S3-1, the same section 4).

**The consequence for a finite box.** E can hold at most ln |E| nats. A pattern kept by
repair from a reservoir that starts cold (H(E) near 0), with independent churn, can therefore
last at most

  T_max = ln |E| / (n H3(epsilon)) beats.

After that E is no longer independent of the errors it receives, step 2 fails, and the box is
back under theorem 1. Unbounded keeping needs a reservoir whose capacity grows without bound
or is refreshed with known (cold) state each beat. The rate n H3(epsilon) is a natural measure
of how strongly a pattern is grounded (research 21, G4).

**Growth is outside both theorems** (objections S-6, G-8). Research 21 named growth (born
docks written in a known state) as the cold reservoir. As sketched, growth is an injection,
never run backward, so it is not a bijection of any finite X and neither theorem applies to a
box that grows. It is not a base thing either: board decision 003 removed it, and the mesh is
the whole infinite honeycomb, on which the rule is a bijection of the states that differ from
a known vacuum on a finite set. Whether that infinite mesh supplies a cold channel is
conditional, not given. It needs reach (a line mixer), a vacuum that is locally cold and
stable to lumps, and selective export, and what a region can lose is bounded by its surface
([reversible-lean-and-the-open-mesh.md](reversible-lean-and-the-open-mesh.md), section 5).
None of the three is shown.

**Measured on the rule.** Landauer's equality case is already run on the adopted knit:
erasing a register trit puts exactly ln 3 into the rest of the box, the record sits on the
register's own mesh line, and it comes back round the 8-dock line, since a finite reversible
box never erases for good (E-CMP-0018). That is step 4 with n = 1 and a uniform error, and the
return is theorem 1, point 1.

## Experiments that already restate these theorems

| id | what it found | which theorem |
| --- | --- | --- |
| [E-MMR-0007](../test/experiment/associative/hopfield-emergent-recall.ts) | attractor recall works on a dissipative Hopfield layer and fails on the bare reversible rule. The gate requires the bare failure. Old D4 lattice gas, Weyl start. Catalog grade L3, but the bare arm is theorem 1 | 1 |
| [E-SLF-0016](../test/experiment/selves/capture-needs-dissipation.ts) | a reversible collision cannot capture, so binding needs the bath | 1 (point 2) |
| [E-SLF-0066](../test/experiment/selves/l3-causal-emergence-needs-loss.ts) | the permutation has no degeneracy, so coarse causal power needs information loss | 1 (point 2) |
| [E-QTM-0084](../test/experiment/quantum/no-amplifier-in-reversible-rule.ts) | the reversible rule does not amplify, and selection needs a metastable attractor | 1 (points 2 and 4) |
| E-QTM-0043, E-QTM-0154 | selection and a pointer basis come from the environment, never the rule | 1 and 2 |
| [E-FND-0082](../test/experiment/foundations/permutation-rule-cannot-interfere.ts) | a reversible rule lifted to superpositions is a permutation matrix, weights relabelled exactly | 1 (point 4) |
| [E-FND-0155](../test/experiment/foundations/coarse-end-state.ts) | the coarse entropy saturates in 4 beats, the fine state recurs exactly | 1 (point 1) |
| [E-CMP-0018](../test/experiment/computation/landauer-line.ts) | erasing a trit puts exactly ln 3 into the box, and the record returns | 2, equality case |

These stay valid as runs. What they add beyond the theorems is the specific numbers (rates,
times, overlaps), not the yes or no.

## What the theorems leave open

- **Keeping without repair.** A conservation law (the line law, E-SPN-0098), prethermal
  slowness (ln tau = 0.35 + 0.078/delta, E-SPN-0154) and a topological index (E-SPN-0165) all
  keep something on a closed box. None of them repairs. How long each keeps, and what it
  freezes, is measured, not given by these theorems.
- **Whether a given piece is reversible.** The theorems apply only once the global map is a
  bijection of a finite box. That stays a gate in every experiment that adds a piece. A run
  that adds docks (the old growth sketch) is injective, not bijective, and is gated as such:
  it is outside both theorems and outside the base.
- **The infinite mesh.** On the whole honeycomb no attractor and no repair do not follow from
  reversibility alone, and keeping becomes an error-rate threshold set by a region's surface.
  What holds there is in
  [reversible-lean-and-the-open-mesh.md](reversible-lean-and-the-open-mesh.md), section 5.
- **Whether a sink can take arrangement and leave content.** Theorem 2 says a cold
  reservoir is needed and how much it must take. It does not say which register can carry the
  export without screening gravity (E-GRV-0094 took content and screened it). That is
  research 21's B3.
- **A value arrow.** A piece that treats love and fear differently, as grounding decision 001
  asks (`note/project/vibe/roadmap/grounding/decision/001-the-rule-tells-pleasure-from-pain.md`
  in the ClueSurf repo), is still reversible, so on a closed box it cannot be a downhill flow
  toward pleasure. On a finite box the lean of a C-odd reading is capped by
  M · √(2 (ln|X| − H)), but that cap binds only an ensemble close to uniform. It limits
  nothing for one history, one configuration, one pure present or the infinite mesh, so the
  earlier line "it can only lean the statistics, capped" is withdrawn
  ([reversible-lean-and-the-open-mesh.md](reversible-lean-and-the-open-mesh.md), section 2).

## Rule for new experiments

On a finite box, do not build a run whose pass is "the bare reversible rule fails to attract,
repair, capture or select". Cite theorem 1. Do not build a run whose pass is "keeping costs at
least the error entropy less what the repairer holds". Cite theorem 2. A run on the honeycomb
is not covered and must state its own scope. A run that adds a dissipative layer outside the rule must say
so and is not evidence about the rule.
