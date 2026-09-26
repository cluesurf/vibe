# What the Base Needs for Color

**The committed knit carries no SU(3)** (`E-FRC-0093` to `0097`, in
[su3-from-the-rule.md](su3-from-the-rule.md)). This note asks the next question: **what is the
smallest change to the base that would carry it, and which parts of SU(3) need anything new at
all?** Eighteen experiments, `E-FRC-0100` to `0117`, answer it with measurements, not arguments.
No random number enters any rule measured here. The seeded heatbaths are reference samplers, and
`E-FRC-0102` and `E-FRC-0110` show the deterministic route to the same ensembles.

## Names

The physics words stay in the tables, because they are what ties each number to a published value.
The prose of the base uses experiential names for the same things.

| name | physics | what it is |
| --- | --- | --- |
| **vibe** | the ternary value in a slot, whose sum is charge, and whose sum mod 3 is triality, color's center | the one thing felt: **fear, calm or love** (-1, 0, +1) |
| **role** | color | which of three roles a vibe plays in a knot. Never felt alone |
| **tilt** | color phase, color's conjugate | which way the role leans, toward the next role around its cycle |
| **turn** | the 24 rotations of the grid, which are the 24 coin directions (`E-FRC-0104`) | a turn of motion. The 24 turns rotate role into tilt and back |
| **knot** | a color singlet, read classically | a set of vibes with no loose end: its sum is 0 mod 3, so no change of role frame can tell its members apart. For three loves, a line of the grid (`E-FRC-0118`). Not necessarily bound: only a paid string binds |
| **dock** | a lattice site | where 24 slots meet on D4, one per direction. Never "cell", except in the polytope's name, the 24-cell |
| **beat** | the time step | one collision in every dock, then one stream. The schedule repeats every 24 beats |
| **knit** | the update rule | one reversible update conserving love minus fear. The committed knit is the turning weave (`code/rule/collision.ts`) |
| **wake** | the growing boundary | the open end, where a new shell of docks is born every beat (1, 24, 456, 8,376 on {3,4,3,4}), the arrow of time (`E-FND-0051`) |

Why fear and love: the rule treats -1 and +1 as exact mirror images, so the names are true
opposites of one kind and one strength (moving away and drawn toward), with calm as neither. What
the committed knit already says about fear, calm and love, all measured in its pair table
(`code/rule/collision.ts`, which calls 0 peace): calm gives rise to a fear and a love together, they
swap, and they fall back into calm, which is the rule's arrow from the vacuum. Swapping fear and love
is the same as running time backwards, since charge conjugation turns the pair clock into its inverse
(C P C = P^-1), so the rule tells them apart only by the direction of time. Love minus fear never
changes, since they are made and unmade only in pairs. A reading rather than a measurement: that
difference, taken mod 3, is color's center charge, which would decide whether roles can close into a
knot (knots exist only at triality zero, `E-FRC-0101`).

The structure is measured and the names are a choice. What is fixed: three roles, none first, each
defined only against the other two. One of each completes a knot, and so do three of the same whose
tilts are all different: a knot is a line of the role grid (`E-FRC-0118`). A role's opposite is the other
two together, since a + b + c = 0 means -a = b + c, which is why a vibe with its reverse cancels. And
a knot can form only where the vibes sum to a multiple of 3 (`E-FRC-0101`, singlets only at triality
zero). So the roles are three phases of one cycle, and a knot is one full turn of it. Which cycle is
not measured. The names are **take, hold, free** (taking in, keeping, letting go), three
movements of the one vibe rather than three kinds of feeling. Free tilts back into take, so the cycle
closes, and a knot is one full cycle of taking in and letting go. None is the opposite of another:
a role's opposite is the other two together, so take meets hold-and-free and the cycle completes. Earlier candidates for role were
dropped for stated reasons: link names the lattice edges and bond is too close to it, strand and cord
are material rather than felt, and seat implied the vibe is felt in three places, when there is one
feeling. The third was first called turn, and became tilt so that turn names only the 24 rotations.

## The answer in five lines

1. **Threes are built from twos.** A baryon needs no three-way vertex. Pairwise color exchange
   binds the epsilon singlet as the unique ground state (`E-FRC-0101`).
2. **Turning color needs a phase on the swap.** A color-respecting permutation can only leave or
   swap (2 of 9! = 362,880 maps), and every other member of the circle
   U(phi) = P_sym + e^(i phi) P_anti entangles (`E-FRC-0100`).
3. **Gauge color can be classical.** The Hessian group Sigma(648) inside SU(3) acts on the nine
   points of a qutrit phase space by permutations, and its elements are labeled by three vibes and
   one of the 24 coin directions, because those directions form SL(2, 3) (`E-FRC-0104`).
4. **At the spacing where our hadrons live, that classical group is SU(3).** With a Re Tr U^2 term
   in the action it does not freeze, it deconfines at N_t = 4, and its Creutz ratios there match
   SU(3) at beta = 5.6925 (`E-FRC-0103`). It runs without dice (`E-FRC-0110`). Finer than that it
   stops, and the next step is one non-classical element.
5. **Selecting color takes a four-line vertex.** A triality of the coin picks the color plane, no
   pairwise rule can keep it and stay connected (`E-FRC-0107`), and one charge on a color line
   traded for three across a triality orbit does both (`E-FRC-0109`, `0111`).

## The measurements

| experiment | measured | grade |
| --- | --- | --- |
| [`E-FRC-0100`](../../../test/experiment/gauge/color-needs-amplitudes.ts) | color-symmetric permutations: **2** for 3 x 3, **1** for 3 x 3-bar, **6** for 3 x 3 x 3, brute force agrees. The circle U(phi) keeps all **9** u(3) generators, its classical points are exactly phi = 0 and pi, entangling power up to 1/4. The rule's clock read as color keeps **3** of 9, a color factor beside the clock keeps **9** | L1 |
| [`E-FRC-0101`](../../../test/experiment/gauge/singlet-from-pair-exchange.ts) | open chain of three triplets, H = S_01 + S_12: unique ground state, overlap with epsilon exactly **1**, gap **1** (gap **3** with the closing bond). Meson: gap **3**. Singlets only at triality zero: qq 0, q qbar 1, qqq 1, qq qbar 0, qqqq 0, qq qbar qbar 2. Best classical overlap with the baryon 1/6 | L1 |
| [`E-FRC-0102`](../../../test/experiment/gauge/kinetic-center-automaton.ts) | the Z3 center with a streaming, exchanging demon per link, fully reversible: plaquette **0.1992** against the heatbath's **0.1992** (confined), **0.979** against **0.982** and **0.994** against **0.998** (ordered, the phase `E-FRC-0099` froze out of), **0.512** mid-gap. Demons that do not stream stall at **0.889** | L2 |
| [`E-FRC-0103`](../../../test/experiment/gauge/finite-color-groups.ts) | see the table below | L2 |
| [`E-FRC-0104`](../../../test/experiment/gauge/classical-color-group.ts) | classical on phase space: Delta(27) **27/27**, Sigma(108) **108/108**, Sigma(648) **648/648** through **216** affine maps (9 translations x all **24** of SL(2, 3), fibre **3** = the center), Sigma(1080) **18/1080**, its golden-ratio generator makes Wigner negativity **0.29**. The coin directions close under x o y = x q y, q = (1 - i) / sqrt 2, with **24 of 24** isomorphisms from SL(2, 3) | L1 |

### Finite color groups against SU(3)

The Wilson action S = beta sum_p (1 - Re Tr U_p / 3), and the modified action
S = -sum_p ((beta0 / 3) Re Tr U_p + beta1 Re Tr U_p^2) of Alexandru et al. (2019).

| quantity | SU(3) | Sigma(648), classical | Sigma(1080), golden |
| --- | --- | --- | --- |
| leaves the SU(3) branch, Wilson action, 4^4 | never | between beta 3 and 3.5 | between 3.75 and 4 (published 3.935) |
| cold against hot at (9.154, -0.906) | | **0.773 / 0.582**, frozen | **0.532 / 0.533** |
| its own trajectory | | beta1 = -0.165 beta0 + 0.31 | beta1 = -0.1267 beta0 + 0.253 (published) |
| N_t = 4 deconfinement, 8^3 x 4 | beta = 5.6925 | beta0 near 13 (confined at 11, deconfined at 14) | between 9 and 9.5 (published 9.154) |
| chi(2,2) at the transition, 8^4 | **0.378** | **0.375** | **0.385** |
| chi(3,3) at the transition | **0.278** | **0.262** | **0.258** |
| chi(4,4) at the transition | **0.185** | **0.179** | 0.280, too noisy to use |

At each theory's own N_t = 4 transition the lattice spacing is the same physical length,
a = 1 / (4 T_c), about 0.17 fm with r0 = 0.5 fm. So equal Creutz ratios there mean equal string
tension in units of the deconfinement temperature, sigma a^2 = sigma / (16 T_c^2). The classical
group reproduces T_c / sqrt(sigma) of SU(3) to within the few percent these boxes resolve.

## How far toward the continuum the classical group reaches

Cold and hot starts on 4^4 along the Sigma(648) trajectory:

| beta0 | 14 | 16 | 18 | 20 | 24 | 28 |
| --- | --- | --- | --- | --- | --- | --- |
| cold | 0.5372 | 0.5501 | 0.5659 | 0.5631 | 0.5652 | 0.5671 |
| hot | 0.5371 | 0.5480 | 0.5487 | 0.5548 | 0.5503 | 0.5432 |
| gap | 0.0001 | 0.0021 | 0.0172 | 0.0083 | 0.0149 | 0.0239 |

