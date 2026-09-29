<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<p align='center'>
  <a href="https://www.youtube.com/watch?v=IE2uHC0qX1o"><img src='https://github.com/cluesurf/vibe/blob/make/view/vibe-mesh-{7,3}.png?raw=true' height='256'/></a>
</p>

<h3 align='center'>Vibe Theory</h3>
<p align='center'>
  A discrete possible universe Ω
</p>

<br/>
<br/>
<br/>

## The goal

**Find the discrete base of the universe.** The working answer is a 4d
hyperbolic mesh, the honeycomb **$\lbrace3,4,3,4\rbrace$**, whose every
site holds 24 ternary values, updated by one deterministic, reversible,
integer rule. Space and its dimension, time's arrow, relativity, spin,
light, the quantum, gravity and selves each have to come out of that
base, or the base is wrong. This repository tests that one measurable
claim at a time, and keeps every result that said no.

The program draws on Maurice Margenstern's work on cellular automata in
hyperbolic spaces: the $\lbrace7,3\rbrace$ heptagrid and the
$\lbrace5,3,4\rbrace$ dodecagrid, Fibonacci-tree addressing and
navigation, and the proofs that these grids host universal computation.
The substrate survey and the computation experiments are measured
against those results.

## The companion pieces

- [Short high-level audio overview of things](https://www.youtube.com/watch?v=9ftVzOO9Y2I)
- [Vibe (Book)](https://www.amazon.com/dp/1951702743)
- [Vibe Theory: A Discrete Hyperbolic Substrate for the Emerging Conscious Universe](https://doi.org/10.5281/zenodo.20694262)

## The model, term by term

Each term is defined before it is used, with the reason it is this and
not something else.

| term | what it is | why |
| :--- | :--- | :--- |
| **tone** | one trit: +1, 0 or −1. The whole state is tones | three is the smallest alphabet with an empty value and a sign flip (charge conjugation) ([`E-FND-0038`](test/experiment/foundations/ternary-and-4d-forced.ts)) |
| **vibe** | a slot holding +1 (a **love**) or −1 (a **fear**). A slot holding 0 is **calm** | the two signs are particle and antiparticle. **Charge** is love minus fear, **content** is love plus fear |
| **dock** | one site of space: 24 **slots**, one per root of the D4 root system, which are the 24 vertices of a 24-cell. Opposite slots pair into 12 **lines** | D4 is the one 4d root system with triality ([`E-FND-0038`](test/experiment/foundations/ternary-and-4d-forced.ts)), and its 24 directions carry the spinor double cover, so a 2π turn gives −1 ([`E-SPN-0042`](test/experiment/spin/spinor-double-cover.ts)) |
| **mesh** | the space of docks. In the model it is the $\lbrace3,4,3,4\rbrace$ honeycomb: 24-cells whose vertex figure is the flat cubic honeycomb $\lbrace4,3,4\rbrace$. In the experiments it is a flat periodic D4 box of side 8, 16 or 24, a disclosed stand-in | the box has the same 24 directions per dock and is finite and exact. The honeycomb unfolds from one 24-cell in shells of 1, 24, 456, 8,376 and 153,192 docks, a ratio settling at 18.278 ([`E-GMT-0027`](test/experiment/geometry/mesh-unfolds-exactly.ts)) |
| **beat** | one tick of time. Every dock applies the rule at once | the rule is synchronous and deterministic, so a run is reproducible bit for bit |
| **take** | how anything gets anywhere: each beat a slot takes its neighbor's value along its direction (the **stream**). Nothing moves | a value is read and written, never carried, so the stream is a permutation and runs backward exactly |
| **husk** | the 3d surface on which physics is read: the depth-even half of the 4d box, exactly closed ([`E-FRC-0168`](test/experiment/gauge/photon-husk.ts)). In the honeycomb it is the flat horosphere at a cusp | the vertex figure $\lbrace4,3,4\rbrace$ is flat 3d, so the mesh has flat 3d surfaces at infinity, and a spectral dimension near 3 is read there ([`E-GMT-0025`](test/experiment/geometry/why-3plus1.ts)) |
| **bulk**, **depth** | the 4d mesh behind the husk. A **husk column** is the stack of bulk docks behind one husk dock, and its size D is its **depth** | every husk field is a column sum of bulk trits, so the depth sets how finely the husk counts ([`E-FRC-0207`](test/experiment/gauge/trit-column-light.ts)) |
| **role**, **link** | each vibe carries a point on a 3 by 3 grid (its role, a qutrit). A **link** between two docks holds a grid move, one of the 648 elements of the qutrit Clifford group Σ(648) | the links are exactly that group ([`E-QTM-0117`](test/experiment/quantum/links-are-the-clifford-group.ts)). A link stores no matter: it is the relation between the vibes on it |
| **store** | a dock line's held love and fear pair, made from an empty line and released back to it | this is how the vacuum makes and unmakes pairs while its charge stays 0 |
| **amplitude** | the state is a finite sum of classical configurations, each weighted by an exact number in $\mathbb{Z}[\omega][1/2]$, $\omega = e^{2\pi i/3}$ | every three in the model (charge in thirds, the knot $1 + \omega + \omega^2 = 0$) lives in this one ring, and it needs no rounding |
| **path** | one measurement record of the quantum rule: at every split one branch, chosen by a deterministic key | a path is what one observer would record. A path can scramble while the sum it samples stays linear, so fields are read as averages over paths |

## The rule, as it stands

Each beat applies the coin, then the meetings, then the collision, then
the stream. Every piece is an exact, reversible map in
$\mathbb{Z}[\omega][1/2]$, with no float, no rounding and no random
number, and runs backward piece by piece.

| piece | what it does | why this one | code |
| :--- | :--- | :--- | :--- |
| the knit | the pieces below, keeping W(F4), the full symmetry of the dock (1,152 elements) | a knit that keeps all of W(F4) exists and keeps CPT, so no direction of the dock is preferred | [`E-RLT-0061`](test/experiment/relativity/isometric-knit.ts) |
| the collision | a dock's full lines turn as −1 and a lone vibe goes straight through | a lone vibe's wake stays on its own line, the free particle's straight path | [`E-RLT-0084`](test/experiment/relativity/lone-bounce-collision.ts) |
| the doublet lock | a vibe's take direction along its line is its role's spin doublet | the only way a vibe can move with amplitudes and stay covariant (a theorem), and what makes every charge-one state a spinor | [`E-RLT-0097`](test/experiment/relativity/doublet-locked-knit.ts), [`E-SPN-0071`](test/experiment/spin/locked-spin-statistics.ts) |
| the meeting | a love and a fear on one line pass unchanged. Two like vibes keep their points (weight 1/4) or exchange them (3/4), leaving a **knot** with CHSH √7 | the love and fear case is the identity by the conjugation convention, which is helicity suppression | [`E-RLT-0099`](test/experiment/relativity/doublet-locked-quantum.ts) |
| the contact | two like vibes on a full line keep their slots (the **pass**, phase +1) instead of bouncing (−1) | of the six phases the ring allows, only the bounce and the pass add no new number, and only the pass binds the electron | [`E-SPN-0092`](test/experiment/spin/contact-rule-theorem.ts), [`E-SPN-0093`](test/experiment/spin/passing-contact-cluster.ts) |
| the store | pairs made and released with no veto, each stored pair holding two points | the only vacuum measured that holds under the pass | [`E-RLT-0102`](test/experiment/relativity/no-veto-store-build.ts), [`E-RLT-0103`](test/experiment/relativity/no-veto-store-vacuum.ts) |
| the coin | on a line holding one open vibe (a vibe that carries amplitude), $2C = (1 + \omega) I + (1 - \omega) X$ on its two slots | it gives a lone vibe a mass (gap 2π/3, top speed 1/2 a beat). Its cost is exact lattice momentum, the one symmetry that forbids a mass | [`E-SPN-0090`](test/experiment/spin/covariant-coin-theorem.ts), [`E-SPN-0091`](test/experiment/spin/coined-knit-electron.ts) |

**The light** runs beside the knit on the links: every husk angle, flux
and counter is a column sum of bulk trits, with coupling
$\kappa = 2/(2D + 1)$ ([`E-FRC-0207`](test/experiment/gauge/trit-column-light.ts)).
A bounded, reversible column of $2D + 1$ values is a circle, so the
light is compact U(1) exactly
([`E-FRC-0244`](test/experiment/gauge/photon-seam-law.ts),
[`E-FRC-0245`](test/experiment/gauge/photon-circle-light.ts)).

**Where the quantum comes from.** Without the meeting (the fear beat)
the knit is Clifford and can be simulated classically. The meeting is
the one gate outside the Clifford group
([`E-QTM-0118`](test/experiment/quantum/fear-beat-is-magic.ts)). Under
the lock, motion adds a second source: no locked direction is a
stabilizer state, so a moving vibe carries a fixed fear share of 0.164
([`E-RLT-0099`](test/experiment/relativity/doublet-locked-quantum.ts)).
A static vibe is classical and a moving one is quantum (chosen
2026-09-26).

**The working vacuum** (chosen 2026-09-26) is the no-veto store under
the pass, with the coin on, and one C domain with no walls. Frozen
domain walls were dropped because in cosmology they are a liability,
not a fact to reproduce. On 51 of 51 gated cases
([`E-RLT-0105`](test/experiment/relativity/coined-store-vacuum.ts)):

- the vacuum keeps its conservation laws, because no vacuum vibe is ever
  alone on its line, so the coin acts on it 0 times on every path
- the run reverses exactly, charge conjugation (C) holds, and every husk
  dock is one causal world
- pairs made equal pairs unmade, 466,944 each, on a cycle of 12 beats
  ([`E-GRV-0072`](test/experiment/gravity/shared-history-distance.ts))
- a lone vibe's wake stays on its line, at most 16 trits a period
- a lone love spreads over 105 to 124 occupations by beat 16 on 17 of
  17 starts, and its positions interfere: against a twin run with its
  phases dropped each beat, the occupation distance reads 0.69 to 0.71
  by beat 6 in the vacuum (0.60 on the husk columns), and exactly 0
  with the coin off
  ([`E-QTM-0157`](test/experiment/quantum/position-interference.ts)).
  The earlier reading that the kept branch does not interfere used a
  configuration only one history reaches, so it could not see
  interference

**The rule has changed often, and old results stay tied to their
rule.** Earlier committed rules include `pairCollision`, `lineWeave`,
the turning weave (`turningWeave`, adopted 2026-09-02), the fear weave
and the combined knit
([`E-FRC-0159`](test/experiment/gauge/combined-knit-battery.ts)). Most
pieces above were chosen on 2026-09-26. Every experiment states the
rule it ran on, and many held results ran on an earlier rule and have
not been rerun on this one.

## Where it stands

The working ledger (kept beside this repository, not in it) lists 191
facts the model must produce, from the Born rule to the specious
present, each graded under one set of rules: read on the 3d husk, the
rule integer and reversible, a stand-in labeled and never graded as a
derivation, a numerical match counted only through a pre-registered
null ([`E-MTH-0010`](test/experiment/method/closed-forms-under-a-null.ts)),
and the verdict judged over 17 link starts
([`E-MTH-0028`](test/experiment/method/multi-start-robustness.ts)).

| status | meaning | facts |
| :--- | :--- | ---: |
| held | measured on the rule itself, with a control, over the start family | 38 |
| partial | measured, but on a stand-in, one sector, one start, or with a gate failing | 67 |
| stand-in | only a textbook calculation or a hand-built object the rule has not produced | 45 |
| open | worked on and not reached | 24 |
| none | not started | 17 |

By area, as of 2026-09-29:

| area | held | partial | stand-in | open | none |
| :--- | ---: | ---: | ---: | ---: | ---: |
| quantum foundations | 13 | 11 | 3 | 5 | 1 |
| special relativity | 3 | 7 | 0 | 0 | 0 |
| spin and statistics | 4 | 4 | 0 | 0 | 3 |
| light and charge | 6 | 11 | 0 | 1 | 1 |
| atoms and chemistry | 0 | 3 | 7 | 0 | 1 |
| the strong force and nuclei | 0 | 3 | 3 | 2 | 1 |
| the weak force and the Standard Model | 0 | 3 | 6 | 2 | 1 |
| gravity and spacetime | 1 | 0 | 11 | 1 | 0 |
| cosmology | 0 | 4 | 5 | 4 | 3 |
| heat, statistics and time | 3 | 3 | 1 | 0 | 0 |
| matter in bulk and fluids | 1 | 0 | 1 | 2 | 2 |
| the vacuum and walls | 4 | 0 | 0 | 0 | 0 |
| the classical world | 1 | 0 | 2 | 1 | 0 |
| information and computation | 0 | 2 | 2 | 0 | 0 |
| the numbers nature fixes | 1 | 1 | 4 | 2 | 1 |
| experience, selves and consciousness | 1 | 12 | 0 | 2 | 3 |
| the whole, consistent | 0 | 3 | 0 | 2 | 0 |

The rows that moved on 2026-09-28 and 29: positions in superposition
and fluctuation-dissipation to held, and 16 rows from none or open to
partial, among them one light speed, parity violation, the path
integral, length contraction, Compton scattering, the horizon and
flatness problems, Landauer's principle and error correction. The
remaining 17 none rows are mostly ones that wait on bound matter
moving across lines (fine structure, spin-orbit, crystals, magnetism,
fission, beta decay).

The gravity rows count the depth register below as a stand-in, since it
is a part added to the rule rather than one the rule produces.

## What holds on the current rule

| fact | measured | code |
| :--- | :--- | :--- |
| Bell violation | CHSH above 2 on exact algebraic values, never 2 on 17 of 17 starts | [`E-QTM-0140`](test/experiment/quantum/bell-values-exact.ts) |
| Tsirelson's bound | the exact largest CHSH of a knot in closed form, and 2√2 reached by a finite history | [`E-QTM-0132`](test/experiment/quantum/tsirelson-closed-form.ts), [`E-QTM-0133`](test/experiment/quantum/tsirelson-reached-exactly.ts) |
| contextuality is the fear | a knot is contextual for the model's own readings exactly when it holds a fear, with total deficit $18(e^{\text{mana}} - 1)$ | [`E-QTM-0149`](test/experiment/quantum/stabilizer-contextuality-is-fear.ts), [`E-QTM-0150`](test/experiment/quantum/state-independent-contextuality.ts) |
| no-cloning, teleportation, GHZ | no beat duplicates an unknown signed state, a love and fear pair met once teleports and swaps exactly on 17 of 17 starts | [`E-QTM-0151`](test/experiment/quantum/no-cloning-on-the-knit.ts), [`E-QTM-0152`](test/experiment/quantum/teleportation-and-swapping.ts), [`E-QTM-0153`](test/experiment/quantum/ghz-mermin-and-monogamy.ts) |
| spin statistics | a full turn is $(-1)^N$ with N the doublet count, so turn sign equals exchange sign | [`E-SPN-0071`](test/experiment/spin/locked-spin-statistics.ts) |
| Pauli exclusion | one vibe per slot, in the base and in the dynamics | [`E-SPN-0045`](test/experiment/spin/exchange-fear-and-slot-exclusion.ts), [`E-SPN-0047`](test/experiment/spin/exclusion-in-the-dynamics.ts) |
| Coulomb's law | a charge's potential is $1/(24\pi r)$ with no $1/r^3$ term, the quartic isotropic by an integer identity | [`E-FRC-0241`](test/experiment/gauge/husk-coulomb-green.ts) |
| charge in whole units | counted locally on every beat, pair creation included | [`E-FRC-0243`](test/experiment/gauge/charge-count-every-beat.ts) |
| two polarizations of light | exactly two per momentum on the husk, the bulk's third killed by the projection | [`E-FRC-0179`](test/experiment/gauge/photon-symbol.ts) |
| isotropic transport | charge, trace, sound and shear equal in every direction, because the medium is blind to store signs | [`E-RLT-0094`](test/experiment/relativity/covering-vacuum-isotropy.ts), [`E-RLT-0096`](test/experiment/relativity/charge-blind-shear.ts) |
| the second law and the arrow | coarse entropy rises a thousandfold forward and under the exact inverse alike, fine-grained entropy exactly constant, 17 starts | [`E-FND-0146`](test/experiment/foundations/husk-second-law.ts), [`E-FND-0147`](test/experiment/foundations/husk-arrow-records.ts) |
| one causal world | every husk dock descends from the seed by beat 10, 17 of 17 starts | [`E-RLT-0093`](test/experiment/relativity/coset-union-vacuum.ts) |
| the working vacuum | balanced, bounded, reversible, covariant, 51 of 51 cases | [`E-RLT-0105`](test/experiment/relativity/coined-store-vacuum.ts) |
| positions in superposition | a lone love's positions interfere, 17 of 17 starts, the coin-off control exactly 0 | [`E-QTM-0157`](test/experiment/quantum/position-interference.ts) |
| fluctuation-dissipation | a husk block's energy variance equals −dE/dβ on 17 of 17 starts (mean 1.001), an excess relaxes along the equilibrium autocorrelation, one bath at β ≈ 3.9, the non-Gibbs control off by 159 | [`E-FND-0156`](test/experiment/foundations/husk-fluctuation-dissipation.ts) |

**Partial, and the step each needs.** The electron binds on one husk
line as three loves under the pass (binding 1.079, spin one half share
0.982, travelling at 0.030 a beat,
[`E-SPN-0093`](test/experiment/spin/passing-contact-cluster.ts)), but
not yet across lines, and g is unread. Matter reads the light as an exact
Peierls phase, likes pushed apart at 0.96 to 1.17 of the static Coulomb
prediction, on one line with no back-action
([`E-FRC-0252`](test/experiment/gauge/peierls-test-charge.ts)). An atom's
first lifetime decays at 0.975 to 1.000 of the golden rule, on a
stand-in atom ([`E-FRC-0240`](test/experiment/gauge/polaron-golden-rule.ts)).

## This week: the vacuum is a bundle of lines

Work of 2026-09-26 and 27, after the working vacuum was chosen. It
started from four blocked problems (the electron off its line, a
bounded self, gravity's reach, and measurement) that all waited on a
vibe leaving its line, and ended with one reading of all four.

- **The line law** ([`E-SPN-0098`](test/experiment/spin/line-law.ts),
  pass). With no mixer, the tone on every straight mesh line is
  conserved: 6,144 of 6,144 lines on side 8 over 48 beats. Every piece
  of the rule acts inside one line, so the knit is 6,144 1d worlds that
  never touch, in the vacuum's orbit. The mixer G below breaks all
  6,144. A mixer of stores breaks 41,699 of 49,152, every break made by
  the collision's bounce piece once a moved pair creates a dock where it
  acts across lines.
- **Line locality is momentum conservation.** A lone vibe's momentum is
  its root, so it cannot change line without changing momentum. That is
  Newton's first law, not a defect. The lifted mixer changes a dock's
  momentum on 407,664 of 415,856 hops
  ([`E-SPN-0096`](test/experiment/spin/frame-lift-theorem.ts)), while
  the collision K (two lone vibes meeting in a dock, its lines turned by
  the dock's momentum) keeps it by construction and stays quiet.
- **Every mixer cascades** ([`E-SPN-0094`](test/experiment/spin/line-mixing-theorem.ts)
  to [`E-SPN-0099`](test/experiment/spin/mixer-cascade.ts)). Exactly
  one covariant, real, reversible way off a line exists in the rule's
  ring: G, Grover's step on a frame of four orthogonal lines (keep 3/4,
  hand −1/4 to each other slot). Added to the working vacuum, a lone
  vibe leaves its line (0.37 off by beat 4) and its wake grows to 39,720
  trits a period against 15 without it, and the one-line electron comes
  apart (return probability 0.454 after one beat,
  [`E-SPN-0095`](test/experiment/spin/frame-mixed-vacuum.ts)). No mixer
  in the ring fixes the vacuum and still mixes, a theorem about the
  ring ([`E-SPN-0096`](test/experiment/spin/frame-lift-theorem.ts)).
  The lifted mixer cascades faster, 0.618 a beat against 0.155
  ([`E-SPN-0097`](test/experiment/spin/lifted-mixer-vacuum.ts)). Every
  move rate from 7/64 to 42/64 scrambles the box, growth 1.276 to 1.473
  a beat, so the prediction that the ω mixer (21/64) sits at a critical
  point failed: it reads 1.382, not 1
  ([`E-SPN-0099`](test/experiment/spin/mixer-cascade.ts)). The relay is
  the vacuum: a moved vibe breaks a vacuum pair, which leaves a lone
  vibe, which the mixer moves again. The rule's own gates on pair making
  scramble a lone vibe too, where the working vacuum holds its wake at
  27 ([`E-RLT-0106`](test/experiment/relativity/veto-scatter.ts)).
- **The path-key flaw, and its fix**
  ([`E-MTH-0029`](test/experiment/method/full-period-key.ts), pass).
  The registered key read the beat as t times the dock count, which is
  0 mod 2^16 on side 16, so on that box every beat made the same choice
  at each dock, and on sides 8 and 24 the choice repeated every 4 beats.
  Every exchange-path reading was a special, periodic record. The named
  full-period key takes 64 values in 64 beats on every line. Rerun on
  it, the findings hold and are slightly stronger: 16 pairs scramble on
  side 16 (576,000 trits) where the old key's run was only turning
  (17,544).
- **The fracton rungs** ([`E-SPN-0100`](test/experiment/spin/fracton-hierarchy.ts),
  fail on F1 and F5). On the full-period key a lone love stays on its
  line but runs 8 dock steps, half the box. The immobile rung was the
  frozen key's. Two lone vibes that meet reach other lines quietly on
  434 and 436 of 528 seeds (largest wake 62), and a 12-line cluster
  stays bounded for 128 beats.
- **The reach across lines was the vacuum's**
  ([`E-SPN-0101`](test/experiment/spin/partial-contact.ts), pass). A
  contact that never turns a vacuum line keeps the vacuum, is quiet at
  every density (about 18 trits a pair), and reaches 0 lines. So under
  the pass the 10 lines a pair reaches are vacuum lines it disturbed.
  Sparse disturbances heal and overlapping ones break the vacuum.
- **Density scrambles, and the threshold falls with the box**
  ([`E-GRV-0085`](test/experiment/gravity/cluster-density.ts), pass).
  Two quiet clusters interact with no fall with distance (far over near
  0.98 and 0.86, where 1/r would give 0.46), and 16 pairs scramble side
  16 while 40 scramble side 24. A threshold that falls with box size
  has no infinite-volume limit.
- **The averaged response has no 1/r**
  ([`E-GRV-0086`](test/experiment/gravity/vacuum-response-average.ts),
  pass). Averaged over 24 distinct full-key records, one sparse pair
  leaves a core of range half a dock and a tail nearer $1/r^2$ than
  $1/r$: vibes streaming out along lines, not a static field.
- **The entanglement runs along lines**
  ([`E-GRV-0083`](test/experiment/gravity/knot-area-law.ts),
  [`E-GRV-0084`](test/experiment/gravity/knot-first-law.ts), both
  fail). Held exactly, the vacuum's knot entanglement is an area law
  only at its first meeting, with η = 8.435, 12.65, 16.87 nats a husk
  plaquette on sides 8, 12, 16, growing with depth. At equilibrium it
  is a volume law (1,770 to 5,472 nats for equal-area slabs of width 1
  to 4). A lump lowers the entanglement near it with no first law.
  Jacobson's route to Newton's constant needs the area law, so it fails
  here.
- **Stores cannot join lines, as a class**
  ([`E-RLT-0107`](test/experiment/relativity/plaquette-store-vacuum.ts),
  [`E-GRV-0087`](test/experiment/gravity/plaquette-knot-area-law.ts)).
  Storing two lines of a frame as one unit gives a sound rule whose
  vacuum is the line vacuum relabeled. A store piece that is an
  involution must return every vibe to the slot it took it from, so no
  store of any kind moves a vibe onto another line.

**One property behind all of it: the vacuum is correlated without limit
along each line and not at all across lines.** A 3d vacuum has to be
correlated the same way in every direction. So no 1/r response, no area
law and no quiet reach across lines are one fact. Three ways to fix it
are closed: a mixer (it breaks momentum), a cost on releasing a pair
through the rule's own vetoes (they scramble), and a new store (an
involution returns every vibe to its line). A released pair that costs
energy through a new energy ledger is untested.

## Gravity

**What a gravity must do**, each a measured fact about the world:

| requirement | why it is required | what it forces on a field |
| :--- | :--- | :--- |
| falls as 1/r | Newton's law holds from millimeters to galaxies | the field is massless |
| only attracts | no two masses repel | the field has even spin, 0 or 2. Odd spin (light) repels like sources |
| the same on everything | a feather and a hammer fall alike to 1 part in 10^15 | the source is blind to charge and kind |
| changes arrive at c | gravitational waves arrived 1.7 s after the light of GW170817, across 130 million light years | the field is retarded |
| bends light by 2 | 1.75 arcseconds at the Sun's limb, twice the falling-particle count | clock and space stretch in equal measure (spin 0 alone gives 0 or 1) |
| positive energy | the world does not run away | attraction lives in the static part, waves carry positive energy |

**Closed routes.** Everything read off the rule and its light failed:
entropic pull, time dilation near a held knot, occupancy-gated takes, a
neutral lump in the depth, growth, shared information and shared
history ([`E-GRV-0056`](test/experiment/gravity/knot-entropic-drift.ts)
to [`E-GRV-0073`](test/experiment/gravity/shared-history-curvature.ts)),
the light's second-order residue, which is van der Waals at $r^{-6.5}$
([`E-FRC-0253`](test/experiment/gauge/induced-neutral-residue.ts)), and
the vacuum's response and entanglement (this week, above). A second
light sourced by content is charge-blind with the right $1/(24\pi r)$
shape, but like sources repel, as spin 1 must
([`E-GRV-0074`](test/experiment/gravity/even-field.ts)). Counting its
static energy negative gives Newton to 0.37% but a pull that acts at
once ([`E-GRV-0076`](test/experiment/gravity/even-sign.ts) to
[`E-GRV-0078`](test/experiment/gravity/even-fall-carried.ts)).

**The route that works: the husk's depth.** A husk column's depth, as a
spin-0 wave sourced by content (the **radion**), attracts as 1/r with
no chosen sign, is causal, falls alike and bends light toward mass
([`E-GRV-0079`](test/experiment/gravity/radion-static.ts),
[`E-GRV-0080`](test/experiment/gravity/radion-causal.ts)). Why depth:
a deeper column holds more docks, so the same count slows a clock and
lengthens a span, which is the arena changing rather than a force on a
charge, and that is what makes it the same on everything. What was
built since, in order:

| step | result | codes |
| :--- | :--- | :--- |
| depth as a register | light bends by Newton's 1, not 2, for every coupling, because depth entered only the light's inertia (its clock), not its span | [`E-GRV-0088`](test/experiment/gravity/depth-arena-prediction.ts), [`E-GRV-0089`](test/experiment/gravity/depth-arena-light.ts) |
| depth found, not stored | one trit a link (step up, level, step down). Steps out minus steps in equals content at every dock, so a lump's lines thin as $1/r^2$ and the summed depth falls as $1/r$ by geometry. No depth register exists. Gauss exact on 43,008 checks, the summed depth equal to the radion to 5.6e-17, k = 0.0418217 | [`E-GRV-0090`](test/experiment/gravity/step-depth-static.ts) pass, [`E-GRV-0091`](test/experiment/gravity/step-depth-moving.ts) fail |
| depth sets span as well as clock | a link divides by the depth count of the columns it joins ($q = 2D + 1$), so light's index is q, matter's clock slows as $q^{-1/2}$ and space stretches as $q^{1/2}$: factor 1.999 and 1.995 read from the exponents, and 2.258 through a lens against the general-relativity control's 2.338 and the clock-only control's 1.091 | [`E-GRV-0092`](test/experiment/gravity/depth-span-rule.ts), [`E-GRV-0093`](test/experiment/gravity/depth-span-lens.ts) |
| α was not constant | read in local units, $\alpha = \sqrt3/(48D)$, coupling to the potential with slope 2.10, where atomic clocks allow about 1e-6. The prediction that local units would cancel it failed, because ħ in the light's units is $D/\pi$ | [`E-FRC-0256`](test/experiment/gauge/local-alpha.ts) fail |
| α held flat | fix the gauge field's resolution at one depth $D_0$ everywhere and let only the metric divisors read gravity, as general relativity's minimal coupling does. α flat to 2.8e-8 (slope 7e-9), light still bends by 2.258, and gauge covariance now survives 2,120 window crossings where the unfixed light broke on every beat | [`E-FRC-0257`](test/experiment/gauge/fixed-resolution-alpha.ts), [`E-GRV-0099`](test/experiment/gravity/fixed-resolution-lens.ts) |
| universal fall | two span lumps fall alike to 0.9% at one point and 6.1% at the mirror, against a 3% gate. The cause is the mesh: the integer depth staircase reflects slow heavy lumps, and a lump smaller than a dock falls by its own lattice ray, which differs by mass. Real matter is far larger than a dock | [`E-GRV-0096`](test/experiment/gravity/span-fall.ts) fail |
| a growing bulk | lines and radiation drain into a bulk with 8 times the docks per layer, but the pull becomes a Yukawa (cut off exponentially) of range 1.03 docks, because a growing bulk is a leak to ground | [`E-GRV-0094`](test/experiment/gravity/open-husk-static.ts), [`E-GRV-0095`](test/experiment/gravity/open-husk-moving.ts) fail |
| a shrinking bulk | the $\lbrace3,4,3,4\rbrace$ seen from its husk shrinks inward, as in Randall and Sundrum. 1/r survives at 0.549 of the husk alone's strength (the zero mode's share is 16/31 = 0.516), with a positive short-range correction of 0.34, 0.15, 0.083 at r = 4, 8, 12, with no free number but not Randall and Sundrum's shape (log slope 1.16 against 1.87) | [`E-GRV-0100`](test/experiment/gravity/shrink-husk-static.ts) partial, [`E-GRV-0101`](test/experiment/gravity/shrink-husk-moving.ts) fail |
| the bulk's clock warped | a layer beats once every $2^\ell$ husk beats. Exact, bounded, same static pull (to 5.0e-5), because a static field has no rate. Randall and Sundrum's shape needs the lapse (the clock-rate factor) inside the link weights as well | [`E-GRV-0102`](test/experiment/gravity/warp-husk-static.ts), [`E-GRV-0103`](test/experiment/gravity/warp-husk-moving.ts) fail |
| the lapse in the link weights | layer-$\ell$ links store their step $2^\ell$ times finer, so no new register. Exact (force equal to the linear solve to 7.1e-5). 1/r kept at 0.726 of the husk alone's k against 0.751 predicted: the smooth-layer model runs 3% above the lattice on every stack, more than the correction, so the correction's shape is not readable on this box | [`E-GRV-0105`](test/experiment/gravity/lapse-husk-static.ts) fail |

**The pull travels at light's speed.**
[`E-GRV-0101`](test/experiment/gravity/shrink-husk-moving.ts) first read
the front at 1.26 c and 1.40 c, which GW170817 would rule out, and
[`E-GRV-0103`](test/experiment/gravity/warp-husk-moving.ts) found the
husk alone reads the same by that method: a near-field bias of the
reading. A calibrated witness
([`E-GRV-0104`](test/experiment/gravity/rod-front.ts)) sends a rod of 8
content units one dock, so one front leaves behind it, and times the
arrival at one third of the static height, the point the husk's
dispersion leaves exactly at t = d/c. It reads the husk alone at
1.0023 c, the warped stack at 0.9798 c (never above light), the lapse
stack at 1.003 c, and the unwarped stack at 1.126 c, so it does catch a
faster bulk where there is one.

**What this is, stated plainly.** A pull that attracts as 1/r with no
chosen sign, travels at the speed of light, is the same on everything larger
than a dock, bends light by 2 and keeps α constant, held in bounded
registers with the depth found by summing. It is graded L2: the step
field is an added part of the rule, and the factor 2 follows from the
span change by construction, which the runs show the integer rule
realizes.

**Settled in the last rounds:**

1. **a horizon at 2GM.** Where the clock register runs out of room,
   time stops and light is trapped, exactly. Its radius grows as M once
   the box is taken out, bending stays 1.9985 and α flat
   ([`E-GRV-0118`](test/experiment/gravity/horizon-slope-box.ts),
   [`E-GRV-0122`](test/experiment/gravity/headroom-horizon-temperature.ts)).
   It is bald far out, with one short-range number near it
   ([`E-GRV-0116`](test/experiment/gravity/horizon-flux-budget.ts))
2. **Hawking's scaling.** Light leaving a large horizon is redshifted
   at 0.97 to 0.98 κ, T·M flat to 1.7%, over a window capped at ½ ln C
   by the clock register
   ([`E-GRV-0123`](test/experiment/gravity/deep-headroom-horizon.ts)). A
   forming horizon makes particles, exactly counted, with a power-law
   spectrum at the register sizes run
   ([`E-GRV-0132`](test/experiment/gravity/forming-headroom-horizon.ts))
3. **an area law.** Carrying the infall onto the horizon's own surface
   registers hides 18.18 nats per cut link at every size and every
   stage of growth. A horizon forms only while what fell in fits on its
   surface, which is Bekenstein's bound as dynamics. S/(A/4G) is a flat
   1.44 to 1.47
   ([`E-GRV-0131`](test/experiment/gravity/membrane-horizon-entropy.ts),
   [`E-GRV-0135`](test/experiment/gravity/balanced-membrane-growth.ts)).
   The torn husk alone gives a volume law
   ([`E-GRV-0124`](test/experiment/gravity/headroom-horizon-entropy.ts))
4. **source and field.** The confining string is the energy-line
   register mod 3, with Gauss exact
   ([`E-GRV-0127`](test/experiment/gravity/trio-energy-line-depth.ts)).
   No local move on a closed register turns those lines into the 1/r
   depth within a run
   ([`E-GRV-0130`](test/experiment/gravity/trio-line-plaquette-depth.ts),
   [`E-GRV-0133`](test/experiment/gravity/trio-stack-plaquette-depth.ts)),
   so the step field is gravity's own field, as the Coulomb field is
   light's, sourced by the rule's energy
5. **matter that stays put, and falls alike.** The rule holds the
   three-love level with a one-trit drift cost and a consistent fermion
   sign, and its energy sources the 1/r
   ([`E-SPN-0104`](test/experiment/spin/permutation-meeting.ts),
   [`E-GRV-0119`](test/experiment/gravity/framed-cluster-depth.ts)).
   Inertia over energy is two factors:
   - the walk goes to 1 as a love gets light against a dock (1.006 at
     n = 8, [`E-SPN-0107`](test/experiment/spin/fine-coin.ts))
   - the binding goes to 1 as a string-bound love-fear pair's string
     loosens (1.018 at D 30), with its size growing as the predicted cube
     root ([`E-SPN-0112`](test/experiment/spin/moving-binding.ts))

   The trio does not, because it is held by contact at a full dock, 2.2
   docks across at every tension
   ([`E-SPN-0111`](test/experiment/spin/loose-string.ts))
6. **spin 2.** One depth per line class fixes a full metric, and with
   linearized general relativity as the coupling it carries exactly two
   polarizations at c
   ([`E-GRV-0125`](test/experiment/gravity/line-class-spin-two.ts))
7. **the 3.8% drift** was the wrong energy being read. The headroom
   light keeps the right one to 2.9e-14 and bends by 2.0069
   ([`E-GRV-0128`](test/experiment/gravity/headroom-slab-window.ts))

8. **a composite at speed.** Along the joint limit a love-fear meson's
   inertia over energy falls to 1.003 at rest
   ([`E-SPN-0113`](test/experiment/spin/meson-joint-limit.ts)). The
   levels crossing its band are the Klein channel, pair tunnelling
   through the string, sorted by an exact love-fear exchange symmetry.
   Read through them, the meson stays one particle to momentum equal to
   its rest energy, with c within 0.14% of the walk's at n = 16, as a
   resonance of width 1e-7 of its mass
   ([`E-SPN-0115`](test/experiment/spin/meson-crossing.ts))
9. **spin 2's structure from the rule's own redundancy.** Sliding the
   unlabeled docks forces linearized Einstein–Hilbert
   ([`E-GRV-0138`](test/experiment/gravity/slide-invariant-spin-two.ts)),
   and a spacetime slide forces the lapse and shift to be Lagrange
   multipliers with DeWitt's kinetic term
   ([`E-GRV-0139`](test/experiment/gravity/spacetime-slide-spin-two.ts)).
   At cubic order the full slide fixes the wave speed at exactly c and
   λ at 1, which a foliation-preserving slide leaves free
   ([`E-GRV-0141`](test/experiment/gravity/cubic-slide-speed.ts))

**Still open:**

1. **bound matter moving in 3d.** On the rule as it stands every vibe
   is a lineon, and no composite can leave its lines
   ([`E-SPN-0116`](test/experiment/spin/bent-string.ts) to
   [`E-SPN-0120`](test/experiment/spin/two-hub-bound.ts)). Line-only
   motion is excluded by observation, by about 17 orders of magnitude
   ([`E-SPN-0126`](test/experiment/spin/line-anisotropy.ts)). So the
   rule has to change. A candidate change is tested, and it splits the
   problem in two.

   **Motion works under the candidate.** It has four parts:
   - a filled love sea as the vacuum;
   - a fermionic mixer over all 24 slots of a dock, which Pauli blocking
     keeps inert on the sea
     ([`E-SPN-0140`](test/experiment/spin/dock-mixer.ts));
   - the swap coin, which keeps a vibe or crosses it with integer
     entries;
   - one new prime, 7, so the mass can be tuned
     ([`E-SPN-0143`](test/experiment/spin/swap-cone.ts)).

   Under it, a hole moves the same in every direction and obeys special
   relativity, with R = tan(m)/m. Every excitation shares one top speed,
   c* = c/2, and nothing exceeds it at any momentum. This holds in the
   exact many-body rule, with the vacuum inert and gravity's sign kept
   ([`E-SPN-0145`](test/experiment/spin/swap-many-body.ts),
   [`E-GRV-0144`](test/experiment/gravity/normal-ordered-depth.ts)).
   The graviton's slide holds at c* too, so matter and gravity can
   share one c.

   **Binding, first attempts.** Every one below leaks or is too heavy,
   and one obstruction runs through all of them: the swap coin's 22
   flat bands, which sit in the continuum for a light member.
   - A phase string leaks through the swap coin's flat bands
     ([`E-SPN-0146`](test/experiment/spin/swap-string-meson.ts)).
   - A mass string binds exactly and moves isotropically, but it needs
     heavy members, reads the pair's separation nonlocally, and gives
     R = 1.57 ([`E-SPN-0147`](test/experiment/spin/swap-mass-string.ts)).
     No dock-local piece can fix it: that is a band-sum theorem
     ([`E-SPN-0148`](test/experiment/spin/swap-odd-phase.ts)).
   - On a line R → 1, with the lattice mass the only excess
     ([`E-SPN-0149`](test/experiment/spin/line-flux-string.ts)). In 3d
     a cost-only string misses the string's own transverse inertia.
   - A Z3 flux register on the links records each member's path, so a
     member walks a tree and cannot be light
     ([`E-SPN-0150`](test/experiment/spin/swap-link-flux.ts)). A Z3
     plaquette term cannot give light members and a confining string
     at once ([`E-SPN-0151`](test/experiment/spin/flux-plaquette.ts)).
   - The group the roots already form, 2T, freezes while the string is
     still heavy. A register in the 4d bulk cannot confine continuously
     for any group, so the string has to live on the husk
     ([`E-SPN-0152`](test/experiment/spin/hurwitz-link-register.ts)).
     On the husk, 2I, with the golden ratio in the ring, reaches SU(2)'s
     scaling region before it freezes: its string tension there is
     1.6e-18 of the strong-coupling value
     ([`E-SPN-0153`](test/experiment/spin/icosian-husk-window.ts)).
   - But no gauge string reaches the flat bands. The swap coin undoes
     itself in every static field of every group, so exactly 11 flat
     states per color per dock survive any string, a tense string makes
     the member about 6 times heavier (Kesten's tree floor), and a
     confining ladder meets the pair at separation 2m/σ = 11.19
     ([`E-SPN-0161`](test/experiment/spin/icosian-string-flat-source.ts)).
   - A two-beat schedule frees every flat band's rest phase and lifts 7
     of them clear, but three transverse partners of the singlet stay
     pinned in every covariant schedule of any period, because the
     singlet's partner is a vector: 314 of 314 schedules that keep R
     are open ([`E-SPN-0159`](test/experiment/spin/swap-two-beat.ts)).
   - A Coulomb pull binds heavy members only, with R 1.41 to 1.44, and
     leaks a light one
     ([`E-SPN-0155`](test/experiment/spin/husk-coulomb-meson.ts)).

   **The register: a member that is a spinor.** Everything since runs on
   the candidate rule with one more piece, which is not adopted.
   - **An 8-value register per member.** A 2-value spinor cannot be
     exact in the model's ring (the quaternion algebra (−3, −1) is
     ramified at 3, Q8 needs (−1, −1), ramified at 2). The least exact
     register is the even Clifford algebra Cl⁺(4) = H ⊕ H, 8 values, on
     which W(F4) acts by minors. The singlet's partner is then a Clifford
     partner with no transverse state, and the census closes for a light
     member for the first time: binding room B* = 2M exactly, the ideal
     Dirac value, for every mass below π/6
     ([`E-SPN-0160`](test/experiment/spin/spinor-register.ts)).
   - **The price, a theorem: such a partner takes a quarter of the
     stream**, so the one speed is c/4 in bulk units. Read on the husk
     it is √2/4 husk docks a beat, isotropic, and c/4 is only its bulk
     label ([`E-SPN-0167`](test/experiment/spin/husk-reading.ts)). The
     graviton shares it: every one of a member's 192 bands is the Dirac
     band or flat, and no register that closes the census keeps c/2
     ([`E-GRV-0145`](test/experiment/gravity/register-graviton-speed.ts)).
   - **The many-body rule with registers is exact.** Every register
     piece is one-body, so its fermionic lift is fixed, the full sea is
     one branch with a unit amplitude every beat, K never fires, and one
     hole is exactly the member
     ([`E-SPN-0163`](test/experiment/spin/register-many-body.ts)).
   - **A light pair binds and holds exactly.** A string built only from
     the register's sector projectors keeps the flat bands decoupled at
     every separation. The pair holds 128 beats with a leak below 1e-9,
     isotropic to 5e-7, against the full 192×192 rule to 5e-17. But its
     inertia over energy is R = 34.65
     ([`E-SPN-0162`](test/experiment/spin/register-meson-hold.ts)), and
     at weaker strings 13.47 and 1.43: R falls toward the continuum, and
     a static binder crosses R = 1 only at one tuned coupling
     ([`E-SPN-0174`](test/experiment/spin/register-meson-weak.ts)).
   - **The model's light supplies the missing inertia.** Coupled to the
     member's stream as a Peierls phase with back-action (Gauss holds
     with the member as charge), the light's Coulomb and transverse
     kernels are one Maxwell Lagrangian to 6e-8, so the transverse
     exchange is exactly the Darwin term. It removes 0.879 of the static
     excess on a bound state, and for a light member takes R to 1.012
     against its own tan m/m 1.012. This is linear response, not the
     pair and the quantum light as one dynamics
     ([`E-SPN-0169`](test/experiment/spin/darwin-exchange.ts)).
   - **Held by the light's own pull, a light register pair binds like
     hydrogen** (E_b within 6% and 14% of the continuum), holds with no
     leak and is isotropic to 2e-6, but R is 8.5 to 16 at the couplings
     the engine reaches, heavier the tighter the binding. The argued
     cause is strong coupling across one link: each center-of-mass step
     crosses the pull's gradient over a link (0.59 rad a cycle against a
     band of 0.27)
     ([`E-SPN-0173`](test/experiment/spin/register-coulomb-hold.ts)). A
     symmetry-reduced engine reaching Bohr radii of 8 to 20 is running,
     to read R where the pull is weak across a link. It found that the
     level is a multiplet of at least 6 lines, each one heavy on its
     own, so the high R is not a blend
   - **The wall as the husk.** A Wilson mass built from the rule's own
     mixers makes the husk a domain wall, second Chern number −1 per copy
     ([`E-SPN-0166`](test/experiment/spin/wilson-wall.ts), a fail on
     one pre-registered isotropy tolerance). The member on the wall is
     light by depth alone, its mass falling 940-fold from depth 4 to 12
     with the bulk unchanged, relativistic (R → 1.0004) and isotropic.
     But the pair census on the wall is open, through depth channels and
     a Floquet resonance with the far side
     ([`E-SPN-0168`](test/experiment/spin/wall-face.ts)). The resonance
     closes by moving the far side's phase, which displaces the wall's
     Weyl node ([`E-SPN-0172`](test/experiment/spin/far-side-shift.ts),
     a fail on one rigidity tolerance)
