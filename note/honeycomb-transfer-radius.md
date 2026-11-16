# The honeycomb transfer radius

Paper 0017 runs its experiments on a flat periodic D4 box and calls it a stand-in for the model's mesh, the
{3,4,3,4} honeycomb, on the ground that a result depending only on the local rule carries over. This note settles
that claim. **It is false beyond one beat at one dock.** The box and the honeycomb agree as labeled graphs on every
labeled walk of length 2 or less, and differ at length 3. So a reading of one dock after one beat carries over
exactly, and every reading that spans two docks or two beats needs a run on the honeycomb itself.

Probe: [`tmp/honeycomb-transfer-probe.ts`](../tmp/honeycomb-transfer-probe.ts) (seconds, laptop). Its output is
quoted below. Item `vibe-roadmap-honeycomb-0006` turns it into a registered experiment.

## 1. The two meshes as labeled graphs

**The box** ([`code/substrate/d4-box-integer.ts`](../code/substrate/d4-box-integer.ts),
[`code/substrate/d4-torus.ts`](../code/substrate/d4-torus.ts)). A dock is a point of the D4 lattice (integer
4-vectors with an even sum) modulo L D4. Slot a, for each of the 24 roots a, links dock x to dock x + a. The Voronoi
cell of D4 is a 24-cell whose 24 facets face the 24 roots. So the box is the cell-adjacency graph of the flat 24-cell
honeycomb {3,4,3,3}: three cells around every 2-face. Its labels are translations: slot a of x faces slot -a of
x + a, a value moving along a keeps the label a, and every label is global.

**The honeycomb** ([`code/substrate/coxeter/label-transport.ts`](../code/substrate/coxeter/label-transport.ts)). A
dock is a 24-cell of {3,4,3,4}, and its 24 slots are its 24 octahedral facets. The 24-cell's dihedral angle is a
right angle there, so four cells sit around every 2-face. A dock is reached by a frame g, an element of the Coxeter
group [3,4,3,4], and stepping across the facet labeled a moves the frame by a fixed transport tau_a = F_a X: F_a
is the reflection in that facet, and X is an element of the cell's own symmetry group W(F4).

The two Coxeter groups differ in one label only: the last one, m(r3, r4), is 3 for the box and 4 for the honeycomb.
Everything below follows from that.

## 2. Which slot labels are consistent (the holonomy question)

A labeling is consistent when carrying a dock's frame around any closed walk returns it unchanged. Then the
transports generate a group acting simply transitively on the docks, and the labeled mesh is that group's Cayley
graph.

**Theorem A.** Among transports that treat every label alike (tau_{h a} = h tau_a h^-1 for h in W(F4)), exactly two
are consistent on {3,4,3,4}: X = 1 and X = Z, where Z is the point inversion of the cell (-1 on its four
directions, the central element of W(F4)). Only X = Z gives the box's convention, where slot a faces slot -a and a
straight chain keeps its label.

*Proof.* X must commute with the stabilizer of facet a, the group B3 of its octahedron. B3 acts irreducibly on the
three directions inside the facet and trivially on the facet direction v. So X is plus or minus one on each part:
X is in {1, Z, s_v, -s_v}, where s_v is the reflection in v. All four lie in W(F4), since v is a root direction.
Consistency means that r4 -> X, with W(F4) fixed, extends to a homomorphism of [3,4,3,4] onto W(F4). X commutes
with r0, r1, r2, and X^2 = 1. So the one condition left is (r3 X)^4 = 1:

- X = 1 gives r3^4 = 1, which holds.
- X = Z gives (r3 Z)^4 = r3^4 = 1 (Z is central and Z^2 = 1), which holds.
- X = s_v is the reflection whose node attaches to r3 with label 3, the configuration of the flat affine diagram.
  So r3 s_v has order 3, and (r3 s_v)^4 = r3 s_v is not 1.
- X = -s_v gives -(r3 s_v), of order 6, and its fourth power is not 1.

With X = 1, the shared facet carries label a on both sides. With X = Z it carries a and -a, and the far facet of the
neighbour carries a again. On the box the same test leaves only the translation: (r3 Z)^3 = -r3 is not 1. ∎

**The holonomy, answered.** The translation transport X = s_v is the product of two mirrors perpendicular to the
step: parallel transport, the direct analogue of the box's translations. It returns around each 2-face square turned
by r3 s_v, a 120 degree rotation of order 3. That rotation is the Gauss-Bonnet deficit: the four angles of the
square are pi/3 each, and 2 pi - 4 pi/3 = 2 pi/3. So a slot label carried by parallel transport does NOT return to
itself. A label carried by the antipodal transport X = Z returns exactly, on every loop.