The two starts separate from about beta0 = 16, just above the N_t = 4 transition at 13. On
12^3 x 6 the Polyakov loop rises slowly through beta0 = 16, 18, 20 and 22 (0.055, 0.087, 0.092,
0.114) with no clear jump, in the region where the starts already differ by 0.01 to 0.02, so the
N_t = 6 transition on this trajectory is not cleanly separated from the onset of freezing. **On this
trajectory the classical group reaches the N_t = 4 spacing cleanly and not the N_t = 6 one.** A
steeper trajectory and a grid off both do no better, measured with a ruler below.

## Color already in the coin, and what would select it

A way to have color without adding a trit: read a direction's color as its **shadow on an A2
plane**. Around any of the 16 zero-sum triangles of the coin (an A2, the root system of SU(3)) the
24 directions split exactly (`E-FRC-0106`):

| directions | shadow on the A2 plane | as SU(3) |
| --- | --- | --- |
| 6 | the A2 roots | the six charged gluons |
| 9 | the three triplet weights, each 3 times | three copies of a quark triplet |
| 9 | the three antitriplet weights, each 3 times | three copies of an antiquark triplet |

The plane orthogonal to the A2 holds no direction. The 18 non-gluon directions cast six shadows there,
three per point, and the three triplet copies sit **120 degrees apart**.

**What picks one plane out of 16: a triality rotation.** Of the 80 order-three elements of W(F4), 32
fix exactly six directions, and those six are always an A2. The other 48 fix nothing. All 32 are
triality rotations (outside W(D4)), and they select each of the 16 planes once, as a pair g and
g^-1. So choosing an order-three triality of the coin **forces** the color plane (its fixed
directions, the long roots of the G2 that triality fixes, and G2 contains SU(3)). The same rotation
**cycles the three copies**, the shape three generations would take.

**The arrow is enough to choose one.** The previous committed knit, one 9-state table on every line
with an orientation (which end leads), keeps exactly one such pair, with no vibe relabeling. The
committed turning weave keeps none (`E-FRC-0095`). Its own special directions are a coordinate split
instead: the 4 directions at rest are the roots of one coordinate plane, and the 3 massless ones do
not close a triangle.

Two limits. The committed knit conserves charge and **not momentum** (`E-FLD-0020`: charge holds at
every beat while the charge-signed momentum along x drifts by 830 over 48 beats), so the shadow of motion is not a conserved color charge under it. And the reading needs a
rule that keeps one triality rotation, which the previous knit did and the committed weave does not.
So the concrete design question becomes: **is there a turning schedule that does everything the
turning weave was adopted for and still commutes with one triality rotation?**

**Measured: no, not in the family the turning weave came from** (`E-FRC-0107`). The weave couples
the 12 lines in pairs every beat, and was adopted for universality (one connected species graph) and
CPT (a palindrome with identity spatial parity, `E-FND-0117`).

| step | measured |
| --- | --- |
| a color-selecting triality on lines | fixes exactly the **3** color-plane lines, cycles the other 9 in three 3-cycles (all 32) |
| invariant couplings of all 12 lines | **0 of 10,395**. A fixed line must couple to a fixed line, and there are three. A fixed-point-free order-three control admits 27 |
| CPT and covariance together | the adopted parity and full inversion both commute with triality, so a covariant palindrome has to be invariant beat by beat |
| universality | an invariant beat never couples a color line to one of the other nine, so the species graph cannot connect |
| what would reconcile them | an invariant block of **4** lines (one color line with a whole triality orbit), or a CPT whose parity inverts the triality (36 such elements, none of them the identity or the inversion) |

The earlier triality search was also shut for a second reason. The adoption note records that the
triality cosets "do not act on the integer torus": triality has entries of one half, so it preserves
the D4 lattice but not a periodic box of shape L Z^4. That is a property of the box, and a box with
D4-shaped periods would admit it. `E-FRC-0107` needs no box at all, and it shows the obstruction is in
the schedule, not the box.

So color cannot emerge from the committed knit's design family. The obstruction is the same
pairs-against-threes one as `E-FRC-0094`, one level up: **the color plane holds three lines, and a
rule that works in pairs can never treat them symmetrically and still reach them.** A base that wanted
triality color would need a four-line interaction block, and adopting one is a decision, not a
measurement.

### The three copies, measured as generations (`E-FRC-0140`, `0141`)

Under the triality weave every lone vibe on a copy line and its triality image have the same support
at every beat, the same reach and the same charges line for line. The copies are exactly degenerate,
as the symmetry forces. The committed turning weave breaks this on 36 of 36 seeds, with reach 6.74,
2.74 and 1.38 by copy. What the symmetry leaves open is the transition table. The weave's swaps pair
orbits in the order they were listed, and `E-FRC-0109` listed them by line index, which puts one
orbit a copy ahead. As built, 0.028 of a vibe's charge moves one copy ahead and 0.028 one copy behind,
equal both ways, so there is no handedness. Relisted from one copy, the weave keeps every vibe on its
copy at every beat: an exactly conserved copy number, and an identity table. A vibe on a gluon line
gives 0.299 of its charge to each copy. So the triality weave has three exactly conserved, exactly
degenerate copies, a family symmetry with nothing inside it to break it. Breaking it from outside:
the committed knit splits all three apart on all 16 planes (reach spreads 1.59 to 5.66). But a
condensate on one copy under the triality weave sets only that copy apart. The other two stay
exactly degenerate and never feel it (1 + 2), because the vertex never fires on an orbit that one
condensed copy fills. A hierarchy of three distinct values needs a knit that breaks the triality, not
a background on one copy.

## The four follow-ups, worked

### A box where triality acts (`E-FRC-0108`)

The integer torus the committed knit was searched on admits only the 384 signed permutations. A box
whose periods are L D4 instead of L Z^4 admits all 1,152 elements of W(F4), triality included
(`code/substrate/d4-box`). On it the previous knit evolves in exact step with exactly 2 order-three
elements for 24 beats from four starts, and both are the color-selecting trialities. The committed
turning weave commutes with none.

### A rule that keeps color and connects every line (`E-FRC-0109`)

The four-line block `E-FRC-0107` named, built (`code/rule/triality-weave`). Each beat pairs color
line f_r with a whole triality orbit, and a four-line vertex V swaps, for s = +1 and -1:

| before | after |
| --- | --- |
| a charge s leading on the color line, the orbit empty | two anti-charges on the color line, a charge s leading on each orbit line |
| a charge s trailing on the color line, the orbit empty | two anti-charges on the color line, a charge s trailing on each orbit line |

Every swap conserves charge and treats the three orbit lines alike. It moves vibes between a color
line and its orbit only in threes, and that is forced: an orbit state the triality fixes holds a
multiple of three vibes, and a line holds at most two. One beat is V S P S V, where P is the committed
pair clock and S is the committed turning weave's conditional swap written so the triality carries it
to itself (color lines r and r + 1 as a couple, orbits r and r + 1 line by line). The block index r
runs 0 1 2 2 1 0, a palindrome of period 6.

**How it got there.** The first version fired the vertex on all three blocks every beat and added a
second swap (an empty color line and a charge on one orbit line against two charges on the color
line). It passed every structural gate below and then failed the dressing test of `E-FRC-0111`: one
vibe grew into 40,591 changed slots, a support ratio of 726. Eight variants were measured on the same
instruments:

| variant | largest support | growth | line graph, vacuum / dense |
| --- | --- | --- | --- |
| vertex on all blocks, with the second swap | 40,591 | 726 | 1 / 1 |
| vertex on one block, with the second swap | 1,117 | 76 | 6 / 5 |
| vertex on all blocks, no second swap | 457 | 12.4 | 1 / 5 |
| vertex on one block, no second swap | 122 | 6.8 | 6 / 12 |
| the swaps S, vertex on all blocks | 465 | 22.1 | 1 / 1 |
| **the swaps S, vertex on one block (adopted)** | **96** | **4.6** | **1 / 1** |
| the swaps S, vertex on all blocks, second swap on one | 15,787 | 597 | 1 / 1 |
| committed turning weave | 33 | 13 | 3 / 1 |

The second swap is what avalanches: it turns one charge into three with no delay, and firing it on
every block lets each of the three spawn three more on the next beat. The vertex alone cannot connect
the dense background, because it fires only on an empty orbit. The swaps S connect it without adding
any vibe. So the adopted rule keeps the one move that color needs (one charge for three), fires it
on one block per beat, and lets the triality-symmetric swaps do the mixing.

The adopted rule measures:

| gate | result |
| --- | --- |
| reversal after 24 beats forward and back | exact |
| charge | conserved at every beat |
| triality | the evolution commutes with it, beat by beat |
| CPT | exact at the collision level, mirror phase 5 |
| vacuum | periodic, period 3 |
| universality | from every one of the 24 directions a disturbance reaches all 12 lines, on the vacuum and on a dense background |
| previous knit | keeps the triality, 12 disconnected lines |
| committed turning weave | no triality. Connected on a dense background, but on the vacuum a lone disturbance stays in one of 3 sectors (lines 0 2 3 4 6 8 10, lines 1 5 7 9, and line 11 alone), at 24, 48 and 96 beats and on both boxes. Line 11 is the adoption's own phase-protected free mode |

So color selection by triality, universality and CPT can all hold at once. What they need is one
classical four-line vertex: a charge on a color line turns into three identical charges, one on each
line the triality turns into the others. That is the missing "three at once", and it needs no
amplitude.

