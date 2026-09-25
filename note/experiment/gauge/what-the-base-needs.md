# What the Base Needs for Colour

**The committed rule carries no SU(3)** (`E-FRC-0093` to `0097`, in
[su3-from-the-rule.md](su3-from-the-rule.md)). This note asks the next question: **what is the
smallest change to the base that would carry it, and which parts of SU(3) need anything new at
all?** Twelve experiments, `E-FRC-0100` to `0111`, answer it with measurements, not arguments. No
random number enters any rule measured here. The seeded heatbaths are reference samplers, and
`E-FRC-0102` and `E-FRC-0110` show the deterministic route to the same ensembles.

## The answer in five lines

1. **Threes are built from twos.** A baryon needs no three-way vertex. Pairwise colour exchange
   binds the epsilon singlet as the unique ground state (`E-FRC-0101`).
2. **Turning colour needs a phase on the swap.** A colour-respecting permutation can only leave or
   swap (2 of 9! = 362,880 maps), and every other member of the circle
   U(phi) = P_sym + e^(i phi) P_anti entangles (`E-FRC-0100`).
3. **Gauge colour can be classical.** The Hessian group Sigma(648) inside SU(3) acts on the nine
   points of a qutrit phase space by permutations, and its elements are labelled by three tones and
   one of the 24 coin directions, because those directions form SL(2, 3) (`E-FRC-0104`).
4. **At the spacing where our hadrons live, that classical group is SU(3).** With a Re Tr U^2 term
   in the action it does not freeze, it deconfines at N_t = 4, and its Creutz ratios there match
   SU(3) at beta = 5.6925 (`E-FRC-0103`). It runs without dice (`E-FRC-0110`). Finer than that it
   stops, and the next step is one non-classical element.
5. **Selecting colour takes a four-line vertex.** A triality of the coin picks the colour plane, no
   pairwise rule can keep it and stay connected (`E-FRC-0107`), and one charge on a colour line
   traded for three across a triality orbit does both (`E-FRC-0109`, `0111`).

## The measurements

| experiment | measured | grade |
| --- | --- | --- |
| [`E-FRC-0100`](../../../test/experiment/gauge/colour-needs-amplitudes.ts) | colour-symmetric permutations: **2** for 3 x 3, **1** for 3 x 3-bar, **6** for 3 x 3 x 3, brute force agrees. The circle U(phi) keeps all **9** u(3) generators, its classical points are exactly phi = 0 and pi, entangling power up to 1/4. The rule's clock read as colour keeps **3** of 9, a colour factor beside the clock keeps **9** | L1 |
| [`E-FRC-0101`](../../../test/experiment/gauge/singlet-from-pair-exchange.ts) | open chain of three triplets, H = S_01 + S_12: unique ground state, overlap with epsilon exactly **1**, gap **1** (gap **3** with the closing bond). Meson: gap **3**. Singlets only at triality zero: qq 0, q qbar 1, qqq 1, qq qbar 0, qqqq 0, qq qbar qbar 2. Best classical overlap with the baryon 1/6 | L1 |
| [`E-FRC-0102`](../../../test/experiment/gauge/kinetic-center-automaton.ts) | the Z3 center with a streaming, exchanging demon per link, fully reversible: plaquette **0.1992** against the heatbath's **0.1992** (confined), **0.979** against **0.982** and **0.994** against **0.998** (ordered, the phase `E-FRC-0099` froze out of), **0.512** mid-gap. Demons that do not stream stall at **0.889** | L2 |
| [`E-FRC-0103`](../../../test/experiment/gauge/finite-colour-groups.ts) | see the table below | L2 |
| [`E-FRC-0104`](../../../test/experiment/gauge/classical-colour-group.ts) | classical on phase space: Delta(27) **27/27**, Sigma(108) **108/108**, Sigma(648) **648/648** through **216** affine maps (9 translations x all **24** of SL(2, 3), fibre **3** = the center), Sigma(1080) **18/1080**, its golden-ratio generator makes Wigner negativity **0.29**. The coin directions close under x o y = x q y, q = (1 - i) / sqrt 2, with **24 of 24** isomorphisms from SL(2, 3) | L1 |

### Finite colour groups against SU(3)

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

## Colour already in the coin, and what would select it

A way to have colour without adding a trit: read a direction's colour as its **shadow on an A2
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
g^-1. So choosing an order-three triality of the coin **forces** the colour plane (its fixed
directions, the long roots of the G2 that triality fixes, and G2 contains SU(3)). The same rotation
**cycles the three copies**, the shape three generations would take.