Probe: on the radius-3 ball (8,857 docks) the antipodal labels give 0 inconsistent steps (frame mismatch 3.3e-13),
and every neighbour's neighbour across -a is the start. The translation transport gives 192 inconsistent steps by
radius 2.

**The price of the antipodal labels.** F_a Z reverses orientation, so next to parallel transport, neighbouring docks
see the dock rule with opposite handedness. The rule cannot tell, since it only reads labels. A reading that
compares directions across docks in space (isotropy, a spin axis, a polarization) must carry the direction by
parallel transport and keep track of handedness. It must never compare labels.

**The group.** The docks form the group K, the kernel of r4 -> Z. It has 24 generators k_a, one per root, with
k_{-a} = k_a^-1, and one relation for each pair of roots with a·b = 1:

    (k_a k_{-b})^2 = 1

This is the square of four cells around a 2-face, walked as a, -b, a, -b.

## 3. The two meshes compared

Each count below is per dock, with walks starting at that dock.

| | box {3,4,3,3} | honeycomb {3,4,3,4} |
| --- | --- | --- |
| shells 0 to 3 | 1, 24, 144, 456 | 1, 24, 456, 8,376 |
| links among the 24 neighbours | 96 | 0 |
| closed walks (a, b-a, -b), a·b = 1 | 192 of 192 | 0 of 192 |
| closed walks (a, -b, a, -b), a·b = 1 | 0 of 192 | 192 of 192 |
| docks reached by the 552 non-backtracking 2-step words | 168 | 456 |
| shortest cycle | 3 | 4 |

**Theorem B.**

1. Both meshes give 24 distinct neighbours, with slot a facing -a, so the labeled 1-stars agree.
2. The only closed labeled walks of length 1 or 2 are the backtracks (a, -a), in both meshes.
3. The box closes 192 labeled triangles at every dock. The honeycomb closes none.
4. Every 4-cycle of the honeycomb goes around one 2-face. A 4-cycle of the box need not: every commutator walk
   (a, c, -a, -c) closes there, and on the honeycomb none of them do.

*Proof of 3 and 4.* Every dihedral angle of the honeycomb's 24-cell is pi/2. A polytope whose dihedral angles are
all at most pi/2 has a property (Vinberg): the hyperplanes of two non-adjacent facets do not meet. Take a dock D with
facets F_a and F_b, the neighbours D_a and D_b across them, and H_a and H_b the facet hyperplanes.

- If F_a and F_b are not adjacent, H_a and H_b are disjoint. D lies between them, so D_a and D_b lie in disjoint
  half-spaces. They share nothing, and no dock other than D touches both.
- If F_a and F_b share a 2-face T, then H_a and H_b are perpendicular. The reflection F_a keeps each side of H_b, so
  D_a lies in H_a+ and H_b-, and D_b in H_a- and H_b+. Their intersection lies in H_a ∩ H_b, which is 2-dimensional,
  so D_a and D_b share no facet (claim 3).
- A dock X adjacent to both D_a and D_b, other than D, must lie in H_a+ and H_b+. A convex cell has only one facet in
  a given hyperplane, so X is the reflection of D_a in H_b: the fourth cell around T (claim 4).

On the box, the dihedral angle is 2 pi/3. Adjacent facets' cells share a facet, which gives the triangles. ∎

The counts in the table are the probe's output. The honeycomb's 456 = 24 · 23 - 96 is exact: the 552
non-backtracking 2-step words collapse only on the 96 squares, one per 2-face.

## 4. What carries over

**Theorem C (transfer).** Take a dock-local synchronous rule: each beat, a dock's new state is a fixed function of
its own state, the 24 states it reads by slot, and the 24 links. Run it on a region of radius rho for t beats. The
result is a fixed function of the initial states at the endpoints of the labeled walks of length rho + t or less from
the center. Two meshes give the same function for every such rule iff they close the same labeled walks of length
2 (rho + t) or less. By Theorem B those agree through length 2 and differ at length 3. So the result carries over
for every rule exactly when rho + t <= 1: **one dock, one beat.**

The bound is tight. Under any dock mixing that couples every pair of slots, a single disturbance fills 1 + 24 + 144
docks of the box in two beats and 1 + 24 + 456 of the honeycomb. Even at one beat, a joint reading of two
neighbouring docks differs: on the box they share 8 neighbours, on the honeycomb none.