2. a temperature: a forming horizon's spectrum stays a power law at
   every register size run (C 13 to 49), so what shows is the growth's
   quench
   ([`E-GRV-0134`](test/experiment/gravity/forming-horizon-register-scan.ts)).
   Read late, a settled horizon makes nothing (1e-7 of the burst): it is
   a static wall with its redshift capped at ½ ln C, so a bounded clock
   predicts a formation burst and no steady evaporation unless
   ln C ≫ 4π
   ([`E-GRV-0136`](test/experiment/gravity/forming-horizon-late-slow.ts))
3. Randall and Sundrum's short-range number: finer layering takes the
   scalar to 3/4 of theirs
   ([`E-GRV-0137`](test/experiment/gravity/rs-layering.ts)), and the
   spin-2 tower reaches 0.971 of it
   ([`E-GRV-0142`](test/experiment/gravity/tensor-layering.ts)), with
   the 4/3 derived from a slide along the bulk's depth
   ([`E-GRV-0143`](test/experiment/gravity/bulk-slide-depth.ts)). Left:
   the warp, the radion's stabilization and brane bending

The full record is note/research/vibe/roadmap/remaining-pieces.md and
discrete-gravity.md in the ClueSurf notes.

**Where the previous readme read otherwise.** It gave gravity as solved: the
area-law potential giving Newton and the factor two
([`E-GRV-0012`](test/experiment/gravity/emergent-metric.ts)), and an
area-law invariant
([`E-GRV-0002`](test/experiment/gravity/area-law-from-knit-walk.ts)).
Both ran on a hand-written walk and a hand-built metric, graded
stand-in. On the working vacuum the entanglement is a volume law at
equilibrium ([`E-GRV-0083`](test/experiment/gravity/knot-area-law.ts)).
It also read gravity as the clock rate alone, which bends light by 1,
not 2 ([`E-GRV-0088`](test/experiment/gravity/depth-arena-prediction.ts)).

