# The cusp neighborhood: what the period and the floor change

Item `vibe-roadmap-board-0027`. Code: [`code/substrate/coxeter/exact-cusp.ts`](../code/substrate/coxeter/exact-cusp.ts).
Experiment: `E-GMT-0041`, [`test/experiment/geometry/cusp-neighborhood.ts`](../test/experiment/geometry/cusp-neighborhood.ts).
The gates were written into the item before any rule ran on the mesh.

## What the instrument is

Take one ideal vertex v of the base cell of the {3,4,3,4} honeycomb. The cells that touch v form the layer. They sit
like the cubes of the cubic honeycomb {4,3,4}, so each layer cell has 6 layer neighbours. Below the layer, each step
away from v multiplies the cells per layer cell by about 18: per layer cell there are 1, 18, 330 and 6,034 cells at
depths 0 to 3.

The cusp's own translations carry the layer onto itself. The instrument is the set of cells at depth F or less,
with two cells taken as one dock when such a translation carries one to the other. Everything is exact in Z[sqrt 2],
and each dock is keyed by its exact center. A slot that faces a cell below the floor streams back into its own
dock's opposite slot. That keeps the stream one to one, so the rule runs back exactly.

Its size is (2L)^3 times the cells per layer cell down to F:

| period 2L | floor F | docks |
| --- | --- | --- |
| 2 | 3 | 51,064 |
| 4 | 2 | 22,336 |
| 4 | 3 | about 410,000 |
| 2 | 4 | about 940,000 |

## Why the period is even

A unit translation along the layer is not a symmetry of the slot labels. It turns them by minus a reflection of the
dock's group W(F4). So a pattern carried one step along the layer comes back with its labels changed. Two steps
undo the change, and the three axes' twists are independent. The translations that keep every label are therefore
exactly 2 Z^3. The period must be even, 2L, or the docks would not face back by the opposite slot, and the rule
refuses such a mesh.

Side 14 (the cusp torus of the mod-7 quotient) keeps the labels. It does not keep the class map mod 2 D4: two steps
along any axis change a dock's class (class 12 on all three axes), and four steps do not. A store built from classes,
such as the stand-in vacuum, needs a period that is a multiple of 4. At period 2 the class map has 3,000 conflicts on
the floor-3 mesh, at period 4 none.

## What the period changes

Nothing in the dynamics. The translations keep the labels, so a beat on the quotient is a beat of the infinite
honeycomb on a state that repeats with the period. This holds exactly at every beat, not only early. What the period
limits is which states can be held: only periodic ones. A local disturbance is really a lattice of copies, 2L layer
steps apart. Copies can meet only after a pattern has spread L steps along the layer. Husk momentum is quantized in
steps of 2 pi / 2L per axis.

## What the floor changes

The floor is the only departure from the honeycomb. A dock at depth d reads the infinite honeycomb exactly for
t <= F - d beats. From beat F - d + 1 on it sees what the floor reflected. So a layer reading is exact for F beats,
which is about 4 at sizes a run can hold. The ball gives the same horizon at its center, so the cusp does not buy a
longer exact run. What it buys is a layer that is the same at every dock, a husk momentum, and a boundary that is flat
and the same under the cusp's symmetries, instead of a sphere around one dock.

After that horizon the instrument is still exact and reversible, but it is a different system: the honeycomb above a
mirror. On the infinite honeycomb, whatever goes down never returns, since the cells below grow 18-fold a step. With
a floor it returns after about 2 (F - d) beats. Any reading of export to the far vacuum, of relaxation, or of a long
speed is therefore a reading of the mirror after that time, and must be shown not to depend on F before it means
anything. The experiment shows how strongly it can depend: a lone love's weight on the layer departs from floor 3's
at beat 2 under floor 1 and at beat 5 under floor 2.

The floor cannot be removed by a further quotient. A lattice of honeycomb symmetries fixes no ideal point with
anything but parabolics, so there is no isometry that folds depth onto itself. A finite quotient with no boundary at
all is item `vibe-roadmap-honeycomb-0008` (mod 3 + sqrt 2), which has a systole instead of a floor.

## Does the floor cause the leak?

No. The earlier cusp-layer runs found that the layer loses 1/32 of its weight a beat (E-SPN-0182, E-SPN-0184). That
number is a count at the first beat: each depth-1 cell has one layer parent, and 18 of a layer dock's 24 slots lead
down. On this instrument, a lone open love on a layer slot of the base dock keeps 1/4 of its weight on the layer
after beat 1 under the working rule (the coin hands the rest to the other slot of its line, which points down), 0
after beat 2, and 3/16 after beat 3. These values are the same on floors 1, 2 and 3 at every beat t <= F, exactly as
fractions. A leak that is the same whatever the floor, inside the beats where the floor cannot yet be seen, belongs to
the honeycomb. The floor only decides what comes back later.

## How the exactness was checked

The exact ball of radius R maps onto the cusp by walking labels: no edge disagrees. The ball's start, links, layout
and store were pulled back from the cusp, and both ran the working rule (the keep and exchange paths, with the coin,
collision pass, veto none) from the open stand-in vacuum and from a lone love. After each beat t <= R, every ball dock
within R - t of the base and at depth at most F - t matched its dock on the cusp, bit for bit. At R = 3 that is 481,
25 and 1 docks at beats 1, 2 and 3, 0 off, while 5,094 ball docks outside that set differed at beat 3. The R = 4 run
is the M3 one. Over 96 beats forward and back on period 4 the start came back exactly, with charge, count and C kept
every beat (about 0.01 s a beat at 22,336 docks on the laptop).

The store is a stand-in (the held pattern of the box's union store, every sign +1). It is not the working vacuum,
which is item `vibe-roadmap-honeycomb-0002`. So nothing here reads physics. The instrument is ready for runs that do.