### The rest of the acceptance battery (`E-FRC-0111`)

The committed turning weave was also adopted on a second battery (`E-FND-0118`). The same physical
questions, asked of the triality weave on the D4 box in a form that does not assume a protected
species:

| test | triality weave | committed turning weave |
| --- | --- | --- |
| vacuum recurs exactly from birth | period **3** | period **24** |
| lone vibes that stay at support one for a whole period | **0** of 24 directions | 8 |
| lone vibes that do not multiply, support never above 2 over four periods | 21 of 24 | 7 |
| lone vibes that travel, at least half the free speed over 6 beats | **0** of 24 | **12** of 24 |
| mean distance a lone vibe gets in 6 beats (free motion: 8.5) | **1.1** | **4.3** |
| a color-neutral triple's reach, against one of its members alone | 1.4 against 1.4 | 8.5 against 8.5 |
| two separated disturbances superpose in the clock amplitude | exact, worst **2e-15** | exact, worst 2e-12 |
| a half born late makes a wall that is a whole number of sheets | yes, up to **110,808** slots, all multiples of 729 | yes |
| wall periodic | **no**, over 72 beats | **no**, over 72 beats |
| dressing: last-period support over first-period support, worst direction | **4.6** | 13 |

Three corrections came out of this, all recorded in the experiments. A late offset of 3 beats equals
the triality weave's vacuum period and made no wall at all, so the offset is 1. A dressing gate of 2
was stricter than the committed knit meets, so the gate is comparative. And the committed knit's own
periodic-wall gate in `E-FND-0118` was a loop that never ran (`t` from 24 while `t + 24 < 48`), so it
passed with nothing compared. Run for 72 beats, that rule's wall is quantized and not periodic. The
gate now requires comparisons and the periodicity is reported.

**The triality weave has no free traveling particle, and nothing in it is bound.** This took two
wrong readings to reach, both recorded in the experiment:

1. Support counts slots, not distance. A first pass read "21 of 24 lone vibes stay compact" as 21
   free particles, and "a color-neutral triple never exceeds 6 slots" as 12 of 12 bound baryons,
   against 0 of 12 in the committed knit.
2. Distance tells the story instead. In the triality weave a lone vibe hardly travels. The pair
   clock sends a lone vibe from one end of its line to the other ((1, 0) to (0, 1) and back), which
   reverses its direction on every beat it spends alone on its line. The committed knit has the same
   clock and 12 of its directions still travel, so what carries them there is its schedule of
   swaps, and that mechanism is not isolated here. The triple and its member reach exactly the same
   distance in both rules, so nothing binds the triple: in the triality weave none of them goes
   anywhere (1.4), and in the committed knit the triple goes as far as its member (8.5). In the
   committed knit 12 of 24 directions carry a vibe at half the free speed or more.

So the real price of the triality weave is its free particles: the committed knit has twelve kinds
of lone vibe that travel at half the free speed or more, and this rule has none. The kick law of `E-FND-0118` is a statement about
support-one species and is not run here.

### A deterministic sampler for the classical color group (`E-FRC-0110`)

An integer-valued plaquette action, E(U) = round(6 (1 - Re Tr U / 3)), makes the energy bookkeeping
exact, so the reversible kinetic demon rule of `E-FRC-0102` runs on Sigma(648)
(`code/dynamics/finite-kinetic`). It conserves energy to the unit and reverses to the bit. Where a
heatbath run from an ordered start and one from a disordered start agree, the automaton matches them
within 0.01. Where they split, inside the first-order partial freezing, the automaton stays within the
envelope the two branches span, as a fixed-energy dynamics must.

The same rule runs the action `E-FRC-0103` actually uses, with its Re Tr U^2 term, quantized at scale
12 (levels -1 to 16). Two things had to be found first.

- **The identity is not the ground state.** The lowest level is -1, so a cold start releases energy
  into the demons, and even with empty demons a run reads beta0 = 11.4 and cannot get colder. A drain
  fixes it: sweep, empty every demon, repeat. After 100 rounds every one of the 1,536 plaquettes of
  4^4 is at -1. Then the demons are filled. Only the starting state changes, not the dynamics.
- **A fixed energy is not a temperature.** Checked against a seeded sampler of the same ensemble (the
  lattice and a bounded demon per link, same total energy, random dynamics), not only against the
  canonical heatbath:

| demon fill | automaton plaquette, beta0 | fixed-energy reference | canonical heatbath at that beta0, from ground / identity / random |
| --- | --- | --- | --- |
| 0.04 | 0.4782, 10.30 | 0.4780, 10.33 | 0.4784 / 0.4789 / 0.4773 |
| 0.02 | 0.5327, 14.65 | 0.5332, 14.71 | 0.5331 / 0.5334 / 0.5324 |
| 0.01 | **0.5660, 14.27** | **0.5641, 14.77** | 0.529 / 0.530 / 0.530 |

The top two rows are ordinary: every reference agrees, and the second is past the N_t = 4 transition
at beta0 = 13. The last row is the finding. With that little energy the melted phase cannot exist, so
the run stays on the ordered branch and reads a **hotter** temperature than the run with twice the
energy. That is the back-bent caloric curve of a first-order transition in a finite box, the same
thing `E-FRC-0102` saw on the Z3 center. The canonical heatbath melts at that coupling because it can
borrow energy from its reservoir. The fixed-energy reference cannot, and it lands on the automaton's
plaquette, 0.035 above the canonical value and within 0.002 of the automaton. Held for 4,000 sweeps
the automaton does not drift. So the deterministic rule is right, and the canonical comparison was the
wrong question for that point. The gate is the plaquette. The demon temperature is reported, and at
the lowest energy it is the weakest number here: each demon holds under 0.15 units on average, and
two seeds of the reference read beta0 = 14.25 and 14.77 around the automaton's 14.27.

The started-from-the-ground-state heatbath also settles a doubt about `E-FRC-0103`: at beta0 = 14.3 it
melts to the same plaquette as the identity and random starts, so the "not frozen at the transition"
claim holds against the true ground state too.

### How far the classical color group reaches toward the continuum

The Creutz ratios serve as a ruler for the lattice spacing. At N_t = 4 they matched SU(3) at its
transition, so equal ratios mean equal spacing. SU(3) at its N_t = 6 transition (beta 5.8941) gives
chi(2,2) = 0.285 and chi(3,3) = 0.159.

| Sigma(648) trajectory | chi(2,2) along it | reading |
| --- | --- | --- |
| beta1 = -0.165 beta0 + 0.31, beta0 = 13, 15, 17 | 0.374, 0.415, 0.448 | finest at 13 (the N_t = 4 spacing), then coarser |
| beta1 = -0.3 beta0 + 0.6, beta0 = 16, 20, 24, 28 | 0.508, 0.436, 0.458, 0.543 | a minimum near 20, then coarser |

On both, the spacing stops shrinking at about the N_t = 4 value (a near 0.17 fm) and then grows. A
grid off both trajectories, at (14, -1.2), (14, -1.5), (18, -1.5), (18, -2), (22, -2) and (22, -2.5),
is frozen or hysteretic at every point. A small chi read on its own misleads there: at (14, -1.2)
chi(2,2) is 0.107, but cold and hot starts sit at 0.999 and 0.894, so that point is frozen, not fine.

The control is Sigma(1080) on its published trajectory, the group with the golden-ratio element. It
keeps getting finer: chi(2,2) = 0.385, 0.306, 0.283 at beta0 = 9.154, 12.795, 19.61, unfrozen at all
three, and 0.283 is already at the SU(3) N_t = 6 value of 0.285. **So the floor belongs to the
classical group, not to the method.**

Why a floor is expected. Sigma(648) is a maximal finite subgroup of SU(3): no larger finite subgroup
contains it. And the Clifford group plus any one non-Clifford element generates a dense subgroup of
SU(3). So there is no middle ground between a finite wheel that eventually clicks and continuous
color, and the step between them is exactly one non-classical element. Allowing one such step per
link (Sigma(648) and Sigma(648) T Sigma(648), 5,832 link values) already holds the Wilson action on the
SU(3) curve to beta = 5, past both Sigma(648) (3.5) and Sigma(1080) (4).

## Seven other ways color could arise, each measured

The triality weave was the first way found to keep a color triality and connect every line. Seven
other routes were proposed and each one was tested, recorded here whether it worked or not.

### The one fact that decides most of them (`E-FRC-0112`)

A rule that can run backwards and is carried to itself by a color triality sigma on every beat
sends a state sigma leaves alone to another state sigma leaves alone, because
f(s) = f(sigma s) = sigma f(s). In such a state the three lines of an orbit hold the same thing, so an
orbit always holds a multiple of three vibes. A lone vibe on a color line with its orbit empty is
such a state. **So no single vibe can ever cross from a color line to its orbit, in any rule of this
kind, not only the pair rules of `E-FRC-0107`.** The orbit gains nothing, three identical charges, or
three identical neutral pairs: 16 possible outcomes in all, listed in the experiment.

Checked exhaustively: all 531,441 dock states sigma leaves alone stay in that set through every beat
of the triality weave, with a multiple of three vibes on every orbit. The committed knit moves 525,609
of them out of the set.

### The seven