## Other open problems

| problem | where it stands | codes |
| :--- | :--- | :--- |
| one light speed | on the working rule a locked vibe's top speed is 1/2 a beat and every stable husk light is capped at $c \le 1/\sqrt6 = 0.408$, a theorem on each side. With the register, matter and the graviton share √2/4 husk docks a beat, which sits inside the stable cap. The quantum loop light meets it exactly at κ = 3/16 and the split ρ = 3 (the trit column never can: even against odd). But the split is fixed by equal filling, and at a balanced split exact equality holds only as a limit of the register's size, missing by 1/(2q²) at register 16q, which needs a register near 10¹⁰ to match the 1e-18 bound. The balance is exactly 3/8 counted on the bulk's registers and 0.4614 on the husk's weighted columns | [`E-FRC-0250`](test/experiment/gauge/one-light-split.ts), [`E-GRV-0145`](test/experiment/gravity/register-graviton-speed.ts), [`E-FRC-0260`](test/experiment/gauge/register-light-speed.ts), [`E-FRC-0261`](test/experiment/gauge/light-split-origin.ts), [`E-FRC-0262`](test/experiment/gauge/husk-balance.ts) |
| composite light | a bound love and fear pair is massive by a theorem, with one polarization on the husk, not two. Light stays its own field | [`E-FRC-0246`](test/experiment/gauge/composite-locked-light.ts), [`E-FRC-0247`](test/experiment/gauge/composite-light-husk.ts) |
| the electron in 3d, and g | bound on one husk line only. A general direction is a superposition over lines. g needs its coupling to the light, not a mixer | [`E-SPN-0093`](test/experiment/spin/passing-contact-cluster.ts), [`E-SPN-0089`](test/experiment/spin/knit-cluster-landau.ts) |
| measurement | a frame-covariant rule depolarizes every basis at one rate, so a pointer basis must come from the environment, never the rule (a 2-design theorem) | [`E-QTM-0154`](test/experiment/quantum/pointer-basis-theorem.ts) |
| the weak force | the locked rule keeps P, C, T, CP and CPT exactly. The register supplies what was missing, a spin apart from the slot: its two halves (J = right multiplication by vol) are kept by the 576 rotations and swapped by the 576 reflections, and a chiral mass breaks P and CP by 0.180 with CPT exact and no isotropy lost (Molien). The frames cannot be the three generations (anisotropic at fourth order). On the flat husk quotient parity survives exactly, so P violation needs an oriented depth, and the Wilson wall's chiral face breaks it by a whole chirality, +2 and −2 at the two faces. All on the candidate rule | [`E-FRC-0248`](test/experiment/gauge/locked-parity-ledger.ts), [`E-FRC-0258`](test/experiment/gauge/chiral-register.ts), [`E-SPN-0167`](test/experiment/spin/husk-reading.ts), [`E-SPN-0168`](test/experiment/spin/wall-face.ts) |
| CP and the asymmetry | three flavors keep every invariant, and the trimaximal mixing, exact in the ring with Jarlskog √3/18, is removable at one body (no one-body piece joins the halves, a theorem). A two-body register exchange makes it physical, and C and CP then break together inside one sea with no piece that tells love from fear, so the love-fear mirror stays exact. Member number is kept by every piece and by any gauge winding (Nielsen–Ninomiya in Floquet form), but flows through the Wilson wall under an exact E·B field, +4 per loop at one face and −4 at the other. So all three Sakharov conditions are in the rule. The flow is an index, blind to CP, so a CP-symmetric field history nets 0: a net asymmetry needs a dynamical light biased by the CP-odd currents, which is not built | [`E-FRC-0259`](test/experiment/gauge/flavor-register.ts), [`E-SPN-0163`](test/experiment/spin/register-many-body.ts), [`E-SPN-0164`](test/experiment/spin/sea-conjugation.ts), [`E-SPN-0165`](test/experiment/spin/chiral-flow.ts), [`E-SPN-0168`](test/experiment/spin/wall-face.ts), [`E-SPN-0171`](test/experiment/spin/wall-asymmetry.ts) |
| the value of α | $\alpha = \sqrt{3/(2\rho)}/(12N)$, set by the split and the depth, not by the speed. A frozen prediction over depths 1 to 10,000 at ρ = 3 and 3/8, and at the husk's measured 0.4614, finds no hit within 1e-3 of 1/137.036 (nearest 138 at depth 11, 0.70% off, chance about 0.32 under the null), so nothing is claimed | [`E-FRC-0242`](test/experiment/gauge/split-coulomb-coupling.ts), [`E-FRC-0261`](test/experiment/gauge/light-split-origin.ts), [`E-FRC-0262`](test/experiment/gauge/husk-balance.ts), [`E-MTH-0010`](test/experiment/method/closed-forms-under-a-null.ts) |
| a bounded self | shared history gives one component of all 24,576 vibes or closed components of exactly 8 on one line, nothing in between | [`E-SLF-0177`](test/experiment/selves/shared-origin-components.ts), [`E-SLF-0178`](test/experiment/selves/shared-origin-integration.ts) |
| one rule for every row | the working vacuum and the electron share one rule. Most older rows ran on earlier rules, and a triage found the rest cannot be rerun usefully: most wait on motion across lines, the light's own quantum sector, CP violation or an energy ledger. The register results run on the candidate rule, which is not adopted | the ledger's section Q |

