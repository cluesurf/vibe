# The working rule's line-wise transfer from the box to the honeycomb

Depth **L1** (proof from the rule's definition, with exact probes). Written 2026-11-12 for board item
`vibe-roadmap-board-0021`, gap B-12, objection G-1 (round 01) and G2-3 (round 02). Records:
`note/project/vibe/roadmap/board/` in the ClueSurf repo.

[`honeycomb-transfer-radius.md`](honeycomb-transfer-radius.md) Theorem C proves that a general dock-local rule
transfers from the flat D4 box to {3,4,3,4} only for one dock and one beat. That is the worst case. The working rule
is not a general rule: while K is idle it factors line by line (E-SPN-0157). This note proves what that buys.
**A reading of one mesh line transfers exactly while the disturbance's light cone fits in the box line**, that is for
|D| + 2t <= L. Husk readings, readings that place several lines in space, K, every mixer and the dock-level vetoes
never transfer.

Probe: [`tmp/board-0021-line-transfer-probe.ts`](../tmp/board-0021-line-transfer-probe.ts) (seconds, laptop, exact).

## 1. Lines on the two meshes

A **dock line** is a pair of opposite slots {a, -a} of one dock. A **mesh line** is the chain of dock lines that the
stream joins: slot a of a dock takes slot a of the dock across its facet -a, so a value that keeps its slot moves
along a and stays in the dock line {a, -a} of every dock it enters.

- **Box of side L.** The mesh line of root a through x is {x + n a}, n mod L. A root is primitive in D4, so
  n a lies in L D4 only when L divides n: every box line has exactly L docks, and there are 12 L^3 of them (6,144 on
  side 8). A line meets each of its docks once and uses only the dock line {a, -a} there.
- **Honeycomb.** The mesh line of a through the dock with frame g is {g k_a^n}, n in Z, with k_a = F_a Z (transfer
  note, Theorem A, where slot a faces slot -a and the far facet of the next dock is a again).

**Lemma 3 (honeycomb lines).** Each k_a is a hyperbolic translation of length s, cosh s = 3, so a honeycomb line is a
geodesic and never closes. Its docks are distinct, and two lines through one dock share only that dock.

*Proof.* The probe computes, in exact Z[sqrt 2] arithmetic (`code/substrate/coxeter/exact-3434.ts`), the centers
c(n) = k_a^n c0 for n = -6 to 6 on all 12 lines: c(n+1) + c(n-1) = 6 c(n) holds exactly at every n (0 failures),
k_a k_-a = 1 exactly, the 13 centers of each line are distinct, and the 144 off-base centers of the 12 lines are
pairwise distinct. The recurrence with coefficient 2 cosh s = 6 is the hyperboloid form of equally spaced points on
one geodesic, so k_a acts on its axis as a translation by s > 0 and has infinite order. Two distinct geodesics meet at
most once, which gives the last claim for the whole lines, not only the 13 docks checked. ∎

**The F_7 quotient's lines are short.** On the quotient of `honeycomb-transfer-radius.md` §6 (reduction mod
(3 + sqrt 2), residue field F_7) the probe finds k_a of order **6** for all 12 lines. That follows from the
eigenvalues: 3 +- 2 sqrt 2 reduce to 4 and 2, both of order 3 in F_7*, and k_a is -1 on the three directions
perpendicular to its axis, of order 2. So a quotient line has 6 docks, fewer than a side-8 box line. For line
readings the quotient is a worse stand-in than the box.

## 2. Lemma 1: the working rule factors line by line while K is idle

**The working rule** (paper `02-the-rule.tex`, as run by E-SPN-0156 and E-SPN-0157): the coin on a line holding one
open vibe, the meeting of two vibes on one line, the pair move with **no veto** and the two-point store, the collision
'pass' (B on a dock holding at most one single line, K on every other dock), the stream, and the links' grid moves.
A line is **single** when exactly one of its two slots is held.