The box's wrap (closed walks of length L along a period) does not enter: for side 8, L = 8 > 3.

**What carries over, by this theorem or by algebra:**

- **The dock algebra (L1), zero beats.** The 24 slots, lines and frames, triality, the spinor sign
  (`E-SPN-0042`), Sigma(648) on a link (`E-QTM-0117`), charge conjugation (`E-FND-0038`), and the exact ring
  Z[omega][1/2]. The rule's arithmetic never sees the mesh.
- **Anything decided inside one dock in one beat.** The dock matrix, the coin, the collision tables, and a knot
  made by one meeting, with its weights and its CHSH value as a state (`E-RLT-0099`'s sqrt 7 is algebra if it is read
  off the meeting itself).
- **Mesh-independent theorems.** The speed limit: on any graph, a disturbance reaches at most one link further each
  beat. Reversibility: on any mesh whose slot map is a bijection, the stream is a permutation, so a beat with
  invertible dock maps runs back exactly. A conserved sum of dock-local charges.

**What needs a run on the honeycomb:** every reading after two or more beats or over two or more docks. That
covers the measured light cone (its shape and its front speed, `E-SPN-0136`, `E-SPN-0143`), interference
(`E-RLT-0099`'s 7/256 after three meetings, `E-RLT-0105`), Bell values read after the pair has moved
(`E-QTM-0140`), the bound pair, isotropy and inertia (`E-SPN-0146`, `E-SPN-0107`), the vacuum's gates over 96 beats,
and every husk result.

**Box readings with no counterpart.** K is not abelian (Theorem B.4), so the honeycomb has no 4d momentum, no 4d
Bloch bands and no 4d group velocity. The box's band readings (flat bands, the K^2 coefficient, top speeds by
direction) are readings of a flat 4-torus and have no honeycomb counterpart. On the honeycomb, momentum lives on
the husk: physics is the husk (keys 1), the horosphere at a cusp, whose docks form the cubic lattice {4,3,4}. The
cusp's parabolic translations Z^3 act on the horoball around it. So bands, speeds and isotropy are read there in 3d,
with depth as a column into the bulk, which is experience.

## 5. The mod-2 class map, a bridge for the vacuum

The map k_a -> a mod 2 D4 is a homomorphism from K onto D4/2D4, which is (Z/2)^4. The backtrack goes to 0, and
the square relation goes to 2(a - b), which lies in 2 D4. Probe: on the radius-3 ball, 13,080 edges were checked
with 0 conflicts. A pattern on the box that depends only on a dock's class mod 2 D4 therefore pulls back to the
honeycomb with the same local relations along every link. The box's vacuum store is built from the classes of
L'/2 D4 ([`code/measure/dense-hub.ts`](../code/measure/dense-hub.ts), `HUB_SHIFTS`). If it depends only on that
class and the line, it transfers exactly. Item `vibe-roadmap-honeycomb-0002` checks this.

## 6. Where to run, then

- **A ball of shells 0 to R** with a reflecting frontier: a slot facing out streams into its own dock's opposite
  slot, which keeps the stream a bijection ([`code/measure/hyperbolic-lines.ts`](../code/measure/hyperbolic-lines.ts)
  `ballTables`). The center reads the infinite honeycomb exactly for t <= R beats, and the frontier alters it after
  that. Since R = 4 already holds 162,049 docks, the ball serves growth, shells and short-time cross-checks, not 96-beat
  physics.
- **A finite quotient**, the honeycomb's analogue of the periodic box. The reflections have entries in Z[sqrt 2]
  (2 B = 2, -1, -sqrt 2), and det(2 B) = -2. Reducing them modulo the prime (3 + sqrt 2), whose residue field is
  F_7, gives a finite group. By Minkowski the reduction kernel is torsion free. The docks are the elements of K's
  image K_7, and slot a multiplies by k_a mod 7. That makes the dock graph a finite 24-regular labeled Cayley graph,
  with no boundary, exactly reversible, and with consistent labels. Every dock sees the honeycomb out to the
  quotient's systole, which a gate must measure. The size is |K_7|, somewhere from |G_7| / 1152 to |G_7|, where
  |G_7| <= |O(5, F_7)| = 553,190,400. So it is about 480,000 docks if K_7 meets W(F4)'s image only in 1, and a gate
  must measure it. Its cusps close into cubic 3-tori (parabolic translations have order 7 mod 7), so each one
  carries a finite husk of side 7 with the bulk behind it.

Multi-beat results are read on the quotient, and cross-checked on the ball for t <= R.