## Rows started this round

Ledger rows nobody had started, each run once with a control and graded
by the ledger's own rules. Every one is partial unless marked, and the
reason is stated.

| row | measured | why not held | code |
| :--- | :--- | :--- | :--- |
| the path integral | the working rule is its sum over take histories term for term, 0 mismatches on 17 of 17 starts, and stationary phase takes over in the long run, E[v²] → 1 − √3/2 = 0.1339746 | 1d along a line, and the meeting-free control was amended after the first run (disclosed) | [`E-QTM-0158`](test/experiment/quantum/history-sum.ts) |
| delayed choice and the eraser | a later meeting erases a which-arm mark, fringe and anti-fringe summing to the washed-out pattern, with the earlier probabilities exactly unchanged | the gate schedule is arranged, not produced by a mesh configuration | [`E-QTM-0159`](test/experiment/quantum/delayed-choice-eraser.ts) |
| weak values | the rule's own histories carry shares −1/2 and 3/2, and a weak pointer reads 9/4 as its disturbance falls as 9/4·4⁻ⁿ | schedule arranged | [`E-QTM-0160`](test/experiment/quantum/weak-values.ts) |
| mixed states and POVMs | a 4-outcome reading whose effects sum to I, are not projectors and do not commute, Born exact, a pure whole leaving its part mixed (purity 23/32) | schedule arranged, not informationally complete | [`E-QTM-0161`](test/experiment/quantum/povm-from-an-ancilla.ts) |
| Wigner's friend | the friend's record undoes with probability 1 and restores P(R) = 1/4, where the collapse account predicts 17/32. Once copied, it cannot be undone | the friend is one vibe's point, not a self | [`E-QTM-0162`](test/experiment/quantum/wigners-friend.ts) |
| length contraction and simultaneity | one Lorentz factor for speed and energy, a moving packet the contracted rest packet, the tilt of "now", within 3e-4 at 0.5 c* and scaling as m² | candidate rule, lone excitations, thresholds set after a probe | [`E-RLT-0108`](test/experiment/relativity/husk-lorentz-kinematics.ts) |
| relativistic collisions | four-momentum conserved exactly, and the outgoing shell is the boosted sphere to 7.3e-4 at boost 0.83 | candidate rule, kinematics only | [`E-RLT-0109`](test/experiment/relativity/husk-collision-kinematics.ts) |
| Landauer's principle | erasing a trit puts exactly ln 3 into the box, 0.462 nats of it invisible to the husk coarse map | the energy side, kT ln 3, not measured | [`E-CMP-0018`](test/experiment/computation/landauer-line.ts) |
| error correction | a repetition code over mesh lines, since no error crosses lines, 2,754 of 2,754 correctable cases decoded, distance exact | classical, and bought by the line law the candidate rule removes | [`E-CMP-0019`](test/experiment/computation/line-code.ts) |
| the horizon and flatness problems | the husk is a horosphere, flat by geometry, and every pair of docks one seed reaches shares a causal past (0 of 8,256 disjoint), against 171 of 300 for a start everywhere at once | temperature agreement not read | [`E-CSM-0058`](test/experiment/cosmology/husk-horizon-flatness.ts) |
| inflation or its replacement | the husk does not inflate: a cubic ball, 3.22 e-folds, the bulk's ×18.28 being volume off the husk | the ripple spectrum not addressed | [`E-CSM-0059`](test/experiment/cosmology/husk-growth-rate.ts) |
| the end state | a fixed box reaches coarse maximum entropy in 4 beats and sits at the predicted fluctuation floor, with exact recurrence | a growing mesh argued, not run | [`E-FND-0155`](test/experiment/foundations/coarse-end-state.ts) |
| fluctuation-dissipation | **held**: variance equals −dE/dβ on 17 of 17 starts, relaxation along the equilibrium autocorrelation, one bath | | [`E-FND-0156`](test/experiment/foundations/husk-fluctuation-dissipation.ts) |
| Compton and Thomson scattering | the shift is λ_C(1 − cos θ) to 5e-6, λ_C set by the member's inertia, the forward amplitude Thomson's with σ/σ_T = 1/R² → 1, the dipole response Dirac's | Klein–Nishina and the absolute cross section (α) not run | [`E-FRC-0263`](test/experiment/gauge/compton-thomson.ts) |
| the photoelectric threshold | ionization above E_b at first order, following the intensity, and 4,300 times smaller below every bound line | a fail: the gate allowed no loss below E_b and missed hydrogen's own lines, and the pair is a stand-in | [`E-FRC-0264`](test/experiment/gauge/photoelectric-threshold.ts) |

