# What the Base Needs for Colour

**The committed rule carries no SU(3)** (`E-FRC-0093` to `0097`, in
[su3-from-the-rule.md](su3-from-the-rule.md)). This note asks the next question: **what is the
smallest change to the base that would carry it, and which parts of SU(3) need anything new at
all?** Five experiments, `E-FRC-0100` to `0104`, answer it with measurements, not arguments. No
random number enters any rule measured here. The seeded heatbaths are reference samplers, and
`E-FRC-0102` shows the deterministic route to the same ensembles.

## The answer in four lines

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
   SU(3) at beta = 5.6925 (`E-FRC-0103`).

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
steeper trajectory may reach further, and whether any trajectory reaches the continuum is the open
question that decides whether the base needs the golden-ratio element at all.

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

## What the base would change

Each item names the base thing it touches, and the experiment that says why.

| change | touches | why | cost |
| --- | --- | --- | --- |
| a colour trit beside the tone | the tone | the rule's tone is its period-three clock, and a clock kept as colour breaks SU(3) to its 3-dimensional Cartan part (`E-FRC-0100`) | one more trit per slot |
| links that hold a Sigma(648) element | the crystal | gauge colour lives on links, and this group is a record of three tones and a coin direction (`E-FRC-0104`), classical | 648 states per link |
| a kinetic counter per link that streams | the rule | without it a deterministic link rule freezes (`E-FRC-0099`), with it the Z3 center has its whole phase diagram (`E-FRC-0102`) | one bounded counter per link |
| one phase on the pair swap | the rule | the only colour-respecting move beyond leave-or-swap (`E-FRC-0100`), and what turns a quark's colour | an amplitude, the same missing piece as `E-FND-0080` |
| possibly one golden-ratio element | the rule | needed only if the classical group cannot reach the continuum, not needed at the N_t = 4 spacing (`E-FRC-0103`) | Wigner negativity, the qutrit form of magic |

The gauge side of colour, confinement and deconfinement, needs no amplitudes at the spacing
measured. The matter side, a quark whose colour turns, needs the phase on the swap. That phase is
the same ingredient the quantum sector is missing, so colour does not add a second requirement.

## What this does not show

- **The continuum limit.** One spacing, small boxes. The N_t = 6 and N_t = 8 transitions of
  Sigma(648) on some unfrozen trajectory are the next measurement.
- **Dynamical quarks with a finite colour group.** Everything in `E-FRC-0103` is pure gauge.
- **That the base does this.** These are measurements of what a base with these changes would do,
  not of the committed rule, which still does none of it (`E-FRC-0093` to `0097`).
- **A deterministic sampler for Sigma(648).** `E-FRC-0102` does it for Z3. For a 648-element group
  the demon has to hold real-valued energies, and exact reversibility then needs exact arithmetic on
  the traces, which is not built.