**The arrow is enough to choose one.** The previous committed knit, one 9-state table on every line
with an orientation (which end leads), keeps exactly one such pair, with no tone relabelling. The
committed turning weave keeps none (`E-FRC-0095`). Its own special directions are a coordinate split
instead: the 4 directions at rest are the roots of one coordinate plane, and the 3 massless ones do
not close a triangle.

Two limits. The committed rule conserves charge and **not momentum** (`E-FLD-0020`, and a direct
check), so the shadow of motion is not a conserved colour charge under it. And the reading needs a
rule that keeps one triality rotation, which the previous knit did and the committed weave does not.
So the concrete design question becomes: **is there a turning schedule that does everything the
turning weave was adopted for and still commutes with one triality rotation?**

**Measured: no, not in the family the turning weave came from** (`E-FRC-0107`). The weave couples
the 12 lines in pairs every beat, and was adopted for universality (one connected species graph) and
CPT (a palindrome with identity spatial parity, `E-FND-0117`).

| step | measured |
| --- | --- |
| a colour-selecting triality on lines | fixes exactly the **3** colour-plane lines, cycles the other 9 in three 3-cycles (all 32) |
| invariant couplings of all 12 lines | **0 of 10,395**. A fixed line must couple to a fixed line, and there are three. A fixed-point-free order-three control admits 27 |
| CPT and covariance together | the adopted parity and full inversion both commute with triality, so a covariant palindrome has to be invariant beat by beat |
| universality | an invariant beat never couples a colour line to one of the other nine, so the species graph cannot connect |
| what would reconcile them | an invariant block of **4** lines (one colour line with a whole triality orbit), or a CPT whose parity inverts the triality (36 such elements, none of them the identity or the inversion) |

The earlier triality search was also shut for a second reason. The adoption note records that the
triality cosets "do not act on the integer torus": triality has entries of one half, so it preserves
the D4 lattice but not a periodic box of shape L Z^4. That is a property of the box, and a box with
D4-shaped periods would admit it. `E-FRC-0107` needs no box at all, and it shows the obstruction is in
the schedule, not the box.

So colour cannot emerge from the committed rule's design family. The obstruction is the same
pairs-against-threes one as `E-FRC-0094`, one level up: **the colour plane holds three lines, and a
rule that works in pairs can never treat them symmetrically and still reach them.** A base that wanted
triality colour would need a four-line interaction block, and adopting one is a decision, not a
measurement.

## The four follow-ups, worked

### A box where triality acts (`E-FRC-0108`)

The integer torus the committed rule was searched on admits only the 384 signed permutations. A box
whose periods are L D4 instead of L Z^4 admits all 1,152 elements of W(F4), triality included
(`code/substrate/d4-box`). On it the previous knit evolves in exact step with exactly 2 order-three
elements for 24 beats from four starts, and both are the colour-selecting trialities. The committed
turning weave commutes with none.

### A rule that keeps colour and connects every line (`E-FRC-0109`)

The four-line block `E-FRC-0107` named, built (`code/rule/triality-weave`). Each beat pairs colour
line f_r with a whole triality orbit, and a four-line vertex V swaps, for s = +1 and -1:

| before | after |
| --- | --- |
| a charge s leading on the colour line, the orbit empty | two anti-charges on the colour line, a charge s leading on each orbit line |
| a charge s trailing on the colour line, the orbit empty | two anti-charges on the colour line, a charge s trailing on each orbit line |

Every swap conserves charge and treats the three orbit lines alike. It moves tones between a colour
line and its orbit only in threes, and that is forced: an orbit state the triality fixes holds a
multiple of three tones, and a line holds at most two. One beat is V S P S V, where P is the committed
pair clock and S is the committed turning weave's conditional swap written so the triality carries it
to itself (colour lines r and r + 1 as a couple, orbits r and r + 1 line by line). The block index r
runs 0 1 2 2 1 0, a palindrome of period 6.

**How it got there.** The first version fired the vertex on all three blocks every beat and added a
second swap (an empty colour line and a charge on one orbit line against two charges on the colour
line). It passed every structural gate below and then failed the dressing test of `E-FRC-0111`: one
tone grew into 40,591 changed slots, a support ratio of 726. Eight variants were measured on the same
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
any tone. So the adopted rule keeps the one move that colour needs (one charge for three), fires it
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

So colour selection by triality, universality and CPT can all hold at once. What they need is one
classical four-line vertex: a charge on a colour line turns into three identical charges, one on each
line the triality turns into the others. That is the missing "three at once", and it needs no
amplitude.

### The rest of the acceptance battery (`E-FRC-0111`)

The committed turning weave was also adopted on a second battery (`E-FND-0118`). The same physical
questions, asked of the triality weave on the D4 box in a form that does not assume a protected
species:

| test | triality weave | committed turning weave |
| --- | --- | --- |
| vacuum recurs exactly from birth | period **3** | period **24** |
| lone tones that stay at support one for a whole period | **0** of 24 directions | 8 |
| lone tones that stay compact, support never above 2 over four periods | **21** of 24 | 7 |
| colour-neutral triples (one tone on each line of an orbit) that hold together | **12** of 12 | **0** of 12 |
| two separated disturbances superpose in the clock amplitude | exact, worst **2e-15** | exact, worst 2e-12 |
| a half born late makes a wall that is a whole number of sheets | yes, up to **110,808** slots, all multiples of 729 | yes |
| wall periodic | **no**, over 72 beats | **no**, over 72 beats |
| dressing: last-period support over first-period support, worst direction | **4.6** | 13 |

Three corrections came out of this, all recorded in the experiments. A late offset of 3 beats equals
the triality weave's vacuum period and made no wall at all, so the offset is 1. A dressing gate of 2
was stricter than the committed rule meets, so the gate is comparative. And the committed rule's own
periodic-wall gate in `E-FND-0118` was a loop that never ran (`t` from 24 while `t + 24 < 48`), so it
passed with nothing compared. Run for 72 beats, that rule's wall is quantized and not periodic. The
gate now requires comparisons and the periodicity is reported.

**A correction to the first reading of this table.** "Support one at every beat" reads 0 on the
triality weave, and that was first summarised as "it has no free particle". It does. A lone tone on
21 of the 24 directions travels compactly with a periodic dressing of two slots, which that criterion
cannot see. In a probe the tones that spread were on colour lines, and an orbit-line tone stayed at
one or two slots. And the new last row is the sharpest difference between the two rules: a colour-neutral triple
holds together in the triality weave in all 12 cases and falls apart in the committed rule in all 12
(its support grows to 13 to 45 slots in 24 beats). The committed rule has more tones that stay
exactly at support one, and the triality weave has more that stay compact and the only bound triples.
The kick law of `E-FND-0118` is a statement about support-one species and is not run here.

### A deterministic sampler for the classical colour group (`E-FRC-0110`)

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

### How far the classical colour group reaches toward the continuum

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
colour, and the step between them is exactly one non-classical element. Allowing one such step per
link (Sigma(648) and Sigma(648) T Sigma(648), 5,832 link values) already holds the Wilson action on the
SU(3) curve to beta = 5, past both Sigma(648) (3.5) and Sigma(1080) (4).

## Seven other ways colour could arise, each measured

The triality weave was the first way found to keep a colour triality and connect every line. Seven
other routes were proposed and each one was tested, recorded here whether it worked or not.

### The one fact that decides most of them (`E-FRC-0112`)

A rule that can run backwards and is carried to itself by a colour triality sigma on every beat
sends a state sigma leaves alone to another state sigma leaves alone, because
f(s) = f(sigma s) = sigma f(s). In such a state the three lines of an orbit hold the same thing, so an
orbit always holds a multiple of three tones. A lone tone on a colour line with its orbit empty is
such a state. **So no single tone can ever cross from a colour line to its orbit, in any rule of this
kind, not only the pair rules of `E-FRC-0107`.** The orbit gains nothing, three identical charges, or
three identical neutral pairs: 16 possible outcomes in all, listed in the experiment.

Checked exhaustively: all 531,441 cell states sigma leaves alone stay in that set through every beat
of the triality weave, with a multiple of three tones on every orbit. The committed rule moves 525,609
of them out of the set.

### The seven

| # | the idea | measured | verdict |
| --- | --- | --- | --- |
| 1 | the baryon is the free particle | the triality weave holds all 12 colour-neutral triples together (support at most 6 forever) and the committed rule none. But lone orbit tones also travel freely, so single colour charges are not confined (`E-FRC-0111`) | **half right**: bound baryons yes, confinement no |
| 2 | the triality groups are momentum-conserving three-body vertices | none of the 6 direction groups sums to zero. Each sums to 3 times one colour weight, length sqrt 6 (`E-FRC-0112`) | **no** |
| 3 | pair lines by reading the data | covered by the fact above: choosing pairs from the data is still a reversible rule that respects sigma, so a single tone still cannot leave a colour line (`E-FRC-0112`) | **no** |
| 4 | a coin symmetry together with a tone relabelling | all 1,152 coin symmetries times 6 tone relabellings: the committed rule keeps only the identity, the triality weave only its own two trialities (`E-FRC-0113`) | **no** |
| 5 | the triality as a symmetry shifted in time | the committed rule has none at any of its 24 shifts (`E-FRC-0113`). Built as a new rule, the glide weave (`E-FRC-0114`), see below | **built, see below** |
| 6 | colour as a twist in the box | rotating the colour of half the box is invisible in the vacuum of both triality rules at all 24 moments, and a wall of up to 5,750 slots in the committed rule's at 22 of 24. On a dense background every rule sees it (4,232 to 7,488 slots), because in the coin reading a tone's colour is its direction, and rotating colour rotates motion (`E-FRC-0115`) | **a global twist only.** Geometric colour has one frame for all of space, never one per place |
| 7 | keep the triality only on the cells it fixes | those cells are a 2D sheet, side^2 of side^4 (25, 49, 81 cells on sides 5, 7, 9). But a rule that is the same everywhere and symmetric about one point is symmetric about every point, which brings back the fact above (`E-FRC-0115`) | **only by giving up a rule that is the same in every cell** |