Also rerun on the working rule this round: positions in superposition,
to held ([`E-QTM-0157`](test/experiment/quantum/position-interference.ts)),
and the Coulomb binding gate registered with its first run
([`E-SPN-0155`](test/experiment/spin/husk-coulomb-meson.ts), partial on
one pre-registered instrument clause).

## Order of work

One chain gates nearly everything, because most rows still at none or
partial wait on bound matter that moves across lines.

1. **R for a light pair held by the light.** The symmetry-reduced
   engine reads R at Bohr radii 8 to 20, static and with the Darwin
   term. If it falls to tan m/m there, bound matter moving in 3d has
   its full demonstration on the candidate rule with the register.
2. **The pair and the quantum light as one exact dynamics**, to confirm
   the Darwin term beyond linear response.
3. **Adopt or refuse the candidate rule.** The register results then
   become the working rule's, or are set aside.
4. **Rerun the rows the line law blocks** on that rule: bosons from
   even-N composites, temperature across lines, anyons, the atom, and
   the self rows.
5. **A net asymmetry**: a dynamical light biased by the CP-odd flavor
   currents at the wall.
6. **The light's own quantum sector on the whole husk**, and an energy
   ledger for the Casimir row.
7. **The paper**, text/0017-the-vibe-theory-model, which waits on
   step 1.

## Results on earlier rules

The previous readme led with results from the turning weave and the
rules before it. They stand as results about those rules, and each
reads differently now:

- **CP violation with CPT exact** was measured on the turning weave. The
  locked rule keeps C, P and CP exactly
  ([`E-FRC-0248`](test/experiment/gauge/locked-parity-ledger.ts)). It
  comes back on the candidate rule with the register, C and CP together
  ([`E-SPN-0164`](test/experiment/spin/sea-conjugation.ts)), but not on
  the working rule.
- **The Cabibbo angle within four percent** was never tested against a
  pre-registered null. The ledger grades it stand-in, and the geometric
  mixing angles themselves come out degenerate
  ([`E-FRC-0070`](test/experiment/gauge/mixing-angles-not-geometric.ts)).
- **No magnetic monopoles** was an identity of the earlier light's link
  potentials. The light adopted since is compact U(1)
  ([`E-FRC-0244`](test/experiment/gauge/photon-seam-law.ts)), which
  admits heavy monopoles, so exact absence is no longer a prediction.
- **The vacuum clock of period three** belonged to the charge rule. The
  working vacuum's cycle is 12 beats.
- **A factorization of the lepton mass hierarchy** fit, carried a
  pre-committed number that would kill it, and was killed by sharper
  data. It stays recorded.

## The scoreboard

Every commonly observed feature of nature the model must account for,
one row per feature, generated from the working ledger's observation
table (see Development for the command, never edit it by hand). The
experiment codes resolve in [test/catalog.csv](test/catalog.csv). Its
marks are coarser than the 191-fact ledger above: many ✅ rows rest on
stand-ins the ledger does not count as held, and the gravity rows rest
on the depth register, an added part of the rule.

<!-- sm-scoreboard:start -->

| mark | meaning | count |
| :--- | :--- | :--- |
| 🟢 | emergent from the rule | 4 |
| ✅ | reproduced on the model | 50 |
| 🔵 | structure derived, dynamics open | 20 |
| 📌 | free input, not predicted | 1 |
| ❌ | open | 0 |
| ⛔ | blocked on a base decision | 0 |

