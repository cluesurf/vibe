# Line confinement under the working rule

Depth **L1** (proof from the rule's code, with an exact code witness). Written 2026-11-16.

**The claim tested.** Under the working rule (`coinedVetoBeat`, veto `'none'`, collision `'pass'`, flat links), with
the coin before the meetings (the default) or split around them (`VIBE_COIN=split`), the support of every state stays
on its mesh lines: no beat takes a vibe from the dock line of one mesh line to the dock line of another.

**The verdict.** The claim is **false in general**. It fails in exactly one piece, the collision's whole-dock
permutation K, on a dock that holds two or more single lines. Part 1 stops there. What does hold, for the states B3 and
the later grounding run use, is already proved in [`line-transfer.md`](line-transfer.md) (Lemmas 1 and 2) and is quoted in §3.

## 1. Lines

A **dock line** is a pair of opposite slots {a, -a} of one dock (`LINE_FIRSTS[l]`, `LINE_SECONDS[l]` in
`code/rule/coined-locked-knit.ts`). A **mesh line** is the chain of dock lines the stream joins: slot a of a dock
streams into slot a of the dock across its facet a. A dock line is **single** when exactly one of its two slots is held
and **full** when both are.

## 2. Piece by piece

One beat is `coinedVetoBeat` (`code/rule/coined-locked-knit.ts`:552). With the coin before, it is U = S Y C: the coin
on every branch (`coinLines`, :127), then `vetoBeat` (`code/rule/occupation-veto-knit.ts`:400), which is the meetings,
the collision Y and the stream S. With the coin split, it is U = S D Y D (`splitVetoBeat`, :369): the half coin
(`halfCoinBranch`, :271), the meetings and the collision, the half coin, the stream. Both places run the same Y.

1. **The coin C and the half coin D.** Both loop over the 12 dock lines of each dock and act on the two slots of one
   line only: a single open line keeps its vibe or copies it to the line's other slot, a full open line takes a phase
   (det C = w, det D = 1 + w), a closed vibe is untouched. A vibe never leaves its dock line.
2. **The meetings** (`meetBranch`, `occupation-veto-knit.ts`:313). Two like open vibes on one line keep or swap their
   points, or take the phase w on equal points. The occupation does not change.
3. **The pair move** (`pairPiece`, :163) with veto `'none'`. `dockAllows` returns true at once for `'none'` (:101) and
   reads nothing. Each line unmakes its own love and fear into its own store trit, or makes them back on its own two
   slots. Line by line.
4. **The stream** (`streamConfiguration`, `code/rule/doublet-locked-knit.ts`:474, with `lockedTables` :115). Slot d of
   dock x goes to slot d of `neighbour(x, d)`, and at a reflecting frontier to slot -d of dock x. Both keep the mesh
   line. Flat links leave every point as it is.
5. **The collision's permutation** (`coinPiece`, `occupation-veto-knit.ts`:236, calling `bouncePermutation`,
   `code/rule/bounce-pair-knit.ts`:103). It permutes the whole dock's 24 slots by the table's map for the occupation.
   Under `'pass'` there are two cases (bounce-pair-knit.ts:142):
   - **at most one single line: B.** Full lines keep their slots (two like vibes) or turn within their line. The non-full
     lines take w_r only when w_r carries the full lines onto themselves, and w_r fixes the single's slot r, so the
     single keeps its slot and the other non-full lines are empty. `line-transfer.md` Lemma 1 item 5 checks this over
     every occupation with at most one single line: 0 held vibes leave their line.
   - **two or more single lines: K = w_P**, P the singles' momentum, applied to every slot of the dock, full lines
     included (:142 to :155). w_P permutes the dock's 12 lines. Where it carries an occupied line onto an empty one,
     a vibe leaves its mesh line.

So pieces 1 to 4 and B keep every vibe on its dock line, and K does not.

**The counterexample, exactly where.** A dock holding two single lines r and s and a third occupied line m that w_(r+s)
moves. K sends the vibes of m to the slots w_(r+s)(m), which lie on another dock line, and after the stream they run on
another mesh line. Bounce-pair-knit's header states the same mechanism for w_r: it "carries every vacuum pair at 60
degrees to r onto another line". `line-transfer.md` measured it: K on docks with two single lines moves 1,228,800 held
vibes off their line over 270,336 occupations. The exact witness on the honeycomb is gate W0 of
`test/experiment/selves/mixer-export.ts`, which runs one bare beat of each coin place on the exact radius-1 ball from a
dock holding two single lines and a full line, and counts the vibes on a mesh line that held none at the start.