| # | the idea | measured | verdict |
| --- | --- | --- | --- |
| 1 | the baryon is the free particle | a color-neutral triple reaches exactly as far as one of its members alone, in every rule measured: 1.4 in six beats in the triality weave, 8.5 in the committed knit. Nothing binds it, and in the triality weave nothing travels (`E-FRC-0111`) | **no**. An earlier count of "12 of 12 bound" measured slots, not distance, and was withdrawn |
| 2 | the triality groups are momentum-conserving three-body vertices | none of the 6 direction groups sums to zero. Each sums to 3 times one color weight, length sqrt 6 (`E-FRC-0112`) | **no** |
| 3 | pair lines by reading the data | covered by the fact above: choosing pairs from the data is still a reversible rule that respects sigma, so a single vibe still cannot leave a color line (`E-FRC-0112`) | **no** |
| 4 | a coin symmetry together with a vibe relabeling | all 1,152 coin symmetries times 6 vibe relabelings: the committed knit keeps only the identity, the triality weave only its own two trialities (`E-FRC-0113`) | **no** |
| 5 | the triality as a symmetry shifted in time | the committed knit has none at any of its 24 shifts (`E-FRC-0113`). Built as a new rule, the glide weave (`E-FRC-0114`): single vibes cross, every line connects, CPT is lost | **works, at the price of CPT**, see below |
| 6 | color as a twist in the box | rotating the color of half the box is invisible in the vacuum of both triality rules at all 24 moments, and a wall of up to 5,750 slots in the committed knit's at 22 of 24. On a dense background every rule sees it (4,232 to 7,488 slots), because in the coin reading a vibe's color is its direction, and rotating color rotates motion (`E-FRC-0115`) | **a global twist only.** Geometric color has one frame for all of space, never one per place |
| 7 | keep the triality only on the docks it fixes | those docks are a 2D sheet, side^2 of side^4 (25, 49, 81 docks on sides 5, 7, 9). But a rule that is the same everywhere and symmetric about one point is symmetric about every point, which brings back the fact above (`E-FRC-0115`) | **only by giving up a rule that is the same in every dock** |

And one guess that failed: that the color group is what the committed pair clock generates, reading
a line's nine states as the nine points of a qutrit phase space. The pair clock is none of the 432
affine maps of that space under any of the 6 ways to label the vibes (`E-FRC-0112`).

### The glide weave (`E-FRC-0114`)

The loophole the fact above leaves: a rule that respects the triality only together with a shift in
time, sigma U_t = U_(t+2) sigma, does not have to keep sigma-fixed states fixed on a single beat. Built
as a pair rule with no four-line vertex (`code/rule/glide-weave`): each beat the committed pair clock
between two passes of conditional swaps, on a matching of the 12 lines that the triality turns every
second beat, so each color line meets the lines of two orbits one at a time.

| gate | glide weave | triality weave | committed |
| --- | --- | --- | --- |
| reversal, charge | exact | exact | exact |
| symmetry | sigma with a shift of **2** beats, not 0 | sigma, no shift | none (`E-FRC-0113`) |
| a lone color-line vibe moves onto one orbit line | **yes**, 36 of the cases tried | impossible (`E-FRC-0112`) | not a color question |
| all 12 lines connected, vacuum / dense | **1 / 1** | 1 / 1 | 3 / 1 |
| CPT | **none found**, with charge conjugation alone or times sigma or sigma^2, any mirror phase | exact | exact |
| vacuum period | 3 | 3 | 24 |
| lone vibes that travel at half the free speed | 0 of 24 | 0 of 24 | 12 of 24 |
| mean reach of a lone vibe in 6 beats (free: 8.5) | 1.9 | 1.1 | 4.3 |
| worst dressing growth, 24 beats | **1** (no vibe ever multiplies) | 4.6 | 100 |

(The committed knit's growth reads 100 here, over 96 of its beats, against 13 over 24 in
`E-FRC-0111`: the same instrument over a longer window.)

**So the loophole is real and it costs CPT.** The glide weave does what no rule symmetric on every
beat can do, with plain pairs, and it connects every line. It gives up the exact CPT both other rules
have, and like the triality weave it has no free traveler. A glide is a symmetry of the dynamics
together with time, not a symmetry at each instant, so whether it yields a conserved color charge is
a separate question, not measured.

### Vibe and flow: is the second trit the vibe's conjugate? (`E-FRC-0116`)

The color group Sigma(648) is the set of rigid moves of a 3 x 3 grid, the phase space of one trit:
9 shifts times 24 turns, and the turns are the 24 coin directions (`E-FRC-0104`). The proposal was
that one axis of that grid is the vibe and the other its conjugate, a flow obeying
flow <- flow + vibe every beat: the vibe as the turning, the flow as where the turning has got to.

| question | measured |
| --- | --- |
| can a line's own two slots be (vibe, flow)? | **no**, under any of the 9! labelings: the pair clock fixes 2 of a line's 9 states, and a grid move fixes 0, 1, 3 or 9 |
| which grid moves can a charge-conserving rule respect? | only those that keep each vibe or flip its sign: **18 of 216**, and **none of the 24 turns**. (Predicted abelian. The 9 that keep the vibe commute, and with the sign flip the 18 do not.) |
| with a flow trit in every slot obeying flow <- flow + vibe, how many of the 216 does the rule respect? | **3**, for the committed knit and for the triality weave: the flow's own shifts f -> f + k. The vibe alone: 1, the identity |

So vibe and flow are a genuine conjugate pair, and the flow law is itself a grid move (a shear). But
**the vibe cannot be an axis of color's grid.** The vibe is charge, and charge is conserved, so no
symmetry of the rule can turn it into anything, and turning is what color's group is made of. The
consistent picture is two pairs: the vibe with its flow, and a separate color trit with its own
conjugate, turned by motion through the 24 coin directions. The color trit is the same one
`E-FRC-0100` found must sit beside the vibe and not be the vibe's clock.

### Vibe, role and tilt as one rule (`E-FRC-0117`)

The pieces above were measured one at a time. Run together: each slot holds a vibe, moved by the
committed knit untouched, and a point of the role grid (role and tilt). Each link holds one of the
216 grid moves, and a slot streaming along a link has its role point moved by it. Where two vibes meet
head-on on a line, their role points swap, the pairwise exchange of `E-FRC-0101`.

| gate | result |
| --- | --- |
| charge | exact at every beat |
| reversal, vibes and role points, 24 beats | exact |
| an independent change of role frame in every dock, links changed to match | **0** mismatches over 24 beats |
| control: roles carried without links | 27,749 mismatches |
| control: roles turned by one fixed move per direction, the coin reading | 40,015 mismatches |

So the three-trit slot fits together: charge exact, reversible, and the role frame can be chosen
freely in every dock, which is what a gauge theory of the roles needs. It needs the links. Carrying
roles without them, or turning them by the coin's directions as the rule rather than as a field,
makes the frame physical.

What it cannot show is a knot. A knot of three roles, one of each, is a quantum singlet, and no
classical state is one (best classical overlap 1/6, `E-FRC-0101`). So binding needs the phase on the
swap, the amplitude the base lacks everywhere else too. The links here are a fixed background.
Letting them move is `E-FRC-0110`.

### A knot without amplitudes (`E-FRC-0118`)

`E-FRC-0117` left one thing out of reach: a knot, three roles tied into one, which as a quantum
singlet has no classical state. Define it classically instead. Each vibe carries a role point p on
the grid and a sign v, +1 for love and -1 for fear, and a set is a **knot** when the signed sum
S = sum v p is zero. A change of frame, one grid move g(p) = A p + u for all of them, sends S to
A S + (sum v) u. So a knot stays a knot under every change of frame exactly when love minus fear is a
multiple of 3. A knot is not bound by being one: binding needs a paid string (`E-FRC-0129`, `0131`).

| check | result |
| --- | --- |
| every mix of a loves and b fears, a + b up to 6 (27 mixes) | the knot is kept by all 216 moves exactly when a - b is a multiple of 3 |
| the quantum count, Sigma(648)-invariant states in 3^a x 3bar^b from the group's characters | nonzero in exactly the same 27 cases, and equal to the SU(3) singlet counts measured before (qq 0, q qbar 1, qqq 1, qqq qbar 0, qq qbar qbar 2) |
| three loves, distinct points | a knot exactly on the grid's 12 lines, 72 ordered triples, every one obeying the rule of SET: on each axis, role and tilt, all the same or all different |
| the quantum singlet's support, role triples all different | all 6 inside the zero-sum set |

So **the triality rule has a classical form**: knots only when love minus fear is a multiple of 3,
because a knot is a sum that a change of frame shifts by (love - fear) times the shift. And **a knot
of three loves is a line of the role grid.** "One of each makes a knot" was half of it: on each axis
the three are all different or all the same, so three takes whose tilts are all different are a knot
too.

The amplitude is needed for one thing only: the singlet's sign, which tells all-different
(antisymmetric) from all-the-same. Being a knot is itself a relation a classical rule can carry.

One difference from continuous color, reported: at three loves and three fears Sigma(648) has 7
invariant states where SU(3) has 6. The classical color group sees one knot that SU(3) does not.

### What a knot feels going round a loop (`E-FRC-0119`)

Carried round a closed loop of links, a role point comes back moved by the loop's grid move, and a
knot survives the round trip when that move fixes the point. An identity decides what this
measures: a color element permutes the 9 phase-point operators, which are a basis of the 3 x 3
matrices, so the points it fixes number |Tr U|^2, checked on all 648 elements. The chance a role point
survives a loop is therefore exactly the **adjoint** Wilson loop, the string of a color octet (a
gluon), and not the fundamental loop Re Tr U / 3, the string of a quark.

On link fields made by the deterministic kinetic rule of `E-FRC-0110` on 4^4:

| loop | hot field, plaquette 0.05 | cold field, plaquette 0.97 |
| --- | --- | --- |
| quark loop 1 x 1 / 1 x 2 / 2 x 2 | 0.049 / 0.0024 / 0.0019 | 0.969 / 0.952 / 0.936 |
| gluon loop 1 x 1 / 1 x 2 / 2 x 2 | 0.0018 / 0.0009 / 0.0002 | 0.949 / 0.922 / 0.895 |
| a role point survives | equal to the gluon loop, to 1e-12 | equal to the gluon loop, to 1e-12 |

The hot field's larger loops are at the noise of this box, so no string tension is read from them.

**So the missing ingredient shows up three times, as a weight a classical count cannot hold.** Each
time it is a signed or complex weight, where a classical rule counts only with nonnegative ones:
- the singlet's sign, which tells all different from all the same (`E-FRC-0118`), is the sign of a
  permutation, +1 or -1
- the quark string against the gluon string (here) is color's center phase, a cube root of unity.
  The grid cannot see it (216 = 648 / 3), and the vibe carries it only as a label, its sum mod 3
- the phase on the swap (`E-FRC-0100`) is the continuous version, whose only classical points are
  leave and swap
They are two different phases, a sign and a cube root, not one. What they share is that they must
interfere, add with cancellation, and a classical role gives only the gluon loop's |Tr U|^2, never
the quark loop's signed Re Tr U.

Not shown: a rule that keeps a knot together as it moves, color charge conservation as a local
law with the links carrying the flux.

### What the seven add up to

Idea 6 names the price of every geometric route. When color is read off the coin, it is tied to
direction, and so it has one frame for the whole of space. A gauge theory of color needs a frame
that can differ from place to place, and that needs color carried apart from direction: the color
trit of `E-FRC-0100`, with the Sigma(648) links of `E-FRC-0103`. A reading, not a measurement: the
two need not be rivals. The coin could select which plane is color and cycle the three generations,
while a separate trit carries the color that can be gauged. Nothing here tests that combination.

## The path forward

Everything classical now fits, and what is left is one kind of thing.

**What works without amplitudes, measured:**

| piece | what it gives | experiment |
| --- | --- | --- |
| vibe (fear, calm, love), the committed knit untouched | charge, and color's center as its sum mod 3 | the committed knit |
| role and tilt, a point of the 3 x 3 grid per slot | color, classically, with the 648-element group acting as 216 grid moves | `E-FRC-0104`, `0116` |
| links holding grid moves | a role frame chosen freely in every dock: a gauge theory, charge exact, reversible | `E-FRC-0117` |
| a knot as a zero sum | knots only when love minus fear is a multiple of 3, in the same 27 mixes as the quantum singlets. Three loves are a knot on a line of the grid | `E-FRC-0118` |
| a role carried round a loop | the gluon string, exactly | `E-FRC-0119` |
| a counter per link that streams | links that move without dice, through both phases | `E-FRC-0102`, `0110` |

**What needs a signed weight, and nothing else does:** the singlet's sign (+1 or -1, which tells a
knot of all-different roles from one of all-the-same), and the quark string (color's center phase,
a cube root of unity, which the grid cannot see). Both are weights that must add with cancellation,
where a classical rule counts only with nonnegative ones. This is the ingredient the quantum sector
lacks too (`E-FND-0080`), so it is one decision for both, not a second one for color.

**The order to go in:**
1. Color charge as a local law. Give each link a flux, the link's own conjugate as tilt is the
   role's, with Gauss's law at every dock: the charge in a dock equals the flux leaving it. A knot
   then moves with no flux behind it, and a part pulled from a knot drags a line of flux whose
   energy grows with its length. That is binding, classically, and it is the next measurement.
   Two things are already fixed by working it through:
   - **the flux is flow, on the link.** Gauss's law needs each link to record what has crossed it,
     flux <- flux + what crosses, which is the law flow <- flow + vibe of `E-FRC-0116`. As a slot
     trit, flow added nothing. As the link's conjugate it is what makes color charge local. The
     triality part of the flux is the vibe's own crossing count mod 3, so a knot (love minus fear a
     multiple of 3) crossing leaves none and a lone part leaves one, link after link: the string
   - **created pairs must be neutral, so a calm line carries one latent role.** In the rule of
     `E-FRC-0117`, calm gives rise to a fear and a love whose role points generally differ, which
     would make color charge from nothing. Conservation needs the new pair to share one point, and
     reversibility needs that point to exist before the pair does. So a calm line holds one role
     that splits into the pair at creation and rejoins at annihilation
2. Roles on moving links: run the transport of `E-FRC-0117` on the link fields of `E-FRC-0110` as they
   evolve, which needs the two geometries (the D4 box and the hypercubic lattice) brought together.
3. The signed weight. **It may already be in the base, as the vibe** (`E-FRC-0120`). A quantum
   state of roles is exactly a weighting of the role grid, its discrete Wigner function, and it is
   classical where every weight is at least 0: the color group then only permutes points. A set of
   vibes on grid points is already a signed weighting, love +1 and fear -1. Measured on the 729
   points of three roles:

   | state | units | loves | fears |
   | --- | --- | --- | --- |
   | a classical product state | 27 | 27 | 0 |
   | the knot of three equal roles | 27 | 27 | 0 |
   | the singlet, three different roles | 54 | 72 | 18, on 9 points |

   Each sums to 1 and gives back the state's role probabilities. So the singlet is written exactly by
   whole numbers of loves and fears and needs fear, and the all-same knot does not: the sign that
   tells all-different from all-the-same is fear. Three things then line up. Negative weight is what
   quantum physics calls magic, the same single non-classical ingredient the continuum floor needed
   (`E-FRC-0103`). Calm gives rise to a love and a fear together, which adds no weight and creates
   negativity, the way a quasi-probability becomes non-classical while staying normalized. And the
   probability of an outcome is a sum of weights along a line of the grid, and the lines are the
   knots (`E-FRC-0118`).

   **And a step, not only a state (`E-FRC-0121`).** Any gate moves grid weights by an exact real
   kernel. A classical gate permutes points, and a non-classical one spreads a point's weight over
   several with signs, one love becoming loves and fears, which is what calm does when it gives rise
   to a pair:

   | step | classical? | weight kept | kernel in whole fractions | vibes from one, per step |
   | --- | --- | --- | --- | --- |
   | the plain swap | yes | yes | yes, a permutation | 1 |
   | a color move | yes | yes | yes, a permutation | 1 |
   | **swap phase at 2 pi / 3** | **no** | yes | **yes, quarters** | 2.5 |
   | swap phase at pi / 2 | no | yes | no, it needs sqrt 3 | 2.7 |
   | T, the continuum floor's element | no | yes | no, it needs cos(2 pi / 9) | 1.6 |

   **The swap phase at a cube-root angle is carried exactly by whole loves and fears.** The Clifford
   group is a maximal finite group for a prime number of levels, so the classical moves plus any one
   element outside them generate an infinite, dense set of gates (the cited result, not measured
   here). If that holds for this pair, loves, fears and calm can carry the quantum side exactly with
   no irrational amplitude, using the cube-root swap alone.
   The price is the known price of anything non-classical: each such step can turn one vibe into up
   to 2.5 before loves and fears on one point cancel back to calm.

   **Where the cost goes (`E-FRC-0122`): into grain, not fear.** Two roles, eight rounds of the
   cube-root swap phase and a classical entangling move, every state written exactly in loves and
   fears:

   | round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- |
   | units | 9 | 36 | 36 | 144 | 144 | 576 | 576 | 2,304 |
   | negativity, bound 3 | 1.00 | 2.33 | 2.33 | 2.47 | 2.56 | 2.49 | 2.37 | 2.39 |
   | share of fear | 0 | 0.29 | 0.29 | 0.30 | 0.30 | 0.30 | 0.29 | 0.29 |

   Each exact non-classical step can make the units four times finer, while the share of fear settles
   near three tenths and the negativity well under its bound. So a finite number of vibes carries
   quantum steps at a finite resolution: the grain of the quantum side is set by how many vibes there
   are.

   **Why fear stays under a third, never a half.** Two facts fix it. Love minus fear is exactly one
   whole on every round, because the weights always sum to 1, and that is the charge conserved. So a
   half-fear state would have love minus fear at 0, a whole weighing nothing. And for a pure state on
   the 81 points the squared weights sum to exactly 1/9, so by Cauchy-Schwarz love plus fear is at
   most sqrt(81 × 1/9) = 3 wholes, the bound in the table. Together, love ≤ 2 and fear ≤ 1, so the
   share of fear is at most one in three. Round 8 is 3,910 loves and 1,606 fears on a unit of
   1/2,304: love − fear = 2,304 units = 1 whole, love + fear = 5,516 units = 2.39 wholes, and the
   share of fear is 1,606 of 5,516 = 0.29. The steps add loves and fears in equal numbers, which is
   the grain. The total jumps from 1 to 2.33 at the first round with fear and then moves between 2.33
   and 2.56, up and down, never near the ceiling of 3. The sum of squared weights is exactly 1/9 on
   every round, so every round is pure and the bound applies exactly.

   A first version kept both roles symmetric, where the swap phase does nothing, and measured no
   fear at all. It is recorded in the experiment.

   **So vibe and role are woven together, at one place.** The vibe is not a second coordinate beside
   the role, which is why it cannot be an axis of the role grid (`E-FRC-0116`). It is the weight on a
   role point: the role says where, the vibe says how much and with which sign. Classical steps move
   role points and carry their vibes unchanged, which is why every classical test found the two
   independent. The one-third turn at a meeting is where they interweave: it changes the vibe
   according to the roles, acting on the part where the two meeting roles differ and leaving the part
   where they are alike untouched. Both halves are measured. A first run of `E-FRC-0122` kept the two
   roles alike, symmetric, for eight rounds and made no fear at all, and the corrected run let them
   differ and fear appeared at once and settled near three tenths. The singlet agrees: three
   different roles need 18 fears, three alike need none. And the charge law is the weight law: love
   minus fear, conserved by the committed knit, is the total weight on the grid, and calm giving rise
   to a pair adds none.