| observation | | note |
| :--- | :--- | :--- |
| **quantum** | | |
| quantum amplitude at the base | 🔵 | The bare knit has no amplitudes: a defect never spreads and two add exactly as sets (E-FND-0080). The quantum part is the signed weight on the role grid, fear: the singlet is 72 loves and 18 fears on 54 units (E-FRC-0120), and the cube-root swap phase is an exact reversible beat whose gates close to su(9) (E-FRC-0127). It runs in the adopted knit as the fear beat, the one gate outside the Clifford group (E-FRC-0159, E-SPN-0063, E-QTM-0118), and gives amplitudes to roles, not positions (E-SPN-0081). The turning weave's vacuum clock carries a discrete phase kinematics, listed below. |
| | | [`E-FND-0080`](test/experiment/foundations/rule-has-no-amplitudes.ts), [`E-FRC-0120`](test/experiment/gauge/fear-is-negativity.ts), [`E-FRC-0122`](test/experiment/gauge/fear-resolution.ts), [`E-FRC-0127`](test/experiment/gauge/fear-beat.ts), [`E-FND-0107`](test/experiment/foundations/two-path-interference.ts), [`E-FND-0106`](test/experiment/foundations/unit-kick-phase-law.ts), [`E-FND-0105`](test/experiment/foundations/wire-polarization-law.ts), [`E-FND-0102`](test/experiment/foundations/adoption-gate-sweep.ts), [`E-FND-0103`](test/experiment/foundations/palindrome-knit.ts), [`E-FND-0096`](test/experiment/foundations/traveller-slab-window.ts), [`E-FND-0091`](test/experiment/foundations/wall-measures-the-clock.ts), [`E-FND-0086`](test/experiment/foundations/growth-shifts-the-clock.ts), [`E-FND-0123`](test/experiment/foundations/born-discriminator.ts), [`E-FND-0124`](test/experiment/foundations/number-operator-law.ts), [`E-FND-0125`](test/experiment/foundations/port-conversion.ts), [`E-FND-0126`](test/experiment/foundations/linear-port-law.ts), [`E-FND-0127`](test/experiment/foundations/born-ensemble.ts) |
| Born rule | ✅ | Counting weights at the domain wall give the Born statistics. |
| | | [`E-QTM-0012`](test/experiment/quantum/envariance-born.ts), [`E-QTM-0091`](test/experiment/quantum/collapse-is-not-the-weight.ts), [`E-FND-0091`](test/experiment/foundations/wall-measures-the-clock.ts) |
| entanglement and Bell | ✅ | Bell violation is reproduced on the model walk. |
| | | [`E-QTM-0011`](test/experiment/quantum/entanglement-bell.ts), [`E-QTM-0038`](test/experiment/quantum/tsirelson-forced-by-coin.ts), [`E-QTM-0057`](test/experiment/quantum/no-signaling-nonlocality.ts), `E-QTM-0100`, `E-QTM-0111`, `E-QTM-0140`, `E-QTM-0141`, `E-QTM-0143`, `E-RLT-0055` |
| measurement and definite outcome | 🟢 | The domain wall projects and amplifies one outcome, from the rule. |
| | | [`E-QTM-0085`](test/experiment/quantum/arrow-is-the-amplifier.ts), [`E-QTM-0090`](test/experiment/quantum/holder-derived-from-the-rule.ts), [`E-FND-0091`](test/experiment/foundations/wall-measures-the-clock.ts), [`E-FND-0123`](test/experiment/foundations/born-discriminator.ts), [`E-FND-0124`](test/experiment/foundations/number-operator-law.ts), [`E-FND-0125`](test/experiment/foundations/port-conversion.ts) |
| QFT vacuum and reflection positivity | ✅ | The free clock field and the thermal gas are positive semidefinite on a non-trivial estimator, and the amplifying wake violates positivity exactly as it must. |
| | | [`E-QTM-0096`](test/experiment/quantum/clock-field-positivity.ts), [`E-QTM-0025`](test/experiment/quantum/reflection-positivity.ts), [`E-QTM-0017`](test/experiment/quantum/near-critical-rp.ts) |
| path integral | ✅ | The sum over walk paths reproduces the propagator. |
| | | [`E-QTM-0018`](test/experiment/quantum/path-integral.ts) |
| quantum error correction | ✅ | The clock code protects the phase and corrects single errors. |
| | | [`E-QTM-0093`](test/experiment/quantum/toric-code-from-the-mesh.ts), [`E-QTM-0095`](test/experiment/quantum/qutrit-toric-code-from-the-mesh.ts), [`E-QTM-0055`](test/experiment/quantum/conservation-as-stabilizer.ts) |
| double slit interference | ✅ | Two-path interference with the cosine cross term holds on the model, in the walk and in the domain clock. |
| | | [`E-QTM-0018`](test/experiment/quantum/path-integral.ts), [`E-FND-0085`](test/experiment/foundations/birth-beat-interference.ts), [`E-FLD-0014`](test/experiment/fluids/sound-superposition-interference.ts) |
| quantum tunneling | ✅ | The exponential tunneling law and Klein tunneling hold on the walk. |
| | | [`E-QTM-0056`](test/experiment/quantum/tunneling-law.ts), [`E-QTM-0073`](test/experiment/quantum/klein-tunneling.ts) |
| uncertainty principle | 🔵 | The position-momentum bound is confirmed as the Fourier identity on the lattice. |
| | | [`E-QTM-0059`](test/experiment/quantum/uncertainty-principle.ts) |
| casimir effect | ✅ | Two boundaries in the model vacuum attract by mode exclusion. |
| | | [`E-SLF-0018`](test/experiment/selves/casimir-vacuum-attraction.ts), [`E-SLF-0017`](test/experiment/selves/casimir-capture-mobile.ts) |
| **gauge** | | |
| gauge group SU(3) SU(2) U(1) | 🔵 | The group and its embedding fall out of the octonions on the 24-cell, exactly. |
| | | [`E-FND-0021`](test/experiment/foundations/gauge-group-from-octonions.ts), [`E-FRC-0022`](test/experiment/gauge/gauge-embedding.ts), [`E-FRC-0025`](test/experiment/gauge/gauge-from-coin-tone.ts) |
| Weinberg angle 3 8 | 🔵 | The 3/8 tree-level angle is derived, running it down to the measured value is standard. |
| | | [`E-FRC-0055`](test/experiment/gauge/weinberg-angle-geometric.ts), [`E-FRC-0054`](test/experiment/gauge/weak-angle-prediction.ts), [`E-FRC-0044`](test/experiment/gauge/rg-unification.ts) |
| hypercharge and fractional charges | 🔵 | The quark and lepton charges come out of one representation, exactly. |
| | | [`E-FRC-0002`](test/experiment/gauge/anomaly-cancellation-octonion.ts) |
| anomaly cancellation | 🔵 | The anomaly sums cancel across one generation, exactly. |
| | | [`E-FRC-0002`](test/experiment/gauge/anomaly-cancellation-octonion.ts) |
| dynamical gauge field | 🔵 | A carrier exists with a measured unit coupling, the emission vertex is measured (the interacting band radiates matter-to-wire conversion, E-FND-0113), and under the turning weave the interaction structure connects all twelve species (E-FND-0117). The remaining work (the gauge algebra of the carrier, the fast photon sector) is open research. The kick generator is charge-signed (E-FND-0128), the abelian coupling measured. In the adopted three-trit model, links hold grid moves and a flow with Gauss's law exact (E-FRC-0123), and they move by reflection with energy exact and every frame change a symmetry (E-FRC-0128), on variant rules. The adopted knit carries the links as Sigma(648) elements, with every dock's held color exact while it makes pairs (E-RLT-0067). |
| | | [`E-FND-0100`](test/experiment/foundations/wall-launched-carrier.ts), [`E-FND-0104`](test/experiment/foundations/wall-mode-matter-coupling.ts), [`E-FND-0108`](test/experiment/foundations/unit-coupling-absorption.ts), [`E-FND-0113`](test/experiment/foundations/weave-species-spectrum.ts), [`E-FND-0117`](test/experiment/foundations/palindromic-turning-weave.ts), [`E-FND-0128`](test/experiment/foundations/charge-signed-kick.ts), [`E-FRC-0016`](test/experiment/gauge/emergent-u1-gauge.ts), [`E-QTM-0093`](test/experiment/quantum/toric-code-from-the-mesh.ts), [`E-FRC-0073`](test/experiment/gauge/fills-gate-transport.ts), [`E-FRC-0123`](test/experiment/gauge/vibe-weave.ts), [`E-FRC-0128`](test/experiment/gauge/roles-on-moving-links.ts), `E-FRC-0134`, `E-FRC-0135`, `E-FRC-0144`, `E-FRC-0145` |
| photon and Maxwell | ✅ | The Ward identity and the Maxwell spectrum hold on the substrate gauge sector. |
| | | [`E-FRC-0072`](test/experiment/gauge/ward-identity-maxwell.ts), [`E-RLT-0030`](test/experiment/relativity/propagating-mode-3434.ts) |
| nonabelian gauge and confinement | ✅ | Wilson loops show the area law and confinement on the mesh, and the classical color group Sigma(648) confines under a rule with no random number. |
| | | [`E-FRC-0039`](test/experiment/gauge/nonabelian-gauge.ts), [`E-FRC-0007`](test/experiment/gauge/confinement.ts), [`E-FRC-0045`](test/experiment/gauge/schwinger.ts), [`E-FRC-0048`](test/experiment/gauge/su2-condensate.ts), [`E-FRC-0103`](test/experiment/gauge/finite-color-groups.ts), [`E-FRC-0110`](test/experiment/gauge/finite-color-automaton.ts), [`E-FRC-0126`](test/experiment/gauge/deterministic-confinement.ts), [`E-FRC-0129`](test/experiment/gauge/string-binds.ts), [`E-FRC-0131`](test/experiment/gauge/d4-string-binds.ts) |
| running couplings and unification | ✅ | The one-loop running and the near-crossing of the couplings are reproduced. |
| | | [`E-FRC-0044`](test/experiment/gauge/rg-unification.ts), [`E-FRC-0009`](test/experiment/gauge/coupling-not-fixed-3434.ts) |
| fine structure constant value | 🔵 | The base has provably no coupling knob (the bare vertex is unity, measured), so alpha is a coarse quantity: how rarely carrier and matter meet. |
| | | [`E-FND-0108`](test/experiment/foundations/unit-coupling-absorption.ts), [`E-FRC-0044`](test/experiment/gauge/rg-unification.ts), [`E-FRC-0019`](test/experiment/gauge/fine-structure-not-geometric.ts) |
| QED precision g factor | ✅ | The g-factor structure holds, the 0.00116 radiative shift is unaccounted. |
| | | [`E-FRC-0021`](test/experiment/gauge/g-factor-3434.ts) |
| strong CP problem | ✅ | Theta has no continuum to live in (the clock vacuum is three exact points) and the measured T-symmetry of the charge knit picks zero. |
| | | [`E-FRC-0079`](test/experiment/gauge/strong-cp-discrete-theta.ts), [`E-FND-0097`](test/experiment/foundations/cp-structure-of-the-knits.ts) |
| **electromagnetism** | | |
| Maxwell equations and light | ✅ | The Ward identity, the photon mode and the emergent U(1) hold on the substrate. |
| | | [`E-FRC-0072`](test/experiment/gauge/ward-identity-maxwell.ts), [`E-FRC-0041`](test/experiment/gauge/ph-photon-3434.ts), [`E-FRC-0016`](test/experiment/gauge/emergent-u1-gauge.ts) |
| Coulomb law | ✅ | Two charges bind with the inverse-square structure. |
| | | [`E-FRC-0049`](test/experiment/gauge/two-charge-binding.ts) |
| magnetostatics and g factor | ✅ | Magnetism and the Landau g-factor hold on the substrate. |
| | | [`E-FRC-0040`](test/experiment/gauge/ph-magnetism-3434.ts), [`E-FRC-0021`](test/experiment/gauge/g-factor-3434.ts) |
| Aharonov Bohm flux quantization | ✅ | The flux period quantizes on the walk around a plaquette. |
| | | [`E-QTM-0062`](test/experiment/quantum/flux-period.ts) |
| Faraday induction | ✅ | The loop EMF equals minus the flux rate to fourteen decimals at every step, an exactness of the potential formulation. |
| | | [`E-FRC-0077`](test/experiment/gauge/faraday-induction.ts) |
| ohmic conduction | ✅ | Impurity scattering gives Drude relaxation, resistivity linear in impurity density. |
| | | [`E-FLD-0017`](test/experiment/fluids/drude-conduction.ts) |
| refraction and dielectrics | ✅ | Snell and total internal reflection hold on the clock-rate step to a hundredth of a degree. |
| | | [`E-FRC-0074`](test/experiment/gauge/snell-refraction.ts) |
| magnetic monopole absence | ✅ | Every link potential has exactly zero flux out of every cube, so monopoles are forbidden identically, not merely rare. |
| | | [`E-FRC-0076`](test/experiment/gauge/monopole-absence.ts) |
| **matter** | | |
| spinors and the double cover | 🔵 | The binary tetrahedral double cover lives in the 24 directions, exactly. |
| | | [`E-SPN-0029`](test/experiment/spin/rotation-2pi.ts), [`E-SPN-0042`](test/experiment/spin/spinor-double-cover.ts), [`E-SPN-0031`](test/experiment/spin/sp1-spin-double-cover.ts), `E-SPN-0044` |
| Dirac equation | ✅ | The Dirac walk gives the right dispersion and Zitterbewegung on the mesh. |
| | | [`E-SPN-0009`](test/experiment/spin/dirac-3plus1-3434.ts), [`E-SPN-0030`](test/experiment/spin/sp-spinor-field-3434.ts), [`E-QTM-0094`](test/experiment/quantum/ehrenfest-theorem.ts) |
| chiral fermions no doubling | ✅ | The fermion doubling obstruction is dodged on the substrate walk. |
| | | [`E-SPN-0043`](test/experiment/spin/chiral-fermion-no-doubling.ts), [`E-SPN-0004`](test/experiment/spin/chirality.ts) |
| Pauli exclusion and spin statistics | 🔵 | Exclusion follows from the spinor sign structure as algebra, and the substrate adds a structural half: a slot holds one vibe of the ternary alphabet, so two same-mode excitations cannot coexist (E-FND-0115). The spin-statistics THEOREM remains Hilbert-space mathematics. |
| | | [`E-SPN-0014`](test/experiment/spin/fermi-exclusion.ts), [`E-QTM-0064`](test/experiment/quantum/fock-structure.ts), [`E-FND-0115`](test/experiment/foundations/weave-antiparticle-conjugation.ts), `E-SPN-0045` |
| one generation representation content | 🔵 | One generation of states matches the derived representation, exactly. |
| | | [`E-FND-0020`](test/experiment/foundations/fermions-from-octonions.ts), [`E-FRC-0002`](test/experiment/gauge/anomaly-cancellation-octonion.ts) |
| three generations count | 🔵 | Triality gives three, the count is algebra and not yet dynamics. |
| | | [`E-FRC-0017`](test/experiment/gauge/exceptional-jordan-generations.ts), [`E-SPN-0016`](test/experiment/spin/generations-f4-jordan.ts), [`E-SPN-0015`](test/experiment/spin/generation-family-symmetry-3434.ts), `E-FRC-0140`, `E-FRC-0141` |
| distinct generation masses | 🔵 | The hierarchy scale and ratios are derived and the growth-written condensate is an asymmetric vacuum the model already produces, so the open dynamics is the triality-to-shell tie. |
| | | [`E-SPN-0039`](test/experiment/spin/three-generations-breaking-search.ts), [`E-FND-0098`](test/experiment/foundations/clock-condensate-symmetry-breaking.ts), [`E-FRC-0033`](test/experiment/gauge/mass-hierarchy-localization.ts), `E-FRC-0141` |
| mass hierarchy mechanism | 🟢 | Warped localization on the mesh produces exponential mass ratios, with controls. |
| | | [`E-FRC-0031`](test/experiment/gauge/mass-hierarchy.ts), [`E-FRC-0032`](test/experiment/gauge/mass-hierarchy-floor.ts), [`E-FRC-0033`](test/experiment/gauge/mass-hierarchy-localization.ts), [`E-FRC-0053`](test/experiment/gauge/warped-cusp-hierarchy.ts) |
| Koide relation | 🔵 | The Koide two-thirds appears from the derived angle structure. |
| | | [`E-FRC-0057`](test/experiment/gauge/koide-lepton-relation.ts), [`E-FRC-0059`](test/experiment/gauge/koide-coupling-f4-angle.ts), [`E-FRC-0060`](test/experiment/gauge/koide-chirality-octonion.ts) |
| CKM and PMNS mixing | ✅ | The Cabibbo angle comes out of the shell growth rate within four percent with zero free parameters. |
| | | [`E-FRC-0075`](test/experiment/gauge/ckm-from-shell-overlap.ts), [`E-FRC-0070`](test/experiment/gauge/mixing-angles-not-geometric.ts), [`E-FRC-0020`](test/experiment/gauge/flavor-mixing-pattern.ts), [`E-FRC-0036`](test/experiment/gauge/neutrino-oscillation-tm2.ts) |
| neutrino masses and seesaw | ✅ | The seesaw structure is reproduced on the model. |
| | | [`E-FRC-0037`](test/experiment/gauge/neutrino-seesaw.ts), [`E-FRC-0035`](test/experiment/gauge/neutrino-mass-ladder.ts) |
| hydrogen spectrum and atomic structure | ✅ | The hydrogen level structure comes out on the model Coulomb problem. |
| | | [`E-SPN-0018`](test/experiment/spin/hydrogen-spectrum.ts) |
| periodic table shell structure | 🔵 | Exclusion plus the level structure give the shell filling, chemistry itself is unposed. |
| | | [`E-SPN-0014`](test/experiment/spin/fermi-exclusion.ts), [`E-SPN-0018`](test/experiment/spin/hydrogen-spectrum.ts) |
| nuclear binding and stability | ✅ | The binding-energy curve and the valley of stability follow the Bethe-Weizsacker form. |
| | | [`E-SPN-0024`](test/experiment/spin/nuclear-binding-curve.ts) |
| neutrino oscillations | ✅ | Flavor oscillation with the TM2 pattern is reproduced on the model. |
| | | [`E-FRC-0036`](test/experiment/gauge/neutrino-oscillation-tm2.ts) |
| CP violation | ✅ | The palindrome traveler candidate has exactly nature's pattern: C and CP violated over the whole swept group with CPT exact. |
| | | [`E-FND-0102`](test/experiment/foundations/adoption-gate-sweep.ts), [`E-FND-0101`](test/experiment/foundations/knit-symmetry-groups.ts), [`E-FND-0097`](test/experiment/foundations/cp-structure-of-the-knits.ts), [`E-FRC-0066`](test/experiment/gauge/koide-phase-not-geometric.ts), `E-FRC-0142` |
| superfluidity | ✅ | The gas shows the superfluid signatures, no wavelength-independent damping among them. |
| | | [`E-FLD-0007`](test/experiment/fluids/superfluid-signatures.ts), [`E-FLD-0015`](test/experiment/fluids/no-wavelength-independent-damping.ts) |
| quantum hall quantization | ✅ | The plateau staircase is measured: the invariant pins at integers against a continuous knob, steps at the gap closing, and the critical point reads the midpoint. |
| | | [`E-QTM-0097`](test/experiment/quantum/hall-plateau-staircase.ts), [`E-QTM-0077`](test/experiment/quantum/topological-winding.ts), [`E-QTM-0080`](test/experiment/quantum/topological-protection.ts), [`E-QTM-0079`](test/experiment/quantum/bulk-boundary-correspondence.ts), [`E-QTM-0078`](test/experiment/quantum/cyclotron-orbits.ts) |
| superconductivity | ✅ | Flux expulsion with the exact lattice London depth follows on the model's operator once carriers are dissipationless, which the gas measures. |
| | | [`E-FRC-0078`](test/experiment/gauge/meissner-screening.ts), [`E-FLD-0015`](test/experiment/fluids/no-wavelength-independent-damping.ts), [`E-FLD-0017`](test/experiment/fluids/drude-conduction.ts) |
| **higgs** | | |
| Higgs doublet and custodial symmetry | 🔵 | The doublet and the custodial symmetry exist as algebra. |
| | | [`E-FND-0027`](test/experiment/foundations/higgs-from-octonions.ts), `E-FRC-0143` |
| electroweak boson masses | ✅ | The W to Z mass ratio is reproduced from the derived angle. |
| | | [`E-FRC-0012`](test/experiment/gauge/electroweak-boson-masses.ts) |
| electroweak symmetry breaking dynamics | ✅ | The Z_3 clock is a condensate whose phase is picked by growth history, with an exact commensurability law for the wall network. |
| | | [`E-FND-0098`](test/experiment/foundations/clock-condensate-symmetry-breaking.ts), [`E-FND-0086`](test/experiment/foundations/growth-shifts-the-clock.ts), `E-FRC-0143` |
| **spacetime** | | |
| momentum conservation | ✅ | The adopted knit conserves momentum exactly: the isometric collision keeps charge, count and momentum on every dock state tested (E-RLT-0061), and the lone bounce collision keeps momentum with a lone vibe's wake confined to its own line (E-RLT-0084). The turning weave before it conserves love minus fear and not momentum: the charge-signed momentum along x drifts by 830 over 48 beats (E-FLD-0020), the hop 96 percent of the loss (E-FLD-0021). |
| | | `E-RLT-0061`, `E-RLT-0084`, [`E-FLD-0020`](test/experiment/fluids/charge-mode-law.ts), `E-FLD-0021` |
| Lorentz invariance | 🟢 | A propagating mode with the Lorentz cone emerges, with computed control. |
| | | [`E-RLT-0018`](test/experiment/relativity/lorentz-bound-3434.ts), [`E-RLT-0030`](test/experiment/relativity/propagating-mode-3434.ts) |
| CPT | ✅ | CPT is exact for the adopted weave (verified at zero on generic states) and for the clock sector it contains. |
| | | [`E-FND-0102`](test/experiment/foundations/adoption-gate-sweep.ts), [`E-FND-0101`](test/experiment/foundations/knit-symmetry-groups.ts), [`E-FND-0011`](test/experiment/foundations/cpt-theorem.ts), [`E-SPN-0037`](test/experiment/spin/sy-discrete-symmetries.ts), [`E-FND-0097`](test/experiment/foundations/cp-structure-of-the-knits.ts) |
| dimensions 3 plus 1 | 🔵 | The 3 plus 1 split is selected by the algebra, not yet by dynamics. |
| | | [`E-FND-0038`](test/experiment/foundations/ternary-and-4d-forced.ts) |
| gravity and Einstein equations | ✅ | The husk's depth, found from one trit a link and never stored, pulls as 1/r, is causal and bends light by two; the earlier area-law route fails on the working vacuum. |
| | | `E-GRV-0090`, `E-GRV-0092`, `E-GRV-0099`, `E-GRV-0100`, `E-GRV-0083`, [`E-GRV-0012`](test/experiment/gravity/emergent-metric.ts) |
| **gravitation** | | |
| black hole thermodynamics | ✅ | Bekenstein-Hawking entropy, an analog Hawking flux and the shadow, on models. |
| | | [`E-GRV-0014`](test/experiment/gravity/gr-black-hole-thermo.ts), [`E-GRV-0026`](test/experiment/gravity/hawking.ts), [`E-GRV-0004`](test/experiment/gravity/black-hole-shadow.ts), [`E-GRV-0001`](test/experiment/gravity/analog-hawking.ts) |
| classic GR tests | ✅ | Light bending by two on the husk light itself once depth sets both its clock and its span, time dilation and the Schwarzschild form on the emergent metric. |
| | | `E-GRV-0093`, `E-GRV-0099`, `E-GRV-0088`, [`E-GRV-0012`](test/experiment/gravity/emergent-metric.ts), [`E-GRV-0037`](test/experiment/gravity/time-dilation-optical.ts), [`E-GRV-0033`](test/experiment/gravity/schwarzschild-from-bootstrap.ts) |
| gravitational waves | ✅ | Propagating quadrupole waves at the right speed on the model. |
| | | [`E-GRV-0017`](test/experiment/gravity/gravitational-wave.ts), [`E-GRV-0043`](test/experiment/gravity/quadrupole-radiation-structure.ts), [`E-GRV-0044`](test/experiment/gravity/quadrupole-amplitude-scale.ts), [`E-GRV-0045`](test/experiment/gravity/quadrupole-coefficient-closure.ts) |
| frame dragging | ✅ | A rotating well drags prograde and retrograde rays apart by Fresnel drag, linear and odd in the spin. |
| | | [`E-GRV-0055`](test/experiment/gravity/frame-dragging-fresnel.ts) |
| equivalence principle | ✅ | Bodies of every mass and content fall alike down the field gradient, above the size of one dock; below it a body falls by its own lattice ray. |
| | | [`E-SLF-0046`](test/experiment/selves/equivalence-principle.ts), `E-GRV-0090`, `E-GRV-0096` |
| **dark sector** | | |
| dark matter phenomena | 🔵 | The candidate exists and is measured: a persistent thin wall the matter particle crosses without scattering, with the bullet separation mechanism banked. |
| | | [`E-CSM-0057`](test/experiment/cosmology/dark-wall-candidate.ts), [`E-CSM-0053`](test/experiment/cosmology/bullet-separation-mechanism.ts) |
| Hubble tension | 🔵 | Expansion is measured linear in age, so H is a local clock of domain age and two honest ladders disagree when they sample regions of different age. |
| | | [`E-CSM-0027`](test/experiment/cosmology/growth-expansion.ts), [`E-CSM-0020`](test/experiment/cosmology/expansion-rate.ts) |
| **cosmology** | | |
| dark energy | ✅ | Uniform growth reads as a small positive lambda. |
| | | [`E-CSM-0006`](test/experiment/cosmology/cosmological-constant.ts), [`E-CSM-0010`](test/experiment/cosmology/dark-energy-smeared.ts) |
| proton stability | ✅ | The proton is protected by the conserved charges. |
| | | [`E-FRC-0043`](test/experiment/gauge/proton-lifetime.ts) |
| CMB acoustic peaks | ✅ | The spectrum itself alternates ten to one at decoupling and the null moves into a peak on the coherent schedule, which incoherent noise cannot do. |
| | | [`E-CSM-0056`](test/experiment/cosmology/decoupled-peak-spectrum.ts), [`E-CSM-0052`](test/experiment/cosmology/acoustic-peaks-mechanism.ts), [`E-CSM-0051`](test/experiment/cosmology/cmb-low-l-suppression.ts), [`E-CSM-0044`](test/experiment/cosmology/spectral-index-tensor.ts) |
| BBN abundances | 🔵 | The freeze-out race is measured and the matter sector is now settled by the adoption, so the nuclear network is open research rather than a blocked decision. |
| | | [`E-CSM-0055`](test/experiment/cosmology/freeze-out-vs-expansion.ts) |
| baryon asymmetry | ✅ | All three Sakharov conditions are measured on the committed rule: a growth quench charges the matter sector from the exactly C-symmetric empty state, quantized in whole hypersheets, with the total vibe sum exactly conserved (the B minus L analog) and the commensurate quench an exact null. The observed magnitude (ten to the minus ten) is not derived and needs the coarse dilution story. |
| | | [`E-FND-0116`](test/experiment/foundations/weave-sakharov-asymmetry.ts), [`E-FND-0119`](test/experiment/foundations/turning-weave-canon.ts), [`E-FND-0115`](test/experiment/foundations/weave-antiparticle-conjugation.ts), [`E-CSM-0004`](test/experiment/cosmology/baryogenesis.ts), [`E-FND-0101`](test/experiment/foundations/knit-symmetry-groups.ts), [`E-FND-0097`](test/experiment/foundations/cp-structure-of-the-knits.ts) |
| inflation and flatness | ✅ | Growth gives flatness and a horizon without a tuned inflaton. |
| | | [`E-CSM-0028`](test/experiment/cosmology/inflation.ts), [`E-CSM-0044`](test/experiment/cosmology/spectral-index-tensor.ts), [`E-CSM-0046`](test/experiment/cosmology/plateau-inflation-tensor.ts), [`E-CSM-0049`](test/experiment/cosmology/horosphere-flatness.ts) |
| Hubble expansion and redshift | 🟢 | Growth gives expansion and redshift from the rule with computed control. |
| | | [`E-CSM-0027`](test/experiment/cosmology/growth-expansion.ts), [`E-CSM-0019`](test/experiment/cosmology/expansion.ts), [`E-CSM-0020`](test/experiment/cosmology/expansion-rate.ts) |
| large scale structure formation | ✅ | Gravitational instability runs on the model's own loop: bodies source the well, fall down it, and a seed clump collapses by a factor near five. |
| | | [`E-CSM-0054`](test/experiment/cosmology/structure-formation-instability.ts), [`E-CSM-0002`](test/experiment/cosmology/attractor-signature.ts) |
| **thermodynamics** | | |
| second law thermalization | ✅ | Coarse entropy climbs to near maximum while the microstate stays exactly reversible. |
| | | [`E-FLD-0016`](test/experiment/fluids/second-law-coarse-entropy.ts) |
| blackbody planck spectrum | ✅ | Planck comes out of exact counting on the measured harmonic dispersion, and the classical branch alone gives the catastrophe. |
| | | [`E-QTM-0098`](test/experiment/quantum/planck-spectrum-from-counting.ts), [`E-FLD-0018`](test/experiment/fluids/thermal-spectrum-equipartition.ts) |
| **inputs** | | |
| absolute masses and couplings | 📌 | The absolute scales are inputs, as in every framework. |
| | | [`E-FRC-0067`](test/experiment/gauge/absolute-yukawa-not-a-ladder.ts), [`E-FRC-0009`](test/experiment/gauge/coupling-not-fixed-3434.ts) |