**The held layer** is everything the paper's state holds: each slot's tone and, for a held slot, its vibe's point and
open bit, each dock line's store trit and stored pair word, and each link's element. (The code also leaves a stale
point on a calm slot. §6 treats it.)

**Lemma 1.** On a configuration in which every dock holds at most one single line, one beat acts on the held layer
as a product over mesh lines of one map U_line, and U_line is the same local map on every line of both meshes.

*Proof, piece by piece.*

1. **The stream** moves slot a of each dock to slot a of the next dock along a: it maps each mesh line to itself.
2. **The coin, the meeting and the contact** act on the two slots of one dock line (`02-the-rule.tex`:13-27).
3. **The pair move with veto 'none'** reads and writes one dock line's two slots and that line's store trit and word.
   A pair made from the store takes its points from the line's word (`code/rule/occupation-veto-knit.ts`, `pairPiece`:
   `c.point[i] = wordFirst(w)`), and an unmade pair writes its points into it. `dockAllows` returns true for 'none'
   without reading the dock.
4. **A link** moves the point of a token that crosses it, and every link lies on exactly one mesh line.
5. **The collision B** on a dock with at most one single line. Full lines turn as -1 (or keep their slots under the
   pass), which is inside each line. If there is one single line, of root r, B applies w_r = -s_r to the non-full
   lines when w_r carries the full lines onto themselves. w_r fixes the slot r, so the single vibe keeps its slot,
   and the other non-full lines are empty. **Probe:** over every occupation with at most one single line (4,096 and
   49,152 for 'lone', 531,441 and 4,251,528 for 'pass', like and unlike full lines), B moves **0** held vibes off
   their line. The control: K on docks with two single lines moves 1,228,800 held vibes off their line over 270,336
   occupations.

Every piece reads labels only, never a dock index or a direction in space, and along any mesh line of either mesh
the labeled walk is ..., a, a, a, ... with slot a facing -a (transfer note, Theorem A). So U_line is one map. The beat's
parity, the schedule's clock bit (`bounce-pair-knit.ts`:49-50), is global and the same on both meshes. ∎

**What K is.** K = w_P is applied to the whole dock when it holds two or more single lines, and it carries vibes
across lines. It is the working rule's only line mixer.

**Lemma 1 fails for** the 'occupation' and 'pairing' vetoes (`dockAllows` reads all 12 lines of the dock, so a pair
move on one line depends on the others), and for every mixer (G, the store mixer, the four-part mixer, proposal 004's
line mixer).

## 3. Lemma 2: K stays idle around a one-line disturbance

**Condition (Z)** for a vacuum: no dock holds a single line at any beat, on any branch. Under Lemma 1 a single line is
a property of one dock line, so (Z) is a property of each mesh line's own state.

**Lemma 2.** Start from a vacuum satisfying (Z) and change the state of one mesh line l0 only, on a segment D, to any
superposition. Then on every branch at every beat, every dock holds at most one single line, so K never fires, l0
evolves by U_line alone, and every other line evolves as the vacuum does.

*Proof.* Induction on the beat. Suppose it holds up to beat t. At each dock, every dock line other than l0's belongs
to a different mesh line (no mesh line holds two dock lines of one dock: on the box by §1, on the honeycomb by
Lemma 3), and those lines carry their vacuum state evolved by U_line, which has no single line on any branch by (Z).
So at most the dock line of l0 is single, B acts, and Lemma 1 applies to beat t + 1. ∎

On the box, the working vacuum (the coset-union no-veto store under the pass) satisfies (Z): "no vacuum vibe is ever
alone on its line" on 51 of 51 cases (E-RLT-0105), and K fires on 0 docks in E-SPN-0157's 48 class runs. The saturated
store vacuum fails (Z) on both meshes alike (E-SPN-0156 gate H2c).

**Two disturbed lines do not transfer in general.** K stays idle only while no dock holds two single lines. Two
honeycomb lines share at most one dock (Lemma 3). Two box lines of different roots can share several, wherever
n a - m b lies in L D4. So the beats and docks at which K can fire differ between the meshes.