Two single lines alone are not enough: for two singles r and s, w_(r+s) maps r to -s and s to -r (|r| = |s|), so the
two vibes trade lines and the set of occupied lines is kept. A third occupied line is what K moves.

## 3. Where it holds

`line-transfer.md` Lemma 1: on a configuration in which every dock holds at most one single line, one beat is a product
over mesh lines of one line map. Lemma 2: a state on one mesh line in a vacuum with no single lines keeps that property
at every beat, because two honeycomb lines share at most one dock (Lemma 3), so a dock meets the state's mesh line in
one dock line, which is at most one single line. The half coin D acts on one line exactly as C does (§2 item 1), so
both lemmas hold for the split place unchanged.

B3 (E-SLF-0183) and E-SLF-0184 run B1's cluster and bath on ONE mesh line in the empty vacuum V1. So
their support stays on that line at every beat, and on the honeycomb a self's export under the working rule is exactly
the line engine's: it can leave only through the line's two ends, never into the 4D bulk. A state with vibes on two or
more mesh lines that meet at a dock is outside this, and K can move its support between lines there.

## 4. The window a dock mixer leaves exact (for part 2)

This section is not part of the claim above. It is the lemma the mixer screen (part 2) rests on.

Let M be a dock-local mixer placed before the beat (the board's mixer family: G, its lift Gamma(G), the ring mixer at u),
and start from a state with every vibe on one mesh line l in the empty vacuum. Let P be the projector onto
configurations with every vibe on l, Q = 1 - P.

**Lemma W (no return before beat 3).** Through the end of beat 2, the P part of the state is
(P L_2 P)(P L_1 P) psi_0, and on every dock of l, P L P = (P R P)(P M P), where L = S R M is one beat and R the working
beat's dock-local part.

*Proof.* (1) **Within one beat at a dock of l**, P R Q M P = 0. On a dock whose vibes are all on l, M moves at most one
vibe (G and Gamma(G) take one vibe of a frame, the ring mixer one of the dock, to one empty slot,
`coined-locked-knit.ts`:741, :951, `swap-mixer.ts`:204), so Q M P holds
either one vibe alone on a line m, not l (from a single l line), or one vibe on l and one on m (from a full l line). The
coin, the meetings and the pair move keep each dock line (§2). B with one single line fixes its slot. K permutes dock
lines, so after K the vibes lie on two different lines whenever they did before. Neither reaches "every vibe on l".
(2) **Across the stream.** A vibe that left l at dock x is on another mesh line m through x after the stream, at a dock
of m other than x, which is not on l (two lines share one dock). The stream keeps every mesh line, so at the start of
beat 2 no dock of l holds a vibe off l, and the dock-local part of beat 2 at a dock of l sees only l's vibes; at the end
of beat 2 no vibe off l is on l's dock lines. The earliest return is beat 3's dock-local part at x, after the coin has
turned the vibe on m back. ∎

So through beat 2 every reading that needs all of a cluster's vibes on l (B1's bound count F of the lone 3-love
cluster) is honeycomb-exact when read off the line engine with each dock's on-line block P M P inserted before the beat.
For a reading that a vibe off l can still contribute to (the cluster's F in a bath, with a bath love exported), the P
part gives a lower bound.

**The on-line blocks** (derived from the code, checked by gate X2 of the experiment). On a dock of l whose only vibes are
on l, all loves of one point (one content): a single line takes [[k, h], [h, k]] on its two slots, a full line a scalar f.

| member | k | h | f |
| --- | --- | --- | --- |
| F-G, frame mixer G (lone frames) | 3/4 | -1/4 | 1 (a full line's frame holds two vibes, G leaves it) |
| F-L, the lift Gamma(G) | 3/4 | -1/4 | 1/2 ((4 - n)/4 at n = 2) |
| R-u, ring mixer 1 + (u - 1) N_U | 1 + (u - 1)/24 | (u - 1)/24 | 1 + (u - 1)/12 |

The hop to the line's other slot passes no occupied mode, so its fermion sign is +1. The block's eigenvalues on a
single line are k - h = 1 on e0 - e1 (every member leaves it alone) and k + h on e0 + e1: 1/2 for G and Gamma(G),
1 + (u - 1)/12 for the ring (|.|^2 = 1 - 11 |u - 1|^2 / 144: 0.771 at u = w or w^2, 0.694 at u = -1, 0.695 at u*). M moves at most one vibe on such a dock, since only l's frame (or, for the
ring, l's dock) holds vibes.
The coin C = P+ + w P- has the same eigenvectors, so the block commutes with the coin on a single line.