<!-- sm-scoreboard:end -->

## The reading, and what is falsifiable

[Vibe Theory](https://doi.org/10.5281/zenodo.20694262) reads reality as
one thing, a growing mesh of experience. The image above is its
simplest drawable face, the hyperbolic $\lbrace7,3\rbrace$ tiling, meant
literally: each tile is a **vibe**, a unit of experience, and its tone
is a felt charge (**red is pain, green is peace, blue is pleasure**).
Touching tiles **note** (experience) one another. A patch of tiles is a
thing or a mind, the whole mesh is the universe, and its growing edge is
the present. The $\lbrace7,3\rbrace$ stands in for the
$\lbrace3,4,3,4\rbrace$, whose flat 3d cusp is the space we live in.
Regular hyperbolic honeycombs run out by 5d, and $\lbrace3,4,3,4\rbrace$
is the one whose docks are a crystallographic root system that carries
spinors and whose cusp is flat 3d.

**That the base IS experience is the one axiom, and it is
unfalsifiable.** No reading can tell a felt universe from a structurally
identical one. It is held as a frame, never offered as a result.

**Everything under the frame is a discrete dynamical system, and that
part can be refuted.** Each deep claim carries a control where the
answer should be no, and the failures are kept. From this week alone:

- the light-bending factor could have read 2 on the depth register and
  read 1 ([`E-GRV-0088`](test/experiment/gravity/depth-arena-prediction.ts))
- α was predicted flat in local units and read a slope of 2.10
  ([`E-FRC-0256`](test/experiment/gauge/local-alpha.ts))
- the ω mixer was predicted critical and read 1.382, not 1
  ([`E-SPN-0099`](test/experiment/spin/mixer-cascade.ts))
- the knots were expected to give an area law and gave a volume law
  ([`E-GRV-0083`](test/experiment/gravity/knot-area-law.ts))

So "vibe theory is unfalsifiable" is half right: the axiom is, the
physics under it is not, and the experiments test structure, never
feeling.

## The invariants

What the current rule holds fixed, each measured with a control that
could have failed. The structures that recur across other physics
theories built from different starting points are worked out in
[note/triangulating-invariants.md](note/triangulating-invariants.md),
with the per-theory maps in [note/link/](note/link/).

| invariant | what stays fixed | experiment |
| :--- | :--- | :--- |
| charge | counted in whole vibes, locally, on every beat, pair creation included | [`E-FRC-0243`](test/experiment/gauge/charge-count-every-beat.ts) |
| reversibility | run forward then backward, the start returns bit for bit | [`E-FND-0049`](test/experiment/foundations/record-preserving-paths.ts) |
| the symmetry | W(F4), all 1,152 elements, with CPT | [`E-RLT-0061`](test/experiment/relativity/isometric-knit.ts) |
| the discrete symmetries | P, C, T, CP and CPT exact on the locked rule, under all 48 husk parities | [`E-FRC-0248`](test/experiment/gauge/locked-parity-ledger.ts) |
| momentum | exact on the knit without the coin. The coin gives up exactly this, to make a mass | [`E-RLT-0084`](test/experiment/relativity/lone-bounce-collision.ts), [`E-SPN-0090`](test/experiment/spin/covariant-coin-theorem.ts) |
| the line law | the tone on every straight mesh line, 6,144 of 6,144, while no mixer acts | [`E-SPN-0098`](test/experiment/spin/line-law.ts) |
| the vacuum's cycle | a 12-beat cycle with pairs made equal to pairs unmade, 466,944 each | [`E-RLT-0105`](test/experiment/relativity/coined-store-vacuum.ts) |
| the arrow of time | the same cone both ways, so the arrow is the low-entropy slice plus the coarse map | [`E-FND-0147`](test/experiment/foundations/husk-arrow-records.ts) |
| the distinguishability metric | Fisher-Rao is the one distance no relabeling of the 24 directions can change | [`E-FND-0057`](test/experiment/foundations/chentsov-forced-distinguishability.ts) |
| the light cone | a fixed top speed, the same in every direction | [`E-RLT-0014`](test/experiment/relativity/light-cone.ts) |
| spacetime dimension | the cusp reads a spectral dimension near 3, so space is 3d plus time | [`E-GMT-0025`](test/experiment/geometry/why-3plus1.ts) |
| the growth ratio | each shell of the mesh larger than the last by a factor settling at 18.278 | [`E-GMT-0027`](test/experiment/geometry/mesh-unfolds-exactly.ts) |
| gravity's source | on the depth-step register (an added part), steps out minus steps in equals content at every dock, 0 off on 43,008 checks. There is no area law on the working vacuum ([`E-GRV-0083`](test/experiment/gravity/knot-area-law.ts)) | [`E-GRV-0090`](test/experiment/gravity/step-depth-static.ts) |

Rows dropped since the last version, because they are no longer true
of the current rule: the period-three vacuum clock and its clock-phase
interference (the charge rule's), the chaos ceiling on records (it
fails since a schedule fix), monopole absence (the light is now
compact), and CP violation in the clock knits (the locked rule keeps CP).

## The experiments

Everything is finite and deterministic, so every result reproduces
exactly. Real numbers appear only as measured outputs, never in the
base. Much of the code was written with AI assistance, which changes
nothing about trusting it: run it and check. Each question is one
experiment in `test/experiment/<category>/`, a single `experiment`
returning a structured verdict (status, metrics, control, claim), and
each grades itself by what it establishes, not by whether it passes:

| level  | meaning |
| :----- | :------ |
| **L3** | emergent and novel. One base rule produces the result as a measured consequence, with a control, ideally a quantitative prediction that could be wrong. The target. |
| **L2** | known physics. Reproduces a known construction on the substrate (a Dirac quantum walk, lattice gauge theory, a ballistic light cone). |
| **L1** | known math. Confirms an established mathematical fact (the 24-cell is the binary tetrahedral group, a 2π rotation gives −1). |
| **L0** | circular. The answer is put in by hand, so it proves nothing. Kept as a consistency note, never as evidence. |

The full rubric and the rules the runner enforces (an L3 claim must
carry a control) are in
[`note/experimental-methodology`](note/experimental-methodology.md).

[**`test/catalog.csv`**](test/catalog.csv) is the full index, one row
per experiment, generated from the registered experiments and sorted
strongest first. It holds **1,525 rows in 18 categories**:

| total | L3 emergent, novel | L2 known physics | L1 known math | L0 circular | backing a paper claim |
| ----: | -----------------: | ---------------: | ------------: | ----------: | --------------------: |
|  1525 |                 53 |             1149 |           309 |          14 |                   604 |

The largest categories are gauge (267), spin (181), selves (177),
quantum (172), foundations (157), gravity (142) and relativity (112). The
first full depth audit (2026-08-31) found 40 of 92 L3 experiments with
no substrate, rule or coin in their import graph, and regraded them
down. Every correction is recorded in the experiment it corrects.

The **[experiment map](note/experiment/readme.md)** is the human way
in: every arena one line per experiment, the coverage matrix, a
**[concepts cross-index](note/experiment/concepts.md)**, reading paths,
and a guide for adding your own. The quantum sector map is
[note/experiment/quantum-coverage.md](note/experiment/quantum-coverage.md).

## Development

Every experiment lives in `test/experiment/<category>/<name>.ts` as one
`experiment`. The suite runner (`test/run.ts`) imports them all through
`test/experiment/all.ts`, the shared library is in `code/`, and the
named batteries (conformance, paper) are in `test/suite/`. The build
fails only on a code crash or a conformance failure, never on a
scientific negative.

| command | does |
| :--- | :--- |
| `pnpm test` | typecheck, then every registered experiment plus the conformance battery (about half an hour) |
| `pnpm test:full` | the registry run plus the legacy `test/test.ts` battery |
| `pnpm rerun <code or id> [...]` | run single experiments by code (`E-GRV-0090`) or id, and print every number the verdict holds, the fast loop |
| `pnpm result <list, check, reproduce or audit>` | the results database: list it, check it against the registry, reproduce a result's experiments, or audit one into a capsule (writes only on `--commit`) |
| `pnpm call <file>` | run one script under tsx |
| `pnpm call test/catalog.ts` | regenerate [`test/catalog.csv`](test/catalog.csv) |
| `pnpm check:labels` | verify every experiment's `substrates` label against its import graph |
| `pnpm check:constants` | verify no typed constant reaches a verdict |
| `pnpm check:coverage` | check the quantum coverage map against the catalog |
| `pnpm check:perturbation` | the perturbation (robustness) checks |
| `pnpm lint` | eslint over `code/` and `test/` |
| `pnpm format` | the formatter |
| `pnpm make` | compile the library to `host/` |
| `pnpm host` | build and publish the package |
| `pnpm make:sm-scoreboard --commit` | regenerate the scoreboard above from the observation ledger (run from the parent workspace, reports without `--commit`) |

## What is inside

- **substrate**: regular `{p,q,...}` hyperbolic honeycombs through the
  Coxeter engine, including the $\lbrace3,4,3,4\rbrace$ dock graph with
  `O(log n)` addressing, plus hyperbolic random graphs, regular
  lattices, Minkowski and curved sprinklings, and classical sequential
  growth.
- **tone**: the ternary alphabet and the directional fill carried on
  each dock.
- **rule**: the current knit's pieces (`isometric-knit`,
  `bounce-pair-knit` for the bounce and pass contacts,
  `doublet-locked-knit`, `coined-locked-knit` for the coin,
  `occupation-veto-knit` for the vetoes and the no-veto store), the
  husk light (`trit-column`, `photon-shaped`), the gravity registers
  (`trit-radion`, `step-depth`, `depth-span-light`, `open-husk`), and
  the earlier rules kept as history and controls (`turningWeave`,
  `lineWeave` and `pairCollision` in `collision`), with streaming,
  growth, and the discrete C, P, T transforms.
