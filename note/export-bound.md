# How fast a pattern can export its errors through its surface

Depth **L1** (proof, with exact and numeric probes). Written 2026-11-12 for board item `vibe-roadmap-board-0031`,
gaps B-38, B-35, B-19 and B-59, objections G2-2, S2-5, M2-5 (round 02) and G3-2, G3-3, S3-4 (round 03). Records:
`note/project/vibe/roadmap/board/` in the ClueSurf repo. It makes
[`reversible-lean-and-the-open-mesh.md`](reversible-lean-and-the-open-mesh.md) §5.3 exact and gives board proposal 003
a falsifier that no long run has to reach.

Probe: [`tmp/board-0031-export-bound-probe.ts`](../tmp/board-0031-export-bound-probe.ts) (seconds, laptop).

**The result.** Keeping a pattern costs a per-dock error rate that must stay below a threshold set by how many links
the errors can leave through. Under the working rule (lines only) the threshold falls as 1/λ with the pattern's length
along a line, the same on the box and the honeycomb. Under a rule with a dock mixer it never falls below 12.33 crossing
capacities per dock on the honeycomb, whatever the pattern's size, where on a flat 3d lattice it falls as 1/side. The
bound is an upper bound on export, so it can only falsify keeping, never show it (S3-4).

## 1. The export cap