Steps 1 and 2 need no new kind of ingredient. Step 3 may not either: the sign is fear, the one exact
non-classical step is the swap phase at the cube-root angle, and it is the one place the vibe depends
on the roles.

## The path, walked (from `E-FRC-0124`)

Each step above was built and measured. What each one found, and what it changed about the plan:

| step | result | experiment |
| --- | --- | --- |
| 1. color as a local law | exact, but only without the hop. Of the 16 line tables that make pairs from calm, color is conserved dock by dock exactly for the hop-free ones, with a calm slot's role point counted as color signed by its side of the line. The committed table has the hop and admits none | `E-FRC-0124` |
| 1, what it costs | one thing. The hop-free table matches the committed one on reversal, charge, CPT at the same mirror phase, the vacuum's period, the line graph, exact superposition and sheet-quantized walls, and travels farther (15 of 24 directions against 12, mean reach 5.67 against 4.32). But a lone vibe's disturbance spreads wider: its largest support over every direction reads 51, 331, 1,319, 2,587 slots in the first four periods, against 33, 160, 565, 1,508. Both grow smoothly, with no runaway. The experiment fails its comparative gate on this, and the failure stands | `E-FRC-0125` |
| 2. roles on moving links | exact. Links move by reflection through a triangle's staple, taken where the local energy is kept: exact reversal, energy to the unit, a frame change in every dock commuting with the whole rule, and 1,814 of 1,944 links moved in 24 beats. The index-order step of `E-FRC-0110` on the same links breaks the frame change | `E-FRC-0128` |
| 3. the signed weight as a beat | exact. The cube-root swap phase runs as an integer beat on loves and fears whose fears come from calm as pairs, reversible and charge-conserving, exact for as many beats as the knot has grain and refusing past it. The gate set is universal, checked: its Lie algebra is all 80 dimensions of su(9) | `E-FRC-0127` |
| binding, static | measured with no random number. The Sigma(648) automaton gives Creutz ratios 1.41 and 1.15 at two couplings, matching the heatbath, with the fundamental Polyakov loop at zero: the center (the vibe's phase) is unbroken, so a lone color has infinite free energy | `E-FRC-0126` |
| binding, moving | the mechanism, on a line. A hop pays the change in string energy (the triality flux, E mod 3) to a demon, or reflects. A love and a fear keep a mean gap of 1.9 docks while traveling 486, against 64 with no tension. A baryon holds together (spread 4.0 against 61) and moves freely relative to its antibaryon | `E-FRC-0129` |
| can a lone color return? | not under the committed orientation. Color-local moves keep a lone vibe in its sign class, and the committed class of 12 directions lies in an open half-space (witness c = (4, 3, 2, -1)): a lone part drifts one way forever. Exactly 192 of the 4,096 orientations of the lines do this, the positive systems of D4. The other 3,904 hold a zero-sum triangle, so a part could come back | `E-FRC-0130` |
| binding, moving, on D4 | bound when cold, melted when warm. With matter that waits in docks and a paid hop, at the coldest demon energy a meson keeps a mean gap of 1.72 while traveling 34, against 122 with no tension, and a baryon holds together (spread 2.7 against 228) while it moves. Warmer, the string melts (mean gap 89.5 at the hottest), the deconfinement of a string with 23 ways to turn, between the fills 0.05 and 0.1 | `E-FRC-0131` |
| 1, the dressing, answered | a color-local table that dresses no more. A lone vibe's dressing is pair creation from calm, exactly 1 + 2 x the net pairs left. The committed table is the hop-free transposition after a line reflection, and the reflection is the move that breaks color and keeps the dressing low. Varying the hop-free schedule one freedom at a time finds 0 winners in 98,468 members. Varying the turn and the swap order together finds several. The color turn weave (its turn swaps axes 0 and 1 and negates axis 2, line permutation [0, 1, 7, 6, 8, 9, 3, 2, 4, 5, 11, 10], swap order 3, 0, 5, 2, 4, 1) keeps reversal, charge, CPT, the vacuum's period, superposition and sheet-quantized walls, has 2 vacuum line components against 3, and leaks 0 color. At side 9 a lone love dresses 31, 115, 265, 507 slots and a lone fear 27, 115, 265, 507 in the first four periods, against 33, 160, 565, 1,508 and 27, 163, 581, 1,501 under the committed knit, and it stays bounded the same way at sides 7 and 11. The full battery on it is still running (`E-FRC-0148`, `0149`, not yet registered) | `E-FRC-0136`, `0137` |
| binding, moving, in the slots: waiting | built as argued, and it cannot pay. Two waiting slots per dock and the returning orientation (mask 1, 4 triangles in its plus class, the committed one 0) give a rule exact in reversal, charge, energy, Gauss's law, local color (0 leaks, 3,629 when a waiting slot trades across sides) and frame change. But the stream moves every charge in a moving slot, so where no direction can be paid, a charge just arrived and a charge already waiting would both have to end waiting. A reversible rule sends 12 of the 13 places of a lone charge across unpaid, and more waiting slots add places before and after alike. A lone love with no tension does not come back under either orientation | `E-FRC-0132` |
| binding, moving, in the slots: the result | waiting slots do not bind: at the coldest fill 1,012 of 1,024 string crossings go into debt and the meson's mean gap is 219, against 121 with no tension. What removes the debt is a crossing that bounces when it cannot be paid, with a calm slot's color sign carried by what the slot holds (0 color leaks, 3,759 with the sign fixed by the slot). No demon goes below zero. A meson keeps a mean gap of 0.17 against 441 and a baryon a spread of 1.8 against 447, melting between the fills 0.2 and 0.35. But a bounce reverses the charge, so the cold bound pair settles in one dock and travels 0.7 in 600 beats, against 34 in `E-FRC-0131`. Moving binding in the slot architecture is not shown by bouncing | `E-FRC-0133` |
| binding, moving, in the slots: what frees it | steering. A charge that can steer onto or off its string, with each charge carrying its own store of energy, keeps every local law of the reflecting slots exact: reversal, charge, energy to the unit, Gauss, no demon or store below zero, local color with the sign carried (0 leaks, about 3,750 with the sign fixed), and a frame change in every dock | `E-FRC-0146` |
| binding, moving, in the slots: steered | bound and moving, on a new schedule. A cold meson keeps a mean gap of 1.87 while traveling 13, against 409 with no tension, and a baryon holds together (spread 10.8). The mechanism is a cold walker: the rear charge's released unit rides the streaming demon to the front. Both melt as the demons warm, not monotonically. 510 of 576 starting headings give a bound pair that travels, and all 576 bind. A store carried by each charge does not free it. The steering runs on a round robin of all line pairs (11 matchings), which is not the committed weave: the weave's couples reach only 5 of 12 lines, and on them 88 of 576 headings walk. Weaker than `E-FRC-0131`: travel 13 against 34, baryon spread 10.8 against 2.7 | `E-FRC-0147` |
| a schedule the knit could carry | a folded round robin. Steering needs every line to meet every other, and no knit that precesses one partition by a symmetry of the box has that: the color turn weave's couples reach 12 of 66 pairs of lines, and no power of any of the 1,152 symmetries reaches more than 36. A round robin folded into the 24-beat palindrome reaches all 66 and keeps CPT, and lone steering leaves the folded vacuum's period as it was, 72 beats, against the committed knit's 24. The fold's turn is not a box symmetry, and the acceptance battery on the fold is not yet run | `E-FRC-0152` |
| binding, moving, on the fold | bound and moving, short of matter that waits. With lone steering on the folded round robin a cold meson keeps a mean gap of 1.27 while traveling 20, against 252 with no tension, and a baryon holds together (spread 8.1 against 383). The gap rises monotonically with the demon energy. String-led demons, faster demons and differ steering do not close the gap to `E-FRC-0131` (travel 34, spread 2.7) | `E-FRC-0153` |
| links that feel the matter | exact, and local. With the hopping term in the links' energy and every move paid to a demon, the rule reverses, conserves energy to the unit and commutes with a frame change in every dock (a link priced without the matter term leaks 99 units, matter coupled without the link gives 208,606 frame mismatches). Matter shapes the links it touches: static source lines make their links carry their color 0.81 of the time on a melted field (1/9 by chance, 0.10 with kappa 0) at a cost of 0.22 ± 0.07 in the triangles round them, and a meson's link carries its color 0.92 of the time when adjacent. But no string forms: the pair's link response does not depend on its separation beyond the noise, the Polyakov correlator is at the noise, and the meson is bound only by contact (mean gap 3.73 against 3.94). The role points see the 216 grid moves, the center divided out, so their string is the gluon's and can break. The quark string is the center flux of `E-FRC-0129` and `0131`, which this rule lacks. On the cold field the link response drops to 0.48 and its gate fails | `E-FRC-0134`, `0135` |
| the full three-trit link | exact, and a quark string on the melted field. Each link holds the grid move, priced with the hopping term, and the center flux, Gauss's law with a tension on E mod 3, every move paid to a demon: exact reversal, energy to the unit, love and fear, Gauss's law at every dock and a frame change in every dock. A hop that leaves its flux behind breaks Gauss's law, unpaid flux leaks energy, and matter carried without the link breaks the frame change. Melted, the string between a static love line and a fear line stays taut: excess 0.20, 0.60, 0.26, 0.77 per slice at R = 1 to 4, potential rising from 14.4 to 57.3, where the tension-0 control spreads over 4,228 links. A meson keeps a mean gap of 1.48 against 65.6 free while traveling 7.7. Tension alone binds (1.65), hopping alone does not (148.7). Cold, the meson binds (2.68) but the string gates fail (excess 2.77, 0.14, -0.02, 2.53), at the noise of about 102 vacuum flux links, with tension x beta 3.33 against ln 23 = 3.14. The limit: the center phase is not a variable here, and the grid field and the flux meet only through matter | `E-FRC-0144`, `0145` |
| one Sigma(648) element per link | exact, and two gates fail. Each link holds the full element of the classical color group, priced on Re Tr so the field feels the center, with the grid move its quotient (a homomorphism with kernel exactly the 3 center elements) beside the flux E and Gauss's law: exact reversal, energy to the unit, love and fear, and a frame change by all 648 elements and by center elements alone. Setting the link's center phase equal to E mod 3 instead breaks Gauss's law at 187 of 256 docks under a center frame change. The string between a static love line and a fear line stays taut on both branches (excess under 0.61 melted, under 0.012 cold), the melted meson binds while it moves (gap 1.43 against 65.6), and the center stays unbroken (\|<P>\| 0.0001). But no Creutz ratio can be read, loops past 1 x 1 sitting at the noise, and the cold meson is frozen | `E-FRC-0150`, `0151` |

**Two things the plan said that the measurements corrected.** A calm line does not hold one shared
role: every calm slot keeps its own, and its sign is set by its side of the line, which is what makes
the pair made from calm neutral and every later step conserve it. And the flux alone does not bind:
it is exact from `E-FRC-0123` on, and a part still drags it for free. Binding needs the move to pay
for the string, which the committed knit's unconditional stream does not do. That paid hop is the one
thing the base would add for moving binding, and on the D4 lattice it is not yet built.

**The three-trit link is the confining group.** A link's grid move lives in the Hessian group of 216
elements, which is Sigma(648) with its center divided out, and the link's flow mod 3 is that center.
So the link of the three-trit model carries exactly the Sigma(648) element whose confinement
`E-FRC-0126` measures.

### The signed weight inside the lattice (`E-QTM-0099` to `E-QTM-0108`)

**The fear beat inside the lattice (`E-QTM-0099` to `0101`).** In `code/rule/fear-weave`, tokens
move exactly as the color weave moves role points. A knot's loves and fears ride those tokens as
whole-number weights on their joint role points, and the one-third turn acts where two of them meet.
With it off the rule is the color weave (0 mismatches over 5,423 meetings). With it on it reverses
exactly, keeps love minus fear and the vibe sum, stays pure in integers (fear share at most 0.30),
and commutes with a change of frame in every dock. A meeting feels only the holonomy of the loop the
two tokens' paths enclose. The pair made together in the vacuum shuttles round its own line and never
passes 36 units. The pair that grows most quadruples its grain at every meeting and is refused at
meeting m + 1 when it holds 9·4^m units. The weights are quantum in the roles: chances 1/4, 3/4, 1
over three meetings against 1/4, 3/8, 7/16 for the phase-free stand-in, and CHSH √7 from two docks
against 2. Meetings keep the singlet share at exactly 1/6, so the singlet's 18 fears are not made by
meeting. Positions stay classical. Toward the continuum, Sigma(648) on each role plus the swap phase
spans all of su(9). But one swap phase gives no step finer than the classical group (0.650). Two give
the first finer step (√(1/6) = 0.408) at 16ths of grain, and neither comes closer to T than the
classical 0.395.

**A love meeting a fear (`E-QTM-0102`).** The swap phase does not respect color when a love meets a
fear: it breaks both love minus fear of the two role points and the grid moves, with 378 color
violations. The gate that respects color there is the singlet phase. Its kernel is in thirds with
fears, it keeps love minus fear of the two role points in every configuration, and it commutes with
all 216 grid moves, with 0 violations. Sigma(648) allows only two color-respecting gates per pair (a
commutant of dimension 2), so no color-respecting meeting can make or unmake a knot of two or three
roles. The love-fear knot is nine loves and no fear. Only link holonomy moves the knot share: one
meeting and one grid move make the meson knot exactly, and holonomy lifts the three-role share from
1/6 to 0.784.

**Motion (`E-QTM-0103`).** The one-third turn on a lone vibe's slot moves it quantum-mechanically,
exact in Eisenstein integers for 400 beats and reversible. The spread grows as t (exponent 0.997),
where the phase-free stand-in diffuses as √t (0.497), and <x^2>/t^2 = 0.1339779 against
1 - √3/2. Two paths round a ring give 1/4, 13/16, 13/16 against 10/16 without the phase. But streaming
permutes the Wigner grid only on a ring of 3 docks, so on a longer ring the weight on position is
complex, not real loves and fears.

**The ladder toward T (`E-QTM-0104`).** A beam over words of Sigma(648) moves and m cube-root swap
phases on two roles is exact at one swap phase but misses the two-swap-phase optimum (0.497 against
0.395), a failed gate that stands. The first word closer to T than any classical element needs 4 swap
phases (0.362) and costs 2^8 of grain. Six give 0.348 at 2^12, and the smallest step reaches
√(1/8).

**Love = fear, measured (`E-QTM-0105`, `0106`).** Stored as its departure from calm, the fully mixed
state, every knot of the fear weave holds exactly as many loves as fears. Every step fixes calm, so
the departure moves by the same kernel and reads back as the fear weave's knot at every one of 480
beats for three pairs and a triple, with chances 1/4, 3/4, 1, CHSH √7, exact reversal, and the grid's
love minus fear equal to the vibe charge of the pair made from calm on 480 of 480 beats. The cost is
exactly 3^k units of grain per knot. C stays a symmetry, but the literal love-fear swap gives negative
chances. Giving each knot its charge as a sign, +1 for a love-knot and -1 for its mirror, keeps
love = fear and every chance, but the additive ledger breaks at the first meeting of two knots (0
before the join, -1 after, at beat 6 for the pair made from calm and beat 232 for the grower pair),
because joined knots multiply what they carry and charges add. The center phase omega^q, a cube root
of unity raised to the charge and exact in Eisenstein integers, passes every one of the same gates:
love and fear carry mirror values (omega and omega^2), the exponent is the additive ledger, and C is
complex conjugation. Neither changes a chance.

**The weight is roles, and the fear clock (`E-QTM-0107`, `0108`).** Every Eisenstein weight is one
knot-free count of vibes in take, hold and free, unique up to knots (1 + omega + omega^2 = 0) and the
fewest vibes, with -1 = (0, 1, 1). The walk run as additions of role-rolled counts and knot removal
equals the Eisenstein walk at every slot for 200 beats, drops knots only where the swap phase turns
roles, reverses exactly and keeps (2^t, 0, 0) as its total. And the committed pair table is calm-pair
creation after an exchange: the fear clock puts the swap phase in place of the exchange. At phi = pi
it is the committed knit beat for beat on rings of docks and on one D4 dock, reproducing
`E-FND-0080`. With the turn it is exact, keeps love minus fear and reverses, and on the rings a
seeded vibe spreads to every slot and two seeds interfere from beat 3, the amplitude `E-FND-0080`
found missing. On one dock in 9 beats seeds spread to 3 slots but never interfere, a failed gate that
stands. `E-QTM-0099`, `0100` and `0102` also carry color-mode sections, their gates fixed before the
runs: in color mode the pair reads 1/3, 1/3, 1 against 1/3 dephased, with CHSH 2.5523.

**Forced by the color law, not chosen:** with the three-trit model adopted, the fear weave uses the
singlet phase where a love meets a fear and the swap phase where like meets like, so grain becomes
2^a 3^b.

## What the base would change

Each item names the base thing it touches, the experiment that says why, and where the decision
stands. The color trit and the Sigma(648) links were adopted on 2026-09-25 as the three-trit model
(vibe, role and tilt per slot, a grid move per link). Its results are measured on the knit variants
named in each experiment. The committed knit (`code/rule/collision.ts`) has not changed yet, and
which pair table the three-trit knit runs is still open.

| change | touches | why | cost | decision |
| --- | --- | --- | --- | --- |
| a color trit beside the vibe | the vibe | the pair table runs the vibe on a period-three clock, and a clock kept as color breaks SU(3) to its 3-dimensional Cartan part (`E-FRC-0100`). With it, color is an exact local law on a hop-free table (`E-FRC-0124`) | one more trit per slot | **adopted** 2026-09-25, the three-trit model |
| links that hold a Sigma(648) element | the crystal | gauge color lives on links, and this group is a record of three vibes and a coin direction (`E-FRC-0104`), classical. The full element per link is exact beside the flux and Gauss's law (`E-FRC-0150`) | 648 states per link | **adopted** 2026-09-25, the three-trit model |
| which pair table the knit runs | the rule | a hop-free table keeps color local exactly (`E-FRC-0124`). The first one dressed 1.7 to 2.3 times wider (`E-FRC-0125`). The color turn weave does not, and passes every gate of the committed knit (`E-FRC-0136`, `0137`) | none beyond the table | **pending**: the color turn weave is the candidate, and its full battery (`E-FRC-0148`, `0149`) is still running |
| weights stored as the departure from calm, with the center phase omega^q | the signed weight | love = fear in every knot, and every chance and the grid's charge read back for 480 of 480 beats (`E-QTM-0105`). A +1 or -1 sign per knot breaks the additive ledger at the first join. omega^q passes the same gates with its exponent as the ledger (`E-QTM-0106`) | 3^k units of grain per knot | **adopted** 2026-09-25: option 1 storage plus the center phase omega^q. Neither changes a chance |
| one phase on the pair swap | the rule | the only color-respecting move beyond leave-or-swap (`E-FRC-0100`), and what turns a quark's color. Where a love meets a fear, the color law forces the singlet phase instead of the swap phase (`E-QTM-0102`) | an amplitude, the same missing piece as `E-FND-0080`. Grain becomes 2^a 3^b | **adopted**: the singlet phase at love-fear meetings and the swap phase at like meetings, forced by the color law. **Pending**: putting the fear beat into the knit, held until quantum motion and the color gate report |
| a kinetic counter per link that streams | the rule | without it a deterministic link rule freezes (`E-FRC-0099`), with it the Z3 center has its whole phase diagram (`E-FRC-0102`) | one bounded counter per link | not decided |
| a four-line vertex | the rule | the only way to keep a color-selecting triality and still connect every line (`E-FRC-0107`), built and measured (`E-FRC-0109`). Its three copies are exactly degenerate (`E-FRC-0140`) | one classical exchange, a charge on a color line for three on the triality orbit | **pending**: how the triality weave lists its orbits, as built (one orbit a copy ahead) or relisted from one copy (an exactly conserved copy number). Recommended: relisted, for consistency |
| one non-Clifford element | the rule | not needed down to about the N_t = 4 spacing (`E-FRC-0103`). Finer than that the classical group stops shrinking. The first finer step needs two swap phases (`E-QTM-0101`), and the first word closer to T needs four (`E-QTM-0104`) | Wigner negativity, the qutrit form of magic, the same ingredient as the swap phase | not decided |

**Also pending the user:** whether `E-FRC-0139` keeps its failed R = 3 screening gate (3.02
standard errors against a gate of 3) against the pre-registered R = 2 gate. Recommended: keep the
fail, and add a measurement of the correlator's bias at half the box.

The gauge side of color, confinement and deconfinement, needs no amplitudes at the spacing
measured. The matter side, a quark whose color turns, needs the phase on the swap. That phase is
the same ingredient the quantum sector is missing, so color does not add a second requirement.

## What this does not show

- **The continuum limit.** One spacing, small boxes. The N_t = 6 and N_t = 8 transitions of
  Sigma(648) on some unfrozen trajectory are the next measurement.
- **Dynamical quarks with a finite color group, now measured (`E-FRC-0138`, `0139`).** Color
  triplets (the orbit of e0 under Sigma(648): 216 vectors on 12 rays, the center moving each along
  its ray) hop along links carrying their color across, are made from calm in pairs of love and
  fear, and pay a mass and the hopping term round(-6 Re <phi_x, U phi_y>) from the same demons that
  move the links. The rule reverses exactly and conserves energy to the unit and love minus fear
  exactly. The center breaks: <Re P> = 0.0853 +- 0.0022 against 0.0005 +- 0.0015 for pure gauge and
  0.0009 +- 0.0007 for center-blind matter, whose bond reads |<>|^2, what a role point feels.
  Rotating one time slice by the center raises the matter energy by at least 1,226 units on every
  sampled configuration, and by exactly 0 for blind matter. The Polyakov correlator levels off at
  |<P>|^2 (C = 0.00902, 0.00734, 0.00660 at R = 1, 2, 3, with |<P>|^2 = 0.00728), which is
  screening, string breaking in its thermal form. Pure gauge and a mass too heavy to make a pair fall
  to zero. At the same demon temperature the matter raises the plaquette by 0.107. At the same total
  energy it lowers it by 0.044, because the bonds heat the gauge field. Three limits. The matter is a
  classical color vector with an occupation, the gauge-Higgs form, not a fermion. It condenses (0.998
  of sites filled), and no dilute regime exists at this bond scale: the density jumps from full to
  none as the mass rises. And the screening gate fails by a hair: at R = 3, half the box, the
  connected correlator overshoots below zero by 3.02 standard errors against a gate of 3.
- **That the base does this.** These are measurements of what a base with these changes would do,
  not of the committed knit, which still does none of it (`E-FRC-0093` to `0097`). The three-trit
  model is adopted, and the knit that carries it is not yet chosen (see the table above).
- **The deterministic sampler on larger boxes and at N_t = 4 geometry.** `E-FRC-0110` runs both
  actions on 4^4. The quantization at scale 12 rounds the action, so it is a nearby action, not the
  exact one, and its plaquettes sit 0.009 to 0.015 below the unquantized heatbath's.
- **That no Sigma(648) trajectory reaches finer spacings.** Two trajectories and six grid points
  were measured on small boxes. The floor is what they show, and the maximality argument is why it
  is expected, but it is not a proof over the whole (beta0, beta1) plane.
- **Wall localization is now measured, and it fails for both rules** (`E-FRC-0111` item 7). Against
  the piecewise vacuum (each half compared with the vacuum born when it was), on the D4 box at sides
  9, 13 and 17 over 72 beats, the defect spreads to an even fill of the box: spread **1.11, 1.10,
  1.00** for the triality weave and **0.96, 0.98, 1.01** for the committed knit, where 0 is a sheet and
  1 an even fill. The committed knit's defect reaches every column by beat **4, 5, 6** (ballistic),
  the triality weave's by beat **9, 15, 57**. So the dominant core `E-FND-0118` saw at side 21 was a
  transient of its window. Whether the triality wall ever recurs past 72 beats is still not measured.
- **The paid hop on the D4 lattice.** `E-FRC-0129` shows the binding mechanism on a line, where a charge
  that cannot pay stays in its dock. In the slot architecture every vibe streams, so a charge that
  cannot pay must reflect, onto the other slot of its line, and that is a hop, which `E-FRC-0124`
  shows breaks local color. The algebra says why: a calm slot's color carries the sign of its side, so
  moving a charge between slots of opposite sign cannot conserve it, while moving it between slots of
  the same sign (a full swap of the two slots' contents) can. So on the D4 lattice the paid move has
  two routes. Matter that waits in docks is built and binds (`E-FRC-0131`). A charge that cannot pay
  turning to another direction of the same sign is not built, and under the committed orientation it
  could not bind anyway, since a lone vibe's class is a half-space (`E-FRC-0130`). It needs one of the
  3,904 returning orientations, and a clock whose three-step cycle is taken only when paid, written as
  two conditional involutions so it stays reversible.

  Worked through, turning does not rescue the slot architecture on its own. Every slot streams every
  beat, so a charge that cannot pay has three alternatives to crossing, and each fails. Bouncing back
  into its own dock reverses the charge and every calm slot's color with it, which breaks local color.
  Turning into another slot of its dock collides with that slot's own arrival, which breaks the
  bijection. Waiting needs a slot that does not stream. And local color allows a charge to move between
  a waiting slot and a moving one only when the two share a sign, so it needs one waiting slot per sign
  class, two per dock. A charge that waits still leaves only along its class's directions, so it also
  needs a returning orientation to come back. **Moving binding in the committed knit's own architecture
  therefore needs two changes to the base: two waiting slots per dock, and a returning orientation of
  the lines.** `E-FRC-0131` measures what the result does once matter can wait, and it binds.

  **Run as a rule, the waiting slots fail** (`E-FRC-0132`). Two waiting slots per dock and a
  returning orientation are exact in every local law, but a charge that cannot pay cannot wait: 12 of
  the 13 places of a lone charge cross unpaid, and 1,012 of 1,024 string crossings go into debt
  (`E-FRC-0133`). A crossing that bounces when unpaid binds, but a bounce reverses the charge, so the
  bound pair is stuck (0.7 docks in 600 beats against 34). What frees it is steering a charge onto
  its string (`E-FRC-0146`, `0147`): a cold meson travels 13 bound, and 510 of 576 headings walk. That
  steering runs on a round robin of all 11 line matchings, not the committed weave, whose couples
  reach 5 of 12 lines and let 88 of 576 headings walk. Folded into the 24-beat palindrome the round
  robin is a schedule a knit could carry (`E-FRC-0152`), and on it a cold meson travels 20 bound
  (`E-FRC-0153`). Still not shown: a folded knit that passes the acceptance battery, and binding on
  it as strong as matter that waits (travel 20 against 34, baryon spread 8.1 against 2.7).
- **A quark string on the link fields at the cold branch.** Links priced with the hopping term feel
  the matter but form no string (`E-FRC-0134`, `0135`). The full three-trit link forms one on the
  melted field (`E-FRC-0145`), and one Sigma(648) element per link keeps it taut on both branches
  (`E-FRC-0151`). But on the cold field the string gates fail with the three-trit link, and with the
  full element no Creutz ratio can be read and the cold meson is frozen. In the three-trit link the
  center phase is not a variable, and the grid field and the flux meet only through matter.
- **The color turn weave on the full battery.** `E-FRC-0136` passes every gate the committed knit
  was adopted by, dressing included, at sides 7, 9 and 11. Its full-battery follow-up (`E-FRC-0148`,
  `0149`) is still running.