- **measure**: dimension, distance, curvature, manifold-likeness,
  Lorentz isotropy, streaming BFS shells, navigation, CHSH, locality,
  Wilson loops, Aharonov-Bohm phase, the knot network, and the named
  full-period path key (`full-key-paths`).
- **operator**: graph Laplacian, Kahler-Dirac and overlap fermions, the
  gauge-covariant Dirac, the cellular-automaton Hamiltonian, and the
  gauge index.
- **algebra**: quaternions and the binary tetrahedral 24-cell, the `D4`
  and `F4` root systems, spinor and vector rotation, Clifford and
  exterior calculus, and the linear-algebra kernels (Lanczos lowest
  eigenvalues, the kernel-polynomial method, Bethe resolvents).
- **dynamics**: the Benincasa-Dowker action, uniform-measure and
  Wang-Landau sampling, parallel tempering, coarse graining, and the
  Wilson heat bath.
- **control**: the negative controls that make a positive result mean
  something (the substrate or rule where the answer must be no).
- **draw**, **render**, and **viz**: renderers and figures for the bulk,
  the cusp, gliders, gravity, and the nesting tower.
- **test/experiment**: one `experiment` per question, in 20 directories
  (addressing, associative, computation, cosmology, data-structure,
  fluids, foundations, gauge, general, geometry, gravity, holography,
  matter, method, quantum, relativity, renormalization, selves, spin,
  substrate-survey), run by the suite runner in `test/`.

## Documentation

All docs live in `note/`. The entry points:

- **[The predictions](note/prediction/readme.md)**: the falsifiable
  calls, the technologies the mechanisms suggest, the frontier claims
  people ask about assessed inside the model, and the next steps.
- **[The library guide](note/library/readme.md)** is how to use the
  `code/` library. It opens with a
  [features-at-a-glance](note/library/features.md) page and an
  [overview](note/library/overview.md) of how it fits together, then
  per-domain API guides and engine deep dives (the Coxeter tessellation
  engine, the reversible rule, the Kahler-Dirac fermion, the spinor
  coin, the spectral methods, the causal-set sampler, the unitary
  evolution, the lattice gauge engine, the coarse-graining and selves
  engine, and the associative memory engine).
- **[The math catalog](note/math.md)** lists every piece of math the
  library runs, what each module depends on, and which experiments use
  it.
- **[Architecture](note/architecture.md)** is where code and tests live,
  and how to add an experiment.
- **[Experimental methodology](note/experimental-methodology.md)** is
  the standard every experiment is held to: the depth rubric, the
  control requirement, determinism, and the negatives.
- **[Open problems](note/open/)** are the negatives written up in full.
  The hardest is
  **[spacelike Bell correlations](note/open/spacelike-bell-correlations.md)**:
  what Bell's theorem proves, why a deterministic theory can still match
  quantum mechanics (it drops measurement independence, not
  determinism), and the price vibe pays for that.
- **[Cross-tessellation experiments](note/cross-tessellation-experiments.md)**
  is how to write an experiment that runs against every regular
  hyperbolic tessellation at once.

## Reference data and verification

The experiments are only as good as the numbers they are compared to, so
those numbers live in one cited place:
[`note/data/reference/`](note/data/reference/readme.md).

- **What we gathered.** Every external value an experiment must match or
  use as a comparison: the fundamental constants, the full Standard
  Model particle table, the roughly 26 free Standard Model parameters,
  the CKM and PMNS mixing matrices, the cosmological parameters, and the
  geometric and group-theory targets the model derives (the ternary 3,
  the 24 of the dock, the octonion ceiling 8, F4 order 1152,
  sin^2(theta_W) = 3/8, the Tsirelson bound, the Born exponent, and so
  on).
- **What it contains.** Structured CSV plus a machine-readable
  `reference.json`, with a prose [readme](note/data/reference/readme.md)
  and a [bibliography](note/data/reference/sources.md). Every row
  carries a `source` tag and a `verified` date. The empirical values
  were fetched from and reconciled against their primary sources on
  2026-06-24 (CODATA 2022, PDG 2024, NuFIT 6.0, Planck 2018).
- **How we used it.** The
  [verification](note/data/reference/verification/readme.md) folder runs
  the comparison-bearing experiments live and diffs each measured number
  against the reference value, recording a status per experiment in
  [`cross-check.csv`](note/data/reference/verification/cross-check.csv).
  It confirmed the matches (the quantum bounds, the 3/8 angle, F4, the
  warp factor) and caught real problems (two mismapped experiments, one
  circular result whose number was hardcoded, and one result stronger
  than the table recorded).

## License

MIT. Open for science: use, modify, and build on it freely, with
attribution. See [LICENSE](LICENSE). The written results and figures are
shared under CC-BY-4.0 (attribution).

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