And one guess that failed: that the colour group is what the committed pair clock generates, reading
a line's nine states as the nine points of a qutrit phase space. The pair clock is none of the 432
affine maps of that space under any of the 6 ways to label the tones (`E-FRC-0112`).

### The glide weave (`E-FRC-0114`)

GLIDE_RESULTS

### What the seven add up to

Idea 6 names the price of every geometric route. When colour is read off the coin, it is tied to
direction, and so it has one frame for the whole of space. A gauge theory of colour needs a frame
that can differ from place to place, and that needs colour carried apart from direction: the colour
trit of `E-FRC-0100`, with the Sigma(648) links of `E-FRC-0103`. A reading, not a measurement: the
two need not be rivals. The coin could select which plane is colour and cycle the three generations,
while a separate trit carries the colour that can be gauged. Nothing here tests that combination.

## What the base would change

Each item names the base thing it touches, and the experiment that says why.

| change | touches | why | cost |
| --- | --- | --- | --- |
| a colour trit beside the tone | the tone | the rule's tone is its period-three clock, and a clock kept as colour breaks SU(3) to its 3-dimensional Cartan part (`E-FRC-0100`) | one more trit per slot |
| links that hold a Sigma(648) element | the crystal | gauge colour lives on links, and this group is a record of three tones and a coin direction (`E-FRC-0104`), classical | 648 states per link |
| a kinetic counter per link that streams | the rule | without it a deterministic link rule freezes (`E-FRC-0099`), with it the Z3 center has its whole phase diagram (`E-FRC-0102`) | one bounded counter per link |
| one phase on the pair swap | the rule | the only colour-respecting move beyond leave-or-swap (`E-FRC-0100`), and what turns a quark's colour | an amplitude, the same missing piece as `E-FND-0080` |
| a four-line vertex | the rule | the only way to keep a colour-selecting triality and still connect every line (`E-FRC-0107`), built and measured (`E-FRC-0109`) | one classical exchange, a charge on a colour line for three on the triality orbit |
| one non-Clifford element | the rule | not needed down to about the N_t = 4 spacing (`E-FRC-0103`). Finer than that the classical group stops shrinking, and the next step up from a maximal finite subgroup is already dense in SU(3) | Wigner negativity, the qutrit form of magic, the same ingredient as the swap phase |

The gauge side of colour, confinement and deconfinement, needs no amplitudes at the spacing
measured. The matter side, a quark whose colour turns, needs the phase on the swap. That phase is
the same ingredient the quantum sector is missing, so colour does not add a second requirement.

## What this does not show

- **The continuum limit.** One spacing, small boxes. The N_t = 6 and N_t = 8 transitions of
  Sigma(648) on some unfrozen trajectory are the next measurement.
- **Dynamical quarks with a finite colour group.** Everything in `E-FRC-0103` is pure gauge.
- **That the base does this.** These are measurements of what a base with these changes would do,
  not of the committed rule, which still does none of it (`E-FRC-0093` to `0097`).
- **The deterministic sampler on larger boxes and at N_t = 4 geometry.** `E-FRC-0110` runs both
  actions on 4^4. The quantization at scale 12 rounds the action, so it is a nearby action, not the
  exact one, and its plaquettes sit 0.009 to 0.015 below the unquantized heatbath's.
- **That no Sigma(648) trajectory reaches finer spacings.** Two trajectories and six grid points
  were measured on small boxes. The floor is what they show, and the maximality argument is why it
  is expected, but it is not a proof over the whole (beta0, beta1) plane.
- **Wall localization for the triality weave**, the one window-limited claim of `E-FND-0118`, is not
  measured. Neither is whether its wall, unlike its vacuum, ever recurs past 72 beats.