## 4. The theorem

Fix a box line l_B of root a on the box of side L and a honeycomb line l_H, and identify their docks by n (mod L on
the box, in Z on the honeycomb).

**The honeycomb vacuum.** Under Lemma 1 any choice of a (Z) state on each honeycomb line, made independently, is a
valid start. Give every honeycomb line the **unrolled** state of a box line: its L-periodic lift to Z. In the working
vacuum the coin acts 0 times on every path (E-RLT-0105) and no piece of the no-veto rule reads a point
(`occupation-veto-knit.ts`:33-37), so the vacuum's held occupation evolves deterministically by a radius-one rule
that commutes with the shift along the line. The lift of the box evolution is then the honeycomb evolution at every
beat, so (Z) holds on the unrolled lines for all t. (If the box line's vacuum depends only on the class mod 2 D4, it
is 2-periodic along the line, and this vacuum is the mod-2 pullback of the transfer note §5.)

**Theorem (line transfer).** Put the same disturbance on the segment D (m docks) of l_B and l_H in these vacua.

1. For every beat t with **m + 2t <= L**, the held-layer state of l_H equals that of l_B, docks identified: both are
   Phi_t on D +- t, the same state, times the vacuum's configuration elsewhere. So every reading of the line agrees
   exactly: positions, points, knots, amplitudes and interference, entropies along the line, store words.
2. A reading on a window W of the line agrees at beat t for every start whose reduced states on W +- t agree, as
   long as |W| + 2t <= L.
3. Every other line reads its vacuum, untouched, on both meshes.
4. **Operator facts carry for all t.** The line rule U_line is translation invariant along a vacuum-free line, and its
   symbol (E-QTM-0157: the lone vibe's walk is the fear walk, symbol trace (1 + w)(z + 1/z), det 4 w, mass sqrt 3, top
   speed 1/2) is the same function on both meshes. The box samples it at z^L = 1, a honeycomb line on the whole unit
   circle.

*Proof.* By Lemma 2 only U_line acts on l0. The stream moves a value one dock a beat and every other piece acts on one
dock (a link on two neighbors), so U_line^t moves dependence at most t docks each way. Outside D +- t the line's
reduced state is the vacuum's on both meshes: an operator supported there pulls back under t beats to an operator
supported outside D, where the starts agree, and the vacuum there is one configuration, so the state factors as
Phi_t times that configuration. Phi_t is computed by the same gates on the same docks fed by the same vacuum values
from D +- (s + 1) at each beat s < t. On the box those docks are distinct as long as m + 2t <= L, so the two
computations are one computation. Part 2 is the Heisenberg form of the same cone. Part 4: a translation-invariant
local map is diagonalized by the shift's characters on both Z/L and Z. ∎

**The bound is the first beat at which the box can differ.** At m + 2t = L + 1 the two ends of the cone meet around
the box line. The coin's keep term (1 + w)/2 has modulus 1/2, so each front carries weight 4^-t, small but not zero,
and whether a given reading moves is a run (R1). E-CMP-0018's record comes back round the 8-dock line at beat 8, a box
line effect with no honeycomb counterpart.

**What the window is in practice.** A lone vibe (m = 1): t <= 3 on side 8, 7 on side 16, 11 on side 24, and 2 on the
F_7 quotient. On the radius-R ball the same argument holds until the cone reaches the reflecting frontier.

**An exact honeycomb instrument for line readings (bears on B-35).** Since U_line is one-dimensional, a single line of
m + 2T docks with the unrolled vacuum computes the honeycomb's line reading exactly for T beats, at a cost growing as
T^2. No ball and no quotient is needed for this class of readings.

## 5. What it carries