**Setting.** One beat is a dock-local layer (every piece of the working rule, K, and every mixer proposed so far,
proposal 004's included, acts inside one dock) followed by the stream, a permutation that moves slot a of each dock to
slot a of the next dock along a. The store trits and words never stream. In the working rule a link holds a fixed
element and no state. A finite set B of docks has n_c(B) **crossing links**, links with one end in B. Each beat each
crossing link takes one slot value out of B and brings one in. Let d be the number of states a slot can hold.

**Theorem 1.** Let O be the n_c values that leave B in one beat, I the n_c that enter, and B_r the rest of B. Then, in
von Neumann entropy (or Shannon entropy for an ensemble of configurations),

    S(B) - S(B after) = S(O | B_r) - S(I | B_r) <= n_c ln d - S(I | B_r).

So:

1. **Hard cap** (any state, G3-3): B's entropy falls by at most **2 n_c ln d** a beat, since -S(I | B_r) <= S(I) <= n_c ln d.
2. **Incoming independent of B** (S3-4): it falls by at most **n_c (ln d - s_in)**, where s_in is the entropy per
   incoming value. A hot vacuum (s_in near ln d) leaves no margin.

*Proof.* The dock-local layer acts inside B or outside it, so it leaves S(B) unchanged. The stream replaces O by I.
S(B) = S(B_r O) = S(B_r) + S(O | B_r) and S(B after) = S(B_r I) = S(B_r) + S(I | B_r). Subtract. S(O | B_r) <= S(O)
<= n_c ln d. Araki-Lieb gives S(I | B_r) >= -S(I), and when I is independent of B_r, S(I | B_r) = S(I). ∎

**The slot alphabet.** A working-rule slot is calm or holds a love or a fear with a point (9) and an open bit (2), so
d = 1 + 2 * 9 * 2 = 37 (ln d = 3.61). The tone alone, what the husk reads, has d = 3. Proposal 008's link states add a
channel of their own per crossing link.

## 2. The keeping threshold

**Errors**, as in theorem 2 of [`no-attractor-and-the-cost-of-keeping.md`](no-attractor-and-the-cost-of-keeping.md):
each beat a churn independent of everything else changes the pattern's docks, and on a pattern in a fixed state it
raises the entropy of any region holding it by eta nats per pattern dock (n H3(epsilon) there). The pattern occupies
the dock set F. Keeping it in its state over T beats means the region's entropy stays below what its non-pattern part
can hold.

**Theorem 2 (min cut).** For every finite set X of docks, the churn inside X adds eta |X ∩ F| a beat and only the
crossing links of X take it out. So keeping F for T beats needs, for every X,

    eta |X ∩ F| T <= C(X) T + |X| ln d_dock,    C(X) = sum over crossings of (ln d - s_in),

with d_dock the states of one dock. For unbounded T the threshold is

    eta < eta*(F) = min over X of C(X) / |X ∩ F|.

With the hard cap, C(X) <= 2 n_c(X) ln d. A pattern above threshold survives at most about
|X| ln d_dock / (eta |X ∩ F| - C(X)) beats, a finite-time falsifier.

*Proof.* Theorem 1 summed over T beats, with the churn's increase added each beat, and S(X) <= |X| ln d_dock. ∎

Under proposals 001 and 007 the churn is the pattern's coupling to whatever lies beyond the repair's reach, read in a
short run as the pattern region's coarse entropy production with repair off (note 1 §4, the conditional form). That
identification is argued, not proved.

### The three thresholds

Write Delta = ln d - s_in for one crossing's margin.

**Working rule, lines only (K idle).** By [`line-transfer.md`](line-transfer.md) Lemma 1 the beat is a product of line
maps, so Theorem 1 applies to each line segment of F separately: a segment of λ docks exchanges through its two end
links only, whatever the mesh. Taking X as the segment,

    eta*(F) = 2 Delta / λ_max,

with λ_max the pattern's longest run along one line. It falls as 1/λ, and it is the same on the box and the
honeycomb, since a line is one-dimensional on both. **The Cheeger constant never enters** (S3-4's reason, stated
exactly). The total capacity is not the issue: n_c(F) = 2 times the number of segments, the same count as with a
mixer. The issue is that each segment can export only its own errors.

**A rule with a dock mixer, on the honeycomb.** A mixer lets an error reach any crossing link of any region it is in.
Then eta*(F) <= (n_c(F) / |F|) Delta, and no cut does worse than the Cheeger constant h = inf over finite X of
n_c(X) / |X|:

    h Delta_min <= eta*(F) <= (n_c(F) / |F|) Delta <= 24 Delta.

**Theorem 3 (the honeycomb's Cheeger constant).** 12.33 <= h <= 21.52 on the dock graph of {3,4,3,4}.

*Proof of the lower bound.* Fix an ideal point ξ and its Busemann function b, with b increasing away from ξ. The 24
neighbors of a dock x sit at distance s (cosh s = 3, sinh s = 2 sqrt 2) along its 24 facet normals n_a, the D4 roots
over sqrt 2. In the hyperboloid model b(y) - b(x) = ln(cosh s - sinh s <n_a, w>), w the unit direction from x to ξ. So

    L(w) = sum over a of (b(x_a) - b(x)) = sum over a of ln(3 - 2 sqrt 2 t_a),   t_a = <n_a, w>.

Sum L over the docks of a finite X. Each link inside X appears twice with opposite signs, so the sum equals the sum of
b(y) - b(x) over the crossing links, each at most s. So n_c(X) >= |X| min L / s. Pair a with -a: L = sum over the 12
pairs of ln(9 - 8 τ_p), τ_p = t_a^2. The 24 normals form a spherical design to degree 4 (probe: worst deviation
5e-15 over 2,000 directions), so for every w the sum of τ_p is 3 and the sum of τ_p^2 is 3/2. The quadratic
ln 9 + b τ + c τ^2 with b = -0.88876, c = -1.30900 lies below ln(9 - 8 τ) on [0, 1] (probe: checked on a grid of
200,001 points with the Lipschitz allowance). So L >= 12 ln 9 + 3 b + 1.5 c = 21.737, and h >= 21.737 / s = **12.33**,
with s = ln(3 + 2 sqrt 2) = 1.7627. The chord alone gives 9 ln 9 / s = 11.22.

*Proof of the upper bound.* The honeycomb's dock graph is bipartite (E-FRC-0274), so no link joins two docks of one
shell and the links leaving the ball of radius R number E_R = 24 N_R - E_(R-1). From the shells 1, 24, 456, 8,376,
153,192 (E-GMT-0027): E_R = 24, 552, 10,392, 190,632, 3,485,976, and E_R over the ball's size is 24, 22.08, 21.61,
21.52, **21.51**. The exact radius-3 ball confirms E_0 to E_2 and 0 links inside a shell. ∎

The sampled minimum of L is 8 ln 7 + 3 ln 9 = 22.159, at a root direction (200,000 directions and descent), which would
give h >= 12.57. The certified bound is 12.33.

**What physics reads, under proposal 005 (G3-2).** A conserved quantity kept dock by dock (charge, line tone) changes
a column sum only through links that join two columns: a link inside a column keeps the column's sum, and the
dock-local layer keeps each dock's. So a husk-visible error, which is charge that must be moved and cannot be erased,
leaves a set A of columns only through its lateral links, at most q_max per crossing slot a beat. Over a cube of side
a on the cusp layer {4,3,4}, the lateral faces number 6 a^2 against a^3 columns, so

    eta*_visible <= q_max m_D * 6 / a,

with m_D the lateral links joining two adjacent columns within the pattern's depth D. It falls as 1/a: a flat budget.
The constant m_D is a count on the cusp neighborhood that this note did not make. The Cheeger gain applies only to
errors whose column sum is zero, which key 1 calls experience, not physics (B-59).

### Summary

| rule | export per beat | eta*, nats per pattern dock per beat | large patterns |
| --- | --- | --- | --- |
| working rule, K idle | 2 Delta per line segment | 2 Delta / λ_max | falls as 1/λ, either mesh |
| dock mixer, honeycomb | Delta per crossing link | between 12.33 Delta and n_c(F) Delta over the size of F, about 21.5 Delta for a ball | never below 12.33 Delta |
| dock mixer, flat 3d lattice | Delta per crossing link | about 6 Delta / a for a cube of side a | falls as 1/a |
| husk-visible charge under 005 | q_max per lateral slot | about q_max m_D 6 / a | falls as 1/a |

Every Delta is at most ln d, and at most 2 ln d when the incoming values may be correlated with the region.

## 3. The one-vibe spectrum

S2-5 asked for the bound from the one-vibe spectrum. S3-4 is right that the hard cap is the slot count per link
(Theorem 1). The spectrum says how fast an error **leaves**, not how much can leave.

- **Lines only.** A lone vibe's walk is the coined walk on its line, top speed 1/2 (E-QTM-0157), and its dephased twin
  is a random walk on Z, whose return probability falls only as t^-1/2. No exponential escape.
- **A full dock mixer, dephased.** The simple walk on the dock graph has spectral radius rho / 24. The test function
  e^(alpha b) gives rho <= max over w of sum over a of (3 - 2 sqrt 2 t_a)^alpha, and with a quadratic majorant in τ and
  the design moments the probe finds **rho <= 16.02** at alpha = -0.75 (the sampled maximum there is 14.93). With
  Kesten's floor, 9.59 = 2 sqrt 23 <= rho <= 16.02. So a dephased error is back at its start dock with probability at
  most (rho / 24)^t <= (2/3)^t after t beats. The bottom of the Laplacian's spectrum is lambda_0 = 24 - rho >= 7.98, and lambda_0 <= h,
which gives h >= 7.98, weaker than Theorem 3's 12.33. The majorant is checked on a grid
  of 1,000 points, not certified.

## 4. The falsifier for proposal 003

Each input is read without a long run:

1. the pattern's dock set F and its longest line run λ_max (geometry),
2. d, from the rule,
3. s_in, the entropy of one incoming vacuum slot given the region (a one-dock, one-line reading of the vacuum, which
   carries from the box by [`line-transfer.md`](line-transfer.md) for the working vacuum),
4. eta, the pattern's coarse entropy production per dock per beat with repair off, over a few beats.

**Verdict.** If eta > eta*(F) for the rule in force, 003's keeping fails for that pattern, and the pattern lasts at
most the Theorem 2 time. If eta <= eta*(F), nothing is shown.

**What already follows.** Under the working rule every kept pattern lives on lines, and its threshold falls as 1/λ on
both meshes: the honeycomb gives the working rule no keeping advantage over the box. The only line mixer the working
rule has, K, melts the vacuum (E-SPN-0157), which drives s_in up and Delta toward 0. So the cold channel needs a mixer
the author adopts (proposal 004) and a vacuum stationary and locally cold under it (B-38).

## 5. Status

**Proved.** Theorem 1 (exact, any state, quantum or classical). Theorem 2, given errors from a churn independent of
the region. The line-law threshold. Theorem 3, with the minorant checked on a grid with a Lipschitz allowance. The
husk-visible bound's form.

**Argued, not proved.** That a short run's coarse entropy production with repair off is the eta of Theorem 2 under one
pure present. The spectral radius bound (majorant grid-checked). The sampled minimum of L.

**Needs a run (M3 brief).**

- E1, s_in. On the exact radius-4 ball, the working vacuum: the entropy of one incoming slot value given the region,
  for balls of radius 0 to 2 around the base dock, over beats 1 to 4. Report s_in and Delta = ln d - s_in for d = 3 and
  d = 37.
- E2, m_D. On the cusp neighborhood (board-0027), count the lateral links joining two adjacent columns down to each
  depth D <= 4, and report m_D against the column's dock count.
- E3, eta. For each candidate bound pattern (none binds yet, E-SPN-0145), the coarse entropy production per dock over
  4 beats with repair off, against eta*(F) from this note. Gate fixed first: the pattern is falsified as keepable when
  eta exceeds eta*(F) with Delta from E1.
