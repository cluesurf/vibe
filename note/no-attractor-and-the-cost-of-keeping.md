# No attractor on a closed box, and the cost of keeping a pattern

Depth **L1** (known math, see [experimental-methodology.md](experimental-methodology.md),
section 2). Two facts about any exact reversible rule on a finite closed box, with plain
proofs. They hold for every reversible rule, the working knit, the candidate register rule and
any reversible piece added later, so **no experiment needs to test them again**. An experiment
that gates on the bare rule failing to attract, repair, capture or select restates theorem 1.
Cite this note instead and spend the run on what the theorems leave open (the last
section but one).

Written 2026-11-12 from research 21
(`note/project/vibe/research/21-intention-and-grounding.md` in the ClueSurf repo, section 1
and the G4 row of section 4).

## The setting

- **The box.** A finite set X of configurations: a fixed number of docks, each holding
  finitely many tones, roles and link values. No dock is born or removed.
- **The rule.** One beat is a map f from X to X. The paper's rule is a composition of exact
  reversible pieces in Z[omega][1/2], each run backward piece by piece
  (`text/0017-the-vibe-theory-model/text/02-the-rule.tex`, lines 4 to 6). So f is a
  bijection of X.
- **With amplitudes.** A state is a finite sum of configurations with weights in
  Z[omega][1/2]. The beat acts on these sums as a unitary U: it permutes configurations and
  multiplies each by a unit phase, or mixes them by a unitary coin. Either way it keeps the
  inner product.

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
does not depend on the mesh, the dock, the knit or the amplitudes.

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

**The consequence for a finite box.** E can hold at most ln |E| nats. A pattern kept by
repair from a reservoir that starts cold (H(E) near 0) can therefore last at most

  T_max = ln |E| / (n H3(epsilon)) beats.

After that E is no longer independent of the errors it receives, step 2 fails, and the box is
back under theorem 1. Unbounded keeping needs a reservoir whose capacity grows without bound
or is refreshed with known (cold) state each beat. In the model the only candidate is growth:
born docks written in a known state, reachable by the pattern. The rate n H3(epsilon) is a
natural measure of how strongly a pattern is grounded (research 21, G4).

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
- **Whether a given piece is reversible.** The theorems apply only once the global map,
  born docks included, is a bijection. That stays a gate in every experiment that adds a
  piece.
- **Whether a sink can take arrangement and leave content.** Theorem 2 says a cold
  reservoir is needed and how much it must take. It does not say which register can carry the
  export without screening gravity (E-GRV-0094 took content and screened it). That is
  research 21's B3.
- **A value arrow.** A piece that treats love and fear differently, as grounding decision 001
  asks (`note/project/vibe/roadmap/grounding/decision/001-the-rule-tells-pleasure-from-pain.md`
  in the ClueSurf repo), is still reversible, so on a closed box it cannot be a downhill flow
  toward pleasure. It can only lean the statistics, or work through a cold reservoir.

## Rule for new experiments

Do not build a run whose pass is "the bare reversible rule fails to attract, repair, capture
or select". Cite theorem 1. Do not build a run whose pass is "keeping costs at least the
error entropy". Cite theorem 2. A run that adds a dissipative layer outside the rule must say
so and is not evidence about the rule.