| reading | carries | source |
| --- | --- | --- |
| the line law (each line's tone conserved) | for all t | Lemma 1, E-SPN-0098, E-SPN-0156 |
| the lone vibe's band along its line: mass, gap, top speed 1/2 | for all t (operator fact) | E-QTM-0157, E-SPN-0090, E-SPN-0091 |
| the like knot, CHSH sqrt 7, read off the meeting | yes, one meeting on one line fits every box | E-RLT-0099, E-RLT-0105 |
| Bell values after the pair moved, if it stayed on one line | while m + 2t <= L | E-QTM-0140 |
| on-line interference | exactly while m + 2t <= L | E-QTM-0157, E-RLT-0099 |
| the Landauer record on one line | while m + 2t <= L | E-CMP-0018 |
| the vacuum's per-line facts (made = unmade, its cycle, a lone wake on its line) | for all t, per line | E-RLT-0105, E-GRV-0072 |

**Two quoted numbers were read past the window.** E-QTM-0157 reads its interference at beat 6 on side 8 and from beat
9 to 16 on side 16, both past m + 2t <= L. Its qualitative result and its operator facts carry. Its exact numbers are
box-line values and need the one-line run (§7). E-RLT-0099's 7/256 after three meetings carries if its beats fit the
window, which this note did not check. Box totals (466,944 pairs made per cycle) are counts over a box, not line facts.

## 6. What it never carries

- **Husk readings.** The line's state carries but the map from the line to the husk does not. On the honeycomb a line
  meets the cusp layer in at most 2 docks and its husk shadow stops within 1.414 lattice units (E-SPN-0156 H3'). On the
  box half the lines lie in the husk and run forever. Gap m-09.
- **Readings that place several lines in space.** Isotropy, speed by 4d direction, the light cone's shape, area or
  volume laws over a region (E-GRV-0083: a region's entropy sums the line pieces it cuts, and how a region cuts lines
  is mesh geometry: a box line crosses a slab twice a period, a geodesic crosses a convex region once).
- **Anything past the wrap.** The box line's return (E-CMP-0018) and Tsirelson through the line wrap (B-08) have no
  counterpart on a line that never closes.
- **K, mixers and dock-level vetoes.** Two single lines on one dock, the mixers G, the store mixer, the four-part
  mixer and proposal 004's line mixer, and the 'occupation' and 'pairing' vetoes. G2-3 is right that this proof cannot
  close B-12 for proposal 004.
- **Keyed path records.** The registered key is a function of the box's dock index, the beat and the line
  (`code/measure/full-key-paths.ts`:1-16). A path reading carries only if the key along l_H is set to l_B's. Under key 7
  path records are not the base.
- **The calm-point passengers of the code.** After an unmake, `pairPiece` leaves the old points on the two calm slots.
  B moves calm slots across lines on a dock with one single line: the probe counts 24,576 such moves over the 49,152
  'lone' single-line occupations. No piece reads a calm point and a calm point never becomes held (a made pair takes
  the store word's points, a streaming vibe carries its own), so the held layer is untouched. But an amplitude runner
  that keeps calm points in its state key lets them record which-path data, a decoherence that differs by mesh.

## 7. Status

**Proved.** Lemma 1 from the rule's definition, with B checked exhaustively. Lemma 2. Lemma 3, exact. The theorem.

**Argued from the code, not run.** That calm points never become held (`pairPiece`, and the stream moving a slot's
vibe, point and open bit together).

**Needs a run (M3 brief).**

- R1, the one-line instrument. Extract U_line and run one line of m + 2T docks with the unrolled working vacuum.
  Reproduce E-QTM-0157 (beats 6 and 9 to 16) and E-RLT-0099 (7/256). Gate, fixed first: exact agreement with box
  sides 8, 16 and 24 for every t <= (L - m)/2, and report the deviation after it on each side.
- R2, the ball cross-check. On the exact radius-4 ball, a lone love and a like meeting on a line through the base dock:
  the line's held layer equals R1's for every t before the cone reaches the frontier. 0 K docks.
- R3, the passengers. Find whether the exact superposed runners (`code/measure/held-cluster.ts`,
  `code/measure/line-liquid.ts`) key calm points. If they do, rerun E-QTM-0157 with calm points cleared and report the
  change in interference.
